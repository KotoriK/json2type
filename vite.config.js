import dts from "vite-plugin-dts";
import { readFileSync } from "fs";
import { defineConfig } from "vitest/config";
/**
 * @type {import('vite').UserConfig}
 */
export default defineConfig({
    plugins: [dts()],
    build: {
        target: 'esnext',
        lib: {
            entry: 'index.ts',
            formats: ['es', 'cjs'],
            fileName: 'index',
        },
        rollupOptions: {
            external: Object.keys(JSON.parse(readFileSync('./package.json', 'utf8')).dependencies)
        }

    },
    test: {
        include: ['index.test.ts'],
        environment: 'node',
    },
})