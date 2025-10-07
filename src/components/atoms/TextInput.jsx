import { h } from 'preact';
import { useState } from 'preact/hooks';

export default function TextInput({
  label,
  name,
  id = name,
  type = 'text',
  placeholder = '',
  value: initialValue = '',
  required = false,
  disabled = false,
  className,
  labelClass,
  inputClass,
  onChange // Add onChange prop for controlled component
}) {
  const [value, setValue] = useState(initialValue);

  const handleChange = (e) => {
    setValue(e.target.value);
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
      <input
        type={type}
        id={id}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={handleChange}
        required={required}
        disabled={disabled}
        className={`block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm 
          text-primary placeholder-gray-400 focus:outline-none focus:ring-accent focus:border-accent sm:text-sm
          ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}
          ${inputClass || ''}`}
      />
    </div>
  );
}
