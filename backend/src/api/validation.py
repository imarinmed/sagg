from fastapi import APIRouter

from ..validation.consistency import run_validation

router = APIRouter(prefix="/api/validation", tags=["validation"])


@router.get("")
async def validate_consistency():
    report = run_validation()
    return report.summary()
