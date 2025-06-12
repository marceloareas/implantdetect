import cv2
import albumentations as A
from glob import glob
import os
import random
import itertools

# Lista de transformações básicas
BASE_TRANSFORMS = [
    A.HorizontalFlip(p=1.0),
    A.VerticalFlip(p=1.0),
    A.Rotate(limit=25, p=1.0),
]

def get_unique_transforms():
    """Gera todas as combinações únicas e não vazias de transformações."""
    all_combinations = []
    for r in range(1, len(BASE_TRANSFORMS) + 1):
        for combo in itertools.combinations(BASE_TRANSFORMS, r):
            all_combinations.append(A.Compose(list(combo)))
    return all_combinations

def augment_image(input_path, output_dir='augmented', num_variations=5):
    os.makedirs(output_dir, exist_ok=True)
    image = cv2.imread(input_path)
    if image is None:
        print("Erro ao carregar imagem:", input_path)
        return

    image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
    unique_transforms = get_unique_transforms()

    # Embaralha e seleciona transformações únicas
    random.shuffle(unique_transforms)
    selected_transforms = unique_transforms[:num_variations]

    for i, transform in enumerate(selected_transforms):
        augmented = transform(image=image)
        augmented_image = augmented['image']
        filename = os.path.basename(input_path)
        name, ext = os.path.splitext(filename)
        output_path = os.path.join(output_dir, f"{name}_aug_{i+1}{ext}")
        cv2.imwrite(output_path, cv2.cvtColor(augmented_image, cv2.COLOR_RGB2BGR))
        print("Imagem salva em:", output_path)

for img in glob("./data/selected/*.jpg"):
    augment_image(img, output_dir="./data/processed")
