import { Id } from "@/lib/convex/api";
import { notEmpty } from "@utils/convex-allowed";
import { replaceParamsInPath, url } from "@utils/routes";
import { EmptyObject } from "convex-helpers";
import { Redirect as ExpoRedirect, Href, Route, router, useFocusEffect, useLocalSearchParams, usePathname } from "expo-router";
import { NavigationOptions } from "expo-router/build/global-state/routing";
import { atom, getDefaultStore, useAtom } from "jotai";
import { useCallback, useEffect, useMemo, useState } from "react";

type ParamsDefault<T extends Route> =
  T extends "/photoshoot/create" ? { outfitId?: Id<'outfits'>, presetId?: Id<'presets'> } :
  T extends "/photoshoot/create/recap" ? { outfitId?: Id<'outfits'>, presetId?: Id<'presets'> } :
  T extends "/pick-outfit" ? { canSkip?: boolean, itemIds?: Id<'items'>[] } :
  T extends "/new-outfit" ? { itemIds?: Id<'items'>[] } :
  T extends "/add-item" ? { outfitId?: Id<'outfits'>, itemIds?: Id<'items'>[] } :
  never;

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

const retrieveData = <T extends Route>(href: T | undefined, data: Record<string, object | undefined>): Params<T> => {
  if (!href) return {} as Params<T>;
  // If want to retrieve data for a specific route
  // If it's a child route, try to find parent route data TOO
  // For example: /photoshoot/create/recap should also retrieve /photoshoot/create data
  let params = data[href as string] ?? {};
  const parts = href.split('/').filter(Boolean);
  for (let i = 0; i < parts.length; i++) {
    const path = '/' + parts.slice(0, i).join('/');
    if (data[path]) {
      params = { ...params, ...data[path] }
    }
  }
  return params as Params<T>;
}


type Options<T extends Route> = {
  resetFnc?: Params<T> extends { reset?: boolean } ? () => void : never,
  onInit?: (params: ParamsDefault<T>) => void,
}

export const useRoute = <K extends Record<string, any> = EmptyObject, T extends Route = Route>(_href?: T, options?: Options<T>) => {
  const [_data, setData] = useAtom(dataAtom);
  const [href] = useState(_href);

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
      const newObject = { ...(newData[href as string] ?? {}), reset: false };
      newData[href as string] = newObject;
      setLocalData(newObject as Params<T>);
      return newData;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localData, setData]));

  useFocusEffect(useCallback(() => {
    if (!options?.onInit) return;
    options.onInit(localData ?? {} as ParamsDefault<T>);
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

  return params;
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

    // Update data for the target route and, when requested, mark nested child routes as reset too.
    if (resetNextRoute || options?.params || redirect) {
      store.set(dataAtom, (d) => {
        const newData = { ...d };
        const basePath = (toUrl as string).split('?')[0];

        delete newData[toUrl as string]; // Clear existing data for the target route to avoid stale data issues. It will be replaced with merged data below.

        // Merge params (if any) and set reset/redirect for the target URL entry
        newData[toUrl as string] = {
          ...(newData[toUrl as string] ?? {}),
          ...(options?.params ?? {}),
          redirectTo: redirect,
          reset: true,
        };

        // If resetNextRoute is true, propagate reset to nested routes (children)
        if (resetNextRoute) {
          for (const key of Object.keys(d)) {
            const keyPath = key.split('?')[0];
            if (keyPath === basePath) {
              newData[key] = {
                ...(options?.params ?? {}),
                redirectTo: redirect,
                reset: true,
              };
            }
            else if (keyPath.startsWith(basePath + '/')) {
              newData[key] = undefined;
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
    dismissTo(nextPath as Route, options);
  }, [dismissTo, href]);

  return {
    redirect,
    back,
    push,
    replace,
    dismissTo,
    _routerFunction,
    _toUrl
  }
}

export { ROUTES } from 'routes';

const Redirect = <T extends Route>({ href, currentRoute, ...props }: { href: T, currentRoute?: Route } & Omit<RouterParams<T>, 'redirectHere'>) => {
  const { _routerFunction, _toUrl } = useRouter(currentRoute);
  ;
  useEffect(() => {
    _routerFunction(href, { ...props });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const path = _toUrl(href, { ...props });

  return (<ExpoRedirect href={path} />)
}

useRoute.Path = usePathname;
useRoute.Params = useLocalSearchParams;

useRouter.Path = usePathname;

export const Router = () => { }
Router.Redirect = Redirect;

