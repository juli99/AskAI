from abc import ABC, abstractmethod
from typing import Literal, TypedDict

import google.generativeai as genai

from app.config import settings


class ChatMessage(TypedDict):
    role: Literal["user", "assistant"]
    content: str


class AIProvider(ABC):
    @abstractmethod
    async def generate(self, messages: list[ChatMessage]) -> str: ...


class GeminiProvider(AIProvider):
    def __init__(self, api_key: str, model_name: str) -> None:
        genai.configure(api_key=api_key)
        self._model = genai.GenerativeModel(model_name)

    async def generate(self, messages: list[ChatMessage]) -> str:
        history = [
            {"role": "user" if m["role"] == "user" else "model", "parts": [m["content"]]}
            for m in messages[:-1]
        ]
        last = messages[-1]["content"]
        chat = self._model.start_chat(history=history)
        response = await chat.send_message_async(last)
        return response.text or ""


_provider: AIProvider | None = None


def get_ai_provider() -> AIProvider:
    global _provider
    if _provider is None:
        _provider = GeminiProvider(settings.gemini_api_key, settings.gemini_model)
    return _provider
