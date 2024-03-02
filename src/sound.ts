export class Sound {
  #audio = new Audio();

  constructor(src: string) {
    this.#audio.src = src;
    this.#audio.load();
  }

  public play() {
    this.#audio.currentTime = 0;
    this.#audio.play();
  }

  public mute(fn: (muted: boolean) => void) {
    this.#audio.muted = !this.#audio.muted;
    fn(this.#audio.muted);
  }
}
