from typing import Optional
from pydantic import BaseModel


class RecipeIngredientItem(BaseModel):
    ingredient_id: int
    amount: str
    unit: Optional[str] = None


class RecipeIngredientResponse(BaseModel):
    ingredient_id: int
    ingredient_name: str
    amount: str
    unit: Optional[str] = None


class RecipeBase(BaseModel):
    name: str
    instructions: str
    glassware: Optional[str] = None
    ingredients: list[RecipeIngredientItem]


class RecipeCreate(RecipeBase):
    pass


class RecipeUpdate(BaseModel):
    name: str | None = None
    instructions: str | None = None
    glassware: str | None = None
    ingredients: list[RecipeIngredientItem] | None = None


class RecipeResponse(BaseModel):
    id: int
    name: str
    instructions: str
    glassware: Optional[str]
    ingredients: list[RecipeIngredientResponse]
    missing_garnish: Optional[str] = None
    is_favorite: bool = False

    class Config:
        from_attributes = True


class RecipeListResponse(BaseModel):
    id: int
    name: str
    glassware: Optional[str]
    ingredients: list[RecipeIngredientResponse]
    can_make: bool
    missing_garnish: Optional[str] = None
    is_favorite: bool = False

    class Config:
        from_attributes = True
