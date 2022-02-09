import test from "tape";
import describe from 'tape-describe'

import { parseToTypes } from './index'
test("{} should return {}", (t) => {
    t.match(parseToTypes('{"a":{}}').replace(/\s/g, ''), new RegExp('a:{}'))
    t.end()
});
test('[] should return Array<unknown>', (t) => {
    t.match(parseToTypes('{"a":[]}').replace(/\s/g, ''), new RegExp('a:Array<unknown>'))
    t.end()
})
test('should return Array<number>', (t) => {
    t.match(parseToTypes('{"a":[1]}').replace(/\s/g, ''), new RegExp('a:Array<number>'))
    t.end()
})
test('should return Array<undefined>', (t) => {
    t.match(parseToTypes('{"a":[null]}').replace(/\s/g, ''), new RegExp('a:Array<undefined>'))
    t.end()
})
test('should return Array<number|string>', (t) => {
    t.true(parseToTypes('{"a":[1,"1"]}').replace(/\s/g, '').match(/a:Array<(?:number|string)\|(?:string|number)>/))
    t.end()
})
test('interface name starts with number should be wrapped', (t) => {
    t.false(parseToTypes('{"114514":{"a":{}}}').replace(/\s/g, '').match('interface 114514'))
    t.end()
})
describe('merge interface', test => {
    const result = parseToTypes(JSON.stringify({
        artwork_a: {
            tag: {
                name: 'a',
                id: 114514,
                translation: {
                    cn: "啊"
                }
            }
        },
        artwork_b: {
            tag: {
                name: 'b',
                id: 1919,
            }
        },
        artwork_c: {
            tag: {
                name: 'c',
                id: 810,
            }
        },
        artwork_d: {
            tag: {
                name: 'd',
                id: 1,
                translation: {
                    cn: "哦",
                    en: "ohh"
                }
            }
        }
    })).replace(/\s/g, '')

    test('reuse interface', (t) => {
        t.match(result, /artwork_\w:ArtworkA/)
        t.match(result, /tag:Tag/)
        t.doesNotMatch(result, /Artwork[B|C|D]/)
        t.end()
    })
    test('merge "Translation"', t => {
        t.match(result, /en\?:stringcn:string/)
        t.end()
    })
})
test('autoname interface in array', t => {
    const result = parseToTypes(JSON.stringify({
        brands: [
            { name: 'Apple', products: ['iPhone', 'Mac'] },
            { name: 'Microsoft', products: ['TypeScript'] },
        ]
    }))
    t.match(result, /Array<Brand>/)
    t.end()
})
test('merge interface in array', t => {
    const result = parseToTypes(JSON.stringify({
        brands: [
            { name: 'Apple', products: ['iPhone', 'Mac'] },
            { name: 'Microsoft', products: ['TypeScript'] },
            { name: 'ByteDance', products: [] },
            { name: 'ByteDance', },
            { name: 'Blizzard', belongTo: 'Microsoft' }
        ]
    }))
    console.log(result)
    t.end()
})
test('id map', t => {
    const result = parseToTypes(JSON.stringify({
        authors: {
            1: { name: 'John' },
            2: { name: "Steve" }
        }
    }))
    t.match(result, /\[id:number\]:Author/)
    t.end()
})
test('sort field by alphabet', t => {
    const a = parseToTypes(JSON.stringify({
        b: 1, a: 2, c: 3, aa: 4
    }))
    t.equal(a, 'interface DefaultInterface{\na:number\naa:number\nb:number\nc:number\n}\n')
    t.end()
})
test('same structs which fields appear in different sort should merge in one struct', (t) => {
    const a = parseToTypes(JSON.stringify({
        aa: 1, b: 2, a: 3
    }))
    const b = parseToTypes(JSON.stringify({
        a: 1, b: 2, aa: 3
    }))
    t.equal(a, b)
    t.end()
})
