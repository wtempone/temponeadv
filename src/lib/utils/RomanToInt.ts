export function romanToInt(roman: string): number {
  const map: Record<string, number> = {
    I: 1,
    V: 5,
    X: 10,
    L: 50,
    C: 100,
    D: 500,
    M: 1000,
  };

  let total = 0;
  let prev = 0;

  for (let i = roman.length - 1; i >= 0; i--) {
    const char = roman[i].toUpperCase();
    const curr = map[char];
    if (!curr) return NaN;
    total += curr < prev ? -curr : curr;
    prev = curr;
  }

  return total;
}
