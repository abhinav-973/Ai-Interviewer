import {
  Brain,
  Sparkles,
  Target,
  Trophy,
} from "lucide-react";

import FeatureCard from "./FeatureCard";

const DashboardHero = () => {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 to-slate-950 p-8">
      <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-blue-500/20 blur-3xl" />

      <div className="absolute bottom-0 left-0 h-40 w-40 rounded-full bg-violet-500/20 blur-3xl" />

      <div className="relative z-10">
        <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-4 py-2 text-sm font-medium text-blue-300">
          <Sparkles className="h-4 w-4" />
          AI Powered Interview Prep
        </div>

        <h2 className="mt-6 text-4xl font-bold leading-tight">
          Crack interviews with
          <span className="bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">
            {" "}
            real AI feedback
          </span>
        </h2>

        <p className="mt-6 text-lg leading-relaxed text-slate-400">
          Practice technical interviews,
          improve communication skills, track
          performance, and get personalized
          recommendations.
        </p>

        <div className="mt-10 space-y-5">
          <FeatureCard
            icon={Brain}
            title="AI Question Generation"
            description="Personalized questions based on your resume & target role."
            color="bg-blue-500/10 text-blue-400"
          />

          <FeatureCard
            icon={Target}
            title="Smart Skill Analysis"
            description="Detect strengths and weak areas instantly."
            color="bg-violet-500/10 text-violet-400"
          />

          <FeatureCard
            icon={Trophy}
            title="Performance Tracking"
            description="Improve your interview score with detailed analytics."
            color="bg-emerald-500/10 text-emerald-400"
          />
        </div>
      </div>
    </div>
  );
};

export default DashboardHero;