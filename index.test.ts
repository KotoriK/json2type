import { test, describe, it } from 'node:test'
import { parseToTypes } from './index.js'
import assert from 'node:assert';

test("{} should return {}", () => {
    assert.match(parseToTypes('{"a":{}}').replace(/\s/g, ''), new RegExp('a:{}'))

});
test('[] should return Array<unknown>', () => {
    assert.match(parseToTypes('{"a":[]}').replace(/\s/g, ''), new RegExp('a:Array<unknown>'))

})
test('should return Array<number>', () => {
    assert.match(parseToTypes('{"a":[1]}').replace(/\s/g, ''), new RegExp('a:Array<number>'))

})
test('should return Array<undefined>', () => {
    assert.match(parseToTypes('{"a":[null]}').replace(/\s/g, ''), new RegExp('a:Array<undefined>'))

})
/* test('should return Array<number|string>', () => {
    assert.ok(parseToTypes('{"a":[1,"1"]}').replace(/\s/g, '').match(/a:Array<(?:number|string)\|(?:string|number)>/))
})
test('interface name starts with number should be wrapped', () => {
    assert.ok(!parseToTypes('{"114514":{"a":{}}}').replace(/\s/g, '').match('interface 114514'))

}) */
describe('merge interface', () => {
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

    test('reuse interface', () => {
        assert.match(result, /artwork_\w:ArtworkA/)
        assert.match(result, /tag:Tag/)
        assert.doesNotMatch(result, /Artwork[B|C|D]/)

    })
    test('merge "Translation"', t => {
        assert.match(result, /cn:stringen\?:string/)

    })
})
describe('try to merge struct that same field has different type', () => {
    const result = parseToTypes(JSON.stringify({
        itemList: [
            {
                a: 1
            },
            {
                a: '1'
            },
        ]
    }))
    test('should merge to one struct', t => {
        assert.match(result, /interface ItemList{/)
        assert.match(result, /a:number\|string/)
    })
})
describe('optional fields can be merge later', () => {
    const result = parseToTypes(JSON.stringify({
        itemList: [
            {
                translation: {
                    cn: '中文',
                }
            },
            {
                translation: {
                    en: 'English',
                }
            },
            {
                translation: {
                    en: '中文',
                }
            },
        ]
    }))
    it('should merge to one struct', t => {
        assert.match(result, /interface ItemList{/)
        assert.match(result, /{\ncn\?:string\nen\?:string\n}/)
    })
})
test('autoname interface in array', t => {
    const result = parseToTypes(JSON.stringify({
        brands: [
            { name: 'Apple', products: ['iPhone', 'Mac'] },
            { name: 'Microsoft', products: ['TypeScript'] },
        ]
    }))
    assert.match(result, /Array<Brand>/)

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

})
describe('id map', () => {
    test('basic', () => {
        const result = parseToTypes(JSON.stringify({
            authors: {
                1: { name: 'John' },
                2: { name: "Steve" }
            }
        }))
        assert.match(result, /\[id:number\]:Author/)
    })
    test('id map can be merged', () => {
        const result = parseToTypes(JSON.stringify({
            list: [
                {
                    authors: {
                        1: { name: 'John' },
                        2: { name: "Steve" }
                    }
                },
                {
                    authors: {
                        3: { name: 'John' },
                        4: { name: "Steve" }
                    }
                },
/*                 {
                    authors: {} // TODO
                } */
            ]
        }))
        assert.match(result, /\[id:number\]?:Author/)
    })
})

test('sort field by alphabet', t => {
    const a = parseToTypes(JSON.stringify({
        b: 1, a: 2, c: 3, aa: 4
    }))
    assert.equal(a, 'interface DefaultInterface{\na:number\naa:number\nb:number\nc:number\n}\n')

})
test('same structs which fields appear in different sort should merge in one struct', () => {
    const a = parseToTypes(JSON.stringify({
        aa: 1, b: 2, a: 3
    }))
    const b = parseToTypes(JSON.stringify({
        a: 1, b: 2, aa: 3
    }))
    assert.equal(a, b)

})
