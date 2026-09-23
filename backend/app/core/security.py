import os
import base64
from datetime import datetime, timedelta
from typing import Any, Union, Optional
from argon2 import PasswordHasher
from argon2.exceptions import VerifyMismatchError
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from jose import jwt, JWTError

# Production-grade Argon2id hasher
ph = PasswordHasher(time_cost=3, memory_cost=65536, parallelism=4, hash_len=32)

# Secret encryption key from environment (32 bytes for AES-256)
MASTER_KEY_HEX = os.getenv("TMM_MASTER_CRYPTO_KEY", "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef")
CRYPTO_KEY = bytes.fromhex(MASTER_KEY_HEX)
JWT_SECRET = os.getenv("JWT_SECRET", "super_secret_jwt_key_trade_money_maker_2026")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

def hash_password(password: str) -> str:
    """Hash password using Argon2id."""
    return ph.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify password against Argon2id hash."""
    try:
        return ph.verify(hashed_password, plain_password)
    except VerifyMismatchError:
        return False

def encrypt_broker_password(raw_password: str) -> dict:
    """Encrypt MT5 trading password using AES-256-GCM with unique nonce."""
    aesgcm = AESGCM(CRYPTO_KEY)
    nonce = os.urandom(12)  # 96-bit nonce
    ciphertext = aesgcm.encrypt(nonce, raw_password.encode("utf-8"), None)
    return {
        "ciphertext": base64.b64encode(ciphertext).decode("utf-8"),
        "nonce": base64.b64encode(nonce).decode("utf-8"),
        "key_version": 1
    }

def decrypt_broker_password(encrypted_data: dict) -> str:
    """Decrypt MT5 password in volatile memory only. Never persist or log."""
    aesgcm = AESGCM(CRYPTO_KEY)
    ciphertext = base64.b64decode(encrypted_data["ciphertext"])
    nonce = base64.b64decode(encrypted_data["nonce"])
    decrypted_bytes = aesgcm.decrypt(nonce, ciphertext, None)
    return decrypted_bytes.decode("utf-8")

def create_access_token(subject: Union[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode = {"exp": expire, "sub": str(subject)}
    encoded_jwt = jwt.encode(to_encode, JWT_SECRET, algorithm=ALGORITHM)
    return encoded_jwt

def decode_access_token(token: str) -> Optional[dict]:
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        return None
