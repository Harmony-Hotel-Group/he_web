import { h } from 'preact';
import { useState } from 'preact/hooks';

export default function BookingDropdown({ label, options }) {
  const [selectedValue, setSelectedValue] = useState(options[0] || '');

  const handleChange = (e) => {
    setSelectedValue(e.target.value);
  };

  return (
    <div class="flex-1 bg-white rounded-lg shadow-md p-2">
      <label for={label.toLowerCase()} class="block text-xs font-medium text-gray-500">{label}</label>
      <select 
        id={label.toLowerCase()} 
        value={selectedValue} 
        onChange={handleChange}
        class="w-full border-none p-1 text-primary focus:ring-0 bg-transparent"
      >
        {options.map(option => (
          <option key={option} value={option}>{option}</option>
        ))}
      </select>
    </div>
  );
}
