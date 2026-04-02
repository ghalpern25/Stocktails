from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from ..database import get_db
from ..models.recipe import Recipe, RecipeIngredient
from ..models.ingredient import Ingredient, IngredientCategory
from ..schemas.recipe import (
    RecipeCreate,
    RecipeUpdate,
    RecipeResponse,
    RecipeListResponse,
    RecipeIngredientResponse,
)
from ..schemas.base import IngredientCategory as IngredientCategoryEnum

router = APIRouter(prefix="/api/recipes", tags=["recipes"])

GARNISH_CATEGORY = IngredientCategory.GARNISH


def get_recipe_response(recipe: Recipe, can_make: bool, missing_garnish: Optional[str]) -> RecipeResponse:
    ingredients = []
    for ri in recipe.ingredients:
        ingredients.append(
            RecipeIngredientResponse(
                ingredient_id=ri.ingredient_id,
                ingredient_name=ri.ingredient.name if ri.ingredient else "Unknown",
                amount=ri.amount,
                unit=ri.unit,
            )
        )
    
    return RecipeResponse(
        id=recipe.id,
        name=recipe.name,
        instructions=recipe.instructions,
        glassware=recipe.glassware,
        ingredients=ingredients,
        missing_garnish=missing_garnish,
        is_favorite=recipe.is_favorite,
    )


def recipe_to_list_response(recipe: Recipe, can_make: bool, missing_garnish: Optional[str]) -> RecipeListResponse:
    ingredients = []
    for ri in recipe.ingredients:
        ingredients.append(
            RecipeIngredientResponse(
                ingredient_id=ri.ingredient_id,
                ingredient_name=ri.ingredient.name if ri.ingredient else "Unknown",
                amount=ri.amount,
                unit=ri.unit,
            )
        )
    return RecipeListResponse(
        id=recipe.id,
        name=recipe.name,
        glassware=recipe.glassware,
        ingredients=ingredients,
        can_make=can_make,
        missing_garnish=missing_garnish,
        is_favorite=recipe.is_favorite,
    )


def calculate_can_make(recipe: Recipe, in_stock_ingredient_ids: set[int]) -> tuple[bool, Optional[str]]:
    missing_garnish: Optional[str] = None
    
    for ri in recipe.ingredients:
        ingredient = ri.ingredient
        if not ingredient:
            continue
        
        if ingredient.category == GARNISH_CATEGORY:
            if ingredient.id not in in_stock_ingredient_ids:
                missing_garnish = ingredient.name
        else:
            if ingredient.id not in in_stock_ingredient_ids:
                return False, None
    
    return True, missing_garnish


@router.get("", response_model=list[RecipeListResponse])
def get_recipes(
    can_make_only: bool = False,
    favorites_only: bool = False,
    base_spirit: Optional[IngredientCategoryEnum] = None,
    db: Session = Depends(get_db)
):
    recipes = db.query(Recipe).all()
    
    in_stock_ingredient_ids = {
        i.id for i in db.query(Ingredient).filter(Ingredient.in_stock == True).all()
    }
    
    result = []
    for recipe in recipes:
        if favorites_only and not recipe.is_favorite:
            continue
        
        can_make, missing_garnish = calculate_can_make(recipe, in_stock_ingredient_ids)
        
        if can_make_only and not can_make:
            continue
        
        if base_spirit:
            has_base_spirit = any(
                ri.ingredient.category == base_spirit
                for ri in recipe.ingredients
                if ri.ingredient
            )
            if not has_base_spirit:
                continue
        
        result.append(recipe_to_list_response(recipe, can_make, missing_garnish))
    
    return result


@router.get("/can-make", response_model=list[RecipeListResponse])
def get_can_make_recipes(db: Session = Depends(get_db)):
    in_stock_ingredient_ids = {
        i.id for i in db.query(Ingredient).filter(Ingredient.in_stock == True).all()
    }
    
    recipes = db.query(Recipe).all()
    result = []
    
    for recipe in recipes:
        can_make, missing_garnish = calculate_can_make(recipe, in_stock_ingredient_ids)
        result.append(recipe_to_list_response(recipe, can_make, missing_garnish))
    
    return result


@router.patch("/{recipe_id}/toggle-favorite", response_model=RecipeResponse)
def toggle_favorite(recipe_id: int, db: Session = Depends(get_db)):
    recipe = db.query(Recipe).filter(Recipe.id == recipe_id).first()
    if not recipe:
        raise HTTPException(status_code=404, detail="Recipe not found")
    
    recipe.is_favorite = not recipe.is_favorite
    db.commit()
    db.refresh(recipe)
    
    in_stock_ingredient_ids = {
        i.id for i in db.query(Ingredient).filter(Ingredient.in_stock == True).all()
    }
    can_make, missing_garnish = calculate_can_make(recipe, in_stock_ingredient_ids)
    
    return get_recipe_response(recipe, can_make, missing_garnish)


@router.get("/{recipe_id}", response_model=RecipeResponse)
def get_recipe(recipe_id: int, db: Session = Depends(get_db)):
    recipe = db.query(Recipe).filter(Recipe.id == recipe_id).first()
    if not recipe:
        raise HTTPException(status_code=404, detail="Recipe not found")
    
    in_stock_ingredient_ids = {
        i.id for i in db.query(Ingredient).filter(Ingredient.in_stock == True).all()
    }
    can_make, missing_garnish = calculate_can_make(recipe, in_stock_ingredient_ids)
    
    return get_recipe_response(recipe, can_make, missing_garnish)


@router.post("", response_model=RecipeResponse, status_code=201)
def create_recipe(recipe: RecipeCreate, db: Session = Depends(get_db)):
    db_recipe = Recipe(
        name=recipe.name,
        instructions=recipe.instructions,
        glassware=recipe.glassware,
    )
    db.add(db_recipe)
    db.commit()
    db.refresh(db_recipe)
    
    for ing in recipe.ingredients:
        ingredient = db.query(Ingredient).filter(Ingredient.id == ing.ingredient_id).first()
        if not ingredient:
            db.delete(db_recipe)
            db.commit()
            raise HTTPException(status_code=400, detail=f"Ingredient {ing.ingredient_id} not found")
        
        db_ri = RecipeIngredient(
            recipe_id=db_recipe.id,
            ingredient_id=ing.ingredient_id,
            amount=ing.amount,
            unit=ing.unit,
        )
        db.add(db_ri)
    
    db.commit()
    db.refresh(db_recipe)
    
    in_stock_ingredient_ids = {
        i.id for i in db.query(Ingredient).filter(Ingredient.in_stock == True).all()
    }
    can_make, missing_garnish = calculate_can_make(db_recipe, in_stock_ingredient_ids)
    
    return get_recipe_response(db_recipe, can_make, missing_garnish)


@router.put("/{recipe_id}", response_model=RecipeResponse)
def update_recipe(
    recipe_id: int,
    recipe_update: RecipeUpdate,
    db: Session = Depends(get_db)
):
    recipe = db.query(Recipe).filter(Recipe.id == recipe_id).first()
    if not recipe:
        raise HTTPException(status_code=404, detail="Recipe not found")
    
    if recipe_update.name is not None:
        recipe.name = recipe_update.name
    if recipe_update.instructions is not None:
        recipe.instructions = recipe_update.instructions
    if recipe_update.glassware is not None:
        recipe.glassware = recipe_update.glassware
    
    if recipe_update.ingredients is not None:
        for ri in recipe.ingredients:
            db.delete(ri)
        
        for ing in recipe_update.ingredients:
            ingredient = db.query(Ingredient).filter(Ingredient.id == ing.ingredient_id).first()
            if not ingredient:
                raise HTTPException(status_code=400, detail=f"Ingredient {ing.ingredient_id} not found")
            
            db_ri = RecipeIngredient(
                recipe_id=recipe.id,
                ingredient_id=ing.ingredient_id,
                amount=ing.amount,
                unit=ing.unit,
            )
            db.add(db_ri)
    
    db.commit()
    db.refresh(recipe)
    
    in_stock_ingredient_ids = {
        i.id for i in db.query(Ingredient).filter(Ingredient.in_stock == True).all()
    }
    can_make, missing_garnish = calculate_can_make(recipe, in_stock_ingredient_ids)
    
    return get_recipe_response(recipe, can_make, missing_garnish)


@router.delete("/{recipe_id}", status_code=204)
def delete_recipe(recipe_id: int, db: Session = Depends(get_db)):
    recipe = db.query(Recipe).filter(Recipe.id == recipe_id).first()
    if not recipe:
        raise HTTPException(status_code=404, detail="Recipe not found")
    
    db.delete(recipe)
    db.commit()
    return None
