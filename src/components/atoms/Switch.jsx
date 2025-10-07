import { h } from 'preact';
import { useState, useEffect } from 'preact/hooks';

export default function Switch({
  name,
  id = name,
  checked: initialChecked = false,
  disabled = false,
  className,
  srLabel = 'Switch', // Default screen-reader text
  onChange // Add onChange prop for controlled component
}) {
  const [checked, setChecked] = useState(initialChecked);

  // Update internal state if initialChecked prop changes
  useEffect(() => {
    setChecked(initialChecked);
  }, [initialChecked]);

  const handleClick = () => {
    if (disabled) return;
    const newState = !checked;
    setChecked(newState);
    if (onChange) {
      onChange(newState.toString()); // Pass string 'true' or 'false' to match form data
    }
  };

  return (
    <div className={`relative inline-block ${className || ''}`}>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        id={id}
        data-name={name}
        onClick={handleClick}
        className={`relative inline-flex items-center h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out
          focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2
          ${checked ? 'bg-accent' : 'bg-gray-200'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        disabled={disabled}
      >
        <span className="sr-only">{srLabel}</span>
        <span
          aria-hidden="true"
          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out
            ${checked ? 'translate-x-5' : 'translate-x-0'}`}
        />
      </button>
      {/* Hidden input to submit the value with the form */}
      <input type="hidden" name={name} value={checked.toString()} />
    </div>
  );
}
