from fastapi import APIRouter
from ..services.macro import get_macro_context

router = APIRouter(prefix="/api/macro", tags=["Macro"])

@router.get("")
def get_macro():
    """Returns macroeconomic context including US Fed Rate, Malaysia OPR, Treasury/MGS yields, and FX."""
    return get_macro_context()
