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
 * Creates a case for the `match` function.
 *
 * @description
 * The `caseOf` function creates a case to be used with the `match` function.
 * Each case consists of an array of predicates and a handler function or static value.
 * The predicates determine if the case matches the input values, and the handler
 * produces the result when the case matches.
 *
 * @example
 * ```typescript
 * caseOf([isString, isNumber], (str, num) => `${str} ${num}`)
 * caseOf([5, "hello"], () => "Exact match")
 * caseOf([{ id: isNumber }, _], (obj) => `Object with id: ${obj.id}`)
 * ```
 *
 * @template Preds - A tuple type representing the predicate matchers.
 * @template Args - A tuple type representing the arguments to match against.
 * @template R - The return type of the handler.
 * @param {Preds} predicates - An array of predicates to match against the input values.
 * @param {((...args: HandlerArgs<Preds, Args>) => R) | R} handler - A function to call with the matched values, or a static value to return.
 * @returns {MatchCase<Preds, Args, R>} A match case to be used with the `match` function.
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

export const isPrimitive = (
	value: any
): value is Exclude<any, object | Array<any>> =>
	!['object', 'function'].includes(typeof value)

/**
 * Creates a pattern matching function that evaluates input values against a series of cases.
 *
 * @description
 * The `match` function implements pattern matching in TypeScript, similar to functional languages.
 * It takes a list of cases created with `caseOf` and returns a function that accepts arguments
 * matching the specified `Args` type. When called, the returned function matches its arguments
 * against predicates for each case, in order, and executes the handler for the first matching case.
 *
 * @example
 * ```typescript
 * // Basic matching with function predicates
 * const getDescription = match<[unknown], string>(
 *   caseOf([isString], str => `String: ${str}`),
 *   caseOf([isNumber], num => `Number: ${num}`),
 *   caseOf([isArray], arr => `Array with ${arr.length} items`),
 *   caseOf([() => true], () => `Unknown type`)
 * );
 *
 * getDescription("hello");   // "String: hello"
 * getDescription(42);        // "Number: 42"
 * getDescription([1,2,3]);   // "Array with 3 items"
 * getDescription(new Date()); // "Unknown type"
 * ```
 *
 * @example
 * ```typescript
 * // Type narrowing with type guards
 * type Shape = Circle | Square | Rectangle;
 *
 * const getArea = match<[Shape], number>(
 *   caseOf([isCircle], circle => Math.PI * circle.radius ** 2),
 *   caseOf([isSquare], square => square.side ** 2),
 *   caseOf([isRectangle], rect => rect.width * rect.height)
 * );
 * ```
 *
 * @example
 * ```typescript
 * // Multiple parameters with primitive matchers
 * const calculator = match<[string, number, number], number>(
 *   caseOf(["add", _, _], (_, a, b) => a + b),
 *   caseOf(["subtract", _, _], (_, a, b) => a - b),
 *   caseOf(["multiply", _, _], (_, a, b) => a * b),
 *   caseOf(["divide", _, 0], () => { throw new Error("Division by zero"); }),
 *   caseOf(["divide", _, _], (_, a, b) => a / b)
 * );
 *
 * calculator("add", 5, 3);      // 8
 * calculator("divide", 10, 2);  // 5
 * ```
 *
 * @example
 * ```typescript
 * // Object destructuring and static returns
 * const getGreeting = match<[{ type: string; name?: string }], string>(
 *   caseOf([{ type: "user", name: isString }], ({ name }) => `Hello, ${name}!`),
 *   caseOf([{ type: "admin" }], () => "Welcome, admin!"),
 *   caseOf([{ type: "guest" }], "Welcome, guest!")
 * );
 * ```
 *
 * @example
 * ```typescript
 * // Tuple/array matching
 * const describe = match<[[number, string]], string>(
 *   caseOf([[isOdd, "admin"]], () => "Odd admin ID"),
 *   caseOf([[isEven, "user"]], () => "Even user ID"),
 *   caseOf([[_, _]], ([id, role]) => `${role} with ID ${id}`)
 * );
 * ```
 *
 * @example
 * ```typescript
 * // Async operations
 * const fetchData = match<[string], Promise<Data>>(
 *   caseOf(["users"], async () => await api.getUsers()),
 *   caseOf(["products"], async () => await api.getProducts()),
 *   caseOf([_], async (resource) => await api.getResource(resource))
 * );
 * ```
 *
 * @template Args - A tuple type representing the types of arguments that will be matched.
 * @template R - The return type of the resulting function.
 * @param {...MatchCase<readonly Matcher<Args[number]>[], Args, R>[]} cases - A list of cases created with `caseOf`.
 * @returns {(...values: Args) => R} A function that takes arguments of type `Args` and returns a value of type `R`.
 * @throws {Error} If no case matches the input values.
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
