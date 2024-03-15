/**
 * https://github.com/SunshowerC/blog/issues/7
 * https://github.com/microsoft/TypeScript/issues/1897
 * https://github.com/basarat/typescript-book/blob/master/docs/styleguide/styleguide.md#type
 * https://stackoverflow.com/questions/53718296/index-d-ts-vs-normal-type-file
 *
 * we only allow name-value pair for now
 */

/**
 * value in the data store.
 * Could be any primitive, array or map with string as key
 */
export type Value =
  | string
  | number
  | boolean
  | null
  | Value[]
  | { [key: string]: Value };

/**
 * data store
 */
export type Data = Record<string, Value>;

/**
 * path context as `data.a.b` => { scope: 'data', path: 'a.b'}
 */
export interface PathContext {
  scope: string;
  path: string;
}

/**
 * primitive type in store
 */
export type FunctionType = (...args: unknown[]) => unknown;

export type Primitive = boolean | number | string;

export type DataPrimitiveStore = Record<string, Primitive>;

export interface Action {
  (inputs: Data, context: Data): Promise<Data>;
}

export interface Step {
  name: string;
  type: string;
  description?: string;
  context?: {
    name: string;
    module: string;
  };
  inputs: Data;
  deps?: string[];
}

/**
 * flow is a list of steps
 */
export type Flow = Step[];

/**
 * batch is a list of steps could be executed in parallel
 */
type Batch = Step[];

/**
 * plan is a list of steps, each element is a batch of steps
 */
export type Plan = Batch[];
