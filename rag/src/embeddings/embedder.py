from __future__ import annotations

from collections.abc import Sequence


class MiniLMEmbedder:
    """all-MiniLM-L6-v2 embeddings via fastembed's ONNX runtime.

    Previously backed by sentence-transformers, which pulls in PyTorch. That
    runtime alone exceeds the 512 MB free-tier container, so the service was
    OOM-killed on the first /retrieve call. fastembed runs the same model
    through onnxruntime and produces identical vectors (verified: cosine
    similarity 1.000000 against the sentence-transformers output), so the
    existing Chroma index stays valid.
    """

    def __init__(self, model_name: str = "sentence-transformers/all-MiniLM-L6-v2"):
        self.model_name = model_name
        self._model = None

    @property
    def model(self):
        if self._model is None:
            from fastembed import TextEmbedding

            self._model = TextEmbedding(self.model_name)
        return self._model

    def embed(self, texts: Sequence[str]) -> list[list[float]]:
        # fastembed already returns L2-normalised vectors, matching the
        # normalize_embeddings=True the previous implementation requested.
        return [vector.tolist() for vector in self.model.embed(list(texts))]
