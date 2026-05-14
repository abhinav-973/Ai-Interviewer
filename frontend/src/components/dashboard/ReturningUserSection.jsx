const ReturningUserSection = () => {
  return (
    <div className="rounded-3xl border border-slate-800 bg-gradient-to-r from-slate-900 to-slate-950 p-8">
      <h2 className="text-2xl font-bold">
        Continue Your AI Interview Journey
      </h2>

      <p className="mt-3 max-w-2xl text-slate-400">
        Upload an updated resume or start a
        new interview session to improve your
        performance even further.
      </p>

      <div className="mt-6 flex gap-4">
        <button className="rounded-2xl bg-blue-500 px-6 py-3 font-semibold transition hover:bg-blue-400">
          Start Interview
        </button>

        <button className="rounded-2xl border border-slate-700 bg-slate-900 px-6 py-3 font-semibold transition hover:border-blue-500">
          View Reports
        </button>
      </div>
    </div>
  );
};

export default ReturningUserSection;