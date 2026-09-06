import { motion } from 'motion/react';

export default function BattleResult({ result, onReturn }: { result: 'WIN' | 'LOSS', onReturn: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="absolute inset-0 bg-neutral-950/90 flex flex-col items-center justify-center text-white z-50 font-['Bangers']"
    >
      <h2 className={`text-9xl font-bold mb-8 ${result === 'WIN' ? 'text-green-500' : 'text-red-600'}`}>
        {result === 'WIN' ? 'VICTORY' : 'DEFEATED'}
      </h2>
      <button 
        onClick={onReturn} 
        className="px-10 py-5 bg-red-600 rounded-lg text-3xl font-bold hover:bg-red-500 transition"
      >
        Return to Menu
      </button>
    </motion.div>
  );
}
