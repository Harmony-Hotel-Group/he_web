/**
 * src/composables/useSearchInput.ts
 *
 * Composable para manejar la lógica de búsqueda con dropdown.
 * Extraído de SearchInput.astro para mantener átomos presentacionales.
 */

export interface SearchOption {
	value: string;
	label: string;
}

export interface UseSearchInputConfig {
	onSelect?: (option: SearchOption) => void;
}

/**
 * Configura un input de búsqueda con dropdown de sugerencias.
 * @param inputId ID del elemento input
 * @param dropdownId ID del elemento dropdown
 * @param options Opciones disponibles
 * @param config Configuración adicional
 */
export function setupSearchInput(
	inputId: string,
	dropdownId: string,
	options: SearchOption[],
	config: UseSearchInputConfig = {},
) {
	const inputElement = document.getElementById(inputId) as HTMLInputElement | null;
	const dropdownElement = document.getElementById(dropdownId) as HTMLDivElement | null;

	if (!inputElement || !dropdownElement) return;

	let filteredOptions: SearchOption[] = [];

	const renderDropdown = () => {
		dropdownElement.innerHTML = '';
		if (filteredOptions.length === 0 || inputElement.value.trim() === '') {
			dropdownElement.classList.add('hidden');
			return;
		}

		dropdownElement.classList.remove('hidden');
		filteredOptions.forEach((option) => {
			const item = document.createElement('div');
			item.classList.add('px-3', 'py-2', 'text-sm', 'text-primary', 'cursor-pointer', 'hover:bg-accent/20');
			item.textContent = option.label;
			item.addEventListener('click', () => {
				inputElement.value = option.label;
				dropdownElement.classList.add('hidden');
				config.onSelect?.(option);

				// Disparar evento personalizado para que componentes padres reaccionen
				inputElement.dispatchEvent(new CustomEvent('search:select', {
					detail: option,
					bubbles: true,
				}));
			});
			dropdownElement.appendChild(item);
		});
	};

	const filterOptions = (query: string) => {
		const lowerQuery = query.toLowerCase();
		return options.filter((option) =>
			option.label.toLowerCase().includes(lowerQuery)
		);
	};

	inputElement.addEventListener('input', () => {
		filteredOptions = filterOptions(inputElement.value);
		renderDropdown();
	});

	// Cerrar dropdown al hacer clic fuera
	document.addEventListener('click', (event) => {
		if (!inputElement.contains(event.target as Node) && !dropdownElement.contains(event.target as Node)) {
			dropdownElement.classList.add('hidden');
		}
	});

	// Mostrar dropdown al focus si hay contenido o mostrar todas las opciones
	inputElement.addEventListener('focus', () => {
		if (inputElement.value.trim() !== '') {
			filteredOptions = filterOptions(inputElement.value);
		} else {
			filteredOptions = [...options]; // Mostrar todas las opciones en focus
		}
		renderDropdown();
	});
}

/**
 * Inicializa múltiples inputs de búsqueda en la página.
 */
export function initAllSearchInputs(selectors: Array<{ inputId: string; dropdownId: string; options: SearchOption[] }>) {
	selectors.forEach(({ inputId, dropdownId, options }) => {
		setupSearchInput(inputId, dropdownId, options);
	});
}
