type AnyFn = (arg: any) => any
type Guard<T> = (value: any) => value is T
type Predicate = (value: any) => boolean

type Matcher<T = any> =
	| Predicate
	| Guard<any>
	| PrimitiveMatcher
	| ObjectMatcher<T>
	| TupleMatcher<T>

type NarrowedArg<P, A> = P extends Guard<infer T>
	? T
	: P extends [infer P1, infer P2]
		? A extends [infer A1, infer A2]
			? [NarrowedArg<P1, A1>, NarrowedArg<P2, A2>]
			: never
		: P extends AnyFn
			? A
			: P extends object
				? A & {
						[K in keyof P]: K extends keyof A ? NarrowedArg<P[K], A[K]> : never
					}
				: Extract<P, A>

type PrimitiveMatcher = string | number | boolean | null | undefined

type ObjectMatcher<T = any> = T extends object
	? { [P in keyof T]?: T[P] | Matcher<T[P]> }
	: never

type TupleMatcher<T = any> = T extends [infer A, infer B]
	? [A | Matcher<A>, B | Matcher<B>]
	: never

type HandlerArgs<
	Preds extends readonly Matcher[],
	Args extends readonly unknown[]
> = {
	[K in keyof Preds]: K extends keyof Args
		? NarrowedArg<Preds[K], Args[K]>
		: never
}

type MatchCase<
	Preds extends readonly Matcher[],
	Args extends readonly unknown[],
	R
> = [Preds, ((...args: HandlerArgs<Preds, Args>) => R) | R]

export function caseOf<
	Preds extends [Matcher, ...Matcher[]],
	Args extends readonly unknown[],
	R
>(
	predicates: Preds,
	handler: ((...args: HandlerArgs<Preds, Args>) => R) | R
): MatchCase<Preds, Args, R> {
	return [predicates, handler]
}

const matchValue = <T>(value: T, matcher: Matcher<T>): boolean => {
	if (typeof matcher === 'function') {
		return matcher(value)
	}
	if (isPrimitive(matcher)) {
		return value === matcher
	}
	if (isTuple(matcher) && isTuple(value)) {
		return (
			matchValue(value[0], matcher[0] as Matcher<T>) &&
			matchValue(value[1], matcher[1] as Matcher<T>)
		)
	}
	if (isObject(matcher) && isObject(value)) {
		return Object.entries(matcher).every(([key, val]) =>
			matchValue(value[key], val as Matcher<T>)
		)
	}
	return false
}

const isObject = (value: any): value is Record<string, any> =>
	typeof value === 'object' && value !== null

const isTuple = (value: any): value is [any, any] =>
	Array.isArray(value) && value.length === 2

const isFunction = (fn: any): fn is Function => typeof fn === 'function'

export const isPrimitive = (
	value: any
): value is Exclude<any, object | Array<any>> =>
	!['object', 'function'].includes(typeof value)

/**
 * Match takes a list of cases and returns a function that will match the input values against the cases.
 * For example like so
 * ```typescript
 * match<[Arg1, Arg2], string>( // you must hint the input and return types
 *   caseOf([isArray, _], (arr, arg2) => 'Array'),
 *   caseOf([isObj, _], (obj, arg2) => 'Object'),
 *   caseOf([_, _], (arg1, arg2) => 'Default')
 * )(arg1, arg2)
 *  ```
 * Each case must be wrapped in a caseOf function, which takes an array of predicates (matching the arity of the 
 * input parameters) and a handler function.
 * The argument types of the handler function will be narrowed down if the predicates are type guards or 
 * partial objects.
 * * Predicates can be also primitive values, in which case the camparison will be done with strict equality.
 * * If the predicate is an object, the input object must contain all the properties of the predicate object.
 * * If the object properties are predicates, the input object properties must match the predicates.
 * * Tuples are matched element-wise.
 * If no match is found, an error is thrown.
 * @param cases a list of cases to match against
 */
export function match<Args extends readonly unknown[], R>(
	...cases: MatchCase<readonly Matcher<Args[number]>[], Args, R>[]
) {
	return (...values: Args): R => {
		for (const [predicates, handler] of cases) {
			const allMatch = predicates.every((pred, index) =>
				matchValue(values[index], pred as Matcher<unknown>)
			)
			if (allMatch) {
				return isFunction(handler)
					? handler(...(values as HandlerArgs<typeof predicates, Args>))
					: handler
			}
		}
		throw new Error(`No match found for ${JSON.stringify(values, null, 2)}`)
	}
}
