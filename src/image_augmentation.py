import cv2
import albumentations as A
from glob import glob
import os

def augment_image(input_path, output_dir='augmented', num_variations=5):
    # Cria diretório de saída
    os.makedirs(output_dir, exist_ok=True)

    # Carrega a imagem
    image = cv2.imread(input_path)
    if image is None:
        print("Erro ao carregar imagem:", input_path)
        return

    # Converte de BGR (OpenCV) para RGB
    image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)

    # Define pipeline de aumentações
    transform = A.Compose([
        A.HorizontalFlip(p=0.7),                         # flip horizontal
        A.Rotate(limit=25, p=0.7),                       # rotação
    ])

    # Aplica e salva variações
    for i in range(num_variations):
        augmented = transform(image=image)
        augmented_image = augmented['image']
        filename = os.path.basename(input_path)
        name, ext = os.path.splitext(filename)
        output_path = os.path.join(output_dir, f"{name}_aug_{i+1}{ext}")
        cv2.imwrite(output_path, cv2.cvtColor(augmented_image, cv2.COLOR_RGB2BGR))
        print("Imagem salva em:", output_path)


for img in glob("./data/samples/images/*.jpg"):
    augment_image(img, output_dir="./data/processed")


glob("./data/samples/images/*.jpg")