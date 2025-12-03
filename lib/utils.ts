/**
 * A wildcard matcher that always returns true.
 * This is useful as a placeholder in pattern matching to signify that any value is acceptable in a certain position.
 *
 * @returns {true} Always returns `true`.
 *
 * @example
 * import { match, caseOf, _ } from './match';
 *
 * const greet = match<[string], string>(
 *   caseOf(['John'], () => 'Hello, John!'),
 *   caseOf([_], (name) => `Hi, ${name}!`)
 * );
 *
 * greet('Jane'); // "Hi, Jane!"
 * greet('John'); // "Hello, John!"
 */
export const _ = () => true

/**
 * Checks if a value is an array.
 * A simple alias for `Array.isArray`.
 *
 * @param {*} value - The value to check.
 * @returns {boolean} `true` if the value is an array, otherwise `false`.
 *
 * @example
 * isArray([]); // true
 * isArray([1, 2, 3]); // true
 * isArray({}); // false
 * isArray("hello"); // false
 */
export const isArray = Array.isArray.bind(Array)

/**
 * Checks if a value is a plain object.
 *
 * @param {*} obj - The value to check.
 * @returns {boolean} `true` if the value is a plain object, otherwise `false`.
 *
 * @example
 * isObject({}); // true
 * isObject({ a: 1 }); // true
 * isObject([]); // false
 * isObject(new Date()); // false
 */
export const isObject = (obj: unknown): obj is object =>
	Object.prototype.toString.call(obj) === '[object Object]'

/**
 * Checks if a value is a Promise.
 *
 * @param {*} obj - The value to check.
 * @returns {boolean} `true` if the value is a Promise, otherwise `false`.
 *
 * @example
 * isPromise(new Promise(() => {})); // true
 * isPromise(Promise.resolve()); // true
 * isPromise({}); // false
 */
export const isPromise = (obj: unknown): obj is object =>
	Object.prototype.toString.call(obj) === '[object Promise]'

/**
 * Checks if a value is a function.
 * This includes regular functions, async functions, and generator functions.
 *
 * @param {*} value - The value to check.
 * @returns {boolean} `true` if the value is a function, otherwise `false`.
 *
 * @example
 * isFunction(() => {}); // true
 * isFunction(async function() {}); // true
 * isFunction(function*() {}); // true
 * isFunction("hello"); // false
 */
export const isFunction = (value: unknown): value is Function =>
	typeof value === 'function' ||
	Object.prototype.toString.call(value) === '[object Function]' ||
	Object.prototype.toString.call(value) === '[object AsyncFunction]' ||
	Object.prototype.toString.call(value) === '[object GeneratorFunction]'

/**
 * Checks if a value is undefined.
 *
 * @param {*} value - The value to check.
 * @returns {boolean} `true` if the value is undefined, otherwise `false`.
 *
 * @example
 * isUndefined(undefined); // true
 * isUndefined(null); // false
 * isUndefined(0); // false
 */
export const isUndefined = (value: unknown): value is undefined =>
	typeof value === 'undefined'

/**
 * Checks if a value is not undefined.
 *
 * @param {*} value - The value to check.
 * @returns {boolean} `true` if the value is not undefined, otherwise `false`.
 *
 * @example
 * isNotUndefined(0); // true
 * isNotUndefined(null); // true
 * isNotUndefined(undefined); // false
 */
export const isNotUndefined = (value: unknown): value is object =>
	!isUndefined(value)
