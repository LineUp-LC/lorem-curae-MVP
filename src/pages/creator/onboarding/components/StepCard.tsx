interface StepCardProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}

export default function StepCard({ title, subtitle, children }: StepCardProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-blush-200 p-6 sm:p-8">
      <div className="mb-6">
        <h1 className="font-serif text-2xl sm:text-3xl font-semibold text-deep mb-2">
          {title}
        </h1>
        <p className="text-warm-gray">{subtitle}</p>
      </div>
      {children}
    </div>
  );
}
