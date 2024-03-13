import { Data, FunctionType, PathContext } from "./types";
import yaml from "js-yaml";

export function debounce(func, wait) {
  let timeout;
  return function (...args) {
    return new Promise((resolve, reject) => {
      const later = () => {
        clearTimeout(timeout);
        try {
          resolve(func.apply(this, args));
        } catch (e) {
          reject(e);
        }
      };

      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    });
  };
}

export function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * escape string as regex input
 * https://stackoverflow.com/questions/6828637/escape-regexp-strings
 *
 * @param str input string
 * @returns output string with regular expression escaped
 */
export const escapeRegExp = (str: string): string => {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); // $& means the whole matched string
};

/**
 * convert string like 'MyButton' to 'my-button'
 * @param str input string as 'MyButton'
 * @returns output string as 'my-button'
 */
export const camelCaseToHyphen = (str: string): string => {
  return str
    .replace(/^./, str[0].toLowerCase())
    .replace(/([A-Z])/g, (_, firstMatch) => `-${firstMatch.toLowerCase()}`);
};

export const evalJsBlock = (
  expr: string,
  scope: Record<string, unknown>,
  ignoreError = false,
  applyObject?: object
): unknown => {
  const names = scope ? Object.keys(scope) : [];
  const vals = scope ? Object.values(scope) : [];
  try {
    const func = new Function(...names, expr);
    return func.apply(applyObject, vals);
  } catch (e: unknown) {
    if (!ignoreError) {
      throw new Error(
        `evalExpression('${expr}') => ${(e as Record<string, string>).message}`
      );
    } else {
      return undefined;
    }
  }
};

/**
 * evaluate expression string as Javascript expression
 *
 * @param expr expression string
 * @param scope evaluation scope as name-value pair
 * @param ignoreError if true the error is not thrown
 * @param applyObject object will apply to the expr as this
 * @returns evaluation result
 */
export const evalExpression = (
  expr: string,
  scope: Record<string, unknown>,
  ignoreError = false,
  applyObject?: object
): unknown => {
  return evalJsBlock(`return ${expr.trim()}`, scope, ignoreError, applyObject);
};

export const evalStringTemplate = (
  expr: string,
  scope: Record<string, unknown>,
  ignoreError = false,
  applyObject?: object
): string => {
  return evalJsBlock(
    `return \`${expr.trim().replace(/\\/g, "\\\\").replace(/`/g, "\\`")}\``,
    scope,
    ignoreError,
    applyObject
  ) as string;
};

/**
 * Parse view string as DOM without interpret it. Browser version
 *
 * @param input view template as string
 * @returns DOM Node as result
 */
export const parseView = (input: string): HTMLElement => {
  const parser = new DOMParser();
  const fragement = document.createDocumentFragment();
  fragement.appendChild(
    parser.parseFromString(`<div>${input}</div>`, "text/html").body
      .firstChild || document.createElement("div")
  );
  return (fragement.firstChild || document.createElement("div")) as HTMLElement;
};

/**
 * Bind arguments starting after however many are passed in.
 * https://stackoverflow.com/questions/27699493/javascript-partially-applied-function-how-to-bind-only-the-2nd-parameter
 *
 * @param fn function needs to bind with arguments
 * @param boundArgs arguments will be bound at then end of the function interface
 * @returns new function with bindings
 */
export const bindTrailingArgs = (
  fn: FunctionType,
  ...boundArgs: unknown[]
): FunctionType => {
  return function (...args: unknown[]): unknown {
    return fn(...args, ...boundArgs);
  };
};

/**
 * Polyfill to match dynamic import result back to ES5 supported module
 *
 * @param obj - function to evaluate after loading the dependencies.
 * @returns ES5 module object
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const interopES6Default = (obj: any): any => {
  return obj && obj.__esModule && obj.default ? obj.default : obj;
};

/**
 * simple http get.
 *
 * @param theUrl url as string
 * @returns promise with response text
 */
export const httpGet = (theUrl: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function (): void {
      if (xmlHttp.readyState === 4 && xmlHttp.status === 200) {
        resolve(xmlHttp.responseText);
      }
    };

    xmlHttp.onerror = function (e): void {
      reject(e);
    };

    xmlHttp.open("GET", theUrl, true); // true for asynchronous
    xmlHttp.send(null);
  });
};

/**
 *
 * Returns Base URL for the current application
 *
 * @returns Base URL for the current application's root 'document' without any query or location attributes
 *          and (if otherwise valid) with a trailing '/' assured.
 */
export const getBaseURL: { (): string; _baseURL?: string } = () => {
  if (!getBaseURL._baseURL) {
    // strip 'index.html' from end of pathname if present
    const location = window.location;

    const pathname = location.pathname;

    // IE11 on Windows 10 doesn't have 'location.origin' object
    const origin =
      location.origin ||
      location.protocol +
        "//" +
        location.hostname +
        (location.port ? ":" + location.port : "");

    getBaseURL._baseURL =
      origin + pathname.substring(0, pathname.lastIndexOf("/") + 1);
  }

  return getBaseURL._baseURL;
};

/**
 * parse data path to scope + subPatoh
 * @param pathStr path string like 'data.a.b'
 * @returns path structure
 */
export const parseDataPath = (pathStr: string): PathContext => {
  const match = pathStr.match(/[.[]/);
  if (match && match.index !== undefined) {
    return {
      scope: pathStr.substr(0, match.index),
      path: pathStr.substr(match[0] === "[" ? match.index : match.index + 1),
    };
  }
  return {
    scope: pathStr,
    path: "",
  };
};

/**
 * Check value type is primitive or not
 * @param val input value
 * @returns true if input is number or string
 */
export const isPrimitive = (val: unknown): boolean => {
  const type = typeof val;
  return type === "number" || type === "string" || type === "boolean";
};

export const isArray = Array.isArray;

export const isObject = (val: unknown): boolean =>
  Boolean(val) && !isPrimitive(val) && !isArray(val);

//////////////////////////////////////////////////////////////
// data getter / setter
//////////////////////////////////////////////////////////////

/**
 * get value from scope
 *
 * @param scope scope for evaluation
 * @param path path to fetch faom scope
 * @returns value from specific path
 */
export const getValue = (scope: Data, path: string): Data => {
  // return _.get( scope, expr );
  // TODO: when the scope has .xxx, evalFunction will fail but _.get still success
  return evalExpression(path, scope, true) as Data;
};

/**
 * parse expr ${aa.bb}} to get aa.bb
 * @param str input string
 * @returns the expression inside ${}
 */
export const parseExpr = (str: string): string => {
  const match = str.match(/^{{(.*)}}$/);
  return match ? match[1] : "";
};

/**
 * fastest way to copy a pure JSON object, use on your own risk
 * https://stackoverflow.com/questions/122102/what-is-the-most-efficient-way-to-deep-clone-an-object-in-javascript
 *
 * @param input JSON object as input
 * @returns JSON object
 */
export const cloneJson = (input: Data): Data => {
  return input ? JSON.parse(JSON.stringify(input)) : input;
};

/**
 *
 * @param fileName json file name
 * @param data json data content
 */
export const downloadYaml = (fileName, data) => {
  // Convert JSON data to string
  const yamlString = yaml.dump(data, {
    lineWidth: -1,
    noRefs: true,
    noCompatMode: true,
  });

  // Create a Blob with the JSON string
  const blob = new Blob([yamlString], { type: "text/plain" });

  // Create a URL for the blob
  const url = URL.createObjectURL(blob);

  // Create a temporary anchor element and trigger the download
  const a = document.createElement("a");
  a.href = url;
  a.download = `${fileName || "download"}.yaml`; // Default file name if none provided
  document.body.appendChild(a); // Append to the document
  a.click(); // Trigger the download

  // Cleanup: remove the temporary element and revoke the blob URL
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export const uploadYaml = () => {
  return new Promise((resolve, reject) => {
    // Create a temporary anchor element and trigger the download
    const fileUploadElem = document.createElement("input");
    fileUploadElem.type = "file";
    fileUploadElem.style.display = "none";

    fileUploadElem.addEventListener("change", function (event) {
      const reader = new FileReader();
      reader.onload = function (event) {
        try {
          const json = yaml.load((event.target as any).result);
          // Process the JSON data here
          resolve(json);
        } catch (error) {
          console.error("Error parsing JSON:", error);
          reject(error);
        }
      };

      const file = (event.target as any).files[0];
      if (file) {
        reader.readAsText(file);
      } else {
        console.log("No file selected");
      }
    });

    fileUploadElem.click();
  });

  // Cleanup: remove the temporary element and revoke the blob URL
  // document.body.removeChild(fileUploadElem);
};

/**
 *
 * @param jsonData json data content
 * @param fileName json file name
 */
export const downloadJSON = (fileName, jsonData) => {
  // Convert JSON data to string
  const jsonString = JSON.stringify(jsonData, null, 2); // null and 2 arguments for pretty-printing

  // Create a Blob with the JSON string
  const blob = new Blob([jsonString], { type: "application/json" });

  // Create a URL for the blob
  const url = URL.createObjectURL(blob);

  // Create a temporary anchor element and trigger the download
  const a = document.createElement("a");
  a.href = url;
  a.download = `${fileName || "download"}.json`; // Default file name if none provided
  document.body.appendChild(a); // Append to the document
  a.click(); // Trigger the download

  // Cleanup: remove the temporary element and revoke the blob URL
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export const uploadJSON = () => {
  return new Promise((resolve, reject) => {
    // Create a temporary anchor element and trigger the download
    const fileUploadElem = document.createElement("input");
    fileUploadElem.type = "file";
    fileUploadElem.style.display = "none";

    fileUploadElem.addEventListener("change", function (event) {
      const reader = new FileReader();
      reader.onload = function (event) {
        try {
          const json = JSON.parse((event.target as any).result);
          console.log("File content:", json);
          // Process the JSON data here
          resolve(json);
        } catch (error) {
          console.error("Error parsing JSON:", error);
          reject(error);
        }
      };

      const file = (event.target as any).files[0];
      if (file) {
        reader.readAsText(file);
      } else {
        console.log("No file selected");
      }
    });

    fileUploadElem.click();
  });

  // Cleanup: remove the temporary element and revoke the blob URL
  // document.body.removeChild(fileUploadElem);
};
