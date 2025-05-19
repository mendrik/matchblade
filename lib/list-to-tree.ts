export type TreeOf<T, C extends string> = T & {
	[key in C]: TreeOf<T, C>[]
}

/**
 * Converts a list of objects into a tree structure.
 *
 * @template I The type of the property that holds the ID of each node.
 * @template P The type of the property that holds the ID of the parent node.
 * @template S The type of the property that will hold the array of child nodes.
 * @param {I} idProp The name of the property that holds the ID of each node.
 * @param {P} parentProp The name of the property that holds the ID of the parent node.
 * @param {S} childProp The name of the property that will hold the array of child nodes.
 * @returns A function that takes a list of objects and returns a tree structure.
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
