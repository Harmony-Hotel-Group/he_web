import { h } from 'preact';
import { useState } from 'preact/hooks';

export default function BookingSwitch({ label }) {
  const [isEnabled, setIsEnabled] = useState(false);

  const toggleSwitch = () => {
    setIsEnabled(!isEnabled);
  };

  return (
    <div class="flex items-center justify-between bg-white rounded-lg shadow-md p-3">
      <span class="text-sm font-medium text-primary">{label}</span>
      <button
        type="button"
        onClick={toggleSwitch}
        class={`${isEnabled ? 'bg-accent' : 'bg-gray-200'} relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2`}
      >
        <span
          class={`${isEnabled ? 'translate-x-6' : 'translate-x-1'} inline-block w-4 h-4 transform bg-white rounded-full transition-transform`}
        />
      </button>
    </div>
  );
}
