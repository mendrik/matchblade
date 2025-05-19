export const failOn = <T, G extends T>(
	guard: (x: T) => x is G,
	message: string
) => {
	return (x: T): Exclude<T, G> => {
		if (guard(x)) {
			throw new Error(message)
		}
		return x as Exclude<T, G>
	}
}
