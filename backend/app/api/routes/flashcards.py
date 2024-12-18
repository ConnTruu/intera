import uuid
from typing import Any

from fastapi import APIRouter, HTTPException
from sqlmodel import func, select

from app.api.deps import CurrentUser, SessionDep
from app.models import Flashcard, FlashcardCreate, FlashcardPublic, FlashcardsPublic, FlashcardUpdate, Message

router = APIRouter(prefix="/flashcards", tags=["flashcards"])


@router.get("/", response_model=FlashcardsPublic)
def read_flashcards(
    session: SessionDep, current_user: CurrentUser, skip: int = 0, limit: int = 100
) -> Any:
    """
    Retrieve flashcards.
    """

    if current_user.is_superuser:
        count_statement = select(func.count()).select_from(Flashcard)
        count = session.exec(count_statement).one()
        statement = select(Flashcard).offset(skip).limit(limit)
        flashcards = session.exec(statement).all()
    else:
        count_statement = (
            select(func.count())
            .select_from(Flashcard)
            .where(Flashcard.owner_id == current_user.id)
        )
        count = session.exec(count_statement).one()
        statement = (
            select(Flashcard)
            .where(Flashcard.owner_id == current_user.id)
            .offset(skip)
            .limit(limit)
        )
        flashcards = session.exec(statement).all()

    return FlashcardsPublic(data=flashcards, count=count)


@router.get("/{id}", response_model=FlashcardPublic)
def read_flashcard(session: SessionDep, current_user: CurrentUser, id: uuid.UUID) -> Any:
    """
    Get flashcard by ID.
    """
    flashcard = session.get(Flashcard, id)
    if not flashcard:
        raise HTTPException(status_code=404, detail="Flashcard not found")
    if not current_user.is_superuser and (flashcard.owner_id != current_user.id):
        raise HTTPException(status_code=400, detail="Not enough permissions")
    return flashcard


@router.post("/", response_model=FlashcardPublic)
def create_flashcard(
    *, session: SessionDep, current_user: CurrentUser, flashcard_in: FlashcardCreate
) -> Any:
    """
    Create new flashcard.
    """
    flashcard = Flashcard.model_validate(flashcard_in, update={"owner_id": current_user.id})
    session.add(flashcard)
    session.commit()
    session.refresh(flashcard)
    return flashcard


@router.put("/{id}", response_model=FlashcardPublic)
def update_flashcard(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    id: uuid.UUID,
    flashcard_in: FlashcardUpdate,
) -> Any:
    """
    Update an flashcard.
    """
    flashcard = session.get(Flashcard, id)
    if not flashcard:
        raise HTTPException(status_code=404, detail="Flashcard not found")
    if not current_user.is_superuser and (flashcard.owner_id != current_user.id):
        raise HTTPException(status_code=400, detail="Not enough permissions")
    update_dict = flashcard_in.model_dump(exclude_unset=True)
    flashcard.sqlmodel_update(update_dict)
    session.add(flashcard)
    session.commit()
    session.refresh(flashcard)
    return flashcard


@router.delete("/{id}")
def delete_flashcard(
    session: SessionDep, current_user: CurrentUser, id: uuid.UUID
) -> Message:
    """
    Delete an flashcard.
    """
    flashcard = session.get(Flashcard, id)
    if not flashcard:
        raise HTTPException(status_code=404, detail="Flashcard not found")
    if not current_user.is_superuser and (flashcard.owner_id != current_user.id):
        raise HTTPException(status_code=400, detail="Not enough permissions")
    session.delete(flashcard)
    session.commit()
    return Message(message="Flashcard deleted successfully")
