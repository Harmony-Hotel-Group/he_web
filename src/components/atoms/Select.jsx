import { h } from 'preact';
import { useState, useEffect } from 'preact/hooks';

export default function Select({
  label,
  name,
  id = name,
  options = [],
  value: initialValue,
  required = false,
  disabled = false,
  className,
  labelClass,
  selectClass,
  onChange
}) {
  const [selectedValue, setSelectedValue] = useState(initialValue);

  // Update internal state if initialValue prop changes
  useEffect(() => {
    setSelectedValue(initialValue);
  }, [initialValue]);

  const handleChange = (e) => {
    setSelectedValue(e.target.value);
    if (onChange) {
      onChange(e.target.value);
    }
  };

  return (
    <div className={`flex flex-col ${className || ''}`}>
      {label && (
        <label htmlFor={id} className={`block text-sm font-medium text-primary mb-1 ${labelClass || ''}`}>
          {label}
          {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <select
        id={id}
        name={name}
        value={selectedValue}
        onChange={handleChange}
        required={required}
        disabled={disabled}
        className={`block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm 
          text-primary focus:outline-none focus:ring-accent focus:border-accent sm:text-sm
          ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}
          ${selectClass || ''}`}
      >
        {options.map(option => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
    </div>
  );
}
