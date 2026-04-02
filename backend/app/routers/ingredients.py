from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from ..models.ingredient import Ingredient, IngredientCategory
from ..schemas.ingredient import (
    IngredientCreate,
    IngredientUpdate,
    IngredientResponse,
    IngredientToggleResponse,
)
from ..schemas.base import IngredientCategory as IngredientCategoryEnum

router = APIRouter(prefix="/api/ingredients", tags=["ingredients"])


@router.get("", response_model=list[IngredientResponse])
def get_ingredients(
    category: Optional[IngredientCategoryEnum] = None,
    in_stock: Optional[bool] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Ingredient)
    
    if category is not None:
        query = query.filter(Ingredient.category == category)
    if in_stock is not None:
        query = query.filter(Ingredient.in_stock == in_stock)
    
    return query.order_by(Ingredient.name).all()


@router.post("", response_model=IngredientResponse, status_code=201)
def create_ingredient(ingredient: IngredientCreate, db: Session = Depends(get_db)):
    existing = db.query(Ingredient).filter(Ingredient.name.ilike(ingredient.name)).first()
    if existing:
        raise HTTPException(status_code=400, detail="Ingredient with this name already exists")
    
    db_ingredient = Ingredient(
        name=ingredient.name,
        category=ingredient.category,
        in_stock=True,
    )
    db.add(db_ingredient)
    db.commit()
    db.refresh(db_ingredient)
    return db_ingredient


@router.get("/{ingredient_id}", response_model=IngredientResponse)
def get_ingredient(ingredient_id: int, db: Session = Depends(get_db)):
    ingredient = db.query(Ingredient).filter(Ingredient.id == ingredient_id).first()
    if not ingredient:
        raise HTTPException(status_code=404, detail="Ingredient not found")
    return ingredient


@router.put("/{ingredient_id}", response_model=IngredientResponse)
def update_ingredient(
    ingredient_id: int,
    ingredient_update: IngredientUpdate,
    db: Session = Depends(get_db)
):
    ingredient = db.query(Ingredient).filter(Ingredient.id == ingredient_id).first()
    if not ingredient:
        raise HTTPException(status_code=404, detail="Ingredient not found")
    
    update_data = ingredient_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(ingredient, key, value)
    
    db.commit()
    db.refresh(ingredient)
    return ingredient


@router.patch("/{ingredient_id}/toggle-stock", response_model=IngredientToggleResponse)
def toggle_stock(ingredient_id: int, db: Session = Depends(get_db)):
    ingredient = db.query(Ingredient).filter(Ingredient.id == ingredient_id).first()
    if not ingredient:
        raise HTTPException(status_code=404, detail="Ingredient not found")
    
    ingredient.in_stock = not ingredient.in_stock
    db.commit()
    db.refresh(ingredient)
    return ingredient


@router.delete("/{ingredient_id}", status_code=204)
def delete_ingredient(ingredient_id: int, db: Session = Depends(get_db)):
    ingredient = db.query(Ingredient).filter(Ingredient.id == ingredient_id).first()
    if not ingredient:
        raise HTTPException(status_code=404, detail="Ingredient not found")
    
    db.delete(ingredient)
    db.commit()
    return None
