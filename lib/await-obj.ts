import { isPromise } from './utils.ts'

export type Resolved<T> = {
	[K in keyof T]: T[K] extends Promise<infer R> ? R : T[K]
}

/**
 * Resolves all properties of an object that are Promises.
 *
 * This function takes an object where some values might be Promises. It waits for all
 * these Promises to resolve and returns a new object with the same keys but with
 * the resolved values.
 * 
 * * ```typescript
 * const obj = {
 * 	a: Promise.resolve(1)
 * 	b: 2
 * }
 * const resolved = await awaitObj(obj) // Promise<{a: number, b: number}>
 * // resolved = { a: 1, b: 2 }
 * ```
 * 
 * @template T The type of the input object.
 * @param obj The object containing potentially promised values.
 * @returns A Promise that resolves to a new object with all values resolved.
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
