import { beforeEach, describe, expect, it, vi } from 'vitest'
import { pipeTap } from './pipe-tap.ts'

describe('pipeTap', () => {
	const add2 = vi.fn((x: number) => x + 2)
	const promiseAdd3 = vi.fn(async (x: number) => x + 3)
	const promiseAdd4 = vi.fn(async (x: number) => x + 4)

	beforeEach(() => {
		add2.mockClear()
		promiseAdd3.mockClear()
		promiseAdd4.mockClear()
	})

	it('should handle hybrid case with asyncFn followed by normalFn', async () => {
		const res = await pipeTap(promiseAdd3, add2)(3)
		expect(res).toBe(5)
		expect(promiseAdd3).toHaveBeenCalledWith(3, undefined)
		expect(add2).toHaveBeenCalledWith(3, 6)
		expect(promiseAdd3).toHaveBeenCalledTimes(1)
		expect(add2).toHaveBeenCalledTimes(1)
	})

	it('should handle async case with asyncFn followed by asyncFn2', async () => {
		const res = await pipeTap(promiseAdd3, promiseAdd4)(3)

		expect(res).toBe(7)
		expect(promiseAdd3).toHaveBeenCalledWith(3, undefined)
		expect(promiseAdd4).toHaveBeenCalledWith(3, 6)
		expect(promiseAdd3).toHaveBeenCalledTimes(1)
		expect(promiseAdd4).toHaveBeenCalledTimes(1)
	})

	it('should handle sync case with normalFn followed by normalFn', () => {
		const res = pipeTap(add2, add2)(3)

		expect(res).toBe(5)
		expect(add2).toHaveBeenCalledWith(3, undefined)
		expect(add2).toHaveBeenCalledWith(3, 5)
		expect(add2).toHaveBeenCalledTimes(2)
	})

	it('should resolve types correctly in a hybrid scenario', async () => {
		const pipe = pipeTap(promiseAdd3, add2)

		const res = await pipe(3)

		expect(res).toBe(5)
	})

	it('should resolve types correctly in an async scenario', async () => {
		const pipe = pipeTap(promiseAdd3, promiseAdd4)

		const res = await pipe(3)

		expect(res).toBe(7)
	})

	it('should resolve types correctly in a sync scenario', () => {
		const pipe = pipeTap(add2, add2)

		const res = pipe(3)

		expect(res).toBe(5)
	})

	it('should pass all arguments correctly to each function in the pipe', async () => {
		const res = await pipeTap(promiseAdd3, add2)(3)

		expect(promiseAdd3).toHaveBeenCalledWith(3, undefined)
		expect(add2).toHaveBeenCalledWith(3, 6)
	})

	it('should return correct type in all cases', async () => {
		const syncResult = pipeTap(add2)(3)
		expect(syncResult).toBe(5)

		const asyncResult = await pipeTap(promiseAdd3)(3)
		expect(asyncResult).toBe(6)

		const mixedResult = await pipeTap(add2, promiseAdd3)(3)
		expect(mixedResult).toBe(6)
	})

	it('should return the result of the last function in the pipe', async () => {
		const pipe = pipeTap(add2, promiseAdd3, add2)

		const result = await pipe(3)
		expect(result).toBe(5)
	})

	it('should handle hybrid functions with promised results correctly', async () => {
		const pipe = pipeTap(add2, promiseAdd3)

		const result = await pipe(3)
		expect(result).toBe(6)
		expect(add2).toHaveBeenCalledTimes(1)
		expect(promiseAdd3).toHaveBeenCalledTimes(1)
	})

	it('should handle multiple synchronous functions', () => {
		const pipe = pipeTap(add2, add2, add2)

		const result = pipe(3)
		expect(result).toBe(5)
		expect(add2).toHaveBeenCalledTimes(3)
	})

	it('should handle multiple asynchronous functions', async () => {
		const pipe = pipeTap(promiseAdd3, promiseAdd3, promiseAdd3)

		const result = await pipe(3)
		expect(result).toBe(6)
		expect(promiseAdd3).toHaveBeenCalledTimes(3)
	})

	it('should handle mixed async and sync with multiple steps', async () => {
		const pipe = pipeTap(add2, promiseAdd3, add2)

		const result = await pipe(3)
		expect(result).toBe(5)
		expect(add2).toHaveBeenCalledTimes(2)
		expect(promiseAdd3).toHaveBeenCalledTimes(1)
	})

	it('should execute correctly for promise handling with multiple steps', async () => {
		const pipe = pipeTap(promiseAdd3, promiseAdd3, add2)

		const result = await pipe(3)
		expect(result).toBe(5)
		expect(promiseAdd3).toHaveBeenCalledTimes(2)
		expect(add2).toHaveBeenCalledTimes(1)
	})

	it('should pass on results', async () => {
		const fn = (a: number, b: number): number => b + 1
		const pipe = pipeTap(x => x, fn, fn, fn)
		const result = pipe(3)
		expect(result).toBe(6)
	})

	it('should pass on results asynch', async () => {
		const fn = async (a: number, b: number): Promise<number> => b + 1
		const pipe = pipeTap(x => x, fn, fn, fn)
		const result = await pipe(3)
		expect(result).toBe(6)
	})

	it('should pass on results hybrid', async () => {
		const fn = async (a: number, b: number): Promise<number> => b + 1
		const fns = (a: number, b: number): number => b + 1
		const pipe = pipeTap(x => x, fn, fns, fns)
		const result = await pipe(3)
		expect(result).toBe(6)
	})
})
