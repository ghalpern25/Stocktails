import { useState, useEffect, useCallback } from 'react';
import { api } from '../../hooks/useApi';
import { Ingredient, IngredientCreate, IngredientUpdate, CATEGORIES, CATEGORY_LABELS } from '../../types';
import IngredientForm from './IngredientForm';

export default function Inventory() {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('');
  const [filterStock, setFilterStock] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const loadIngredients = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.ingredients.list();
      const filtered = data.filter(i => {
        if (filterCategory && i.category !== filterCategory) return false;
        if (filterStock && String(i.in_stock) !== filterStock) return false;
        if (searchQuery && !i.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
        return true;
      });
      setIngredients(filtered);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load ingredients');
    } finally {
      setLoading(false);
    }
  }, [filterCategory, filterStock, searchQuery]);

  useEffect(() => {
    loadIngredients();
  }, [loadIngredients]);

  const handleToggleStock = async (id: number) => {
    try {
      await api.ingredients.toggleStock(id);
      loadIngredients();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to toggle stock');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this ingredient?')) return;
    try {
      await api.ingredients.delete(id);
      loadIngredients();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete');
    }
  };

  const handleCreate = async (data: IngredientCreate | IngredientUpdate) => {
    if (!data.name || !data.category) return;
    try {
      await api.ingredients.create({ name: data.name, category: data.category });
      setShowForm(false);
      loadIngredients();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create');
    }
  };

  const handleUpdate = async (id: number, data: IngredientUpdate) => {
    try {
      await api.ingredients.update(id, data);
      setEditingId(null);
      loadIngredients();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update');
    }
  };

  const editingIngredient = editingId ? ingredients.find(i => i.id === editingId) : null;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Inventory</h2>
        <button
          onClick={() => setShowForm(true)}
          className="bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 transition-colors"
        >
          Add Ingredient
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search ingredients..."
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 flex-1"
        />
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
        >
          <option value="">All Categories</option>
          {CATEGORIES.map(cat => (
            <option key={cat} value={cat}>{CATEGORY_LABELS[cat]}</option>
          ))}
        </select>
        <select
          value={filterStock}
          onChange={(e) => setFilterStock(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
        >
          <option value="">All Stock Status</option>
          <option value="true">In Stock</option>
          <option value="false">Out of Stock</option>
        </select>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h3 className="text-lg font-semibold mb-4">Add New Ingredient</h3>
          <IngredientForm
            onSubmit={handleCreate}
            onCancel={() => setShowForm(false)}
          />
        </div>
      )}

      {editingIngredient && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h3 className="text-lg font-semibold mb-4">Edit Ingredient</h3>
          <IngredientForm
            initialData={editingIngredient}
            onSubmit={(data) => handleUpdate(editingIngredient.id, data)}
            onCancel={() => setEditingId(null)}
          />
        </div>
      )}

      {loading ? (
        <div className="text-center py-8 text-gray-500">Loading...</div>
      ) : ingredients.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No ingredients found. Add your first ingredient to get started!
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {ingredients.map((ingredient) => (
            <div
              key={ingredient.id}
              className={`bg-white p-4 rounded-lg shadow-md border-l-4 ${
                ingredient.in_stock ? 'border-green-500' : 'border-red-400'
              }`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-lg">{ingredient.name}</h3>
                  <p className="text-sm text-gray-600">{CATEGORY_LABELS[ingredient.category]}</p>
                </div>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={ingredient.in_stock}
                    onChange={() => handleToggleStock(ingredient.id)}
                    className="sr-only"
                  />
                  <div
                    className={`w-12 h-6 rounded-full transition-colors ${
                      ingredient.in_stock ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform mt-0.5 ${
                        ingredient.in_stock ? 'translate-x-6 ml-0.5' : 'translate-x-0.5'
                      }`}
                    />
                  </div>
                </label>
              </div>
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => setEditingId(ingredient.id)}
                  className="flex-1 text-amber-600 hover:bg-amber-50 py-1 rounded transition-colors text-sm"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(ingredient.id)}
                  className="flex-1 text-red-600 hover:bg-red-50 py-1 rounded transition-colors text-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
