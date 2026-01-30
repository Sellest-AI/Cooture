import { POSTHOG_IGNORED_ROUTES } from "global";

export const isRouteIgnored = (url: string | undefined) => POSTHOG_IGNORED_ROUTES.some((path) => url?.startsWith(path));

type Param = boolean | number | string | string[] | undefined | null;

export const url = <T extends string>(path: T, params: Record<string, Param>): T => {
  const usp = new URLSearchParams();

  for (const [key, value] of Object.entries(params || {})) {
    if (value === null || value === undefined) continue;
    if (Array.isArray(value)) {
      for (const v of value) {
        usp.append(key, String(v));
      }
    } else {
      usp.append(key, String(value));
    }
  }

  const queryString = usp.toString();
  return `${path.split('?')[0]}${queryString ? `?${queryString}` : ''}` as T;
}
