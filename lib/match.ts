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

/**
 * Creates a match case for the `match` function.
 * This function is a wrapper that allows `match` to infer types correctly.
 *
 * @template Preds - An array of matchers.
 * @template Args - The types of the arguments to be matched.
 * @template R - The return type of the handler.
 * @param {Preds} predicates - An array of predicates to match against the input arguments.
 *   These can be primitive values, functions, or objects.
 * @param {((...args: HandlerArgs<Preds, Args>) => R) | R} handler - The function to
 *   execute or value to return if the predicates match. The handler's arguments are
 *   type-narrowed based on the predicates.
 * @returns {MatchCase<Preds, Args, R>} A tuple containing the predicates and the handler,
 *   which is used by the `match` function.
 *
 * @example
 * // Match against a string and a number
 * const myCase = caseOf(['hello', 42], (str, num) => `${str}, ${num}`);
 *
 * // Match using a type guard
 * const isString = (x: any): x is string => typeof x === 'string';
 * const stringCase = caseOf([isString], (s) => `It's a string: ${s}`);
 */
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

/**
 * Checks if a value is a primitive type.
 * Primitives are considered to be strings, numbers, booleans, null, and undefined.
 *
 * @param value - The value to check.
 * @returns {boolean} `true` if the value is a primitive, otherwise `false`.
 *
 * @example
 * isPrimitive(42); // true
 * isPrimitive("hello"); // true
 * isPrimitive({}); // false
 * isPrimitive([]); // false
 */
export const isPrimitive = (
	value: any
): value is Exclude<any, object | Array<any>> =>
	!['object', 'function'].includes(typeof value)

/**
 * A powerful pattern matching utility for TypeScript.
 *
 * `match` takes a series of `caseOf` clauses and returns a function that, when called
 * with arguments, will execute the handler of the first matching case.
 *
 * The returned function is variadic, accepting the same number of arguments as there
 * are predicates in each `caseOf`.
 *
 * @template Args - A tuple of the types of the arguments to be matched.
 * @template R - The return type of the `match` function.
 * @param {...MatchCase<readonly Matcher<Args[number]>[], Args, R>[]} cases - A series of
 *   `caseOf` clauses to match against.
 * @returns {(...values: Args) => R} A function that takes arguments and returns the
 *   result of the first matching case's handler.
 * @throws {Error} If no case matches the provided arguments.
 *
 * @example
 * import { match, caseOf } from './match';
 * import { is, _ } from 'ramda';
 *
 * // Define type guards
 * const isString = (x: any): x is string => typeof x === 'string';
 * const isNumber = (x: any): x is number => typeof x === 'number';
 *
 * // Create a matcher
 * const myMatcher = match<[string | number, any], string>(
 *   caseOf([isString, _], (str) => `The string is: ${str}`),
 *   caseOf([isNumber, 10], (num) => `The number is 10, and the first arg was ${num}`),
 *   caseOf([isNumber, _], (num) => `It's a number: ${num}`),
 *   caseOf([{ a: 1 }], (obj) => `It's an object with a=1: ${JSON.stringify(obj)}`)
 * );
 *
 * // Use the matcher
 * console.log(myMatcher("hello", 5)); // "The string is: hello"
 * console.log(myMatcher(42, 10)); // "The number is 10, and the first arg was 42"
 * console.log(myMatcher(100, "world")); // "It's a number: 100"
 * console.log(myMatcher({ a: 1, b: 2 }, 0)); // "It's an object with a=1: ..."
 *
 * // This will throw an error because no case matches
 * // myMatcher(true, false);
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
