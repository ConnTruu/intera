import uuid

from fastapi.testclient import TestClient
from sqlmodel import Session

from app.core.config import settings
from app.tests.utils.flashcard import create_random_flashcard


def test_create_flashcard(
    client: TestClient, superuser_token_headers: dict[str, str]
) -> None:
    data = {"question": "Who's the man", "answer": "me"}
    response = client.post(
        f"{settings.API_V1_STR}/flashcards/",
        headers=superuser_token_headers,
        json=data,
    )
    assert response.status_code == 200
    content = response.json()
    assert content["question"] == data["question"]
    assert content["answer"] == data["answer"]
    assert "id" in content
    assert "owner_id" in content


def test_read_flashcard(
    client: TestClient, superuser_token_headers: dict[str, str], db: Session
) -> None:
    flashcard = create_random_flashcard(db)
    response = client.get(
        f"{settings.API_V1_STR}/flashcards/{flashcard.id}",
        headers=superuser_token_headers,
    )
    assert response.status_code == 200
    content = response.json()
    assert content["question"] == flashcard.question
    assert content["answer"] == flashcard.answer
    assert content["id"] == str(flashcard.id)
    assert content["owner_id"] == str(flashcard.owner_id)


def test_read_flashcard_not_found(
    client: TestClient, superuser_token_headers: dict[str, str]
) -> None:
    response = client.get(
        f"{settings.API_V1_STR}/flashcards/{uuid.uuid4()}",
        headers=superuser_token_headers,
    )
    assert response.status_code == 404
    content = response.json()
    assert content["detail"] == "Flashcard not found"


def test_read_flashcard_not_enough_permissions(
    client: TestClient, normal_user_token_headers: dict[str, str], db: Session
) -> None:
    flashcard = create_random_flashcard(db)
    response = client.get(
        f"{settings.API_V1_STR}/flashcards/{flashcard.id}",
        headers=normal_user_token_headers,
    )
    assert response.status_code == 400
    content = response.json()
    assert content["detail"] == "Not enough permissions"


def test_read_flashcards(
    client: TestClient, superuser_token_headers: dict[str, str], db: Session
) -> None:
    create_random_flashcard(db)
    create_random_flashcard(db)
    response = client.get(
        f"{settings.API_V1_STR}/flashcards/",
        headers=superuser_token_headers,
    )
    assert response.status_code == 200
    content = response.json()
    assert len(content["data"]) >= 2


def test_update_flashcard(
    client: TestClient, superuser_token_headers: dict[str, str], db: Session
) -> None:
    flashcard = create_random_flashcard(db)
    data = {"title": "Updated title", "description": "Updated description"}
    response = client.put(
        f"{settings.API_V1_STR}/flashcards/{flashcard.id}",
        headers=superuser_token_headers,
        json=data,
    )
    assert response.status_code == 200
    content = response.json()
    assert content["title"] == data["title"]
    assert content["description"] == data["description"]
    assert content["id"] == str(flashcard.id)
    assert content["owner_id"] == str(flashcard.owner_id)


def test_update_flashcard_not_found(
    client: TestClient, superuser_token_headers: dict[str, str]
) -> None:
    data = {"title": "Updated title", "description": "Updated description"}
    response = client.put(
        f"{settings.API_V1_STR}/flashcards/{uuid.uuid4()}",
        headers=superuser_token_headers,
        json=data,
    )
    assert response.status_code == 404
    content = response.json()
    assert content["detail"] == "Flashcard not found"


def test_update_flashcard_not_enough_permissions(
    client: TestClient, normal_user_token_headers: dict[str, str], db: Session
) -> None:
    flashcard = create_random_flashcard(db)
    data = {"title": "Updated title", "description": "Updated description"}
    response = client.put(
        f"{settings.API_V1_STR}/flashcards/{flashcard.id}",
        headers=normal_user_token_headers,
        json=data,
    )
    assert response.status_code == 400
    content = response.json()
    assert content["detail"] == "Not enough permissions"


def test_delete_flashcard(
    client: TestClient, superuser_token_headers: dict[str, str], db: Session
) -> None:
    flashcard = create_random_flashcard(db)
    response = client.delete(
        f"{settings.API_V1_STR}/flashcards/{flashcard.id}",
        headers=superuser_token_headers,
    )
    assert response.status_code == 200
    content = response.json()
    assert content["message"] == "Flashcard deleted successfully"


def test_delete_flashcard_not_found(
    client: TestClient, superuser_token_headers: dict[str, str]
) -> None:
    response = client.delete(
        f"{settings.API_V1_STR}/flashcards/{uuid.uuid4()}",
        headers=superuser_token_headers,
    )
    assert response.status_code == 404
    content = response.json()
    assert content["detail"] == "Flashcard not found"


def test_delete_flashcard_not_enough_permissions(
    client: TestClient, normal_user_token_headers: dict[str, str], db: Session
) -> None:
    flashcard = create_random_flashcard(db)
    response = client.delete(
        f"{settings.API_V1_STR}/flashcards/{flashcard.id}",
        headers=normal_user_token_headers,
    )
    assert response.status_code == 400
    content = response.json()
    assert content["detail"] == "Not enough permissions"