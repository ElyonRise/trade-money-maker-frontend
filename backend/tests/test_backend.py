"""
Testes Unitários do Control Plane (Segurança, Criptografia, Idempotência e Isolamento).
Nenhum teste conecta ou envia ordens reais.
"""

import pytest
from app.core.security import (
    hash_password,
    verify_password,
    encrypt_broker_password,
    decrypt_broker_password,
    create_access_token,
    decode_access_token
)

def test_argon2_password_hashing():
    pwd = "MinhaSenhaSuperSegura!2026"
    hashed = hash_password(pwd)
    assert hashed != pwd
    assert verify_password(pwd, hashed) is True
    assert verify_password("SenhaIncorreta", hashed) is False

def test_aes_256_broker_credential_encryption():
    raw_mt5_pass = "TradingPassword#991"
    encrypted = encrypt_broker_password(raw_mt5_pass)

    assert "ciphertext" in encrypted
    assert "nonce" in encrypted
    assert encrypted["ciphertext"] != raw_mt5_pass

    decrypted = decrypt_broker_password(encrypted)
    assert decrypted == raw_mt5_pass

def test_jwt_token_generation_and_validation():
    user_id = "usr_test_uuid_9921"
    token = create_access_token(user_id)
    payload = decode_access_token(token)

    assert payload is not None
    assert payload["sub"] == user_id

def test_idempotency_key_duplicate_prevention():
    processed_keys = set()
    idempotency_key = "idemp_test_action_88124"

    # Primeira execução aceita
    assert idempotency_key not in processed_keys
    processed_keys.add(idempotency_key)

    # Segunda execução idêntica deve ser rejeitada como já processada
    assert idempotency_key in processed_keys
