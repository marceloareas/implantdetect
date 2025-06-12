import os
import random
import shutil
from glob import glob
from pathlib import Path
from collections import defaultdict

# ========= CONFIGURAÇÃO =========
use_test_set = False  # Altere para True se quiser um conjunto de teste separado
# ================================

# Caminhos de entrada
image_paths = sorted(glob("./data/samples/images/*.jpg"))
label_paths = sorted(glob("./data/samples/labels/*.txt"))

# Função para extrair o nome base: IMGXXXX
def get_image_base_name(filename):
    """Extrai IMGXXXX de [hash]-IMGXXXX_aug_N"""
    stem = Path(filename).stem
    try:
        return stem.split('-')[1].split('_aug_')[0]  # IMG0012, etc.
    except IndexError:
        return None

# Agrupar por nome base (ex: IMG0012)
groups = defaultdict(list)

# Criar dicionários para rápido acesso
image_dict = {Path(p).stem: p for p in image_paths}
label_dict = {Path(p).stem: p for p in label_paths}

# Criar grupos (todos os pares imagem + label com mesmo IMGXXXX)
for stem in image_dict:
    if stem in label_dict:
        key = get_image_base_name(stem)
        if key:
            groups[key].append((image_dict[stem], label_dict[stem]))

# Eliminar grupos incompletos (menos de 5 variantes)
complete_groups = [group for group in groups.values() if len(group) == 5]

# Embaralhar os grupos
random.shuffle(complete_groups)

# Divisão dos dados
total = len(complete_groups)
train_split = int(0.8 * total)

if use_test_set:
    val_split = int(0.85 * total)
    train_groups = complete_groups[:train_split]
    val_groups = complete_groups[train_split:val_split]
    test_groups = complete_groups[val_split:]
else:
    train_groups = complete_groups[:train_split]
    val_groups = complete_groups[train_split:]
    test_groups = []  # vazio se não estiver em uso

# Função para salvar os arquivos
def save_split(groups, name):
    for group in groups:
        for img_path, lbl_path in group:
            img_dest = f"./data/{name}/images/"
            lbl_dest = f"./data/{name}/labels/"
            os.makedirs(img_dest, exist_ok=True)
            os.makedirs(lbl_dest, exist_ok=True)
            shutil.copy(img_path, os.path.join(img_dest, Path(img_path).name))
            shutil.copy(lbl_path, os.path.join(lbl_dest, Path(lbl_path).name))

# Limpar e salvar
save_split(train_groups, "train")
save_split(val_groups, "val")
if use_test_set:
    save_split(test_groups, "test")

print(f"✅ Divisão concluída. Grupos de 5 variantes foram mantidos juntos.")
print(f"  → Treino: {len(train_groups)} grupos")
print(f"  → Validação: {len(val_groups)} grupos")
print(f"  → Teste: {len(test_groups)} grupos")
