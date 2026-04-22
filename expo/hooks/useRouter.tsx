import { Id } from "@/lib/convex/api";
import { notEmpty } from "@utils/convex-allowed";
import { replaceParamsInPath, url } from "@utils/routes";
import { EmptyObject } from "convex-helpers";
import { Redirect as ExpoRedirect, Href, Route, router, useFocusEffect, useLocalSearchParams, usePathname } from "expo-router";
import { NavigationOptions } from "expo-router/build/global-state/routing";
import { atom, getDefaultStore, useAtom } from "jotai";
import { useCallback, useEffect, useMemo, useState } from "react";
import { usePrevious } from "./usePrevious";

type ParamsDefault<T extends Route> =
  T extends "/photoshoot/create" ? { outfitId?: Id<'outfits'> | null, presetId?: Id<'presets'> | null, userId?: Id<'users'> | null } :
  T extends "/photoshoot/create/recap" ? { outfitId?: Id<'outfits'> | null, presetId?: Id<'presets'> | null, userId?: Id<'users'> | null } :
  T extends "/pick-outfit" ? { canSkip?: boolean, itemIds?: Id<'items'>[] } :
  T extends "/new-outfit" ? { itemIds?: Id<'items'>[] } :
  T extends "/outfit/new" ? { outfitId?: Id<'outfits'>, itemIds?: Id<'items'>[] } :
  T extends "/admin/bots/generate" ? { userId?: Id<'users'> | null } :
  T extends "/admin/bots/outfits/extractor" ? { userId?: Id<'users'> | null } :
  T extends "/preset/create/thumbnail" ? { presetId: Id<'presets'> } :
  T extends "/turn-to-video" ? { predictionId: Id<'predictions'> } :
  T extends "/preview-item" ? { itemId: Id<'items'>, onRemove?: () => void } :
  never;

const LINKED_ROUTES: { parent: Route, child: Route }[] = [
  { parent: "/photoshoot/create", child: "/photoshoot/create/recap" },
  { parent: "/preset/create", child: "/preset/create/thumbnail" },
];

type Params<T extends Route> = ParamsDefault<T> & {
  reset?: boolean,
  redirectTo?: Route,
};

type RouterParams<T extends Route> = NavigationOptions & {
  pathParams?: Record<string, string>,
  searchParams?: Record<string, string>,
  params?: ParamsDefault<T>,
  redirectTo?: Route,
  forwardRedirect?: boolean, // If true, the redirect will be applied to the target route instead of the current route. Only makes sense if redirectTo is provided.
  redirectHere?: boolean,
  /** @default true */
  resetNextRoute?: boolean,
};

const dataAtom = atom<Record<string, object | undefined>>({});

/**
 * Get all linked routes (parents and children) for a given route
 */
const getLinkedRoutes = (href: string): string[] => {
  const routes = new Set<string>();
  routes.add(href);

  // Find all parents (traverse up the chain)
  let currentRoute = href;
  while (true) {
    const parentLink = LINKED_ROUTES.find(r => r.child === currentRoute);
    if (!parentLink) break;
    routes.add(parentLink.parent as string);
    currentRoute = parentLink.parent as string;
  }

  // Find all children (recursively traverse down)
  const findChildren = (route: string) => {
    const children = LINKED_ROUTES.filter(r => r.parent === route);
    children.forEach(childLink => {
      routes.add(childLink.child as string);
      findChildren(childLink.child as string);
    });
  };
  findChildren(href);

  return Array.from(routes);
};

const retrieveData = <T extends Route>(href: T | undefined, data: Record<string, object | undefined>): Params<T> => {
  if (!href) return {} as Params<T>;

  // Get all linked routes (parents and children)
  const linkedRoutes = getLinkedRoutes(href as string);

  // Sort routes by depth (parents first, children last) so child params override parent params
  const sortedRoutes = linkedRoutes.sort((a, b) => {
    const depthA = a.split('/').filter(Boolean).length;
    const depthB = b.split('/').filter(Boolean).length;
    return depthA - depthB;
  });

  // Merge params from all linked routes (child params override parent params)
  let params = {};
  for (const route of sortedRoutes) {
    if (data[route]) {
      params = { ...params, ...data[route] };
    }
  }

  return params as Params<T>;
}


type Options<T extends Route> = {
  resetFnc?: Params<T> extends { reset?: boolean } ? () => void : never,
  onInit?: (params: ParamsDefault<T>) => void,
  onUpdate?: (params: ParamsDefault<T>) => void,
}

export const useRoute = <K extends Record<string, any> = EmptyObject, T extends Route = Route>(_href?: T, options?: Options<T>) => {
  const [_data, setData] = useAtom(dataAtom);
  const [href] = useState(_href);

  const [initialized, setInitialized] = useState(false);
  const [localData, setLocalData] = useState(retrieveData(href, _data) as ParamsDefault<T>);

  useFocusEffect(useCallback(() => {
    const newData = retrieveData(href, _data);
    if (!newData) return;
    if (Object.keys(newData).length === 0) return;
    setLocalData(newData);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [_data]));

  useFocusEffect(useCallback(() => {
    if (!options?.resetFnc) return;
    if (!(localData as { reset?: boolean })?.reset) return;
    options?.resetFnc?.();
    setData((d) => {
      const newData = { ...d };

      // Get all linked routes and reset them all
      const linkedRoutes = getLinkedRoutes(href as string);

      for (const linkedRoute of linkedRoutes) {
        const newObject = { ...(newData[linkedRoute] ?? {}), reset: false };
        newData[linkedRoute] = newObject;
      }

      // Update localData with the current route's data
      const currentRouteData = newData[href as string];
      setLocalData(currentRouteData as Params<T>);

      return newData;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localData, setData]));

  useFocusEffect(useCallback(() => {
    if (!options?.onInit) return;
    if (initialized) return;
    options.onInit(localData ?? {} as ParamsDefault<T>);
    setInitialized(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localData]));

  useFocusEffect(useCallback(() => {
    if (!options?.onUpdate) return;
    options.onUpdate(localData ?? {} as ParamsDefault<T>);
    setInitialized(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localData]));

  const redirectTo = useMemo(() => {
    if (!(localData as Params<T>)?.redirectTo) return undefined;
    if (href === (localData as Params<T>).redirectTo) return undefined;
    return (localData as Params<T>).redirectTo;
  }, [localData, href]);

  const searchParams = useLocalSearchParams<K>();

  const params = useMemo(() => {
    return { ...searchParams, redirectTo, ...localData };
  }, [localData, redirectTo, searchParams]);

  return { ...params, initialized };
}

export const useRouter = <T extends Route = Route>(_href?: T) => {
  const [href] = useState(_href);

  const _toUrl = useCallback(<T extends Route>(to: T, options?: RouterParams<T>) => {
    return url(replaceParamsInPath(to, options?.pathParams ?? {}), options?.searchParams ?? {});
  }, []);

  const _routerFunction = useCallback(<T extends Route>(to: T, options?: RouterParams<T>) => {
    const toUrl = _toUrl(to, options);

    const store = getDefaultStore();

    const forwardedRedirect = options?.forwardRedirect === true ?
      retrieveData(href, store.get(dataAtom)).redirectTo
      : undefined;

    const redirect = options?.redirectTo ?? forwardedRedirect ??
      (options?.redirectHere === true ? href : undefined);

    const resetNextRoute = options?.resetNextRoute ?? true;

    // Update data for the target route and all linked routes (parents/children)
    if (resetNextRoute || options?.params || redirect) {
      store.set(dataAtom, (d) => {
        const newData = { ...d };
        const basePath = (to as string).split('?')[0];

        // Get all linked routes (parents and children)
        const linkedRoutes = getLinkedRoutes(basePath);

        // Update all linked routes with the same params and reset state
        for (const linkedRoute of linkedRoutes) {
          // Clear existing data for the linked route
          delete newData[linkedRoute];

          // Set new data for the linked route
          newData[linkedRoute] = {
            ...(options?.params ?? {}),
            redirectTo: redirect,
            reset: resetNextRoute ?? true,
          };
        }

        // If resetNextRoute is true, also clear nested routes (but not linked routes)
        if (resetNextRoute) {
          for (const linkedRoute of linkedRoutes) {
            for (const key of Object.keys(d)) {
              const keyPath = key.split('?')[0];
              // Update entries with query params that match this linked route
              if (keyPath === linkedRoute) {
                newData[key] = {
                  ...(options?.params ?? {}),
                  redirectTo: redirect,
                  reset: true,
                };
              }
              // Clear nested routes that are not themselves linked routes
              else if (keyPath.startsWith(linkedRoute + '/') && !linkedRoutes.includes(keyPath)) {
                newData[key] = undefined;
              }
            }
          }
        }
        return newData;
      });
    }
    return toUrl;
  }, [_toUrl, href]);

  const push = useCallback(<T extends Route>(to: T, options?: RouterParams<T>) => {
    const toUrl = _routerFunction(to, options);
    router.push(toUrl, options);
  }, [_routerFunction]);

  const replace = useCallback(<T extends Route>(to: T, options?: RouterParams<T>) => {
    const toUrl = _routerFunction(to, options);
    router.replace(toUrl, options);
  }, [_routerFunction]);

  const dismissTo = useCallback(<T extends Route>(to: T, options?: RouterParams<T>) => {
    const toUrl = _routerFunction(to, options);
    router.dismissTo(toUrl, options);
  }, [_routerFunction]);

  const forceDismissTo = useCallback(<T extends Route>(to: T, options?: RouterParams<T>) => {
    const toUrl = _routerFunction(to, options);
    if (router.canDismiss()) router.dismissAll();
    requestAnimationFrame(() => router.dismissTo(toUrl, options));
  }, [_routerFunction]);

  const back = useCallback(() => {
    if (router.canGoBack()) router.back();
    else router.dismissTo('/');
  }, []);

  const redirect = useCallback(<T extends Route>(options?: RouterParams<T> & { fallbackTo?: Href | ['back', Href] }) => {
    const to = retrieveData(href, getDefaultStore().get(dataAtom)).redirectTo;
    const nextPaths = [to, ...(Array.isArray(options?.fallbackTo) ? options.fallbackTo : [options?.fallbackTo])].filter(notEmpty);

    if (nextPaths[0] === 'back' && router.canGoBack()) {
      router.back();
      return;
    }

    const nextPath = nextPaths.filter((p) => p !== 'back')[0] ?? '/';
    dismissTo(nextPath as Route, { ...options, resetNextRoute: false });
  }, [dismissTo, href]);

  return {
    redirect,
    back,
    push,
    replace,
    dismissTo,
    forceDismissTo,
    _routerFunction,
    _toUrl
  }
}

export { ROUTES } from 'routes';

const Redirect = <T extends Route>({ href, currentRoute, ...props }: { href: T, currentRoute?: Route } & Omit<RouterParams<T>, 'redirectHere'>) => {
  const { _routerFunction, _toUrl } = useRouter(currentRoute);

  useEffect(() => {
    _routerFunction(href, { ...props });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const path = _toUrl(href, { ...props });

  return (<ExpoRedirect href={path} />)
}

const usePathnameExtended = () => {
  const pathname = usePathname();
  const previousPathname = usePrevious(pathname);

  return {
    pathname,
    previousPathname
  }
}

useRoute.Path = usePathnameExtended;
useRoute.Params = useLocalSearchParams;

useRouter.Path = usePathnameExtended;

export const Router = () => { }
Router.Redirect = Redirect;

export type { Route } from "expo-router";

