from ultralytics import YOLO
from glob import glob

files = glob("./data/test/*.jpg")
model = YOLO('./runs/detect/train45/weights/best.pt') 

for file in files:
    results = model.predict(source=file,
                            save=True,
                            conf=0.1,
                            )
    
    for result in results:
        boxes = result.boxes
        for box in boxes:
            cls = box.cls.item()
            conf = box.conf.item()
            print(f"Classe: {cls}, Confiança: {conf:.4f}")
    