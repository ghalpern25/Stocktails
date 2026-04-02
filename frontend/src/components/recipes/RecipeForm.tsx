import { useState } from 'react';
import { RecipeCreate, Ingredient, RecipeIngredient, GLASSWARE_OPTIONS } from '../../types';

interface RecipeFormProps {
  ingredients: Ingredient[];
  initialData?: RecipeCreate;
  onSubmit: (data: RecipeCreate) => void;
  onCancel: () => void;
}

export default function RecipeForm({ ingredients, initialData, onSubmit, onCancel }: RecipeFormProps) {
  const [name, setName] = useState(initialData?.name || '');
  const [instructions, setInstructions] = useState(initialData?.instructions || '');
  const [glassware, setGlassware] = useState(initialData?.glassware || '');
  const [glasswareOther, setGlasswareOther] = useState('');
  const [recipeIngredients, setRecipeIngredients] = useState<RecipeIngredient[]>(
    initialData?.ingredients || []
  );
  const [ingredientSearch, setIngredientSearch] = useState('');
  const [amount, setAmount] = useState('');
  const [unit, setUnit] = useState('');

  const handleRemoveIngredient = (id: number) => {
    setRecipeIngredients(recipeIngredients.filter(ri => ri.ingredient_id !== id));
  };

  const handleGlasswareChange = (value: string) => {
    setGlassware(value);
    if (value !== 'Other') {
      setGlasswareOther('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (recipeIngredients.length === 0) {
      alert('Add at least one ingredient');
      return;
    }
    const finalGlassware = glassware === 'Other' ? glasswareOther : glassware;
    onSubmit({
      name,
      instructions,
      glassware: finalGlassware || null,
      ingredients: recipeIngredients,
    });
  };

  const availableIngredients = ingredients.filter(
    i => !recipeIngredients.find(ri => ri.ingredient_id === i.id)
  );

  const handleAddIngredient = () => {
    if (!ingredientSearch || !amount) return;
    const selectedIng = availableIngredients.find(
      ing => ing.name.toLowerCase() === ingredientSearch.toLowerCase()
    );
    if (!selectedIng) return;
    
    const existing = recipeIngredients.find(ri => ri.ingredient_id === selectedIng.id);
    if (existing) return;

    setRecipeIngredients([
      ...recipeIngredients,
      { ingredient_id: selectedIng.id, amount, unit: unit || null }
    ]);
    setIngredientSearch('');
    setAmount('');
    setUnit('');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
          placeholder="e.g., Old Fashioned"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Glassware</label>
          <select
            value={glassware}
            onChange={(e) => handleGlasswareChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
          >
            <option value="">Select glassware</option>
            {GLASSWARE_OPTIONS.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>
        {glassware === 'Other' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Specify</label>
            <input
              type="text"
              value={glasswareOther}
              onChange={(e) => setGlasswareOther(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              placeholder="Enter glassware type"
            />
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Ingredients</label>
        <div className="space-y-2 mb-3">
          {recipeIngredients.map((ri) => {
            const ing = ingredients.find(i => i.id === ri.ingredient_id);
            return (
              <div key={ri.ingredient_id} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded">
                <span>
                  {ri.amount} {ri.unit || ''} {ing?.name || 'Unknown'}
                </span>
                <button
                  type="button"
                  onClick={() => handleRemoveIngredient(ri.ingredient_id)}
                  className="text-red-600 hover:bg-red-100 px-2 py-1 rounded text-sm"
                >
                  Remove
                </button>
              </div>
            );
          })}
        </div>

        <div className="flex gap-2 items-end">
          <div className="flex-1">
            <label className="block text-xs text-gray-500 mb-1">Ingredient</label>
            <input
              type="text"
              value={ingredientSearch}
              onChange={(e) => setIngredientSearch(e.target.value)}
              list="ingredient-options"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              placeholder="Type ingredient name..."
            />
            <datalist id="ingredient-options">
              {availableIngredients.map((ing) => (
                <option key={ing.id} value={ing.name} />
              ))}
            </datalist>
          </div>
          <div className="w-20">
            <label className="block text-xs text-gray-500 mb-1">Amount</label>
            <input
              type="text"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              placeholder="2"
            />
          </div>
          <div className="w-20">
            <label className="block text-xs text-gray-500 mb-1">Unit</label>
            <input
              type="text"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              placeholder="oz"
            />
          </div>
          <button
            type="button"
            onClick={handleAddIngredient}
            className="px-3 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 text-sm"
          >
            Add
          </button>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Instructions</label>
        <textarea
          value={instructions}
          onChange={(e) => setInstructions(e.target.value)}
          required
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
          placeholder="Step by step instructions..."
        />
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          className="bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 transition-colors"
        >
          {initialData ? 'Update' : 'Add'} Recipe
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
