export function normalizeSearchText(value: string) {
  return value.toLowerCase().replaceAll('ё', 'е').replaceAll('-', ' ');
}
