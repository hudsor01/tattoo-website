/**
 * type-utils.ts
 *
 * Utility types for common TypeScript type transformations and helpers.
 */

/**
 * Makes all properties in T optional
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

/**
 * Makes all properties in T nullable
 */
export type Nullable<T> = {
  [P in keyof T]: T[P] | null;
};

/**
 * Makes all properties in T readonly
 */
export type Immutable<T> = {
  readonly [P in keyof T]: T[P] extends object ? Immutable<T[P]> : T[P];
};

/**
 * Extracts keys of T where the value is of type U
 */
export type KeysOfType<T, U> = {
  [K in keyof T]: T[K] extends U ? K : never;
}[keyof T];

/**
 * Pick properties of T that are of type U
 */
export type PickByType<T, U> = {
  [P in KeysOfType<T, U>]: T[P];
};

/**
 * Omit properties of T that are of type U
 */
export type OmitByType<T, U> = {
  [P in keyof T as T[P] extends U ? never : P]: T[P];
};

/**
 * Makes specified properties optional
 */
export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

/**
 * Makes specified properties required
 */
export type RequiredBy<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>;

/**
 * Extracts non-function properties from T
 */
export type DataProps<T> = OmitByType<T, (...args: unknown[]) => unknown>;

/**
 * Extracts function properties from T (methods)
 */
export type MethodProps<T> = PickByType<T, (...args: unknown[]) => unknown>;

/**
 * Converts a union type to an intersection type
 */
export type UnionToIntersection<U> = (U extends unknown ? (k: U) => void : never) extends (
  k: infer I
) => void
  ? I
  : never;

/**
 * Defines props for a component that expects children
 */
export type WithChildren<P = Record<string, unknown>> = P & { children?: React.ReactNode };

/**
 * Makes specified properties in T non-nullable
 */
export type NonNullableProps<T, K extends keyof T> = {
  [P in keyof T]: P extends K ? NonNullable<T[P]> : T[P];
};

/**
 * Makes all properties in T non-nullable
 */
export type NonNullableAll<T> = {
  [P in keyof T]: NonNullable<T[P]>;
};

/**
 * Extract keys of T that are optional
 */
export type OptionalKeys<T> = {
  [K in keyof T]-?: Record<string, unknown> extends Pick<T, K> ? K : never;
}[keyof T];

/**
 * Extract keys of T that are required
 */
export type RequiredKeys<T> = {
  [K in keyof T]-?: Record<string, unknown> extends Pick<T, K> ? never : K;
}[keyof T];

/**
 * Convert array type to its element type
 */
export type ElementType<T extends ReadonlyArray<unknown>> =
  T extends ReadonlyArray<infer E> ? E : never;

/**
 * Create a type with a subset of properties in T that match predicate P
 */
export type FilterProps<T, P> = Pick<T, { [K in keyof T]: P extends T[K] ? K : never }[keyof T]>;

/**
 * Create a discriminated union from a type and property name
 */
export type DiscriminateUnion<T, K extends keyof T, V extends T[K]> = T extends { [key in K]: V }
  ? T
  : never;
