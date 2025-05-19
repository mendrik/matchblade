import { isPromise } from 'ramda-adjunct'

export type Resolved<T> = {
	[K in keyof T]: T[K] extends Promise<infer R> ? R : T[K]
}

/**
 * awaitObj takes an object with values that may be promises and returns an promised object with the same keys
 * where the values are the resolved promises.
 * ```typescript
 * const obj = {
 * 	a: Promise.resolve(1)
 * 	b: 2
 * }
 * const resolved = await awaitObj(obj) // Promise<{a: number, b: number}>
 * // resolved = { a: 1, b: 2 }
 * ``` 
 * @param obj 
 * @returns 
 */
export async function awaitObj<T extends Record<string, any>>(
	obj: T
): Promise<Resolved<T>> {
	const keys = Object.keys(obj) as (keyof T)[]
	const resolvedEntries = await Promise.all(
		keys.map(async key => {
			const value = obj[key]
			return [key, isPromise(value) ? await value : value] as [
				keyof T,
				Resolved<T>[keyof T]
			]
		})
	)

	return Object.fromEntries(resolvedEntries) as Resolved<T>
}
