import { useState, useEffect, useCallback } from 'react';
import { Star } from 'lucide-react';
import { api } from '../../hooks/useApi';
import { RecipeList, Recipe, RecipeCreate, RecipeUpdate, Ingredient } from '../../types';
import RecipeForm from './RecipeForm';

export default function Recipes() {
  const [recipes, setRecipes] = useState<RecipeList[]>([]);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [filterCanMake, setFilterCanMake] = useState(false);
  const [filterFavorites, setFilterFavorites] = useState(false);
  const [filterBaseSpirit, setFilterBaseSpirit] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);

  const loadRecipes = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.recipes.list();
      setRecipes(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load recipes');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadIngredients = useCallback(async () => {
    try {
      const data = await api.ingredients.list();
      setIngredients(data);
    } catch (err) {
      console.error('Failed to load ingredients', err);
    }
  }, []);

  useEffect(() => {
    loadRecipes();
    loadIngredients();
  }, [loadRecipes, loadIngredients]);

  const loadRecipeDetails = async (id: number) => {
    try {
      const data = await api.recipes.get(id);
      setSelectedRecipe(data);
      setEditingId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load recipe');
    }
  };

  const handleCreate = async (data: RecipeCreate) => {
    try {
      await api.recipes.create(data);
      setShowForm(false);
      loadRecipes();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create recipe');
    }
  };

  const handleUpdate = async (id: number, data: RecipeUpdate) => {
    try {
      await api.recipes.update(id, data);
      setEditingId(null);
      loadRecipes();
      loadRecipeDetails(id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update recipe');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this recipe?')) return;
    try {
      await api.recipes.delete(id);
      setSelectedRecipe(null);
      loadRecipes();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete');
    }
  };

  const handleToggleFavorite = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const updated = await api.recipes.toggleFavorite(id);
      setRecipes(recipes.map(r => r.id === id ? { ...r, is_favorite: updated.is_favorite } : r));
      if (selectedRecipe?.id === id) {
        setSelectedRecipe(updated);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to toggle favorite');
    }
  };

  const filteredRecipes = recipes.filter(r => {
    if (searchQuery && !r.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (filterCanMake && !r.can_make) return false;
    if (filterFavorites && !r.is_favorite) return false;
    if (filterBaseSpirit) {
      const [category, name] = filterBaseSpirit.split('|');
      const hasSpirit = r.ingredients.some(ing => {
        const ingredient = ingredients.find(i => i.id === ing.ingredient_id);
        return ingredient?.category === category && ingredient?.name === name;
      });
      if (!hasSpirit) return false;
    }
    return true;
  });

  const baseSpiritIngredients = ingredients.filter(i => i.category === 'BASE_SPIRIT');

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Cocktails</h2>
        <button
          onClick={() => setShowForm(true)}
          className="bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 transition-colors"
        >
          Add Recipe
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search cocktails..."
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 flex-1"
        />
        <label className="flex items-center gap-2 cursor-pointer sm:py-2">
          <input
            type="checkbox"
            checked={filterCanMake}
            onChange={(e) => setFilterCanMake(e.target.checked)}
            className="w-4 h-4 text-amber-600 rounded focus:ring-amber-500"
          />
          <span className="text-gray-700">Can make</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer sm:py-2">
          <input
            type="checkbox"
            checked={filterFavorites}
            onChange={(e) => setFilterFavorites(e.target.checked)}
            className="w-4 h-4 text-amber-600 rounded focus:ring-amber-500"
          />
          <span className="text-gray-700">Favorites</span>
        </label>
        <select
          value={filterBaseSpirit}
          onChange={(e) => setFilterBaseSpirit(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
        >
          <option value="">All Base Spirits</option>
          {baseSpiritIngredients.map(spirit => (
            <option key={spirit.id} value={spirit.category + '|' + spirit.name}>
              {spirit.name}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h3 className="text-lg font-semibold mb-4">Add New Recipe</h3>
          <RecipeForm
            ingredients={ingredients}
            onSubmit={handleCreate}
            onCancel={() => setShowForm(false)}
          />
        </div>
      )}

      {editingId && selectedRecipe && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h3 className="text-lg font-semibold mb-4">Edit Recipe</h3>
          <RecipeForm
            initialData={{
              name: selectedRecipe.name,
              instructions: selectedRecipe.instructions,
              glassware: selectedRecipe.glassware,
              ingredients: selectedRecipe.ingredients.map(i => ({
                ingredient_id: i.ingredient_id,
                amount: i.amount,
                unit: i.unit,
              })),
            }}
            ingredients={ingredients}
            onSubmit={(data) => handleUpdate(selectedRecipe.id, data)}
            onCancel={() => setEditingId(null)}
          />
        </div>
      )}

      <div>
        <h3 className="text-lg font-semibold mb-4 text-gray-700">
          {filteredRecipes.length} Recipe{filteredRecipes.length !== 1 ? 's' : ''}
        </h3>
        {loading ? (
          <div className="text-center py-8 text-gray-500">Loading...</div>
        ) : filteredRecipes.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No recipes found. Add your first recipe!
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredRecipes.map((recipe) => (
              <div
                key={recipe.id}
                onClick={() => loadRecipeDetails(recipe.id)}
                className={`bg-white p-4 rounded-lg shadow-sm cursor-pointer hover:shadow-md transition-shadow border-l-4 ${
                  recipe.can_make ? 'border-green-500' : 'border-gray-300'
                } ${selectedRecipe?.id === recipe.id ? 'ring-2 ring-amber-500' : ''}`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-start gap-2">
                    <button
                      onClick={(e) => handleToggleFavorite(recipe.id, e)}
                      className="text-gray-400 hover:text-amber-500 transition-colors"
                    >
                      <Star
                        className={`w-5 h-5 ${recipe.is_favorite ? 'fill-amber-500 text-amber-500' : ''}`}
                      />
                    </button>
                    <div>
                      <h4 className="font-semibold">{recipe.name}</h4>
                      {recipe.glassware && (
                        <p className="text-sm text-gray-500">{recipe.glassware}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        recipe.can_make
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                        {recipe.can_make ? 'Can Make' : 'Missing Ingredient(s)'}
                    </span>
                    {recipe.missing_garnish && (
                      <span className="px-2 py-1 rounded text-xs font-medium bg-yellow-100 text-yellow-700">
                        No {recipe.missing_garnish}
                      </span>
                    )}
                  </div>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  {recipe.ingredients.length} ingredient{recipe.ingredients.length !== 1 ? 's' : ''}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedRecipe && !editingId && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedRecipe(null)}
        >
          <div 
            className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold">{selectedRecipe.name}</h3>
                <button
                  onClick={() => setSelectedRecipe(null)}
                  className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
                >
                  &times;
                </button>
              </div>

              {selectedRecipe.missing_garnish && (
                <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-3 py-2 rounded mb-4 text-sm">
                  Missing garnish: {selectedRecipe.missing_garnish}
                </div>
              )}

              {selectedRecipe.glassware && (
                <p className="text-gray-600 mb-4">
                  <span className="font-medium">Glass:</span> {selectedRecipe.glassware}
                </p>
              )}

              <div className="mb-4">
                <h4 className="font-semibold text-gray-700 mb-2">Ingredients</h4>
                <ul className="space-y-2">
                  {selectedRecipe.ingredients.map((ing, idx) => (
                    <li key={idx} className="text-sm">
                      {ing.amount} {ing.unit || ''} {ing.ingredient_name}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mb-6">
                <h4 className="font-semibold text-gray-700 mb-2">Instructions</h4>
                <p className="text-gray-600 whitespace-pre-line">{selectedRecipe.instructions}</p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setEditingId(selectedRecipe.id)}
                  className="flex-1 text-amber-600 hover:bg-amber-50 px-3 py-2 rounded text-sm transition-colors border border-amber-600"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(selectedRecipe.id)}
                  className="flex-1 text-red-600 hover:bg-red-50 px-3 py-2 rounded text-sm transition-colors border border-red-600"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
