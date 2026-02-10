import { Id } from "@/lib/convex/api";
import { replaceParamsInPath, url } from "@utils/routes";
import { Redirect as ExpoRedirect, Route, router, useLocalSearchParams, usePathname } from "expo-router";
import { NavigationOptions } from "expo-router/build/global-state/routing";
import { atom, useAtom, useSetAtom } from "jotai";
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
  redirectHere?: boolean,
  /** @default true */
  resetNextRoute?: boolean,
};

const dataAtom = atom<Record<string, object | undefined>>({});

const retrieveData = <T extends Route>(href: T | undefined, data: Record<string, object | undefined>) => {
  if (!href) return undefined;
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
  return params as Params<T> | undefined;
}


type Options<T extends Route> = {
  resetFnc?: Params<T> extends { reset?: boolean } ? () => void : never,
  onInit?: (params: ParamsDefault<T>) => void,
}

export const useRoute = <K extends Record<string, any> = Record<string, any>, T extends Route = Route>(href?: T, options?: Options<T>) => {
  const searchParams = useLocalSearchParams<K>();
  const [_data, setData] = useAtom(dataAtom);
  const sharedData = useMemo(() => retrieveData(href, _data), [href, _data]);
  const [localData, setLocalData] = useState(sharedData);
  const path = usePathname();

  const params = useMemo(() => sharedData ?? localData ?? {} as Params<T>, [sharedData, localData]);
  const finalParams = useMemo(() => {
    // If empty object, return undefined
    if (params && Object.keys(params).length === 0) return {} as ParamsDefault<T>;
    return params as ParamsDefault<T>;
  }, [params]);

  useEffect(() => {
    if (!options?.resetFnc) return;
    if (!(finalParams as { reset?: boolean })?.reset) return;
    options?.resetFnc?.();
    setData((d) => {
      const newData = { ...d };
      const newObject = { ...(newData[href as string] ?? {}), reset: false };
      newData[href as string] = newObject;
      setLocalData(newObject as Params<T>);
      return newData;
    });
  }, [finalParams, options, setData, href]);

  useEffect(() => {
    if (!options?.onInit) return;
    options.onInit(finalParams ?? {} as ParamsDefault<T>);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finalParams]);

  const redirectTo = useMemo(() => {
    if (!params?.redirectTo) return undefined;
    if (href === params.redirectTo) return undefined;
    return params.redirectTo;
  }, [href, params.redirectTo]);

  return {
    searchParams,
    redirectTo: redirectTo,
    params: finalParams,
    path,
  }
}

export const useRouter = <K extends Record<string, any> = Record<string, any>, T extends Route = Route>(href?: T, options?: Options<T>) => {
  const setData = useSetAtom(dataAtom);
  const { path, params, redirectTo, searchParams } = useRoute<K, T>(href, options);

  const _toUrl = useCallback(<T extends Route>(to: T, options?: RouterParams<T>) => {
    return url(replaceParamsInPath(to, options?.pathParams ?? {}), options?.searchParams ?? {});
  }, []);

  const _routerFunction = useCallback(<T extends Route>(to: T, options?: RouterParams<T>) => {
    const toUrl = _toUrl(to, options);
    const redirect = options?.redirectTo ?? (options?.redirectHere === true ? href : undefined);

    const resetNextRoute = options?.resetNextRoute ?? true;

    // Update data for the target route and, when requested, mark nested child routes as reset too.
    if (resetNextRoute || options?.params || redirect) {
      setData((d) => {
        const newData = { ...d };
        const basePath = (toUrl as string).split('?')[0];

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
  }, [_toUrl, href, setData]);

  const push = useCallback(<T extends Route>(to: T, options?: RouterParams<T>) => {
    const toUrl = _routerFunction(to, options);
    router.push(toUrl, options);
  }, [_routerFunction]);

  const replace = useCallback(<T extends Route>(to: T, options?: RouterParams<T>) => {
    const toUrl = _routerFunction(to, options);
    router.push(toUrl, options);
  }, [_routerFunction]);

  const dismissTo = useCallback(<T extends Route>(to: T, options?: RouterParams<T>) => {
    const toUrl = _routerFunction(to, options);
    router.dismissTo(toUrl, options);
  }, [_routerFunction]);

  const back = useCallback(() => {
    if (router.canGoBack()) router.back();
    else router.dismissTo('/');
  }, []);

  const consume = useCallback(() => {
    if (params !== undefined) {
      setData((d) => {
        const newData = { ...d };
        delete newData[href as string];
        return newData;
      });
    }
    return params;
  }, [href, params, setData]);

  return {
    path,
    searchParams,
    redirect: redirectTo,
    params,
    back,
    push,
    replace,
    dismissTo,
    consume,
    _routerFunction,
    _toUrl
  }
}

export { ROUTES } from 'routes';


const Redirect = <T extends Route>({ href, ...props }: { href: T } & Omit<RouterParams<T>, 'redirectHere'>) => {
  const { _routerFunction, _toUrl } = useRouter();

  useEffect(() => {
    _routerFunction(href, { ...props });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const path = _toUrl(href, { ...props });

  return (<ExpoRedirect href={path} />)
}

useRouter.Redirect = Redirect;

