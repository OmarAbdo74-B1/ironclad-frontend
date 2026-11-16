const ALLOWED_IMAGE_HOST = 'images.unsplash.com';
const FALLBACK_IMAGE = '/placeholder.svg';

export function formatPrice(usd) {
  if (typeof usd !== 'number' || !Number.isFinite(usd)) {
    return 'Price on request';
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(usd);
}

export function formatSpecs(car) {
  const parts = [];
  if (Number.isFinite(car.horsepower)) parts.push(`${car.horsepower} HP`);
  if (Number.isFinite(car.topSpeedKmh)) parts.push(`${car.topSpeedKmh} km/h`);
  return parts.join(' · ');
}

export function safeImageUrl(url) {
  try {
    const parsed = new URL(url);
    if (parsed.protocol === 'https:' && parsed.hostname === ALLOWED_IMAGE_HOST) {
      return parsed.toString();
    }
  } catch {
    return FALLBACK_IMAGE;
  }
  return FALLBACK_IMAGE;
}

export function environmentLabel(env) {
  const known = { dev: 'Development', staging: 'Staging', prod: 'Production' };
  return known[env] || 'Local';
}

export function categories(cars) {
  return [...new Set(cars.map((c) => c.category))].sort((a, b) => a.localeCompare(b));
}
