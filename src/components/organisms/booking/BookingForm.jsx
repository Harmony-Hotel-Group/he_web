import { useState } from 'preact/hooks';

export default function BookingForm() {
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState(1);
  const [roomType, setRoomType] = useState('standard');

  const handleSubmit = (e) => {
    e.preventDefault();
    alert(`Reserva simulada:\nCheck-in: ${checkIn}\nCheck-out: ${checkOut}\nHuéspedes: ${guests}\nTipo de habitación: ${roomType}`);
    // Aquí iría la lógica real para enviar la reserva a un backend
  };

  return (
    <form onSubmit={handleSubmit} class="bg-white p-8 rounded-lg shadow-md max-w-md mx-auto mt-8">
      <h2 class="text-2xl font-bold mb-6 text-gray-800">Realizar Reserva</h2>

      <div class="mb-4">
        <label for="check-in" class="block text-gray-700 text-sm font-bold mb-2">Fecha de Entrada:</label>
        <input
          type="date"
          id="check-in"
          class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          value={checkIn}
          onChange={(e) => setCheckIn(e.target.value)}
          required
        />
      </div>

      <div class="mb-4">
        <label for="check-out" class="block text-gray-700 text-sm font-bold mb-2">Fecha de Salida:</label>
        <input
          type="date"
          id="check-out"
          class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          value={checkOut}
          onChange={(e) => setCheckOut(e.target.value)}
          required
        />
      </div>

      <div class="mb-4">
        <label for="guests" class="block text-gray-700 text-sm font-bold mb-2">Número de Huéspedes:</label>
        <input
          type="number"
          id="guests"
          class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          value={guests}
          onChange={(e) => setGuests(parseInt(e.target.value, 10))}
          min="1"
          required
        />
      </div>

      <div class="mb-6">
        <label for="room-type" class="block text-gray-700 text-sm font-bold mb-2">Tipo de Habitación:</label>
        <select
          id="room-type"
          class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          value={roomType}
          onChange={(e) => setRoomType(e.target.value)}
        >
          <option value="standard">Estándar</option>
          <option value="deluxe">Deluxe</option>
          <option value="suite">Suite</option>
        </select>
      </div>

      <div class="flex items-center justify-between">
        <button
          type="submit"
          class="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline transition-colors"
        >
          Confirmar Reserva
        </button>
      </div>
    </form>
  );
}
