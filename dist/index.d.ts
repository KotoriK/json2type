export declare class Json2Type {
    /**
     * @private
     * @type {Map<string,import(".").InterfaceDefinition>}
     */
    _interface_cache: Map<any, any>;
    /**
     * @private
     * @type {number}
     */
    _unname_interface_count: number;
    _printCache(): string;
    /**
     *
     * @param {Record<string,any>} obj
     * @param {string} name
     */
    parseToTypes(obj: any, name?: string): string;
    /**
     * @private
     * @param obj
     * @returns {string}
     */
    _parseObjectToTypes(obj: Object): string;
    /**
     * @private
     * @param {Array} arr
     * @returns {string}
     */
    _parseArray(arr: string | any[]): string;
    /**
     * @private
     * @param foo
     * @param key
     * @returns
     */
    _checkThenParseObject(foo: any, key?: string): any;
    /**
     * @private
     * @param foo
     * @param {string | undefined} key
     * @returns {string}
     */
    _typeof(foo: unknown, key: any): any;
    /**
     * @private
     * @returns {string}
     */
    _defaultName(): string;
}
/**
 *
 * @param {string} json
 * @param {string} name name of the generating interface
 */
export declare function parseToTypes(json: string, name?: string): string;
