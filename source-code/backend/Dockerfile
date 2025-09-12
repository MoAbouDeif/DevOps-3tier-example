FROM python:3.13.7-slim

ARG DEBUG=True
ENV DEBUG=$DEBUG

WORKDIR /app

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
       gcc \
       libpq-dev \
       build-essential \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .

RUN pip install --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

COPY . .

RUN useradd --create-home backend
USER backend

EXPOSE 5000

ENTRYPOINT ["gunicorn"]
CMD ["--bind=0.0.0.0:5000", "app:app"]
