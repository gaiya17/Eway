import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

interface CustomDropdownProps {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
  label?: React.ReactNode;
  className?: string;
}

export function CustomDropdown({
  value,
  onChange,
  options,
  placeholder = 'Select an option...',
  label,
  className = '',
}: CustomDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const selectedOption = options.find((opt) => opt.value === value);
  const displayText = selectedOption ? selectedOption.label : placeholder;

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  return (
    <div className={className}>
      {label && (
        <label className="block text-white/60 text-sm mb-2">{label}</label>
      )}

      <div className="relative" ref={dropdownRef}>
        {/* Dropdown Trigger */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white flex items-center justify-between hover:border-white/20 focus:outline-none focus:border-blue-500/50 transition-all"
        >
          <span className={value ? 'text-white' : 'text-white/40'}>
            {displayText}
          </span>
          <ChevronDown
            size={20}
            className={`text-white/40 transition-transform duration-200 ${
              isOpen ? 'rotate-180' : ''
            }`}
          />
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
          <div
            className="absolute z-50 w-full mt-2 rounded-xl bg-[#0f172a] border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.4)] backdrop-blur-xl overflow-hidden"
            style={{
              maxHeight: '240px',
              overflowY: 'auto',
            }}
          >
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleSelect(option.value)}
                className={`w-full px-4 py-3 text-left transition-all ${
                  option.value === value
                    ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold'
                    : 'text-white/70 hover:bg-gradient-to-r hover:from-blue-500/80 hover:to-cyan-500/80 hover:text-white'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
