from ultralytics import YOLO
from glob import glob

files = glob("./data/val/images/*.jpg")
model = YOLO('./models/train3/weights/best.pt')

print(files)
for file in files:
    print(file)
    results = model.predict(source=file,
                            conf=0.1,
                            )
    
    for result in results:
        result.show()
    