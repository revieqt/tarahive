import { useThemeColor } from '@/hooks/useThemeColor';
import React, { useState } from 'react';

interface TextFieldProps {
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  isFocused?: boolean;
  type?: 'text' | 'email' | 'number' | 'tel';
  className?: string;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  multiline?: boolean;
  rows?: number;
}

const TextField: React.FC<TextFieldProps> = ({
  placeholder,
  value,
  onChangeText,
  onFocus,
  onBlur,
  isFocused: isFocusedProp,
  type = 'text',
  className,
  onKeyDown,
  multiline = false,
  rows = 4,
}) => {
  // Use themed colors
  const backgroundColor = useThemeColor({}, 'primary');
  const textColor = useThemeColor({}, 'text');

  // Local focus state for border color
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

  const inputClasses = `
    w-full
    px-4
    py-3
    rounded-[15px]
    font-[Poppins]
    text-sm
    outline-none
    transition-colors
    duration-200
    ${focused ? 'ring-2 ring-[#00CAFF]' : ''}
    ${className || ''}
  `;

  const wrapperClasses = `
    flex
    items-center
    rounded-[15px]
    mb-4
    border
    transition-colors
    duration-200
    min-h-[48px]
    ${focused ? 'border-[#ccc]' : 'border-[#ccc4]'}
  `;

  if (multiline) {
    return (
      <textarea
        value={value}
        onChange={(e) => onChangeText(e.target.value)}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        rows={rows}
        style={{
          backgroundColor,
          color: textColor,
        } as React.CSSProperties}
        className={`
          ${wrapperClasses}
          resize-vertical
          overflow-auto
        `}
      />
    );
  }

  return (
    <div className={wrapperClasses}>
      <input
        type={type}
        value={value}
        onChange={(e) => onChangeText(e.target.value)}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyDown={onKeyDown}
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

export default TextField;
