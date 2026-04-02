import enum

from sqlalchemy import Column, Integer, String, Boolean, Enum, ForeignKey
from sqlalchemy.orm import relationship

from ..database import Base


class IngredientCategory(str, enum.Enum):
    BASE_SPIRIT = "BASE_SPIRIT"
    LIQUEUR = "LIQUEUR"
    MIXER = "MIXER"
    SYRUP = "SYRUP"
    BITTERS = "BITTERS"
    GARNISH = "GARNISH"
    OTHER = "OTHER"


class Ingredient(Base):
    __tablename__ = "ingredients"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, index=True)
    category = Column(Enum(IngredientCategory), nullable=False)
    in_stock = Column(Boolean, default=True, nullable=False)

    recipe_ingredients = relationship("RecipeIngredient", back_populates="ingredient")
