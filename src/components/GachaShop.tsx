import { ShopItem } from '../types';

const ITEMS: ShopItem[] = [
  { id: 's1', name: 'Symbiote Suit', type: 'Suit', cost: 5000 },
  { id: 'f1', name: 'Suit Fragment', type: 'Fragment', cost: 500 },
];

export default function GachaShop({ pizza, onBuy }: { pizza: number; onBuy: (cost: number) => void }) {
  return (
    <div className="bg-neutral-900 p-8 rounded-2xl border border-neutral-700 w-full max-w-2xl text-white">
      <h2 className="text-3xl font-bold mb-6 text-yellow-500">Gacha Shop</h2>
      <div className="space-y-4">
        {ITEMS.map((item) => (
          <div key={item.id} className="flex justify-between items-center bg-neutral-800 p-4 rounded-lg">
            <div>
              <div className="font-bold">{item.name}</div>
              <div className="text-sm text-neutral-400">{item.type}</div>
            </div>
            <button 
              disabled={pizza < item.cost}
              onClick={() => onBuy(item.cost)}
              className="px-4 py-2 bg-red-600 rounded disabled:bg-neutral-700 hover:bg-red-500 transition"
            >
              Buy ({item.cost} 🍕)
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
