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
 * Recursively traverses an object or array, applying a function to each value.
 *
 * - If the value is an array, traverses each element.
 * - If the value is an object, traverses each property.
 * - If the value is a primitive, applies the function directly.
 * - The function `fn` receives the value and its key (if available).
 * - You can filter or transform values based on the key by checking the `key` argument in `fn`.
 *
 * @param fn Function to apply to each value. Receives (value, key).
 * @param obj Object or array to traverse.
 * @param key (Optional) Key of the current value.
 * @returns A new object or array with the function applied to each value.
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
