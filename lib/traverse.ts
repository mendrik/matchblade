import { caseOf, match } from './match.ts'
import { _, isArray, isObject } from './utils.ts'

type Values<O> = O extends Record<string, any>
	? {
			[K in keyof O]: O[K] extends (infer U)[]
				? U extends Record<string, any>
					? Values<U> // If it's an array of objects, recurse into the object type
					: U[] // If it's an array of primitives, add the primitive array type
				: O[K] extends Record<string, any>
					? Values<O[K]> // If it's a nested object, recurse
					: O[K] // Otherwise, add the primitive type
		}[keyof O]
	: never

export function traverse<
	O extends Record<string, any>,
	R extends Record<keyof O, any>
>(fn: (el: Values<O>, key?: string) => Values<R>): (obj: O, key?: string) => R
export function traverse<
	O extends Record<string, any>,
	R extends Record<keyof O, any>
>(fn: (el: Values<O>, key?: string) => Values<R>, obj: O, key?: string): R

/**
 * Recursively traverses a nested data structure (object or array) and applies a
 * function to each non-container value (i.e., primitives).
 *
 * `traverse` walks through objects and arrays, and for any value that is not an
 * object or an array, it applies the provided function `fn`. The function `fn`
 * receives the value and its key/index (if applicable).
 *
 * This function can be used in a curried style.
 *
 * @template O - The type of the input object or array.
 * @template R - The type of the resulting object or array.
 * @param {(value: any, key?: string) => any} fn - The function to apply to each
 *   primitive value. It receives the value and its corresponding key.
 * @param {O} [obj] - The object or array to traverse. If not provided, `traverse`
 *   returns a curried function that takes the object.
 * @param {string} [key] - The initial key, used for the top-level call (rarely needed).
 * @returns {R | ((obj: O, key?: string) => R)} A new object or array with the
 *   function `fn` applied to all its primitive values. If `obj` is not provided,
 *   it returns a curried function.
 *
 * @example
 * import { traverse } from './traverse';
 *
 * const data = {
 *   a: 1,
 *   b: {
 *     c: 2,
 *     d: [3, 4],
 *   },
 *   e: 'hello'
 * };
 *
 * // Double all numbers in the structure
 * const doubler = (val: any) => (typeof val === 'number' ? val * 2 : val);
 * const result = traverse(doubler, data);
 * // result will be:
 * // {
 * //   a: 2,
 * //   b: {
 * //     c: 4,
 * //     d: [6, 8],
 * //   },
 * //   e: 'hello'
 * // }
 *
 * // --- Using with keys ---
 * const keyAppender = (val: any, key?: string) => (key ? `${key}_${val}` : val);
 * const keyedResult = traverse(keyAppender, data);
 * // keyedResult will be:
 * // {
 * //   a: 'a_1',
 * //   b: {
 * //     c: 'c_2',
 * //     d: [3, 4], // Note: keys for array elements are not passed
 * //   },
 * //   e: 'e_hello'
 * // }
 *
 * // --- Curried version ---
 * const data2 = { x: 10, y: 20 };
 * const multiplyBy3 = traverse((val: any) => (typeof val === 'number' ? val * 3 : val));
 * const curriedResult = multiplyBy3(data2);
 * // curriedResult will be: { x: 30, y: 60 }
 */
export function traverse(
	fn: (value: any, key?: string) => any,
	obj?: any,
	key?: string
): any {
	if (obj === undefined) {
		return (obj: object, key?: string) => traverse(fn as any, obj, key)
	} else {
		return match<[any, string | undefined], any>(
			caseOf([isArray, _], arr => arr.map(el => traverse(fn, el))),
			caseOf([isObject, _], o =>
				Object.fromEntries(
					Object.entries(o).map(([k, v]) => [k, traverse(fn, v, k)])
				)
			),
			caseOf([_, _], fn)
		)(obj, key)
	}
}
