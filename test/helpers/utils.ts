export function sleep(time: number) {
  return new Promise(r => setTimeout(r, time));
}
