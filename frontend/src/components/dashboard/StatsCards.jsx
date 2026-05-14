const StatsCards = ({ user }) => {
  return (
    <div className="grid gap-6 md:grid-cols-3">
      <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
        <p className="text-sm text-slate-400">
          Interviews Taken
        </p>

        <h2 className="mt-3 text-4xl font-bold">
          {user.interviewsTaken}
        </h2>
      </div>

      <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
        <p className="text-sm text-slate-400">
          Average Score
        </p>

        <h2 className="mt-3 text-4xl font-bold text-blue-400">
          {user.averageScore}%
        </h2>
      </div>

      <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
        <p className="text-sm text-slate-400">
          Experience Level
        </p>

        <h2 className="mt-3 text-4xl font-bold capitalize text-violet-400">
          {user.experienceLevel}
        </h2>
      </div>
    </div>
  );
};

export default StatsCards;