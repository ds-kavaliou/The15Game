export class StopWatch {
  private id?: number;
  private counter: number = 0;

  public run(fn: (n: number) => void) {
    if (this.id) return;
    this.id = setInterval(() => {
      this.counter++;
      fn(this.counter);
    }, 1000);
  }

  public pause() {
    if (this.id) {
      clearInterval(this.id);
      this.id = undefined;
    }
  }

  public reset() {
    this.pause();
    this.counter = 0;
  }
}
