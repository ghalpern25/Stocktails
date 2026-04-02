import { useState } from 'react';
import Inventory from './components/inventory/Inventory';
import Recipes from './components/recipes/Recipes';
import ShoppingList from './components/shopping/ShoppingList';

type Tab = 'inventory' | 'cocktails' | 'shopping';

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('inventory');

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-amber-800 text-white p-4 shadow-md">
        <h1 className="text-2xl font-bold text-center">Stocktails</h1>
      </header>

      <nav className="bg-amber-700 text-white">
        <div className="flex justify-center">
          <button
            onClick={() => setActiveTab('inventory')}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === 'inventory'
                ? 'bg-amber-900 border-b-2 border-amber-400'
                : 'hover:bg-amber-600'
            }`}
          >
            Inventory
          </button>
          <button
            onClick={() => setActiveTab('cocktails')}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === 'cocktails'
                ? 'bg-amber-900 border-b-2 border-amber-400'
                : 'hover:bg-amber-600'
            }`}
          >
            Cocktails
          </button>
          <button
            onClick={() => setActiveTab('shopping')}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === 'shopping'
                ? 'bg-amber-900 border-b-2 border-amber-400'
                : 'hover:bg-amber-600'
            }`}
          >
            Shopping List
          </button>
        </div>
      </nav>

      <main className="p-6">
        {activeTab === 'inventory' && <Inventory />}
        {activeTab === 'cocktails' && <Recipes />}
        {activeTab === 'shopping' && <ShoppingList />}
      </main>
    </div>
  );
}

export default App;
