export function parseSort(input: string, toSnake = false): Array<Record<string, 'asc' | 'desc'>> | undefined {
  if (!input?.trim()) return undefined;

  const tokens = input
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  const toSnakeCase = (s: string) => (toSnake ? s.replace(/([A-Z])/g, '_$1').toLowerCase() : s);

  return tokens.map((t) => {
    const desc = t.startsWith('-');
    const col = toSnakeCase(desc ? t.slice(1) : t);
    return { [col]: desc ? 'desc' : 'asc' } as Record<string, 'asc' | 'desc'>;
  });
}
