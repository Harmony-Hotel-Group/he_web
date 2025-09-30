import { useI18n } from '@/i18n/useI18n';

export default function TourismCard({ tourism }) {
  const { t } = useI18n();

  return (
    <div className="border rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-200">
      <img
        src={tourism.image.url}
        alt={tourism.image.alt['es']}
        className="w-full h-48 object-cover"
        loading="lazy"
      />

      <div className="p-4">
        <h3 className="text-xl font-bold mb-2">{tourism.name['es']}</h3>
        <p className="text-gray-700 mb-4">
          {tourism.shortDescription['es']}
        </p>

        <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
          <span className="flex items-center">
            📍 {tourism.distance}
          </span>
          <span className="flex items-center">
            ⏱️ {tourism.duration}
          </span>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {tourism.tags.map(tag => (
            <span
              key={tag}
              className="px-2 py-1 bg-hotel-primary text-white text-xs rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>

        <button className="w-full bg-hotel-primary text-white px-4 py-2 rounded hover:bg-hotel-secondary transition-colors">
          {t('common.view')} {t('common.more')}
        </button>
      </div>
    </div>
  );
}