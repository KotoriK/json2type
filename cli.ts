import { readFile, writeFile } from "fs/promises";
import { parseToTypes } from './index'
readFile('./input.txt', 'utf-8').then(str =>
    parseToTypes(JSON.parse(str))
).then((str) =>
    writeFile('./output.ts', str, 'utf-8')
).finally(() => {
    console.log('Job done.')
})