import { describe, expect, expectTypeOf, test } from 'vitest'
import { pipeAsync } from './pipe-async.ts'

describe('pipeAsync', () => {
	test('should correctly pipe synchronous and asynchronous functions', async () => {
		const fn1 = (a: number) => a + 1
		const fn2 = (b: number) => Promise.resolve(b * 2)
		const fn3 = (c: number) => `Result: ${c}`

		const piped = pipeAsync(fn1, fn2, fn3)

		const result = await piped(5)
		expect(result).toBe('Result: 12')

		// Type inference test
		expectTypeOf(piped).toEqualTypeOf<(arg: number) => Promise<string>>()
	})

	test('should handle functions returning promises', async () => {
		const fn1 = (a: number) => Promise.resolve(a + 1)
		const fn2 = (b: number) => Promise.resolve(b * 2)
		const fn3 = (c: number) => Promise.resolve(`Result: ${c}`)

		const piped = pipeAsync(fn1, fn2, fn3)

		const result = await piped(5)
		expect(result).toBe('Result: 12')

		// Type inference test
		expectTypeOf(piped).toEqualTypeOf<(arg: number) => Promise<string>>()
	})

	test('should handle async functions', async () => {
		const fn1 = async (a: number) => a + 1
		const fn2 = async (b: number) => b * 2
		const fn3 = async (c: number) => `Result: ${c}`

		const piped = pipeAsync(fn1, fn2, fn3)

		const result = await piped(5)
		expect(result).toBe('Result: 12')

		// Type inference test
		expectTypeOf(piped).toEqualTypeOf<(arg: number) => Promise<string>>()
	})

	test('should handle mixed synchronous and asynchronous functions', async () => {
		const fn1 = (a: number) => Promise.resolve(a + 1)
		const fn2 = async (b: number) => b * 2
		const fn3 = (c: number) => `Result: ${c}`

		const piped = pipeAsync(fn1, fn2, fn3)

		const result = await piped(5)
		expect(result).toBe('Result: 12')

		// Type inference test
		expectTypeOf(piped).toEqualTypeOf<(arg: number) => Promise<string>>()
	})

	test('should correctly handle a single function', async () => {
		const fn1 = (a: number) => a + 1

		const piped = pipeAsync(fn1)

		const result = await piped(5)
		expect(result).toBe(6)

		// Type inference test
		expectTypeOf(piped).toEqualTypeOf<(arg: number) => Promise<number>>()
	})

	test('should throw an error when types do not align', async () => {
		const fn1 = (a: number) => a + 1
		const fn2 = (b: string) => b.toUpperCase()
		const fn3 = (c: string) => `Result: ${c}`

		// We intentionally cast fn1 to any to bypass TypeScript's type checking for this test.
		// This simulates a runtime error due to type mismatch.
		const piped = pipeAsync(fn1 as any, fn2, fn3)

		await expect(piped(5)).rejects.toThrowError()
	})

	test('should infer correct types and report errors when types mismatch', () => {
		const fn1 = (a: number) => a + 1
		const fn2 = (b: string) => b.toUpperCase()
		const fn3 = (c: string) => `Result: ${c}`

		// TypeScript should report an error here due to type mismatch.
		// Uncommenting the following line will cause a type error.
		// const piped = pipeAsync(fn1, fn2, fn3);

		// For testing purposes, we can assert the expected type error using @ts-expect-error
		// @ts-expect-error
		const piped = pipeAsync(fn1, fn2, fn3)

		// Since we cannot execute code that doesn't compile, we don't run this function.
	})
})
