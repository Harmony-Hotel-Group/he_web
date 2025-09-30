export const truncate = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) {
    return text;
  }
  return text.slice(0, maxLength).trim() + '...';
};

export const capitalize = (text: string): string => {
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};

export const slugify = (text: string): string => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

export const formatPhoneNumber = (phone: string): string => {
  // Remove all non-numeric characters
  const cleaned = phone.replace(/\D/g, '');

  // Format based on length (assuming international format)
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  } else if (cleaned.length === 11 && cleaned.startsWith('1')) {
    return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
  } else if (cleaned.length === 12 && cleaned.startsWith('593')) {
    return `+593 ${cleaned.slice(3, 5)} ${cleaned.slice(5, 8)}-${cleaned.slice(8)}`;
  }

  return phone; // Return original if format doesn't match
};

export const removeAccents = (text: string): string => {
  return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
};

export const formatDate = (date: Date | string, locale: string = 'es'): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;

  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(dateObj);
};

export const formatDateTime = (date: Date | string, locale: string = 'es'): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;

  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(dateObj);
};