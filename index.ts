/**
 * json2type
 * @author KotoriK
 * @date 2021.6
 * @license MIT
 */
import { pascalCase } from 'change-case'
import { diffLines } from 'diff'
interface InterfaceDefinition {
    name: string
}
export class Json2Type {
    /**
     * @private
     * @type {Map<string,InterfaceDefinition>}
     */
    private _cache: Map<string, InterfaceDefinition> = new Map()
    private _cache_r: Map<string, string> = new Map()
    /**
     * @private
     * @type {number}
     */
    private _unnameCount: number = 0
    private _printCache() {
        if (this._cache_r.size > 0) {
            const entries = Array.from(this._cache_r.entries())
            return entries.map(([name, key]) => {
                return `interface ${name}${key}`
            }).join('\n')
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
        return '{\n' + Object.entries(obj)
            .map(([key, value]) => {
                const safekey = wrapKey(key)
                return `${safekey}:${this._typeof(value, safekey)}`
            }
            ).join('\n') + '\n}'
    }
    /**
     * 推断数组内部元素的类型
     * @private
     * @param {Array} arr 
     * @returns {string}
     */
    private _printArrayType(arr: any[]): string {
        const typesSet = new Set<string>()
        for (const value of arr) {
            typesSet.add(_typeOf_NoRecurse(value))
        }
        let T
        for (const value of arr) {
            typesSet.add(_typeOf_NoRecurse(value))
        }
        if (typesSet.size == 1 && typesSet.has('Object')) {
            typesSet.clear()
            for (const item of arr) {
                typesSet.add(this._checkThenParseObject(item))
            }
            const types = Array.from(typesSet)
            if (typesSet.size == 1) T = types.join(' | ')
            else {
                const structs = types.map(name => this._cache_r.get(name)) as string[] //值来自于前边返回，肯定在map中有登记
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
                    this._cache.set(structs[i], { name: majorStructName })
                    this._cache_r.delete(types[i])
                }
                this._cache_r.set(majorStructName, majorStruct)
                T = majorStructName
            }
        } else if (arr.length === 0) {
            T = 'unknown'//空数组无法推断类型
        } else {
            T = Array.from(typesSet).join(' | ')
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
            return this._printArrayType(foo)
        } else if (foo != null) {
            if (key) {
                const trial = this._tryParseIdMap(foo, key)
                if (trial) return trial
            }
            const struct = this._parseObjectToTypes(foo, /* key */)
            if (struct.match(/{\s*}/)) return struct
            const d = this._cache.get(struct)
            if (d) {
                return d.name
            } else {
                let name = key ? pascalCase(key.match(/^["']\d/) ? ("I" + key) : key) : this._defaultName()
                let structWithSameName: string | undefined
                while (structWithSameName = this._cache_r.get(name)/*赋值表达式会返回赋予的值 */) {
                    //是否可以合并
                    const trialMerge = tryMergeStruct(structWithSameName, struct)
                    if (trialMerge) {
                        //填入新的记录
                        this._cache.set(trialMerge, { name })
                        //将两个结构重定向到新的结构
                        this._cache.set(structWithSameName, { name })
                        this._cache.set(struct, { name })
                        this._cache_r.set(name, trialMerge)
                        break//可以脱出循环了
                    } else {
                        //更名
                        name = name.concat('_')
                    }
                }
                this._cache_r.set(name, struct)
                this._cache.set(struct, { name })
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
    private _tryParseIdMap(foo: Object, key: string) {
        const parentKey = key
        const keys = Array.from(Object.keys(foo))
        if (keys.length > 0 && keys.every((item) => item.match(/^\d+$/))) {
            return `{[id:number]:${Array.from(
                new Set(
                    Object.values(foo)
                        .map(value => this._typeof(value, parentKey))
                )
            )
                .join('|')}}`
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
            case "undefined":
            case 'boolean':
            case 'number':
            case "string":
                return valueType
            case "symbol":
            case 'bigint':
            case 'function':
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
            return 'Object'
        /**按原样 */
        case "undefined":
        case 'boolean':
        case 'number':
        case "string":
            return valueType
        case "symbol":
        case 'bigint':
        case 'function':
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
    const unchageFields = [], addedFields = [], removedFields = []
    for (const change of changes) {
        if (change.added) addedFields.push(...parseBackToKeyValue(change.value))
        else if (change.removed) removedFields.push(...parseBackToKeyValue(change.value))
        else unchageFields.push(...parseBackToKeyValue(change.value))
    }
    return [unchageFields, addedFields, removedFields] as const
}
function doMergeStruct(unchageFields: string[][], addedFields: string[][], removedFields: string[][]) {
    //检查类型是否相同
    const mapRemoved = Object.fromEntries(removedFields)
    for (const [key] of addedFields) {
        const typeRemoved = mapRemoved[key]
        if (typeRemoved/*  && typeRemoved != type */) {
            return undefined
        }
    }
    //removed和added的字段全部标记可选

    return "{\n" + [
        ...[...addedFields, ...removedFields].map(([key, type]) => `${key}?:${type}`),
        ...unchageFields.map(([key, type]) => `${key}:${type}`)
    ]
        .join('\n') + "\n}"
}

const parseBackToKeyValue = (str: string) => str.split('\n').filter(str => str != '').map(str => str.split(':'))

/**
 * 
 * @param {string} json
 * @param {string} name name of the generating interface 
 */
export function parseToTypes(json: string, name: string = 'DefaultInterface') {
    return new Json2Type().parseToTypes(JSON.parse(json), name)
}
