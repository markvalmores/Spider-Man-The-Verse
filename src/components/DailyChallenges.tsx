export default function DailyChallenges({ pizza }: { pizza: number }) {
  const challenges = [
    { id: 'c1', task: 'Web-swing 1000m', reward: 50 },
    { id: 'c2', task: 'Defeat 5 thugs', reward: 100 },
  ];

  return (
    <div id="daily-challenges" className="bg-neutral-900 p-6 rounded-xl border border-neutral-700 w-full max-w-sm mt-8">
      <h3 className="text-xl font-bold mb-4 text-red-500">Daily Challenges</h3>
      <div className="space-y-3">
        {challenges.map((c) => (
          <div key={c.id} className="flex justify-between bg-neutral-800 p-3 rounded-lg">
            <span>{c.task}</span>
            <span className="font-bold text-yellow-500">{c.reward} 🍕</span>
          </div>
        ))}
      </div>
    </div>
  );
}
