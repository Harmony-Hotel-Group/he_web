import { useI18n } from '@/i18n/useI18n';
import { convertCurrency, formatCurrency } from '@/lib/utils/currencyUtils';
import { truncate } from '@/lib/utils/stringUtils';

export default function RoomCard({ room, currency = 'USD' }) {
  const { t } = useI18n();
  const price = convertCurrency(room.price, currency);
  const formattedPrice = formatCurrency(price, currency);

  return (
    <div className="border rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-200">
      <img
        src={room.mainImage.url}
        alt={room.mainImage.alt['es']} // Default to Spanish, should be dynamic based on current language
        className="w-full h-48 object-cover"
        loading="lazy"
      />

      <div className="p-4">
        <h3 className="text-xl font-bold mb-2">{room.name['es']}</h3>
        <p className="text-gray-700 mb-4">
          {truncate(room.shortDescription['es'], 150)}
        </p>

        <div className="flex items-center mb-4">
          <div className="flex text-yellow-400">
            {[...Array(5)].map((_, i) => (
              <span key={i}>
                {i < Math.floor(room.rating) ? '★' : '☆'}
              </span>
            ))}
          </div>
          <span className="ml-2 text-sm text-gray-600">
            {room.rating.toFixed(1)}
          </span>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {room.amenities.map(amenity => (
            <div key={amenity.id} className="flex items-center">
              <img
                src={amenity.svgPath}
                alt={amenity.name['es']}
                className="w-5 h-5 mr-1"
              />
              <span className="text-sm text-gray-600">
                {amenity.name['es']}
              </span>
            </div>
          ))}
        </div>

        <div className="flex justify-between items-center">
          <div className="text-hotel-primary">
            <span className="font-bold text-lg">
              {formattedPrice}
            </span>
            <span className="text-sm font-normal">/noche</span>
          </div>
          <button className="bg-hotel-primary text-white px-4 py-2 rounded hover:bg-hotel-secondary transition-colors">
            {t('reservations.viewMore')}
          </button>
        </div>
      </div>
    </div>
  );
}