import { NameLocation, PathnameLocation } from '../interface/common';
import { NavigationOptions } from '../interface/router';

export function isPathnameLocation<T extends NavigationOptions>(location: any): location is PathnameLocation<T> {
  return location.pathname !== undefined;
}

export function isNameLocation<T extends NavigationOptions>(location: any): location is NameLocation<T> {
  return location.name !== undefined;
}
export function normalizePath(path: string): string {
  const [pathname, query] = path.split(/\?/);
  const normalizedPathname = pathname.replace(/\/{2,}/g, '/').replace(/^\/|\/$/g, '');
  return query === undefined ? `/${normalizedPathname}` : `/${normalizedPathname}?${query}`;
}
