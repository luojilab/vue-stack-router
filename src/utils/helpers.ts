import { INameLocation, IPathnameLocation } from '../interface/common';
import { INavigationOptions } from '../interface/router';

export function isPathnameLocation<T extends INavigationOptions>(location: any): location is IPathnameLocation<T> {
  return location.pathname !== undefined;
}

export function isNameLocation<T extends INavigationOptions>(location: any): location is INameLocation<T> {
  return location.name !== undefined;
}
export function normalizePath(path: string): string {
  const [pathname, query] = path.split(/\?/);
  const normalizedPathname = pathname.replace(/\/{2,}/g, '/').replace(/^\/|\/$/g, '');
  return query === undefined ? normalizedPathname : `${normalizedPathname}?${query}`;
}
