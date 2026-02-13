/**
 * NeuralBloomIcon
 *
 * The Curae AI brand symbol - a neural bloom representing
 * organic intelligence and skin cell connectivity.
 *
 * Structure:
 * - Central circular core
 * - 8 radiating curved petals
 * - Terminal nodes (neural connections)
 * - Subtle "C" negative space via petal arrangement
 */

interface NeuralBloomIconProps {
  className?: string;
  size?: number | string;
  color?: string;
}

export default function NeuralBloomIcon({
  className = '',
  size = 24,
  color = 'currentColor',
}: NeuralBloomIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Central core */}
      <circle cx="12" cy="12" r="3" fill={color} />

      {/* Radiating petals with terminal nodes */}
      {/* Top */}
      <path
        d="M12 9C12 7.5 12 5.5 12 4"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <circle cx="12" cy="3" r="1.5" fill={color} />

      {/* Top-right */}
      <path
        d="M14.1 10C15.2 8.9 16.8 7.3 17.7 6.3"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <circle cx="18.5" cy="5.5" r="1.5" fill={color} />

      {/* Right */}
      <path
        d="M15 12C16.5 12 18.5 12 20 12"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <circle cx="21" cy="12" r="1.5" fill={color} />

      {/* Bottom-right */}
      <path
        d="M14.1 14C15.2 15.1 16.8 16.7 17.7 17.7"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <circle cx="18.5" cy="18.5" r="1.5" fill={color} />

      {/* Bottom */}
      <path
        d="M12 15C12 16.5 12 18.5 12 20"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <circle cx="12" cy="21" r="1.5" fill={color} />

      {/* Bottom-left */}
      <path
        d="M9.9 14C8.8 15.1 7.2 16.7 6.3 17.7"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <circle cx="5.5" cy="18.5" r="1.5" fill={color} />

      {/* Left */}
      <path
        d="M9 12C7.5 12 5.5 12 4 12"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <circle cx="3" cy="12" r="1.5" fill={color} />

      {/* Top-left */}
      <path
        d="M9.9 10C8.8 8.9 7.2 7.3 6.3 6.3"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <circle cx="5.5" cy="5.5" r="1.5" fill={color} />
    </svg>
  );
}
