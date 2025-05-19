import fs from "fs/promises";
import { ObjectKey } from "./unitypes";

export namespace Datum {
  /**
   * Represents the structure of a package.json file.
   * Extends the imported package.json types with optional fields.
   */
  export type PackageJson = typeof import("@root/package.json") & {
    /** Package name */
    name?: string;
    /** Package version */
    version?: string;
    /** Dependencies map: package name to version string */
    dependencies?: Record<string, string>;
    /** Dev dependencies map: package name to version string */
    devDependencies?: Record<string, string>;
    /** Additional arbitrary fields */
    [key: string]: any;
  };

  /**
   * Query operators for filtering values of type T.
   * Supports equality, inequality, comparison, inclusion, and regex matching.
   */
  type QueryOperator<T> =
    | { $eq?: T }
    | { $ne?: T }
    | { $gt?: T }
    | { $gte?: T }
    | { $lt?: T }
    | { $lte?: T }
    | { $in?: T[] }
    | { $nin?: T[] }
    | { $regex?: RegExp };

  /**
   * Query type for filtering objects of type T.
   * Each key in T can be matched against a QueryOperator or direct value.
   */
  export type Query<T> = Partial<
    Record<keyof T, QueryOperator<T[keyof T]> | T[keyof T]>
  >;

  /**
   * Schema type for validating objects.
   * Can be a string representing a primitive type, a constructor function, or nested schemas.
   */
  export type Schema = string | Function | { [key: string]: Schema };

  /**
   * Reads and parses a package.json file asynchronously.
   * @param pkgPath - Path to the package.json file (default: "./package.json")
   * @returns Promise resolving to the parsed PackageJson object, or null if read/parse fails
   */
  export async function readPackageJson(
    pkgPath = "./package.json"
  ): Promise<PackageJson | null> {
    try {
      const data = await fs.readFile(pkgPath, "utf-8");
      return JSON.parse(data);
    } catch {
      return null;
    }
  }

  /**
   * Retrieves the `name` field from a package.json file asynchronously.
   * @param pkgPath - Path to the package.json file (default: "./package.json")
   * @returns Promise resolving to the package name string or null if not found/error
   */
  export async function getPackageName(
    pkgPath = "./package.json"
  ): Promise<string | null> {
    const pkg = await readPackageJson(pkgPath);
    return pkg?.name ?? null;
  }

  /**
   * Retrieves the `version` field from a package.json file asynchronously.
   * @param pkgPath - Path to the package.json file (default: "./package.json")
   * @returns Promise resolving to the package version string or null if not found/error
   */
  export async function getPackageVersion(
    pkgPath = "./package.json"
  ): Promise<string | null> {
    const pkg = await readPackageJson(pkgPath);
    return pkg?.version ?? null;
  }

  /**
   * Updates the package.json file at the specified path by applying an updater function.
   * Reads the existing package.json, applies the updater, and writes back the result.
   * @param pkgPath - Path to the package.json file
   * @param updater - Function receiving the current PackageJson and returning the updated PackageJson
   * @returns Promise resolving when the update and write operation completes
   */
  export async function updatePackageJson(
    pkgPath: string,
    updater: (pkg: PackageJson) => PackageJson
  ): Promise<void> {
    const pkg = (await readPackageJson(pkgPath)) || ({} as PackageJson);
    const updated = updater(pkg);
    await fs.writeFile(pkgPath, JSON.stringify(updated, null, 2));
  }

  /**
   * Parses a JSON string into an object of type T.
   * Returns null if parsing fails.
   * @param jsonStr - JSON string to parse
   * @returns Parsed object of type T or null if invalid JSON
   */
  export function parseJson<T>(jsonStr: string): T | null {
    try {
      return JSON.parse(jsonStr);
    } catch {
      return null;
    }
  }

  /**
   * Stringifies an object into a JSON string.
   * Optionally pretty-prints with 2-space indentation.
   * @param obj - Object to stringify
   * @param pretty - If true, format JSON with indentation (default: false)
   * @returns JSON string representation of the object
   */
  export function stringifyJson(obj: unknown, pretty = false): string {
    return pretty ? JSON.stringify(obj, null, 2) : JSON.stringify(obj);
  }

  /**
   * Validates if an object matches a given schema.
   * Supports primitive type strings, constructor functions, and nested schemas.
   * @param obj - Object to validate
   * @param schema - Schema definition to validate against
   * @returns True if object matches schema, false otherwise
   */
  export function validateSchema(obj: unknown, schema: Schema): boolean {
    if (typeof schema === "string") {
      return typeof obj === schema;
    }

    if (typeof schema === "function") {
      return obj instanceof schema;
    }

    if (
      typeof schema === "object" &&
      schema !== null &&
      typeof obj === "object" &&
      obj !== null
    ) {
      for (const key in schema) {
        if (!validateSchema((obj as any)[key], schema[key])) {
          return false;
        }
      }
      return true;
    }

    return false;
  }

  /**
   * Internal helper to check if a value matches a query condition or operator.
   * Supports equality, inequality, comparison, inclusion, and regex operators.
   * @param value - The value to test
   * @param condition - Query condition or direct value
   * @returns True if value matches condition, false otherwise
   */
  function matchesField<T>(value: T, condition: QueryOperator<T> | T): boolean {
    if (condition instanceof RegExp) {
      return typeof value === "string" && condition.test(value);
    }

    if (typeof condition !== "object" || condition === null) {
      return value === condition;
    }

    if (
      typeof value === "object" &&
      value !== null &&
      !Array.isArray(value) &&
      !(
        "$eq" in condition ||
        "$ne" in condition ||
        "$gt" in condition ||
        "$gte" in condition ||
        "$lt" in condition ||
        "$lte" in condition ||
        "$in" in condition ||
        "$nin" in condition ||
        "$regex" in condition
      )
    ) {
      for (const key in condition) {
        if (!matchesField((value as any)[key], (condition as any)[key])) {
          return false;
        }
      }
      return true;
    }

    for (const op in condition) {
      const condVal = (condition as any)[op];
      switch (op) {
        case "$eq":
          if (value !== condVal) return false;
          break;
        case "$ne":
          if (value === condVal) return false;
          break;
        case "$gt":
          if (!(value > condVal)) return false;
          break;
        case "$gte":
          if (!(value >= condVal)) return false;
          break;
        case "$lt":
          if (!(value < condVal)) return false;
          break;
        case "$lte":
          if (!(value <= condVal)) return false;
          break;
        case "$in":
          if (!Array.isArray(condVal) || !condVal.includes(value)) return false;
          break;
        case "$nin":
          if (Array.isArray(condVal) && condVal.includes(value)) return false;
          break;
        case "$regex":
          if (typeof value !== "string" || !condVal.test(value)) return false;
          break;
        default:
          return false;
      }
    }

    return true;
  }

  /**
   * Filters data entries based on a query object.
   * Supports data as a Record or Map.
   * @param data - Data collection to query (Record or Map)
   * @param query - Query object specifying filter conditions
   * @returns Array of matching data items
   */
  export function queryData<T>(
    data: Record<string, T> | Map<string, T>,
    query: Query<T>
  ): T[] {
    const items =
      data instanceof Map ? Array.from(data.values()) : Object.values(data);
    return items.filter((item) => {
      for (const key in query) {
        const condition = query[key];
        const val = (item as any)[key];
        if (!matchesField(val, condition as any)) {
          return false;
        }
      }
      return true;
    });
  }

  /**
   * Returns the key or keys in the object that match the given value.
   * @param value - The value to search for.
   * @param parentObj - The object to search within.
   * @returns The first matching key as a string, or an array of matching keys, or null if none found.
   */
  export function keyOf<T extends object>(
    value: unknown,
    parentObj: T
  ): string | string[] | null {
    const keys = Object.entries(parentObj)
      .filter(([_, v]) => v === value)
      .map(([k]) => k);

    if (keys.length === 0) return null;
    return keys.length === 1 ? keys[0] : keys;
  }

  /**
   * Returns the value or values from the object for the given key(s).
   * @param key - A single key or an array of keys.
   * @param parentObj - The object to retrieve values from.
   * @returns The value for a single key, an array of values for multiple keys, or null if not found.
   */
  export function valueOf<T extends object>(
    key: keyof T | (keyof T)[],
    parentObj: T
  ): T[keyof T] | T[keyof T][] | null {
    if (Array.isArray(key)) {
      const values = key
        .map((k) => parentObj[k])
        .filter((v) => v !== undefined);

      if (values.length === 0) return null;
      return values;
    }

    const val = parentObj[key];
    return val !== undefined ? val : null;
  }

  type ObjectKey = string | number | symbol;

  export function makeMapPlain<T extends Record<ObjectKey, any>>(
    plainObj: T = {} as T
  ) {
    const internalMap = new Map<keyof T, T[keyof T]>(
      Object.entries(plainObj) as [keyof T, T[keyof T]][]
    );

    const target: T = Object.create(Object.getPrototypeOf(plainObj));

    const handler: ProxyHandler<T> = {
      get(target, prop, receiver) {
        if (prop === Symbol.iterator) {
          return function* () {
            for (const [key, value] of internalMap) {
              yield [key, value];
            }
          };
        }
        if (typeof prop === "symbol" || prop in Object.prototype) {
          return Reflect.get(target, prop, receiver);
        }
        return internalMap.get(prop as keyof T);
      },
      set(_target, prop, value, _receiver) {
        internalMap.set(prop as keyof T, value);
        return true;
      },
      deleteProperty(_target, prop) {
        return internalMap.delete(prop as keyof T);
      },
      has(_target, prop) {
        return internalMap.has(prop as keyof T);
      },
      ownKeys(_target) {
        return Array.from(internalMap.keys()) as Array<string | symbol>;
      },
      getOwnPropertyDescriptor(_target, prop) {
        if (internalMap.has(prop as keyof T)) {
          return {
            value: internalMap.get(prop as keyof T),
            writable: true,
            enumerable: true,
            configurable: true,
          };
        }
        return undefined;
      },
      defineProperty(_target, prop, descriptor) {
        if ("value" in descriptor && descriptor.value !== undefined) {
          internalMap.set(prop as keyof T, descriptor.value);
        } else if (!descriptor.get && !descriptor.set) {
          internalMap.delete(prop as keyof T);
        }
        return true;
      },
      getPrototypeOf(target) {
        return Object.getPrototypeOf(target);
      },
      setPrototypeOf(target, proto) {
        Object.setPrototypeOf(target, proto);
        return true;
      },
      isExtensible(_target) {
        return true;
      },
      preventExtensions(_target) {
        return false;
      },
    };

    const proxied = new Proxy(target, handler);
    return { map: internalMap, proxied };
  }
}

// ---------------------------
// Benchmark Function
// ---------------------------

export function benchmark() {
  const size = 3000;
  const keys = Array.from(
    { length: size },
    (_, i) => `key${i}`
  ) as (keyof Record<string, number>)[];

  const plainObj: Record<string, number> = {};
  keys.forEach((k) => (plainObj[k] = 0));

  const { proxied } = Datum.makeMapPlain(plainObj);

  function measure(fn: () => void): number {
    const start = performance.now();
    fn();
    return performance.now() - start;
  }

  const plainGet = measure(() => {
    for (const key of keys) {
      const v = plainObj[key];
    }
  });

  const proxyGet = measure(() => {
    for (const key of keys) {
      const v = proxied[key];
    }
  });

  const plainSet = measure(() => {
    for (const key of keys) {
      plainObj[key] = 123;
    }
  });

  const proxySet = measure(() => {
    for (const key of keys) {
      proxied[key] = 123;
    }
  });

  const plainDelete = measure(() => {
    for (const key of keys) {
      delete plainObj[key];
    }
  });

  const proxyDelete = measure(() => {
    for (const key of keys) {
      delete proxied[key];
    }
  });

  console.log(`Performance results for ${size} records (ms):`);
  console.log(
    `Plain Object - get: ${plainGet.toFixed(2)} | set: ${plainSet.toFixed(
      2
    )} | delete: ${plainDelete.toFixed(2)}`
  );
  console.log(
    `Proxy + Map  - get: ${proxyGet.toFixed(2)} | set: ${proxySet.toFixed(
      2
    )} | delete: ${proxyDelete.toFixed(2)}`
  );
}
