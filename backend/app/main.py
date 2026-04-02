from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pathlib import Path

from .database import engine, Base
from .routers import ingredients_router, recipes_router
from .schemas.base import IngredientCategory

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Stocktails API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

static_path = Path(__file__).parent.parent / "static"
if static_path.exists():
    app.mount("/", StaticFiles(directory=str(static_path), html=True), name="static")

app.include_router(ingredients_router)
app.include_router(recipes_router)


@app.get("/api/categories")
def get_categories():
    return [category.value for category in IngredientCategory]


@app.get("/api/shopping-list")
def get_shopping_list():
    from .database import SessionLocal
    from .models.ingredient import Ingredient
    
    db = SessionLocal()
    try:
        out_of_stock = db.query(Ingredient).filter(Ingredient.in_stock == False).all()
        return [
            {
                "id": ing.id,
                "name": ing.name,
                "category": ing.category.value,
            }
            for ing in out_of_stock
        ]
    finally:
        db.close()


@app.get("/health")
def health_check():
    return {"status": "healthy"}
