import { useThemeColor } from '@/hooks/useThemeColor';
import React, { useState } from 'react';

interface DatePickerProps {
  placeholder: string;
  value: string; // ISO date string (YYYY-MM-DD)
  onChangeDate: (date: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  isFocused?: boolean;
  className?: string;
  type?: 'date' | 'datetime-local';
}

const DatePicker: React.FC<DatePickerProps> = ({
  placeholder,
  value,
  onChangeDate,
  onFocus,
  onBlur,
  isFocused: isFocusedProp,
  className,
  type = 'date',
}) => {
  const backgroundColor = useThemeColor({}, 'primary');
  const textColor = useThemeColor({}, 'text');

  const [isFocused, setIsFocused] = useState(false);
  const focused = isFocusedProp !== undefined ? isFocusedProp : isFocused;

  const handleFocus = () => {
    setIsFocused(true);
    onFocus?.();
  };

  const handleBlur = () => {
    setIsFocused(false);
    onBlur?.();
  };

  const wrapperClasses = `
    flex
    items-center
    rounded-[15px]
    mb-4
    border
    transition-colors
    duration-200
    min-h-[48px]
    px-4
    ${focused ? 'border-[#ccc]' : 'border-[#ccc4]'}
  `;

  const inputClasses = `
    w-full
    py-3
    font-[Poppins]
    text-sm
    outline-none
    transition-colors
    duration-200
    ${focused ? 'ring-2 ring-[#00CAFF]' : ''}
    ${className || ''}
  `;

  return (
    <div className={wrapperClasses}>
      <input
        type={type}
        value={value}
        onChange={(e) => onChangeDate(e.target.value)}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder={placeholder}
        style={{
          backgroundColor,
          color: textColor,
          caretColor: '#00CAFF',
        } as React.CSSProperties}
        className={inputClasses}
      />
    </div>
  );
};

export default DatePicker;
