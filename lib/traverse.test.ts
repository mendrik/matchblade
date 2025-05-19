import { T as _, multiply } from 'ramda'
import { isArray, isNumber } from 'ramda-adjunct'
import { describe, expect, it } from 'vitest'
import { caseOf, match } from './match.ts'
import { traverse } from './traverse.ts'

describe('traverse', () => {
	it('should transform values in a flat object', () => {
		const obj = { a: 1, b: 2, c: 3 }
		const result = traverse((value: number) => value * 2, obj)
		expect(result).toEqual({ a: 2, b: 4, c: 6 })
	})

	it('should handle nested objects', () => {
		const obj = { a: 1, b: { c: 2, d: 3 } }
		const result = traverse((value: number) => value * 2, obj)
		expect(result).toEqual({ a: 2, b: { c: 4, d: 6 } })
	})

	it('should handle arrays within objects', () => {
		const obj = { a: 1, b: [2, 3, 4] }
		const result = traverse(
			match<[number | number[], string | undefined], number | number[]>(
				caseOf([isArray, _], arr => arr.map(multiply(3))),
				caseOf([isNumber, _], multiply(2))
			),
			obj
		)
		expect(result).toEqual({ a: 2, b: [4, 6, 8] })
	})

	it('should handle complex nested structures', () => {
		const obj = {
			a: 1,
			b: [{ c: 3 }],
			d: { e: 2, f: 4 }
		}
		const result = traverse(value => value * 2, obj)
		expect(result).toEqual({
			a: 2,
			b: [{ c: 6 }],
			d: { e: 4, f: 8 }
		})
	})

	it('should provide key as second argument to the transform function', () => {
		const obj = { a: 1, b: 2, c: 3 }
		const result = traverse(
			(value: number, key?: string) => `${key}:${value}`,
			obj
		)
		expect(result).toEqual({ a: 'a:1', b: 'b:2', c: 'c:3' })
	})

	it('should work with curried version', () => {
		const doubler = traverse((value: number) => value * 2)
		const obj = { a: 1, b: 2, c: 3 }
		expect(doubler(obj)).toEqual({ a: 2, b: 4, c: 6 })
	})
})
