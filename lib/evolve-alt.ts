
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

export function evolveAlt<O extends object, Sp extends object>(
	specs: Sp,
	source: O
): EvolveResult<O, Sp>

export function evolveAlt<O extends object, Sp extends object>(
	specs: Sp
): <R extends EvolveResult<O, Sp>>(source: O) => R

/**
 * EvolveAlt takes two arguments: a spec object and a source object. It returns a new object that
 * is the result of recursively evolving the source object using the spec object.
 *
 * if a spec property is a function and the key exists in the source object, the function is called
 * with the value of the key in the source object as its argument.
 *
 * if a spec property is a function and the key does not exist in the source object, the function is
 * called with the entire source object as its argument.
 *
 * if source properties are objects of arrays of objects, the function will recursively call itself.
 * it is not necessary to write a `arrProp: map(evolveAlt({...}))` in the spec object.
 *
 * @param specs the recipe for evolving the source object
 * @param source the object to evolve
 * @returns evolved source object
 */
export function evolveAlt(specs: any, source?: any): any {
	if (source === undefined) {
		return (obj: any) => evolveAlt(specs, obj)
	} else {
		const fork = match<[any, any], any>(
			caseOf([isArray, isObject], (prop: any[], spec: object) =>
				prop.map(evolveAlt(spec))
			),
			caseOf([isObject, isObject], (obj: object, spec: object) =>
				evolveAlt(spec, obj)
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
