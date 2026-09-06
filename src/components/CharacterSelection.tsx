import { useState } from 'react';
import { AVAILABLE_CHARACTERS, Character } from '../types';

export default function CharacterSelection({ onSelect }: { onSelect: (c: Character) => void }) {
  const [selected, setSelected] = useState<Character>(AVAILABLE_CHARACTERS[0]);

  return (
    <div className="flex flex-col items-center p-8 bg-neutral-900 text-white rounded-2xl shadow-2xl border border-neutral-700 max-w-2xl w-full">
      <h2 className="text-3xl font-bold mb-6 text-red-500">Character Selection</h2>
      
      <div className="flex gap-4 mb-8 overflow-x-auto w-full p-2">
        {AVAILABLE_CHARACTERS.map((char) => (
          <button 
            key={char.id}
            onClick={() => setSelected(char)}
            className={`p-4 rounded-xl border ${selected.id === char.id ? 'bg-red-700 border-red-500' : 'bg-neutral-800 border-neutral-600'} hover:border-red-400 transition`}
          >
            <div className="text-4xl mb-2">{char.thumbnail}</div>
            <div className="font-semibold whitespace-nowrap">{char.name}</div>
          </button>
        ))}
      </div>

      <div className="bg-neutral-800 p-6 rounded-xl w-full text-center border border-neutral-700 mb-6">
        <h3 className="text-2xl font-bold text-white">{selected.name}</h3>
        <p className="text-neutral-300 mt-2">{selected.description}</p>
        <div className="mt-4 h-40 bg-neutral-700 rounded-lg flex items-center justify-center text-neutral-500">
          Profile Preview Placeholder
        </div>
      </div>

      <button 
        onClick={() => onSelect(selected)}
        className="px-8 py-3 bg-red-600 rounded-lg font-bold hover:bg-red-500 transition shadow-lg w-full"
      >
        Select {selected.name}
      </button>
    </div>
  );
}
