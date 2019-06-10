const CONVERT_RADIX = 36;

export class IdGenerator {
  private currentTime = Date.now();
  private count = 0;
  public compare(id1: string, id2: string): number {
    return parseInt(id1, CONVERT_RADIX) - parseInt(id2, CONVERT_RADIX);
  }

  public generateId(): string {
    const now = Date.now();
    if (now > this.currentTime) {
      this.currentTime = now;
      this.count = 0;
    }
    if (this.count >= 999) {
      this.currentTime++;
      this.count = 0;
    }

    const id = `${(this.currentTime * 1000 + this.count).toString(CONVERT_RADIX)}`;
    this.count++;
    return id;
  }
}

export default new IdGenerator();
