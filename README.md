# Matchblade

[![npm version](https://img.shields.io/npm/v/matchblade.svg)](https://www.npmjs.com/package/matchblade)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)

Matchblade is a robust TypeScript utility library designed to bring functional programming patterns and type safety to your daily workflow. It provides a suite of powerful tools for pattern matching, data transformation, and async control flow.

## Table of Contents

- [Installation](#installation)
- [Why Matchblade?](#why-matchblade)
- [Features](#features)
- [API Reference](#api-reference)
  - [Pattern Matching (`match` / `caseOf`)](#pattern-matching-match--caseof)
  - [Object Evolution (`evolve`)](#object-evolution-evolve)
  - [Promise Resolution (`awaitObj`)](#promise-resolution-awaitobj)
  - [Tree Conversion (`listToTree`)](#tree-conversion-listtotree)
  - [Map Creation (`mapBy`)](#map-creation-mapby)
  - [Async Piping (`pipeAsync`)](#async-piping-pipeasync)
  - [Pipe Tapping (`pipeTap`)](#pipe-tapping-pipetap)
  - [Deep Traversal (`traverse`)](#deep-traversal-traverse)
  - [Guarded Failure (`failOn`)](#guarded-failure-failon)
- [License](#license)

## Installation

```bash
npm install matchblade
```

## Why Matchblade?

Matchblade bridges the gap between functional programming concepts and practical TypeScript development.
- **Type Safety First**: Built with TypeScript in mind, ensuring your data transformations and pattern matching are fully typed.
- **Functional Patterns**: Brings powerful concepts like pattern matching and piping to standard JavaScript/TypeScript.
- **Utility Focused**: Solves common problems like deep object traversal, list-to-tree conversion, and async flows without the bloat of larger frameworks.

## Features

- **Pattern Matching**: Expressive `match` and `caseOf` for handling complex conditions with type narrowing.
- **Async Utilities**: `pipeAsync` and `awaitObj` for managing asynchronous operations cleanly.
- **Data Structures**: Helpers for Trees, Maps, and deep object manipulation.
- **Guards**: `failOn` for declarative validation.

## API Reference

### Pattern Matching (`match` / `caseOf`)

A powerful pattern matching utility that narrows types based on predicates. `match` takes a series of `caseOf` clauses and returns a function that, when called with arguments, will execute the handler of the first matching case.

```typescript
import { match, caseOf } from 'matchblade';
import { is, _ } from 'ramda';

// Define type guards
const isString = (x: any): x is string => typeof x === 'string';
const isNumber = (x: any): x is number => typeof x === 'number';

// Create a matcher
const myMatcher = match<[string | number, any], string>(
  caseOf([isString, _], (str) => `The string is: ${str}`),
  caseOf([isNumber, 10], (num) => `The number is 10, and the first arg was ${num}`),
  caseOf([isNumber, _], (num) => `It's a number: ${num}`),
  caseOf([{ a: 1 }], (obj) => `It's an object with a=1: ${JSON.stringify(obj)}`)
);

// Use the matcher
console.log(myMatcher("hello", 5)); // "The string is: hello"
console.log(myMatcher(42, 10)); // "The number is 10, and the first arg was 42"
console.log(myMatcher(100, "world")); // "It's a number: 100"
console.log(myMatcher({ a: 1, b: 2 }, 0)); // "It's an object with a=1: ..."

// This will throw an error because no case matches
// myMatcher(true, false);
```

### Object Evolution (`evolve`)

Creates a new object by recursively applying transformations to a source object. `evolve` is a powerful tool for immutably changing object structures. It takes a "spec" object that defines how to transform the source.

- If a spec property is a function and the key exists in the source, the function is called with the source's value for that key.
- If a spec property is a function and the key does *not* exist in the source, the function is called with the entire source object.
- If a source property is an array of objects and the corresponding spec is an object, `evolve` will be applied to each item in the array.
- If a source property is an object and the spec is also an object, `evolve` will be called recursively.

```typescript
import { evolve } from 'matchblade';
import { inc, map } from 'ramda';

const source = {
  a: 1,
  b: { c: 2, d: [3, 4] },
  e: 'hello',
  f: [{ g: 5 }, { g: 6 }]
};

const transformations = {
  a: inc, // Increment `a`
  b: {
    c: (c: number) => c * 2, // Double `b.c`
    d: map(inc) // Increment each item in `b.d`
  },
  newProp: (o: typeof source) => o.a + o.b.c, // Add a new property
  f: {
    g: inc // Increment `g` in each object in `f`
  }
};

const result = evolve(transformations, source);
// result will be:
// {
//   a: 2,
//   b: { c: 4, d: [4, 5] },
//   e: 'hello',
//   f: [{ g: 6 }, { g: 7 }],
//   newProp: 3 // 1 (original a) + 2 (original b.c)
// }
```

### Promise Resolution (`awaitObj`)

Resolves all `Promise` values within an object. This function takes an object where some properties are `Promise`s and returns a new `Promise` that resolves to an object with the same keys, but with all `Promise`s replaced by their resolved values.

```typescript
import { awaitObj } from 'matchblade';

const data = {
  user: Promise.resolve({ id: 1, name: 'Alice' }),
  posts: Promise.resolve(['Post 1', 'Post 2']),
  version: 2,
};

const resolvedData = await awaitObj(data);
// resolvedData will be:
// {
//   user: { id: 1, name: 'Alice' },
//   posts: ['Post 1', 'Post 2'],
//   version: 2,
// }
```

### Tree Conversion (`listToTree`)

Creates a function that converts a flat list of objects into a tree structure. You first call it with the configuration (property names for ID, parent ID, and children), and it returns a function that will perform the transformation on a list.

```typescript
import { listToTree } from 'matchblade';

const nodes = [
  { id: 1, name: 'Root', parent_id: null },
  { id: 2, name: 'Child A', parent_id: 1 },
  { id: 3, name: 'Child B', parent_id: 1 },
  { id: 4, name: 'Grandchild A.1', parent_id: 2 },
];

// Create a tree converter
const toTree = listToTree('id', 'parent_id', 'children');

// Convert the list to a tree
const tree = toTree(nodes);
// tree: { id: 1, name: 'Root', parent_id: null, children: [ ... ] }
```

### Map Creation (`mapBy`)

Creates a `Map` from a list of elements, where the keys are generated by a provided function and the values are the elements themselves.

```typescript
import { mapBy } from 'matchblade';

const people = [
  { id: 1, name: 'Alice' },
  { id: 2, name: 'Bob' },
  { id: 3, name: 'Charlie' },
];

// Create a map by person's ID
const peopleById = mapBy(person => person.id, people);
// Map { 1 => { id: 1, name: 'Alice' }, 2 => { id: 2, name: 'Bob' }, ... }

console.log(peopleById.get(2)); // { id: 2, name: 'Bob' }
```

### Async Piping (`pipeAsync`)

Creates an asynchronous pipeline of functions. `pipeAsync` chains a series of functions, where the output of each function is passed as the input to the next. It seamlessly handles both synchronous and asynchronous functions.

```typescript
import { pipeAsync } from 'matchblade';

const addOne = (n: number) => n + 1;
const doubleAsync = async (n: number) => {
  await new Promise(res => setTimeout(res, 10));
  return n * 2;
};
const toString = (n: number) => `Result: ${n}`;

const calculation = pipeAsync(
  addOne,      // 5 -> 6
  doubleAsync, // 6 -> 12 (after a delay)
  toString     // 12 -> "Result: 12"
);

const result = await calculation(5);
console.log(result); // "Result: 12"
```

### Pipe Tapping (`pipeTap`)

Creates a pipeline of functions where each function receives the initial argument and the result of the previous function. `pipeTap` is useful for creating a sequence of operations that depend on a shared initial state and the outcome of the preceding step.

```typescript
import { pipeTap } from 'matchblade';

const calculationCorrect = pipeTap(
  (initial: number) => initial + 1, // 10 -> 11
  (_, prev) => prev + 10, // 11 + 10 = 21
  (_, prev) => prev * 2 // 21 * 2 = 42
);

const resultSync = calculationCorrect(10);
console.log(resultSync); // 42
```

### Deep Traversal (`traverse`)

Recursively traverses a nested data structure (object or array) and applies a function to each non-container value (i.e., primitives). `traverse` walks through objects and arrays, and for any value that is not an object or an array, it applies the provided function `fn`.

```typescript
import { traverse } from 'matchblade';

const data = {
  a: 1,
  b: {
    c: 2,
    d: [3, 4],
  },
  e: 'hello'
};

// Double all numbers in the structure
const doubler = (val: any) => (typeof val === 'number' ? val * 2 : val);
const result = traverse(doubler, data);
// result will be:
// {
//   a: 2,
//   b: {
//     c: 4,
//     d: [6, 8],
//   },
//   e: 'hello'
// }
```

### Guarded Failure (`failOn`)

Creates a function that throws an error if the input matches the guard. This is useful for ensuring at runtime that a value does not conform to a certain type.

```typescript
import { failOn } from 'matchblade';

// Define a type and a type guard
type Vehicle = 'car' | 'bike' | 'plane';
const isPlane = (v: Vehicle): v is 'plane' => v === 'plane';

// Create a function that will fail if the vehicle is a plane
const rejectPlanes = failOn(isPlane, 'Planes are not allowed!');

try {
  const myVehicle = rejectPlanes('car'); // This will pass
  console.log(`My vehicle is a ${myVehicle}`); // "My vehicle is a car"

  const anotherVehicle = rejectPlanes('plane'); // This will throw an error
} catch (error) {
  console.error(error.message); // "Planes are not allowed!"
}
```

## License

© 2023-2025 Andreas Herd

Licensed under the Apache License 2.0: http://www.apache.org/licenses/LICENSE-2.0
