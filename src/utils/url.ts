import { IQuery } from '../interface/common';

function encode(str: string) {
  const replace: { [x: string]: string } = {
    '!': '%21',
    '\'': '%27',
    '(': '%28',
    ')': '%29',
    '~': '%7E',
    '%20': '+',
    '%00': '\x00'
  };
  return encodeURIComponent(str).replace(/[!'\(\)~]|%20|%00/g, match => replace[match]);
}

function decode(str: string) {
  return decodeURIComponent(str.replace(/\+/g, ' '));
}
export function parseSearchStr(search: string): { [x: string]: string } {
  const obj: { [x: string]: string } = {};
  if (search.indexOf('?') === 0) {
    search = search.slice(1);
  }
  const pairs = search.split('&');
  for (let j = 0; j < pairs.length; j++) {
    const value = pairs[j];
    const index = value.indexOf('=');

    if (index > -1) {
      obj[decode(value.slice(0, index))] = decode(value.slice(index + 1));
    } else {
      if (value) {
        obj[decode(value)] = '';
      }
    }
  }
  return obj;
}
export function parseToSearchStr(obj: IQuery): string {
  const keys = Object.keys(obj);
  if (keys.length === 0) {
    return '';
  }
  return keys.reduce((pre, key, index) => {
    const value = obj[key] === undefined ? '' : obj[key];
    return `${pre}${index === 0 ? '' : '&'}${encode(key)}=${encode(String(value))}`;
  }, '?');
}

export function getPathnameAndQuery(path: string) {
  const pathname = path.split(/\?/)[0];
  const query = parseSearchStr(path.replace(pathname, ''));
  return { pathname, query };
}
