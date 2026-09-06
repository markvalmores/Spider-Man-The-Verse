import { motion } from 'motion/react';

export default function BattleHUD({ p1Health, p2Health, combo, ultGauge }: { p1Health: number; p2Health: number; combo: number; ultGauge: number }) {
  return (
    <div className="absolute top-0 left-0 w-full p-6 flex justify-between items-start font-['Bangers'] text-white pointer-events-none">
      {/* Health Bars */}
      <div className="w-1/3 space-y-2">
        <div className="h-6 bg-neutral-800 border-2 border-white overflow-hidden">
          <motion.div 
            className="h-full bg-red-600" 
            initial={{ width: '100%' }}
            animate={{ width: `${p1Health}%` }}
            transition={{ type: 'spring', stiffness: 100, damping: 20 }}
          ></motion.div>
        </div>
        <div className="text-sm">PLAYER 1</div>
      </div>
      <div className="w-1/3 space-y-2">
        <div className="h-6 bg-neutral-800 border-2 border-white overflow-hidden">
          <motion.div 
            className="h-full bg-blue-600" 
            initial={{ width: '100%' }}
            animate={{ width: `${p2Health}%` }}
            transition={{ type: 'spring', stiffness: 100, damping: 20 }}
          ></motion.div>
        </div>
        <div className="text-sm text-right">PLAYER 2</div>
      </div>

      {/* Combo Counter */}
      {combo > 0 && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute top-20 left-1/2 transform -translate-x-1/2 text-6xl text-yellow-400 drop-shadow-lg"
        >
          {combo} HIT COMBO!
        </motion.div>
      )}

      {/* Ultimate Gauge */}
      <div className="absolute bottom-6 left-6 w-48 h-4 bg-neutral-800 border-2 border-white">
        <motion.div 
          className="h-full bg-yellow-500" 
          animate={{ 
            width: `${ultGauge}%`,
            opacity: ultGauge === 100 ? [1, 0.5, 1] : 1,
            scaleX: ultGauge === 100 ? [1, 1.02, 1] : 1
          }} 
          transition={{ repeat: ultGauge === 100 ? Infinity : 0, duration: 1 }}
        ></motion.div>
        <div className="text-xs mt-1">ULTIMATE</div>
      </div>
    </div>
  );
}
