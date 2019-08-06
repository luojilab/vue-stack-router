import { INameLocation, INavigationOptions, IPathnameLocation } from '../interface/router';

export function isPathnameLocation<T extends INavigationOptions>(location: any): location is IPathnameLocation<T> {
  return location.pathname !== undefined;
}

export function isNameLocation<T extends INavigationOptions>(location: any): location is INameLocation<T> {
  return location.name !== undefined;
}
