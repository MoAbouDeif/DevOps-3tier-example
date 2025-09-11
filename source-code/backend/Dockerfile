FROM python:3.13.7-slim

ENV DEBUG=True

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

HEALTHCHECK --interval=30s --timeout=5s CMD wget -q --spider http://localhost:5000 || exit 1

ENTRYPOINT ["gunicorn"]
CMD ["--bind=0.0.0.0:5000", "app:app"]
