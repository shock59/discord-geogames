export function randomFromArray<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)]!;
}

export function multipleRandomFromArray<T>(
  array: T[],
  count: number,
  unique: boolean
) {
  if (unique && array.length < count) {
    throw Error("Array contains fewer items than count");
  }

  let items: T[] = [];
  while (items.length < count) {
    const newItem = randomFromArray(array);
    if (unique && items.includes(newItem)) continue;
    items.push(newItem);
  }

  return items;
}

export function shuffleArray<T>(array: T[]) {
  if (array.length < 2) {
    return array;
  }

  let newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j]!, newArray[i]!];
  }
  return newArray;
}
