"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const promises_1 = require("fs/promises");
const index_1 = require("./index");
promises_1.readFile('./input.txt', 'utf-8').then(str => index_1.parseToTypes(JSON.parse(str))).then((str) => promises_1.writeFile('./output.ts', str, 'utf-8')).finally(() => {
    console.log('Job done.');
});
