import { describe, expect, it } from 'vitest'
import { awaitObj } from './await-obj.ts'

describe('resolveObj', () => {
	it('should resolve promises to their values', async () => {
		const obj = {
			a: Promise.resolve(1),
			b: Promise.resolve(2),
			c: Promise.resolve(3)
		}

		const result = await awaitObj(obj)
		expect(result).toEqual({ a: 1, b: 2, c: 3 })
	})

	it('should return non-promise values unchanged', async () => {
		const obj = {
			x: 42,
			y: 'Hello',
			z: true
		}

		const result = await awaitObj(obj)
		expect(result).toEqual({ x: 42, y: 'Hello', z: true })
	})

	it('should handle mixed promise and non-promise values', async () => {
		const obj = {
			a: Promise.resolve(1),
			b: 2,
			c: Promise.resolve('Hello'),
			d: false
		}

		const result = await awaitObj(obj)
		expect(result).toEqual({ a: 1, b: 2, c: 'Hello', d: false })
	})

	it('should handle empty objects', async () => {
		const obj = {}

		const result = await awaitObj(obj)
		expect(result).toEqual({})
	})

	it('should handle promises that resolve to objects', async () => {
		const obj = {
			a: Promise.resolve({ name: 'Alice' }),
			b: Promise.resolve({ age: 30 })
		}

		const result = await awaitObj(obj)
		expect(result).toEqual({ a: { name: 'Alice' }, b: { age: 30 } })
	})

	it('should handle promises that reject', async () => {
		const obj = {
			a: Promise.resolve(1),
			b: Promise.reject(new Error('Failed'))
		}

		await expect(awaitObj(obj)).rejects.toThrow('Failed')
	})

	it('should work with an object containing no promises', async () => {
		const obj = {
			a: 10,
			b: 'test',
			c: [1, 2, 3]
		}

		const result = await awaitObj(obj)
		expect(result).toEqual({ a: 10, b: 'test', c: [1, 2, 3] })
	})

	it('should maintain the order of properties', async () => {
		const obj = {
			first: Promise.resolve('first'),
			second: Promise.resolve('second'),
			third: 3
		}

		const result = await awaitObj(obj)
		expect(result).toEqual({ first: 'first', second: 'second', third: 3 })
	})
})
