FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Build the Chroma index at image-build time so the container starts ready
# to serve /retrieve — data/processed/chroma/ is gitignored and would
# otherwise be empty on a fresh deploy with an ephemeral disk.
RUN python main.py ingest

EXPOSE 8100

# Shell form so ${PORT:-8100} expands: Render injects PORT at runtime,
# docker-compose/local runs fall back to 8100.
CMD uvicorn main:app --host 0.0.0.0 --port ${PORT:-8100}
