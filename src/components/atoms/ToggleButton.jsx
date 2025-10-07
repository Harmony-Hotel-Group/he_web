import { h } from 'preact';
import { useState, useEffect } from 'preact/hooks';

export default function ToggleButton({
  label,
  name,
  value,
  id = `${name}-${value}`,
  checked: initialChecked = false,
  disabled = false,
  className,
  onChange // Add onChange prop for controlled component
}) {
  const [checked, setChecked] = useState(initialChecked);

  // Update internal state if initialChecked prop changes
  useEffect(() => {
    setChecked(initialChecked);
  }, [initialChecked]);

  const handleChange = (e) => {
    if (disabled) return;
    setChecked(e.target.checked);
    if (onChange) {
      onChange(e.target.value, e.target.checked);
    }
  };

  return (
    <div className={`relative inline-block ${className || ''}`}>
      <input 
        type="radio" 
        name={name} 
        id={id} 
        value={value} 
        checked={checked}
        onChange={handleChange}
        disabled={disabled}
        className="absolute opacity-0 w-0 h-0 peer"
      />
      <label
        htmlFor={id}
        className={`inline-block px-4 py-2 border rounded-md cursor-pointer transition-colors duration-200
          text-primary border-gray-300 bg-white
          peer-checked:bg-primary peer-checked:text-background peer-checked:border-primary
          hover:border-accent
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        {label}
      </label>
    </div>
  );
}
