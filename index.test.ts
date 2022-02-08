import test from "tape";
import { parseToTypes } from './'
test("{} should return {}", (t) => {
    t.true(parseToTypes('{"a":{}}').replace(/\s/g, '').match('a:{}'))
    t.end()
});
test('[] should return Array<unknown>', (t) => {
    t.true(parseToTypes('{"a":[]}').replace(/\s/g, '').match('a:Array<unknown>'))
    t.end()
})
test('should return Array<number>', (t) => {
    t.true(parseToTypes('{"a":[1]}').replace(/\s/g, '').match('a:Array<number>'))
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
test('should merge interface with same name', (t) => {
    t.false(parseToTypes(JSON.stringify({
        artork_a: {
            tag: {
                name: 'a',
                id: 114514,
                translation: {
                    cn: "啊"
                }
            }
        },
        artork_b: {
            tag: {
                name: 'b',
                id: 1919,
            }
        }
    })))
    t.end()
})
