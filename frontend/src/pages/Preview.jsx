import { useNavigate } from "react-router-dom";
import {
  Brain,
  BarChart3,
  CheckCircle,
  Star,
  ArrowRight,
  Sparkles,
  Shield,
  Zap,
  Users,
  Award,
  Camera,
  Eye,
  Bot,
} from "lucide-react";

const Preview = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Bot,
      title: "AI-Powered Interviews",
      description:
        "Practice interviews generated dynamically using AI based on your target role and skills.",
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      icon: Shield,
      title: "Smart Proctoring",
      description:
        "Monitor tab switching, webcam activity, and interview integrity for realistic practice.",
      gradient: "from-purple-500 to-pink-500",
    },
    {
      icon: BarChart3,
      title: "Performance Analytics",
      description:
        "Track interview scores, weak areas, strengths, and overall improvement over time.",
      gradient: "from-green-500 to-emerald-500",
    },
    {
      icon: Zap,
      title: "Instant AI Feedback",
      description:
        "Receive immediate feedback on your communication and technical answers.",
      gradient: "from-orange-500 to-red-500",
    },
    {
      icon: Camera,
      title: "Video Practice",
      description:
        "Simulate real interviews using webcam and microphone integration.",
      gradient: "from-indigo-500 to-purple-500",
    },
    {
      icon: Users,
      title: "Industry-Level Questions",
      description:
        "Practice questions inspired by real interview experiences from top companies.",
      gradient: "from-teal-500 to-blue-500",
    },
  ];

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Software Engineer",
      content:
        "The AI-generated interviews felt surprisingly realistic and helped me improve my confidence.",
    },
    {
      name: "Michael Rodriguez",
      role: "Backend Developer",
      content:
        "The analytics and feedback system helped me identify my weak areas quickly.",
    },
    {
      name: "Emily Johnson",
      role: "Data Scientist",
      content:
        "One of the best interview preparation platforms I’ve used for technical practice.",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-900/80 backdrop-blur-lg">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-blue-600 p-2">
              <Brain className="h-6 w-6 text-white" />
            </div>

            <div>
              <h1 className="text-xl font-bold">
                AI Interview
              </h1>

              <p className="text-sm text-slate-400">
                Practice Platform
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/login")}
              className="rounded-xl px-4 py-2 text-slate-300 transition hover:bg-slate-800 hover:text-white"
            >
              Login
            </button>

            <button
              onClick={() => navigate("/register")}
              className="rounded-xl bg-blue-600 px-5 py-2 font-medium transition hover:bg-blue-700"
            >
              Get Started
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="mx-auto max-w-7xl px-6 py-24 text-center">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-2 text-sm text-blue-400">
          <Sparkles className="h-4 w-4" />
          AI-Powered Interview Preparation
        </div>

        <h1 className="mb-6 text-5xl font-bold leading-tight md:text-7xl">
          Master Your
          <br />
          <span className="bg-gradient-to-r from-blue-500 via-purple-500 to-blue-600 bg-clip-text text-transparent">
            Next Interview
          </span>
        </h1>

        <p className="mx-auto mb-10 max-w-3xl text-lg leading-relaxed text-slate-400 md:text-xl">
          Practice realistic AI-powered interviews, receive detailed feedback,
          and improve your confidence before facing real recruiters.
        </p>

        {/* CTA Buttons */}
        <div className="mb-16 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <button
            onClick={() => navigate("/register")}
            className="flex items-center gap-2 rounded-2xl bg-blue-600 px-8 py-4 text-lg font-medium transition hover:bg-blue-700"
          >
            Start Free Practice
            <ArrowRight className="h-5 w-5" />
          </button>

          <button
            className="rounded-2xl border border-slate-700 px-8 py-4 text-lg transition hover:bg-slate-900"
          >
            Watch Demo
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
          {[
            { value: "50K+", label: "Interviews Conducted" },
            { value: "98%", label: "Success Rate" },
            { value: "500+", label: "Companies" },
            { value: "24/7", label: "Availability" },
          ].map((item, index) => (
            <div
              key={index}
              className="rounded-3xl border border-slate-800 bg-slate-900 p-6"
            >
              <h3 className="mb-2 text-3xl font-bold text-blue-400">
                {item.value}
              </h3>

              <p className="text-slate-400">
                {item.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="bg-slate-900/50 py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-20 text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-800 px-4 py-2 text-sm text-slate-300">
              <Eye className="h-4 w-4" />
              Powerful Features
            </div>

            <h2 className="mb-6 text-4xl font-bold">
              Everything You Need
              <br />
              to Crack Interviews
            </h2>

            <p className="mx-auto max-w-3xl text-lg text-slate-400">
              Modern AI-powered interview preparation with analytics,
              feedback, and realistic practice sessions.
            </p>
          </div>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => {
              const Icon = feature.icon;

              return (
                <div
                  key={index}
                  className="rounded-3xl border border-slate-800 bg-slate-900 p-8 transition hover:-translate-y-2 hover:border-blue-500/30"
                >
                  <div
                    className={`mb-6 flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-r ${feature.gradient}`}
                  >
                    <Icon className="h-8 w-8 text-white" />
                  </div>

                  <h3 className="mb-4 text-xl font-semibold">
                    {feature.title}
                  </h3>

                  <p className="leading-relaxed text-slate-400">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-4xl font-bold">
              Success Stories
            </h2>

            <p className="text-lg text-slate-400">
              Professionals improving interview skills with AI Interview
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="rounded-3xl border border-slate-800 bg-slate-900 p-8"
              >
                <div className="mb-4 flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="h-4 w-4 fill-yellow-400 text-yellow-400"
                    />
                  ))}
                </div>

                <p className="mb-6 text-slate-300">
                  "{testimonial.content}"
                </p>

                <div>
                  <h4 className="font-semibold">
                    {testimonial.name}
                  </h4>

                  <p className="text-sm text-slate-400">
                    {testimonial.role}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 py-24">
        <div className="mx-auto max-w-5xl px-6 text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm text-white">
            <Award className="h-4 w-4" />
            Join The Future
          </div>

          <h2 className="mb-6 text-5xl font-bold">
            Ready To Improve
            <br />
            Your Interview Skills?
          </h2>

          <p className="mx-auto mb-10 max-w-3xl text-lg text-blue-100">
            Start practicing with AI-powered interviews and build confidence
            for your dream job.
          </p>

          <button
            onClick={() => navigate("/register")}
            className="inline-flex items-center gap-2 rounded-2xl bg-white px-8 py-4 text-lg font-semibold text-blue-600 transition hover:bg-slate-100"
          >
            Start Free Trial
            <ArrowRight className="h-5 w-5" />
          </button>

          <div className="mt-8 flex items-center justify-center gap-2 text-blue-100">
            <CheckCircle className="h-5 w-5" />
            No credit card required
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-950 py-12">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-6 md:flex-row">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-blue-600 p-2">
              <Brain className="h-5 w-5 text-white" />
            </div>

            <div>
              <h3 className="font-semibold">
                AI Interview
              </h3>

              <p className="text-sm text-slate-400">
                AI-powered interview preparation
              </p>
            </div>
          </div>

          <p className="text-sm text-slate-500">
            © 2025 AI Interview. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Preview;