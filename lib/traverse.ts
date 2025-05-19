import { T as _, map, mapObjIndexed } from 'ramda'
import { isArray, isObj } from 'ramda-adjunct'
import { caseOf, match } from './match.ts'

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
 * Can be used to traverse an object and apply a function to each value. Descends into arrays and objects.
 * @param fn
 * @param obj
 * @param key
 * @returns
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
			caseOf([isArray, _], map(traverse(fn))),
			caseOf([isObj, _], v => mapObjIndexed(traverse(fn), v)),
			caseOf([_, _], fn)
		)(obj, key)
	}
}
