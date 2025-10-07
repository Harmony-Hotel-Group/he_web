import { h } from 'preact';
import { useState, useEffect } from 'preact/hooks';

export default function Checkbox({
  label,
  name,
  id = name,
  checked: initialChecked = false,
  disabled = false,
  className,
  labelClass,
  inputClass,
  onChange // Add onChange prop for controlled component
}) {
  const [checked, setChecked] = useState(initialChecked);

  // Update internal state if initialChecked prop changes
  useEffect(() => {
    setChecked(initialChecked);
  }, [initialChecked]);

  const handleChange = (e) => {
    setChecked(e.target.checked);
    if (onChange) {
      onChange(e.target.checked);
    }
  };

  return (
    <div className={`flex items-center ${className || ''}`}>
      <input
        type="checkbox"
        id={id}
        name={name}
        checked={checked}
        onChange={handleChange}
        disabled={disabled}
        className={`h-4 w-4 text-accent border-gray-300 rounded focus:ring-accent
          ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}
          ${inputClass || ''}`}
      />
      <label htmlFor={id} className={`ml-2 block text-sm text-primary ${labelClass || ''}`}>
        {label}
      </label>
    </div>
  );
}
