// lib/format.ts

export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // retire caractères spéciaux
    .replace(/\s+/g, '-') // remplace espaces par tirets
}

export function capitalizeProductName(name: string): string {
  if (!name) return ''
  return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase()
}
