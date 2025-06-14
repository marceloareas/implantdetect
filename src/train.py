from ultralytics import YOLO
from ultralytics import SETTINGS

if __name__ == '__main__':
    model = YOLO('yolo11m-obb.pt')

    model.train(
        data='./data/metadata/data.yaml',
        epochs=50,
        imgsz=640,
        device=0,
        project='./models', 
    )