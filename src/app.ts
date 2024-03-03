import { Board, Direction } from "./board";
import { StopWatch } from "./stopwatch";
import { observable } from "./utils";

type State = {
  running: boolean;
  paused: boolean;
  counter: number;
  time: number;
};

export class App extends EventTarget {
  private _solution = "";

  private readonly _board: Board = new Board();
  private readonly _stopwatch: StopWatch = new StopWatch();
  private readonly _state = observable<State>({
    running: false,
    paused: false,
    counter: 0,
    time: 0,
  });

  public get state() {
    return this._state;
  }

  public get board() {
    return this._board;
  }

  constructor() {
    super();
    this.init();
  }

  public init(size: number = 4) {
    this._board.create(size, ({ hash }) => {
      this._solution = hash;
    });

    this._stopwatch.reset();

    this._state.time = 0;
    this._state.counter = 0;
    this._state.running = false;
    this._state.paused = false;

    Promise.resolve().then(() =>
      this.dispatchEvent(
        new CustomEvent("init", { detail: { matrix: this._board.matrix } })
      )
    );
  }

  public start() {
    if (this._state.running) return;

    this._stopwatch.reset();
    this._stopwatch.run((n) => {
      this._state.time = n;
    });

    this._state.counter = 0;
    this._state.time = 0;
    this._state.running = true;

    this._board.shuffle();

    this.dispatchEvent(
      new CustomEvent("start", { detail: { matrix: this._board.matrix } })
    );
  }

  public playpause() {
    if (!this._state.running) return;

    this._state.paused = !this._state.paused;

    this._state.paused
      ? this._stopwatch.pause()
      : this._stopwatch.run((n) => {
          this._state.time = n;
        });

    this.dispatchEvent(
      new CustomEvent("playpause", { detail: { paused: this._state.paused } })
    );
  }

  public move(move: Direction) {
    if (!this._state.running || this._state.paused) return;

    this._board.move(move, ({ prev, next, hash }) => {
      this._state.counter++;

      this.dispatchEvent(
        new CustomEvent("move", {
          detail: { prev, next, counter: this._state.counter },
        })
      );

      this.#check(hash);
    });
  }

  #check(hash: string) {
    if (this._solution !== hash) return;

    this._state.running = false;
    this._stopwatch.pause();
    this.dispatchEvent(new CustomEvent("end"));
  }
}
