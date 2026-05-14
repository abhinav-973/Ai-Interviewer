const FeatureCard = ({
  icon: Icon,
  title,
  description,
  color,
}) => {
  return (
    <div className="flex items-start gap-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
      <div className={`rounded-xl p-3 ${color}`}>
        <Icon className="h-6 w-6" />
      </div>

      <div>
        <h3 className="font-semibold">
          {title}
        </h3>

        <p className="mt-1 text-sm text-slate-400">
          {description}
        </p>
      </div>
    </div>
  );
};

export default FeatureCard;