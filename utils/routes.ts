import { env } from "env";
import { POSTHOG_IGNORED_ROUTES, SERVER_ROUTE_PATH } from "global";

export const isRouteIgnored = (url: string | undefined) => POSTHOG_IGNORED_ROUTES.some((path) => url?.startsWith(path));
export const unNormalizeUrl = (url: string | undefined) => {
  if (!url) return null;

  const sanitizeUrl = (path: string): string => {
    if (path.startsWith('http')) {
      // Split the URL into two parts: protocol and the rest
      const [protocol, rest] = path.split('://');
      // Replace all double slashes in the rest part with a single slash
      const normalizedRest = rest?.replaceAll('//', '/');
      // Recombine the protocol and the rest part
      return `${protocol}://${normalizedRest}`;
    }

    return sanitizeUrl([env.NEXT_PUBLIC_SERVER_URL, path].join('/'));
  }

  const isServerRouterCall = url.includes(SERVER_ROUTE_PATH);

  // example url : /_next/data/development/en/tools/upscale.json
  if (isServerRouterCall) {
    // only retrieve the part after /_next/data/
    const trimedUrl = url.replace(SERVER_ROUTE_PATH, '');
    let urlParts = trimedUrl.split('/').filter((path) => path.length > 0);
    // remove the bundle name (next two /)
    urlParts = urlParts.slice(1);
    // remove the locale
    // urlParts = partsWithoutBundleName.slice(1);
    const joinedParts = urlParts.join('/').replaceAll('.json', '');

    return sanitizeUrl(joinedParts);
  }

  return sanitizeUrl(url);
}

export const url = (path: string, params: Record<string, boolean | number | string | undefined | null>): string => {
  // Filter params
  const filteredParams = Object.entries(params).filter(([, value]) => value !== null && value !== undefined) as [string, string][];

  // Convert to record
  const recordParams = Object.fromEntries(filteredParams) as Record<string, string>;

  // Create query string
  const queryString = new URLSearchParams(recordParams).toString();

  // Return full path
  return `${path.split('?')[0]}${queryString ? `?${queryString}` : ''}`;
}
