from sqlmodel import Session

from app import crud
from app.models import Flashcard, FlashcardCreate
from app.tests.utils.user import create_random_user
from app.tests.utils.utils import random_lower_string


def create_random_flashcard(db: Session) -> Flashcard:
    user = create_random_user(db)
    owner_id = user.id
    assert owner_id is not None
    question = random_lower_string()
    answer = random_lower_string()
    flashcard_in = FlashcardCreate(question=question, answer=answer)
    return crud.create_flashcard(session=db, flashcard_in=flashcard_in, owner_id=owner_id)

