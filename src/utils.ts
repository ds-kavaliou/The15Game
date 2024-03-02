export function createElementsFromString(html: string) {
  const parser = new DOMParser();
  const document = parser.parseFromString(html, "text/html");
  return [...document.body.children];
}

export function createStringFromList<T>(
  array: T[],
  map: (item: T, i: number) => string
) {
  return array.reduce((acc, value, i) => acc + map(value, i), "");
}

export function createMatrix<T>(
  size: number,
  map: (size: number, x: number, y: number) => T
) {
  return Array.from({ length: size }, (_, i) =>
    Array.from({ length: size }, (_, j) => map(size, i, j))
  );
}

export function random(n: number) {
  return Math.floor(Math.random() * n);
}

export function observable<T extends object>(obj: T) {
  const listeners = new Map<keyof T, Array<(data: any) => void>>();
  const dispatch = Symbol();

  return new Proxy(
    {
      ...obj,
      listen(property: keyof T, fn: (data: any) => void) {
        listeners.set(property, [...(listeners.get(property) ?? []), fn]);
      },
      [dispatch](property: keyof T, value: T[keyof T]) {
        const watchers = listeners.get(property) ?? [];
        watchers.forEach((fn) =>
          Promise.resolve().then(() => fn({ [property]: value }))
        );
      },
    },
    {
      set(target, property, value) {
        if (target[property] !== value) {
          target[property] = value;
          target[dispatch](property, value);
        }
        return true;
      },
    }
  );
}

export function toTimeString(n: number) {
  return (
    ((n / 60) | 0).toString().padStart(2, "0") +
    ":" +
    (n % 60).toString().padStart(2, "0")
  );
}
