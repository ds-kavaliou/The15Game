import "./style.css";

class Game extends EventTarget {
  private _matrix: number[][] = [];
  public get matrix() {
    return this._matrix;
  }

  constructor() {
    super();
  }

  public setSize(size: number) {
    this._matrix = createMatrix(size, (size, x, y) => size * x + y + 1);
    this.dispatchEvent(new Event("ready"));
  }
}

/**LIBRARY */

function createElementsFromString(html: string) {
  const parser = new DOMParser();
  const document = parser.parseFromString(html, "text/html");
  return [...document.body.children];
}

function createHTMLString<T>(array: T[], fn: (item: T) => string) {
  return array.reduce((acc, value) => acc + fn(value), "");
}

function createMatrix(
  size: number,
  map: (size: number, x: number, y: number) => number
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

game.addEventListener("ready", () => {
  const prev = board.className.match(/board--size-\d+/)?.[0];
  prev
    ? board?.classList.replace(prev, `board--size-${game.matrix.length}`)
    : board?.classList.add(`board--size-${game.matrix.length}`);

  const items = createHTMLString(game.matrix, (row) =>
    createHTMLString(row, (n) => /*html */ `<div class="tile">${n}</div>`)
  );

  board?.replaceChildren(...createElementsFromString(items));
});

menu.addEventListener("change", (e) => {
  const target = <HTMLInputElement>e.target;
  game.setSize(Number(target.value));
});

radios[0].click();
