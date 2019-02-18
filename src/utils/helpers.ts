export function getPathnameAndQuery(path: string) {
  const pathname = path.split(/\?/)[0];
  const search = new URLSearchParams(path.replace(pathname, ''));
  const query: { [k: string]: string } = {};
  search.forEach((v, k) => {
    query[k] = v;
  });
  return {pathname, query};
}
