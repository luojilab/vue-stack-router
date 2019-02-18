let id = 0;
export default function idMarker(): string {
  return `${Math.floor(Math.random() * 1e6)}_${id++}`;
}
