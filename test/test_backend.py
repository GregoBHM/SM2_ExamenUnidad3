import pytest
from pydantic import ValidationError

from schemas.user import UserResponse, UserUpdate, TokenPayload


def test_token_payload_valido():
    payload = TokenPayload(id_token="token_de_prueba_123")
    assert payload.id_token == "token_de_prueba_123"


def test_user_update_campos_opcionales():
    update = UserUpdate(display_name="Gregory Huanca")
    assert update.display_name == "Gregory Huanca"
    assert update.career is None


def test_user_response_valores_por_defecto():
    user = UserResponse(
        id=1,
        firebase_uid="uid_test",
        email="gregory@virtual.upt.pe",
        display_name="Gregory Huanca"
    )
    assert user.role == "student"
    assert user.xp_points == 0
    assert user.level == "Novato"
