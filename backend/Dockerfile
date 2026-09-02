FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY app ./app

EXPOSE 8000

# Shell form so ${PORT:-8000} expands: Render injects PORT at runtime,
# docker-compose/local runs fall back to 8000.
CMD uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}
