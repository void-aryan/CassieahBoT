export type SplitDotRecursive<S extends string> =
  S extends `${infer Head}.${infer Tail}`
    ? [Head, ...SplitDotRecursive<Tail>, ...string[]]
    : [S, ...string[]];

export type SplitPipeRecursive<S extends string> =
  S extends `${infer Head}|${infer Tail}`
    ? [Head, ...SplitPipeRecursive<Tail>, ...string[]]
    : [S, ...string[]];

export type SplitRecursive<
  Sep extends string,
  Str extends string
> = Str extends `${infer Head}${Sep}${infer Tail}`
  ? [Head, ...SplitRecursive<Sep, Tail>, ...string[]]
  : [Str, ...string[]];

export function splitDot<S extends string>(str: S): SplitDotRecursive<S> {
  return str.split(".") as SplitDotRecursive<S>;
}

export function splitPipe<S extends string>(str: S): SplitPipeRecursive<S> {
  return str.split("|") as SplitPipeRecursive<S>;
}

export function splitStr<Sep extends string, Str extends string>(
  separator: Sep,
  str: Str
): SplitRecursive<Sep, Str> {
  return str.split(separator) as SplitRecursive<Sep, Str>;
}

export type PickWithRest<T, K extends keyof T> = Pick<T, K> &
  Partial<Omit<T, K>>;

export type PlainObject<V> = {
  [key: ObjectKey]: V;
};

export type ObjectKey = string | number | symbol;

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type Overwrite<T, U> = Omit<T, keyof U> & U;

export type Mutable<T> = {
  -readonly [P in keyof T]: T[P];
};

export type Primitive =
  | string
  | number
  | boolean
  | bigint
  | symbol
  | null
  | undefined;

export type Serializable =
  | Primitive
  | Serializable[]
  | { [key: string]: Serializable };

export type NonPrimitive<T = unknown> = T extends Primitive ? never : T;

export type UnknownExtra<T> = T & { [key: string]: unknown };

export type UnknownExtraRecursive<T> = T extends Array<infer U>
  ? Array<UnknownExtraRecursive<U>>
  : T extends object
  ? { [K in keyof T]: UnknownExtraRecursive<T[K]> } & { [key: string]: unknown }
  : T;

export type UncheckedArray<T> = Array<T> & {
  [index: number]: T;
};

export function isPrimitive(value: unknown): value is Primitive {
  const type = typeof value;
  return (
    value === null ||
    value === undefined ||
    type === "string" ||
    type === "number" ||
    type === "boolean" ||
    type === "bigint" ||
    type === "symbol"
  );
}

export function isSerializable(value: unknown): value is Serializable {
  if (isPrimitive(value)) return true;

  if (Array.isArray(value)) {
    return value.every(isSerializable);
  }

  if (typeof value === "object" && value !== null) {
    return Object.values(value).every(isSerializable);
  }

  return false;
}

export function isNonPrimitive<T>(value: T): value is NonPrimitive<T> {
  return !isPrimitive(value);
}

export function overwrite<T, U>(target: T, source: U): Overwrite<T, U> {
  return { ...target, ...source } as Overwrite<T, U>;
}

export function deepMerge<T extends object, U extends object>(
  target: T,
  source: U
): T & U {
  const result = { ...target } as any;

  for (const key in source) {
    const sourceVal = source[key];
    const targetVal = (target as any)[key];

    if (
      typeof targetVal === "object" &&
      targetVal !== null &&
      typeof sourceVal === "object" &&
      sourceVal !== null &&
      !Array.isArray(sourceVal)
    ) {
      result[key] = deepMerge(targetVal, sourceVal);
    } else {
      result[key] = sourceVal;
    }
  }

  return result;
}

export function pickWithRest<T, K extends keyof T>(
  obj: T,
  keys: readonly K[]
): PickWithRest<T, K> {
  const [pickedEntries, restEntries] = Object.entries(obj).reduce(
    ([picked, rest], [key, value]) => {
      if ((keys as readonly string[]).includes(key)) {
        picked.push([key as K, value as T[K]]);
      } else {
        rest.push([
          key as Exclude<keyof T, K>,
          value as T[Exclude<keyof T, K>],
        ]);
      }
      return [picked, rest];
    },
    [[], []]
  );

  const picked = Object.fromEntries(pickedEntries) as Pick<T, K>;
  const rest = Object.fromEntries(restEntries) as Partial<Omit<T, K>>;

  return { ...picked, ...rest } as PickWithRest<T, K>;
}
