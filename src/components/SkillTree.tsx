import { useState } from 'react';
import { Skill } from '../types';

const INITIAL_SKILLS: Skill[] = [
  { id: 's1', name: 'Web Shoot', type: 'Basic', cost: 0, unlocked: true },
  { id: 's2', name: 'Punch', type: 'Basic', cost: 0, unlocked: true },
  { id: 's3', name: 'Throw', type: 'Advanced', cost: 200, unlocked: false },
  { id: 's4', name: 'Super Skill', type: 'Elite', cost: 500, unlocked: false },
  { id: 's5', name: 'Ultimate', type: 'Ultimate', cost: 1000, unlocked: false },
];

export default function SkillTree({ pizza, onBuy }: { pizza: number; onBuy: (cost: number) => void }) {
  const [skills, setSkills] = useState<Skill[]>(INITIAL_SKILLS);

  const unlock = (skillId: string) => {
    const skill = skills.find(s => s.id === skillId);
    if (skill && pizza >= skill.cost && !skill.unlocked) {
      onBuy(skill.cost);
      setSkills(skills.map(s => s.id === skillId ? { ...s, unlocked: true } : s));
    }
  };

  return (
    <div className="bg-neutral-900 p-8 rounded-2xl border border-neutral-700 w-full max-w-2xl text-white">
      <h2 className="text-3xl font-bold mb-6 text-blue-500">Skill Tree</h2>
      <div className="space-y-4">
        {skills.map((skill) => (
          <div key={skill.id} className="flex justify-between items-center bg-neutral-800 p-4 rounded-lg">
            <div>
              <div className="font-bold">{skill.name} <span className="text-xs text-neutral-500">[{skill.type}]</span></div>
            </div>
            <button 
              disabled={skill.unlocked || pizza < skill.cost}
              onClick={() => unlock(skill.id)}
              className={`px-4 py-2 rounded transition ${skill.unlocked ? 'bg-green-700' : 'bg-blue-600 disabled:bg-neutral-700 hover:bg-blue-500'}`}
            >
              {skill.unlocked ? 'Unlocked' : `Unlock (${skill.cost} 🍕)`}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
