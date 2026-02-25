/** use this like that : array.filter(notEmpty) */
export function notEmpty<TValue>(value: TValue | null | undefined): value is TValue {
  return value !== null && value !== undefined;
}

type Length<T extends readonly unknown[]> = T['length'];
export function createArrayWithValidLength<T extends unknown[], K extends readonly unknown[]>(array: [...T] & { length: Length<K> }): T {
  return array;
}

export const normalizeArray = <T extends string>(v?: T | T[] | null) =>
  v == null ? [] : Array.isArray(v) ? v : [v];

/**
 * Removes undefined values from an object recursively
 * @param obj The object to process
 * @returns A new object without properties that have undefined values
 */
export function removeUndefinedKeys<T extends object>(obj: T): Partial<T> {
  if (Array.isArray(obj)) {
    return obj
      .filter(item => item !== undefined)
      .map(item =>
        item !== null && typeof item === 'object'
          ? removeUndefinedKeys(item as object)
          : item
      ) as unknown as Partial<T>;
  }

  return Object.fromEntries(
    Object.entries(obj)
      .filter(([, value]) => value !== undefined)
      .map(([key, value]) => [
        key,
        value !== null && typeof value === 'object'
          ? removeUndefinedKeys(value as object)
          : value
      ])
  ) as Partial<T>;
}

/**
 * Converts all null values in an object to undefined recursively
 * @param obj The object to process
 * @returns A new object with null values converted to undefined
 */
export function turnNullKeysToUndefined<T extends object>(obj: T): {
  [K in keyof T]: T[K] extends null ? undefined :
  T[K] extends (infer U | null) ? U | undefined :
  T[K] extends object ? ReturnType<typeof turnNullKeysToUndefined<T[K]>> :
  T[K]
} {
  if (Array.isArray(obj)) {
    return obj.map(item =>
      item === null
        ? undefined
        : item !== null && typeof item === 'object'
          ? turnNullKeysToUndefined(item as object)
          : item

    ) as any;
  }

  return Object.fromEntries(
    Object.entries(obj).map(([key, value]) => [
      key,
      value === null
        ? undefined
        : value !== null && typeof value === 'object'
          ? turnNullKeysToUndefined(value as object)
          : value
    ])

  ) as any;
}

type MergeFilterArrays<T> = { _creationTime: number } & T;
type Options = { canLoadMore: boolean }
export const mergeLoadMoreArrays = <T, K>(array1: MergeFilterArrays<T>[], array2: MergeFilterArrays<K>[], options?: Options) => {
  const oldestTimeInArray1 = array1.length > 0 ? Math.min(...array1.map(a => a._creationTime)) : Infinity;
  return [
    // Only include items from array1 that are newer than the oldest item in array2 to avoid duplicates
    ...array1,
    ...array2.filter((a) => !options?.canLoadMore ? true : a._creationTime >= oldestTimeInArray1)
  ]
    .sort((a, b) => new Date(b._creationTime).getTime() - new Date(a._creationTime).getTime())
}

export const prismaToConvex = <T extends object>(obj: T) => turnNullKeysToUndefined(removeUndefinedKeys(obj));

export type Nullable<T> = T | null | undefined;