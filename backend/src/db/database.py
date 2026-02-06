"""Database configuration and session management using SQLModel."""

from collections.abc import Generator
from pathlib import Path

from sqlmodel import Session, SQLModel, create_engine

# Database path
DATA_DIR = Path(__file__).parent.parent.parent.parent / "data"
DATABASE_PATH = DATA_DIR / "blod.db"

# Ensure data directory exists
DATA_DIR.mkdir(parents=True, exist_ok=True)

# Create SQLite engine with SQLModel
DATABASE_URL = f"sqlite:///{DATABASE_PATH}"
engine = create_engine(
    DATABASE_URL,
    echo=False,  # Set to True for SQL debugging
    connect_args={"check_same_thread": False},  # Needed for SQLite with async
)


def init_db() -> None:
    """Initialize database tables."""
    # Import all models to ensure they're registered with SQLModel
    from . import db_models  # noqa: F401

    SQLModel.metadata.create_all(engine)


def get_session() -> Generator[Session, None, None]:
    """Dependency for getting database session."""
    with Session(engine) as session:
        yield session
