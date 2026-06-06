FROM pytorch/pytorch:2.11.0-cuda13.0-cudnn9-runtime

RUN apt-get update && apt-get install -y --no-install-recommends \
    libglib2.0-0 \
    libgl1 && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV YOLO_CONFIG_DIR=/app/.ultralytics
ENV MPLCONFIGDIR=/app/.matplotlib

WORKDIR /app

COPY implantdetect-shared/ /app/shared/
RUN pip install --upgrade pip --break-system-packages && pip install --no-cache-dir --break-system-packages /app/shared

COPY implantdetect-prediction/requirements.txt .
RUN pip install --no-cache-dir --break-system-packages -r requirements.txt

COPY implantdetect-prediction/ /app/

RUN useradd -u 5678 --no-create-home --shell /bin/sh appuser && \
    chown -R appuser /app && \
    mkdir -p /app/uploads /app/logs /app/.ultralytics /app/.matplotlib && \
    chown -R appuser:appuser /app/uploads /app/logs /app/.ultralytics /app/.matplotlib

USER appuser

CMD ["python", "main.py"]
