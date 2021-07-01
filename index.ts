/**
 * json2type
 * @author KotoriK
 * @date 2021.6
 * @license MIT
 */
import { pascalCase } from 'change-case'
export class Json2Type {
    /**
     * @private
     * @type {Map<string,import(".").InterfaceDefinition>}
     */
    _interface_cache = new Map()
    /**
     * @private
     * @type {number}
     */
    _unname_interface_count = 0
    _printCache() {
        if (this._interface_cache.size > 0) {
            const entries = Array.from(this._interface_cache.entries())
            return entries.map(([key, { name }]) => {
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
    parseToTypes(obj: any, name = 'DefaultInterface') {
        if (typeof obj !== 'object') throw TypeError('param "obj" must be an object, but got ' + typeof obj)
        return `interface ${name}${this._parseObjectToTypes(obj)}${this._printCache()}`
    }
    /**
     * @private
     * @param obj 
     * @returns {string}
     */
    _parseObjectToTypes(obj: Object) {
        return '{\n' + Object.entries(obj)
            .map(([key, value]) => {
                const safekey = _safeKey(key)
                return `${safekey}:${this._typeof(value, safekey)}`
            }
            ).join('\n') + '\n}'
    }
    /**
     * @private
     * @param {Array} arr 
     * @returns {string}
     */
    _parseArray(arr: string | any[]) {
        let types = new Set()
        let T
        for (const value of arr) {
            types.add(_typeOf_NoRecurse(value))
        }
        if (types.size == 1 && types.has('Object')) {
            types.clear()
            for (const item of arr) {
                types.add(this._checkThenParseObject(item))
            }
            T = Array.from(types.values()).join(' | ')
        } else if (arr.length === 0) {
            T = 'undefined'//空数组无法推断类型
        } else {
            T = Array.from(types.values()).join(' | ')
        }
        return `Array<${T}>`
    }
    /**
     * @private
     * @param foo 
     * @param key 
     * @returns 
     */
    _checkThenParseObject(foo: any, key?: string) {
        if (foo instanceof Array) {
            return this._parseArray(foo)
        } else if (foo != null) {
            const struct = this._parseObjectToTypes(foo, /* key */)
            const d = this._interface_cache.get(struct)
            if (d) {
                return d.name
            } else {
                const name = key ? pascalCase(key.match(/^\d/) ? ("I" + key) : key) : this._defaultName()
                this._interface_cache.set(struct, { name })
                return name
            }
        }
        return 'null'
    }
    /**
     * @private
     * @param foo 
     * @param {string | undefined} key
     * @returns {string}
     */
    _typeof(foo: unknown, key: any) {
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
    _defaultName() {
        const r = 'I' + this._unname_interface_count
        this._unname_interface_count++
        return r
    }
}
/**
 * @param foo 
 * @returns {string}
 */
function _typeOf_NoRecurse(foo: any) {
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
 * 
 * @param {string} key 
 */
function _safeKey(key: string) {
    if (key.match(/^\d/) && key.match(/[A-Za-z]/)) {
        return `"${key}"`
    } else if (key.match('_')) {
        return `"${key}"`
    } else {
        return key
    }
}
/**
 * 
 * @param {string} json
 * @param {string} name name of the generating interface 
 */
export function parseToTypes(json: string, name = 'DefaultInterface') {
    return new Json2Type().parseToTypes(JSON.parse(json), name)
}