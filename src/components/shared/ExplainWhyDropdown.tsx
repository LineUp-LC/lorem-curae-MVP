import { useState } from 'react'

interface ExplainWhyDropdownProps {
  explanation: string
  label?: string
}

export default function ExplainWhyDropdown({
  explanation,
  label = 'Explain why',
}: ExplainWhyDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="mt-2">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        className="inline-flex items-center gap-1 text-xs text-warm-gray hover:text-primary transition-colors cursor-pointer"
      >
        <i className={`ri-arrow-${isOpen ? 'up' : 'down'}-s-line text-sm`}></i>
        <span>{label}</span>
      </button>

      <div
        className="overflow-hidden transition-all duration-300 ease-out"
        style={{
          maxHeight: isOpen ? '200px' : '0px',
          opacity: isOpen ? 1 : 0,
        }}
      >
        <p className="text-xs text-warm-gray/80 leading-relaxed mt-2 pl-4 border-l-2 border-blush">
          {explanation}
        </p>
      </div>
    </div>
  )
}
