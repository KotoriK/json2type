import { describe, expect, it, test } from 'vitest'
import { parseToTypes } from './index.js'

test('{} should return {}', () => {
    expect(parseToTypes('{"a":{}}').replace(/\s|;/g, '')).toMatch(/a:{}/)
})

test('[] should return Array<unknown>', () => {
    expect(parseToTypes('{"a":[]}').replace(/\s|;/g, '')).toMatch(/a:Array<unknown>/)
})

test('should return Array<number>', () => {
    expect(parseToTypes('{"a":[1]}').replace(/\s|;/g, '')).toMatch(/a:Array<number>/)
})

test('should return Array<undefined>', () => {
    expect(parseToTypes('{"a":[null]}').replace(/\s|;/g, '')).toMatch(/a:Array<undefined>/)
})

describe('merge interface', () => {
    const result = parseToTypes(JSON.stringify({
        artwork_a: {
            tag: {
                name: 'a',
                id: 114514,
                translation: {
                    cn: '啊',
                },
            },
        },
        artwork_b: {
            tag: {
                name: 'b',
                id: 1919,
            },
        },
        artwork_c: {
            tag: {
                name: 'c',
                id: 810,
            },
        },
        artwork_d: {
            tag: {
                name: 'd',
                id: 1,
                translation: {
                    cn: '哦',
                    en: 'ohh',
                },
            },
        },
    })).replace(/\s|;/g, '')

    test('reuse interface', () => {
        expect(result).toMatch(/artwork_\w:ArtworkA/)
        expect(result).toMatch(/tag:Tag/)
        expect(result).not.toMatch(/Artwork[B|C|D]/)
    })

    test('merge "Translation"', () => {
        expect(result).toMatch(/cn:stringen\?:string/)
    })
})

describe('try to merge struct that same field has different type', () => {
    const result = parseToTypes(JSON.stringify({
        itemList: [
            {
                a: 1,
            },
            {
                a: '1',
            },
        ],
    })).replace(/\s|;/g, '')

    test('should merge to one struct', () => {
        expect(result).toMatch(/interfaceItemList{/)
        expect(result).toMatch(/a:number\|string/)
    })
})

describe('optional fields can be merge later', () => {
    const result = parseToTypes(JSON.stringify({
        itemList: [
            {
                translation: {
                    cn: '中文',
                },
            },
            {
                translation: {
                    en: 'English',
                },
            },
            {
                translation: {
                    en: '中文',
                },
            },
        ],
    }))

    it('should merge to one struct', () => {
        expect(result).toMatch(/interface ItemList \{/)
        expect(result.replace(/\s|;/g, '')).toMatch(/{cn\?:stringen\?:string}/)
    })
})

test('autoname interface in array', () => {
    const result = parseToTypes(JSON.stringify({
        brands: [
            { name: 'Apple', products: ['iPhone', 'Mac'] },
            { name: 'Microsoft', products: ['TypeScript'] },
        ],
    }))

    expect(result).toMatch(/Array<Brand>/)
})

test('merge interface in array', () => {
    const result = parseToTypes(JSON.stringify({
        brands: [
            { name: 'Apple', products: ['iPhone', 'Mac'] },
            { name: 'Microsoft', products: ['TypeScript'] },
            { name: 'ByteDance', products: [] },
            { name: 'ByteDance' },
            { name: 'Blizzard', belongTo: 'Microsoft' },
        ],
    }))

    expect(result).toContain('interface')
})

describe('id map', () => {
    test('basic', () => {
        const result = parseToTypes(JSON.stringify({
            authors: {
                1: { name: 'John' },
                2: { name: 'Steve' },
            },
        }))

        expect(result.replace(/\s|;/g, '')).toMatch(/\[id:number\]:Author/)
    })

    test('id map can be merged', () => {
        const result = parseToTypes(JSON.stringify({
            list: [
                {
                    authors: {
                        1: { name: 'John' },
                        2: { name: 'Steve' },
                    },
                },
                {
                    authors: {
                        3: { name: 'John' },
                        4: { name: 'Steve' },
                    },
                },
            ],
        }))

        expect(result.replace(/\s|;/g, '')).toMatch(/\[id:number\]:Author(?:\|undefined)?/)
    })
})

test('sort field by alphabet', () => {
    const result = parseToTypes(JSON.stringify({
        b: 1,
        a: 2,
        c: 3,
        aa: 4,
    }))

    expect(result.replace(/\s|;/g, '')).toContain('interfaceDefaultInterface{a:numberaa:numberb:numberc:number}')
})

test('same structs which fields appear in different sort should merge in one struct', () => {
    const a = parseToTypes(JSON.stringify({
        aa: 1,
        b: 2,
        a: 3,
    })).replace(/\s|;/g, '')
    const b = parseToTypes(JSON.stringify({
        a: 1,
        b: 2,
        aa: 3,
    })).replace(/\s|;/g, '')

    expect(a).toEqual(b)
})
