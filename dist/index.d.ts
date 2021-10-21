export declare class Json2Type {
    /**
     * @private
     * @type {Map<string,InterfaceDefinition>}
     */
    private _cache;
    private _cache_r;
    /**
     * @private
     * @type {number}
     */
    private _unnameCount;
    private _printCache;
    /**
     *
     * @param {Record<string,any>} obj
     * @param {string} name
     */
    parseToTypes(obj: Record<string, any>, name?: string): string;
    /**
     * @private
     * @param obj
     * @returns {string}
     */
    private _parseObjectToTypes;
    /**
     * 推断数组内部元素的类型
     * @private
     * @param {Array} arr
     * @returns {string}
     */
    private _printArrayType;
    /**
     * @private
     * @param foo
     * @param key
     * @returns
     */
    private _checkThenParseObject;
    /**
     * try to parse Index Signatures Object
     * @seealso https://www.typescriptlang.org/docs/handbook/2/objects.html#index-signatures
     * @param foo
     * @param key
     * @returns
     */
    private _tryParseIdMap;
    /**
     * @private
     * @param foo
     * @param {string | undefined} key
     * @returns {string}
     */
    private _typeof;
    /**
     * @private
     * @returns {string}
     */
    private _defaultName;
}
/**
 *
 * @param {string} json
 * @param {string} name name of the generating interface
 */
export declare function parseToTypes(json: string, name?: string): string;
