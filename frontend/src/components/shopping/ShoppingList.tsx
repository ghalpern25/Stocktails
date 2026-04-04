import { useState, useEffect, useCallback } from 'react';
import { api } from '../../hooks/useApi';
import { ShoppingListItem, CATEGORY_LABELS, CATEGORIES } from '../../types';

export default function ShoppingList() {
  const [items, setItems] = useState<ShoppingListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('');

  const loadShoppingList = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.shoppingList();
      setItems(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load shopping list');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadShoppingList();
  }, [loadShoppingList]);

  const handleToggleStock = async (id: number) => {
    try {
      await api.ingredients.toggleStock(id);
      loadShoppingList();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to toggle stock');
    }
  };

  const filteredItems = items.filter(item => {
    if (filterCategory && item.category !== filterCategory) return false;
    return true;
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Shopping List</h2>
        <button
          onClick={loadShoppingList}
          className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
        >
          Refresh
        </button>
      </div>

      <div className="mb-6">
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
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-8 text-gray-500">Loading...</div>
      ) : filteredItems.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p className="text-lg mb-2">Your bar is fully stocked!</p>
          <p>No ingredients needed.</p>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="text-sm text-gray-600">
              {filteredItems.length} item{filteredItems.length !== 1 ? 's' : ''} to purchase
            </div>
          </div>

          <div className="space-y-3">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-red-400"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold text-lg">{item.name}</h3>
                    <p className="text-sm text-gray-600">{CATEGORY_LABELS[item.category]}</p>
                  </div>
                  <button
                    onClick={() => handleToggleStock(item.id)}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm"
                  >
                    Mark as Restocked
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
