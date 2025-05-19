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
 * PipeTap is a function that calls a series of functions with the initial argument and the result 
 * of the previous function. Functions can be async and the results will be automatically awaited.
 * @param ...fn1 a series of up to 7 functions
 * @returns the result of the last function in the series
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
