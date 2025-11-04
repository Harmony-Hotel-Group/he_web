// src/utils/date-picker-sync.ts
/**
 * Sistema de sincronización para DatePickers
 * Mantiene múltiples date pickers sincronizados entre formularios
 **/

interface DatePickerSyncEvent {
	sourceId: string;
	value: string;
	dates: Date[];
}

class DatePickerSyncManager {
	private pickers: Map<string, any> = new Map();
	private syncGroups: Map<string, Set<string>> = new Map();

	/**
	 * Registra un date picker en un grupo de sincronización
	 */
	public register(
		pickerId: string,
		pickerInstance: any,
		syncGroup: string = "default",
	) {
		this.pickers.set(pickerId, pickerInstance);

		if (!this.syncGroups.has(syncGroup)) {
			this.syncGroups.set(syncGroup, new Set());
		}

		this.syncGroups.get(syncGroup)!.add(pickerId);

		if (import.meta.env.DEV) {
			console.log(
				`[DatePickerSync] Registered: ${pickerId} in group: ${syncGroup}`,
			);
		}
	}

	/**
	 * Sincroniza un cambio de fecha a todos los pickers del mismo grupo
	 */
	public sync(
		sourceId: string,
		value: string,
		dates: Date[],
		syncGroup: string = "default",
	) {
		const group = this.syncGroups.get(syncGroup);
		if (!group) return;

		group.forEach((pickerId) => {
			// No sincronizar consigo mismo
			if (pickerId === sourceId) return;

			const picker = this.pickers.get(pickerId);
			if (!picker) return;

			// Actualizar el picker
			try {
				picker.setDate(dates, false); // false = no trigger onChange

				// Actualizar el input manualmente
				const input = document.getElementById(pickerId) as HTMLInputElement;
				if (input) {
					input.value = value;
					input.title = value;
				}

				if (import.meta.env.DEV) {
					console.log(`[DatePickerSync] Synced ${sourceId} → ${pickerId}`);
				}
			} catch (error) {
				console.error(`[DatePickerSync] Error syncing ${pickerId}:`, error);
			}
		});
	}

	/**
	 * Desregistra un picker
	 */
	public unregister(pickerId: string, syncGroup: string = "default") {
		this.pickers.delete(pickerId);
		this.syncGroups.get(syncGroup)?.delete(pickerId);

		if (import.meta.env.DEV) {
			console.log(`[DatePickerSync] Unregistered: ${pickerId}`);
		}
	}

	/**
	 * Obtiene todos los pickers de un grupo
	 */
	public getGroup(syncGroup: string = "default"): string[] {
		return Array.from(this.syncGroups.get(syncGroup) || []);
	}

	/**
	 * Limpia todos los pickers de un grupo
	 */
	public clearGroup(syncGroup: string = "default") {
		const group = this.syncGroups.get(syncGroup);
		if (!group) return;

		group.forEach((pickerId) => {
			const picker = this.pickers.get(pickerId);
			if (picker) {
				picker.clear();
			}
		});

		if (import.meta.env.DEV) {
			console.log(`[DatePickerSync] Cleared group: ${syncGroup}`);
		}
	}
}

// Instancia global
export const datePickerSync = new DatePickerSyncManager();

// Exponer en window para debugging
if (typeof window !== "undefined") {
	(window as any).__datePickerSync = datePickerSync;
}
