type Param<T extends (a: any, r: any) => any> = T extends (a: infer P) => any
	? P
	: never

type PF = (args: any, r: any) => any
type PP<F extends PF> = (arg: Param<F>, r: Awaited<ReturnType<F>>) => any
type HasPromise<T extends any[]> = T extends [infer First, ...infer Rest]
	? First extends Promise<any>
		? 1
		: HasPromise<Rest>
	: 0

export function pipeTap<F0 extends PF>(
	fn1: F0
): (
	arg: Param<F0>
) => HasPromise<[ReturnType<F0>]> extends 1
	? Promise<Awaited<ReturnType<F0>>>
	: ReturnType<F0>

export function pipeTap<F0 extends PF, F1 extends PP<F0>>(
	fn1: F0,
	fn2: F1
): (
	arg: Param<F0>
) => HasPromise<[ReturnType<F0>, ReturnType<F1>]> extends 1
	? Promise<Awaited<ReturnType<F1>>>
	: ReturnType<F1>

export function pipeTap<F0 extends PF, F1 extends PP<F0>, F2 extends PP<F1>>(
	fn1: F0,
	fn2: F1,
	fn3: F2
): (
	arg: Param<F0>
) => HasPromise<[ReturnType<F0>, ReturnType<F1>, ReturnType<F2>]> extends 1
	? Promise<Awaited<ReturnType<F2>>>
	: ReturnType<F2>

export function pipeTap<
	F0 extends PF,
	F1 extends PP<F0>,
	F2 extends PP<F1>,
	F3 extends PP<F2>
>(
	fn1: F0,
	fn2: F1,
	fn3: F2,
	fn4: F3
): (
	arg: Param<F0>
) => HasPromise<
	[ReturnType<F0>, ReturnType<F1>, ReturnType<F2>, ReturnType<F3>]
> extends 1
	? Promise<Awaited<ReturnType<F3>>>
	: ReturnType<F3>

export function pipeTap<
	F0 extends PF,
	F1 extends PP<F0>,
	F2 extends PP<F1>,
	F3 extends PP<F2>,
	F4 extends PP<F3>
>(
	fn1: F0,
	fn2: F1,
	fn3: F2,
	fn4: F3,
	fn5: F4
): (
	arg: Param<F0>
) => HasPromise<
	[
		ReturnType<F0>,
		ReturnType<F1>,
		ReturnType<F2>,
		ReturnType<F3>,
		ReturnType<F4>
	]
> extends 1
	? Promise<Awaited<ReturnType<F4>>>
	: ReturnType<F4>

export function pipeTap<
	F0 extends PF,
	F1 extends PP<F0>,
	F2 extends PP<F1>,
	F3 extends PP<F2>,
	F4 extends PP<F3>,
	F5 extends PP<F4>
>(
	fn1: F0,
	fn2: F1,
	fn3: F2,
	fn4: F3,
	fn5: F4,
	fn6: F5
): (
	arg: Param<F0>
) => HasPromise<
	[
		ReturnType<F0>,
		ReturnType<F1>,
		ReturnType<F2>,
		ReturnType<F3>,
		ReturnType<F4>,
		ReturnType<F5>
	]
> extends 1
	? Promise<Awaited<ReturnType<F5>>>
	: ReturnType<F5>

export function pipeTap<
	F0 extends PF,
	F1 extends PP<F0>,
	F2 extends PP<F1>,
	F3 extends PP<F2>,
	F4 extends PP<F3>,
	F5 extends PP<F4>,
	F6 extends PP<F5>
>(
	fn1: F0,
	fn2: F1,
	fn3: F2,
	fn4: F3,
	fn5: F4,
	fn6: F5,
	fn7: F6
): (
	arg: Param<F0>
) => HasPromise<
	[
		ReturnType<F0>,
		ReturnType<F1>,
		ReturnType<F2>,
		ReturnType<F3>,
		ReturnType<F4>,
		ReturnType<F5>,
		ReturnType<F6>
	]
> extends 1
	? Promise<Awaited<ReturnType<F6>>>
	: ReturnType<F6>

export function pipeTap<
	F0 extends PF,
	F1 extends PP<F0>,
	F2 extends PP<F1>,
	F3 extends PP<F2>,
	F4 extends PP<F3>,
	F5 extends PP<F4>,
	F6 extends PP<F5>,
	F7 extends PP<F6>
>(
	fn1: F0,
	fn2: F1,
	fn3: F2,
	fn4: F3,
	fn5: F4,
	fn6: F5,
	fn7: F6,
	fn8: F7
): (
	arg: Param<F0>
) => HasPromise<
	[
		ReturnType<F0>,
		ReturnType<F1>,
		ReturnType<F2>,
		ReturnType<F3>,
		ReturnType<F4>,
		ReturnType<F5>,
		ReturnType<F6>,
		ReturnType<F7>
	]
> extends 1
	? Promise<Awaited<ReturnType<F7>>>
	: ReturnType<F7>

/**
 * Creates a pipeline of functions where each function receives the initial argument
 * and the result of the previous function.
 *
 * `pipeTap` is useful for creating a sequence of operations that depend on a shared
 * initial state and the outcome of the preceding step. It supports both synchronous
 * and asynchronous functions, automatically handling `Promise` resolution.
 *
 * @param {...Function} fns - A sequence of up to 8 functions.
 *   - The first function receives the initial argument and `undefined`.
 *   - Each subsequent function receives the initial argument and the result of the
 *     previous function.
 * @returns {Function} A new function that, when called, executes the pipeline and
 *   returns the result of the last function. If any function in the pipe is async,
 *   the returned function will also be async and return a `Promise`.
 *
 * @example
 * import { pipeTap } from './pipe-tap';
 *
 * // --- Synchronous Example ---
 * const add = (x: number, y: number = 0) => x + y;
 * const multiplyBy = (multiplier: number) => (x: number, y: number) => x * y * multiplier;
 *
 * const calculation = pipeTap(
 *   (initial: number) => initial + 1, // Start with 10 -> 11
 *   (initial, prev) => add(initial, prev), // 10 + 11 = 21
 *   (initial, prev) => multiplyBy(2)(initial, prev) // 10 * 21 * 2 = 420 (incorrect, see note)
 *   // Note: The `initial` argument is passed to each function, which might not be what you want.
 *   // The second argument to multiplyBy should be `prev`.
 * );
 *
 * // Corrected synchronous example
 * const calculationCorrect = pipeTap(
 *   (initial: number) => initial + 1, // 10 -> 11
 *   (_, prev) => prev + 10, // 11 + 10 = 21
 *   (_, prev) => prev * 2 // 21 * 2 = 42
 * );
 *
 * const resultSync = calculationCorrect(10);
 * console.log(resultSync); // 42
 *
 * // --- Asynchronous Example ---
 * const asyncAdd = async (x: number, y: number = 0) => {
 *   await new Promise(res => setTimeout(res, 10));
 *   return x + y;
 * };
 *
 * const asyncCalculation = pipeTap(
 *   (initial: number) => asyncAdd(initial, 1), // 10 + 1 = 11
 *   (_, prev) => asyncAdd(prev, 10), // 11 + 10 = 21
 *   (_, prev) => prev * 2 // 21 * 2 = 42
 * );
 *
 * const resultAsync = await asyncCalculation(10);
 * console.log(resultAsync); // 42
 */
export function pipeTap<F extends Array<PF>>(
	fn1: F[0],
	fn2?: F[1],
	fn3?: F[2],
	fn4?: F[3],
	fn5?: F[4],
	fn6?: F[5],
	fn7?: F[6]
): any {
	const functions = [fn2, fn3, fn4, fn5, fn6, fn7].filter(Boolean) as Array<PF>

	return (arg: any) =>
		functions.reduce(
			(result, currentFn) =>
				result instanceof Promise
					? result.then(resolvedResult => currentFn(arg, resolvedResult))
					: currentFn(arg, result),
			fn1(arg, undefined)
		) // Initialize with the result of the first function
}
