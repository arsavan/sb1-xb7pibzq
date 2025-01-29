export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^a-z0-9]+/g, '-')     // Replace non-alphanumeric characters with hyphens
    .replace(/(^-|-$)+/g, '')        // Remove leading/trailing hyphens
    .substring(0, 100);              // Limit length for URLs
}

export function generateProductUrl(id: string, name: string): string {
  return `/product/${id}/${slugify(name)}`;
}

export function extractIdFromPath(path: string): string {
  const matches = path.match(/\/product\/([^/]+)/);
  return matches ? matches[1] : '';
}

export function generateMetaDescription(text: string, maxLength: number = 160): string {
  return text.length > maxLength
    ? text.substring(0, maxLength - 3) + '...'
    : text;
}

export function generateMetaKeywords(tags: string[]): string {
  return tags
    .slice(0, 10) // Limit to 10 keywords
    .join(', ');
}