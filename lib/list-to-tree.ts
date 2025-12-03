export type TreeOf<T, C extends string> = T & {
	[key in C]: TreeOf<T, C>[]
}

/**
 * Creates a function that converts a flat list of objects into a tree structure.
 *
 * This is a higher-order function. You first call it with the configuration
 * (property names for ID, parent ID, and children), and it returns a function
 * that will perform the transformation on a list.
 *
 * The resulting tree will contain a single root node. If multiple root-level
 * nodes (i.e., nodes without a parent) are found, only the first one will be
 * returned.
 *
 * @template I - The name of the property holding the node's unique ID.
 * @template P - The name of the property holding the parent node's ID.
 * @template S - The name of the property where the array of children will be stored.
 * @param {I} idProp - The name of the ID property (e.g., 'id').
 * @param {P} parentProp - The name of the parent ID property (e.g., 'parent_id').
 * @param {S} childProp - The name of the property to create for child nodes (e.g., 'children').
 * @returns {(list: T[]) => TreeOf<T, S>} A function that takes a flat list of nodes
 *   and returns the root node of the constructed tree.
 *
 * @example
 * import { listToTree } from './list-to-tree';
 *
 * const nodes = [
 *   { id: 1, name: 'Root', parent_id: null },
 *   { id: 2, name: 'Child A', parent_id: 1 },
 *   { id: 3, name: 'Child B', parent_id: 1 },
 *   { id: 4, name: 'Grandchild A.1', parent_id: 2 },
 * ];
 *
 * // Create a tree converter
 * const toTree = listToTree('id', 'parent_id', 'children');
 *
 * // Convert the list to a tree
 * const tree = toTree(nodes);
 *
 * // The resulting `tree` will be:
 * // {
 * //   id: 1,
 * //   name: 'Root',
 * //   parent_id: null,
 * //   children: [
 * //     {
 * //       id: 2,
 * //       name: 'Child A',
 * //       parent_id: 1,
 * //       children: [
 * //         { id: 4, name: 'Grandchild A.1', parent_id: 2, children: [] }
 * //       ]
 * //     },
 * //     { id: 3, name: 'Child B', parent_id: 1, children: [] }
 * //   ]
 * // }
 */
export const listToTree =
	<I extends string, P extends string, S extends string>(
		idProp: I,
		parentProp: P,
		childProp: S
	) =>
	<
		ID extends string | number,
		T extends { [i in I]: ID } & {
			[p in P]?: ID | undefined | null
		}
	>(
		list: T[]
	): TreeOf<T, S> =>
		list
			.filter(item => !item[parentProp])
			.map(function buildTree(node: any): any {
				return {
					...node,
					[childProp]: list
						.filter(child => child[parentProp] === node[idProp])
						.map(buildTree)
				}
			})
			.shift()
