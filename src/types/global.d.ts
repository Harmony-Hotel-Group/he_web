// src/types/global.d.ts

interface FlatpickrInstance {
	setDate(dates: Date | Date[], triggerChange?: boolean): void;
	clear(): void;
}

declare global {
	interface HTMLElement {
		_flatpickr?: FlatpickrInstance;
	}

	interface Window {
		showToast(message: string, type: "success" | "error" | "info"): void;
		__visualResourceUtils?: {
			clearCache: () => void;
			getCacheStats: () => { size: number; entries: string[] };
			detectResourceType: (src: string) => string;
			extractYouTubeId: (url: string) => string | null;
			isYouTubeUrl: (url: string) => boolean;
			getYouTubeEmbedUrl: (url: string) => string | null;
		};
		__datePickerSync?: {
			register: (
				pickerId: string,
				pickerInstance: FlatpickrInstance,
				syncGroup?: string,
			) => void;
			sync: (
				sourceId: string,
				value: string,
				dates: Date[],
				syncGroup?: string,
			) => void;
			unregister: (pickerId: string, syncGroup?: string) => void;
			getGroup: (syncGroup?: string) => string[];
			clearGroup: (syncGroup?: string) => void;
		};
	}
}

export {}; // Ensure this is treated as a module
