import { describe, expect, it } from 'vitest'
import { mapBy } from './map-by.ts'

type Item = { id: number; name: string }

describe('mapBy', () => {
	it('should create a map based on the result of the function applied to each element', () => {
		const list = [
			{ id: 1, name: 'Alice' },
			{ id: 2, name: 'Bob' }
		]
		const map = mapBy<Item>(el => el.id)(list)
		expect(map.get(1)).toEqual({ id: 1, name: 'Alice' })
		expect(map.get(2)).toEqual({ id: 2, name: 'Bob' })
	})

	it('should handle empty lists', () => {
		const list: { id: number; name: string }[] = []
		const map = mapBy((el: { id: number }) => el.id, list)

		expect(map.size).toBe(0)
	})

	it('should work with strings as keys', () => {
		const list = [
			{ id: 'a', name: 'Alice' },
			{ id: 'b', name: 'Bob' }
		]
		const map = mapBy((el: { id: string }) => el.id, list)

		expect(map.get('a')).toEqual({ id: 'a', name: 'Alice' })
		expect(map.get('b')).toEqual({ id: 'b', name: 'Bob' })
	})

	it('should overwrite duplicate keys with the last element in the list', () => {
		const list = [
			{ id: 1, name: 'Alice' },
			{ id: 1, name: 'Bob' }
		]
		const map = mapBy((el: { id: number }) => el.id, list)

		expect(map.get(1)).toEqual({ id: 1, name: 'Bob' })
	})

	it('should support numeric keys', () => {
		const list = [1, 2, 3]
		const map = mapBy((el: number) => el % 2, list)

		expect(map.get(0)).toBe(2)
		expect(map.get(1)).toBe(3)
	})
})
