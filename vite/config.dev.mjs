import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
    base: './',
    plugins: [
        react(),
    ],
    build: {
        rollupOptions: {
            input: {
                main: resolve(__dirname, '../index.html'),
                'dev-test': resolve(__dirname, '../dev-test.html'),
            },
        },
    },
    server: {
        port: 8080
    }
})
