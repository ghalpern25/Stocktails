import enum
from pydantic import BaseModel


class IngredientCategory(str, enum.Enum):
    BASE_SPIRIT = "BASE_SPIRIT"
    LIQUEUR = "LIQUEUR"
    MIXER = "MIXER"
    SYRUP = "SYRUP"
    BITTERS = "BITTERS"
    GARNISH = "GARNISH"
    OTHER = "OTHER"


class IngredientBase(BaseModel):
    name: str
    category: IngredientCategory
