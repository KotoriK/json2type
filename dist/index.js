import { pascalCase as b } from "change-case";
import { diffLines as j } from "diff";
import v from "pluralize";
/**
 * json2type
 * @author KotoriK
 * @date 2021.6
 * @license MIT
 */
const p = v.singular;
class O {
  /**
   * 结构信息->名字
   */
  _cache = {};
  /**
   * 名字->结构信息
   */
  _cache_r = {};
  _unnameCount = 0;
  _printCache() {
    const e = Object.entries(this._cache_r);
    return e.length > 0 ? e.map(([n, t]) => `interface ${n}${t}`).join(`
`) : "";
  }
  /**
   * 
   * @param {Record<string,any>} obj 
   * @param {string} name
   */
  parseToTypes(e, n = "DefaultInterface") {
    if (typeof e != "object") throw TypeError('param "obj" must be an object, but got ' + typeof e);
    return `interface ${n}${this._parseObjectToTypes(e)}
${this._printCache()}`;
  }
  /**
   * @private
   * @param obj 
   * @returns {string}
   */
  _parseObjectToTypes(e) {
    return `{
` + Object.entries(e).sort(T).map(
      ([n, t]) => {
        const i = w(n);
        return `${i}:${this._typeof(t, i)}`;
      }
    ).join(`
`) + `
}`;
  }
  /**
   * 推断数组内部元素的类型
   * @private
   * @param {Array} arr 
   * @param {string} key 数组的字段名，用于命名内部元素
   * @returns {string}
   */
  _printArrayType(e, n) {
    const t = /* @__PURE__ */ new Set();
    let i;
    for (const s of e)
      t.add($(s));
    if (t.size == 1 && t.has("Record<string,any>")) {
      t.clear();
      for (const c of e)
        t.add(this._checkThenParseObject(c, n && p(n)));
      const s = Array.from(t);
      if (t.size == 1)
        i = s[0];
      else {
        const c = s.map((a) => this._cache_r[a]);
        let o = c[0], u = s[0];
        for (let a = 1; a < c.length; a++) {
          const l = c[a], f = A(o, l);
          if (f)
            o = f, u = u.concat(s[a]);
          else
            return i = s.join(" | "), `Array<${i}>`;
        }
        for (let a = 0; a < c.length; a++)
          this._cache[c[a]] = u, delete this._cache_r[s[a]];
        this._cache_r[u] = o, i = u;
      }
    } else e.length === 0 ? i = "unknown" : i = _(t, " | ");
    return `Array<${i}>`;
  }
  /**
   * @private
   * @param foo 
   * @param key 
   * @returns 
   */
  _checkThenParseObject(e, n) {
    if (e instanceof Array)
      return this._printArrayType(e, n);
    if (e != null) {
      if (n) {
        const s = this._tryParseIdMap(e, n);
        if (s) return s;
      }
      const t = this._parseObjectToTypes(
        e
        /* key */
      );
      if (t.match(/{\s*}/)) return t;
      const i = this._cache[t];
      if (i)
        return i;
      {
        let s = n ? b(n.match(/^["']\d/) ? "I" + n : n) : this._defaultName(), c;
        for (; c = this._cache_r[s]; ) {
          const o = S(c, t);
          if (o)
            return this._cache[o] = s, this._cache[c] = s, this._cache[t] = s, this._cache_r[s] = o, s;
          s = s.concat("_");
        }
        return this._cache_r[s] = t, this._cache[t] = s, s;
      }
    }
    return "null";
  }
  /**
   * try to parse Index Signatures Object
   * @seealso https://www.typescriptlang.org/docs/handbook/2/objects.html#index-signatures
   * @param foo 
   * @param key 
   * @returns 
   */
  _tryParseIdMap(e, n) {
    const t = Object.keys(e);
    if (t.length > 0 && t.every((i) => i.match(/^\d+$/))) {
      const i = p(n);
      return `{[id:number]:${_(
        new Set(
          Object.values(e).map((s) => this._typeof(s, i))
        ),
        "|"
      )}}`;
    }
  }
  /**
   * @private
   * @param foo 
   * @param {string | undefined} key
   * @returns {string}
   */
  _typeof(e, n) {
    let t = typeof e;
    switch (t) {
      case "object":
        return this._checkThenParseObject(e, n);
      /**按原样 */
      case "string":
      case "number":
      case "boolean":
        return t;
      default:
        throw t + " isn't support yet.";
    }
  }
  /**
   * @private
   * @returns {string}
   */
  _defaultName() {
    return "I" + this._unnameCount++;
  }
}
function $(r) {
  let e = typeof r;
  switch (e) {
    case "object":
      return r === null ? "undefined" : "Record<string,any>";
    /**按原样 */
    case "string":
    case "number":
    case "boolean":
      return e;
    default:
      throw e + " isn't support yet.";
  }
}
function w(r) {
  return r.match(/^\d/) ? `"${r}"` : r.match(/[\u0000-#%-/:-@[-^`{-\u007f]/) ? `"${r}"` : r;
}
const d = (r) => r.startsWith("{") && r.endsWith("}");
function S(r, e) {
  if (d(r) && d(e)) {
    const [n, t, i] = y(r, e);
    return g(n, t, i);
  }
}
const A = (r, e) => g(...y(r, e));
function y(r, e) {
  const n = j(r.replaceAll(/^{|}/mg, ""), e.replaceAll(/^{|}/mg, "")), t = [], i = [], s = [];
  for (const c of n)
    c.added ? i.push(...h(c.value)) : c.removed ? s.push(...h(c.value)) : t.push(...h(c.value));
  return [t, i, s];
}
function m(r) {
  switch (r) {
    case "string":
    case "boolean":
    case "number":
      return !0;
    default:
      return !1;
  }
}
function g(r, e, n) {
  const t = Object.fromEntries(n), i = [], s = [];
  for (const c of e) {
    const [o, u] = c;
    let a = o, l = t[a] || t[a = o + "?"];
    if (l) {
      if (l !== u) {
        if (m(l) && m(u))
          c[1] = l + "|" + u;
        else if (l === "null" || u === "null")
          c[0] += "?";
        else
          return;
        i.push(c), delete t[a];
      }
    } else
      s.push(c);
  }
  for (const c of Object.entries(t))
    s.push(c);
  return `{
` + Array.from(
    C(r, i, s.map(([c, o]) => [c.endsWith("?") ? c : c + "?", o]))
  ).sort(T).map(([c, o]) => `${c}:${o}`).join(`
`) + `
}`;
}
const h = (r) => r.split(`
`).filter((e) => e).map((e) => e.split(":"));
function T([r], [e]) {
  const n = Math.min(r.length, e.length);
  let t;
  for (let i = 0; i < n; i++)
    if (t = r.charCodeAt(i) - e.charCodeAt(i), t !== 0)
      return t;
  return r.length - e.length;
}
function _(r, e) {
  let n = "";
  for (const t of r)
    n += t + e;
  return n.slice(0, -e.length);
}
function* C(...r) {
  for (const e of r)
    for (const n of e)
      yield n;
}
function N(r, e = "DefaultInterface") {
  return new O().parseToTypes(JSON.parse(r), e);
}
export {
  O as Json2Type,
  N as parseToTypes
};
