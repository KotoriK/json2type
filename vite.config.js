import dts from "vite-plugin-dts";
import { readFileSync } from "fs";
/**
 * @type {import('vite').UserConfig}
 */
export default {
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
}