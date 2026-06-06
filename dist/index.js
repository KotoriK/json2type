import { pascalCase as b } from "change-case";
import { diffLines as O } from "diff";
import j from "pluralize";
import i from "typescript";
/**
 * json2type
 * @author KotoriK
 * @date 2021.6
 * @license MIT
 */
const m = j.singular;
class w {
  /**
   * 结构信息->名字
   */
  _cache = {};
  /**
   * 名字->结构信息
   */
  _cache_r = {};
  _unnameCount = 0;
  /**
   * 
   * @param {Record<string,any>} obj 
   * @param {string} name
   */
  parseToTypes(e, n = "DefaultInterface") {
    if (typeof e != "object") throw TypeError('param "obj" must be an object, but got ' + typeof e);
    const r = this._parseObjectToTypes(e), a = [[n, r], ...Object.entries(this._cache_r)];
    return K(a);
  }
  /**
   * @private
   * @param obj 
   * @returns {string}
   */
  _parseObjectToTypes(e) {
    return `{
` + Object.entries(e).sort(v).map(
      ([n, r]) => {
        const a = F(n);
        return `${a}:${this._typeof(r, a)}`;
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
    const r = /* @__PURE__ */ new Set();
    let a;
    for (const s of e)
      r.add(x(s));
    if (r.size == 1 && r.has("Record<string,any>")) {
      r.clear();
      for (const c of e)
        r.add(this._checkThenParseObject(c, n && m(n)));
      const s = Array.from(r);
      if (r.size == 1)
        a = s[0];
      else {
        const c = s.map((o) => this._cache_r[o]);
        let u = c[0], l = s[0];
        for (let o = 1; o < c.length; o++) {
          const f = c[o], p = $(u, f);
          if (p)
            u = p, l = l.concat(s[o]);
          else
            return a = s.join(" | "), `Array<${a}>`;
        }
        for (let o = 0; o < c.length; o++)
          this._cache[c[o]] = l, delete this._cache_r[s[o]];
        this._cache_r[l] = u, a = l;
      }
    } else e.length === 0 ? a = "unknown" : a = _(r, " | ");
    return `Array<${a}>`;
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
      const r = this._parseObjectToTypes(
        e
        /* key */
      );
      if (r.match(/{\s*}/)) return r;
      const a = this._cache[r];
      if (a)
        return a;
      {
        let s = n ? b(n.match(/^["']\d/) ? "I" + n : n) : this._defaultName(), c;
        for (; c = this._cache_r[s]; ) {
          const u = I(c, r);
          if (u)
            return this._cache[u] = s, this._cache[c] = s, this._cache[r] = s, this._cache_r[s] = u, s;
          s = s.concat("_");
        }
        return this._cache_r[s] = r, this._cache[r] = s, s;
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
    const r = Object.keys(e);
    if (r.length > 0 && r.every((a) => a.match(/^\d+$/))) {
      const a = m(n);
      return `{[id:number]:${_(
        new Set(
          Object.values(e).map((s) => this._typeof(s, a))
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
    let r = typeof e;
    switch (r) {
      case "object":
        return this._checkThenParseObject(e, n);
      /**按原样 */
      case "string":
      case "number":
      case "boolean":
        return r;
      default:
        throw r + " isn't support yet.";
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
function x(t) {
  let e = typeof t;
  switch (e) {
    case "object":
      return t === null ? "undefined" : "Record<string,any>";
    /**按原样 */
    case "string":
    case "number":
    case "boolean":
      return e;
    default:
      throw e + " isn't support yet.";
  }
}
function F(t) {
  return t.match(/^\d/) ? `"${t}"` : t.match(/[\u0000-#%-/:-@[-^`{-\u007f]/) ? `"${t}"` : t;
}
const y = (t) => t.startsWith("{") && t.endsWith("}");
function I(t, e) {
  if (y(t) && y(e)) {
    const [n, r, a] = S(t, e);
    return T(n, r, a);
  }
}
const $ = (t, e) => T(...S(t, e));
function S(t, e) {
  const n = O(t.replaceAll(/^{|}/mg, ""), e.replaceAll(/^{|}/mg, "")), r = [], a = [], s = [];
  for (const c of n)
    c.added ? a.push(...h(c.value)) : c.removed ? s.push(...h(c.value)) : r.push(...h(c.value));
  return [r, a, s];
}
function g(t) {
  switch (t) {
    case "string":
    case "boolean":
    case "number":
      return !0;
    default:
      return !1;
  }
}
function T(t, e, n) {
  const r = Object.fromEntries(n), a = [], s = [];
  for (const c of e) {
    const [u, l] = c;
    let o = u, f = r[o] || r[o = u + "?"];
    if (f) {
      if (f !== l) {
        if (g(f) && g(l))
          c[1] = f + "|" + l;
        else if (f === "null" || l === "null")
          c[0] += "?";
        else
          return;
        a.push(c), delete r[o];
      }
    } else
      s.push(c);
  }
  for (const c of Object.entries(r))
    s.push(c);
  return `{
` + Array.from(
    N(t, a, s.map(([c, u]) => [c.endsWith("?") ? c : c + "?", u]))
  ).sort(v).map(([c, u]) => `${c}:${u}`).join(`
`) + `
}`;
}
const h = (t) => t.split(`
`).filter((e) => e).map((e) => e.split(":"));
function v([t], [e]) {
  const n = Math.min(t.length, e.length);
  let r;
  for (let a = 0; a < n; a++)
    if (r = t.charCodeAt(a) - e.charCodeAt(a), r !== 0)
      return r;
  return t.length - e.length;
}
function _(t, e) {
  let n = "";
  for (const r of t)
    n += r + e;
  return n.slice(0, -e.length);
}
function* N(...t) {
  for (const e of t)
    for (const n of e)
      yield n;
}
function K(t) {
  const e = t.map(([a, s]) => i.factory.createInterfaceDeclaration(
    void 0,
    a,
    void 0,
    void 0,
    A(s)
  )), n = i.factory.createSourceFile(
    e,
    i.factory.createToken(i.SyntaxKind.EndOfFileToken),
    i.NodeFlags.None
  );
  return i.createPrinter({ newLine: i.NewLineKind.LineFeed }).printFile(n);
}
function A(t) {
  return t.replaceAll(/^{|}/mg, "").split(`
`).map((e) => e.trim()).filter(Boolean).map((e) => {
    const [n, r] = P(e), a = n.match(/^\[(\w+):(number|string)\](\?)?$/);
    if (a) {
      const [, l, o, f] = a, p = f ? i.factory.createUnionTypeNode([d(r), i.factory.createKeywordTypeNode(i.SyntaxKind.UndefinedKeyword)]) : d(r);
      return i.factory.createIndexSignature(
        void 0,
        [i.factory.createParameterDeclaration(void 0, void 0, void 0, l, void 0, d(o), void 0)],
        p
      );
    }
    const s = n.endsWith("?"), c = s ? n.slice(0, -1) : n, u = c.match(/^".*"$/) ? i.factory.createStringLiteral(c.slice(1, -1)) : i.factory.createIdentifier(c);
    return i.factory.createPropertySignature(
      void 0,
      u,
      s ? i.factory.createToken(i.SyntaxKind.QuestionToken) : void 0,
      d(r)
    );
  });
}
function P(t) {
  const r = t.indexOf("]?:");
  if (r > -1)
    return [t.slice(0, r + 2), t.slice(r + 3)];
  const a = t.indexOf("]:");
  if (a > -1)
    return [t.slice(0, a + 1), t.slice(a + 2)];
  const s = t.indexOf(":");
  if (s < 0)
    throw new TypeError(`Invalid struct line: ${t}`);
  return [t.slice(0, s), t.slice(s + 1)];
}
function d(t) {
  const n = i.createSourceFile(
    "type.ts",
    `type __T = ${t};`,
    i.ScriptTarget.Latest,
    !0,
    i.ScriptKind.TS
  ).statements[0];
  if (i.isTypeAliasDeclaration(n))
    return n.type;
  throw new TypeError(`Invalid type node: ${t}`);
}
function E(t, e = "DefaultInterface") {
  return new w().parseToTypes(JSON.parse(t), e);
}
export {
  w as Json2Type,
  E as parseToTypes
};
