
import { caseOf, match } from './match.ts'
import { isArray, isFunction, isNotUndefined, isObject, isUndefined } from './utils.ts'

const _ = () => true

type Recurse<Source, Spec> = Spec extends (source: any) => infer R
	? R
	: Spec extends object
		? EvolveResult<Source, Spec>
		: never

export type EvolveResult<Source, Spec> = Omit<Source, keyof Spec> & {
	[K in keyof Spec]: K extends keyof Source
		? Source[K] extends Array<infer Item>
			? Item extends object
				? Array<EvolveResult<Item, Spec[K]>>
				: Recurse<Source[K], Spec[K]>
			: Recurse<Source[K], Spec[K]>
		: Recurse<Source, Spec[K]>
}

export function evolve<O extends object, Sp extends object>(
	specs: Sp,
	source: O
): EvolveResult<O, Sp>

export function evolve<O extends object, Sp extends object>(
	specs: Sp
): <R extends EvolveResult<O, Sp>>(source: O) => R

/**
 * Creates a new object by recursively applying transformations to a source object.
 *
 * `evolve` is a powerful tool for immutably changing object structures. It takes a
 * "spec" object that defines how to transform the source.
 *
 * - If a spec property is a function and the key exists in the source, the function is
 *   called with the source's value for that key.
 * - If a spec property is a function and the key does *not* exist in the source, the
 *   function is called with the entire source object.
 * - If a source property is an array of objects and the corresponding spec is an object,
 *   `evolve` will be applied to each item in the array.
 * - If a source property is an object and the spec is also an object, `evolve` will
 *   be called recursively.
 *
 * This function can be used in a curried style.
 *
 * @template O - The type of the source object.
 * @template Sp - The type of the spec object.
 * @param {Sp} specs - The object defining the transformations.
 * @param {O} [source] - The object to evolve. If not provided, `evolve` returns a
 *   curried function that takes the source object.
 * @returns {EvolveResult<O, Sp> | ((source: O) => EvolveResult<O, Sp>)} A new,
 *   transformed object, or a curried function.
 *
 * @example
 * import { evolve } from './evolve-alt';
 * import { inc, map } from 'ramda';
 *
 * const source = {
 *   a: 1,
 *   b: { c: 2, d: [3, 4] },
 *   e: 'hello',
 *   f: [{ g: 5 }, { g: 6 }]
 * };
 *
 * const transformations = {
 *   a: inc, // Increment `a`
 *   b: {
 *     c: (c: number) => c * 2, // Double `b.c`
 *     d: map(inc) // Increment each item in `b.d`
 *   },
 *   newProp: (o: typeof source) => o.a + o.b.c, // Add a new property
 *   f: {
 *     g: inc // Increment `g` in each object in `f`
 *   }
 * };
 *
 * const result = evolve(transformations, source);
 * // result will be:
 * // {
 * //   a: 2,
 * //   b: { c: 4, d: [4, 5] },
 * //   e: 'hello',
 * //   f: [{ g: 6 }, { g: 7 }],
 * //   newProp: 3 // 1 (original a) + 2 (original b.c)
 * // }
 *
 * // --- Curried version ---
 * const evolver = evolve(transformations);
 * const curriedResult = evolver(source);
 * // curriedResult is the same as `result`
 */
export function evolve(specs: any, source?: any): any {
	if (source === undefined) {
		return (obj: any) => evolve(specs, obj)
	} else {
		const fork = match<[any, any], any>(
			caseOf([isArray, isObject], (prop: any[], spec: object) =>
				prop.map(evolve(spec))
			),
			caseOf([isObject, isObject], (obj: object, spec: object) =>
				evolve(spec, obj)
			),
			caseOf([isNotUndefined, isFunction], (prop: any, fn: Function) =>
				fn(prop)
			),
			caseOf([isUndefined, isFunction], (_, fn: Function) => fn(source)),
			caseOf([_, _], (prop, _) => prop)
		)
		return Object.entries(specs).reduce(
			(acc: any, [key, spec]: [string, any]) => {
				const res = fork(acc[key], spec)
				return { ...acc, [key]: res }
			},
			source ?? {}
		)
	}
}
