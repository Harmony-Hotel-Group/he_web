import { useI18n } from '@/i18n/useI18n';
import { formatCurrency } from '@/lib/utils/currencyUtils';

export default function GastronomyCard({ dish, currency = 'USD' }) {
  const { t } = useI18n();
  const formattedPrice = formatCurrency(dish.price, currency);

  return (
    <div className="border rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-200">
      <img
        src={dish.image.url}
        alt={dish.image.alt['es']}
        className="w-full h-48 object-cover"
        loading="lazy"
      />

      <div className="p-4">
        <h3 className="text-xl font-bold mb-2">{dish.name['es']}</h3>
        <p className="text-gray-700 mb-4">
          {dish.description['es']}
        </p>

        <div className="flex items-center justify-between mb-4">
          <div className="flex flex-wrap gap-2">
            {dish.vegetarian && (
              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                🌱 {t('gastronomy.vegetarian')}
              </span>
            )}
            {dish.spicy && (
              <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                🌶️ {t('gastronomy.spicy')}
              </span>
            )}
          </div>
        </div>

        <div className="mb-4">
          <h4 className="text-sm font-semibold mb-2">{t('gastronomy.ingredients')}:</h4>
          <div className="flex flex-wrap gap-1">
            {dish.ingredients.map(ingredient => (
              <span
                key={ingredient}
                className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
              >
                {ingredient}
              </span>
            ))}
          </div>
        </div>

        <div className="flex justify-between items-center">
          <div className="text-hotel-primary">
            <span className="font-bold text-lg">
              {formattedPrice}
            </span>
          </div>
          <button className="bg-hotel-primary text-white px-4 py-2 rounded hover:bg-hotel-secondary transition-colors">
            {t('gastronomy.order')}
          </button>
        </div>
      </div>
    </div>
  );
}