# matchblade

**matchblade** is a robust, type-safe functional programming toolbelt for TypeScript. It provides a powerful pattern matching utility along with a collection of helper functions to simplify common data transformation and control flow tasks.

## Features

- **Type-Safe Pattern Matching**: Exhaustive and strictly typed pattern matching with `match` and `caseOf`.
- **Async Pipelines**: Seamlessly chain async functions with `pipeAsync` and `pipeTap`.
- **Data Transformation**: Utilities like `evolve`, `mapBy`, `listToTree`, and `traverse` for handling complex data structures.
- **Guard Utilities**: `failOn` for runtime assertions.
- **Promise Helpers**: `awaitObj` to resolve objects containing promises.

## Installation

```bash
npm install matchblade
```

## Core: Pattern Matching

The core of `matchblade` is the `match` function, which allows you to perform pattern matching on values with full TypeScript support, including type narrowing.

### Basic Usage

Use `match` combined with `caseOf` to define pattern matching logic.

```typescript
import { match, caseOf, _ } from 'matchblade';

const getMessage = match<[string], string>(
  caseOf(['hello'], () => 'You said hello!'),
  caseOf(['bye'], () => 'See you later!'),
  caseOf([_], (msg) => `Unknown message: ${msg}`) // Wildcard catch-all
);

console.log(getMessage('hello')); // "You said hello!"
console.log(getMessage('unknown')); // "Unknown message: unknown"
```

### Matching with Predicates and Primitives

You can mix primitive values and predicate functions.

```typescript
import { match, caseOf, _ } from 'matchblade';

const isString = (x: unknown): x is string => typeof x === 'string';
const isNumber = (x: unknown): x is number => typeof x === 'number';

const processValue = match<[any], string>(
  caseOf([isString], (str) => `String: ${str.toUpperCase()}`),
  caseOf([isNumber, 10], (num) => `Is Number 10`),
  caseOf([isNumber], (num) => `Other Number: ${num}`),
  caseOf([_], () => 'Result: unknown')
);

console.log(processValue('test')); // "String: TEST"
console.log(processValue(10));     // "Is Number 10"
console.log(processValue(42));     // "Other Number: 42"
```

### Type Narrowing

`match` intelligently narrows types within the handler function based on the predicates used.

```typescript
class Cat { meow() { return 'meow'; } }
class Dog { bark() { return 'woof'; } }

const animalSound = match<[Cat | Dog], string>(
  caseOf([(x): x is Cat => x instanceof Cat], (cat) => cat.meow()),
  caseOf([(x): x is Dog => x instanceof Dog], (dog) => dog.bark()),
  caseOf([_], () => 'silence')
);

console.log(animalSound(new Cat())); // "meow"
```

### Matching Multiple Arguments

`match` is variadic and can match against multiple arguments simultaneously.

```typescript
const mixedMatch = match<[string, number], string>(
  caseOf(['a', 1], () => 'Matched A and 1'),
  caseOf(['b', 2], () => 'Matched B and 2'),
  caseOf([_, _], (a, b) => `Catch all: ${a}, ${b}`)
);

console.log(mixedMatch('a', 1)); // "Matched A and 1"
console.log(mixedMatch('b', 2)); // "Matched B and 2"
console.log(mixedMatch('c', 3)); // "Catch all: c, 3"
```

### Structured Matching (Objects and Arrays)

You can match against the structure of objects and arrays.

```typescript
// Match object structure
const objMatcher = match<[any], string>(
  caseOf([{ a: 1 }], (obj) => `Object with a=1`),
  caseOf([{ b: 2 }], (obj) => `Object with b=2`),
  caseOf([_], () => 'Other object')
);

console.log(objMatcher({ a: 1, c: 3 })); // "Object with a=1"

// Match 2-tuple structure
const arrayMatcher = match<[[number, number]], string>(
  caseOf([[1, 2]], () => 'Array [1, 2]'),
  caseOf([[_, 2]], () => '2-tuple ending with 2'),
  caseOf([_], () => 'Other array')
);

console.log(arrayMatcher([1, 2])); // "Array [1, 2]"
console.log(arrayMatcher([5, 2])); // "2-tuple ending with 2"
```

### Async Generators

`match` handlers can be async generators.

```typescript
const asyncGenMatcher = match<[number], AsyncGenerator<string, void, unknown>>(
  caseOf([1], async function* (n) {
    yield `Number ${n}`;
  })
);

for await (const val of asyncGenMatcher(1)) {
  console.log(val); // "Number 1"
}
```

## Utility: awaitObj

Resolves all `Promise` values within an object.

```typescript
import { awaitObj } from 'matchblade';

const data = {
    user: Promise.resolve({ id: 1, name: 'Alice' }),
    posts: ['Post 1', 'Post 2']
};

const resolved = await awaitObj(data);
// Output:
// {
//   user: { id: 1, name: 'Alice' },
//   posts: ['Post 1', 'Post 2']
// }
```

## Utility: evolve

Creates a new object by recursively applying transformations to a source object.

```typescript
import { evolve } from 'matchblade';

const user = {
    name: 'Alice',
    stats: { visits: 10 }
};

const transformations = {
    name: (name: string) => name.toUpperCase(),
    stats: {
        visits: (n: number) => n + 1
    }
};

const updated = evolve(transformations, user);
// Output:
// {
//   name: 'ALICE',
//   stats: { visits: 11 }
// }
```

## Utility: failOn

A guard utility that throws an error if a value matches a specific predicate. Useful for runtime assertions.

```typescript
import { failOn } from 'matchblade';

const isError = (val: any): val is Error => val instanceof Error;
const ensureSuccess = failOn(isError, 'Operation failed');

const result = ensureSuccess('Success'); // Returns 'Success'

// ensureSuccess(new Error('fail')); // Throws Error: 'Operation failed'
```

## Utility: listToTree

Converts a flat list of objects with ID and parent ID references into a nested tree structure.

```typescript
import { listToTree } from 'matchblade';

const list = [
    { id: '1', parentId: null, name: 'Root' },
    { id: '2', parentId: '1', name: 'Child A' },
    { id: '3', parentId: '1', name: 'Child B' }
];

// Configure the converter
const toTree = listToTree('id', 'parentId', 'children');

const tree = toTree(list);
// Output:
// {
//   id: '1', parentId: null, name: 'Root',
//   children: [
//     { id: '2', parentId: '1', name: 'Child A', children: [] },
//     { id: '3', parentId: '1', name: 'Child B', children: [] }
//   ]
// }
```

Notes:
- Root nodes are those with `parentId` set to `null` or `undefined` (not falsy values like `0`).
- `listToTree(...)` throws if it can’t find any root node.

## Utility: mapBy

Creates a `Map` from a list of elements, where keys are generated by a function.

```typescript
import { mapBy } from 'matchblade';

const users = [
    { id: 1, name: 'Alice' },
    { id: 2, name: 'Bob' }
];

const usersById = mapBy((u) => u.id, users);
// Output: Map { 1 => { id: 1... }, 2 => { id: 2... } }

console.log(usersById.get(1)); // { id: 1, name: 'Alice' }
```

## Utility: pipeAsync

Chains multiple functions (synchronous or asynchronous) into a single pipeline. Each function receives the output of the previous one.

```typescript
import { pipeAsync } from 'matchblade';

const addOne = (n: number) => n + 1;
const doubleAsync = async (n: number) => {
    await new Promise(r => setTimeout(r, 10));
    return n * 2;
};

const pipeline = pipeAsync(
    addOne,      // 5 -> 6
    doubleAsync, // 6 -> 12 (async)
    (n) => `Result: ${n}`
);

const result = await pipeline(5);
console.log(result); // "Result: 12"
```

## Utility: pipeTap

Creates a pipeline where each function receives the *original* argument and the result of the *previous* function. Useful for accumulated state or side effects.

```typescript
import { pipeTap } from 'matchblade';

const calculation = pipeTap(
    (initial: number) => initial + 1,       // 10 -> 11
    (initial, prev) => prev + 10,           // 11 + 10 = 21
    (initial, prev) => prev * 2             // 21 * 2 = 42
);

console.log(calculation(10)); // 42
```

## Utility: traverse

Recursively traverses a nested object or array and applies a transformation function to every primitive value.

```typescript
import { traverse } from 'matchblade';

const data = {
    a: 1,
    b: { c: 2, d: [3, 4] }
};

const doubleNumbers = traverse((val) => {
    return typeof val === 'number' ? val * 2 : val;
});

const result = doubleNumbers(data);
// Output:
// {
//   a: 2,
//   b: { c: 4, d: [6, 8] }
// }
```

## TypeScript Guide

`matchblade` functions are designed to be type-safe. Many functions are curried. When using the curried version, precise typing helps TypeScript infer the correct return types.

### Typing Curried Functions

When using functions like `mapBy`, `evolve`, or `traverse` in a curried manner (passing only the first argument), you may need to explicitly specify the types if inference is not sufficient.

```typescript
// Explicitly typing mapBy for better inference
const mapById = mapBy((u: { id: number }) => u.id);
// mapById is now inferred as (list: { id: number }[]) => Map<number, { id: number }>
```

### Type Narrowing in Match

The `match` function uses TypeScript's control flow analysis to narrow types in your handlers. This means you don't need to manually cast `any` types if you use type guards.

```typescript
const isString = (x: any): x is string => typeof x === 'string';

match<[any], string>(
  caseOf([isString], (str) => {
    // 'str' is correctly inferred as 'string' here
    return str.toUpperCase();
  })
);
```

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.

## License

Apache-2.0
