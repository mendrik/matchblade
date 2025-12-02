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
  - [Object Evolution (`evolveAlt`)](#object-evolution-evolvealt)
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

A powerful pattern matching utility that narrows types based on predicates.

```typescript
import { match, caseOf, _ } from 'matchblade';
// Assuming you have predicates like isArray, isObject available or defined
const isArray = (x: any): x is any[] => Array.isArray(x);
const isObject = (x: any): x is object => typeof x === 'object' && x !== null;

const handleInput = match<[any, any], string>(
  caseOf([isArray, _], (arr, arg2) => `Array of length ${arr.length}`),
  caseOf([isObject, _], (obj, arg2) => `Object with keys: ${Object.keys(obj)}`),
  caseOf([42, _], () => 'The Ultimate Answer'),
  caseOf([_, _], (a, b) => `Default: ${a}, ${b}`)
);

console.log(handleInput([1, 2], 0)); // "Array of length 2"
console.log(handleInput({ a: 1 }, 0)); // "Object with keys: a"
```

### Object Evolution (`evolveAlt`)

Recursively transform an object according to a spec. It automatically handles nested arrays and objects.

```typescript
import { evolveAlt } from 'matchblade';

const source = {
  user: { name: 'alice', score: 10 },
  items: [{ id: 1, value: 5 }, { id: 2, value: 10 }]
};

const spec = {
  user: { name: (s: string) => s.toUpperCase() },
  items: { value: (n: number) => n * 2 }
};

const result = evolveAlt(spec, source);
// result:
// {
//   user: { name: 'ALICE', score: 10 },
//   items: [{ id: 1, value: 10 }, { id: 2, value: 20 }]
// }
```

### Promise Resolution (`awaitObj`)

Resolve all properties in an object that are Promises, returning a new object with resolved values.

```typescript
import { awaitObj } from 'matchblade';

const data = {
  id: 1,
  profile: Promise.resolve({ name: 'Bob' }),
  stats: Promise.resolve([1, 2, 3])
};

const resolved = await awaitObj(data);
// resolved: { id: 1, profile: { name: 'Bob' }, stats: [1, 2, 3] }
```

### Tree Conversion (`listToTree`)

Convert a flat list of items with parent references into a nested tree structure.

```typescript
import { listToTree } from 'matchblade';

const items = [
  { id: 1, parentId: null, name: 'Root' },
  { id: 2, parentId: 1, name: 'Child 1' },
  { id: 3, parentId: 1, name: 'Child 2' }
];

const toTree = listToTree('id', 'parentId', 'children');
const tree = toTree(items);
// tree: { id: 1, parentId: null, name: 'Root', children: [ ... ] }
```

### Map Creation (`mapBy`)

Create a `Map` from an array using a selector function for the key.

```typescript
import { mapBy } from 'matchblade';

const users = [{ id: 1, name: 'Alice' }, { id: 2, name: 'Bob' }];
const usersMap = mapBy(u => u.id, users);

// usersMap.get(1) -> { id: 1, name: 'Alice' }
```

### Async Piping (`pipeAsync`)

Compose a series of functions (sync or async) into a single pipeline.

```typescript
import { pipeAsync } from 'matchblade';

const process = pipeAsync(
  (x: number) => x + 1,
  async (x: number) => x * 2,
  (x: number) => `Result: ${x}`
);

const result = await process(5); // (5 + 1) * 2 = 12 -> "Result: 12"
```

### Pipe Tapping (`pipeTap`)

Similar to `pipeAsync`, but allows "tapping" into the flow. Each function receives the original input as the first argument, and the result of the previous function as the second.

```typescript
import { pipeTap } from 'matchblade';

const logStep = (input: any, result: any) => {
  console.log('Step result:', result);
  return result;
};

const pipeline = pipeTap(
  (x: number) => x * 2,
  logStep,
  (x: number, prev: number) => prev + 10
);

await pipeline(5);
```

### Deep Traversal (`traverse`)

Deeply traverse an object or array, applying a transformation function to every value.

```typescript
import { traverse } from 'matchblade';

const data = { a: 1, b: [2, 3] };
const doubled = traverse((val: number) => val * 2, data);
// doubled: { a: 2, b: [4, 6] }
```

### Guarded Failure (`failOn`)

A utility to throw an error if a condition is met, otherwise return the value. Useful for asserting invariants in pipelines.

```typescript
import { failOn } from 'matchblade';

const ensureNotNull = failOn(
  (x: any) => x === null || x === undefined,
  'Value cannot be null'
);

ensureNotNull('ok'); // 'ok'
ensureNotNull(null); // Throws Error: 'Value cannot be null'
```

## License

© 2023-2025 Andreas Herd

Licensed under the Apache License 2.0: http://www.apache.org/licenses/LICENSE-2.0
