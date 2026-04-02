import json
from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, Text
from sqlalchemy.orm import relationship

from ..database import Base
from .ingredient import Ingredient


class Recipe(Base):
    __tablename__ = "recipes"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, index=True)
    instructions = Column(Text, nullable=False)
    glassware = Column(String, nullable=True)
    is_favorite = Column(Boolean, default=False, nullable=False)
    ingredients = relationship("RecipeIngredient", back_populates="recipe", cascade="all, delete-orphan")

    @property
    def ingredients_list(self):
        return [
            {
                "ingredient_id": ri.ingredient_id,
                "ingredient_name": ri.ingredient.name if ri.ingredient else None,
                "amount": ri.amount,
                "unit": ri.unit,
            }
            for ri in self.ingredients
        ]


class RecipeIngredient(Base):
    __tablename__ = "recipe_ingredients"

    id = Column(Integer, primary_key=True, index=True)
    recipe_id = Column(Integer, ForeignKey("recipes.id"), nullable=False)
    ingredient_id = Column(Integer, ForeignKey("ingredients.id"), nullable=False)
    amount = Column(String, nullable=False)
    unit = Column(String, nullable=True)

    recipe = relationship("Recipe", back_populates="ingredients")
    ingredient = relationship("Ingredient", back_populates="recipe_ingredients")
