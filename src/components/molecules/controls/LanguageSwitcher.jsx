import { useEffect, useState } from "preact/hooks";

// Function to get a cookie by name
function getCookie(name) {
	const value = `; ${document.cookie}`;
	const parts = value.split(`; ${name}=`);
	if (parts.length === 2) return parts.pop().split(";").shift();
}

export default function LanguageSwitcher() {
	const [currentLang, setCurrentLang] = useState("es");
	const [isOpen, setIsOpen] = useState(false);

	// Define available languages with their display names and flag paths
	const languages = {
		es: { name: "Español", flag: "src/resources/img/flags/es.svg" }, // Keeping the path as it works for you
		en: { name: "English", flag: "src/resources/img/flags/en.svg" }, // Keeping the path as it works for you
		// Add more languages as needed
	};

	// On the component mount, read the cookie to set the initial state
	useEffect(() => {
		const storedLang = getCookie("lang") || "es";
		setCurrentLang(storedLang);
	}, []);

	const handleLangChange = (newLang) => {
		document.cookie = `lang=${newLang}; path=/; max-age=31536000`;
		window.location.reload(); // Reload the page to apply the new language
	};

	const toggleDropdown = () => {
		setIsOpen(!isOpen);
	};

	// Close dropdown when clicking outside
	useEffect(() => {
		const handleClickOutside = (event) => {
			// Check if the click is outside the component's root div
			if (event.target.closest(".language-switcher-container") === null) {
				setIsOpen(false);
			}
		};
		document.addEventListener("mousedown", handleClickOutside);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, []);

	const selectedLangData = languages[currentLang] || languages["es"]; // Fallback to Spanish if currentLang is invalid

	return (
		<div class="relative language-switcher-container mr-2">
			{" "}
			{/* Added mr-2 for separation */}
			{/* Current language display (button) */}
			<button
				type="button"
				class="flex items-center bg-transparent text-white py-1 px-2 rounded-md cursor-pointer focus:outline-none text-sm"
				onClick={toggleDropdown}
				aria-haspopup="true"
				aria-expanded={isOpen}
			>
				<img
					src={selectedLangData.flag}
					alt={`${selectedLangData.name} flag`}
					class="h-5 w-5"
				/>{" "}
				{/* Only show the flag */}
				{/* Text and arrow are now hidden by default */}
				<span class="hidden">{selectedLangData.name}</span>
				<svg
					class="w-3 h-3 ml-1 hidden"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
					xmlns="http://www.w3.org/2000/svg"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M19 9l-7 7-7-7"
					></path>
				</svg>
			</button>
			{/* Dropdown list */}
			{isOpen && (
				<div class="absolute right-0 mt-2 w-32 bg-gray-700 rounded-md shadow-lg z-20">
					{Object.entries(languages).map(([langCode, data]) => (
						<button
							key={langCode}
							class="flex items-center space-x-2 w-full text-left px-3 py-2 text-sm text-white hover:bg-gray-600"
							onClick={() => handleLangChange(langCode)}
						>
							<img src={data.flag} alt={`${data.name} flag`} class="h-4 w-4" />
							<span>{data.name}</span>
						</button>
					))}
				</div>
			)}
		</div>
	);
}
