import { createMatrix, createStringFromList, random } from "./utils";

export type Direction = typeof RIGHT | typeof LEFT | typeof UP | typeof DOWN;

type Position = [number, number];

export const RIGHT = [-1, 0] as const;
export const LEFT = [1, 0] as const;
export const UP = [0, 1] as const;
export const DOWN = [0, -1] as const;

class Tile {
  public index: number;
  public empty: boolean;
  public name: number;

  constructor(index: number, name: number, empty: boolean) {
    this.index = index;
    this.name = name;
    this.empty = empty;
  }
}

export class Board {
  #matrix: Tile[][] = [];
  #empty: Position = [0, 0];

  public get matrix() {
    return this.#matrix;
  }

  public create(size: number = 4, fn: ({ hash }: { hash: string }) => void) {
    this.#matrix = createMatrix<Tile>(
      size,
      (size, x, y) =>
        new Tile(size * x + y, size * x + y + 1, size ** 2 === size * x + y + 1)
    );

    this.#empty = [size - 1, size - 1];

    fn({ hash: this.#getMatrixHash() });
  }

  public shuffle(n: number = 200) {
    const directions = [UP, DOWN, RIGHT, LEFT];

    while (n > 0) {
      const direction = directions[random(directions.length)];
      const possition = [
        this.#empty[0] + direction[0],
        this.#empty[1] + direction[1],
      ] as Position;

      if (this.#possible(possition)) {
        this.#swap(this.#empty, possition);
        this.#empty = possition;
        n--;
      }
    }
  }

  public move(
    [dx, dy]: Direction,
    fn: ({ prev, next, hash }: { prev: {}; next: {}; hash: string }) => void
  ) {
    const [px, py] = this.#empty;
    const [nx, ny] = [px + dx, py + dy];

    if (this.#possible([nx, ny])) {
      this.#swap(this.#empty, [nx, ny]);
      this.#empty = [nx, ny];

      fn({
        prev: {
          index: this.#matrix[py][px].index,
          x: px,
          y: py,
        },
        next: {
          index: this.#matrix[ny][px].index,
          x: px,
          y: ny,
        },
        hash: this.#getMatrixHash(),
      });
    }
  }

  #swap([x1, y1]: Position, [x2, y2]: Position) {
    [this.#matrix[y1][x1], this.#matrix[y2][x2]] = [
      this.#matrix[y2][x2],
      this.#matrix[y1][x1],
    ];
  }

  #possible(position: Position): boolean {
    return (
      position[0] >= 0 &&
      position[0] < this.#matrix.length &&
      position[1] >= 0 &&
      position[1] < this.#matrix.length
    );
  }

  #getMatrixHash(): string {
    return createStringFromList(this.#matrix, (row) =>
      createStringFromList(row, ({ index }) => `${index}`)
    );
  }
}
