/**
 * Creates a function that throws an error if the input matches the guard.
 * This is useful for ensuring at runtime that a value does not conform to a certain type.
 *
 * @template T - The type of the input value.
 * @template G - The type guarded by the guard function, which should be a subtype of T.
 * @param {(x: T) => x is G} guard - A type guard function that returns `true` if the
 *   value should cause a failure (i.e., it matches the "forbidden" type).
 * @param {string} message - The error message to throw if the guard returns `true`.
 * @returns {(x: T) => Exclude<T, G>} A function that takes a value of type `T`.
 *   If the guard returns `false`, it returns the value, type-narrowed to `Exclude<T, G>`.
 *   If the guard returns `true`, it throws an error with the specified message.
 *
 * @example
 * import { failOn } from './guards';
 *
 * // Define a type and a type guard
 * type Vehicle = 'car' | 'bike' | 'plane';
 * const isPlane = (v: Vehicle): v is 'plane' => v === 'plane';
 *
 * // Create a function that will fail if the vehicle is a plane
 * const rejectPlanes = failOn(isPlane, 'Planes are not allowed!');
 *
 * try {
 *   const myVehicle = rejectPlanes('car'); // This will pass
 *   console.log(`My vehicle is a ${myVehicle}`); // "My vehicle is a car"
 *
 *   const anotherVehicle = rejectPlanes('plane'); // This will throw an error
 * } catch (error) {
 *   console.error(error.message); // "Planes are not allowed!"
 * }
 *
 * // Example with a more complex type
 * interface Circle {
 *   type: 'circle';
 *   radius: number;
 * }
 *
 * interface Square {
 *   type: 'square';
 *   side: number;
 * }
 *
 * type Shape = Circle | Square;
 *
 * const isSquare = (s: Shape): s is Square => s.type === 'square';
 *
 * const processCircle = (shape: Shape) => {
 *   const circle = failOn(isSquare, 'Only circles are allowed')(shape);
 *   // `circle` is now typed as `Circle`
 *   console.log(`Processing a circle with radius ${circle.radius}`);
 * };
 *
 * processCircle({ type: 'circle', radius: 10 }); // "Processing a circle with radius 10"
 * // processCircle({ type: 'square', side: 5 }); // Throws "Only circles are allowed"
 */
export function failOn<T, G extends T>(
	guard: (x: T) => x is G,
	message: string
): (x: T) => Exclude<T, G>

export function failOn<T, G extends T>(
	guard: (x: T) => x is G,
	message: string
) {
	return (x: T): Exclude<T, G> => {
		if (guard(x)) {
			throw new Error(message)
		}
		return x as Exclude<T, G>
	}
}
