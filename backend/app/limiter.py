from slowapi import Limiter
from slowapi.util import get_remote_address

# Shared slowapi limiter instance using remote address (IP)
limiter = Limiter(key_func=get_remote_address)
