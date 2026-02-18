type AsyncFn<I, O> = (input: I) => O | PromiseLike<O>

export function pipeAsync<A, B>(
	fn1: AsyncFn<A, B>
): (input: A) => Promise<Awaited<B>>

export function pipeAsync<A, B, C>(
	fn1: AsyncFn<A, B>,
	fn2: AsyncFn<Awaited<B>, C>
): (input: A) => Promise<Awaited<C>>

export function pipeAsync<A, B, C, D>(
	fn1: AsyncFn<A, B>,
	fn2: AsyncFn<Awaited<B>, C>,
	fn3: AsyncFn<Awaited<C>, D>
): (input: A) => Promise<Awaited<D>>

export function pipeAsync<A, B, C, D, E>(
	fn1: AsyncFn<A, B>,
	fn2: AsyncFn<Awaited<B>, C>,
	fn3: AsyncFn<Awaited<C>, D>,
	fn4: AsyncFn<Awaited<D>, E>
): (input: A) => Promise<Awaited<E>>

export function pipeAsync<A, B, C, D, E, F>(
	fn1: AsyncFn<A, B>,
	fn2: AsyncFn<Awaited<B>, C>,
	fn3: AsyncFn<Awaited<C>, D>,
	fn4: AsyncFn<Awaited<D>, E>,
	fn5: AsyncFn<Awaited<E>, F>
): (input: A) => Promise<Awaited<F>>

export function pipeAsync<A, B, C, D, E, F, G>(
	fn1: AsyncFn<A, B>,
	fn2: AsyncFn<Awaited<B>, C>,
	fn3: AsyncFn<Awaited<C>, D>,
	fn4: AsyncFn<Awaited<D>, E>,
	fn5: AsyncFn<Awaited<E>, F>,
	fn6: AsyncFn<Awaited<F>, G>
): (input: A) => Promise<Awaited<G>>

export function pipeAsync<A, B, C, D, E, F, G, H>(
	fn1: AsyncFn<A, B>,
	fn2: AsyncFn<Awaited<B>, C>,
	fn3: AsyncFn<Awaited<C>, D>,
	fn4: AsyncFn<Awaited<D>, E>,
	fn5: AsyncFn<Awaited<E>, F>,
	fn6: AsyncFn<Awaited<F>, G>,
	fn7: AsyncFn<Awaited<G>, H>
): (input: A) => Promise<Awaited<H>>

/**
 * Creates an asynchronous pipeline of functions.
 *
 * `pipeAsync` chains a series of functions, where the output of each function is passed
 * as the input to the next. It seamlessly handles both synchronous and asynchronous
 * functions, ensuring that `Promise`s are resolved before being passed to the next
 * step in the pipeline.
 *
 * The result is a new function that takes the initial input and returns a `Promise`
 * resolving to the value of the final function in the chain.
 *
 * @param {...AsyncFn<any, any>[]} fns - A sequence of up to 7 functions to be chained.
 *   Each function can be synchronous or asynchronous.
 * @returns {(input: any) => Promise<any>} A new function that executes the pipeline.
 *
 * @example
 * import { pipeAsync } from './pipe-async';
 *
 * // --- Example with mixed sync and async functions ---
 * const addOne = (n: number) => n + 1;
 * const doubleAsync = async (n: number) => {
 *   await new Promise(res => setTimeout(res, 10));
 *   return n * 2;
 * };
 * const toString = (n: number) => `Result: ${n}`;
 *
 * const calculation = pipeAsync(
 *   addOne,      // 5 -> 6
 *   doubleAsync, // 6 -> 12 (after a delay)
 *   toString     // 12 -> "Result: 12"
 * );
 *
 * const result = await calculation(5);
 * console.log(result); // "Result: 12"
 *
 * // --- Type safety ---
 * // The following would cause a TypeScript error because the output of `addOne` (number)
 * // does not match the input of `toUpperCase` (string).
 *
 * // const invalidPipe = pipeAsync(
 * //   addOne,
 * //   (s: string) => s.toUpperCase()
 * // );
 */
export function pipeAsync(
	...fns: Array<(arg: any) => any>
): (input: any) => Promise<any> {
	return (input: any) =>
		fns.reduce(
			(promiseChain, currentFunction) => promiseChain.then(currentFunction),
			Promise.resolve(input)
		)
}
