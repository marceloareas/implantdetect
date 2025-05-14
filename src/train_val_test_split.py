import os
import random
import shutil
from glob import glob
from pathlib import Path

# Caminhos de entrada
image_paths = sorted(glob("./data/samples/images/*.jpg"))
label_paths = sorted(glob("./data/samples/labels/*.txt"))

# Verificação de pareamento entre imagens e rótulos
basename = lambda path: Path(path).stem
paired = [(img, lbl) for img in image_paths for lbl in label_paths if basename(img) == basename(lbl)]

# Embaralhar os dados
random.shuffle(paired)

# Divisão
total = len(paired)
train_split = int(0.7 * total)
val_split = int(0.85 * total)

train_set = paired[:train_split]
val_set = paired[train_split:val_split]
test_set = paired[val_split:]

# Função para copiar arquivos
def save_split(split, name):
    for img_path, lbl_path in split:
        img_dest = f"./data/{name}/images/"
        lbl_dest = f"./data/{name}/labels/"
        os.makedirs(img_dest, exist_ok=True)
        os.makedirs(lbl_dest, exist_ok=True)
        shutil.copy(img_path, img_dest + Path(img_path).name)
        shutil.copy(lbl_path, lbl_dest + Path(lbl_path).name)

# Salvar arquivos nos diretórios
save_split(train_set, "train")
save_split(val_set, "val")
save_split(test_set, "test")

print("Divisão concluída com sucesso.")
