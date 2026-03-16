import { useEffect, useMemo, useState } from "preact/hooks";

type Room = {
	id: string;
	name: Record<string, string>;
	type: Record<string, string>;
	pricePerNight: number;
	currency: string;
	images: { src: string }[];
	minPersons?: number;
	maxPersons?: number;
};

type AvailabilityPrice = {
	perNight: number;
	total: number;
	label?: string;
	discountPercent?: number;
};

type AvailabilityRoom = {
	id: string;
	name?: string;
	available: number;
	prices: {
		base: AvailabilityPrice;
		withBreakfast: AvailabilityPrice;
		promo?: AvailabilityPrice;
	};
};

type CartItem = {
	id: string;
	name: string;
	price: number;
	qty: number;
};

type Draft = {
	dates?: string;
	adults?: string;
	children?: string;
	rooms?: string;
	breakfast?: boolean;
	vehicle?: boolean;
	special_request?: boolean;
	cart?: CartItem[];
};

const STORAGE_KEY = "bookingDraft";

function normalizeDate(value: string): string {
	return value.replace(/\//g, "-");
}

function parseDateRange(value: string): { checkin: string; checkout: string } | null {
	if (!value || value === "—") return null;
	const match = value.match(
		/(\d{4}[-/]\d{2}[-/]\d{2})\s*➜\s*(\d{4}[-/]\d{2}[-/]\d{2})/,
	);
	if (!match) return null;
	return {
		checkin: normalizeDate(match[1]),
		checkout: normalizeDate(match[2]),
	};
}

function getFieldValue(id: string) {
	const el = document.getElementById(id) as HTMLInputElement | HTMLSelectElement | null;
	if (!el) return "";
	return el.value || "";
}

function setFieldValue(id: string, value: string | undefined) {
	if (value == null) return;
	const el = document.getElementById(id) as HTMLInputElement | HTMLSelectElement | null;
	if (!el) return;
	el.value = value;
}

function getSwitchValue(id: string) {
	const btn = document.querySelector(`button#${id}`);
	return btn?.getAttribute("aria-checked") === "true";
}

function setSwitchValue(id: string, value: boolean | undefined) {
	if (value == null) return;
	const btn = document.querySelector(`button#${id}`) as HTMLButtonElement | null;
	if (!btn) return;
	const isChecked = btn.getAttribute("aria-checked") === "true";
	if (value !== isChecked) btn.click();
}

export default function BookingCart({
	rooms,
	lang,
}: {
	rooms: Room[];
	lang: string;
}) {
	const [cart, setCart] = useState<CartItem[]>([]);
	const [dates, setDates] = useState<string>("—");
	const [adults, setAdults] = useState<string>("—");
	const [children, setChildren] = useState<string>("—");
	const [roomsCount, setRoomsCount] = useState<string>("—");
	const [breakfast, setBreakfast] = useState<boolean>(false);
	const [vehicle, setVehicle] = useState<boolean>(false);
	const [availabilityById, setAvailabilityById] = useState<Record<string, AvailabilityRoom>>({});
	const [availabilityStatus, setAvailabilityStatus] = useState<"idle" | "loading" | "error">(
		"idle",
	);
	const [nights, setNights] = useState<number | null>(null);

	const getEffectivePrice = (roomId: string, fallback: number) => {
		const availability = availabilityById[roomId];
		if (!availability) return fallback;
		const price = breakfast
			? availability.prices.withBreakfast?.perNight
			: availability.prices.base?.perNight;
		return typeof price === "number" ? price : fallback;
	};

	const getPromoPrice = (roomId: string) => {
		const availability = availabilityById[roomId];
		const promo = availability?.prices?.promo;
		if (!promo || typeof promo.perNight !== "number") return null;
		return promo;
	};

	const getRoomsLimit = () => {
		const parsed = Number(roomsCount);
		return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
	};

	const totalRoomsInCart = useMemo(() => {
		return cart.reduce((sum, item) => sum + item.qty, 0);
	}, [cart]);

	const requiredPeople = useMemo(() => {
		const adultsNum = Number(adults);
		const childrenNum = Number(children);
		const safeAdults = Number.isFinite(adultsNum) ? adultsNum : 0;
		const safeChildren = Number.isFinite(childrenNum) ? childrenNum : 0;
		return safeAdults + safeChildren / 2;
	}, [adults, children]);

	const selectedCapacity = useMemo(() => {
		return cart.reduce((sum, item) => {
			const room = rooms.find((r) => r.id === item.id);
			const maxPersons = room?.maxPersons ?? room?.minPersons ?? 0;
			return sum + maxPersons * item.qty;
		}, 0);
	}, [cart, rooms]);

	const total = useMemo(() => {
		if (!nights || nights <= 0) return 0;
		return cart.reduce((sum, item) => sum + item.price * item.qty * nights, 0);
	}, [cart, nights]);

	const addRoom = (room: Room) => {
		if (!nights || availabilityStatus !== "idle") return;

		const limit = getRoomsLimit();
		if (limit && totalRoomsInCart >= limit) return;

		const availability = availabilityById[room.id];
		const available = availability?.available ?? null;
		const existingQty = cart.find((item) => item.id === room.id)?.qty ?? 0;
		if (available !== null && existingQty >= available) return;

		const unitPrice = getEffectivePrice(room.id, room.pricePerNight);
		setCart((prev) => {
			const existing = prev.find((item) => item.id === room.id);
			if (existing) {
				return prev.map((item) =>
					item.id === room.id ? { ...item, qty: item.qty + 1 } : item,
				);
			}
			return [
				...prev,
				{
					id: room.id,
					name: room.name[lang] || room.id,
					price: unitPrice,
					qty: 1,
				},
			];
		});
	};

	const removeRoom = (room: Room) => {
		setCart((prev) => {
			const existing = prev.find((item) => item.id === room.id);
			if (!existing) return prev;
			if (existing.qty <= 1) return prev.filter((item) => item.id !== room.id);
			return prev.map((item) =>
				item.id === room.id ? { ...item, qty: item.qty - 1 } : item,
			);
		});
	};

	useEffect(() => {
		try {
			const raw = localStorage.getItem(STORAGE_KEY);
			if (!raw) return;
			const draft = JSON.parse(raw) as Draft;
			if (draft.cart) setCart(draft.cart);
			if (draft.dates) {
				setDates(draft.dates);
				setFieldValue("dateRange", draft.dates);
				setFieldValue("dateRangeGroup", draft.dates);
			}
			if (draft.adults) {
				setAdults(draft.adults);
				setFieldValue("adults", draft.adults);
				setFieldValue("groupAdults", draft.adults);
			}
			if (draft.children) {
				setChildren(draft.children);
				setFieldValue("children", draft.children);
			}
			if (draft.rooms) {
				setRoomsCount(draft.rooms);
				setFieldValue("rooms", draft.rooms);
			}
			setBreakfast(Boolean(draft.breakfast));
			setVehicle(Boolean(draft.vehicle));
			setSwitchValue("breakfast", Boolean(draft.breakfast));
			setSwitchValue("vehicle", Boolean(draft.vehicle));
			setSwitchValue("special_request", Boolean(draft.special_request));
		} catch {
			// ignore
		}
	}, []);

	useEffect(() => {
		const params = new URLSearchParams(window.location.search);
		const preRoom = params.get("room");
		const datesParam = params.get("dates") || undefined;
		const adultsParam = params.get("adults") || undefined;
		const childrenParam = params.get("children") || undefined;
		const roomsParam = params.get("rooms") || undefined;
		const breakfastParam = params.get("breakfast");
		const vehicleParam = params.get("vehicle");
		const specialParam = params.get("special_request");

		if (datesParam) {
			setDates(datesParam);
			setFieldValue("dateRange", datesParam);
			setFieldValue("dateRangeGroup", datesParam);
		}
		if (adultsParam) {
			setAdults(adultsParam);
			setFieldValue("adults", adultsParam);
			setFieldValue("groupAdults", adultsParam);
		}
		if (childrenParam) {
			setChildren(childrenParam);
			setFieldValue("children", childrenParam);
		}
		if (roomsParam) {
			setRoomsCount(roomsParam);
			setFieldValue("rooms", roomsParam);
		}
		if (breakfastParam) setSwitchValue("breakfast", ["true", "1", "yes"].includes(breakfastParam));
		if (vehicleParam) setSwitchValue("vehicle", ["true", "1", "yes"].includes(vehicleParam));
		if (specialParam) setSwitchValue("special_request", ["true", "1", "yes"].includes(specialParam));

		if (preRoom) {
			const room = rooms.find((r) => r.id === preRoom);
			if (room) addRoom(room);
		}
	}, [rooms]);

	useEffect(() => {
		const onChange = () => {
			const currentDates =
				getFieldValue("dateRange") || getFieldValue("dateRangeGroup") || "—";
			const currentAdults = getFieldValue("adults") || getFieldValue("groupAdults") || "—";
			const currentChildren = getFieldValue("children") || "—";
			const currentRooms = getFieldValue("rooms") || "—";
			const currentBreakfast = getSwitchValue("breakfast");
			const currentVehicle = getSwitchValue("vehicle");
			setDates(currentDates);
			setAdults(currentAdults);
			setChildren(currentChildren);
			setRoomsCount(currentRooms);
			setBreakfast(currentBreakfast);
			setVehicle(currentVehicle);
		};

		const form = document.getElementById("booking-form");
		form?.addEventListener("change", onChange);
		onChange();
		return () => form?.removeEventListener("change", onChange);
	}, []);

	useEffect(() => {
		const parsed = parseDateRange(dates);
		if (!parsed) {
			setAvailabilityById({});
			setNights(null);
			return;
		}

		const controller = new AbortController();
		setAvailabilityStatus("loading");

		fetch(
			`/api/availability?checkin=${encodeURIComponent(parsed.checkin)}&checkout=${encodeURIComponent(parsed.checkout)}`,
			{ signal: controller.signal },
		)
			.then(async (res) => {
				if (!res.ok) {
					throw new Error(`Availability ${res.status}`);
				}
				return res.json();
			})
			.then((payload) => {
				const data = (payload?.data ?? payload) as {
					rooms?: AvailabilityRoom[];
					nights?: number;
				} | null;
				const list = Array.isArray(data?.rooms) ? data.rooms : [];
				const map = list.reduce<Record<string, AvailabilityRoom>>((acc, item) => {
					acc[String(item.id)] = item;
					return acc;
				}, {});
				setAvailabilityById(map);
				setNights(typeof data?.nights === "number" ? data.nights : null);
				setAvailabilityStatus("idle");
			})
			.catch((error) => {
				if (error?.name === "AbortError") return;
				setAvailabilityStatus("error");
				setNights(null);
			});

		return () => controller.abort();
	}, [dates]);

	useEffect(() => {
		setCart((prev) =>
			prev.map((item) => {
				const room = rooms.find((r) => r.id === item.id);
				if (!room) return item;
				const price = getEffectivePrice(room.id, room.pricePerNight);
				if (price === item.price) return item;
				return { ...item, price };
			}),
		);
	}, [availabilityById, breakfast, rooms]);

	useEffect(() => {
		if (availabilityStatus !== "idle") return;
		if (!nights) return;
		setCart((prev) =>
			prev
				.map((item) => {
					const available = availabilityById[item.id]?.available;
					if (typeof available !== "number") return item;
					if (available <= 0) return null;
					if (item.qty > available) return { ...item, qty: available };
					return item;
				})
				.filter(Boolean) as CartItem[],
		);
	}, [availabilityById, availabilityStatus, nights]);

	useEffect(() => {
		const draft: Draft = {
			dates: dates !== "—" ? dates : undefined,
			adults: adults !== "—" ? adults : undefined,
			children: children !== "—" ? children : undefined,
			rooms: roomsCount !== "—" ? roomsCount : undefined,
			breakfast,
			vehicle,
			special_request: getSwitchValue("special_request"),
			cart,
		};
		localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
	}, [dates, adults, children, roomsCount, breakfast, vehicle, cart]);

	return (
		<div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
			<div class="lg:col-span-2 bg-white shadow-lg rounded-xl p-6 md:p-8 border border-gray-100">
				<h2 class="text-xl font-semibold text-primary mb-4">
					{lang === "es" ? "Selecciona habitaciones" : "Select rooms"}
				</h2>
				{!nights && (
					<p class="text-sm text-gray-400 mb-4">
						{lang === "es"
							? "Selecciona fechas para ver precios y disponibilidad."
							: "Select dates to see prices and availability."}
					</p>
				)}
				{availabilityStatus === "loading" && (
					<p class="text-sm text-gray-400 mb-4">
						{lang === "es" ? "Consultando disponibilidad..." : "Checking availability..."}
					</p>
				)}
				{availabilityStatus === "error" && (
					<p class="text-sm text-red-500 mb-4">
						{lang === "es" ? "No se pudo obtener disponibilidad." : "Availability not available."}
					</p>
				)}
				<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
					{rooms
						.filter((room) => {
							if (!nights) return true;
							if (availabilityStatus !== "idle") return true;
							const availability = availabilityById[room.id];
							if (!availability) return false;
							return availability.available > 0;
						})
						.map((room) => (
						<div
							class="border border-gray-200 rounded-lg p-4 flex gap-4 items-center"
							key={room.id}
						>
							{(() => {
								const availability = availabilityById[room.id];
								const available = availability?.available ?? null;
								const price = getEffectivePrice(room.id, room.pricePerNight);
								const promo = getPromoPrice(room.id);
								const isSoldOut = available !== null && available <= 0;
								const limit = getRoomsLimit();
								const canAddMore = !limit || totalRoomsInCart < limit;
								const roomQty = cart.find((item) => item.id === room.id)?.qty ?? 0;
								const hasRoomAvailability =
									available === null || roomQty < available;
								const roomMax = room.maxPersons ?? room.minPersons ?? null;
								const projectedCapacity =
									roomMax && requiredPeople > 0 ? selectedCapacity + roomMax : null;
								const withinCapacity =
									projectedCapacity === null || projectedCapacity <= requiredPeople;
								const canSelect =
									nights &&
									availabilityStatus === "idle" &&
									canAddMore &&
									hasRoomAvailability &&
									withinCapacity &&
									!isSoldOut;
								return (
									<>
										<div class="min-w-[64px] h-[64px] rounded-md bg-gray-100 overflow-hidden">
											<img
												src={room.images[0]?.src}
												alt={room.name[lang]}
												class="w-full h-full object-cover"
											/>
										</div>
										<div class="flex-1">
											<p class="text-sm text-gray-500">{room.type[lang]}</p>
											<p class="font-semibold text-primary">{room.name[lang]}</p>
											<p class="text-sm text-gray-600">
												${price} / {lang === "es" ? "noche" : "night"}
											</p>
											{promo && (
												<p class="text-xs text-emerald-600">
													{lang === "es" ? "Promo" : "Promo"}: ${promo.perNight}
												</p>
											)}
											{available !== null && (
												<p class={`text-xs ${isSoldOut ? "text-red-500" : "text-gray-400"}`}>
													{lang === "es"
														? `Disponibles: ${available}`
														: `Available: ${available}`}
												</p>
											)}
											{limit && (
												<p class="text-xs text-gray-400">
													{lang === "es"
														? `Seleccionadas: ${totalRoomsInCart} / ${limit}`
														: `Selected: ${totalRoomsInCart} / ${limit}`}
												</p>
											)}
											{roomMax && (
												<p class="text-xs text-gray-400">
													{lang === "es"
														? `Capacidad máx: ${roomMax}`
														: `Max capacity: ${roomMax}`}
												</p>
											)}
										</div>
										<div class="flex flex-col items-center gap-2">
											<button
												type="button"
												class={`text-xs px-3 py-2 rounded-md transition ${
													!canSelect
														? "bg-gray-200 text-gray-400 cursor-not-allowed"
														: "bg-primary text-white hover:bg-accent"
												}`}
												onClick={() => addRoom(room)}
												disabled={!canSelect}
											>
												{lang === "es" ? "Agregar" : "Add"}
											</button>
											<button
												type="button"
												class="text-xs text-gray-500 hover:text-red-500"
												onClick={() => removeRoom(room)}
											>
												{lang === "es" ? "Quitar" : "Remove"}
											</button>
										</div>
									</>
								);
							})()}
						</div>
					))}
				</div>
			</div>
			<aside class="lg:col-span-1">
				<div class="bg-white border border-gray-200 rounded-xl p-6 sticky top-24">
					<h2 class="text-lg font-semibold text-primary mb-4">
						{lang === "es" ? "Resumen de reserva" : "Booking summary"}
					</h2>
					<ul class="space-y-3 text-sm text-gray-600">
						<li class="flex items-center justify-between">
							<span>{lang === "es" ? "Fechas" : "Dates"}</span>
							<span class="text-gray-400">{dates}</span>
						</li>
						<li class="flex items-center justify-between">
							<span>{lang === "es" ? "Adultos" : "Adults"}</span>
							<span class="text-gray-400">{adults}</span>
						</li>
						<li class="flex items-center justify-between">
							<span>{lang === "es" ? "Niños" : "Children"}</span>
							<span class="text-gray-400">{children}</span>
						</li>
						<li class="flex items-center justify-between">
							<span>{lang === "es" ? "Habitaciones" : "Rooms"}</span>
							<span class="text-gray-400">{roomsCount}</span>
						</li>
						<li class="flex items-center justify-between">
							<span>{lang === "es" ? "Desayuno" : "Breakfast"}</span>
							<span class="text-gray-400">{breakfast ? "Sí" : "No"}</span>
						</li>
						<li class="flex items-center justify-between">
							<span>{lang === "es" ? "Vehículo" : "Vehicle"}</span>
							<span class="text-gray-400">{vehicle ? "Sí" : "No"}</span>
						</li>
						<li class="flex items-center justify-between">
							<span>{lang === "es" ? "Capacidad" : "Capacity"}</span>
							<span class="text-gray-400">
								{requiredPeople > 0 ? `${selectedCapacity} / ${requiredPeople}` : "—"}
							</span>
						</li>
						<li class="flex items-center justify-between">
							<span>{lang === "es" ? "Noches" : "Nights"}</span>
							<span class="text-gray-400">{nights ?? "—"}</span>
						</li>
					</ul>
					<div class="mt-6">
						<h3 class="text-sm font-semibold text-gray-700 mb-2">
							{lang === "es" ? "Carrito" : "Cart"}
						</h3>
						<ul class="space-y-2 text-sm text-gray-600">
							{cart.length === 0 ? (
								<li class="text-gray-400">—</li>
							) : (
								cart.map((item) => (
									<li
										key={item.id}
										class="flex items-center justify-between"
									>
										<span>
											{item.name} x{item.qty}
										</span>
										<span>${item.price * item.qty * (nights ?? 1)}</span>
									</li>
								))
							)}
						</ul>
					</div>
					<div class="mt-6 border-t border-gray-100 pt-4">
						<div class="flex items-center justify-between text-sm">
							<span class="text-gray-500">
								{lang === "es" ? "Total estimado" : "Estimated total"}
							</span>
							<span class="text-gray-900 font-semibold">
								{total > 0 ? `$${total}` : "—"}
							</span>
						</div>
						<p class="text-xs text-gray-400 mt-2">
							{lang === "es"
								? "El total se confirmará con un asesor."
								: "Total will be confirmed with an advisor."}
						</p>
					</div>
				</div>
			</aside>
		</div>
	);
}
