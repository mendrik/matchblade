import { defineConfig } from 'vite'
import { resolve } from 'node:path'
import dts from 'vite-plugin-dts'

export default defineConfig({
	plugins: [dts({ include: ['lib'] })],
	build: {
		copyPublicDir: false,
		lib: {
			entry: resolve(__dirname, 'lib/index.ts'),
			formats: ['es']
		}
	}
})
