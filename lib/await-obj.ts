import { isPromise } from './utils.ts'

export type Resolved<T> = {
	[K in keyof T]: T[K] extends Promise<infer R> ? R : T[K]
}

/**
 * Resolves all `Promise` values within an object.
 *
 * This function takes an object where some properties are `Promise`s and returns a
 * new `Promise` that resolves to an object with the same keys, but with all `Promise`s
 * replaced by their resolved values. Non-`Promise` values are passed through unchanged.
 *
 * If any of the `Promise`s in the object reject, the `Promise` returned by `awaitObj`
 * will also reject.
 *
 * @template T - The type of the input object, which can have `Promise`s as values.
 * @param {T} obj - The object containing properties that may be `Promise`s.
 * @returns {Promise<Resolved<T>>} A `Promise` that resolves to a new object where all
 *   `Promise`s have been resolved to their values.
 *
 * @example
 * import { awaitObj } from './await-obj';
 *
 * // --- Basic usage ---
 * const data = {
 *   user: Promise.resolve({ id: 1, name: 'Alice' }),
 *   posts: Promise.resolve(['Post 1', 'Post 2']),
 *   version: 2,
 * };
 *
 * const resolvedData = await awaitObj(data);
 * // resolvedData will be:
 * // {
 * //   user: { id: 1, name: 'Alice' },
 * //   posts: ['Post 1', 'Post 2'],
 * //   version: 2,
 * // }
 *
 * // --- With mixed values ---
 * const mixed = {
 *   a: Promise.resolve(1),
 *   b: 2,
 *   c: 'hello',
 * };
 *
 * const resolvedMixed = await awaitObj(mixed);
 * console.log(resolvedMixed); // { a: 1, b: 2, c: 'hello' }
 *
 * // --- Handling rejection ---
 * const failing = {
 *   a: Promise.resolve(1),
 *   b: Promise.reject(new Error('Something went wrong')),
 * };
 *
 * try {
 *   await awaitObj(failing);
 * } catch (error) {
 *   console.error(error.message); // "Something went wrong"
 * }
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
