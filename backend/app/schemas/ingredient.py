from .base import IngredientBase, IngredientCategory
from pydantic import BaseModel


class IngredientCreate(IngredientBase):
    pass


class IngredientUpdate(BaseModel):
    name: str | None = None
    category: IngredientCategory | None = None
    in_stock: bool | None = None


class IngredientResponse(IngredientBase):
    id: int
    in_stock: bool

    class Config:
        from_attributes = True


class IngredientToggleResponse(BaseModel):
    id: int
    in_stock: bool
    name: str
