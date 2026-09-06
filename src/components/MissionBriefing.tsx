export default function MissionBriefing({ title, objective }: { title: string; objective: string }) {
  return (
    <div className="absolute bottom-6 right-6 bg-neutral-900/80 p-6 rounded-xl border-l-4 border-red-600 text-white font-['Bangers'] max-w-sm">
      <h4 className="text-xl font-bold mb-2 text-red-500">MISSION: {title}</h4>
      <p className="text-lg">{objective}</p>
    </div>
  );
}
