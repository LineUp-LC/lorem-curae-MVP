import { useState, useRef, useEffect, useCallback } from 'react';

export interface DropdownOption {
  value: string;
  label: string;
}

interface DropdownProps {
  id?: string;
  name?: string;
  value: string;
  options: DropdownOption[];
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

/**
 * Custom Dropdown Component
 *
 * A fully styled, accessible dropdown that replaces native <select>.
 * Features:
 * - Click outside to close
 * - Keyboard navigation (Arrow keys, Enter, Escape)
 * - Smooth open/close animations
 * - Brand-consistent styling
 */
export default function Dropdown({
  id,
  name,
  value,
  options,
  onChange,
  placeholder = 'Select...',
  className = '',
  disabled = false,
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  // Find the currently selected option
  const selectedOption = options.find((opt) => opt.value === value);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Reset highlighted index when dropdown opens
  useEffect(() => {
    if (isOpen) {
      const currentIndex = options.findIndex((opt) => opt.value === value);
      setHighlightedIndex(currentIndex >= 0 ? currentIndex : 0);
    }
  }, [isOpen, options, value]);

  // Scroll highlighted option into view
  useEffect(() => {
    if (isOpen && listRef.current && highlightedIndex >= 0) {
      const highlightedElement = listRef.current.children[highlightedIndex] as HTMLElement;
      if (highlightedElement) {
        highlightedElement.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [highlightedIndex, isOpen]);

  const handleToggle = useCallback(() => {
    if (!disabled) {
      setIsOpen((prev) => !prev);
    }
  }, [disabled]);

  const handleSelect = useCallback(
    (optionValue: string) => {
      onChange(optionValue);
      setIsOpen(false);
    },
    [onChange]
  );

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (disabled) return;

      switch (event.key) {
        case 'Enter':
        case ' ':
          event.preventDefault();
          if (isOpen && highlightedIndex >= 0) {
            handleSelect(options[highlightedIndex].value);
          } else {
            setIsOpen(true);
          }
          break;

        case 'Escape':
          event.preventDefault();
          setIsOpen(false);
          break;

        case 'ArrowDown':
          event.preventDefault();
          if (!isOpen) {
            setIsOpen(true);
          } else {
            setHighlightedIndex((prev) =>
              prev < options.length - 1 ? prev + 1 : prev
            );
          }
          break;

        case 'ArrowUp':
          event.preventDefault();
          if (isOpen) {
            setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : prev));
          }
          break;

        case 'Home':
          event.preventDefault();
          if (isOpen) {
            setHighlightedIndex(0);
          }
          break;

        case 'End':
          event.preventDefault();
          if (isOpen) {
            setHighlightedIndex(options.length - 1);
          }
          break;

        default:
          break;
      }
    },
    [disabled, isOpen, highlightedIndex, options, handleSelect]
  );

  return (
    <div
      ref={containerRef}
      className={`relative ${className}`}
    >
      {/* Hidden native select for form compatibility */}
      {name && (
        <select
          name={name}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="sr-only"
          tabIndex={-1}
          aria-hidden="true"
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      )}

      {/* Trigger Button */}
      <button
        type="button"
        id={id}
        onClick={handleToggle}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-labelledby={id}
        className={`
          w-full flex items-center justify-between gap-2
          px-4 py-2.5
          bg-white border border-blush rounded-xl
          text-sm font-medium text-deep
          transition-all duration-200
          hover:border-primary/50 hover:bg-cream/30
          focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary
          disabled:opacity-50 disabled:cursor-not-allowed
          cursor-pointer
          ${isOpen ? 'border-primary ring-2 ring-primary/20' : ''}
        `}
      >
        <span className={selectedOption ? 'text-deep' : 'text-warm-gray'}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <i
          className={`ri-arrow-down-s-line text-lg text-warm-gray transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        ></i>
      </button>

      {/* Dropdown Menu */}
      <div
        className={`
          absolute z-50 w-full mt-1.5
          bg-white border border-blush/80 rounded-xl
          shadow-lg shadow-warm-gray/10
          overflow-hidden
          transition-all duration-200 origin-top
          ${
            isOpen
              ? 'opacity-100 scale-100 translate-y-0'
              : 'opacity-0 scale-95 -translate-y-1 pointer-events-none'
          }
        `}
      >
        <ul
          ref={listRef}
          role="listbox"
          aria-activedescendant={
            highlightedIndex >= 0 ? `${id}-option-${highlightedIndex}` : undefined
          }
          className="py-1.5 max-h-60 overflow-y-auto"
        >
          {options.map((option, index) => {
            const isSelected = option.value === value;
            const isHighlighted = index === highlightedIndex;

            return (
              <li
                key={option.value}
                id={`${id}-option-${index}`}
                role="option"
                aria-selected={isSelected}
                onClick={() => handleSelect(option.value)}
                onMouseEnter={() => setHighlightedIndex(index)}
                className={`
                  px-4 py-2.5 cursor-pointer
                  text-sm font-medium
                  transition-colors duration-100
                  flex items-center justify-between
                  ${isHighlighted ? 'bg-cream' : 'bg-white'}
                  ${isSelected ? 'text-primary' : 'text-deep'}
                  hover:bg-cream
                `}
              >
                <span>{option.label}</span>
                {isSelected && (
                  <i className="ri-check-line text-primary text-lg"></i>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
