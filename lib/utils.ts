/**
 * A wildcard matcher that always returns true.
 * Used in pattern matching to match any value.
 */
export const _ = () => true

export const isArray = Array.isArray.bind(Array)

export const isObject = (obj: unknown): obj is object =>
	Object.prototype.toString.call(obj) === '[object Object]'

export const isPromise = (obj: unknown): obj is object =>
	Object.prototype.toString.call(obj) === '[object Promise]'

export const isFunction = (value: unknown): value is Function =>
	typeof value === 'function' ||
	Object.prototype.toString.call(value) === '[object Function]' ||
	Object.prototype.toString.call(value) === '[object AsyncFunction]' ||
	Object.prototype.toString.call(value) === '[object GeneratorFunction]'

export const isUndefined = (value: unknown): value is undefined =>
	typeof value === 'undefined'

export const isNotUndefined = (value: unknown): value is object =>
	!isUndefined(value)
