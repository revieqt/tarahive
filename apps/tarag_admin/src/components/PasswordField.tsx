import { useThemeColor } from '@/hooks/useThemeColor';
import React, { useState } from 'react';

interface PasswordFieldProps {
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  isFocused?: boolean;
  className?: string;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}

const EyeIcon: React.FC<{ visible: boolean; color: string }> = ({ visible, color }) => {
  if (visible) {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    );
  }
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
};

const PasswordField: React.FC<PasswordFieldProps> = ({
  placeholder,
  value,
  onChangeText,
  onFocus,
  onBlur,
  isFocused: isFocusedProp,
  className,
  onKeyDown,
}) => {
  const backgroundColor = useThemeColor({}, 'primary');
  const textColor = useThemeColor({}, 'text');
  const accentColor = useThemeColor({}, 'accent');
  const iconColor = useThemeColor({}, 'icon');

  const [isPasswordVisible, setPasswordVisible] = useState(false);
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
    ${className || ''}
  `;

  return (
    <div className={wrapperClasses} style={{ backgroundColor }}>
      <input
        type={isPasswordVisible ? 'text' : 'password'}
        style={{
          backgroundColor,
          color: textColor,
          caretColor: '#00CAFF',
        } as React.CSSProperties}
        value={value}
        onChange={(e) => onChangeText(e.target.value)}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        className={`
          flex-1
          outline-none
          text-sm
          font-[Poppins]
        `}
      />
      <button
        type="button"
        onClick={() => setPasswordVisible(!isPasswordVisible)}
        className="ml-2 p-1 rounded transition-colors hover:bg-opacity-50"
        style={{
          color: isPasswordVisible ? accentColor : iconColor,
        }}
      >
        <EyeIcon visible={isPasswordVisible} color="currentColor" />
      </button>
    </div>
  );
};

export default PasswordField;
