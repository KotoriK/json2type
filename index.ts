/**
 * json2type
 * @author KotoriK
 * @date 2021.6
 * @license MIT
 */
import { pascalCase } from 'change-case'
import { diffLines } from 'diff'
import { singular } from 'pluralize'
type KeyValuePair<TValue> = [string, TValue]
export class Json2Type {
    /**
     * 结构信息->名字
     */
    private _cache: Record<string, string> = {}
    /**
     * 名字->结构信息
     */
    private _cache_r: Record<string, string> = {}

    private _unnameCount: number = 0
    private _printCache() {
        const cacheReverseEntries = Object.entries(this._cache_r)
        if (cacheReverseEntries.length > 0) {
            return cacheReverseEntries
                .map(([name, key]) => `interface ${name}${key}`)
                .join('\n')
        } else {
            return ''
        }
    }
    /**
     * 
     * @param {Record<string,any>} obj 
     * @param {string} name
     */
    parseToTypes(obj: Record<string, any>, name: string = 'DefaultInterface') {
        if (typeof obj !== 'object') throw TypeError('param "obj" must be an object, but got ' + typeof obj)
        return `interface ${name}${this._parseObjectToTypes(obj)}\n${this._printCache()}`
    }
    /**
     * @private
     * @param obj 
     * @returns {string}
     */
    private _parseObjectToTypes(obj: Object): string {
        return '{\n'
            + Object.entries(obj)
                .sort(_sortKeys)
                .map(
                    ([key, value]) => {
                        const safekey = wrapKey(key)
                        return `${safekey}:${this._typeof(value, safekey)}`
                    }
                ).join('\n') + '\n}'
    }
    /**
     * 推断数组内部元素的类型
     * @private
     * @param {Array} arr 
     * @param {string} key 数组的字段名，用于命名内部元素
     * @returns {string}
     */
    private _printArrayType(arr: any[], key?: string): string {
        const typesSet = new Set<string>()
        let T
        for (const value of arr) {
            typesSet.add(_typeOf_NoRecurse(value))
        }
        if (typesSet.size == 1 && typesSet.has('Record<string,any>')) {
            //全是对象
            typesSet.clear()
            for (const item of arr) {
                typesSet.add(this._checkThenParseObject(item, key && singular(key)))
            }
            const types = Array.from(typesSet)
            if (typesSet.size == 1) {
                T = types[0]
            } else {
                const structs = types.map(name => this._cache_r[name]) as string[] //值来自于前边返回，肯定在map中有登记
                let majorStruct = structs[0]
                let majorStructName = types[0]
                for (let i = 1; i < structs.length; i++) {
                    const trialStruct = structs[i]
                    const result = mergeStruct(majorStruct, trialStruct)
                    if (result) {
                        majorStruct = result
                        majorStructName = majorStructName.concat(types[i])
                    } else {
                        T = types.join(' | ')//如果类型不一样直接放弃合并
                        return `Array<${T}>`
                    }
                }
                for (let i = 0; i < structs.length; i++) {
                    this._cache[structs[i]] = majorStructName
                    delete this._cache_r[types[i]]
                }
                this._cache_r[majorStructName] = majorStruct
                T = majorStructName
            }
        } else if (arr.length === 0) {
            T = 'unknown'//空数组无法推断类型
        } else {
            T = _iteratorJoin(typesSet, ' | ')
        }
        return `Array<${T}>`
    }
    /**
     * @private
     * @param foo 
     * @param key 
     * @returns 
     */
    private _checkThenParseObject(foo: Object, key?: string) {
        if (foo instanceof Array) {
            return this._printArrayType(foo, key)
        } else if (foo != null) {
            if (key) {
                const trial = this._tryParseIdMap(foo, key)
                if (trial) return trial
            }
            const struct = this._parseObjectToTypes(foo, /* key */)
            if (struct.match(/{\s*}/)) return struct
            const define = this._cache[struct]
            if (define) {
                return define
            } else {
                let name = key ? pascalCase(key.match(/^["']\d/) ? ("I" + key) : key) : this._defaultName()
                let structWithSameName: string | undefined
                while (structWithSameName = this._cache_r[name]/*赋值表达式会返回赋予的值 */) {
                    //是否可以合并
                    const mergeTrial = tryMergeStruct(structWithSameName, struct)
                    if (mergeTrial) {
                        //填入新的记录
                        this._cache[mergeTrial] = name
                        //将两个结构重定向到新的结构
                        this._cache[structWithSameName] = name
                        this._cache[struct] = name
                        this._cache_r[name] = mergeTrial
                        return name//可以脱出循环了
                    } else {
                        //更名
                        name = name.concat('_')
                    }
                }
                this._cache_r[name] = struct
                this._cache[struct] = name
                return name
            }
        }
        return 'null'
    }
    /**
     * try to parse Index Signatures Object
     * @seealso https://www.typescriptlang.org/docs/handbook/2/objects.html#index-signatures
     * @param foo 
     * @param key 
     * @returns 
     */
    private _tryParseIdMap(foo: Object, parentKey: string) {
        const keys = Object.keys(foo)
        if (keys.length > 0 && keys.every((item) => item.match(/^\d+$/))) {
            const parentKey_singlar = singular(parentKey)
            return `{[id:number]:${_iteratorJoin(
                new Set(
                    Object.values(foo)
                        .map(value => this._typeof(value, parentKey_singlar))
                )
                , '|')
                }}`
        }
    }
    /**
     * @private
     * @param foo 
     * @param {string | undefined} key
     * @returns {string}
     */
    private _typeof(foo: any, key: string): string {
        let valueType = typeof foo
        switch (valueType) {
            case 'object':
                return this._checkThenParseObject(foo, key)
            /**按原样 */
            case "string":
            case 'number':
            case 'boolean':
                return valueType
            default:
                throw valueType + " isn't support yet."
        }
    }
    /**
     * @private
     * @returns {string}
     */
    private _defaultName(): string {
        return 'I' + this._unnameCount++
    }
}
/**
 * @param foo 
 * @returns {string}
 */
function _typeOf_NoRecurse(foo: any): string {
    let valueType = typeof foo
    switch (valueType) {
        case 'object':
            if (foo === null) {
                return 'undefined'
            }
            return 'Record<string,any>'
        /**按原样 */
        case "string":
        case 'number':
        case 'boolean':
            return valueType
        default:
            throw valueType + " isn't support yet."
    }
}
/**
 * 将key包裹成符合JavaScript标识符要求的格式
 * @param {string} key 
 */
function wrapKey(key: string) {
    //数字打头的Key
    if (key.match(/^\d/)) {
        return `"${key}"`
    } else if (key.match(/[\u0000-#%-/:-@[-^`{-\u007f]/)) {//ASCII中没有ID_Start和ID_Continue也不是'$','_'的字符
        return `"${key}"`
    } else {
        //非ASCII的用例太罕见，不做处理
        return key
    }
}
/**
 * 检查一个类型描述是不是描述一个详细的对象（即不object）
 * @param type 
 */
const isTypeOfObject = (type: string) => type.startsWith('{') && type.endsWith('}')

function tryMergeStruct(typeA: string, typeB: string) {
    if (isTypeOfObject(typeA) && isTypeOfObject(typeB)) {
        const [unchageFields, addedFields, removedFields] = diffStructs(typeA, typeB)
        if (unchageFields.length >= (addedFields.length + removedFields.length)) {
            return doMergeStruct(unchageFields, addedFields, removedFields)
        }
    }
}
const mergeStruct = (typeA: string, typeB: string) => doMergeStruct(...diffStructs(typeA, typeB))

function diffStructs(typeA: string, typeB: string) {
    const changes = diffLines(typeA.replaceAll(/^{|}/mg, ''), typeB.replaceAll(/^{|}/mg, ''))
    const unchageFields: KeyValuePair<string>[] = []
    const addedFields: KeyValuePair<string>[] = []
    const removedFields: KeyValuePair<string>[] = []
    for (const change of changes) {
        if (change.added) addedFields.push(...parseBackToKeyValue(change.value))
        else if (change.removed) removedFields.push(...parseBackToKeyValue(change.value))
        else unchageFields.push(...parseBackToKeyValue(change.value))
    }
    return [unchageFields, addedFields, removedFields] as const
}
function doMergeStruct(unchageFields: KeyValuePair<string>[], addedFields: KeyValuePair<string>[], removedFields: KeyValuePair<string>[]) {
    //检查类型是否相同
    const mapRemoved = Object.fromEntries(removedFields)
    for (const [key, type] of addedFields) {
        const typeRemoved = mapRemoved[key]
        if (typeRemoved && typeRemoved != type) {
            return undefined
        }
    }

    const optionalFields = [...addedFields, ...removedFields]
    for (const arr of optionalFields) {
        arr[0] += "?" //removed和added的字段全部标记可选
    }

    return "{\n" + Array.from(_concat(unchageFields, optionalFields))
        .sort(_sortKeys)
        .map(([key, type]) => `${key}:${type}`)
        .join('\n')
        + "\n}"
}

const parseBackToKeyValue = (str: string) => str.split('\n').filter(str => str != '').map(str => str.split(':')) as unknown as KeyValuePair<string>[]

function _sortKeys<TValue>([key_a]: KeyValuePair<TValue>, [key_b]: KeyValuePair<TValue>) {
    const safeLen = Math.min(key_a.length, key_b.length)
    let diff
    for (let i = 0; i < safeLen; i++) {
        diff = key_a.charCodeAt(i) - key_b.charCodeAt(i)
        if (diff !== 0) {
            return diff
        }
    }
    return key_a.length - key_b.length
}

function _iteratorJoin(iterable: Iterable<string>, separator: string) {
    let result = ''
    for (const item of iterable) {
        result += item + separator
    }
    return result.slice(0, -separator.length)
}
function* _concat<T>(...iterables: Iterable<T>[]) {
    for (const iterable of iterables) {
        for (const item of iterable) {
            yield item
        }
    }
}
/**
 * 
 * @param {string} json
 * @param {string} name name of the generating interface 
 */
export function parseToTypes(json: string, name: string = 'DefaultInterface') {
    return new Json2Type().parseToTypes(JSON.parse(json), name)
}
