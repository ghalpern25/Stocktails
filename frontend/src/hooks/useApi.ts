const API_BASE = '/api';

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || `HTTP error ${response.status}`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}

export const api = {
  ingredients: {
    list: () => fetchJson<import('../types').Ingredient[]>(`${API_BASE}/ingredients`),
    get: (id: number) => fetchJson<import('../types').Ingredient>(`${API_BASE}/ingredients/${id}`),
    create: (data: import('../types').IngredientCreate) =>
      fetchJson<import('../types').Ingredient>(`${API_BASE}/ingredients`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: number, data: import('../types').IngredientUpdate) =>
      fetchJson<import('../types').Ingredient>(`${API_BASE}/ingredients/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    toggleStock: (id: number) =>
      fetchJson<{ id: number; in_stock: boolean; name: string }>(`${API_BASE}/ingredients/${id}/toggle-stock`, {
        method: 'PATCH',
      }),
    delete: (id: number) =>
      fetchJson<void>(`${API_BASE}/ingredients/${id}`, { method: 'DELETE' }),
  },

  recipes: {
    list: (params?: { can_make_only?: boolean; favorites_only?: boolean; base_spirit?: string }) => {
      const searchParams = new URLSearchParams();
      if (params?.can_make_only) searchParams.set('can_make_only', 'true');
      if (params?.favorites_only) searchParams.set('favorites_only', 'true');
      if (params?.base_spirit) searchParams.set('base_spirit', params.base_spirit);
      const query = searchParams.toString();
      return fetchJson<import('../types').RecipeList[]>(`${API_BASE}/recipes${query ? `?${query}` : ''}`);
    },
    get: (id: number) => fetchJson<import('../types').Recipe>(`${API_BASE}/recipes/${id}`),
    create: (data: import('../types').RecipeCreate) =>
      fetchJson<import('../types').Recipe>(`${API_BASE}/recipes`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: number, data: import('../types').RecipeUpdate) =>
      fetchJson<import('../types').Recipe>(`${API_BASE}/recipes/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    toggleFavorite: (id: number) =>
      fetchJson<import('../types').Recipe>(`${API_BASE}/recipes/${id}/toggle-favorite`, {
        method: 'PATCH',
      }),
    delete: (id: number) =>
      fetchJson<void>(`${API_BASE}/recipes/${id}`, { method: 'DELETE' }),
  },

  shoppingList: () => fetchJson<import('../types').ShoppingListItem[]>(`${API_BASE}/shopping-list`),

  categories: () => fetchJson<string[]>(`${API_BASE}/categories`),
};
