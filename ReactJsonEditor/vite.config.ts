import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [react()],
	resolve: {
		alias: {
			apis: resolve(__dirname, './src/apis'),
			global: resolve(__dirname, './src/components/global'),
			pages: resolve(__dirname, './src/pages'),
			queries: resolve(__dirname, './src/queries'),
			stores: resolve(__dirname, './src/stores')
		}
	}
})
