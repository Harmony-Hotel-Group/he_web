import { h } from 'preact';
import { useState, useEffect, useRef } from 'preact/hooks';

export default function SearchInput({
  label,
  name,
  id = name,
  placeholder = '',
  options = [],
  className,
  labelClass,
  inputClass,
  dropdownClass,
  onChange, // Add onChange prop
  onSelect // Add onSelect prop for when an option is chosen
}) {
  const [inputValue, setInputValue] = useState('');
  const [filteredOptions, setFilteredOptions] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (inputRef.current && !inputRef.current.contains(event.target) &&
          dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setInputValue(value);
    if (onChange) {
      onChange(value);
    }

    if (value.trim() === '') {
      setFilteredOptions(options);
    } else {
      const query = value.toLowerCase();
      setFilteredOptions(options.filter(option => 
        option.label.toLowerCase().includes(query)
      ));
    }
    setIsDropdownOpen(true);
  };

  const handleOptionClick = (option) => {
    setInputValue(option.label);
    setIsDropdownOpen(false);
    if (onSelect) {
      onSelect(option.value);
    }
    // Optionally, you might want to trigger a form change event here
  };

  const handleFocus = () => {
    if (inputValue.trim() === '') {
      setFilteredOptions(options);
    } else {
      const query = inputValue.toLowerCase();
      setFilteredOptions(options.filter(option => 
        option.label.toLowerCase().includes(query)
      ));
    }
    setIsDropdownOpen(true);
  };

  return (
    <div className={`flex flex-col relative ${className || ''}`}>
      {label && (
        <label htmlFor={id} className={`block text-sm font-medium text-primary mb-1 ${labelClass || ''}`}>
          {label}
        </label>
      )}
      <input
        ref={inputRef}
        type="text"
        id={id}
        name={name}
        placeholder={placeholder}
        autoComplete="off"
        value={inputValue}
        onChange={handleInputChange}
        onFocus={handleFocus}
        className={`block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm 
          text-primary placeholder-gray-400 focus:outline-none focus:ring-accent focus:border-accent sm:text-sm
          ${inputClass || ''}`}
      />
      {isDropdownOpen && filteredOptions.length > 0 && (
        <div 
          ref={dropdownRef}
          className={`absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-40 
            ${dropdownClass || ''}`}
        >
          {filteredOptions.map(option => (
            <div
              key={option.value}
              onClick={() => handleOptionClick(option)}
              className="px-3 py-2 text-sm text-primary cursor-pointer hover:bg-accent/20"
            >
              {option.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
