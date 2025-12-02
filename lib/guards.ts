/**
 * Creates a function that throws an error if the input matches the guard.
 *
 * @template T The type of the input value.
 * @template G The type guarded by the guard function.
 * @param guard A type guard function that returns true if the value should cause a failure.
 * @param message The error message to throw if the guard returns true.
 * @returns A function that takes a value of type T and returns it as Exclude<T, G> if the guard returns false, or throws an error otherwise.
 */
export function failOn<T, G extends T>(
	guard: (x: T) => x is G,
	message: string
): (x: T) => Exclude<T, G>

export function failOn<T, G extends T>(
	guard: (x: T) => x is G,
	message: string
) {
	return (x: T): Exclude<T, G> => {
		if (guard(x)) {
			throw new Error(message)
		}
		return x as Exclude<T, G>
	}
}
