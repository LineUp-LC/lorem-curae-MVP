interface ConcentrationRowProps {
  name: string;
  concentration: string;
  isHighest: boolean;
}

export default function ConcentrationRow({ name, concentration, isHighest }: ConcentrationRowProps) {
  const isPresent = concentration === 'Present';
  const highlighted = isHighest && !isPresent;

  return (
    <div
      className={`flex items-center justify-between py-1 ${
        highlighted ? 'text-primary-700 font-medium' : 'text-warm-gray'
      }`}
    >
      <span className="text-xs">{name}</span>
      <div className="flex flex-col items-end">
        <span className={`text-xs flex items-center gap-1 ${
          isPresent ? 'text-warm-gray/60 italic' : ''
        }`}>
          {concentration}
          {highlighted && (
            <i className="ri-trophy-line text-amber-500" title="Highest concentration"></i>
          )}
        </span>
        {isPresent && (
          <span className="text-[10px] text-warm-gray/40 mt-0.5">
            Brand doesn't disclose the exact concentration
          </span>
        )}
      </div>
    </div>
  );
}
