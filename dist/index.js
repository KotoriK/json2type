var e=require("change-case"),r=require("diff");function t(e,r){(null==r||r>e.length)&&(r=e.length);for(var t=0,n=new Array(r);t<r;t++)n[t]=e[t];return n}function n(e,r){var n="undefined"!=typeof Symbol&&e[Symbol.iterator]||e["@@iterator"];if(n)return(n=n.call(e)).next.bind(n);if(Array.isArray(e)||(n=function(e,r){if(e){if("string"==typeof e)return t(e,r);var n=Object.prototype.toString.call(e).slice(8,-1);return"Object"===n&&e.constructor&&(n=e.constructor.name),"Map"===n||"Set"===n?Array.from(e):"Arguments"===n||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)?t(e,r):void 0}}(e))||r&&e&&"number"==typeof e.length){n&&(e=n);var a=0;return function(){return a>=e.length?{done:!0}:{done:!1,value:e[a++]}}}throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}var a=/*#__PURE__*/function(){function r(){this._cache=new Map,this._cache_r=new Map,this._unnameCount=0}var t=r.prototype;return t._printCache=function(){return this._cache_r.size>0?Array.from(this._cache_r.entries()).map(function(e){return"interface "+e[0]+e[1]}).join("\n"):""},t.parseToTypes=function(e,r){if(void 0===r&&(r="DefaultInterface"),"object"!=typeof e)throw TypeError('param "obj" must be an object, but got '+typeof e);return"interface "+r+this._parseObjectToTypes(e)+"\n"+this._printCache()},t._parseObjectToTypes=function(e){var r=this;return"{\n"+Object.entries(e).map(function(e){var t,n=e[1],a=(t=e[0]).match(/^\d/)||t.match(/[\u0000-#%-/:-@[-^`{-\u007f]/)?'"'+t+'"':t;return a+":"+r._typeof(n,a)}).join("\n")+"\n}"},t._printArrayType=function(e){for(var r,t,a=this,c=new Set,o=n(e);!(r=o()).done;)c.add(i(r.value));for(var s,f=n(e);!(s=f()).done;)c.add(i(s.value));if(1==c.size&&c.has("Object")){c.clear();for(var h,p=n(e);!(h=p()).done;)c.add(this._checkThenParseObject(h.value));var l=Array.from(c);if(1==c.size)t=l.join(" | ");else{for(var y=l.map(function(e){return a._cache_r.get(e)}),v=y[0],m=l[0],d=1;d<y.length;d++){var _=u(v,y[d]);if(!_)return"Array<"+(t=l.join(" | "))+">";v=_,m=m.concat(l[d])}for(var b=0;b<y.length;b++)this._cache.set(y[b],{name:m}),this._cache_r.delete(l[b]);this._cache_r.set(m,v),t=m}}else t=0===e.length?"unknown":Array.from(c).join(" | ");return"Array<"+t+">"},t._checkThenParseObject=function(r,t){if(r instanceof Array)return this._printArrayType(r);if(null!=r){if(t){var n=this._tryParseIdMap(r,t);if(n)return n}var a=this._parseObjectToTypes(r);if(a.match(/{\s*}/))return a;var i=this._cache.get(a);if(i)return i.name;for(var c,u=t?e.pascalCase(t.match(/^["']\d/)?"I"+t:t):this._defaultName();c=this._cache_r.get(u);){var s=o(c,a);if(s){this._cache.set(s,{name:u}),this._cache.set(c,{name:u}),this._cache.set(a,{name:u}),this._cache_r.set(u,s);break}u=u.concat("_")}return this._cache_r.set(u,a),this._cache.set(a,{name:u}),u}return"null"},t._tryParseIdMap=function(e,r){var t=this,n=r,a=Array.from(Object.keys(e));if(a.length>0&&a.every(function(e){return e.match(/^\d+$/)}))return"{[id:number]:"+Array.from(new Set(Object.values(e).map(function(e){return t._typeof(e,n)}))).join("|")+"}"},t._typeof=function(e,r){var t=typeof e;switch(t){case"object":return this._checkThenParseObject(e,r);case"undefined":case"boolean":case"number":case"string":return t;default:throw t+" isn't support yet."}},t._defaultName=function(){return"I"+this._unnameCount++},r}();function i(e){var r=typeof e;switch(r){case"object":return"Object";case"undefined":case"boolean":case"number":case"string":return r;default:throw r+" isn't support yet."}}var c=function(e){return e.startsWith("{")&&e.endsWith("}")};function o(e,r){if(c(e)&&c(r)){var t=s(e,r),n=t[0],a=t[1],i=t[2];if(n.length>=a.length+i.length)return f(n,a,i)}}var u=function(e,r){return f.apply(void 0,s(e,r))};function s(e,t){for(var a,i=[],c=[],o=[],u=n(r.diffLines(e.replaceAll(/^{|}/gm,""),t.replaceAll(/^{|}/gm,"")));!(a=u()).done;){var s=a.value;s.added?c.push.apply(c,h(s.value)):s.removed?o.push.apply(o,h(s.value)):i.push.apply(i,h(s.value))}return[i,c,o]}function f(e,r,t){for(var a,i=Object.fromEntries(t),c=n(r);!(a=c()).done;)if(i[a.value[0]])return;return"{\n"+[].concat([].concat(r,t).map(function(e){return e[0]+"?:"+e[1]}),e.map(function(e){return e[0]+":"+e[1]})).join("\n")+"\n}"}var h=function(e){return e.split("\n").filter(function(e){return""!=e}).map(function(e){return e.split(":")})};exports.Json2Type=a,exports.parseToTypes=function(e,r){return void 0===r&&(r="DefaultInterface"),(new a).parseToTypes(JSON.parse(e),r)};
//# sourceMappingURL=index.js.map
