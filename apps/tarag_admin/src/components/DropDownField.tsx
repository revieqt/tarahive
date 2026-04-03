import { useThemeColor } from '@/hooks/useThemeColor';
import React, { useState, useRef, useEffect } from 'react';

interface Option {
  label: string;
  value: string | number;
}

interface DropDownFieldProps {
  placeholder: string;
  value: string | number;
  onChangeValue: (value: string | number) => void;
  options: Option[];
  onFocus?: () => void;
  onBlur?: () => void;
  className?: string;
}

const DropDownField: React.FC<DropDownFieldProps> = ({
  placeholder,
  value,
  onChangeValue,
  options,
  onFocus,
  onBlur,
  className,
}) => {
  const backgroundColor = useThemeColor({}, 'primary');
  const textColor = useThemeColor({}, 'text');

  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  const handleFocus = () => {
    setIsOpen(true);
    onFocus?.();
  };

  const handleBlur = () => {
    onBlur?.();
  };

  const handleSelect = (optionValue: string | number) => {
    onChangeValue(optionValue);
    setIsOpen(false);
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const wrapperClasses = `
    relative
    mb-4
    ${className || ''}
  `;

  const triggerClasses = `
    flex
    items-center
    justify-between
    w-full
    px-4
    py-3
    rounded-[15px]
    border
    transition-colors
    duration-200
    min-h-[48px]
    font-[Poppins]
    text-sm
    cursor-pointer
    ${isOpen ? 'border-[#ccc] ring-2 ring-[#00CAFF]' : 'border-[#ccc4]'}
  `;

  const optionsContainerClasses = `
    absolute
    top-full
    left-0
    right-0
    mt-1
    bg-white
    border
    border-[#ccc4]
    rounded-[15px]
    shadow-lg
    z-50
    max-h-64
    overflow-y-auto
    ${isOpen ? 'block' : 'hidden'}
  `;

  const optionClasses = (isSelected: boolean) => `
    px-4
    py-3
    font-[Poppins]
    text-sm
    cursor-pointer
    transition-colors
    duration-200
    ${isSelected ? 'bg-[#00CAFF] text-white' : 'hover:bg-[#f0f0f0] text-gray-900'}
  `;

  const chevronClasses = `
    w-5
    h-5
  `;

  return (
    <div ref={dropdownRef} className={wrapperClasses}>
      <button
        type="button"
        onClick={handleFocus}
        onBlur={handleBlur}
        style={{
          backgroundColor,
          color: textColor,
        } as React.CSSProperties}
        className={triggerClasses}
      >
        <span className={selectedOption ? '' : 'text-gray-400'}>
          {selectedOption?.label || placeholder}
        </span>
        <svg
          className={chevronClasses}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </button>

      <div className={optionsContainerClasses}>
        {options.length > 0 ? (
          options.map((option) => (
            <div
              key={option.value}
              onClick={() => handleSelect(option.value)}
              className={optionClasses(option.value === value)}
            >
              {option.label}
            </div>
          ))
        ) : (
          <div className="px-4 py-3 text-gray-400 text-center">No options available</div>
        )}
      </div>
    </div>
  );
};

export default DropDownField;
