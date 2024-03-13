import { Action, FunctionType } from "../types";

const _functions = {} as Record<string,Record<string, FunctionType>>;

/**
 * register libraries
 * 
 * @param moduleName name of the module
 * @param deps lib implementation
 */
export const registerModule = (moduleName: string, deps: Record<string, FunctionType>) => {
    _functions[moduleName] = deps;
};

/**
 * get functions inside a specific modules
 * 
 * @param moduleName name of the module
 */
export const getFunctions = (moduleName: string) => {
    return _functions[moduleName] || {};
};


/**
 * get function
 * 
 * @param moduleName name of the module
 * @param functionName name of the function
 */
export const getFunction = (moduleName: string, functionName: string) => {
    return (_functions[moduleName] || {})[functionName] as Action;
};
