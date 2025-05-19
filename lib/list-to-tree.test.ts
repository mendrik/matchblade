import { describe, expect, it } from 'vitest'
import { listToTree } from './list-to-tree.ts'

describe('listToTree', () => {
	it('converts list to tree', () => {
		const nodes = [
			{ id: '1', name: 'Root', parent_id: null },
			{ id: '2', name: 'Child 1', parent_id: '1' },
			{ id: '3', name: 'Child 2', parent_id: '1' },
			{ id: '4', name: 'Grandchild', parent_id: '2' },
			{ id: '5', name: 'Grandchild 2', parent_id: '3' }
		]
		const toTree = listToTree('id', 'parent_id', 'nodes')
		expect(toTree(nodes)).toEqual({
			...nodes[0],
			nodes: [
				{ ...nodes[1], nodes: [{ ...nodes[3], nodes: [] }] },
				{ ...nodes[2], nodes: [{ ...nodes[4], nodes: [] }] }
			]
		})
	})
})
