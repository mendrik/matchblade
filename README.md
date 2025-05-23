# Matchblade

[![npm version](https://img.shields.io/npm/v/matchblade.svg)](https://www.npmjs.com/package/matchblade)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)

Matchblade is a TypeScript utility library offering a suite of functional programming helpers with full type safety. It includes pattern matching, async handling, data structure transformations, object traversal, and more.

## Installation

```bash
npm install matchblade
```

## Features

- **Pattern matching** with type narrowing: `match` / `caseOf`
- **Object evolution**: `evolveAlt`
- **Promise resolution**: `awaitObj`
- **List-to-tree conversion**: `listToTree`
- **Mapping to Map**: `mapBy`
- **Async piping**: `pipeAsync`
- **Tapping pipe**: `pipeTap`
- **Deep traversal**: `traverse`
- **Guarded failure**: `failOn`

## API Reference

### `caseOf` & `match`

Match takes a list of cases and returns a function that will match the input values against the cases.

For example like so
```typescript
match<[Arg1, Arg2], string>( // you must hint the input and return types
  caseOf([isArray, _], (arr, arg2) => 'Array'),
  caseOf([isObj, _], (obj, arg2) => 'Object'),
  caseOf([_, _], (arg1, arg2) => 'Default')
)(arg1, arg2)

match<[Arg1], string>(
  caseOf([{ prop1: A }], obj => 'object'), // if Arg1 is a union type, obj is will have the Extract<Args, { props1: A}> type
)(arg1)

match<[number, number], string>(
  caseOf([1,2], '1,2'), // you can also work with static objects if only value equality is checked
)(arg1, arg2)

match<[object], string>(
  caseOf({ propA: matchX, propB: { nested: matchY } }, () => 'ok'), // nested matchers in objects
)(arg1)
```

Each case must be wrapped in a caseOf function, which takes an array of predicates (matching the arity of the 
input parameters) and a handler function.
The argument types of the handler function will be narrowed down if the predicates are type guards or 
partial objects.
Predicates can be also primitive values, in which case the camparison will be done with strict equality.
If the predicate is an object, the input object must contain all the properties of the predicate object.
If the object properties are predicates, the input object properties must match the predicates.
Tuples are matched element-wise.
If no match is found, an error is thrown.
You can use `_` to match anything (it's a function that always returns true)

```typescript
import { caseOf, match, _ } from 'matchblade';
import { isObject } from 'ramda-adjunct';

const handler = match<[any, any], string>(
  caseOf([Array.isArray, _], arr => `Array(${arr.length})`),
  caseOf([isObject, _], obj => `Object(${Object.keys(obj).length})`),
  caseOf([42, _], () => 'The answer!'),
  caseOf([_, _], (a, b) => `Default: ${a}, ${b}`)
);

console.log(handler([1, 2], 0)); // "Array(2)"
console.log(handler({ x: 1 }, '')); // "Object(1)"
console.log(handler(42, null));      // "The answer!"
console.log(handler('foo', 'bar')); // "Default: foo, bar"
```

### `evolveAlt`

Recursively transform an object according to a spec. Maps nested arrays/objects automatically.
Instead of doing evolve({ a: evolve({ b: map(evolve({ c: toUpperCase }))})} you can simply do
evolveAlt({ a: { b: {c: toUpperCase } } }). If spec props are non existant in the source object
the whole object is passed into the transforming function.

```ts
import { evolveAlt } from 'matchblade';

const source = { a: 1, b: { c: 2 }, list: [{ v: 3 }] };
const spec   = { a: (n: number) => n + 1, b: { c: (n: number) => n * 2 }, list: { v: (n: number) => n - 1 } };

const result = evolveAlt(spec, source);
// result = { a: 2, b: { c: 4 }, list: [{ v: 2 }] }
```

### `awaitObj`

Resolve all _promised_ properties in an object while preserving keys. 

```ts
import { awaitObj } from 'matchblade';

const data = { x: Promise.resolve(1), y: 2 };
const resolved = await awaitObj(data);
// resolved = { x: 1, y: 2 }
```

### `listToTree`

Convert a flat list with references via parent ids into a nested tree.

Expects 3 property names:
- where ids are defined
- which property refers to parent ids
- where should child nodes be stashed to

and a flat list of node objects.

```ts
import { listToTree } from 'matchblade';

const items = [ { id: 1, parent: null }, { id: 2, parent: 1 }, { id: 3, parent: 1 } ];
const tree = listToTree('id', 'parent', 'children')(items);
// tree = { id: 1, parent: null, children: [ { id: 2, parent: 1, children: [] }, { id: 3, parent: 1, children: [] } ] }
```

### `mapBy`

Create a `Map` from an array using a key selector.

```ts
import { mapBy } from 'matchblade';

const users = [ { id: 1, name: 'A' }, { id: 2, name: 'B' } ];
const byId = mapBy(u => u.id, users);
// Map { 1 => { id: 1, name: 'A' }, 2 => { id: 2, name: 'B' } }
```

### `pipeAsync`

Compose functions (sync or async) into a pipeline returning a Promise.

```ts
import { pipeAsync } from 'matchblade';

const pipeline = pipeAsync(
  (n: number) => n + 1,
  async n => n * 2,
  n => `Result: ${n}`
);

await pipeline(5); // "Result: 12"
```

### `pipeTap`

Similar to `pipeAsync`, but each function also receives the original input.

```ts
import { pipeTap } from 'matchblade';

const fn1 = (id: number) => ({ id });
const fn2 = (id: number, res: any) => ({ ...res, time: Date.now() });

const tapped = pipeTap(fn1, fn2);
const result = tapped(3);
// result = { id: 3, time: 161803398874 }
```

### `traverse`

Deeply traverse an object/array, applying a function to each value (with optional key).

```ts
import { traverse } from 'matchblade';

const data = { a: 1, b: { c: 2, d: [3,4] } };
const doubled = traverse((val: number) => val * 2, data);
// doubled = { a: 2, b: { c: 4, d: [6,8] } }
```

### `failOn`

Throw if a guard returns true; otherwise return the input.

```ts
import { failOn } from 'matchblade';

const notNull = failOn((x: string|null): x is null => x === null, 'Value is null');
notNull('hello'); // returns 'hello'
notNull(null);    // throws Error('Value is null')
```

## License

© 2023-2025 Andreas Herd

Licensed under the Apache License 2.0: http://www.apache.org/licenses/LICENSE-2.0
