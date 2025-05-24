import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

export default defineConfig({
	plugins: [dts()],
	build: {
		target: 'es6',
		outDir: 'dist',
		rollupOptions: {
			treeshake: true
		},
		lib: {
			entry: 'lib/index.ts',
			formats: ['es', 'cjs'],
			fileName: format => `index.${format}.js`
		},
		emptyOutDir: true,
		minify: false
	}
})
