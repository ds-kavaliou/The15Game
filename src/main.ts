import "./style.css";

import { DOWN, LEFT, RIGHT, UP } from "./board";
import {
  createElementsFromString,
  createStringFromList,
  toTimeString,
} from "./utils";
import { App } from "./app";
import { Sound } from "./sound";

/** APP */

const board = document.querySelector<HTMLDivElement>("#board")!;

const menu = document.querySelector<HTMLDivElement>("#menu")!;
const infoEl = menu.querySelector<HTMLSpanElement>("#info")!;

const pane = document.querySelector<HTMLDivElement>("#pane")!;

const muteEl = pane.querySelector<HTMLButtonElement>("#mute");
const counterEl = pane.querySelector<HTMLSpanElement>("#counter")!;
const timeEl = pane.querySelector<HTMLSpanElement>("#time")!;

const radios = [...pane.querySelectorAll<HTMLInputElement>("[type='radio']")];

const app = new App();
const sound = new Sound("/sound/move.mp3");

app.state.listen("counter", ({ counter }) => {
  counterEl.textContent = `${counter}`;
});

app.state.listen("time", ({ time }) => {
  timeEl.textContent = toTimeString(time);
});

app.addEventListener("init", ((e: CustomEvent<{ matrix: any[][] }>) => {
  const {
    matrix,
    matrix: { length },
  } = e.detail;

  const prev = board.className.match(/board--size-\d+/)?.[0];
  prev
    ? board?.classList.replace(prev, `board--size-${length}`)
    : board?.classList.add(`board--size-${length}`);

  const items = createStringFromList(matrix, (row, i) =>
    createStringFromList(
      row,
      ({ name, empty }, j) => /*html */ `
        <div class="tile" style="grid-area: ${i + 1} / ${j + 1};"
          ${empty ? "data-hidden" : ""}>
          <span>${name}</span>
        </div>
      `
    )
  );

  board.replaceChildren(...createElementsFromString(items));
  infoEl.textContent = "Double tap or press 'Enter'";
}) as EventListener);

app.addEventListener("start", ((e: CustomEvent<{ matrix: any[][] }>) => {
  menu.classList.add("hidden");

  const { matrix } = e.detail;

  const tiles = [...board.children] as HTMLDivElement[];

  matrix.forEach((row, y) => {
    row.forEach(({ index }, x) => {
      tiles[index].style["gridArea"] = `${y + 1} / ${x + 1}`;
    });
  });
}) as EventListener);

app.addEventListener("end", () => {
  menu.classList.remove("hidden");
  infoEl.innerHTML = `You Won! It takes you <strong>${app.state.counter}</strong> moves and <strong>${app.state.time}<strong> seconds`;
});

app.addEventListener("move", ((e: CustomEvent) => {
  const { prev, next } = e.detail;

  const elements = [...board.children] as HTMLDivElement[];

  elements[prev.index].style["gridArea"] = `${prev.y + 1} / ${prev.x + 1}`;
  elements[next.index].style["gridArea"] = `${next.y + 1} / ${next.x + 1}`;

  sound.play();
}) as EventListener);

app.addEventListener("playpause", ((e: CustomEvent<{ paused: boolean }>) => {
  menu.classList.toggle("hidden", !e.detail.paused);
  if (e.detail.paused) {
    infoEl.textContent = "Pause";
  }
}) as EventListener);

menu.addEventListener("dblclick", () => app.start());

muteEl?.addEventListener("click", () => {
  sound.mute((muted) => {
    muteEl.children[0].classList.toggle("hidden", muted);
    muteEl.children[1].classList.toggle("hidden", !muted);
  });
});

document.addEventListener("keydown", (e) => {
  switch (e.code) {
    case "ArrowUp":
      app.move(UP);
      break;
    case "ArrowDown":
      app.move(DOWN);
      break;
    case "ArrowRight":
      app.move(RIGHT);
      break;
    case "ArrowLeft":
      app.move(LEFT);
      break;
    case "Escape":
      app.playpause();
      break;
    case "Enter":
      app.state.running ? app.playpause() : app.start();
      break;
  }
});
