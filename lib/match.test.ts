import { expectNotType, expectType } from 'tsd'
import { describe, expect, it } from 'vitest'
import { caseOf, isPrimitive, match } from './match.ts'
import { _ } from './utils.ts'

const equals =
	<T>(expected: T) =>
	(actual: T) =>
		Object.is(actual, expected)

const gt = (min: number) => (value: number) => min > value

const is =
	<T extends abstract new (...args: any[]) => any>(Ctor: T) =>
	(value: unknown): value is InstanceType<T> =>
		value instanceof Ctor

const isEmpty = (value: unknown): boolean =>
	Array.isArray(value) ? value.length === 0 : false

const isString = (value: unknown): value is string => typeof value === 'string'
const isNumber = (value: unknown): value is number =>
	typeof value === 'number' && !Number.isNaN(value)
const isBoolean = (value: unknown): value is boolean =>
	typeof value === 'boolean'
const isOdd = (value: unknown): value is number =>
	isNumber(value) && value % 2 === 1
const isEven = (value: unknown): value is number =>
	isNumber(value) && value % 2 === 0

describe('pattern', () => {
	it('should match the correct case', () => {
		const matcher = match<[string | number | boolean, number], string>(
			caseOf([isString, equals(42)], (r1, r2) => {
				expectType<string>(r1)
				expectType<number>(r2)
				return `string: ${r1}, number: ${r2}`
			}),
			caseOf([isNumber, equals(10)], (r3, r4) => {
				expectType<number>(r3)
				expectType<number>(r4)
				return `number: ${r3}, number: ${r4}`
			}),
			caseOf([() => true, gt(20)], (r5, r6) => {
				expectType<string | number | boolean>(r5)
				expectType<number>(r6)
				return `string | number | boolean: ${r5}, number: ${r6}`
			})
		)

		expect(matcher('hello', 42)).toBe('string: hello, number: 42')
		expect(matcher(30, 10)).toBe('number: 30, number: 10')
		expect(matcher(true, 8)).toBe('string | number | boolean: true, number: 8')
	})

	it('should match number types', () => {
		const matcher = match<[number, number], string>(
			caseOf([3, _], () => 'match'),
			caseOf([_, _], () => 'no match')
		)
		expect(matcher(3, 5)).toBe('match')
		expect(matcher(4, 5)).toBe('no match')
	})

	it('should match number types', () => {
		const matcher = match<[string, string], string>(
			caseOf(['a', 'b'], () => 'match'),
			caseOf(['c', 'd'], () => 'match'),
			caseOf(['e', 'f'], () => 'match'),
			caseOf([_, _], () => 'no match')
		)
		expect(matcher('a', 'b')).toBe('match')
		expect(matcher('c', 'd')).toBe('match')
		expect(matcher('e', 'f')).toBe('match')
		expect(matcher('e', 'g')).toBe('no match')
	})

	it('should match object', () => {
		const matcher = match<[object], string>(
			caseOf([{ a: 4, b: 2 }], () => 'match'),
			caseOf([{ a: 1 }], () => 'match'),
			caseOf([{ b: 2 }], () => 'match'),
			caseOf([_], () => 'no match')
		)

		expect(matcher({ a: 1 })).toBe('match')
		expect(matcher({ e: 'a', b: 2 })).toBe('match')
		expect(matcher({ a: 4, b: 2 })).toBe('match')
		expect(matcher({ b: 3 })).toBe('no match')
		expect(matcher({ a: 2, c: 3 })).toBe('no match')
	})

	it('should match object array matchers', () => {
		const matcher = match<[object], string>(
			caseOf([{ a: isEmpty }], () => 'match'),
			caseOf([_], () => 'no match')
		)

		expect(matcher({ a: [] })).toBe('match')
		expect(matcher({ a: [1, 2, 3] })).toBe('no match')
	})

	it('should match array matchers', () => {
		const matcher = match<[[number, number | string]], string>(
			caseOf([[isOdd, isString]], ([_, __]) => 'match'),
			caseOf([_], () => 'no match')
		)

		expect(matcher([1, '2'])).toBe('match')
		expect(matcher([2, 2])).toBe('no match')
	})

	it('does not treat tuple patterns as prefix matches', () => {
		const matcher = match<[[number, number | string]], string>(
			caseOf([[isOdd, isString]], () => 'match'),
			caseOf([_], () => 'no match')
		)

		expect(matcher([1, '2', 3] as any)).toBe('no match')
	})

	it('should match objects matchers', () => {
		const matcher = match<[{ a: number | string }], string>(
			caseOf([{ a: isString }], ({ a: _ }) => 'match'),
			caseOf([_], () => 'no match')
		)

		expect(matcher({ a: 'a' })).toBe('match')
		expect(matcher({ a: 1 })).toBe('no match')
	})

	it('should narrow types', () => {
		class Animal {}
		class Cat extends Animal {
			meow = () => {}
		}
		class Dog extends Animal {
			bark = () => {}
		}

		const matcher = match<[Animal], string>(
			caseOf([is(Cat)], cat => {
				expectType<Cat>(cat)
				expectNotType<Dog>(cat)
				return 'match'
			}),
			caseOf([_], () => 'no match')
		)

		expect(matcher(new Cat())).toBe('match')
		expect(matcher(new Animal())).toBe('no match')
	})

	it('can return static values', () => {
		const matcher = match<[number], string>(caseOf([2], '2'), caseOf([3], '3'))
		expect(matcher(2)).toBe('2')
		expect(matcher(3)).toBe('3')
	})

	it('matcher can narrow down unions', () => {
		type Cat = number & { readonly __type: unique symbol }
		type Dog = number & { readonly __type: unique symbol }
		type Animal = Cat | Dog
		const isCat = (a: Animal): a is Cat => isEven(a)
		const isDog = (a: Animal): a is Dog => isOdd(a)
		const matcher = match<[Animal], string>(
			caseOf([isCat], c => {
				expectType<Cat>(c)
				return 'cat'
			}),
			caseOf([isDog], d => {
				expectType<Dog>(d)
				return 'dog'
			})
		)
		expect(matcher(2 as Animal)).toBe('cat')
		expect(matcher(3 as Animal)).toBe('dog')
	})

	it('should match the correct case with async generator', async () => {
		const matcher = match<
			[string | number | boolean, number],
			AsyncGenerator<string, void, unknown>
		>(
			caseOf([isString, equals(42)], async function* (s1, n1) {
				expectType<string>(s1)
				expectType<number>(n1)
				yield `string match ${s1} ${n1}`
			}),
			caseOf([isNumber, equals(10)], async function* (n1, n2) {
				expectType<number>(n1)
				expectType<number>(n2)
				yield `number match ${n1} ${n2}`
			}),
			caseOf([isBoolean, _], async function* (b1, n1) {
				expectType<boolean>(b1)
				expectType<number>(n1)
				yield `boolean match ${b1} ${n1}`
			})
		)

		const result1: string[] = []
		for await (const res of matcher('hello', 42)) {
			result1.push(res)
		}
		expect(result1).toEqual(['string match hello 42'])

		const result2: string[] = []
		for await (const res of matcher(30, 10)) result2.push(res)
		expect(result2).toEqual(['number match 30 10'])

		const result3: string[] = []
		for await (const res of matcher(true, 25)) {
			result3.push(res)
		}
		expect(result3).toEqual(['boolean match true 25'])
	})

	describe('isPrimitive', () => {
		it('should return true for primitive values', () => {
			expect(isPrimitive(42)).toBe(true)
			expect(isPrimitive('hello')).toBe(true)
			expect(isPrimitive(true)).toBe(true)
			expect(isPrimitive(42n)).toBe(true)
			expect(isPrimitive(Symbol('s'))).toBe(true)
			expect(isPrimitive(null)).toBe(true)
			expect(isPrimitive(undefined)).toBe(true)
		})

		it('should return false for non-primitive values', () => {
			expect(isPrimitive({})).toBe(false)
			expect(isPrimitive([])).toBe(false)
			expect(isPrimitive(() => {})).toBe(false)
			expect(isPrimitive(new Date())).toBe(false)
		})
	})
})
