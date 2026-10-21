import time
import threading
from typing import Any, Optional

class SimpleCache:
    def __init__(self):
        self._cache = {}
        self._lock = threading.Lock()

    def get(self, key: str) -> Optional[Any]:
        with self._lock:
            if key in self._cache:
                entry = self._cache[key]
                if time.time() < entry["expires_at"]:
                    return entry["data"]
                del self._cache[key]
        return None

    def set(self, key: str, data: Any, ttl: int = 60):
        with self._lock:
            self._cache[key] = {
                "data": data,
                "expires_at": time.time() + ttl
            }

    def invalidate(self, prefix: str):
        with self._lock:
            keys_to_delete = [k for k in self._cache if k.startswith(prefix)]
            for k in keys_to_delete:
                del self._cache[k]

    def clear(self):
        with self._lock:
            self._cache.clear()

cache = SimpleCache()

