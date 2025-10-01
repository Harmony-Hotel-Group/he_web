import { useState, useEffect } from 'preact/hooks';

// Function to get a cookie by name
function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
}

export default function CurrencySwitcher() {
  const [currentCurrency, setCurrentCurrency] = useState('USD');
  const [isOpen, setIsOpen] = useState(false);

  // Define available currencies with their symbols, codes, and image paths
  const currencies = {
    USD: { symbol: '$', code: 'USD', image: 'src/resources/img/currents/usd.svg' }, // Keeping the path as it works for you
    EUR: { symbol: '€', code: 'EUR', image: 'src/resources/img/currents/eur.svg' }, // Keeping the path as it works for you
    GBP: { symbol: '£', code: 'GBP', image: 'src/resources/img/currents/gbp.svg' }, // Keeping the path as it works for you
    // Add more currencies as needed
  };

  // On component mount, read the cookie to set the initial state
  useEffect(() => {
    const storedCurrency = getCookie('currency') || 'USD';
    setCurrentCurrency(storedCurrency);
  }, []);

  const handleCurrencyChange = (newCurrency) => {
    document.cookie = `currency=${newCurrency}; path=/; max-age=31536000`;
    window.location.reload(); // Reload the page to apply the new currency
  };

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Check if the click is outside the component's root div
      if (event.target.closest('.currency-switcher-container') === null) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const selectedCurrencyData = currencies[currentCurrency] || currencies['USD']; // Fallback to USD if currentCurrency is invalid

  return (
    <div class="relative currency-switcher-container">
      {/* Current currency display (button) */}
      <button
        type="button"
        class="flex items-center space-x-1 bg-transparent text-white py-1 px-2 rounded-md cursor-pointer focus:outline-none text-sm"
        onClick={toggleDropdown}
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <img src={selectedCurrencyData.image} alt={`${selectedCurrencyData.code} symbol`} class="h-4 w-4" />
        <span>{selectedCurrencyData.code}</span>
        {/* Optional: Add a dropdown arrow icon */}
        <svg class="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
      </button>

      {/* Dropdown list */}
      {isOpen && (
        <div class="absolute right-0 mt-2 w-24 bg-gray-700 rounded-md shadow-lg z-20">
          {Object.entries(currencies).map(([currencyCode, data]) => (
            <button
              key={currencyCode}
              class="flex items-center space-x-1 w-full text-left px-3 py-2 text-sm text-white hover:bg-gray-600"
              onClick={() => handleCurrencyChange(currencyCode)}
            >
              <img src={data.image} alt={`${data.code} symbol`} class="h-4 w-4" /> {/* Changed w-auto to w-4 */}
              <span>{data.code}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
