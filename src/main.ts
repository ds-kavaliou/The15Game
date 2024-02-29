import "./style.css";

const RIGHT = [-1, 0] as const;
const LEFT = [1, 0] as const;
const UP = [0, 1] as const;
const DOWN = [0, -1] as const;

type TMove = typeof RIGHT | typeof LEFT | typeof UP | typeof DOWN;
type TItem = { index: number; name: number; isEmpty: boolean };
type TCoord = [x: number, y: number];

class Game extends EventTarget {
  private _matrix: TItem[][] = [];
  private _empty: TCoord = [0, 0];

  public get matrix() {
    return this._matrix;
  }

  constructor() {
    super();
  }

  public setSize(size: number) {
    this._matrix = createMatrix<TItem>(size, (size, x, y) => ({
      index: size * x + y,
      name: size * x + y + 1,
      isEmpty: size ** 2 === size * x + y + 1,
    }));

    this._empty = [size - 1, size - 1];

    this.dispatchEvent(
      new CustomEvent("ready", { detail: { size: this._matrix.length } })
    );
  }

  public move([dx, dy]: TMove) {
    const [ex, ey] = this._empty;
    const [nx, ny]: TCoord = [ex + dx, ey + dy];

    if (this.canMove([nx, ny])) {
      this.swap([ex, ey], [nx, ny]);
      this._empty = [nx, ny];

      this.dispatchEvent(
        new CustomEvent("moved", {
          detail: {
            prev: { index: this._matrix[ey][ex].index, x: ex, y: ey },
            next: { index: this._matrix[ny][nx].index, x: nx, y: ny },
          },
        })
      );
    }
  }

  private canMove([x, y]: TCoord) {
    return (
      x >= 0 && x < this._matrix.length && y >= 0 && y < this._matrix.length
    );
  }

  private swap([x1, y1]: TCoord, [x2, y2]: TCoord) {
    [this._matrix[y1][x1], this._matrix[y2][x2]] = [
      this._matrix[y2][x2],
      this._matrix[y1][x1],
    ];
  }
}

/**LIBRARY */

function createElementsFromString(html: string) {
  const parser = new DOMParser();
  const document = parser.parseFromString(html, "text/html");
  return [...document.body.children];
}

function createHTMLString<T>(array: T[], fn: (item: T, i: number) => string) {
  return array.reduce((acc, value, i) => acc + fn(value, i), "");
}

function createMatrix<T>(
  size: number,
  map: (size: number, x: number, y: number) => T
) {
  return Array.from({ length: size }, (_, i) =>
    Array.from({ length: size }, (_, j) => map(size, i, j))
  );
}

/** APP */
const menu = document.querySelector("#menu")!;
const radios = [...menu.querySelectorAll<HTMLInputElement>("[type='radio']")];

const board = document.querySelector<HTMLDivElement>("#board")!;
const game = new Game();

game.addEventListener("ready", ((e: CustomEvent) => {
  const { size } = e.detail;

  const prev = board.className.match(/board--size-\d+/)?.[0];
  prev
    ? board?.classList.replace(prev, `board--size-${size}`)
    : board?.classList.add(`board--size-${size}`);

  const items = createHTMLString(game.matrix, (row, i) =>
    createHTMLString(
      row,
      ({ name, isEmpty }, j) => /*html */ `
        <div class="tile" style="grid-area: ${i + 1} / ${j + 1};"
          ${isEmpty ? "data-hidden" : ""}>
          <span>${name}</span>
        </div>
      `
    )
  );

  board?.replaceChildren(...createElementsFromString(items));
}) as EventListener);

game.addEventListener("moved", ((e: CustomEvent) => {
  const { prev, next } = e.detail;

  const elements = [...board.children] as HTMLDivElement[];

  elements[prev.index].style["gridArea"] = `${prev.y + 1} / ${prev.x + 1}`;
  elements[next.index].style["gridArea"] = `${next.y + 1} / ${next.x + 1}`;
}) as EventListener);

menu.addEventListener("change", (e) => {
  const target = <HTMLInputElement>e.target;
  game.setSize(Number(target.value));
});

radios[0].click();

document.addEventListener("keydown", (e) => {
  switch (e.code) {
    case "ArrowUp":
      game.move(UP);
      break;
    case "ArrowDown":
      game.move(DOWN);
      break;
    case "ArrowRight":
      game.move(RIGHT);
      break;
    case "ArrowLeft":
      game.move(LEFT);
      break;
  }
});
