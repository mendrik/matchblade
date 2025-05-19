type AnyFn = (...args: any[]) => any

export function mapBy<T, R>(fn: (el: T) => R): (list: T[]) => Map<R, T>
export function mapBy<T, R>(fn: (el: T) => R, list: T[]): Map<R, T>
export function mapBy<T>(
	fn: (el: T) => any
): (list: T[]) => Map<ReturnType<typeof fn>, T>

/**
 * Takes a function and a list and returns a map where the keys are the result
 * of applying the function to each element and the values are the elements themselves.
 * @param fn
 * @param list
 * @returns
 */
export function mapBy(fn: AnyFn, list?: any[]): any {
	if (list === undefined) {
		return (list: any[]) => mapBy(fn, list)
	} else {
		const result = new Map()
		for (const el of list) {
			result.set(fn(el), el)
		}
		return result
	}
}
