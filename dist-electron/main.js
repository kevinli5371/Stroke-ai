var Oy = Object.defineProperty;
var Eu = (t) => {
  throw TypeError(t);
};
var Iy = (t, e, r) => e in t ? Oy(t, e, { enumerable: !0, configurable: !0, writable: !0, value: r }) : t[e] = r;
var xn = (t, e, r) => Iy(t, typeof e != "symbol" ? e + "" : e, r), Ao = (t, e, r) => e.has(t) || Eu("Cannot " + r);
var se = (t, e, r) => (Ao(t, e, "read from private field"), r ? r.call(t) : e.get(t)), Ot = (t, e, r) => e.has(t) ? Eu("Cannot add the same private member more than once") : e instanceof WeakSet ? e.add(t) : e.set(t, r), nt = (t, e, r, n) => (Ao(t, e, "write to private field"), n ? n.call(t, r) : e.set(t, r), r), Vt = (t, e, r) => (Ao(t, e, "access private method"), r);
import Nf, { app as ht, BrowserWindow as Za, ipcMain as mr, globalShortcut as Co, nativeImage as Ny, Tray as Ty, Menu as ky, screen as Tf, clipboard as Un, shell as Ay } from "electron";
import { fileURLToPath as Cy } from "node:url";
import re from "node:path";
import jy from "node:http";
import eo from "node:os";
import we from "node:process";
import { promisify as xe, isDeepStrictEqual as Su } from "node:util";
import ae from "node:fs";
import Nr from "node:crypto";
import Pu from "node:assert";
import "node:events";
import "node:stream";
import My from "fs";
import Dy from "path";
import Ly from "os";
import Fy from "crypto";
import { exec as kf } from "node:child_process";
const Br = (t) => {
  const e = typeof t;
  return t !== null && (e === "object" || e === "function");
}, Af = /* @__PURE__ */ new Set([
  "__proto__",
  "prototype",
  "constructor"
]), Cf = 1e6, Vy = (t) => t >= "0" && t <= "9";
function jf(t) {
  if (t === "0")
    return !0;
  if (/^[1-9]\d*$/.test(t)) {
    const e = Number.parseInt(t, 10);
    return e <= Number.MAX_SAFE_INTEGER && e <= Cf;
  }
  return !1;
}
function jo(t, e) {
  return Af.has(t) ? !1 : (t && jf(t) ? e.push(Number.parseInt(t, 10)) : e.push(t), !0);
}
function xy(t) {
  if (typeof t != "string")
    throw new TypeError(`Expected a string, got ${typeof t}`);
  const e = [];
  let r = "", n = "start", s = !1, a = 0;
  for (const o of t) {
    if (a++, s) {
      r += o, s = !1;
      continue;
    }
    if (o === "\\") {
      if (n === "index")
        throw new Error(`Invalid character '${o}' in an index at position ${a}`);
      if (n === "indexEnd")
        throw new Error(`Invalid character '${o}' after an index at position ${a}`);
      s = !0, n = n === "start" ? "property" : n;
      continue;
    }
    switch (o) {
      case ".": {
        if (n === "index")
          throw new Error(`Invalid character '${o}' in an index at position ${a}`);
        if (n === "indexEnd") {
          n = "property";
          break;
        }
        if (!jo(r, e))
          return [];
        r = "", n = "property";
        break;
      }
      case "[": {
        if (n === "index")
          throw new Error(`Invalid character '${o}' in an index at position ${a}`);
        if (n === "indexEnd") {
          n = "index";
          break;
        }
        if (n === "property" || n === "start") {
          if ((r || n === "property") && !jo(r, e))
            return [];
          r = "";
        }
        n = "index";
        break;
      }
      case "]": {
        if (n === "index") {
          if (r === "")
            r = (e.pop() || "") + "[]", n = "property";
          else {
            const i = Number.parseInt(r, 10);
            !Number.isNaN(i) && Number.isFinite(i) && i >= 0 && i <= Number.MAX_SAFE_INTEGER && i <= Cf && r === String(i) ? e.push(i) : e.push(r), r = "", n = "indexEnd";
          }
          break;
        }
        if (n === "indexEnd")
          throw new Error(`Invalid character '${o}' after an index at position ${a}`);
        r += o;
        break;
      }
      default: {
        if (n === "index" && !Vy(o))
          throw new Error(`Invalid character '${o}' in an index at position ${a}`);
        if (n === "indexEnd")
          throw new Error(`Invalid character '${o}' after an index at position ${a}`);
        n === "start" && (n = "property"), r += o;
      }
    }
  }
  switch (s && (r += "\\"), n) {
    case "property": {
      if (!jo(r, e))
        return [];
      break;
    }
    case "index":
      throw new Error("Index was not closed");
    case "start": {
      e.push("");
      break;
    }
  }
  return e;
}
function to(t) {
  if (typeof t == "string")
    return xy(t);
  if (Array.isArray(t)) {
    const e = [];
    for (const [r, n] of t.entries()) {
      if (typeof n != "string" && typeof n != "number")
        throw new TypeError(`Expected a string or number for path segment at index ${r}, got ${typeof n}`);
      if (typeof n == "number" && !Number.isFinite(n))
        throw new TypeError(`Path segment at index ${r} must be a finite number, got ${n}`);
      if (Af.has(n))
        return [];
      typeof n == "string" && jf(n) ? e.push(Number.parseInt(n, 10)) : e.push(n);
    }
    return e;
  }
  return [];
}
function Ru(t, e, r) {
  if (!Br(t) || typeof e != "string" && !Array.isArray(e))
    return r === void 0 ? t : r;
  const n = to(e);
  if (n.length === 0)
    return r;
  for (let s = 0; s < n.length; s++) {
    const a = n[s];
    if (t = t[a], t == null) {
      if (s !== n.length - 1)
        return r;
      break;
    }
  }
  return t === void 0 ? r : t;
}
function Ms(t, e, r) {
  if (!Br(t) || typeof e != "string" && !Array.isArray(e))
    return t;
  const n = t, s = to(e);
  if (s.length === 0)
    return t;
  for (let a = 0; a < s.length; a++) {
    const o = s[a];
    if (a === s.length - 1)
      t[o] = r;
    else if (!Br(t[o])) {
      const c = typeof s[a + 1] == "number";
      t[o] = c ? [] : {};
    }
    t = t[o];
  }
  return n;
}
function Uy(t, e) {
  if (!Br(t) || typeof e != "string" && !Array.isArray(e))
    return !1;
  const r = to(e);
  if (r.length === 0)
    return !1;
  for (let n = 0; n < r.length; n++) {
    const s = r[n];
    if (n === r.length - 1)
      return Object.hasOwn(t, s) ? (delete t[s], !0) : !1;
    if (t = t[s], !Br(t))
      return !1;
  }
}
function Mo(t, e) {
  if (!Br(t) || typeof e != "string" && !Array.isArray(e))
    return !1;
  const r = to(e);
  if (r.length === 0)
    return !1;
  for (const n of r) {
    if (!Br(t) || !(n in t))
      return !1;
    t = t[n];
  }
  return !0;
}
const cr = eo.homedir(), Hi = eo.tmpdir(), { env: hn } = we, qy = (t) => {
  const e = re.join(cr, "Library");
  return {
    data: re.join(e, "Application Support", t),
    config: re.join(e, "Preferences", t),
    cache: re.join(e, "Caches", t),
    log: re.join(e, "Logs", t),
    temp: re.join(Hi, t)
  };
}, zy = (t) => {
  const e = hn.APPDATA || re.join(cr, "AppData", "Roaming"), r = hn.LOCALAPPDATA || re.join(cr, "AppData", "Local");
  return {
    // Data/config/cache/log are invented by me as Windows isn't opinionated about this
    data: re.join(r, t, "Data"),
    config: re.join(e, t, "Config"),
    cache: re.join(r, t, "Cache"),
    log: re.join(r, t, "Log"),
    temp: re.join(Hi, t)
  };
}, Ky = (t) => {
  const e = re.basename(cr);
  return {
    data: re.join(hn.XDG_DATA_HOME || re.join(cr, ".local", "share"), t),
    config: re.join(hn.XDG_CONFIG_HOME || re.join(cr, ".config"), t),
    cache: re.join(hn.XDG_CACHE_HOME || re.join(cr, ".cache"), t),
    // https://wiki.debian.org/XDGBaseDirectorySpecification#state
    log: re.join(hn.XDG_STATE_HOME || re.join(cr, ".local", "state"), t),
    temp: re.join(Hi, e, t)
  };
};
function Gy(t, { suffix: e = "nodejs" } = {}) {
  if (typeof t != "string")
    throw new TypeError(`Expected a string, got ${typeof t}`);
  return e && (t += `-${e}`), we.platform === "darwin" ? qy(t) : we.platform === "win32" ? zy(t) : Ky(t);
}
const Xt = (t, e) => {
  const { onError: r } = e;
  return function(...s) {
    return t.apply(void 0, s).catch(r);
  };
}, xt = (t, e) => {
  const { onError: r } = e;
  return function(...s) {
    try {
      return t.apply(void 0, s);
    } catch (a) {
      return r(a);
    }
  };
}, By = 250, Yt = (t, e) => {
  const { isRetriable: r } = e;
  return function(s) {
    const { timeout: a } = s, o = s.interval ?? By, i = Date.now() + a;
    return function c(...d) {
      return t.apply(void 0, d).catch((l) => {
        if (!r(l) || Date.now() >= i)
          throw l;
        const f = Math.round(o * Math.random());
        return f > 0 ? new Promise((p) => setTimeout(p, f)).then(() => c.apply(void 0, d)) : c.apply(void 0, d);
      });
    };
  };
}, Qt = (t, e) => {
  const { isRetriable: r } = e;
  return function(s) {
    const { timeout: a } = s, o = Date.now() + a;
    return function(...c) {
      for (; ; )
        try {
          return t.apply(void 0, c);
        } catch (d) {
          if (!r(d) || Date.now() >= o)
            throw d;
          continue;
        }
    };
  };
}, mn = {
  /* API */
  isChangeErrorOk: (t) => {
    if (!mn.isNodeError(t))
      return !1;
    const { code: e } = t;
    return e === "ENOSYS" || !Hy && (e === "EINVAL" || e === "EPERM");
  },
  isNodeError: (t) => t instanceof Error,
  isRetriableError: (t) => {
    if (!mn.isNodeError(t))
      return !1;
    const { code: e } = t;
    return e === "EMFILE" || e === "ENFILE" || e === "EAGAIN" || e === "EBUSY" || e === "EACCESS" || e === "EACCES" || e === "EACCS" || e === "EPERM";
  },
  onChangeError: (t) => {
    if (!mn.isNodeError(t))
      throw t;
    if (!mn.isChangeErrorOk(t))
      throw t;
  }
}, Ds = {
  onError: mn.onChangeError
}, st = {
  onError: () => {
  }
}, Hy = we.getuid ? !we.getuid() : !1, Ue = {
  isRetriable: mn.isRetriableError
}, Ke = {
  attempt: {
    /* ASYNC */
    chmod: Xt(xe(ae.chmod), Ds),
    chown: Xt(xe(ae.chown), Ds),
    close: Xt(xe(ae.close), st),
    fsync: Xt(xe(ae.fsync), st),
    mkdir: Xt(xe(ae.mkdir), st),
    realpath: Xt(xe(ae.realpath), st),
    stat: Xt(xe(ae.stat), st),
    unlink: Xt(xe(ae.unlink), st),
    /* SYNC */
    chmodSync: xt(ae.chmodSync, Ds),
    chownSync: xt(ae.chownSync, Ds),
    closeSync: xt(ae.closeSync, st),
    existsSync: xt(ae.existsSync, st),
    fsyncSync: xt(ae.fsync, st),
    mkdirSync: xt(ae.mkdirSync, st),
    realpathSync: xt(ae.realpathSync, st),
    statSync: xt(ae.statSync, st),
    unlinkSync: xt(ae.unlinkSync, st)
  },
  retry: {
    /* ASYNC */
    close: Yt(xe(ae.close), Ue),
    fsync: Yt(xe(ae.fsync), Ue),
    open: Yt(xe(ae.open), Ue),
    readFile: Yt(xe(ae.readFile), Ue),
    rename: Yt(xe(ae.rename), Ue),
    stat: Yt(xe(ae.stat), Ue),
    write: Yt(xe(ae.write), Ue),
    writeFile: Yt(xe(ae.writeFile), Ue),
    /* SYNC */
    closeSync: Qt(ae.closeSync, Ue),
    fsyncSync: Qt(ae.fsyncSync, Ue),
    openSync: Qt(ae.openSync, Ue),
    readFileSync: Qt(ae.readFileSync, Ue),
    renameSync: Qt(ae.renameSync, Ue),
    statSync: Qt(ae.statSync, Ue),
    writeSync: Qt(ae.writeSync, Ue),
    writeFileSync: Qt(ae.writeFileSync, Ue)
  }
}, Wy = "utf8", Ou = 438, Jy = 511, Xy = {}, Yy = we.geteuid ? we.geteuid() : -1, Qy = we.getegid ? we.getegid() : -1, Zy = 1e3, e$ = !!we.getuid;
we.getuid && we.getuid();
const Iu = 128, t$ = (t) => t instanceof Error && "code" in t, Nu = (t) => typeof t == "string", Do = (t) => t === void 0, r$ = we.platform === "linux", Mf = we.platform === "win32", Wi = ["SIGHUP", "SIGINT", "SIGTERM"];
Mf || Wi.push("SIGALRM", "SIGABRT", "SIGVTALRM", "SIGXCPU", "SIGXFSZ", "SIGUSR2", "SIGTRAP", "SIGSYS", "SIGQUIT", "SIGIOT");
r$ && Wi.push("SIGIO", "SIGPOLL", "SIGPWR", "SIGSTKFLT");
class n$ {
  /* CONSTRUCTOR */
  constructor() {
    this.callbacks = /* @__PURE__ */ new Set(), this.exited = !1, this.exit = (e) => {
      if (!this.exited) {
        this.exited = !0;
        for (const r of this.callbacks)
          r();
        e && (Mf && e !== "SIGINT" && e !== "SIGTERM" && e !== "SIGKILL" ? we.kill(we.pid, "SIGTERM") : we.kill(we.pid, e));
      }
    }, this.hook = () => {
      we.once("exit", () => this.exit());
      for (const e of Wi)
        try {
          we.once(e, () => this.exit(e));
        } catch {
        }
    }, this.register = (e) => (this.callbacks.add(e), () => {
      this.callbacks.delete(e);
    }), this.hook();
  }
}
const s$ = new n$(), a$ = s$.register, Ge = {
  /* VARIABLES */
  store: {},
  // filePath => purge
  /* API */
  create: (t) => {
    const e = `000000${Math.floor(Math.random() * 16777215).toString(16)}`.slice(-6), s = `.tmp-${Date.now().toString().slice(-10)}${e}`;
    return `${t}${s}`;
  },
  get: (t, e, r = !0) => {
    const n = Ge.truncate(e(t));
    return n in Ge.store ? Ge.get(t, e, r) : (Ge.store[n] = r, [n, () => delete Ge.store[n]]);
  },
  purge: (t) => {
    Ge.store[t] && (delete Ge.store[t], Ke.attempt.unlink(t));
  },
  purgeSync: (t) => {
    Ge.store[t] && (delete Ge.store[t], Ke.attempt.unlinkSync(t));
  },
  purgeSyncAll: () => {
    for (const t in Ge.store)
      Ge.purgeSync(t);
  },
  truncate: (t) => {
    const e = re.basename(t);
    if (e.length <= Iu)
      return t;
    const r = /^(\.?)(.*?)((?:\.[^.]+)?(?:\.tmp-\d{10}[a-f0-9]{6})?)$/.exec(e);
    if (!r)
      return t;
    const n = e.length - Iu;
    return `${t.slice(0, -e.length)}${r[1]}${r[2].slice(0, -n)}${r[3]}`;
  }
};
a$(Ge.purgeSyncAll);
function Df(t, e, r = Xy) {
  if (Nu(r))
    return Df(t, e, { encoding: r });
  const s = { timeout: r.timeout ?? Zy };
  let a = null, o = null, i = null;
  try {
    const c = Ke.attempt.realpathSync(t), d = !!c;
    t = c || t, [o, a] = Ge.get(t, r.tmpCreate || Ge.create, r.tmpPurge !== !1);
    const l = e$ && Do(r.chown), f = Do(r.mode);
    if (d && (l || f)) {
      const _ = Ke.attempt.statSync(t);
      _ && (r = { ...r }, l && (r.chown = { uid: _.uid, gid: _.gid }), f && (r.mode = _.mode));
    }
    if (!d) {
      const _ = re.dirname(t);
      Ke.attempt.mkdirSync(_, {
        mode: Jy,
        recursive: !0
      });
    }
    i = Ke.retry.openSync(s)(o, "w", r.mode || Ou), r.tmpCreated && r.tmpCreated(o), Nu(e) ? Ke.retry.writeSync(s)(i, e, 0, r.encoding || Wy) : Do(e) || Ke.retry.writeSync(s)(i, e, 0, e.length, 0), r.fsync !== !1 && (r.fsyncWait !== !1 ? Ke.retry.fsyncSync(s)(i) : Ke.attempt.fsync(i)), Ke.retry.closeSync(s)(i), i = null, r.chown && (r.chown.uid !== Yy || r.chown.gid !== Qy) && Ke.attempt.chownSync(o, r.chown.uid, r.chown.gid), r.mode && r.mode !== Ou && Ke.attempt.chmodSync(o, r.mode);
    try {
      Ke.retry.renameSync(s)(o, t);
    } catch (_) {
      if (!t$(_) || _.code !== "ENAMETOOLONG")
        throw _;
      Ke.retry.renameSync(s)(o, Ge.truncate(t));
    }
    a(), o = null;
  } finally {
    i && Ke.attempt.closeSync(i), o && Ge.purge(o);
  }
}
function Ji(t) {
  return t && t.__esModule && Object.prototype.hasOwnProperty.call(t, "default") ? t.default : t;
}
var fi = { exports: {} }, Lf = {}, Et = {}, bn = {}, Ps = {}, oe = {}, ws = {};
(function(t) {
  Object.defineProperty(t, "__esModule", { value: !0 }), t.regexpCode = t.getEsmExportName = t.getProperty = t.safeStringify = t.stringify = t.strConcat = t.addCodeArg = t.str = t._ = t.nil = t._Code = t.Name = t.IDENTIFIER = t._CodeOrName = void 0;
  class e {
  }
  t._CodeOrName = e, t.IDENTIFIER = /^[a-z$_][a-z$_0-9]*$/i;
  class r extends e {
    constructor(v) {
      if (super(), !t.IDENTIFIER.test(v))
        throw new Error("CodeGen: name must be a valid identifier");
      this.str = v;
    }
    toString() {
      return this.str;
    }
    emptyStr() {
      return !1;
    }
    get names() {
      return { [this.str]: 1 };
    }
  }
  t.Name = r;
  class n extends e {
    constructor(v) {
      super(), this._items = typeof v == "string" ? [v] : v;
    }
    toString() {
      return this.str;
    }
    emptyStr() {
      if (this._items.length > 1)
        return !1;
      const v = this._items[0];
      return v === "" || v === '""';
    }
    get str() {
      var v;
      return (v = this._str) !== null && v !== void 0 ? v : this._str = this._items.reduce((P, R) => `${P}${R}`, "");
    }
    get names() {
      var v;
      return (v = this._names) !== null && v !== void 0 ? v : this._names = this._items.reduce((P, R) => (R instanceof r && (P[R.str] = (P[R.str] || 0) + 1), P), {});
    }
  }
  t._Code = n, t.nil = new n("");
  function s(m, ...v) {
    const P = [m[0]];
    let R = 0;
    for (; R < v.length; )
      i(P, v[R]), P.push(m[++R]);
    return new n(P);
  }
  t._ = s;
  const a = new n("+");
  function o(m, ...v) {
    const P = [p(m[0])];
    let R = 0;
    for (; R < v.length; )
      P.push(a), i(P, v[R]), P.push(a, p(m[++R]));
    return c(P), new n(P);
  }
  t.str = o;
  function i(m, v) {
    v instanceof n ? m.push(...v._items) : v instanceof r ? m.push(v) : m.push(f(v));
  }
  t.addCodeArg = i;
  function c(m) {
    let v = 1;
    for (; v < m.length - 1; ) {
      if (m[v] === a) {
        const P = d(m[v - 1], m[v + 1]);
        if (P !== void 0) {
          m.splice(v - 1, 3, P);
          continue;
        }
        m[v++] = "+";
      }
      v++;
    }
  }
  function d(m, v) {
    if (v === '""')
      return m;
    if (m === '""')
      return v;
    if (typeof m == "string")
      return v instanceof r || m[m.length - 1] !== '"' ? void 0 : typeof v != "string" ? `${m.slice(0, -1)}${v}"` : v[0] === '"' ? m.slice(0, -1) + v.slice(1) : void 0;
    if (typeof v == "string" && v[0] === '"' && !(m instanceof r))
      return `"${m}${v.slice(1)}`;
  }
  function l(m, v) {
    return v.emptyStr() ? m : m.emptyStr() ? v : o`${m}${v}`;
  }
  t.strConcat = l;
  function f(m) {
    return typeof m == "number" || typeof m == "boolean" || m === null ? m : p(Array.isArray(m) ? m.join(",") : m);
  }
  function _(m) {
    return new n(p(m));
  }
  t.stringify = _;
  function p(m) {
    return JSON.stringify(m).replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029");
  }
  t.safeStringify = p;
  function w(m) {
    return typeof m == "string" && t.IDENTIFIER.test(m) ? new n(`.${m}`) : s`[${m}]`;
  }
  t.getProperty = w;
  function $(m) {
    if (typeof m == "string" && t.IDENTIFIER.test(m))
      return new n(`${m}`);
    throw new Error(`CodeGen: invalid export name: ${m}, use explicit $id name mapping`);
  }
  t.getEsmExportName = $;
  function y(m) {
    return new n(m.toString());
  }
  t.regexpCode = y;
})(ws);
var hi = {};
(function(t) {
  Object.defineProperty(t, "__esModule", { value: !0 }), t.ValueScope = t.ValueScopeName = t.Scope = t.varKinds = t.UsedValueState = void 0;
  const e = ws;
  class r extends Error {
    constructor(d) {
      super(`CodeGen: "code" for ${d} not defined`), this.value = d.value;
    }
  }
  var n;
  (function(c) {
    c[c.Started = 0] = "Started", c[c.Completed = 1] = "Completed";
  })(n || (t.UsedValueState = n = {})), t.varKinds = {
    const: new e.Name("const"),
    let: new e.Name("let"),
    var: new e.Name("var")
  };
  class s {
    constructor({ prefixes: d, parent: l } = {}) {
      this._names = {}, this._prefixes = d, this._parent = l;
    }
    toName(d) {
      return d instanceof e.Name ? d : this.name(d);
    }
    name(d) {
      return new e.Name(this._newName(d));
    }
    _newName(d) {
      const l = this._names[d] || this._nameGroup(d);
      return `${d}${l.index++}`;
    }
    _nameGroup(d) {
      var l, f;
      if (!((f = (l = this._parent) === null || l === void 0 ? void 0 : l._prefixes) === null || f === void 0) && f.has(d) || this._prefixes && !this._prefixes.has(d))
        throw new Error(`CodeGen: prefix "${d}" is not allowed in this scope`);
      return this._names[d] = { prefix: d, index: 0 };
    }
  }
  t.Scope = s;
  class a extends e.Name {
    constructor(d, l) {
      super(l), this.prefix = d;
    }
    setValue(d, { property: l, itemIndex: f }) {
      this.value = d, this.scopePath = (0, e._)`.${new e.Name(l)}[${f}]`;
    }
  }
  t.ValueScopeName = a;
  const o = (0, e._)`\n`;
  class i extends s {
    constructor(d) {
      super(d), this._values = {}, this._scope = d.scope, this.opts = { ...d, _n: d.lines ? o : e.nil };
    }
    get() {
      return this._scope;
    }
    name(d) {
      return new a(d, this._newName(d));
    }
    value(d, l) {
      var f;
      if (l.ref === void 0)
        throw new Error("CodeGen: ref must be passed in value");
      const _ = this.toName(d), { prefix: p } = _, w = (f = l.key) !== null && f !== void 0 ? f : l.ref;
      let $ = this._values[p];
      if ($) {
        const v = $.get(w);
        if (v)
          return v;
      } else
        $ = this._values[p] = /* @__PURE__ */ new Map();
      $.set(w, _);
      const y = this._scope[p] || (this._scope[p] = []), m = y.length;
      return y[m] = l.ref, _.setValue(l, { property: p, itemIndex: m }), _;
    }
    getValue(d, l) {
      const f = this._values[d];
      if (f)
        return f.get(l);
    }
    scopeRefs(d, l = this._values) {
      return this._reduceValues(l, (f) => {
        if (f.scopePath === void 0)
          throw new Error(`CodeGen: name "${f}" has no value`);
        return (0, e._)`${d}${f.scopePath}`;
      });
    }
    scopeCode(d = this._values, l, f) {
      return this._reduceValues(d, (_) => {
        if (_.value === void 0)
          throw new Error(`CodeGen: name "${_}" has no value`);
        return _.value.code;
      }, l, f);
    }
    _reduceValues(d, l, f = {}, _) {
      let p = e.nil;
      for (const w in d) {
        const $ = d[w];
        if (!$)
          continue;
        const y = f[w] = f[w] || /* @__PURE__ */ new Map();
        $.forEach((m) => {
          if (y.has(m))
            return;
          y.set(m, n.Started);
          let v = l(m);
          if (v) {
            const P = this.opts.es5 ? t.varKinds.var : t.varKinds.const;
            p = (0, e._)`${p}${P} ${m} = ${v};${this.opts._n}`;
          } else if (v = _ == null ? void 0 : _(m))
            p = (0, e._)`${p}${v}${this.opts._n}`;
          else
            throw new r(m);
          y.set(m, n.Completed);
        });
      }
      return p;
    }
  }
  t.ValueScope = i;
})(hi);
(function(t) {
  Object.defineProperty(t, "__esModule", { value: !0 }), t.or = t.and = t.not = t.CodeGen = t.operators = t.varKinds = t.ValueScopeName = t.ValueScope = t.Scope = t.Name = t.regexpCode = t.stringify = t.getProperty = t.nil = t.strConcat = t.str = t._ = void 0;
  const e = ws, r = hi;
  var n = ws;
  Object.defineProperty(t, "_", { enumerable: !0, get: function() {
    return n._;
  } }), Object.defineProperty(t, "str", { enumerable: !0, get: function() {
    return n.str;
  } }), Object.defineProperty(t, "strConcat", { enumerable: !0, get: function() {
    return n.strConcat;
  } }), Object.defineProperty(t, "nil", { enumerable: !0, get: function() {
    return n.nil;
  } }), Object.defineProperty(t, "getProperty", { enumerable: !0, get: function() {
    return n.getProperty;
  } }), Object.defineProperty(t, "stringify", { enumerable: !0, get: function() {
    return n.stringify;
  } }), Object.defineProperty(t, "regexpCode", { enumerable: !0, get: function() {
    return n.regexpCode;
  } }), Object.defineProperty(t, "Name", { enumerable: !0, get: function() {
    return n.Name;
  } });
  var s = hi;
  Object.defineProperty(t, "Scope", { enumerable: !0, get: function() {
    return s.Scope;
  } }), Object.defineProperty(t, "ValueScope", { enumerable: !0, get: function() {
    return s.ValueScope;
  } }), Object.defineProperty(t, "ValueScopeName", { enumerable: !0, get: function() {
    return s.ValueScopeName;
  } }), Object.defineProperty(t, "varKinds", { enumerable: !0, get: function() {
    return s.varKinds;
  } }), t.operators = {
    GT: new e._Code(">"),
    GTE: new e._Code(">="),
    LT: new e._Code("<"),
    LTE: new e._Code("<="),
    EQ: new e._Code("==="),
    NEQ: new e._Code("!=="),
    NOT: new e._Code("!"),
    OR: new e._Code("||"),
    AND: new e._Code("&&"),
    ADD: new e._Code("+")
  };
  class a {
    optimizeNodes() {
      return this;
    }
    optimizeNames(u, h) {
      return this;
    }
  }
  class o extends a {
    constructor(u, h, E) {
      super(), this.varKind = u, this.name = h, this.rhs = E;
    }
    render({ es5: u, _n: h }) {
      const E = u ? r.varKinds.var : this.varKind, T = this.rhs === void 0 ? "" : ` = ${this.rhs}`;
      return `${E} ${this.name}${T};` + h;
    }
    optimizeNames(u, h) {
      if (u[this.name.str])
        return this.rhs && (this.rhs = k(this.rhs, u, h)), this;
    }
    get names() {
      return this.rhs instanceof e._CodeOrName ? this.rhs.names : {};
    }
  }
  class i extends a {
    constructor(u, h, E) {
      super(), this.lhs = u, this.rhs = h, this.sideEffects = E;
    }
    render({ _n: u }) {
      return `${this.lhs} = ${this.rhs};` + u;
    }
    optimizeNames(u, h) {
      if (!(this.lhs instanceof e.Name && !u[this.lhs.str] && !this.sideEffects))
        return this.rhs = k(this.rhs, u, h), this;
    }
    get names() {
      const u = this.lhs instanceof e.Name ? {} : { ...this.lhs.names };
      return me(u, this.rhs);
    }
  }
  class c extends i {
    constructor(u, h, E, T) {
      super(u, E, T), this.op = h;
    }
    render({ _n: u }) {
      return `${this.lhs} ${this.op}= ${this.rhs};` + u;
    }
  }
  class d extends a {
    constructor(u) {
      super(), this.label = u, this.names = {};
    }
    render({ _n: u }) {
      return `${this.label}:` + u;
    }
  }
  class l extends a {
    constructor(u) {
      super(), this.label = u, this.names = {};
    }
    render({ _n: u }) {
      return `break${this.label ? ` ${this.label}` : ""};` + u;
    }
  }
  class f extends a {
    constructor(u) {
      super(), this.error = u;
    }
    render({ _n: u }) {
      return `throw ${this.error};` + u;
    }
    get names() {
      return this.error.names;
    }
  }
  class _ extends a {
    constructor(u) {
      super(), this.code = u;
    }
    render({ _n: u }) {
      return `${this.code};` + u;
    }
    optimizeNodes() {
      return `${this.code}` ? this : void 0;
    }
    optimizeNames(u, h) {
      return this.code = k(this.code, u, h), this;
    }
    get names() {
      return this.code instanceof e._CodeOrName ? this.code.names : {};
    }
  }
  class p extends a {
    constructor(u = []) {
      super(), this.nodes = u;
    }
    render(u) {
      return this.nodes.reduce((h, E) => h + E.render(u), "");
    }
    optimizeNodes() {
      const { nodes: u } = this;
      let h = u.length;
      for (; h--; ) {
        const E = u[h].optimizeNodes();
        Array.isArray(E) ? u.splice(h, 1, ...E) : E ? u[h] = E : u.splice(h, 1);
      }
      return u.length > 0 ? this : void 0;
    }
    optimizeNames(u, h) {
      const { nodes: E } = this;
      let T = E.length;
      for (; T--; ) {
        const A = E[T];
        A.optimizeNames(u, h) || (C(u, A.names), E.splice(T, 1));
      }
      return E.length > 0 ? this : void 0;
    }
    get names() {
      return this.nodes.reduce((u, h) => B(u, h.names), {});
    }
  }
  class w extends p {
    render(u) {
      return "{" + u._n + super.render(u) + "}" + u._n;
    }
  }
  class $ extends p {
  }
  class y extends w {
  }
  y.kind = "else";
  class m extends w {
    constructor(u, h) {
      super(h), this.condition = u;
    }
    render(u) {
      let h = `if(${this.condition})` + super.render(u);
      return this.else && (h += "else " + this.else.render(u)), h;
    }
    optimizeNodes() {
      super.optimizeNodes();
      const u = this.condition;
      if (u === !0)
        return this.nodes;
      let h = this.else;
      if (h) {
        const E = h.optimizeNodes();
        h = this.else = Array.isArray(E) ? new y(E) : E;
      }
      if (h)
        return u === !1 ? h instanceof m ? h : h.nodes : this.nodes.length ? this : new m(z(u), h instanceof m ? [h] : h.nodes);
      if (!(u === !1 || !this.nodes.length))
        return this;
    }
    optimizeNames(u, h) {
      var E;
      if (this.else = (E = this.else) === null || E === void 0 ? void 0 : E.optimizeNames(u, h), !!(super.optimizeNames(u, h) || this.else))
        return this.condition = k(this.condition, u, h), this;
    }
    get names() {
      const u = super.names;
      return me(u, this.condition), this.else && B(u, this.else.names), u;
    }
  }
  m.kind = "if";
  class v extends w {
  }
  v.kind = "for";
  class P extends v {
    constructor(u) {
      super(), this.iteration = u;
    }
    render(u) {
      return `for(${this.iteration})` + super.render(u);
    }
    optimizeNames(u, h) {
      if (super.optimizeNames(u, h))
        return this.iteration = k(this.iteration, u, h), this;
    }
    get names() {
      return B(super.names, this.iteration.names);
    }
  }
  class R extends v {
    constructor(u, h, E, T) {
      super(), this.varKind = u, this.name = h, this.from = E, this.to = T;
    }
    render(u) {
      const h = u.es5 ? r.varKinds.var : this.varKind, { name: E, from: T, to: A } = this;
      return `for(${h} ${E}=${T}; ${E}<${A}; ${E}++)` + super.render(u);
    }
    get names() {
      const u = me(super.names, this.from);
      return me(u, this.to);
    }
  }
  class N extends v {
    constructor(u, h, E, T) {
      super(), this.loop = u, this.varKind = h, this.name = E, this.iterable = T;
    }
    render(u) {
      return `for(${this.varKind} ${this.name} ${this.loop} ${this.iterable})` + super.render(u);
    }
    optimizeNames(u, h) {
      if (super.optimizeNames(u, h))
        return this.iterable = k(this.iterable, u, h), this;
    }
    get names() {
      return B(super.names, this.iterable.names);
    }
  }
  class D extends w {
    constructor(u, h, E) {
      super(), this.name = u, this.args = h, this.async = E;
    }
    render(u) {
      return `${this.async ? "async " : ""}function ${this.name}(${this.args})` + super.render(u);
    }
  }
  D.kind = "func";
  class L extends p {
    render(u) {
      return "return " + super.render(u);
    }
  }
  L.kind = "return";
  class de extends w {
    render(u) {
      let h = "try" + super.render(u);
      return this.catch && (h += this.catch.render(u)), this.finally && (h += this.finally.render(u)), h;
    }
    optimizeNodes() {
      var u, h;
      return super.optimizeNodes(), (u = this.catch) === null || u === void 0 || u.optimizeNodes(), (h = this.finally) === null || h === void 0 || h.optimizeNodes(), this;
    }
    optimizeNames(u, h) {
      var E, T;
      return super.optimizeNames(u, h), (E = this.catch) === null || E === void 0 || E.optimizeNames(u, h), (T = this.finally) === null || T === void 0 || T.optimizeNames(u, h), this;
    }
    get names() {
      const u = super.names;
      return this.catch && B(u, this.catch.names), this.finally && B(u, this.finally.names), u;
    }
  }
  class Z extends w {
    constructor(u) {
      super(), this.error = u;
    }
    render(u) {
      return `catch(${this.error})` + super.render(u);
    }
  }
  Z.kind = "catch";
  class ne extends w {
    render(u) {
      return "finally" + super.render(u);
    }
  }
  ne.kind = "finally";
  class M {
    constructor(u, h = {}) {
      this._values = {}, this._blockStarts = [], this._constants = {}, this.opts = { ...h, _n: h.lines ? `
` : "" }, this._extScope = u, this._scope = new r.Scope({ parent: u }), this._nodes = [new $()];
    }
    toString() {
      return this._root.render(this.opts);
    }
    // returns unique name in the internal scope
    name(u) {
      return this._scope.name(u);
    }
    // reserves unique name in the external scope
    scopeName(u) {
      return this._extScope.name(u);
    }
    // reserves unique name in the external scope and assigns value to it
    scopeValue(u, h) {
      const E = this._extScope.value(u, h);
      return (this._values[E.prefix] || (this._values[E.prefix] = /* @__PURE__ */ new Set())).add(E), E;
    }
    getScopeValue(u, h) {
      return this._extScope.getValue(u, h);
    }
    // return code that assigns values in the external scope to the names that are used internally
    // (same names that were returned by gen.scopeName or gen.scopeValue)
    scopeRefs(u) {
      return this._extScope.scopeRefs(u, this._values);
    }
    scopeCode() {
      return this._extScope.scopeCode(this._values);
    }
    _def(u, h, E, T) {
      const A = this._scope.toName(h);
      return E !== void 0 && T && (this._constants[A.str] = E), this._leafNode(new o(u, A, E)), A;
    }
    // `const` declaration (`var` in es5 mode)
    const(u, h, E) {
      return this._def(r.varKinds.const, u, h, E);
    }
    // `let` declaration with optional assignment (`var` in es5 mode)
    let(u, h, E) {
      return this._def(r.varKinds.let, u, h, E);
    }
    // `var` declaration with optional assignment
    var(u, h, E) {
      return this._def(r.varKinds.var, u, h, E);
    }
    // assignment code
    assign(u, h, E) {
      return this._leafNode(new i(u, h, E));
    }
    // `+=` code
    add(u, h) {
      return this._leafNode(new c(u, t.operators.ADD, h));
    }
    // appends passed SafeExpr to code or executes Block
    code(u) {
      return typeof u == "function" ? u() : u !== e.nil && this._leafNode(new _(u)), this;
    }
    // returns code for object literal for the passed argument list of key-value pairs
    object(...u) {
      const h = ["{"];
      for (const [E, T] of u)
        h.length > 1 && h.push(","), h.push(E), (E !== T || this.opts.es5) && (h.push(":"), (0, e.addCodeArg)(h, T));
      return h.push("}"), new e._Code(h);
    }
    // `if` clause (or statement if `thenBody` and, optionally, `elseBody` are passed)
    if(u, h, E) {
      if (this._blockNode(new m(u)), h && E)
        this.code(h).else().code(E).endIf();
      else if (h)
        this.code(h).endIf();
      else if (E)
        throw new Error('CodeGen: "else" body without "then" body');
      return this;
    }
    // `else if` clause - invalid without `if` or after `else` clauses
    elseIf(u) {
      return this._elseNode(new m(u));
    }
    // `else` clause - only valid after `if` or `else if` clauses
    else() {
      return this._elseNode(new y());
    }
    // end `if` statement (needed if gen.if was used only with condition)
    endIf() {
      return this._endBlockNode(m, y);
    }
    _for(u, h) {
      return this._blockNode(u), h && this.code(h).endFor(), this;
    }
    // a generic `for` clause (or statement if `forBody` is passed)
    for(u, h) {
      return this._for(new P(u), h);
    }
    // `for` statement for a range of values
    forRange(u, h, E, T, A = this.opts.es5 ? r.varKinds.var : r.varKinds.let) {
      const G = this._scope.toName(u);
      return this._for(new R(A, G, h, E), () => T(G));
    }
    // `for-of` statement (in es5 mode replace with a normal for loop)
    forOf(u, h, E, T = r.varKinds.const) {
      const A = this._scope.toName(u);
      if (this.opts.es5) {
        const G = h instanceof e.Name ? h : this.var("_arr", h);
        return this.forRange("_i", 0, (0, e._)`${G}.length`, (K) => {
          this.var(A, (0, e._)`${G}[${K}]`), E(A);
        });
      }
      return this._for(new N("of", T, A, h), () => E(A));
    }
    // `for-in` statement.
    // With option `ownProperties` replaced with a `for-of` loop for object keys
    forIn(u, h, E, T = this.opts.es5 ? r.varKinds.var : r.varKinds.const) {
      if (this.opts.ownProperties)
        return this.forOf(u, (0, e._)`Object.keys(${h})`, E);
      const A = this._scope.toName(u);
      return this._for(new N("in", T, A, h), () => E(A));
    }
    // end `for` loop
    endFor() {
      return this._endBlockNode(v);
    }
    // `label` statement
    label(u) {
      return this._leafNode(new d(u));
    }
    // `break` statement
    break(u) {
      return this._leafNode(new l(u));
    }
    // `return` statement
    return(u) {
      const h = new L();
      if (this._blockNode(h), this.code(u), h.nodes.length !== 1)
        throw new Error('CodeGen: "return" should have one node');
      return this._endBlockNode(L);
    }
    // `try` statement
    try(u, h, E) {
      if (!h && !E)
        throw new Error('CodeGen: "try" without "catch" and "finally"');
      const T = new de();
      if (this._blockNode(T), this.code(u), h) {
        const A = this.name("e");
        this._currNode = T.catch = new Z(A), h(A);
      }
      return E && (this._currNode = T.finally = new ne(), this.code(E)), this._endBlockNode(Z, ne);
    }
    // `throw` statement
    throw(u) {
      return this._leafNode(new f(u));
    }
    // start self-balancing block
    block(u, h) {
      return this._blockStarts.push(this._nodes.length), u && this.code(u).endBlock(h), this;
    }
    // end the current self-balancing block
    endBlock(u) {
      const h = this._blockStarts.pop();
      if (h === void 0)
        throw new Error("CodeGen: not in self-balancing block");
      const E = this._nodes.length - h;
      if (E < 0 || u !== void 0 && E !== u)
        throw new Error(`CodeGen: wrong number of nodes: ${E} vs ${u} expected`);
      return this._nodes.length = h, this;
    }
    // `function` heading (or definition if funcBody is passed)
    func(u, h = e.nil, E, T) {
      return this._blockNode(new D(u, h, E)), T && this.code(T).endFunc(), this;
    }
    // end function definition
    endFunc() {
      return this._endBlockNode(D);
    }
    optimize(u = 1) {
      for (; u-- > 0; )
        this._root.optimizeNodes(), this._root.optimizeNames(this._root.names, this._constants);
    }
    _leafNode(u) {
      return this._currNode.nodes.push(u), this;
    }
    _blockNode(u) {
      this._currNode.nodes.push(u), this._nodes.push(u);
    }
    _endBlockNode(u, h) {
      const E = this._currNode;
      if (E instanceof u || h && E instanceof h)
        return this._nodes.pop(), this;
      throw new Error(`CodeGen: not in block "${h ? `${u.kind}/${h.kind}` : u.kind}"`);
    }
    _elseNode(u) {
      const h = this._currNode;
      if (!(h instanceof m))
        throw new Error('CodeGen: "else" without "if"');
      return this._currNode = h.else = u, this;
    }
    get _root() {
      return this._nodes[0];
    }
    get _currNode() {
      const u = this._nodes;
      return u[u.length - 1];
    }
    set _currNode(u) {
      const h = this._nodes;
      h[h.length - 1] = u;
    }
  }
  t.CodeGen = M;
  function B(b, u) {
    for (const h in u)
      b[h] = (b[h] || 0) + (u[h] || 0);
    return b;
  }
  function me(b, u) {
    return u instanceof e._CodeOrName ? B(b, u.names) : b;
  }
  function k(b, u, h) {
    if (b instanceof e.Name)
      return E(b);
    if (!T(b))
      return b;
    return new e._Code(b._items.reduce((A, G) => (G instanceof e.Name && (G = E(G)), G instanceof e._Code ? A.push(...G._items) : A.push(G), A), []));
    function E(A) {
      const G = h[A.str];
      return G === void 0 || u[A.str] !== 1 ? A : (delete u[A.str], G);
    }
    function T(A) {
      return A instanceof e._Code && A._items.some((G) => G instanceof e.Name && u[G.str] === 1 && h[G.str] !== void 0);
    }
  }
  function C(b, u) {
    for (const h in u)
      b[h] = (b[h] || 0) - (u[h] || 0);
  }
  function z(b) {
    return typeof b == "boolean" || typeof b == "number" || b === null ? !b : (0, e._)`!${S(b)}`;
  }
  t.not = z;
  const x = g(t.operators.AND);
  function J(...b) {
    return b.reduce(x);
  }
  t.and = J;
  const U = g(t.operators.OR);
  function O(...b) {
    return b.reduce(U);
  }
  t.or = O;
  function g(b) {
    return (u, h) => u === e.nil ? h : h === e.nil ? u : (0, e._)`${S(u)} ${b} ${S(h)}`;
  }
  function S(b) {
    return b instanceof e.Name ? b : (0, e._)`(${b})`;
  }
})(oe);
var F = {};
Object.defineProperty(F, "__esModule", { value: !0 });
F.checkStrictMode = F.getErrorPath = F.Type = F.useFunc = F.setEvaluated = F.evaluatedPropsToName = F.mergeEvaluated = F.eachItem = F.unescapeJsonPointer = F.escapeJsonPointer = F.escapeFragment = F.unescapeFragment = F.schemaRefOrVal = F.schemaHasRulesButRef = F.schemaHasRules = F.checkUnknownRules = F.alwaysValidSchema = F.toHash = void 0;
const $e = oe, o$ = ws;
function i$(t) {
  const e = {};
  for (const r of t)
    e[r] = !0;
  return e;
}
F.toHash = i$;
function c$(t, e) {
  return typeof e == "boolean" ? e : Object.keys(e).length === 0 ? !0 : (Ff(t, e), !Vf(e, t.self.RULES.all));
}
F.alwaysValidSchema = c$;
function Ff(t, e = t.schema) {
  const { opts: r, self: n } = t;
  if (!r.strictSchema || typeof e == "boolean")
    return;
  const s = n.RULES.keywords;
  for (const a in e)
    s[a] || qf(t, `unknown keyword: "${a}"`);
}
F.checkUnknownRules = Ff;
function Vf(t, e) {
  if (typeof t == "boolean")
    return !t;
  for (const r in t)
    if (e[r])
      return !0;
  return !1;
}
F.schemaHasRules = Vf;
function l$(t, e) {
  if (typeof t == "boolean")
    return !t;
  for (const r in t)
    if (r !== "$ref" && e.all[r])
      return !0;
  return !1;
}
F.schemaHasRulesButRef = l$;
function u$({ topSchemaRef: t, schemaPath: e }, r, n, s) {
  if (!s) {
    if (typeof r == "number" || typeof r == "boolean")
      return r;
    if (typeof r == "string")
      return (0, $e._)`${r}`;
  }
  return (0, $e._)`${t}${e}${(0, $e.getProperty)(n)}`;
}
F.schemaRefOrVal = u$;
function d$(t) {
  return xf(decodeURIComponent(t));
}
F.unescapeFragment = d$;
function f$(t) {
  return encodeURIComponent(Xi(t));
}
F.escapeFragment = f$;
function Xi(t) {
  return typeof t == "number" ? `${t}` : t.replace(/~/g, "~0").replace(/\//g, "~1");
}
F.escapeJsonPointer = Xi;
function xf(t) {
  return t.replace(/~1/g, "/").replace(/~0/g, "~");
}
F.unescapeJsonPointer = xf;
function h$(t, e) {
  if (Array.isArray(t))
    for (const r of t)
      e(r);
  else
    e(t);
}
F.eachItem = h$;
function Tu({ mergeNames: t, mergeToName: e, mergeValues: r, resultToName: n }) {
  return (s, a, o, i) => {
    const c = o === void 0 ? a : o instanceof $e.Name ? (a instanceof $e.Name ? t(s, a, o) : e(s, a, o), o) : a instanceof $e.Name ? (e(s, o, a), a) : r(a, o);
    return i === $e.Name && !(c instanceof $e.Name) ? n(s, c) : c;
  };
}
F.mergeEvaluated = {
  props: Tu({
    mergeNames: (t, e, r) => t.if((0, $e._)`${r} !== true && ${e} !== undefined`, () => {
      t.if((0, $e._)`${e} === true`, () => t.assign(r, !0), () => t.assign(r, (0, $e._)`${r} || {}`).code((0, $e._)`Object.assign(${r}, ${e})`));
    }),
    mergeToName: (t, e, r) => t.if((0, $e._)`${r} !== true`, () => {
      e === !0 ? t.assign(r, !0) : (t.assign(r, (0, $e._)`${r} || {}`), Yi(t, r, e));
    }),
    mergeValues: (t, e) => t === !0 ? !0 : { ...t, ...e },
    resultToName: Uf
  }),
  items: Tu({
    mergeNames: (t, e, r) => t.if((0, $e._)`${r} !== true && ${e} !== undefined`, () => t.assign(r, (0, $e._)`${e} === true ? true : ${r} > ${e} ? ${r} : ${e}`)),
    mergeToName: (t, e, r) => t.if((0, $e._)`${r} !== true`, () => t.assign(r, e === !0 ? !0 : (0, $e._)`${r} > ${e} ? ${r} : ${e}`)),
    mergeValues: (t, e) => t === !0 ? !0 : Math.max(t, e),
    resultToName: (t, e) => t.var("items", e)
  })
};
function Uf(t, e) {
  if (e === !0)
    return t.var("props", !0);
  const r = t.var("props", (0, $e._)`{}`);
  return e !== void 0 && Yi(t, r, e), r;
}
F.evaluatedPropsToName = Uf;
function Yi(t, e, r) {
  Object.keys(r).forEach((n) => t.assign((0, $e._)`${e}${(0, $e.getProperty)(n)}`, !0));
}
F.setEvaluated = Yi;
const ku = {};
function m$(t, e) {
  return t.scopeValue("func", {
    ref: e,
    code: ku[e.code] || (ku[e.code] = new o$._Code(e.code))
  });
}
F.useFunc = m$;
var mi;
(function(t) {
  t[t.Num = 0] = "Num", t[t.Str = 1] = "Str";
})(mi || (F.Type = mi = {}));
function p$(t, e, r) {
  if (t instanceof $e.Name) {
    const n = e === mi.Num;
    return r ? n ? (0, $e._)`"[" + ${t} + "]"` : (0, $e._)`"['" + ${t} + "']"` : n ? (0, $e._)`"/" + ${t}` : (0, $e._)`"/" + ${t}.replace(/~/g, "~0").replace(/\\//g, "~1")`;
  }
  return r ? (0, $e.getProperty)(t).toString() : "/" + Xi(t);
}
F.getErrorPath = p$;
function qf(t, e, r = t.opts.strictSchema) {
  if (r) {
    if (e = `strict mode: ${e}`, r === !0)
      throw new Error(e);
    t.self.logger.warn(e);
  }
}
F.checkStrictMode = qf;
var ct = {};
Object.defineProperty(ct, "__esModule", { value: !0 });
const qe = oe, y$ = {
  // validation function arguments
  data: new qe.Name("data"),
  // data passed to validation function
  // args passed from referencing schema
  valCxt: new qe.Name("valCxt"),
  // validation/data context - should not be used directly, it is destructured to the names below
  instancePath: new qe.Name("instancePath"),
  parentData: new qe.Name("parentData"),
  parentDataProperty: new qe.Name("parentDataProperty"),
  rootData: new qe.Name("rootData"),
  // root data - same as the data passed to the first/top validation function
  dynamicAnchors: new qe.Name("dynamicAnchors"),
  // used to support recursiveRef and dynamicRef
  // function scoped variables
  vErrors: new qe.Name("vErrors"),
  // null or array of validation errors
  errors: new qe.Name("errors"),
  // counter of validation errors
  this: new qe.Name("this"),
  // "globals"
  self: new qe.Name("self"),
  scope: new qe.Name("scope"),
  // JTD serialize/parse name for JSON string and position
  json: new qe.Name("json"),
  jsonPos: new qe.Name("jsonPos"),
  jsonLen: new qe.Name("jsonLen"),
  jsonPart: new qe.Name("jsonPart")
};
ct.default = y$;
(function(t) {
  Object.defineProperty(t, "__esModule", { value: !0 }), t.extendErrors = t.resetErrorsCount = t.reportExtraError = t.reportError = t.keyword$DataError = t.keywordError = void 0;
  const e = oe, r = F, n = ct;
  t.keywordError = {
    message: ({ keyword: y }) => (0, e.str)`must pass "${y}" keyword validation`
  }, t.keyword$DataError = {
    message: ({ keyword: y, schemaType: m }) => m ? (0, e.str)`"${y}" keyword must be ${m} ($data)` : (0, e.str)`"${y}" keyword is invalid ($data)`
  };
  function s(y, m = t.keywordError, v, P) {
    const { it: R } = y, { gen: N, compositeRule: D, allErrors: L } = R, de = f(y, m, v);
    P ?? (D || L) ? c(N, de) : d(R, (0, e._)`[${de}]`);
  }
  t.reportError = s;
  function a(y, m = t.keywordError, v) {
    const { it: P } = y, { gen: R, compositeRule: N, allErrors: D } = P, L = f(y, m, v);
    c(R, L), N || D || d(P, n.default.vErrors);
  }
  t.reportExtraError = a;
  function o(y, m) {
    y.assign(n.default.errors, m), y.if((0, e._)`${n.default.vErrors} !== null`, () => y.if(m, () => y.assign((0, e._)`${n.default.vErrors}.length`, m), () => y.assign(n.default.vErrors, null)));
  }
  t.resetErrorsCount = o;
  function i({ gen: y, keyword: m, schemaValue: v, data: P, errsCount: R, it: N }) {
    if (R === void 0)
      throw new Error("ajv implementation error");
    const D = y.name("err");
    y.forRange("i", R, n.default.errors, (L) => {
      y.const(D, (0, e._)`${n.default.vErrors}[${L}]`), y.if((0, e._)`${D}.instancePath === undefined`, () => y.assign((0, e._)`${D}.instancePath`, (0, e.strConcat)(n.default.instancePath, N.errorPath))), y.assign((0, e._)`${D}.schemaPath`, (0, e.str)`${N.errSchemaPath}/${m}`), N.opts.verbose && (y.assign((0, e._)`${D}.schema`, v), y.assign((0, e._)`${D}.data`, P));
    });
  }
  t.extendErrors = i;
  function c(y, m) {
    const v = y.const("err", m);
    y.if((0, e._)`${n.default.vErrors} === null`, () => y.assign(n.default.vErrors, (0, e._)`[${v}]`), (0, e._)`${n.default.vErrors}.push(${v})`), y.code((0, e._)`${n.default.errors}++`);
  }
  function d(y, m) {
    const { gen: v, validateName: P, schemaEnv: R } = y;
    R.$async ? v.throw((0, e._)`new ${y.ValidationError}(${m})`) : (v.assign((0, e._)`${P}.errors`, m), v.return(!1));
  }
  const l = {
    keyword: new e.Name("keyword"),
    schemaPath: new e.Name("schemaPath"),
    // also used in JTD errors
    params: new e.Name("params"),
    propertyName: new e.Name("propertyName"),
    message: new e.Name("message"),
    schema: new e.Name("schema"),
    parentSchema: new e.Name("parentSchema")
  };
  function f(y, m, v) {
    const { createErrors: P } = y.it;
    return P === !1 ? (0, e._)`{}` : _(y, m, v);
  }
  function _(y, m, v = {}) {
    const { gen: P, it: R } = y, N = [
      p(R, v),
      w(y, v)
    ];
    return $(y, m, N), P.object(...N);
  }
  function p({ errorPath: y }, { instancePath: m }) {
    const v = m ? (0, e.str)`${y}${(0, r.getErrorPath)(m, r.Type.Str)}` : y;
    return [n.default.instancePath, (0, e.strConcat)(n.default.instancePath, v)];
  }
  function w({ keyword: y, it: { errSchemaPath: m } }, { schemaPath: v, parentSchema: P }) {
    let R = P ? m : (0, e.str)`${m}/${y}`;
    return v && (R = (0, e.str)`${R}${(0, r.getErrorPath)(v, r.Type.Str)}`), [l.schemaPath, R];
  }
  function $(y, { params: m, message: v }, P) {
    const { keyword: R, data: N, schemaValue: D, it: L } = y, { opts: de, propertyName: Z, topSchemaRef: ne, schemaPath: M } = L;
    P.push([l.keyword, R], [l.params, typeof m == "function" ? m(y) : m || (0, e._)`{}`]), de.messages && P.push([l.message, typeof v == "function" ? v(y) : v]), de.verbose && P.push([l.schema, D], [l.parentSchema, (0, e._)`${ne}${M}`], [n.default.data, N]), Z && P.push([l.propertyName, Z]);
  }
})(Ps);
Object.defineProperty(bn, "__esModule", { value: !0 });
bn.boolOrEmptySchema = bn.topBoolOrEmptySchema = void 0;
const $$ = Ps, g$ = oe, _$ = ct, v$ = {
  message: "boolean schema is false"
};
function w$(t) {
  const { gen: e, schema: r, validateName: n } = t;
  r === !1 ? zf(t, !1) : typeof r == "object" && r.$async === !0 ? e.return(_$.default.data) : (e.assign((0, g$._)`${n}.errors`, null), e.return(!0));
}
bn.topBoolOrEmptySchema = w$;
function b$(t, e) {
  const { gen: r, schema: n } = t;
  n === !1 ? (r.var(e, !1), zf(t)) : r.var(e, !0);
}
bn.boolOrEmptySchema = b$;
function zf(t, e) {
  const { gen: r, data: n } = t, s = {
    gen: r,
    keyword: "false schema",
    data: n,
    schema: !1,
    schemaCode: !1,
    schemaValue: !1,
    params: {},
    it: t
  };
  (0, $$.reportError)(s, v$, void 0, e);
}
var Oe = {}, Hr = {};
Object.defineProperty(Hr, "__esModule", { value: !0 });
Hr.getRules = Hr.isJSONType = void 0;
const E$ = ["string", "number", "integer", "boolean", "null", "object", "array"], S$ = new Set(E$);
function P$(t) {
  return typeof t == "string" && S$.has(t);
}
Hr.isJSONType = P$;
function R$() {
  const t = {
    number: { type: "number", rules: [] },
    string: { type: "string", rules: [] },
    array: { type: "array", rules: [] },
    object: { type: "object", rules: [] }
  };
  return {
    types: { ...t, integer: !0, boolean: !0, null: !0 },
    rules: [{ rules: [] }, t.number, t.string, t.array, t.object],
    post: { rules: [] },
    all: {},
    keywords: {}
  };
}
Hr.getRules = R$;
var zt = {};
Object.defineProperty(zt, "__esModule", { value: !0 });
zt.shouldUseRule = zt.shouldUseGroup = zt.schemaHasRulesForType = void 0;
function O$({ schema: t, self: e }, r) {
  const n = e.RULES.types[r];
  return n && n !== !0 && Kf(t, n);
}
zt.schemaHasRulesForType = O$;
function Kf(t, e) {
  return e.rules.some((r) => Gf(t, r));
}
zt.shouldUseGroup = Kf;
function Gf(t, e) {
  var r;
  return t[e.keyword] !== void 0 || ((r = e.definition.implements) === null || r === void 0 ? void 0 : r.some((n) => t[n] !== void 0));
}
zt.shouldUseRule = Gf;
Object.defineProperty(Oe, "__esModule", { value: !0 });
Oe.reportTypeError = Oe.checkDataTypes = Oe.checkDataType = Oe.coerceAndCheckDataType = Oe.getJSONTypes = Oe.getSchemaTypes = Oe.DataType = void 0;
const I$ = Hr, N$ = zt, T$ = Ps, ie = oe, Bf = F;
var $n;
(function(t) {
  t[t.Correct = 0] = "Correct", t[t.Wrong = 1] = "Wrong";
})($n || (Oe.DataType = $n = {}));
function k$(t) {
  const e = Hf(t.type);
  if (e.includes("null")) {
    if (t.nullable === !1)
      throw new Error("type: null contradicts nullable: false");
  } else {
    if (!e.length && t.nullable !== void 0)
      throw new Error('"nullable" cannot be used without "type"');
    t.nullable === !0 && e.push("null");
  }
  return e;
}
Oe.getSchemaTypes = k$;
function Hf(t) {
  const e = Array.isArray(t) ? t : t ? [t] : [];
  if (e.every(I$.isJSONType))
    return e;
  throw new Error("type must be JSONType or JSONType[]: " + e.join(","));
}
Oe.getJSONTypes = Hf;
function A$(t, e) {
  const { gen: r, data: n, opts: s } = t, a = C$(e, s.coerceTypes), o = e.length > 0 && !(a.length === 0 && e.length === 1 && (0, N$.schemaHasRulesForType)(t, e[0]));
  if (o) {
    const i = Qi(e, n, s.strictNumbers, $n.Wrong);
    r.if(i, () => {
      a.length ? j$(t, e, a) : Zi(t);
    });
  }
  return o;
}
Oe.coerceAndCheckDataType = A$;
const Wf = /* @__PURE__ */ new Set(["string", "number", "integer", "boolean", "null"]);
function C$(t, e) {
  return e ? t.filter((r) => Wf.has(r) || e === "array" && r === "array") : [];
}
function j$(t, e, r) {
  const { gen: n, data: s, opts: a } = t, o = n.let("dataType", (0, ie._)`typeof ${s}`), i = n.let("coerced", (0, ie._)`undefined`);
  a.coerceTypes === "array" && n.if((0, ie._)`${o} == 'object' && Array.isArray(${s}) && ${s}.length == 1`, () => n.assign(s, (0, ie._)`${s}[0]`).assign(o, (0, ie._)`typeof ${s}`).if(Qi(e, s, a.strictNumbers), () => n.assign(i, s))), n.if((0, ie._)`${i} !== undefined`);
  for (const d of r)
    (Wf.has(d) || d === "array" && a.coerceTypes === "array") && c(d);
  n.else(), Zi(t), n.endIf(), n.if((0, ie._)`${i} !== undefined`, () => {
    n.assign(s, i), M$(t, i);
  });
  function c(d) {
    switch (d) {
      case "string":
        n.elseIf((0, ie._)`${o} == "number" || ${o} == "boolean"`).assign(i, (0, ie._)`"" + ${s}`).elseIf((0, ie._)`${s} === null`).assign(i, (0, ie._)`""`);
        return;
      case "number":
        n.elseIf((0, ie._)`${o} == "boolean" || ${s} === null
              || (${o} == "string" && ${s} && ${s} == +${s})`).assign(i, (0, ie._)`+${s}`);
        return;
      case "integer":
        n.elseIf((0, ie._)`${o} === "boolean" || ${s} === null
              || (${o} === "string" && ${s} && ${s} == +${s} && !(${s} % 1))`).assign(i, (0, ie._)`+${s}`);
        return;
      case "boolean":
        n.elseIf((0, ie._)`${s} === "false" || ${s} === 0 || ${s} === null`).assign(i, !1).elseIf((0, ie._)`${s} === "true" || ${s} === 1`).assign(i, !0);
        return;
      case "null":
        n.elseIf((0, ie._)`${s} === "" || ${s} === 0 || ${s} === false`), n.assign(i, null);
        return;
      case "array":
        n.elseIf((0, ie._)`${o} === "string" || ${o} === "number"
              || ${o} === "boolean" || ${s} === null`).assign(i, (0, ie._)`[${s}]`);
    }
  }
}
function M$({ gen: t, parentData: e, parentDataProperty: r }, n) {
  t.if((0, ie._)`${e} !== undefined`, () => t.assign((0, ie._)`${e}[${r}]`, n));
}
function pi(t, e, r, n = $n.Correct) {
  const s = n === $n.Correct ? ie.operators.EQ : ie.operators.NEQ;
  let a;
  switch (t) {
    case "null":
      return (0, ie._)`${e} ${s} null`;
    case "array":
      a = (0, ie._)`Array.isArray(${e})`;
      break;
    case "object":
      a = (0, ie._)`${e} && typeof ${e} == "object" && !Array.isArray(${e})`;
      break;
    case "integer":
      a = o((0, ie._)`!(${e} % 1) && !isNaN(${e})`);
      break;
    case "number":
      a = o();
      break;
    default:
      return (0, ie._)`typeof ${e} ${s} ${t}`;
  }
  return n === $n.Correct ? a : (0, ie.not)(a);
  function o(i = ie.nil) {
    return (0, ie.and)((0, ie._)`typeof ${e} == "number"`, i, r ? (0, ie._)`isFinite(${e})` : ie.nil);
  }
}
Oe.checkDataType = pi;
function Qi(t, e, r, n) {
  if (t.length === 1)
    return pi(t[0], e, r, n);
  let s;
  const a = (0, Bf.toHash)(t);
  if (a.array && a.object) {
    const o = (0, ie._)`typeof ${e} != "object"`;
    s = a.null ? o : (0, ie._)`!${e} || ${o}`, delete a.null, delete a.array, delete a.object;
  } else
    s = ie.nil;
  a.number && delete a.integer;
  for (const o in a)
    s = (0, ie.and)(s, pi(o, e, r, n));
  return s;
}
Oe.checkDataTypes = Qi;
const D$ = {
  message: ({ schema: t }) => `must be ${t}`,
  params: ({ schema: t, schemaValue: e }) => typeof t == "string" ? (0, ie._)`{type: ${t}}` : (0, ie._)`{type: ${e}}`
};
function Zi(t) {
  const e = L$(t);
  (0, T$.reportError)(e, D$);
}
Oe.reportTypeError = Zi;
function L$(t) {
  const { gen: e, data: r, schema: n } = t, s = (0, Bf.schemaRefOrVal)(t, n, "type");
  return {
    gen: e,
    keyword: "type",
    data: r,
    schema: n.type,
    schemaCode: s,
    schemaValue: s,
    parentSchema: n,
    params: {},
    it: t
  };
}
var ro = {};
Object.defineProperty(ro, "__esModule", { value: !0 });
ro.assignDefaults = void 0;
const Qr = oe, F$ = F;
function V$(t, e) {
  const { properties: r, items: n } = t.schema;
  if (e === "object" && r)
    for (const s in r)
      Au(t, s, r[s].default);
  else e === "array" && Array.isArray(n) && n.forEach((s, a) => Au(t, a, s.default));
}
ro.assignDefaults = V$;
function Au(t, e, r) {
  const { gen: n, compositeRule: s, data: a, opts: o } = t;
  if (r === void 0)
    return;
  const i = (0, Qr._)`${a}${(0, Qr.getProperty)(e)}`;
  if (s) {
    (0, F$.checkStrictMode)(t, `default is ignored for: ${i}`);
    return;
  }
  let c = (0, Qr._)`${i} === undefined`;
  o.useDefaults === "empty" && (c = (0, Qr._)`${c} || ${i} === null || ${i} === ""`), n.if(c, (0, Qr._)`${i} = ${(0, Qr.stringify)(r)}`);
}
var jt = {}, fe = {};
Object.defineProperty(fe, "__esModule", { value: !0 });
fe.validateUnion = fe.validateArray = fe.usePattern = fe.callValidateCode = fe.schemaProperties = fe.allSchemaProperties = fe.noPropertyInData = fe.propertyInData = fe.isOwnProperty = fe.hasPropFunc = fe.reportMissingProp = fe.checkMissingProp = fe.checkReportMissingProp = void 0;
const _e = oe, ec = F, Zt = ct, x$ = F;
function U$(t, e) {
  const { gen: r, data: n, it: s } = t;
  r.if(rc(r, n, e, s.opts.ownProperties), () => {
    t.setParams({ missingProperty: (0, _e._)`${e}` }, !0), t.error();
  });
}
fe.checkReportMissingProp = U$;
function q$({ gen: t, data: e, it: { opts: r } }, n, s) {
  return (0, _e.or)(...n.map((a) => (0, _e.and)(rc(t, e, a, r.ownProperties), (0, _e._)`${s} = ${a}`)));
}
fe.checkMissingProp = q$;
function z$(t, e) {
  t.setParams({ missingProperty: e }, !0), t.error();
}
fe.reportMissingProp = z$;
function Jf(t) {
  return t.scopeValue("func", {
    // eslint-disable-next-line @typescript-eslint/unbound-method
    ref: Object.prototype.hasOwnProperty,
    code: (0, _e._)`Object.prototype.hasOwnProperty`
  });
}
fe.hasPropFunc = Jf;
function tc(t, e, r) {
  return (0, _e._)`${Jf(t)}.call(${e}, ${r})`;
}
fe.isOwnProperty = tc;
function K$(t, e, r, n) {
  const s = (0, _e._)`${e}${(0, _e.getProperty)(r)} !== undefined`;
  return n ? (0, _e._)`${s} && ${tc(t, e, r)}` : s;
}
fe.propertyInData = K$;
function rc(t, e, r, n) {
  const s = (0, _e._)`${e}${(0, _e.getProperty)(r)} === undefined`;
  return n ? (0, _e.or)(s, (0, _e.not)(tc(t, e, r))) : s;
}
fe.noPropertyInData = rc;
function Xf(t) {
  return t ? Object.keys(t).filter((e) => e !== "__proto__") : [];
}
fe.allSchemaProperties = Xf;
function G$(t, e) {
  return Xf(e).filter((r) => !(0, ec.alwaysValidSchema)(t, e[r]));
}
fe.schemaProperties = G$;
function B$({ schemaCode: t, data: e, it: { gen: r, topSchemaRef: n, schemaPath: s, errorPath: a }, it: o }, i, c, d) {
  const l = d ? (0, _e._)`${t}, ${e}, ${n}${s}` : e, f = [
    [Zt.default.instancePath, (0, _e.strConcat)(Zt.default.instancePath, a)],
    [Zt.default.parentData, o.parentData],
    [Zt.default.parentDataProperty, o.parentDataProperty],
    [Zt.default.rootData, Zt.default.rootData]
  ];
  o.opts.dynamicRef && f.push([Zt.default.dynamicAnchors, Zt.default.dynamicAnchors]);
  const _ = (0, _e._)`${l}, ${r.object(...f)}`;
  return c !== _e.nil ? (0, _e._)`${i}.call(${c}, ${_})` : (0, _e._)`${i}(${_})`;
}
fe.callValidateCode = B$;
const H$ = (0, _e._)`new RegExp`;
function W$({ gen: t, it: { opts: e } }, r) {
  const n = e.unicodeRegExp ? "u" : "", { regExp: s } = e.code, a = s(r, n);
  return t.scopeValue("pattern", {
    key: a.toString(),
    ref: a,
    code: (0, _e._)`${s.code === "new RegExp" ? H$ : (0, x$.useFunc)(t, s)}(${r}, ${n})`
  });
}
fe.usePattern = W$;
function J$(t) {
  const { gen: e, data: r, keyword: n, it: s } = t, a = e.name("valid");
  if (s.allErrors) {
    const i = e.let("valid", !0);
    return o(() => e.assign(i, !1)), i;
  }
  return e.var(a, !0), o(() => e.break()), a;
  function o(i) {
    const c = e.const("len", (0, _e._)`${r}.length`);
    e.forRange("i", 0, c, (d) => {
      t.subschema({
        keyword: n,
        dataProp: d,
        dataPropType: ec.Type.Num
      }, a), e.if((0, _e.not)(a), i);
    });
  }
}
fe.validateArray = J$;
function X$(t) {
  const { gen: e, schema: r, keyword: n, it: s } = t;
  if (!Array.isArray(r))
    throw new Error("ajv implementation error");
  if (r.some((c) => (0, ec.alwaysValidSchema)(s, c)) && !s.opts.unevaluated)
    return;
  const o = e.let("valid", !1), i = e.name("_valid");
  e.block(() => r.forEach((c, d) => {
    const l = t.subschema({
      keyword: n,
      schemaProp: d,
      compositeRule: !0
    }, i);
    e.assign(o, (0, _e._)`${o} || ${i}`), t.mergeValidEvaluated(l, i) || e.if((0, _e.not)(o));
  })), t.result(o, () => t.reset(), () => t.error(!0));
}
fe.validateUnion = X$;
Object.defineProperty(jt, "__esModule", { value: !0 });
jt.validateKeywordUsage = jt.validSchemaType = jt.funcKeywordCode = jt.macroKeywordCode = void 0;
const He = oe, jr = ct, Y$ = fe, Q$ = Ps;
function Z$(t, e) {
  const { gen: r, keyword: n, schema: s, parentSchema: a, it: o } = t, i = e.macro.call(o.self, s, a, o), c = Yf(r, n, i);
  o.opts.validateSchema !== !1 && o.self.validateSchema(i, !0);
  const d = r.name("valid");
  t.subschema({
    schema: i,
    schemaPath: He.nil,
    errSchemaPath: `${o.errSchemaPath}/${n}`,
    topSchemaRef: c,
    compositeRule: !0
  }, d), t.pass(d, () => t.error(!0));
}
jt.macroKeywordCode = Z$;
function eg(t, e) {
  var r;
  const { gen: n, keyword: s, schema: a, parentSchema: o, $data: i, it: c } = t;
  rg(c, e);
  const d = !i && e.compile ? e.compile.call(c.self, a, o, c) : e.validate, l = Yf(n, s, d), f = n.let("valid");
  t.block$data(f, _), t.ok((r = e.valid) !== null && r !== void 0 ? r : f);
  function _() {
    if (e.errors === !1)
      $(), e.modifying && Cu(t), y(() => t.error());
    else {
      const m = e.async ? p() : w();
      e.modifying && Cu(t), y(() => tg(t, m));
    }
  }
  function p() {
    const m = n.let("ruleErrs", null);
    return n.try(() => $((0, He._)`await `), (v) => n.assign(f, !1).if((0, He._)`${v} instanceof ${c.ValidationError}`, () => n.assign(m, (0, He._)`${v}.errors`), () => n.throw(v))), m;
  }
  function w() {
    const m = (0, He._)`${l}.errors`;
    return n.assign(m, null), $(He.nil), m;
  }
  function $(m = e.async ? (0, He._)`await ` : He.nil) {
    const v = c.opts.passContext ? jr.default.this : jr.default.self, P = !("compile" in e && !i || e.schema === !1);
    n.assign(f, (0, He._)`${m}${(0, Y$.callValidateCode)(t, l, v, P)}`, e.modifying);
  }
  function y(m) {
    var v;
    n.if((0, He.not)((v = e.valid) !== null && v !== void 0 ? v : f), m);
  }
}
jt.funcKeywordCode = eg;
function Cu(t) {
  const { gen: e, data: r, it: n } = t;
  e.if(n.parentData, () => e.assign(r, (0, He._)`${n.parentData}[${n.parentDataProperty}]`));
}
function tg(t, e) {
  const { gen: r } = t;
  r.if((0, He._)`Array.isArray(${e})`, () => {
    r.assign(jr.default.vErrors, (0, He._)`${jr.default.vErrors} === null ? ${e} : ${jr.default.vErrors}.concat(${e})`).assign(jr.default.errors, (0, He._)`${jr.default.vErrors}.length`), (0, Q$.extendErrors)(t);
  }, () => t.error());
}
function rg({ schemaEnv: t }, e) {
  if (e.async && !t.$async)
    throw new Error("async keyword in sync schema");
}
function Yf(t, e, r) {
  if (r === void 0)
    throw new Error(`keyword "${e}" failed to compile`);
  return t.scopeValue("keyword", typeof r == "function" ? { ref: r } : { ref: r, code: (0, He.stringify)(r) });
}
function ng(t, e, r = !1) {
  return !e.length || e.some((n) => n === "array" ? Array.isArray(t) : n === "object" ? t && typeof t == "object" && !Array.isArray(t) : typeof t == n || r && typeof t > "u");
}
jt.validSchemaType = ng;
function sg({ schema: t, opts: e, self: r, errSchemaPath: n }, s, a) {
  if (Array.isArray(s.keyword) ? !s.keyword.includes(a) : s.keyword !== a)
    throw new Error("ajv implementation error");
  const o = s.dependencies;
  if (o != null && o.some((i) => !Object.prototype.hasOwnProperty.call(t, i)))
    throw new Error(`parent schema must have dependencies of ${a}: ${o.join(",")}`);
  if (s.validateSchema && !s.validateSchema(t[a])) {
    const c = `keyword "${a}" value is invalid at path "${n}": ` + r.errorsText(s.validateSchema.errors);
    if (e.validateSchema === "log")
      r.logger.error(c);
    else
      throw new Error(c);
  }
}
jt.validateKeywordUsage = sg;
var fr = {};
Object.defineProperty(fr, "__esModule", { value: !0 });
fr.extendSubschemaMode = fr.extendSubschemaData = fr.getSubschema = void 0;
const At = oe, Qf = F;
function ag(t, { keyword: e, schemaProp: r, schema: n, schemaPath: s, errSchemaPath: a, topSchemaRef: o }) {
  if (e !== void 0 && n !== void 0)
    throw new Error('both "keyword" and "schema" passed, only one allowed');
  if (e !== void 0) {
    const i = t.schema[e];
    return r === void 0 ? {
      schema: i,
      schemaPath: (0, At._)`${t.schemaPath}${(0, At.getProperty)(e)}`,
      errSchemaPath: `${t.errSchemaPath}/${e}`
    } : {
      schema: i[r],
      schemaPath: (0, At._)`${t.schemaPath}${(0, At.getProperty)(e)}${(0, At.getProperty)(r)}`,
      errSchemaPath: `${t.errSchemaPath}/${e}/${(0, Qf.escapeFragment)(r)}`
    };
  }
  if (n !== void 0) {
    if (s === void 0 || a === void 0 || o === void 0)
      throw new Error('"schemaPath", "errSchemaPath" and "topSchemaRef" are required with "schema"');
    return {
      schema: n,
      schemaPath: s,
      topSchemaRef: o,
      errSchemaPath: a
    };
  }
  throw new Error('either "keyword" or "schema" must be passed');
}
fr.getSubschema = ag;
function og(t, e, { dataProp: r, dataPropType: n, data: s, dataTypes: a, propertyName: o }) {
  if (s !== void 0 && r !== void 0)
    throw new Error('both "data" and "dataProp" passed, only one allowed');
  const { gen: i } = e;
  if (r !== void 0) {
    const { errorPath: d, dataPathArr: l, opts: f } = e, _ = i.let("data", (0, At._)`${e.data}${(0, At.getProperty)(r)}`, !0);
    c(_), t.errorPath = (0, At.str)`${d}${(0, Qf.getErrorPath)(r, n, f.jsPropertySyntax)}`, t.parentDataProperty = (0, At._)`${r}`, t.dataPathArr = [...l, t.parentDataProperty];
  }
  if (s !== void 0) {
    const d = s instanceof At.Name ? s : i.let("data", s, !0);
    c(d), o !== void 0 && (t.propertyName = o);
  }
  a && (t.dataTypes = a);
  function c(d) {
    t.data = d, t.dataLevel = e.dataLevel + 1, t.dataTypes = [], e.definedProperties = /* @__PURE__ */ new Set(), t.parentData = e.data, t.dataNames = [...e.dataNames, d];
  }
}
fr.extendSubschemaData = og;
function ig(t, { jtdDiscriminator: e, jtdMetadata: r, compositeRule: n, createErrors: s, allErrors: a }) {
  n !== void 0 && (t.compositeRule = n), s !== void 0 && (t.createErrors = s), a !== void 0 && (t.allErrors = a), t.jtdDiscriminator = e, t.jtdMetadata = r;
}
fr.extendSubschemaMode = ig;
var Le = {}, no = function t(e, r) {
  if (e === r) return !0;
  if (e && r && typeof e == "object" && typeof r == "object") {
    if (e.constructor !== r.constructor) return !1;
    var n, s, a;
    if (Array.isArray(e)) {
      if (n = e.length, n != r.length) return !1;
      for (s = n; s-- !== 0; )
        if (!t(e[s], r[s])) return !1;
      return !0;
    }
    if (e.constructor === RegExp) return e.source === r.source && e.flags === r.flags;
    if (e.valueOf !== Object.prototype.valueOf) return e.valueOf() === r.valueOf();
    if (e.toString !== Object.prototype.toString) return e.toString() === r.toString();
    if (a = Object.keys(e), n = a.length, n !== Object.keys(r).length) return !1;
    for (s = n; s-- !== 0; )
      if (!Object.prototype.hasOwnProperty.call(r, a[s])) return !1;
    for (s = n; s-- !== 0; ) {
      var o = a[s];
      if (!t(e[o], r[o])) return !1;
    }
    return !0;
  }
  return e !== e && r !== r;
}, Zf = { exports: {} }, ur = Zf.exports = function(t, e, r) {
  typeof e == "function" && (r = e, e = {}), r = e.cb || r;
  var n = typeof r == "function" ? r : r.pre || function() {
  }, s = r.post || function() {
  };
  fa(e, n, s, t, "", t);
};
ur.keywords = {
  additionalItems: !0,
  items: !0,
  contains: !0,
  additionalProperties: !0,
  propertyNames: !0,
  not: !0,
  if: !0,
  then: !0,
  else: !0
};
ur.arrayKeywords = {
  items: !0,
  allOf: !0,
  anyOf: !0,
  oneOf: !0
};
ur.propsKeywords = {
  $defs: !0,
  definitions: !0,
  properties: !0,
  patternProperties: !0,
  dependencies: !0
};
ur.skipKeywords = {
  default: !0,
  enum: !0,
  const: !0,
  required: !0,
  maximum: !0,
  minimum: !0,
  exclusiveMaximum: !0,
  exclusiveMinimum: !0,
  multipleOf: !0,
  maxLength: !0,
  minLength: !0,
  pattern: !0,
  format: !0,
  maxItems: !0,
  minItems: !0,
  uniqueItems: !0,
  maxProperties: !0,
  minProperties: !0
};
function fa(t, e, r, n, s, a, o, i, c, d) {
  if (n && typeof n == "object" && !Array.isArray(n)) {
    e(n, s, a, o, i, c, d);
    for (var l in n) {
      var f = n[l];
      if (Array.isArray(f)) {
        if (l in ur.arrayKeywords)
          for (var _ = 0; _ < f.length; _++)
            fa(t, e, r, f[_], s + "/" + l + "/" + _, a, s, l, n, _);
      } else if (l in ur.propsKeywords) {
        if (f && typeof f == "object")
          for (var p in f)
            fa(t, e, r, f[p], s + "/" + l + "/" + cg(p), a, s, l, n, p);
      } else (l in ur.keywords || t.allKeys && !(l in ur.skipKeywords)) && fa(t, e, r, f, s + "/" + l, a, s, l, n);
    }
    r(n, s, a, o, i, c, d);
  }
}
function cg(t) {
  return t.replace(/~/g, "~0").replace(/\//g, "~1");
}
var lg = Zf.exports;
Object.defineProperty(Le, "__esModule", { value: !0 });
Le.getSchemaRefs = Le.resolveUrl = Le.normalizeId = Le._getFullPath = Le.getFullPath = Le.inlineRef = void 0;
const ug = F, dg = no, fg = lg, hg = /* @__PURE__ */ new Set([
  "type",
  "format",
  "pattern",
  "maxLength",
  "minLength",
  "maxProperties",
  "minProperties",
  "maxItems",
  "minItems",
  "maximum",
  "minimum",
  "uniqueItems",
  "multipleOf",
  "required",
  "enum",
  "const"
]);
function mg(t, e = !0) {
  return typeof t == "boolean" ? !0 : e === !0 ? !yi(t) : e ? eh(t) <= e : !1;
}
Le.inlineRef = mg;
const pg = /* @__PURE__ */ new Set([
  "$ref",
  "$recursiveRef",
  "$recursiveAnchor",
  "$dynamicRef",
  "$dynamicAnchor"
]);
function yi(t) {
  for (const e in t) {
    if (pg.has(e))
      return !0;
    const r = t[e];
    if (Array.isArray(r) && r.some(yi) || typeof r == "object" && yi(r))
      return !0;
  }
  return !1;
}
function eh(t) {
  let e = 0;
  for (const r in t) {
    if (r === "$ref")
      return 1 / 0;
    if (e++, !hg.has(r) && (typeof t[r] == "object" && (0, ug.eachItem)(t[r], (n) => e += eh(n)), e === 1 / 0))
      return 1 / 0;
  }
  return e;
}
function th(t, e = "", r) {
  r !== !1 && (e = gn(e));
  const n = t.parse(e);
  return rh(t, n);
}
Le.getFullPath = th;
function rh(t, e) {
  return t.serialize(e).split("#")[0] + "#";
}
Le._getFullPath = rh;
const yg = /#\/?$/;
function gn(t) {
  return t ? t.replace(yg, "") : "";
}
Le.normalizeId = gn;
function $g(t, e, r) {
  return r = gn(r), t.resolve(e, r);
}
Le.resolveUrl = $g;
const gg = /^[a-z_][-a-z0-9._]*$/i;
function _g(t, e) {
  if (typeof t == "boolean")
    return {};
  const { schemaId: r, uriResolver: n } = this.opts, s = gn(t[r] || e), a = { "": s }, o = th(n, s, !1), i = {}, c = /* @__PURE__ */ new Set();
  return fg(t, { allKeys: !0 }, (f, _, p, w) => {
    if (w === void 0)
      return;
    const $ = o + _;
    let y = a[w];
    typeof f[r] == "string" && (y = m.call(this, f[r])), v.call(this, f.$anchor), v.call(this, f.$dynamicAnchor), a[_] = y;
    function m(P) {
      const R = this.opts.uriResolver.resolve;
      if (P = gn(y ? R(y, P) : P), c.has(P))
        throw l(P);
      c.add(P);
      let N = this.refs[P];
      return typeof N == "string" && (N = this.refs[N]), typeof N == "object" ? d(f, N.schema, P) : P !== gn($) && (P[0] === "#" ? (d(f, i[P], P), i[P] = f) : this.refs[P] = $), P;
    }
    function v(P) {
      if (typeof P == "string") {
        if (!gg.test(P))
          throw new Error(`invalid anchor "${P}"`);
        m.call(this, `#${P}`);
      }
    }
  }), i;
  function d(f, _, p) {
    if (_ !== void 0 && !dg(f, _))
      throw l(p);
  }
  function l(f) {
    return new Error(`reference "${f}" resolves to more than one schema`);
  }
}
Le.getSchemaRefs = _g;
Object.defineProperty(Et, "__esModule", { value: !0 });
Et.getData = Et.KeywordCxt = Et.validateFunctionCode = void 0;
const nh = bn, ju = Oe, nc = zt, ka = Oe, vg = ro, is = jt, Lo = fr, H = oe, ee = ct, wg = Le, Kt = F, qn = Ps;
function bg(t) {
  if (oh(t) && (ih(t), ah(t))) {
    Pg(t);
    return;
  }
  sh(t, () => (0, nh.topBoolOrEmptySchema)(t));
}
Et.validateFunctionCode = bg;
function sh({ gen: t, validateName: e, schema: r, schemaEnv: n, opts: s }, a) {
  s.code.es5 ? t.func(e, (0, H._)`${ee.default.data}, ${ee.default.valCxt}`, n.$async, () => {
    t.code((0, H._)`"use strict"; ${Mu(r, s)}`), Sg(t, s), t.code(a);
  }) : t.func(e, (0, H._)`${ee.default.data}, ${Eg(s)}`, n.$async, () => t.code(Mu(r, s)).code(a));
}
function Eg(t) {
  return (0, H._)`{${ee.default.instancePath}="", ${ee.default.parentData}, ${ee.default.parentDataProperty}, ${ee.default.rootData}=${ee.default.data}${t.dynamicRef ? (0, H._)`, ${ee.default.dynamicAnchors}={}` : H.nil}}={}`;
}
function Sg(t, e) {
  t.if(ee.default.valCxt, () => {
    t.var(ee.default.instancePath, (0, H._)`${ee.default.valCxt}.${ee.default.instancePath}`), t.var(ee.default.parentData, (0, H._)`${ee.default.valCxt}.${ee.default.parentData}`), t.var(ee.default.parentDataProperty, (0, H._)`${ee.default.valCxt}.${ee.default.parentDataProperty}`), t.var(ee.default.rootData, (0, H._)`${ee.default.valCxt}.${ee.default.rootData}`), e.dynamicRef && t.var(ee.default.dynamicAnchors, (0, H._)`${ee.default.valCxt}.${ee.default.dynamicAnchors}`);
  }, () => {
    t.var(ee.default.instancePath, (0, H._)`""`), t.var(ee.default.parentData, (0, H._)`undefined`), t.var(ee.default.parentDataProperty, (0, H._)`undefined`), t.var(ee.default.rootData, ee.default.data), e.dynamicRef && t.var(ee.default.dynamicAnchors, (0, H._)`{}`);
  });
}
function Pg(t) {
  const { schema: e, opts: r, gen: n } = t;
  sh(t, () => {
    r.$comment && e.$comment && lh(t), Tg(t), n.let(ee.default.vErrors, null), n.let(ee.default.errors, 0), r.unevaluated && Rg(t), ch(t), Cg(t);
  });
}
function Rg(t) {
  const { gen: e, validateName: r } = t;
  t.evaluated = e.const("evaluated", (0, H._)`${r}.evaluated`), e.if((0, H._)`${t.evaluated}.dynamicProps`, () => e.assign((0, H._)`${t.evaluated}.props`, (0, H._)`undefined`)), e.if((0, H._)`${t.evaluated}.dynamicItems`, () => e.assign((0, H._)`${t.evaluated}.items`, (0, H._)`undefined`));
}
function Mu(t, e) {
  const r = typeof t == "object" && t[e.schemaId];
  return r && (e.code.source || e.code.process) ? (0, H._)`/*# sourceURL=${r} */` : H.nil;
}
function Og(t, e) {
  if (oh(t) && (ih(t), ah(t))) {
    Ig(t, e);
    return;
  }
  (0, nh.boolOrEmptySchema)(t, e);
}
function ah({ schema: t, self: e }) {
  if (typeof t == "boolean")
    return !t;
  for (const r in t)
    if (e.RULES.all[r])
      return !0;
  return !1;
}
function oh(t) {
  return typeof t.schema != "boolean";
}
function Ig(t, e) {
  const { schema: r, gen: n, opts: s } = t;
  s.$comment && r.$comment && lh(t), kg(t), Ag(t);
  const a = n.const("_errs", ee.default.errors);
  ch(t, a), n.var(e, (0, H._)`${a} === ${ee.default.errors}`);
}
function ih(t) {
  (0, Kt.checkUnknownRules)(t), Ng(t);
}
function ch(t, e) {
  if (t.opts.jtd)
    return Du(t, [], !1, e);
  const r = (0, ju.getSchemaTypes)(t.schema), n = (0, ju.coerceAndCheckDataType)(t, r);
  Du(t, r, !n, e);
}
function Ng(t) {
  const { schema: e, errSchemaPath: r, opts: n, self: s } = t;
  e.$ref && n.ignoreKeywordsWithRef && (0, Kt.schemaHasRulesButRef)(e, s.RULES) && s.logger.warn(`$ref: keywords ignored in schema at path "${r}"`);
}
function Tg(t) {
  const { schema: e, opts: r } = t;
  e.default !== void 0 && r.useDefaults && r.strictSchema && (0, Kt.checkStrictMode)(t, "default is ignored in the schema root");
}
function kg(t) {
  const e = t.schema[t.opts.schemaId];
  e && (t.baseId = (0, wg.resolveUrl)(t.opts.uriResolver, t.baseId, e));
}
function Ag(t) {
  if (t.schema.$async && !t.schemaEnv.$async)
    throw new Error("async schema in sync schema");
}
function lh({ gen: t, schemaEnv: e, schema: r, errSchemaPath: n, opts: s }) {
  const a = r.$comment;
  if (s.$comment === !0)
    t.code((0, H._)`${ee.default.self}.logger.log(${a})`);
  else if (typeof s.$comment == "function") {
    const o = (0, H.str)`${n}/$comment`, i = t.scopeValue("root", { ref: e.root });
    t.code((0, H._)`${ee.default.self}.opts.$comment(${a}, ${o}, ${i}.schema)`);
  }
}
function Cg(t) {
  const { gen: e, schemaEnv: r, validateName: n, ValidationError: s, opts: a } = t;
  r.$async ? e.if((0, H._)`${ee.default.errors} === 0`, () => e.return(ee.default.data), () => e.throw((0, H._)`new ${s}(${ee.default.vErrors})`)) : (e.assign((0, H._)`${n}.errors`, ee.default.vErrors), a.unevaluated && jg(t), e.return((0, H._)`${ee.default.errors} === 0`));
}
function jg({ gen: t, evaluated: e, props: r, items: n }) {
  r instanceof H.Name && t.assign((0, H._)`${e}.props`, r), n instanceof H.Name && t.assign((0, H._)`${e}.items`, n);
}
function Du(t, e, r, n) {
  const { gen: s, schema: a, data: o, allErrors: i, opts: c, self: d } = t, { RULES: l } = d;
  if (a.$ref && (c.ignoreKeywordsWithRef || !(0, Kt.schemaHasRulesButRef)(a, l))) {
    s.block(() => fh(t, "$ref", l.all.$ref.definition));
    return;
  }
  c.jtd || Mg(t, e), s.block(() => {
    for (const _ of l.rules)
      f(_);
    f(l.post);
  });
  function f(_) {
    (0, nc.shouldUseGroup)(a, _) && (_.type ? (s.if((0, ka.checkDataType)(_.type, o, c.strictNumbers)), Lu(t, _), e.length === 1 && e[0] === _.type && r && (s.else(), (0, ka.reportTypeError)(t)), s.endIf()) : Lu(t, _), i || s.if((0, H._)`${ee.default.errors} === ${n || 0}`));
  }
}
function Lu(t, e) {
  const { gen: r, schema: n, opts: { useDefaults: s } } = t;
  s && (0, vg.assignDefaults)(t, e.type), r.block(() => {
    for (const a of e.rules)
      (0, nc.shouldUseRule)(n, a) && fh(t, a.keyword, a.definition, e.type);
  });
}
function Mg(t, e) {
  t.schemaEnv.meta || !t.opts.strictTypes || (Dg(t, e), t.opts.allowUnionTypes || Lg(t, e), Fg(t, t.dataTypes));
}
function Dg(t, e) {
  if (e.length) {
    if (!t.dataTypes.length) {
      t.dataTypes = e;
      return;
    }
    e.forEach((r) => {
      uh(t.dataTypes, r) || sc(t, `type "${r}" not allowed by context "${t.dataTypes.join(",")}"`);
    }), xg(t, e);
  }
}
function Lg(t, e) {
  e.length > 1 && !(e.length === 2 && e.includes("null")) && sc(t, "use allowUnionTypes to allow union type keyword");
}
function Fg(t, e) {
  const r = t.self.RULES.all;
  for (const n in r) {
    const s = r[n];
    if (typeof s == "object" && (0, nc.shouldUseRule)(t.schema, s)) {
      const { type: a } = s.definition;
      a.length && !a.some((o) => Vg(e, o)) && sc(t, `missing type "${a.join(",")}" for keyword "${n}"`);
    }
  }
}
function Vg(t, e) {
  return t.includes(e) || e === "number" && t.includes("integer");
}
function uh(t, e) {
  return t.includes(e) || e === "integer" && t.includes("number");
}
function xg(t, e) {
  const r = [];
  for (const n of t.dataTypes)
    uh(e, n) ? r.push(n) : e.includes("integer") && n === "number" && r.push("integer");
  t.dataTypes = r;
}
function sc(t, e) {
  const r = t.schemaEnv.baseId + t.errSchemaPath;
  e += ` at "${r}" (strictTypes)`, (0, Kt.checkStrictMode)(t, e, t.opts.strictTypes);
}
let dh = class {
  constructor(e, r, n) {
    if ((0, is.validateKeywordUsage)(e, r, n), this.gen = e.gen, this.allErrors = e.allErrors, this.keyword = n, this.data = e.data, this.schema = e.schema[n], this.$data = r.$data && e.opts.$data && this.schema && this.schema.$data, this.schemaValue = (0, Kt.schemaRefOrVal)(e, this.schema, n, this.$data), this.schemaType = r.schemaType, this.parentSchema = e.schema, this.params = {}, this.it = e, this.def = r, this.$data)
      this.schemaCode = e.gen.const("vSchema", hh(this.$data, e));
    else if (this.schemaCode = this.schemaValue, !(0, is.validSchemaType)(this.schema, r.schemaType, r.allowUndefined))
      throw new Error(`${n} value must be ${JSON.stringify(r.schemaType)}`);
    ("code" in r ? r.trackErrors : r.errors !== !1) && (this.errsCount = e.gen.const("_errs", ee.default.errors));
  }
  result(e, r, n) {
    this.failResult((0, H.not)(e), r, n);
  }
  failResult(e, r, n) {
    this.gen.if(e), n ? n() : this.error(), r ? (this.gen.else(), r(), this.allErrors && this.gen.endIf()) : this.allErrors ? this.gen.endIf() : this.gen.else();
  }
  pass(e, r) {
    this.failResult((0, H.not)(e), void 0, r);
  }
  fail(e) {
    if (e === void 0) {
      this.error(), this.allErrors || this.gen.if(!1);
      return;
    }
    this.gen.if(e), this.error(), this.allErrors ? this.gen.endIf() : this.gen.else();
  }
  fail$data(e) {
    if (!this.$data)
      return this.fail(e);
    const { schemaCode: r } = this;
    this.fail((0, H._)`${r} !== undefined && (${(0, H.or)(this.invalid$data(), e)})`);
  }
  error(e, r, n) {
    if (r) {
      this.setParams(r), this._error(e, n), this.setParams({});
      return;
    }
    this._error(e, n);
  }
  _error(e, r) {
    (e ? qn.reportExtraError : qn.reportError)(this, this.def.error, r);
  }
  $dataError() {
    (0, qn.reportError)(this, this.def.$dataError || qn.keyword$DataError);
  }
  reset() {
    if (this.errsCount === void 0)
      throw new Error('add "trackErrors" to keyword definition');
    (0, qn.resetErrorsCount)(this.gen, this.errsCount);
  }
  ok(e) {
    this.allErrors || this.gen.if(e);
  }
  setParams(e, r) {
    r ? Object.assign(this.params, e) : this.params = e;
  }
  block$data(e, r, n = H.nil) {
    this.gen.block(() => {
      this.check$data(e, n), r();
    });
  }
  check$data(e = H.nil, r = H.nil) {
    if (!this.$data)
      return;
    const { gen: n, schemaCode: s, schemaType: a, def: o } = this;
    n.if((0, H.or)((0, H._)`${s} === undefined`, r)), e !== H.nil && n.assign(e, !0), (a.length || o.validateSchema) && (n.elseIf(this.invalid$data()), this.$dataError(), e !== H.nil && n.assign(e, !1)), n.else();
  }
  invalid$data() {
    const { gen: e, schemaCode: r, schemaType: n, def: s, it: a } = this;
    return (0, H.or)(o(), i());
    function o() {
      if (n.length) {
        if (!(r instanceof H.Name))
          throw new Error("ajv implementation error");
        const c = Array.isArray(n) ? n : [n];
        return (0, H._)`${(0, ka.checkDataTypes)(c, r, a.opts.strictNumbers, ka.DataType.Wrong)}`;
      }
      return H.nil;
    }
    function i() {
      if (s.validateSchema) {
        const c = e.scopeValue("validate$data", { ref: s.validateSchema });
        return (0, H._)`!${c}(${r})`;
      }
      return H.nil;
    }
  }
  subschema(e, r) {
    const n = (0, Lo.getSubschema)(this.it, e);
    (0, Lo.extendSubschemaData)(n, this.it, e), (0, Lo.extendSubschemaMode)(n, e);
    const s = { ...this.it, ...n, items: void 0, props: void 0 };
    return Og(s, r), s;
  }
  mergeEvaluated(e, r) {
    const { it: n, gen: s } = this;
    n.opts.unevaluated && (n.props !== !0 && e.props !== void 0 && (n.props = Kt.mergeEvaluated.props(s, e.props, n.props, r)), n.items !== !0 && e.items !== void 0 && (n.items = Kt.mergeEvaluated.items(s, e.items, n.items, r)));
  }
  mergeValidEvaluated(e, r) {
    const { it: n, gen: s } = this;
    if (n.opts.unevaluated && (n.props !== !0 || n.items !== !0))
      return s.if(r, () => this.mergeEvaluated(e, H.Name)), !0;
  }
};
Et.KeywordCxt = dh;
function fh(t, e, r, n) {
  const s = new dh(t, r, e);
  "code" in r ? r.code(s, n) : s.$data && r.validate ? (0, is.funcKeywordCode)(s, r) : "macro" in r ? (0, is.macroKeywordCode)(s, r) : (r.compile || r.validate) && (0, is.funcKeywordCode)(s, r);
}
const Ug = /^\/(?:[^~]|~0|~1)*$/, qg = /^([0-9]+)(#|\/(?:[^~]|~0|~1)*)?$/;
function hh(t, { dataLevel: e, dataNames: r, dataPathArr: n }) {
  let s, a;
  if (t === "")
    return ee.default.rootData;
  if (t[0] === "/") {
    if (!Ug.test(t))
      throw new Error(`Invalid JSON-pointer: ${t}`);
    s = t, a = ee.default.rootData;
  } else {
    const d = qg.exec(t);
    if (!d)
      throw new Error(`Invalid JSON-pointer: ${t}`);
    const l = +d[1];
    if (s = d[2], s === "#") {
      if (l >= e)
        throw new Error(c("property/index", l));
      return n[e - l];
    }
    if (l > e)
      throw new Error(c("data", l));
    if (a = r[e - l], !s)
      return a;
  }
  let o = a;
  const i = s.split("/");
  for (const d of i)
    d && (a = (0, H._)`${a}${(0, H.getProperty)((0, Kt.unescapeJsonPointer)(d))}`, o = (0, H._)`${o} && ${a}`);
  return o;
  function c(d, l) {
    return `Cannot access ${d} ${l} levels up, current level is ${e}`;
  }
}
Et.getData = hh;
var Rs = {};
Object.defineProperty(Rs, "__esModule", { value: !0 });
class zg extends Error {
  constructor(e) {
    super("validation failed"), this.errors = e, this.ajv = this.validation = !0;
  }
}
Rs.default = zg;
var On = {};
Object.defineProperty(On, "__esModule", { value: !0 });
const Fo = Le;
let Kg = class extends Error {
  constructor(e, r, n, s) {
    super(s || `can't resolve reference ${n} from id ${r}`), this.missingRef = (0, Fo.resolveUrl)(e, r, n), this.missingSchema = (0, Fo.normalizeId)((0, Fo.getFullPath)(e, this.missingRef));
  }
};
On.default = Kg;
var Je = {};
Object.defineProperty(Je, "__esModule", { value: !0 });
Je.resolveSchema = Je.getCompilingSchema = Je.resolveRef = Je.compileSchema = Je.SchemaEnv = void 0;
const pt = oe, Gg = Rs, Tr = ct, wt = Le, Fu = F, Bg = Et;
let so = class {
  constructor(e) {
    var r;
    this.refs = {}, this.dynamicAnchors = {};
    let n;
    typeof e.schema == "object" && (n = e.schema), this.schema = e.schema, this.schemaId = e.schemaId, this.root = e.root || this, this.baseId = (r = e.baseId) !== null && r !== void 0 ? r : (0, wt.normalizeId)(n == null ? void 0 : n[e.schemaId || "$id"]), this.schemaPath = e.schemaPath, this.localRefs = e.localRefs, this.meta = e.meta, this.$async = n == null ? void 0 : n.$async, this.refs = {};
  }
};
Je.SchemaEnv = so;
function ac(t) {
  const e = mh.call(this, t);
  if (e)
    return e;
  const r = (0, wt.getFullPath)(this.opts.uriResolver, t.root.baseId), { es5: n, lines: s } = this.opts.code, { ownProperties: a } = this.opts, o = new pt.CodeGen(this.scope, { es5: n, lines: s, ownProperties: a });
  let i;
  t.$async && (i = o.scopeValue("Error", {
    ref: Gg.default,
    code: (0, pt._)`require("ajv/dist/runtime/validation_error").default`
  }));
  const c = o.scopeName("validate");
  t.validateName = c;
  const d = {
    gen: o,
    allErrors: this.opts.allErrors,
    data: Tr.default.data,
    parentData: Tr.default.parentData,
    parentDataProperty: Tr.default.parentDataProperty,
    dataNames: [Tr.default.data],
    dataPathArr: [pt.nil],
    // TODO can its length be used as dataLevel if nil is removed?
    dataLevel: 0,
    dataTypes: [],
    definedProperties: /* @__PURE__ */ new Set(),
    topSchemaRef: o.scopeValue("schema", this.opts.code.source === !0 ? { ref: t.schema, code: (0, pt.stringify)(t.schema) } : { ref: t.schema }),
    validateName: c,
    ValidationError: i,
    schema: t.schema,
    schemaEnv: t,
    rootId: r,
    baseId: t.baseId || r,
    schemaPath: pt.nil,
    errSchemaPath: t.schemaPath || (this.opts.jtd ? "" : "#"),
    errorPath: (0, pt._)`""`,
    opts: this.opts,
    self: this
  };
  let l;
  try {
    this._compilations.add(t), (0, Bg.validateFunctionCode)(d), o.optimize(this.opts.code.optimize);
    const f = o.toString();
    l = `${o.scopeRefs(Tr.default.scope)}return ${f}`, this.opts.code.process && (l = this.opts.code.process(l, t));
    const p = new Function(`${Tr.default.self}`, `${Tr.default.scope}`, l)(this, this.scope.get());
    if (this.scope.value(c, { ref: p }), p.errors = null, p.schema = t.schema, p.schemaEnv = t, t.$async && (p.$async = !0), this.opts.code.source === !0 && (p.source = { validateName: c, validateCode: f, scopeValues: o._values }), this.opts.unevaluated) {
      const { props: w, items: $ } = d;
      p.evaluated = {
        props: w instanceof pt.Name ? void 0 : w,
        items: $ instanceof pt.Name ? void 0 : $,
        dynamicProps: w instanceof pt.Name,
        dynamicItems: $ instanceof pt.Name
      }, p.source && (p.source.evaluated = (0, pt.stringify)(p.evaluated));
    }
    return t.validate = p, t;
  } catch (f) {
    throw delete t.validate, delete t.validateName, l && this.logger.error("Error compiling schema, function code:", l), f;
  } finally {
    this._compilations.delete(t);
  }
}
Je.compileSchema = ac;
function Hg(t, e, r) {
  var n;
  r = (0, wt.resolveUrl)(this.opts.uriResolver, e, r);
  const s = t.refs[r];
  if (s)
    return s;
  let a = Xg.call(this, t, r);
  if (a === void 0) {
    const o = (n = t.localRefs) === null || n === void 0 ? void 0 : n[r], { schemaId: i } = this.opts;
    o && (a = new so({ schema: o, schemaId: i, root: t, baseId: e }));
  }
  if (a !== void 0)
    return t.refs[r] = Wg.call(this, a);
}
Je.resolveRef = Hg;
function Wg(t) {
  return (0, wt.inlineRef)(t.schema, this.opts.inlineRefs) ? t.schema : t.validate ? t : ac.call(this, t);
}
function mh(t) {
  for (const e of this._compilations)
    if (Jg(e, t))
      return e;
}
Je.getCompilingSchema = mh;
function Jg(t, e) {
  return t.schema === e.schema && t.root === e.root && t.baseId === e.baseId;
}
function Xg(t, e) {
  let r;
  for (; typeof (r = this.refs[e]) == "string"; )
    e = r;
  return r || this.schemas[e] || ao.call(this, t, e);
}
function ao(t, e) {
  const r = this.opts.uriResolver.parse(e), n = (0, wt._getFullPath)(this.opts.uriResolver, r);
  let s = (0, wt.getFullPath)(this.opts.uriResolver, t.baseId, void 0);
  if (Object.keys(t.schema).length > 0 && n === s)
    return Vo.call(this, r, t);
  const a = (0, wt.normalizeId)(n), o = this.refs[a] || this.schemas[a];
  if (typeof o == "string") {
    const i = ao.call(this, t, o);
    return typeof (i == null ? void 0 : i.schema) != "object" ? void 0 : Vo.call(this, r, i);
  }
  if (typeof (o == null ? void 0 : o.schema) == "object") {
    if (o.validate || ac.call(this, o), a === (0, wt.normalizeId)(e)) {
      const { schema: i } = o, { schemaId: c } = this.opts, d = i[c];
      return d && (s = (0, wt.resolveUrl)(this.opts.uriResolver, s, d)), new so({ schema: i, schemaId: c, root: t, baseId: s });
    }
    return Vo.call(this, r, o);
  }
}
Je.resolveSchema = ao;
const Yg = /* @__PURE__ */ new Set([
  "properties",
  "patternProperties",
  "enum",
  "dependencies",
  "definitions"
]);
function Vo(t, { baseId: e, schema: r, root: n }) {
  var s;
  if (((s = t.fragment) === null || s === void 0 ? void 0 : s[0]) !== "/")
    return;
  for (const i of t.fragment.slice(1).split("/")) {
    if (typeof r == "boolean")
      return;
    const c = r[(0, Fu.unescapeFragment)(i)];
    if (c === void 0)
      return;
    r = c;
    const d = typeof r == "object" && r[this.opts.schemaId];
    !Yg.has(i) && d && (e = (0, wt.resolveUrl)(this.opts.uriResolver, e, d));
  }
  let a;
  if (typeof r != "boolean" && r.$ref && !(0, Fu.schemaHasRulesButRef)(r, this.RULES)) {
    const i = (0, wt.resolveUrl)(this.opts.uriResolver, e, r.$ref);
    a = ao.call(this, n, i);
  }
  const { schemaId: o } = this.opts;
  if (a = a || new so({ schema: r, schemaId: o, root: n, baseId: e }), a.schema !== a.root.schema)
    return a;
}
const Qg = "https://raw.githubusercontent.com/ajv-validator/ajv/master/lib/refs/data.json#", Zg = "Meta-schema for $data reference (JSON AnySchema extension proposal)", e_ = "object", t_ = [
  "$data"
], r_ = {
  $data: {
    type: "string",
    anyOf: [
      {
        format: "relative-json-pointer"
      },
      {
        format: "json-pointer"
      }
    ]
  }
}, n_ = !1, s_ = {
  $id: Qg,
  description: Zg,
  type: e_,
  required: t_,
  properties: r_,
  additionalProperties: n_
};
var oc = {}, oo = { exports: {} };
const a_ = RegExp.prototype.test.bind(/^[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12}$/iu), ph = RegExp.prototype.test.bind(/^(?:(?:25[0-5]|2[0-4]\d|1\d{2}|[1-9]\d|\d)\.){3}(?:25[0-5]|2[0-4]\d|1\d{2}|[1-9]\d|\d)$/u);
function yh(t) {
  let e = "", r = 0, n = 0;
  for (n = 0; n < t.length; n++)
    if (r = t[n].charCodeAt(0), r !== 48) {
      if (!(r >= 48 && r <= 57 || r >= 65 && r <= 70 || r >= 97 && r <= 102))
        return "";
      e += t[n];
      break;
    }
  for (n += 1; n < t.length; n++) {
    if (r = t[n].charCodeAt(0), !(r >= 48 && r <= 57 || r >= 65 && r <= 70 || r >= 97 && r <= 102))
      return "";
    e += t[n];
  }
  return e;
}
const o_ = RegExp.prototype.test.bind(/[^!"$&'()*+,\-.;=_`a-z{}~]/u);
function Vu(t) {
  return t.length = 0, !0;
}
function i_(t, e, r) {
  if (t.length) {
    const n = yh(t);
    if (n !== "")
      e.push(n);
    else
      return r.error = !0, !1;
    t.length = 0;
  }
  return !0;
}
function c_(t) {
  let e = 0;
  const r = { error: !1, address: "", zone: "" }, n = [], s = [];
  let a = !1, o = !1, i = i_;
  for (let c = 0; c < t.length; c++) {
    const d = t[c];
    if (!(d === "[" || d === "]"))
      if (d === ":") {
        if (a === !0 && (o = !0), !i(s, n, r))
          break;
        if (++e > 7) {
          r.error = !0;
          break;
        }
        c > 0 && t[c - 1] === ":" && (a = !0), n.push(":");
        continue;
      } else if (d === "%") {
        if (!i(s, n, r))
          break;
        i = Vu;
      } else {
        s.push(d);
        continue;
      }
  }
  return s.length && (i === Vu ? r.zone = s.join("") : o ? n.push(s.join("")) : n.push(yh(s))), r.address = n.join(""), r;
}
function $h(t) {
  if (l_(t, ":") < 2)
    return { host: t, isIPV6: !1 };
  const e = c_(t);
  if (e.error)
    return { host: t, isIPV6: !1 };
  {
    let r = e.address, n = e.address;
    return e.zone && (r += "%" + e.zone, n += "%25" + e.zone), { host: r, isIPV6: !0, escapedHost: n };
  }
}
function l_(t, e) {
  let r = 0;
  for (let n = 0; n < t.length; n++)
    t[n] === e && r++;
  return r;
}
function u_(t) {
  let e = t;
  const r = [];
  let n = -1, s = 0;
  for (; s = e.length; ) {
    if (s === 1) {
      if (e === ".")
        break;
      if (e === "/") {
        r.push("/");
        break;
      } else {
        r.push(e);
        break;
      }
    } else if (s === 2) {
      if (e[0] === ".") {
        if (e[1] === ".")
          break;
        if (e[1] === "/") {
          e = e.slice(2);
          continue;
        }
      } else if (e[0] === "/" && (e[1] === "." || e[1] === "/")) {
        r.push("/");
        break;
      }
    } else if (s === 3 && e === "/..") {
      r.length !== 0 && r.pop(), r.push("/");
      break;
    }
    if (e[0] === ".") {
      if (e[1] === ".") {
        if (e[2] === "/") {
          e = e.slice(3);
          continue;
        }
      } else if (e[1] === "/") {
        e = e.slice(2);
        continue;
      }
    } else if (e[0] === "/" && e[1] === ".") {
      if (e[2] === "/") {
        e = e.slice(2);
        continue;
      } else if (e[2] === "." && e[3] === "/") {
        e = e.slice(3), r.length !== 0 && r.pop();
        continue;
      }
    }
    if ((n = e.indexOf("/", 1)) === -1) {
      r.push(e);
      break;
    } else
      r.push(e.slice(0, n)), e = e.slice(n);
  }
  return r.join("");
}
function d_(t, e) {
  const r = e !== !0 ? escape : unescape;
  return t.scheme !== void 0 && (t.scheme = r(t.scheme)), t.userinfo !== void 0 && (t.userinfo = r(t.userinfo)), t.host !== void 0 && (t.host = r(t.host)), t.path !== void 0 && (t.path = r(t.path)), t.query !== void 0 && (t.query = r(t.query)), t.fragment !== void 0 && (t.fragment = r(t.fragment)), t;
}
function f_(t) {
  const e = [];
  if (t.userinfo !== void 0 && (e.push(t.userinfo), e.push("@")), t.host !== void 0) {
    let r = unescape(t.host);
    if (!ph(r)) {
      const n = $h(r);
      n.isIPV6 === !0 ? r = `[${n.escapedHost}]` : r = t.host;
    }
    e.push(r);
  }
  return (typeof t.port == "number" || typeof t.port == "string") && (e.push(":"), e.push(String(t.port))), e.length ? e.join("") : void 0;
}
var gh = {
  nonSimpleDomain: o_,
  recomposeAuthority: f_,
  normalizeComponentEncoding: d_,
  removeDotSegments: u_,
  isIPv4: ph,
  isUUID: a_,
  normalizeIPv6: $h
};
const { isUUID: h_ } = gh, m_ = /([\da-z][\d\-a-z]{0,31}):((?:[\w!$'()*+,\-.:;=@]|%[\da-f]{2})+)/iu;
function _h(t) {
  return t.secure === !0 ? !0 : t.secure === !1 ? !1 : t.scheme ? t.scheme.length === 3 && (t.scheme[0] === "w" || t.scheme[0] === "W") && (t.scheme[1] === "s" || t.scheme[1] === "S") && (t.scheme[2] === "s" || t.scheme[2] === "S") : !1;
}
function vh(t) {
  return t.host || (t.error = t.error || "HTTP URIs must have a host."), t;
}
function wh(t) {
  const e = String(t.scheme).toLowerCase() === "https";
  return (t.port === (e ? 443 : 80) || t.port === "") && (t.port = void 0), t.path || (t.path = "/"), t;
}
function p_(t) {
  return t.secure = _h(t), t.resourceName = (t.path || "/") + (t.query ? "?" + t.query : ""), t.path = void 0, t.query = void 0, t;
}
function y_(t) {
  if ((t.port === (_h(t) ? 443 : 80) || t.port === "") && (t.port = void 0), typeof t.secure == "boolean" && (t.scheme = t.secure ? "wss" : "ws", t.secure = void 0), t.resourceName) {
    const [e, r] = t.resourceName.split("?");
    t.path = e && e !== "/" ? e : void 0, t.query = r, t.resourceName = void 0;
  }
  return t.fragment = void 0, t;
}
function $_(t, e) {
  if (!t.path)
    return t.error = "URN can not be parsed", t;
  const r = t.path.match(m_);
  if (r) {
    const n = e.scheme || t.scheme || "urn";
    t.nid = r[1].toLowerCase(), t.nss = r[2];
    const s = `${n}:${e.nid || t.nid}`, a = ic(s);
    t.path = void 0, a && (t = a.parse(t, e));
  } else
    t.error = t.error || "URN can not be parsed.";
  return t;
}
function g_(t, e) {
  if (t.nid === void 0)
    throw new Error("URN without nid cannot be serialized");
  const r = e.scheme || t.scheme || "urn", n = t.nid.toLowerCase(), s = `${r}:${e.nid || n}`, a = ic(s);
  a && (t = a.serialize(t, e));
  const o = t, i = t.nss;
  return o.path = `${n || e.nid}:${i}`, e.skipEscape = !0, o;
}
function __(t, e) {
  const r = t;
  return r.uuid = r.nss, r.nss = void 0, !e.tolerant && (!r.uuid || !h_(r.uuid)) && (r.error = r.error || "UUID is not valid."), r;
}
function v_(t) {
  const e = t;
  return e.nss = (t.uuid || "").toLowerCase(), e;
}
const bh = (
  /** @type {SchemeHandler} */
  {
    scheme: "http",
    domainHost: !0,
    parse: vh,
    serialize: wh
  }
), w_ = (
  /** @type {SchemeHandler} */
  {
    scheme: "https",
    domainHost: bh.domainHost,
    parse: vh,
    serialize: wh
  }
), ha = (
  /** @type {SchemeHandler} */
  {
    scheme: "ws",
    domainHost: !0,
    parse: p_,
    serialize: y_
  }
), b_ = (
  /** @type {SchemeHandler} */
  {
    scheme: "wss",
    domainHost: ha.domainHost,
    parse: ha.parse,
    serialize: ha.serialize
  }
), E_ = (
  /** @type {SchemeHandler} */
  {
    scheme: "urn",
    parse: $_,
    serialize: g_,
    skipNormalize: !0
  }
), S_ = (
  /** @type {SchemeHandler} */
  {
    scheme: "urn:uuid",
    parse: __,
    serialize: v_,
    skipNormalize: !0
  }
), Aa = (
  /** @type {Record<SchemeName, SchemeHandler>} */
  {
    http: bh,
    https: w_,
    ws: ha,
    wss: b_,
    urn: E_,
    "urn:uuid": S_
  }
);
Object.setPrototypeOf(Aa, null);
function ic(t) {
  return t && (Aa[
    /** @type {SchemeName} */
    t
  ] || Aa[
    /** @type {SchemeName} */
    t.toLowerCase()
  ]) || void 0;
}
var P_ = {
  SCHEMES: Aa,
  getSchemeHandler: ic
};
const { normalizeIPv6: R_, removeDotSegments: Wn, recomposeAuthority: O_, normalizeComponentEncoding: Ls, isIPv4: I_, nonSimpleDomain: N_ } = gh, { SCHEMES: T_, getSchemeHandler: Eh } = P_;
function k_(t, e) {
  return typeof t == "string" ? t = /** @type {T} */
  Mt(Ht(t, e), e) : typeof t == "object" && (t = /** @type {T} */
  Ht(Mt(t, e), e)), t;
}
function A_(t, e, r) {
  const n = r ? Object.assign({ scheme: "null" }, r) : { scheme: "null" }, s = Sh(Ht(t, n), Ht(e, n), n, !0);
  return n.skipEscape = !0, Mt(s, n);
}
function Sh(t, e, r, n) {
  const s = {};
  return n || (t = Ht(Mt(t, r), r), e = Ht(Mt(e, r), r)), r = r || {}, !r.tolerant && e.scheme ? (s.scheme = e.scheme, s.userinfo = e.userinfo, s.host = e.host, s.port = e.port, s.path = Wn(e.path || ""), s.query = e.query) : (e.userinfo !== void 0 || e.host !== void 0 || e.port !== void 0 ? (s.userinfo = e.userinfo, s.host = e.host, s.port = e.port, s.path = Wn(e.path || ""), s.query = e.query) : (e.path ? (e.path[0] === "/" ? s.path = Wn(e.path) : ((t.userinfo !== void 0 || t.host !== void 0 || t.port !== void 0) && !t.path ? s.path = "/" + e.path : t.path ? s.path = t.path.slice(0, t.path.lastIndexOf("/") + 1) + e.path : s.path = e.path, s.path = Wn(s.path)), s.query = e.query) : (s.path = t.path, e.query !== void 0 ? s.query = e.query : s.query = t.query), s.userinfo = t.userinfo, s.host = t.host, s.port = t.port), s.scheme = t.scheme), s.fragment = e.fragment, s;
}
function C_(t, e, r) {
  return typeof t == "string" ? (t = unescape(t), t = Mt(Ls(Ht(t, r), !0), { ...r, skipEscape: !0 })) : typeof t == "object" && (t = Mt(Ls(t, !0), { ...r, skipEscape: !0 })), typeof e == "string" ? (e = unescape(e), e = Mt(Ls(Ht(e, r), !0), { ...r, skipEscape: !0 })) : typeof e == "object" && (e = Mt(Ls(e, !0), { ...r, skipEscape: !0 })), t.toLowerCase() === e.toLowerCase();
}
function Mt(t, e) {
  const r = {
    host: t.host,
    scheme: t.scheme,
    userinfo: t.userinfo,
    port: t.port,
    path: t.path,
    query: t.query,
    nid: t.nid,
    nss: t.nss,
    uuid: t.uuid,
    fragment: t.fragment,
    reference: t.reference,
    resourceName: t.resourceName,
    secure: t.secure,
    error: ""
  }, n = Object.assign({}, e), s = [], a = Eh(n.scheme || r.scheme);
  a && a.serialize && a.serialize(r, n), r.path !== void 0 && (n.skipEscape ? r.path = unescape(r.path) : (r.path = escape(r.path), r.scheme !== void 0 && (r.path = r.path.split("%3A").join(":")))), n.reference !== "suffix" && r.scheme && s.push(r.scheme, ":");
  const o = O_(r);
  if (o !== void 0 && (n.reference !== "suffix" && s.push("//"), s.push(o), r.path && r.path[0] !== "/" && s.push("/")), r.path !== void 0) {
    let i = r.path;
    !n.absolutePath && (!a || !a.absolutePath) && (i = Wn(i)), o === void 0 && i[0] === "/" && i[1] === "/" && (i = "/%2F" + i.slice(2)), s.push(i);
  }
  return r.query !== void 0 && s.push("?", r.query), r.fragment !== void 0 && s.push("#", r.fragment), s.join("");
}
const j_ = /^(?:([^#/:?]+):)?(?:\/\/((?:([^#/?@]*)@)?(\[[^#/?\]]+\]|[^#/:?]*)(?::(\d*))?))?([^#?]*)(?:\?([^#]*))?(?:#((?:.|[\n\r])*))?/u;
function Ht(t, e) {
  const r = Object.assign({}, e), n = {
    scheme: void 0,
    userinfo: void 0,
    host: "",
    port: void 0,
    path: "",
    query: void 0,
    fragment: void 0
  };
  let s = !1;
  r.reference === "suffix" && (r.scheme ? t = r.scheme + ":" + t : t = "//" + t);
  const a = t.match(j_);
  if (a) {
    if (n.scheme = a[1], n.userinfo = a[3], n.host = a[4], n.port = parseInt(a[5], 10), n.path = a[6] || "", n.query = a[7], n.fragment = a[8], isNaN(n.port) && (n.port = a[5]), n.host)
      if (I_(n.host) === !1) {
        const c = R_(n.host);
        n.host = c.host.toLowerCase(), s = c.isIPV6;
      } else
        s = !0;
    n.scheme === void 0 && n.userinfo === void 0 && n.host === void 0 && n.port === void 0 && n.query === void 0 && !n.path ? n.reference = "same-document" : n.scheme === void 0 ? n.reference = "relative" : n.fragment === void 0 ? n.reference = "absolute" : n.reference = "uri", r.reference && r.reference !== "suffix" && r.reference !== n.reference && (n.error = n.error || "URI is not a " + r.reference + " reference.");
    const o = Eh(r.scheme || n.scheme);
    if (!r.unicodeSupport && (!o || !o.unicodeSupport) && n.host && (r.domainHost || o && o.domainHost) && s === !1 && N_(n.host))
      try {
        n.host = URL.domainToASCII(n.host.toLowerCase());
      } catch (i) {
        n.error = n.error || "Host's domain name can not be converted to ASCII: " + i;
      }
    (!o || o && !o.skipNormalize) && (t.indexOf("%") !== -1 && (n.scheme !== void 0 && (n.scheme = unescape(n.scheme)), n.host !== void 0 && (n.host = unescape(n.host))), n.path && (n.path = escape(unescape(n.path))), n.fragment && (n.fragment = encodeURI(decodeURIComponent(n.fragment)))), o && o.parse && o.parse(n, r);
  } else
    n.error = n.error || "URI can not be parsed.";
  return n;
}
const cc = {
  SCHEMES: T_,
  normalize: k_,
  resolve: A_,
  resolveComponent: Sh,
  equal: C_,
  serialize: Mt,
  parse: Ht
};
oo.exports = cc;
oo.exports.default = cc;
oo.exports.fastUri = cc;
var Ph = oo.exports;
Object.defineProperty(oc, "__esModule", { value: !0 });
const Rh = Ph;
Rh.code = 'require("ajv/dist/runtime/uri").default';
oc.default = Rh;
(function(t) {
  Object.defineProperty(t, "__esModule", { value: !0 }), t.CodeGen = t.Name = t.nil = t.stringify = t.str = t._ = t.KeywordCxt = void 0;
  var e = Et;
  Object.defineProperty(t, "KeywordCxt", { enumerable: !0, get: function() {
    return e.KeywordCxt;
  } });
  var r = oe;
  Object.defineProperty(t, "_", { enumerable: !0, get: function() {
    return r._;
  } }), Object.defineProperty(t, "str", { enumerable: !0, get: function() {
    return r.str;
  } }), Object.defineProperty(t, "stringify", { enumerable: !0, get: function() {
    return r.stringify;
  } }), Object.defineProperty(t, "nil", { enumerable: !0, get: function() {
    return r.nil;
  } }), Object.defineProperty(t, "Name", { enumerable: !0, get: function() {
    return r.Name;
  } }), Object.defineProperty(t, "CodeGen", { enumerable: !0, get: function() {
    return r.CodeGen;
  } });
  const n = Rs, s = On, a = Hr, o = Je, i = oe, c = Le, d = Oe, l = F, f = s_, _ = oc, p = (O, g) => new RegExp(O, g);
  p.code = "new RegExp";
  const w = ["removeAdditional", "useDefaults", "coerceTypes"], $ = /* @__PURE__ */ new Set([
    "validate",
    "serialize",
    "parse",
    "wrapper",
    "root",
    "schema",
    "keyword",
    "pattern",
    "formats",
    "validate$data",
    "func",
    "obj",
    "Error"
  ]), y = {
    errorDataPath: "",
    format: "`validateFormats: false` can be used instead.",
    nullable: '"nullable" keyword is supported by default.',
    jsonPointers: "Deprecated jsPropertySyntax can be used instead.",
    extendRefs: "Deprecated ignoreKeywordsWithRef can be used instead.",
    missingRefs: "Pass empty schema with $id that should be ignored to ajv.addSchema.",
    processCode: "Use option `code: {process: (code, schemaEnv: object) => string}`",
    sourceCode: "Use option `code: {source: true}`",
    strictDefaults: "It is default now, see option `strict`.",
    strictKeywords: "It is default now, see option `strict`.",
    uniqueItems: '"uniqueItems" keyword is always validated.',
    unknownFormats: "Disable strict mode or pass `true` to `ajv.addFormat` (or `formats` option).",
    cache: "Map is used as cache, schema object as key.",
    serialize: "Map is used as cache, schema object as key.",
    ajvErrors: "It is default now."
  }, m = {
    ignoreKeywordsWithRef: "",
    jsPropertySyntax: "",
    unicode: '"minLength"/"maxLength" account for unicode characters by default.'
  }, v = 200;
  function P(O) {
    var g, S, b, u, h, E, T, A, G, K, pe, rt, pr, yr, $r, gr, _r, vr, wr, br, Er, Sr, Pr, Rr, Or;
    const mt = O.strict, Ir = (g = O.code) === null || g === void 0 ? void 0 : g.optimize, Fn = Ir === !0 || Ir === void 0 ? 1 : Ir || 0, Vn = (b = (S = O.code) === null || S === void 0 ? void 0 : S.regExp) !== null && b !== void 0 ? b : p, ko = (u = O.uriResolver) !== null && u !== void 0 ? u : _.default;
    return {
      strictSchema: (E = (h = O.strictSchema) !== null && h !== void 0 ? h : mt) !== null && E !== void 0 ? E : !0,
      strictNumbers: (A = (T = O.strictNumbers) !== null && T !== void 0 ? T : mt) !== null && A !== void 0 ? A : !0,
      strictTypes: (K = (G = O.strictTypes) !== null && G !== void 0 ? G : mt) !== null && K !== void 0 ? K : "log",
      strictTuples: (rt = (pe = O.strictTuples) !== null && pe !== void 0 ? pe : mt) !== null && rt !== void 0 ? rt : "log",
      strictRequired: (yr = (pr = O.strictRequired) !== null && pr !== void 0 ? pr : mt) !== null && yr !== void 0 ? yr : !1,
      code: O.code ? { ...O.code, optimize: Fn, regExp: Vn } : { optimize: Fn, regExp: Vn },
      loopRequired: ($r = O.loopRequired) !== null && $r !== void 0 ? $r : v,
      loopEnum: (gr = O.loopEnum) !== null && gr !== void 0 ? gr : v,
      meta: (_r = O.meta) !== null && _r !== void 0 ? _r : !0,
      messages: (vr = O.messages) !== null && vr !== void 0 ? vr : !0,
      inlineRefs: (wr = O.inlineRefs) !== null && wr !== void 0 ? wr : !0,
      schemaId: (br = O.schemaId) !== null && br !== void 0 ? br : "$id",
      addUsedSchema: (Er = O.addUsedSchema) !== null && Er !== void 0 ? Er : !0,
      validateSchema: (Sr = O.validateSchema) !== null && Sr !== void 0 ? Sr : !0,
      validateFormats: (Pr = O.validateFormats) !== null && Pr !== void 0 ? Pr : !0,
      unicodeRegExp: (Rr = O.unicodeRegExp) !== null && Rr !== void 0 ? Rr : !0,
      int32range: (Or = O.int32range) !== null && Or !== void 0 ? Or : !0,
      uriResolver: ko
    };
  }
  class R {
    constructor(g = {}) {
      this.schemas = {}, this.refs = {}, this.formats = {}, this._compilations = /* @__PURE__ */ new Set(), this._loading = {}, this._cache = /* @__PURE__ */ new Map(), g = this.opts = { ...g, ...P(g) };
      const { es5: S, lines: b } = this.opts.code;
      this.scope = new i.ValueScope({ scope: {}, prefixes: $, es5: S, lines: b }), this.logger = B(g.logger);
      const u = g.validateFormats;
      g.validateFormats = !1, this.RULES = (0, a.getRules)(), N.call(this, y, g, "NOT SUPPORTED"), N.call(this, m, g, "DEPRECATED", "warn"), this._metaOpts = ne.call(this), g.formats && de.call(this), this._addVocabularies(), this._addDefaultMetaSchema(), g.keywords && Z.call(this, g.keywords), typeof g.meta == "object" && this.addMetaSchema(g.meta), L.call(this), g.validateFormats = u;
    }
    _addVocabularies() {
      this.addKeyword("$async");
    }
    _addDefaultMetaSchema() {
      const { $data: g, meta: S, schemaId: b } = this.opts;
      let u = f;
      b === "id" && (u = { ...f }, u.id = u.$id, delete u.$id), S && g && this.addMetaSchema(u, u[b], !1);
    }
    defaultMeta() {
      const { meta: g, schemaId: S } = this.opts;
      return this.opts.defaultMeta = typeof g == "object" ? g[S] || g : void 0;
    }
    validate(g, S) {
      let b;
      if (typeof g == "string") {
        if (b = this.getSchema(g), !b)
          throw new Error(`no schema with key or ref "${g}"`);
      } else
        b = this.compile(g);
      const u = b(S);
      return "$async" in b || (this.errors = b.errors), u;
    }
    compile(g, S) {
      const b = this._addSchema(g, S);
      return b.validate || this._compileSchemaEnv(b);
    }
    compileAsync(g, S) {
      if (typeof this.opts.loadSchema != "function")
        throw new Error("options.loadSchema should be a function");
      const { loadSchema: b } = this.opts;
      return u.call(this, g, S);
      async function u(K, pe) {
        await h.call(this, K.$schema);
        const rt = this._addSchema(K, pe);
        return rt.validate || E.call(this, rt);
      }
      async function h(K) {
        K && !this.getSchema(K) && await u.call(this, { $ref: K }, !0);
      }
      async function E(K) {
        try {
          return this._compileSchemaEnv(K);
        } catch (pe) {
          if (!(pe instanceof s.default))
            throw pe;
          return T.call(this, pe), await A.call(this, pe.missingSchema), E.call(this, K);
        }
      }
      function T({ missingSchema: K, missingRef: pe }) {
        if (this.refs[K])
          throw new Error(`AnySchema ${K} is loaded but ${pe} cannot be resolved`);
      }
      async function A(K) {
        const pe = await G.call(this, K);
        this.refs[K] || await h.call(this, pe.$schema), this.refs[K] || this.addSchema(pe, K, S);
      }
      async function G(K) {
        const pe = this._loading[K];
        if (pe)
          return pe;
        try {
          return await (this._loading[K] = b(K));
        } finally {
          delete this._loading[K];
        }
      }
    }
    // Adds schema to the instance
    addSchema(g, S, b, u = this.opts.validateSchema) {
      if (Array.isArray(g)) {
        for (const E of g)
          this.addSchema(E, void 0, b, u);
        return this;
      }
      let h;
      if (typeof g == "object") {
        const { schemaId: E } = this.opts;
        if (h = g[E], h !== void 0 && typeof h != "string")
          throw new Error(`schema ${E} must be string`);
      }
      return S = (0, c.normalizeId)(S || h), this._checkUnique(S), this.schemas[S] = this._addSchema(g, b, S, u, !0), this;
    }
    // Add schema that will be used to validate other schemas
    // options in META_IGNORE_OPTIONS are alway set to false
    addMetaSchema(g, S, b = this.opts.validateSchema) {
      return this.addSchema(g, S, !0, b), this;
    }
    //  Validate schema against its meta-schema
    validateSchema(g, S) {
      if (typeof g == "boolean")
        return !0;
      let b;
      if (b = g.$schema, b !== void 0 && typeof b != "string")
        throw new Error("$schema must be a string");
      if (b = b || this.opts.defaultMeta || this.defaultMeta(), !b)
        return this.logger.warn("meta-schema not available"), this.errors = null, !0;
      const u = this.validate(b, g);
      if (!u && S) {
        const h = "schema is invalid: " + this.errorsText();
        if (this.opts.validateSchema === "log")
          this.logger.error(h);
        else
          throw new Error(h);
      }
      return u;
    }
    // Get compiled schema by `key` or `ref`.
    // (`key` that was passed to `addSchema` or full schema reference - `schema.$id` or resolved id)
    getSchema(g) {
      let S;
      for (; typeof (S = D.call(this, g)) == "string"; )
        g = S;
      if (S === void 0) {
        const { schemaId: b } = this.opts, u = new o.SchemaEnv({ schema: {}, schemaId: b });
        if (S = o.resolveSchema.call(this, u, g), !S)
          return;
        this.refs[g] = S;
      }
      return S.validate || this._compileSchemaEnv(S);
    }
    // Remove cached schema(s).
    // If no parameter is passed all schemas but meta-schemas are removed.
    // If RegExp is passed all schemas with key/id matching pattern but meta-schemas are removed.
    // Even if schema is referenced by other schemas it still can be removed as other schemas have local references.
    removeSchema(g) {
      if (g instanceof RegExp)
        return this._removeAllSchemas(this.schemas, g), this._removeAllSchemas(this.refs, g), this;
      switch (typeof g) {
        case "undefined":
          return this._removeAllSchemas(this.schemas), this._removeAllSchemas(this.refs), this._cache.clear(), this;
        case "string": {
          const S = D.call(this, g);
          return typeof S == "object" && this._cache.delete(S.schema), delete this.schemas[g], delete this.refs[g], this;
        }
        case "object": {
          const S = g;
          this._cache.delete(S);
          let b = g[this.opts.schemaId];
          return b && (b = (0, c.normalizeId)(b), delete this.schemas[b], delete this.refs[b]), this;
        }
        default:
          throw new Error("ajv.removeSchema: invalid parameter");
      }
    }
    // add "vocabulary" - a collection of keywords
    addVocabulary(g) {
      for (const S of g)
        this.addKeyword(S);
      return this;
    }
    addKeyword(g, S) {
      let b;
      if (typeof g == "string")
        b = g, typeof S == "object" && (this.logger.warn("these parameters are deprecated, see docs for addKeyword"), S.keyword = b);
      else if (typeof g == "object" && S === void 0) {
        if (S = g, b = S.keyword, Array.isArray(b) && !b.length)
          throw new Error("addKeywords: keyword must be string or non-empty array");
      } else
        throw new Error("invalid addKeywords parameters");
      if (k.call(this, b, S), !S)
        return (0, l.eachItem)(b, (h) => C.call(this, h)), this;
      x.call(this, S);
      const u = {
        ...S,
        type: (0, d.getJSONTypes)(S.type),
        schemaType: (0, d.getJSONTypes)(S.schemaType)
      };
      return (0, l.eachItem)(b, u.type.length === 0 ? (h) => C.call(this, h, u) : (h) => u.type.forEach((E) => C.call(this, h, u, E))), this;
    }
    getKeyword(g) {
      const S = this.RULES.all[g];
      return typeof S == "object" ? S.definition : !!S;
    }
    // Remove keyword
    removeKeyword(g) {
      const { RULES: S } = this;
      delete S.keywords[g], delete S.all[g];
      for (const b of S.rules) {
        const u = b.rules.findIndex((h) => h.keyword === g);
        u >= 0 && b.rules.splice(u, 1);
      }
      return this;
    }
    // Add format
    addFormat(g, S) {
      return typeof S == "string" && (S = new RegExp(S)), this.formats[g] = S, this;
    }
    errorsText(g = this.errors, { separator: S = ", ", dataVar: b = "data" } = {}) {
      return !g || g.length === 0 ? "No errors" : g.map((u) => `${b}${u.instancePath} ${u.message}`).reduce((u, h) => u + S + h);
    }
    $dataMetaSchema(g, S) {
      const b = this.RULES.all;
      g = JSON.parse(JSON.stringify(g));
      for (const u of S) {
        const h = u.split("/").slice(1);
        let E = g;
        for (const T of h)
          E = E[T];
        for (const T in b) {
          const A = b[T];
          if (typeof A != "object")
            continue;
          const { $data: G } = A.definition, K = E[T];
          G && K && (E[T] = U(K));
        }
      }
      return g;
    }
    _removeAllSchemas(g, S) {
      for (const b in g) {
        const u = g[b];
        (!S || S.test(b)) && (typeof u == "string" ? delete g[b] : u && !u.meta && (this._cache.delete(u.schema), delete g[b]));
      }
    }
    _addSchema(g, S, b, u = this.opts.validateSchema, h = this.opts.addUsedSchema) {
      let E;
      const { schemaId: T } = this.opts;
      if (typeof g == "object")
        E = g[T];
      else {
        if (this.opts.jtd)
          throw new Error("schema must be object");
        if (typeof g != "boolean")
          throw new Error("schema must be object or boolean");
      }
      let A = this._cache.get(g);
      if (A !== void 0)
        return A;
      b = (0, c.normalizeId)(E || b);
      const G = c.getSchemaRefs.call(this, g, b);
      return A = new o.SchemaEnv({ schema: g, schemaId: T, meta: S, baseId: b, localRefs: G }), this._cache.set(A.schema, A), h && !b.startsWith("#") && (b && this._checkUnique(b), this.refs[b] = A), u && this.validateSchema(g, !0), A;
    }
    _checkUnique(g) {
      if (this.schemas[g] || this.refs[g])
        throw new Error(`schema with key or id "${g}" already exists`);
    }
    _compileSchemaEnv(g) {
      if (g.meta ? this._compileMetaSchema(g) : o.compileSchema.call(this, g), !g.validate)
        throw new Error("ajv implementation error");
      return g.validate;
    }
    _compileMetaSchema(g) {
      const S = this.opts;
      this.opts = this._metaOpts;
      try {
        o.compileSchema.call(this, g);
      } finally {
        this.opts = S;
      }
    }
  }
  R.ValidationError = n.default, R.MissingRefError = s.default, t.default = R;
  function N(O, g, S, b = "error") {
    for (const u in O) {
      const h = u;
      h in g && this.logger[b](`${S}: option ${u}. ${O[h]}`);
    }
  }
  function D(O) {
    return O = (0, c.normalizeId)(O), this.schemas[O] || this.refs[O];
  }
  function L() {
    const O = this.opts.schemas;
    if (O)
      if (Array.isArray(O))
        this.addSchema(O);
      else
        for (const g in O)
          this.addSchema(O[g], g);
  }
  function de() {
    for (const O in this.opts.formats) {
      const g = this.opts.formats[O];
      g && this.addFormat(O, g);
    }
  }
  function Z(O) {
    if (Array.isArray(O)) {
      this.addVocabulary(O);
      return;
    }
    this.logger.warn("keywords option as map is deprecated, pass array");
    for (const g in O) {
      const S = O[g];
      S.keyword || (S.keyword = g), this.addKeyword(S);
    }
  }
  function ne() {
    const O = { ...this.opts };
    for (const g of w)
      delete O[g];
    return O;
  }
  const M = { log() {
  }, warn() {
  }, error() {
  } };
  function B(O) {
    if (O === !1)
      return M;
    if (O === void 0)
      return console;
    if (O.log && O.warn && O.error)
      return O;
    throw new Error("logger must implement log, warn and error methods");
  }
  const me = /^[a-z_$][a-z0-9_$:-]*$/i;
  function k(O, g) {
    const { RULES: S } = this;
    if ((0, l.eachItem)(O, (b) => {
      if (S.keywords[b])
        throw new Error(`Keyword ${b} is already defined`);
      if (!me.test(b))
        throw new Error(`Keyword ${b} has invalid name`);
    }), !!g && g.$data && !("code" in g || "validate" in g))
      throw new Error('$data keyword must have "code" or "validate" function');
  }
  function C(O, g, S) {
    var b;
    const u = g == null ? void 0 : g.post;
    if (S && u)
      throw new Error('keyword with "post" flag cannot have "type"');
    const { RULES: h } = this;
    let E = u ? h.post : h.rules.find(({ type: A }) => A === S);
    if (E || (E = { type: S, rules: [] }, h.rules.push(E)), h.keywords[O] = !0, !g)
      return;
    const T = {
      keyword: O,
      definition: {
        ...g,
        type: (0, d.getJSONTypes)(g.type),
        schemaType: (0, d.getJSONTypes)(g.schemaType)
      }
    };
    g.before ? z.call(this, E, T, g.before) : E.rules.push(T), h.all[O] = T, (b = g.implements) === null || b === void 0 || b.forEach((A) => this.addKeyword(A));
  }
  function z(O, g, S) {
    const b = O.rules.findIndex((u) => u.keyword === S);
    b >= 0 ? O.rules.splice(b, 0, g) : (O.rules.push(g), this.logger.warn(`rule ${S} is not defined`));
  }
  function x(O) {
    let { metaSchema: g } = O;
    g !== void 0 && (O.$data && this.opts.$data && (g = U(g)), O.validateSchema = this.compile(g, !0));
  }
  const J = {
    $ref: "https://raw.githubusercontent.com/ajv-validator/ajv/master/lib/refs/data.json#"
  };
  function U(O) {
    return { anyOf: [O, J] };
  }
})(Lf);
var lc = {}, uc = {}, dc = {};
Object.defineProperty(dc, "__esModule", { value: !0 });
const M_ = {
  keyword: "id",
  code() {
    throw new Error('NOT SUPPORTED: keyword "id", use "$id" for schema ID');
  }
};
dc.default = M_;
var Wt = {};
Object.defineProperty(Wt, "__esModule", { value: !0 });
Wt.callRef = Wt.getValidate = void 0;
const D_ = On, xu = fe, Qe = oe, Zr = ct, Uu = Je, Fs = F, L_ = {
  keyword: "$ref",
  schemaType: "string",
  code(t) {
    const { gen: e, schema: r, it: n } = t, { baseId: s, schemaEnv: a, validateName: o, opts: i, self: c } = n, { root: d } = a;
    if ((r === "#" || r === "#/") && s === d.baseId)
      return f();
    const l = Uu.resolveRef.call(c, d, s, r);
    if (l === void 0)
      throw new D_.default(n.opts.uriResolver, s, r);
    if (l instanceof Uu.SchemaEnv)
      return _(l);
    return p(l);
    function f() {
      if (a === d)
        return ma(t, o, a, a.$async);
      const w = e.scopeValue("root", { ref: d });
      return ma(t, (0, Qe._)`${w}.validate`, d, d.$async);
    }
    function _(w) {
      const $ = Oh(t, w);
      ma(t, $, w, w.$async);
    }
    function p(w) {
      const $ = e.scopeValue("schema", i.code.source === !0 ? { ref: w, code: (0, Qe.stringify)(w) } : { ref: w }), y = e.name("valid"), m = t.subschema({
        schema: w,
        dataTypes: [],
        schemaPath: Qe.nil,
        topSchemaRef: $,
        errSchemaPath: r
      }, y);
      t.mergeEvaluated(m), t.ok(y);
    }
  }
};
function Oh(t, e) {
  const { gen: r } = t;
  return e.validate ? r.scopeValue("validate", { ref: e.validate }) : (0, Qe._)`${r.scopeValue("wrapper", { ref: e })}.validate`;
}
Wt.getValidate = Oh;
function ma(t, e, r, n) {
  const { gen: s, it: a } = t, { allErrors: o, schemaEnv: i, opts: c } = a, d = c.passContext ? Zr.default.this : Qe.nil;
  n ? l() : f();
  function l() {
    if (!i.$async)
      throw new Error("async schema referenced by sync schema");
    const w = s.let("valid");
    s.try(() => {
      s.code((0, Qe._)`await ${(0, xu.callValidateCode)(t, e, d)}`), p(e), o || s.assign(w, !0);
    }, ($) => {
      s.if((0, Qe._)`!(${$} instanceof ${a.ValidationError})`, () => s.throw($)), _($), o || s.assign(w, !1);
    }), t.ok(w);
  }
  function f() {
    t.result((0, xu.callValidateCode)(t, e, d), () => p(e), () => _(e));
  }
  function _(w) {
    const $ = (0, Qe._)`${w}.errors`;
    s.assign(Zr.default.vErrors, (0, Qe._)`${Zr.default.vErrors} === null ? ${$} : ${Zr.default.vErrors}.concat(${$})`), s.assign(Zr.default.errors, (0, Qe._)`${Zr.default.vErrors}.length`);
  }
  function p(w) {
    var $;
    if (!a.opts.unevaluated)
      return;
    const y = ($ = r == null ? void 0 : r.validate) === null || $ === void 0 ? void 0 : $.evaluated;
    if (a.props !== !0)
      if (y && !y.dynamicProps)
        y.props !== void 0 && (a.props = Fs.mergeEvaluated.props(s, y.props, a.props));
      else {
        const m = s.var("props", (0, Qe._)`${w}.evaluated.props`);
        a.props = Fs.mergeEvaluated.props(s, m, a.props, Qe.Name);
      }
    if (a.items !== !0)
      if (y && !y.dynamicItems)
        y.items !== void 0 && (a.items = Fs.mergeEvaluated.items(s, y.items, a.items));
      else {
        const m = s.var("items", (0, Qe._)`${w}.evaluated.items`);
        a.items = Fs.mergeEvaluated.items(s, m, a.items, Qe.Name);
      }
  }
}
Wt.callRef = ma;
Wt.default = L_;
Object.defineProperty(uc, "__esModule", { value: !0 });
const F_ = dc, V_ = Wt, x_ = [
  "$schema",
  "$id",
  "$defs",
  "$vocabulary",
  { keyword: "$comment" },
  "definitions",
  F_.default,
  V_.default
];
uc.default = x_;
var fc = {}, hc = {};
Object.defineProperty(hc, "__esModule", { value: !0 });
const Ca = oe, er = Ca.operators, ja = {
  maximum: { okStr: "<=", ok: er.LTE, fail: er.GT },
  minimum: { okStr: ">=", ok: er.GTE, fail: er.LT },
  exclusiveMaximum: { okStr: "<", ok: er.LT, fail: er.GTE },
  exclusiveMinimum: { okStr: ">", ok: er.GT, fail: er.LTE }
}, U_ = {
  message: ({ keyword: t, schemaCode: e }) => (0, Ca.str)`must be ${ja[t].okStr} ${e}`,
  params: ({ keyword: t, schemaCode: e }) => (0, Ca._)`{comparison: ${ja[t].okStr}, limit: ${e}}`
}, q_ = {
  keyword: Object.keys(ja),
  type: "number",
  schemaType: "number",
  $data: !0,
  error: U_,
  code(t) {
    const { keyword: e, data: r, schemaCode: n } = t;
    t.fail$data((0, Ca._)`${r} ${ja[e].fail} ${n} || isNaN(${r})`);
  }
};
hc.default = q_;
var mc = {};
Object.defineProperty(mc, "__esModule", { value: !0 });
const cs = oe, z_ = {
  message: ({ schemaCode: t }) => (0, cs.str)`must be multiple of ${t}`,
  params: ({ schemaCode: t }) => (0, cs._)`{multipleOf: ${t}}`
}, K_ = {
  keyword: "multipleOf",
  type: "number",
  schemaType: "number",
  $data: !0,
  error: z_,
  code(t) {
    const { gen: e, data: r, schemaCode: n, it: s } = t, a = s.opts.multipleOfPrecision, o = e.let("res"), i = a ? (0, cs._)`Math.abs(Math.round(${o}) - ${o}) > 1e-${a}` : (0, cs._)`${o} !== parseInt(${o})`;
    t.fail$data((0, cs._)`(${n} === 0 || (${o} = ${r}/${n}, ${i}))`);
  }
};
mc.default = K_;
var pc = {}, yc = {};
Object.defineProperty(yc, "__esModule", { value: !0 });
function Ih(t) {
  const e = t.length;
  let r = 0, n = 0, s;
  for (; n < e; )
    r++, s = t.charCodeAt(n++), s >= 55296 && s <= 56319 && n < e && (s = t.charCodeAt(n), (s & 64512) === 56320 && n++);
  return r;
}
yc.default = Ih;
Ih.code = 'require("ajv/dist/runtime/ucs2length").default';
Object.defineProperty(pc, "__esModule", { value: !0 });
const Mr = oe, G_ = F, B_ = yc, H_ = {
  message({ keyword: t, schemaCode: e }) {
    const r = t === "maxLength" ? "more" : "fewer";
    return (0, Mr.str)`must NOT have ${r} than ${e} characters`;
  },
  params: ({ schemaCode: t }) => (0, Mr._)`{limit: ${t}}`
}, W_ = {
  keyword: ["maxLength", "minLength"],
  type: "string",
  schemaType: "number",
  $data: !0,
  error: H_,
  code(t) {
    const { keyword: e, data: r, schemaCode: n, it: s } = t, a = e === "maxLength" ? Mr.operators.GT : Mr.operators.LT, o = s.opts.unicode === !1 ? (0, Mr._)`${r}.length` : (0, Mr._)`${(0, G_.useFunc)(t.gen, B_.default)}(${r})`;
    t.fail$data((0, Mr._)`${o} ${a} ${n}`);
  }
};
pc.default = W_;
var $c = {};
Object.defineProperty($c, "__esModule", { value: !0 });
const J_ = fe, Ma = oe, X_ = {
  message: ({ schemaCode: t }) => (0, Ma.str)`must match pattern "${t}"`,
  params: ({ schemaCode: t }) => (0, Ma._)`{pattern: ${t}}`
}, Y_ = {
  keyword: "pattern",
  type: "string",
  schemaType: "string",
  $data: !0,
  error: X_,
  code(t) {
    const { data: e, $data: r, schema: n, schemaCode: s, it: a } = t, o = a.opts.unicodeRegExp ? "u" : "", i = r ? (0, Ma._)`(new RegExp(${s}, ${o}))` : (0, J_.usePattern)(t, n);
    t.fail$data((0, Ma._)`!${i}.test(${e})`);
  }
};
$c.default = Y_;
var gc = {};
Object.defineProperty(gc, "__esModule", { value: !0 });
const ls = oe, Q_ = {
  message({ keyword: t, schemaCode: e }) {
    const r = t === "maxProperties" ? "more" : "fewer";
    return (0, ls.str)`must NOT have ${r} than ${e} properties`;
  },
  params: ({ schemaCode: t }) => (0, ls._)`{limit: ${t}}`
}, Z_ = {
  keyword: ["maxProperties", "minProperties"],
  type: "object",
  schemaType: "number",
  $data: !0,
  error: Q_,
  code(t) {
    const { keyword: e, data: r, schemaCode: n } = t, s = e === "maxProperties" ? ls.operators.GT : ls.operators.LT;
    t.fail$data((0, ls._)`Object.keys(${r}).length ${s} ${n}`);
  }
};
gc.default = Z_;
var _c = {};
Object.defineProperty(_c, "__esModule", { value: !0 });
const zn = fe, us = oe, e0 = F, t0 = {
  message: ({ params: { missingProperty: t } }) => (0, us.str)`must have required property '${t}'`,
  params: ({ params: { missingProperty: t } }) => (0, us._)`{missingProperty: ${t}}`
}, r0 = {
  keyword: "required",
  type: "object",
  schemaType: "array",
  $data: !0,
  error: t0,
  code(t) {
    const { gen: e, schema: r, schemaCode: n, data: s, $data: a, it: o } = t, { opts: i } = o;
    if (!a && r.length === 0)
      return;
    const c = r.length >= i.loopRequired;
    if (o.allErrors ? d() : l(), i.strictRequired) {
      const p = t.parentSchema.properties, { definedProperties: w } = t.it;
      for (const $ of r)
        if ((p == null ? void 0 : p[$]) === void 0 && !w.has($)) {
          const y = o.schemaEnv.baseId + o.errSchemaPath, m = `required property "${$}" is not defined at "${y}" (strictRequired)`;
          (0, e0.checkStrictMode)(o, m, o.opts.strictRequired);
        }
    }
    function d() {
      if (c || a)
        t.block$data(us.nil, f);
      else
        for (const p of r)
          (0, zn.checkReportMissingProp)(t, p);
    }
    function l() {
      const p = e.let("missing");
      if (c || a) {
        const w = e.let("valid", !0);
        t.block$data(w, () => _(p, w)), t.ok(w);
      } else
        e.if((0, zn.checkMissingProp)(t, r, p)), (0, zn.reportMissingProp)(t, p), e.else();
    }
    function f() {
      e.forOf("prop", n, (p) => {
        t.setParams({ missingProperty: p }), e.if((0, zn.noPropertyInData)(e, s, p, i.ownProperties), () => t.error());
      });
    }
    function _(p, w) {
      t.setParams({ missingProperty: p }), e.forOf(p, n, () => {
        e.assign(w, (0, zn.propertyInData)(e, s, p, i.ownProperties)), e.if((0, us.not)(w), () => {
          t.error(), e.break();
        });
      }, us.nil);
    }
  }
};
_c.default = r0;
var vc = {};
Object.defineProperty(vc, "__esModule", { value: !0 });
const ds = oe, n0 = {
  message({ keyword: t, schemaCode: e }) {
    const r = t === "maxItems" ? "more" : "fewer";
    return (0, ds.str)`must NOT have ${r} than ${e} items`;
  },
  params: ({ schemaCode: t }) => (0, ds._)`{limit: ${t}}`
}, s0 = {
  keyword: ["maxItems", "minItems"],
  type: "array",
  schemaType: "number",
  $data: !0,
  error: n0,
  code(t) {
    const { keyword: e, data: r, schemaCode: n } = t, s = e === "maxItems" ? ds.operators.GT : ds.operators.LT;
    t.fail$data((0, ds._)`${r}.length ${s} ${n}`);
  }
};
vc.default = s0;
var wc = {}, Os = {};
Object.defineProperty(Os, "__esModule", { value: !0 });
const Nh = no;
Nh.code = 'require("ajv/dist/runtime/equal").default';
Os.default = Nh;
Object.defineProperty(wc, "__esModule", { value: !0 });
const xo = Oe, Ce = oe, a0 = F, o0 = Os, i0 = {
  message: ({ params: { i: t, j: e } }) => (0, Ce.str)`must NOT have duplicate items (items ## ${e} and ${t} are identical)`,
  params: ({ params: { i: t, j: e } }) => (0, Ce._)`{i: ${t}, j: ${e}}`
}, c0 = {
  keyword: "uniqueItems",
  type: "array",
  schemaType: "boolean",
  $data: !0,
  error: i0,
  code(t) {
    const { gen: e, data: r, $data: n, schema: s, parentSchema: a, schemaCode: o, it: i } = t;
    if (!n && !s)
      return;
    const c = e.let("valid"), d = a.items ? (0, xo.getSchemaTypes)(a.items) : [];
    t.block$data(c, l, (0, Ce._)`${o} === false`), t.ok(c);
    function l() {
      const w = e.let("i", (0, Ce._)`${r}.length`), $ = e.let("j");
      t.setParams({ i: w, j: $ }), e.assign(c, !0), e.if((0, Ce._)`${w} > 1`, () => (f() ? _ : p)(w, $));
    }
    function f() {
      return d.length > 0 && !d.some((w) => w === "object" || w === "array");
    }
    function _(w, $) {
      const y = e.name("item"), m = (0, xo.checkDataTypes)(d, y, i.opts.strictNumbers, xo.DataType.Wrong), v = e.const("indices", (0, Ce._)`{}`);
      e.for((0, Ce._)`;${w}--;`, () => {
        e.let(y, (0, Ce._)`${r}[${w}]`), e.if(m, (0, Ce._)`continue`), d.length > 1 && e.if((0, Ce._)`typeof ${y} == "string"`, (0, Ce._)`${y} += "_"`), e.if((0, Ce._)`typeof ${v}[${y}] == "number"`, () => {
          e.assign($, (0, Ce._)`${v}[${y}]`), t.error(), e.assign(c, !1).break();
        }).code((0, Ce._)`${v}[${y}] = ${w}`);
      });
    }
    function p(w, $) {
      const y = (0, a0.useFunc)(e, o0.default), m = e.name("outer");
      e.label(m).for((0, Ce._)`;${w}--;`, () => e.for((0, Ce._)`${$} = ${w}; ${$}--;`, () => e.if((0, Ce._)`${y}(${r}[${w}], ${r}[${$}])`, () => {
        t.error(), e.assign(c, !1).break(m);
      })));
    }
  }
};
wc.default = c0;
var bc = {};
Object.defineProperty(bc, "__esModule", { value: !0 });
const $i = oe, l0 = F, u0 = Os, d0 = {
  message: "must be equal to constant",
  params: ({ schemaCode: t }) => (0, $i._)`{allowedValue: ${t}}`
}, f0 = {
  keyword: "const",
  $data: !0,
  error: d0,
  code(t) {
    const { gen: e, data: r, $data: n, schemaCode: s, schema: a } = t;
    n || a && typeof a == "object" ? t.fail$data((0, $i._)`!${(0, l0.useFunc)(e, u0.default)}(${r}, ${s})`) : t.fail((0, $i._)`${a} !== ${r}`);
  }
};
bc.default = f0;
var Ec = {};
Object.defineProperty(Ec, "__esModule", { value: !0 });
const Jn = oe, h0 = F, m0 = Os, p0 = {
  message: "must be equal to one of the allowed values",
  params: ({ schemaCode: t }) => (0, Jn._)`{allowedValues: ${t}}`
}, y0 = {
  keyword: "enum",
  schemaType: "array",
  $data: !0,
  error: p0,
  code(t) {
    const { gen: e, data: r, $data: n, schema: s, schemaCode: a, it: o } = t;
    if (!n && s.length === 0)
      throw new Error("enum must have non-empty array");
    const i = s.length >= o.opts.loopEnum;
    let c;
    const d = () => c ?? (c = (0, h0.useFunc)(e, m0.default));
    let l;
    if (i || n)
      l = e.let("valid"), t.block$data(l, f);
    else {
      if (!Array.isArray(s))
        throw new Error("ajv implementation error");
      const p = e.const("vSchema", a);
      l = (0, Jn.or)(...s.map((w, $) => _(p, $)));
    }
    t.pass(l);
    function f() {
      e.assign(l, !1), e.forOf("v", a, (p) => e.if((0, Jn._)`${d()}(${r}, ${p})`, () => e.assign(l, !0).break()));
    }
    function _(p, w) {
      const $ = s[w];
      return typeof $ == "object" && $ !== null ? (0, Jn._)`${d()}(${r}, ${p}[${w}])` : (0, Jn._)`${r} === ${$}`;
    }
  }
};
Ec.default = y0;
Object.defineProperty(fc, "__esModule", { value: !0 });
const $0 = hc, g0 = mc, _0 = pc, v0 = $c, w0 = gc, b0 = _c, E0 = vc, S0 = wc, P0 = bc, R0 = Ec, O0 = [
  // number
  $0.default,
  g0.default,
  // string
  _0.default,
  v0.default,
  // object
  w0.default,
  b0.default,
  // array
  E0.default,
  S0.default,
  // any
  { keyword: "type", schemaType: ["string", "array"] },
  { keyword: "nullable", schemaType: "boolean" },
  P0.default,
  R0.default
];
fc.default = O0;
var Sc = {}, In = {};
Object.defineProperty(In, "__esModule", { value: !0 });
In.validateAdditionalItems = void 0;
const Dr = oe, gi = F, I0 = {
  message: ({ params: { len: t } }) => (0, Dr.str)`must NOT have more than ${t} items`,
  params: ({ params: { len: t } }) => (0, Dr._)`{limit: ${t}}`
}, N0 = {
  keyword: "additionalItems",
  type: "array",
  schemaType: ["boolean", "object"],
  before: "uniqueItems",
  error: I0,
  code(t) {
    const { parentSchema: e, it: r } = t, { items: n } = e;
    if (!Array.isArray(n)) {
      (0, gi.checkStrictMode)(r, '"additionalItems" is ignored when "items" is not an array of schemas');
      return;
    }
    Th(t, n);
  }
};
function Th(t, e) {
  const { gen: r, schema: n, data: s, keyword: a, it: o } = t;
  o.items = !0;
  const i = r.const("len", (0, Dr._)`${s}.length`);
  if (n === !1)
    t.setParams({ len: e.length }), t.pass((0, Dr._)`${i} <= ${e.length}`);
  else if (typeof n == "object" && !(0, gi.alwaysValidSchema)(o, n)) {
    const d = r.var("valid", (0, Dr._)`${i} <= ${e.length}`);
    r.if((0, Dr.not)(d), () => c(d)), t.ok(d);
  }
  function c(d) {
    r.forRange("i", e.length, i, (l) => {
      t.subschema({ keyword: a, dataProp: l, dataPropType: gi.Type.Num }, d), o.allErrors || r.if((0, Dr.not)(d), () => r.break());
    });
  }
}
In.validateAdditionalItems = Th;
In.default = N0;
var Pc = {}, Nn = {};
Object.defineProperty(Nn, "__esModule", { value: !0 });
Nn.validateTuple = void 0;
const qu = oe, pa = F, T0 = fe, k0 = {
  keyword: "items",
  type: "array",
  schemaType: ["object", "array", "boolean"],
  before: "uniqueItems",
  code(t) {
    const { schema: e, it: r } = t;
    if (Array.isArray(e))
      return kh(t, "additionalItems", e);
    r.items = !0, !(0, pa.alwaysValidSchema)(r, e) && t.ok((0, T0.validateArray)(t));
  }
};
function kh(t, e, r = t.schema) {
  const { gen: n, parentSchema: s, data: a, keyword: o, it: i } = t;
  l(s), i.opts.unevaluated && r.length && i.items !== !0 && (i.items = pa.mergeEvaluated.items(n, r.length, i.items));
  const c = n.name("valid"), d = n.const("len", (0, qu._)`${a}.length`);
  r.forEach((f, _) => {
    (0, pa.alwaysValidSchema)(i, f) || (n.if((0, qu._)`${d} > ${_}`, () => t.subschema({
      keyword: o,
      schemaProp: _,
      dataProp: _
    }, c)), t.ok(c));
  });
  function l(f) {
    const { opts: _, errSchemaPath: p } = i, w = r.length, $ = w === f.minItems && (w === f.maxItems || f[e] === !1);
    if (_.strictTuples && !$) {
      const y = `"${o}" is ${w}-tuple, but minItems or maxItems/${e} are not specified or different at path "${p}"`;
      (0, pa.checkStrictMode)(i, y, _.strictTuples);
    }
  }
}
Nn.validateTuple = kh;
Nn.default = k0;
Object.defineProperty(Pc, "__esModule", { value: !0 });
const A0 = Nn, C0 = {
  keyword: "prefixItems",
  type: "array",
  schemaType: ["array"],
  before: "uniqueItems",
  code: (t) => (0, A0.validateTuple)(t, "items")
};
Pc.default = C0;
var Rc = {};
Object.defineProperty(Rc, "__esModule", { value: !0 });
const zu = oe, j0 = F, M0 = fe, D0 = In, L0 = {
  message: ({ params: { len: t } }) => (0, zu.str)`must NOT have more than ${t} items`,
  params: ({ params: { len: t } }) => (0, zu._)`{limit: ${t}}`
}, F0 = {
  keyword: "items",
  type: "array",
  schemaType: ["object", "boolean"],
  before: "uniqueItems",
  error: L0,
  code(t) {
    const { schema: e, parentSchema: r, it: n } = t, { prefixItems: s } = r;
    n.items = !0, !(0, j0.alwaysValidSchema)(n, e) && (s ? (0, D0.validateAdditionalItems)(t, s) : t.ok((0, M0.validateArray)(t)));
  }
};
Rc.default = F0;
var Oc = {};
Object.defineProperty(Oc, "__esModule", { value: !0 });
const ut = oe, Vs = F, V0 = {
  message: ({ params: { min: t, max: e } }) => e === void 0 ? (0, ut.str)`must contain at least ${t} valid item(s)` : (0, ut.str)`must contain at least ${t} and no more than ${e} valid item(s)`,
  params: ({ params: { min: t, max: e } }) => e === void 0 ? (0, ut._)`{minContains: ${t}}` : (0, ut._)`{minContains: ${t}, maxContains: ${e}}`
}, x0 = {
  keyword: "contains",
  type: "array",
  schemaType: ["object", "boolean"],
  before: "uniqueItems",
  trackErrors: !0,
  error: V0,
  code(t) {
    const { gen: e, schema: r, parentSchema: n, data: s, it: a } = t;
    let o, i;
    const { minContains: c, maxContains: d } = n;
    a.opts.next ? (o = c === void 0 ? 1 : c, i = d) : o = 1;
    const l = e.const("len", (0, ut._)`${s}.length`);
    if (t.setParams({ min: o, max: i }), i === void 0 && o === 0) {
      (0, Vs.checkStrictMode)(a, '"minContains" == 0 without "maxContains": "contains" keyword ignored');
      return;
    }
    if (i !== void 0 && o > i) {
      (0, Vs.checkStrictMode)(a, '"minContains" > "maxContains" is always invalid'), t.fail();
      return;
    }
    if ((0, Vs.alwaysValidSchema)(a, r)) {
      let $ = (0, ut._)`${l} >= ${o}`;
      i !== void 0 && ($ = (0, ut._)`${$} && ${l} <= ${i}`), t.pass($);
      return;
    }
    a.items = !0;
    const f = e.name("valid");
    i === void 0 && o === 1 ? p(f, () => e.if(f, () => e.break())) : o === 0 ? (e.let(f, !0), i !== void 0 && e.if((0, ut._)`${s}.length > 0`, _)) : (e.let(f, !1), _()), t.result(f, () => t.reset());
    function _() {
      const $ = e.name("_valid"), y = e.let("count", 0);
      p($, () => e.if($, () => w(y)));
    }
    function p($, y) {
      e.forRange("i", 0, l, (m) => {
        t.subschema({
          keyword: "contains",
          dataProp: m,
          dataPropType: Vs.Type.Num,
          compositeRule: !0
        }, $), y();
      });
    }
    function w($) {
      e.code((0, ut._)`${$}++`), i === void 0 ? e.if((0, ut._)`${$} >= ${o}`, () => e.assign(f, !0).break()) : (e.if((0, ut._)`${$} > ${i}`, () => e.assign(f, !1).break()), o === 1 ? e.assign(f, !0) : e.if((0, ut._)`${$} >= ${o}`, () => e.assign(f, !0)));
    }
  }
};
Oc.default = x0;
var io = {};
(function(t) {
  Object.defineProperty(t, "__esModule", { value: !0 }), t.validateSchemaDeps = t.validatePropertyDeps = t.error = void 0;
  const e = oe, r = F, n = fe;
  t.error = {
    message: ({ params: { property: c, depsCount: d, deps: l } }) => {
      const f = d === 1 ? "property" : "properties";
      return (0, e.str)`must have ${f} ${l} when property ${c} is present`;
    },
    params: ({ params: { property: c, depsCount: d, deps: l, missingProperty: f } }) => (0, e._)`{property: ${c},
    missingProperty: ${f},
    depsCount: ${d},
    deps: ${l}}`
    // TODO change to reference
  };
  const s = {
    keyword: "dependencies",
    type: "object",
    schemaType: "object",
    error: t.error,
    code(c) {
      const [d, l] = a(c);
      o(c, d), i(c, l);
    }
  };
  function a({ schema: c }) {
    const d = {}, l = {};
    for (const f in c) {
      if (f === "__proto__")
        continue;
      const _ = Array.isArray(c[f]) ? d : l;
      _[f] = c[f];
    }
    return [d, l];
  }
  function o(c, d = c.schema) {
    const { gen: l, data: f, it: _ } = c;
    if (Object.keys(d).length === 0)
      return;
    const p = l.let("missing");
    for (const w in d) {
      const $ = d[w];
      if ($.length === 0)
        continue;
      const y = (0, n.propertyInData)(l, f, w, _.opts.ownProperties);
      c.setParams({
        property: w,
        depsCount: $.length,
        deps: $.join(", ")
      }), _.allErrors ? l.if(y, () => {
        for (const m of $)
          (0, n.checkReportMissingProp)(c, m);
      }) : (l.if((0, e._)`${y} && (${(0, n.checkMissingProp)(c, $, p)})`), (0, n.reportMissingProp)(c, p), l.else());
    }
  }
  t.validatePropertyDeps = o;
  function i(c, d = c.schema) {
    const { gen: l, data: f, keyword: _, it: p } = c, w = l.name("valid");
    for (const $ in d)
      (0, r.alwaysValidSchema)(p, d[$]) || (l.if(
        (0, n.propertyInData)(l, f, $, p.opts.ownProperties),
        () => {
          const y = c.subschema({ keyword: _, schemaProp: $ }, w);
          c.mergeValidEvaluated(y, w);
        },
        () => l.var(w, !0)
        // TODO var
      ), c.ok(w));
  }
  t.validateSchemaDeps = i, t.default = s;
})(io);
var Ic = {};
Object.defineProperty(Ic, "__esModule", { value: !0 });
const Ah = oe, U0 = F, q0 = {
  message: "property name must be valid",
  params: ({ params: t }) => (0, Ah._)`{propertyName: ${t.propertyName}}`
}, z0 = {
  keyword: "propertyNames",
  type: "object",
  schemaType: ["object", "boolean"],
  error: q0,
  code(t) {
    const { gen: e, schema: r, data: n, it: s } = t;
    if ((0, U0.alwaysValidSchema)(s, r))
      return;
    const a = e.name("valid");
    e.forIn("key", n, (o) => {
      t.setParams({ propertyName: o }), t.subschema({
        keyword: "propertyNames",
        data: o,
        dataTypes: ["string"],
        propertyName: o,
        compositeRule: !0
      }, a), e.if((0, Ah.not)(a), () => {
        t.error(!0), s.allErrors || e.break();
      });
    }), t.ok(a);
  }
};
Ic.default = z0;
var co = {};
Object.defineProperty(co, "__esModule", { value: !0 });
const xs = fe, $t = oe, K0 = ct, Us = F, G0 = {
  message: "must NOT have additional properties",
  params: ({ params: t }) => (0, $t._)`{additionalProperty: ${t.additionalProperty}}`
}, B0 = {
  keyword: "additionalProperties",
  type: ["object"],
  schemaType: ["boolean", "object"],
  allowUndefined: !0,
  trackErrors: !0,
  error: G0,
  code(t) {
    const { gen: e, schema: r, parentSchema: n, data: s, errsCount: a, it: o } = t;
    if (!a)
      throw new Error("ajv implementation error");
    const { allErrors: i, opts: c } = o;
    if (o.props = !0, c.removeAdditional !== "all" && (0, Us.alwaysValidSchema)(o, r))
      return;
    const d = (0, xs.allSchemaProperties)(n.properties), l = (0, xs.allSchemaProperties)(n.patternProperties);
    f(), t.ok((0, $t._)`${a} === ${K0.default.errors}`);
    function f() {
      e.forIn("key", s, (y) => {
        !d.length && !l.length ? w(y) : e.if(_(y), () => w(y));
      });
    }
    function _(y) {
      let m;
      if (d.length > 8) {
        const v = (0, Us.schemaRefOrVal)(o, n.properties, "properties");
        m = (0, xs.isOwnProperty)(e, v, y);
      } else d.length ? m = (0, $t.or)(...d.map((v) => (0, $t._)`${y} === ${v}`)) : m = $t.nil;
      return l.length && (m = (0, $t.or)(m, ...l.map((v) => (0, $t._)`${(0, xs.usePattern)(t, v)}.test(${y})`))), (0, $t.not)(m);
    }
    function p(y) {
      e.code((0, $t._)`delete ${s}[${y}]`);
    }
    function w(y) {
      if (c.removeAdditional === "all" || c.removeAdditional && r === !1) {
        p(y);
        return;
      }
      if (r === !1) {
        t.setParams({ additionalProperty: y }), t.error(), i || e.break();
        return;
      }
      if (typeof r == "object" && !(0, Us.alwaysValidSchema)(o, r)) {
        const m = e.name("valid");
        c.removeAdditional === "failing" ? ($(y, m, !1), e.if((0, $t.not)(m), () => {
          t.reset(), p(y);
        })) : ($(y, m), i || e.if((0, $t.not)(m), () => e.break()));
      }
    }
    function $(y, m, v) {
      const P = {
        keyword: "additionalProperties",
        dataProp: y,
        dataPropType: Us.Type.Str
      };
      v === !1 && Object.assign(P, {
        compositeRule: !0,
        createErrors: !1,
        allErrors: !1
      }), t.subschema(P, m);
    }
  }
};
co.default = B0;
var Nc = {};
Object.defineProperty(Nc, "__esModule", { value: !0 });
const H0 = Et, Ku = fe, Uo = F, Gu = co, W0 = {
  keyword: "properties",
  type: "object",
  schemaType: "object",
  code(t) {
    const { gen: e, schema: r, parentSchema: n, data: s, it: a } = t;
    a.opts.removeAdditional === "all" && n.additionalProperties === void 0 && Gu.default.code(new H0.KeywordCxt(a, Gu.default, "additionalProperties"));
    const o = (0, Ku.allSchemaProperties)(r);
    for (const f of o)
      a.definedProperties.add(f);
    a.opts.unevaluated && o.length && a.props !== !0 && (a.props = Uo.mergeEvaluated.props(e, (0, Uo.toHash)(o), a.props));
    const i = o.filter((f) => !(0, Uo.alwaysValidSchema)(a, r[f]));
    if (i.length === 0)
      return;
    const c = e.name("valid");
    for (const f of i)
      d(f) ? l(f) : (e.if((0, Ku.propertyInData)(e, s, f, a.opts.ownProperties)), l(f), a.allErrors || e.else().var(c, !0), e.endIf()), t.it.definedProperties.add(f), t.ok(c);
    function d(f) {
      return a.opts.useDefaults && !a.compositeRule && r[f].default !== void 0;
    }
    function l(f) {
      t.subschema({
        keyword: "properties",
        schemaProp: f,
        dataProp: f
      }, c);
    }
  }
};
Nc.default = W0;
var Tc = {};
Object.defineProperty(Tc, "__esModule", { value: !0 });
const Bu = fe, qs = oe, Hu = F, Wu = F, J0 = {
  keyword: "patternProperties",
  type: "object",
  schemaType: "object",
  code(t) {
    const { gen: e, schema: r, data: n, parentSchema: s, it: a } = t, { opts: o } = a, i = (0, Bu.allSchemaProperties)(r), c = i.filter(($) => (0, Hu.alwaysValidSchema)(a, r[$]));
    if (i.length === 0 || c.length === i.length && (!a.opts.unevaluated || a.props === !0))
      return;
    const d = o.strictSchema && !o.allowMatchingProperties && s.properties, l = e.name("valid");
    a.props !== !0 && !(a.props instanceof qs.Name) && (a.props = (0, Wu.evaluatedPropsToName)(e, a.props));
    const { props: f } = a;
    _();
    function _() {
      for (const $ of i)
        d && p($), a.allErrors ? w($) : (e.var(l, !0), w($), e.if(l));
    }
    function p($) {
      for (const y in d)
        new RegExp($).test(y) && (0, Hu.checkStrictMode)(a, `property ${y} matches pattern ${$} (use allowMatchingProperties)`);
    }
    function w($) {
      e.forIn("key", n, (y) => {
        e.if((0, qs._)`${(0, Bu.usePattern)(t, $)}.test(${y})`, () => {
          const m = c.includes($);
          m || t.subschema({
            keyword: "patternProperties",
            schemaProp: $,
            dataProp: y,
            dataPropType: Wu.Type.Str
          }, l), a.opts.unevaluated && f !== !0 ? e.assign((0, qs._)`${f}[${y}]`, !0) : !m && !a.allErrors && e.if((0, qs.not)(l), () => e.break());
        });
      });
    }
  }
};
Tc.default = J0;
var kc = {};
Object.defineProperty(kc, "__esModule", { value: !0 });
const X0 = F, Y0 = {
  keyword: "not",
  schemaType: ["object", "boolean"],
  trackErrors: !0,
  code(t) {
    const { gen: e, schema: r, it: n } = t;
    if ((0, X0.alwaysValidSchema)(n, r)) {
      t.fail();
      return;
    }
    const s = e.name("valid");
    t.subschema({
      keyword: "not",
      compositeRule: !0,
      createErrors: !1,
      allErrors: !1
    }, s), t.failResult(s, () => t.reset(), () => t.error());
  },
  error: { message: "must NOT be valid" }
};
kc.default = Y0;
var Ac = {};
Object.defineProperty(Ac, "__esModule", { value: !0 });
const Q0 = fe, Z0 = {
  keyword: "anyOf",
  schemaType: "array",
  trackErrors: !0,
  code: Q0.validateUnion,
  error: { message: "must match a schema in anyOf" }
};
Ac.default = Z0;
var Cc = {};
Object.defineProperty(Cc, "__esModule", { value: !0 });
const ya = oe, ev = F, tv = {
  message: "must match exactly one schema in oneOf",
  params: ({ params: t }) => (0, ya._)`{passingSchemas: ${t.passing}}`
}, rv = {
  keyword: "oneOf",
  schemaType: "array",
  trackErrors: !0,
  error: tv,
  code(t) {
    const { gen: e, schema: r, parentSchema: n, it: s } = t;
    if (!Array.isArray(r))
      throw new Error("ajv implementation error");
    if (s.opts.discriminator && n.discriminator)
      return;
    const a = r, o = e.let("valid", !1), i = e.let("passing", null), c = e.name("_valid");
    t.setParams({ passing: i }), e.block(d), t.result(o, () => t.reset(), () => t.error(!0));
    function d() {
      a.forEach((l, f) => {
        let _;
        (0, ev.alwaysValidSchema)(s, l) ? e.var(c, !0) : _ = t.subschema({
          keyword: "oneOf",
          schemaProp: f,
          compositeRule: !0
        }, c), f > 0 && e.if((0, ya._)`${c} && ${o}`).assign(o, !1).assign(i, (0, ya._)`[${i}, ${f}]`).else(), e.if(c, () => {
          e.assign(o, !0), e.assign(i, f), _ && t.mergeEvaluated(_, ya.Name);
        });
      });
    }
  }
};
Cc.default = rv;
var jc = {};
Object.defineProperty(jc, "__esModule", { value: !0 });
const nv = F, sv = {
  keyword: "allOf",
  schemaType: "array",
  code(t) {
    const { gen: e, schema: r, it: n } = t;
    if (!Array.isArray(r))
      throw new Error("ajv implementation error");
    const s = e.name("valid");
    r.forEach((a, o) => {
      if ((0, nv.alwaysValidSchema)(n, a))
        return;
      const i = t.subschema({ keyword: "allOf", schemaProp: o }, s);
      t.ok(s), t.mergeEvaluated(i);
    });
  }
};
jc.default = sv;
var Mc = {};
Object.defineProperty(Mc, "__esModule", { value: !0 });
const Da = oe, Ch = F, av = {
  message: ({ params: t }) => (0, Da.str)`must match "${t.ifClause}" schema`,
  params: ({ params: t }) => (0, Da._)`{failingKeyword: ${t.ifClause}}`
}, ov = {
  keyword: "if",
  schemaType: ["object", "boolean"],
  trackErrors: !0,
  error: av,
  code(t) {
    const { gen: e, parentSchema: r, it: n } = t;
    r.then === void 0 && r.else === void 0 && (0, Ch.checkStrictMode)(n, '"if" without "then" and "else" is ignored');
    const s = Ju(n, "then"), a = Ju(n, "else");
    if (!s && !a)
      return;
    const o = e.let("valid", !0), i = e.name("_valid");
    if (c(), t.reset(), s && a) {
      const l = e.let("ifClause");
      t.setParams({ ifClause: l }), e.if(i, d("then", l), d("else", l));
    } else s ? e.if(i, d("then")) : e.if((0, Da.not)(i), d("else"));
    t.pass(o, () => t.error(!0));
    function c() {
      const l = t.subschema({
        keyword: "if",
        compositeRule: !0,
        createErrors: !1,
        allErrors: !1
      }, i);
      t.mergeEvaluated(l);
    }
    function d(l, f) {
      return () => {
        const _ = t.subschema({ keyword: l }, i);
        e.assign(o, i), t.mergeValidEvaluated(_, o), f ? e.assign(f, (0, Da._)`${l}`) : t.setParams({ ifClause: l });
      };
    }
  }
};
function Ju(t, e) {
  const r = t.schema[e];
  return r !== void 0 && !(0, Ch.alwaysValidSchema)(t, r);
}
Mc.default = ov;
var Dc = {};
Object.defineProperty(Dc, "__esModule", { value: !0 });
const iv = F, cv = {
  keyword: ["then", "else"],
  schemaType: ["object", "boolean"],
  code({ keyword: t, parentSchema: e, it: r }) {
    e.if === void 0 && (0, iv.checkStrictMode)(r, `"${t}" without "if" is ignored`);
  }
};
Dc.default = cv;
Object.defineProperty(Sc, "__esModule", { value: !0 });
const lv = In, uv = Pc, dv = Nn, fv = Rc, hv = Oc, mv = io, pv = Ic, yv = co, $v = Nc, gv = Tc, _v = kc, vv = Ac, wv = Cc, bv = jc, Ev = Mc, Sv = Dc;
function Pv(t = !1) {
  const e = [
    // any
    _v.default,
    vv.default,
    wv.default,
    bv.default,
    Ev.default,
    Sv.default,
    // object
    pv.default,
    yv.default,
    mv.default,
    $v.default,
    gv.default
  ];
  return t ? e.push(uv.default, fv.default) : e.push(lv.default, dv.default), e.push(hv.default), e;
}
Sc.default = Pv;
var Lc = {}, Tn = {};
Object.defineProperty(Tn, "__esModule", { value: !0 });
Tn.dynamicAnchor = void 0;
const qo = oe, Rv = ct, Xu = Je, Ov = Wt, Iv = {
  keyword: "$dynamicAnchor",
  schemaType: "string",
  code: (t) => jh(t, t.schema)
};
function jh(t, e) {
  const { gen: r, it: n } = t;
  n.schemaEnv.root.dynamicAnchors[e] = !0;
  const s = (0, qo._)`${Rv.default.dynamicAnchors}${(0, qo.getProperty)(e)}`, a = n.errSchemaPath === "#" ? n.validateName : Nv(t);
  r.if((0, qo._)`!${s}`, () => r.assign(s, a));
}
Tn.dynamicAnchor = jh;
function Nv(t) {
  const { schemaEnv: e, schema: r, self: n } = t.it, { root: s, baseId: a, localRefs: o, meta: i } = e.root, { schemaId: c } = n.opts, d = new Xu.SchemaEnv({ schema: r, schemaId: c, root: s, baseId: a, localRefs: o, meta: i });
  return Xu.compileSchema.call(n, d), (0, Ov.getValidate)(t, d);
}
Tn.default = Iv;
var kn = {};
Object.defineProperty(kn, "__esModule", { value: !0 });
kn.dynamicRef = void 0;
const Yu = oe, Tv = ct, Qu = Wt, kv = {
  keyword: "$dynamicRef",
  schemaType: "string",
  code: (t) => Mh(t, t.schema)
};
function Mh(t, e) {
  const { gen: r, keyword: n, it: s } = t;
  if (e[0] !== "#")
    throw new Error(`"${n}" only supports hash fragment reference`);
  const a = e.slice(1);
  if (s.allErrors)
    o();
  else {
    const c = r.let("valid", !1);
    o(c), t.ok(c);
  }
  function o(c) {
    if (s.schemaEnv.root.dynamicAnchors[a]) {
      const d = r.let("_v", (0, Yu._)`${Tv.default.dynamicAnchors}${(0, Yu.getProperty)(a)}`);
      r.if(d, i(d, c), i(s.validateName, c));
    } else
      i(s.validateName, c)();
  }
  function i(c, d) {
    return d ? () => r.block(() => {
      (0, Qu.callRef)(t, c), r.let(d, !0);
    }) : () => (0, Qu.callRef)(t, c);
  }
}
kn.dynamicRef = Mh;
kn.default = kv;
var Fc = {};
Object.defineProperty(Fc, "__esModule", { value: !0 });
const Av = Tn, Cv = F, jv = {
  keyword: "$recursiveAnchor",
  schemaType: "boolean",
  code(t) {
    t.schema ? (0, Av.dynamicAnchor)(t, "") : (0, Cv.checkStrictMode)(t.it, "$recursiveAnchor: false is ignored");
  }
};
Fc.default = jv;
var Vc = {};
Object.defineProperty(Vc, "__esModule", { value: !0 });
const Mv = kn, Dv = {
  keyword: "$recursiveRef",
  schemaType: "string",
  code: (t) => (0, Mv.dynamicRef)(t, t.schema)
};
Vc.default = Dv;
Object.defineProperty(Lc, "__esModule", { value: !0 });
const Lv = Tn, Fv = kn, Vv = Fc, xv = Vc, Uv = [Lv.default, Fv.default, Vv.default, xv.default];
Lc.default = Uv;
var xc = {}, Uc = {};
Object.defineProperty(Uc, "__esModule", { value: !0 });
const Zu = io, qv = {
  keyword: "dependentRequired",
  type: "object",
  schemaType: "object",
  error: Zu.error,
  code: (t) => (0, Zu.validatePropertyDeps)(t)
};
Uc.default = qv;
var qc = {};
Object.defineProperty(qc, "__esModule", { value: !0 });
const zv = io, Kv = {
  keyword: "dependentSchemas",
  type: "object",
  schemaType: "object",
  code: (t) => (0, zv.validateSchemaDeps)(t)
};
qc.default = Kv;
var zc = {};
Object.defineProperty(zc, "__esModule", { value: !0 });
const Gv = F, Bv = {
  keyword: ["maxContains", "minContains"],
  type: "array",
  schemaType: "number",
  code({ keyword: t, parentSchema: e, it: r }) {
    e.contains === void 0 && (0, Gv.checkStrictMode)(r, `"${t}" without "contains" is ignored`);
  }
};
zc.default = Bv;
Object.defineProperty(xc, "__esModule", { value: !0 });
const Hv = Uc, Wv = qc, Jv = zc, Xv = [Hv.default, Wv.default, Jv.default];
xc.default = Xv;
var Kc = {}, Gc = {};
Object.defineProperty(Gc, "__esModule", { value: !0 });
const or = oe, ed = F, Yv = ct, Qv = {
  message: "must NOT have unevaluated properties",
  params: ({ params: t }) => (0, or._)`{unevaluatedProperty: ${t.unevaluatedProperty}}`
}, Zv = {
  keyword: "unevaluatedProperties",
  type: "object",
  schemaType: ["boolean", "object"],
  trackErrors: !0,
  error: Qv,
  code(t) {
    const { gen: e, schema: r, data: n, errsCount: s, it: a } = t;
    if (!s)
      throw new Error("ajv implementation error");
    const { allErrors: o, props: i } = a;
    i instanceof or.Name ? e.if((0, or._)`${i} !== true`, () => e.forIn("key", n, (f) => e.if(d(i, f), () => c(f)))) : i !== !0 && e.forIn("key", n, (f) => i === void 0 ? c(f) : e.if(l(i, f), () => c(f))), a.props = !0, t.ok((0, or._)`${s} === ${Yv.default.errors}`);
    function c(f) {
      if (r === !1) {
        t.setParams({ unevaluatedProperty: f }), t.error(), o || e.break();
        return;
      }
      if (!(0, ed.alwaysValidSchema)(a, r)) {
        const _ = e.name("valid");
        t.subschema({
          keyword: "unevaluatedProperties",
          dataProp: f,
          dataPropType: ed.Type.Str
        }, _), o || e.if((0, or.not)(_), () => e.break());
      }
    }
    function d(f, _) {
      return (0, or._)`!${f} || !${f}[${_}]`;
    }
    function l(f, _) {
      const p = [];
      for (const w in f)
        f[w] === !0 && p.push((0, or._)`${_} !== ${w}`);
      return (0, or.and)(...p);
    }
  }
};
Gc.default = Zv;
var Bc = {};
Object.defineProperty(Bc, "__esModule", { value: !0 });
const Lr = oe, td = F, ew = {
  message: ({ params: { len: t } }) => (0, Lr.str)`must NOT have more than ${t} items`,
  params: ({ params: { len: t } }) => (0, Lr._)`{limit: ${t}}`
}, tw = {
  keyword: "unevaluatedItems",
  type: "array",
  schemaType: ["boolean", "object"],
  error: ew,
  code(t) {
    const { gen: e, schema: r, data: n, it: s } = t, a = s.items || 0;
    if (a === !0)
      return;
    const o = e.const("len", (0, Lr._)`${n}.length`);
    if (r === !1)
      t.setParams({ len: a }), t.fail((0, Lr._)`${o} > ${a}`);
    else if (typeof r == "object" && !(0, td.alwaysValidSchema)(s, r)) {
      const c = e.var("valid", (0, Lr._)`${o} <= ${a}`);
      e.if((0, Lr.not)(c), () => i(c, a)), t.ok(c);
    }
    s.items = !0;
    function i(c, d) {
      e.forRange("i", d, o, (l) => {
        t.subschema({ keyword: "unevaluatedItems", dataProp: l, dataPropType: td.Type.Num }, c), s.allErrors || e.if((0, Lr.not)(c), () => e.break());
      });
    }
  }
};
Bc.default = tw;
Object.defineProperty(Kc, "__esModule", { value: !0 });
const rw = Gc, nw = Bc, sw = [rw.default, nw.default];
Kc.default = sw;
var Hc = {}, Wc = {};
Object.defineProperty(Wc, "__esModule", { value: !0 });
const be = oe, aw = {
  message: ({ schemaCode: t }) => (0, be.str)`must match format "${t}"`,
  params: ({ schemaCode: t }) => (0, be._)`{format: ${t}}`
}, ow = {
  keyword: "format",
  type: ["number", "string"],
  schemaType: "string",
  $data: !0,
  error: aw,
  code(t, e) {
    const { gen: r, data: n, $data: s, schema: a, schemaCode: o, it: i } = t, { opts: c, errSchemaPath: d, schemaEnv: l, self: f } = i;
    if (!c.validateFormats)
      return;
    s ? _() : p();
    function _() {
      const w = r.scopeValue("formats", {
        ref: f.formats,
        code: c.code.formats
      }), $ = r.const("fDef", (0, be._)`${w}[${o}]`), y = r.let("fType"), m = r.let("format");
      r.if((0, be._)`typeof ${$} == "object" && !(${$} instanceof RegExp)`, () => r.assign(y, (0, be._)`${$}.type || "string"`).assign(m, (0, be._)`${$}.validate`), () => r.assign(y, (0, be._)`"string"`).assign(m, $)), t.fail$data((0, be.or)(v(), P()));
      function v() {
        return c.strictSchema === !1 ? be.nil : (0, be._)`${o} && !${m}`;
      }
      function P() {
        const R = l.$async ? (0, be._)`(${$}.async ? await ${m}(${n}) : ${m}(${n}))` : (0, be._)`${m}(${n})`, N = (0, be._)`(typeof ${m} == "function" ? ${R} : ${m}.test(${n}))`;
        return (0, be._)`${m} && ${m} !== true && ${y} === ${e} && !${N}`;
      }
    }
    function p() {
      const w = f.formats[a];
      if (!w) {
        v();
        return;
      }
      if (w === !0)
        return;
      const [$, y, m] = P(w);
      $ === e && t.pass(R());
      function v() {
        if (c.strictSchema === !1) {
          f.logger.warn(N());
          return;
        }
        throw new Error(N());
        function N() {
          return `unknown format "${a}" ignored in schema at path "${d}"`;
        }
      }
      function P(N) {
        const D = N instanceof RegExp ? (0, be.regexpCode)(N) : c.code.formats ? (0, be._)`${c.code.formats}${(0, be.getProperty)(a)}` : void 0, L = r.scopeValue("formats", { key: a, ref: N, code: D });
        return typeof N == "object" && !(N instanceof RegExp) ? [N.type || "string", N.validate, (0, be._)`${L}.validate`] : ["string", N, L];
      }
      function R() {
        if (typeof w == "object" && !(w instanceof RegExp) && w.async) {
          if (!l.$async)
            throw new Error("async format in sync schema");
          return (0, be._)`await ${m}(${n})`;
        }
        return typeof y == "function" ? (0, be._)`${m}(${n})` : (0, be._)`${m}.test(${n})`;
      }
    }
  }
};
Wc.default = ow;
Object.defineProperty(Hc, "__esModule", { value: !0 });
const iw = Wc, cw = [iw.default];
Hc.default = cw;
var En = {};
Object.defineProperty(En, "__esModule", { value: !0 });
En.contentVocabulary = En.metadataVocabulary = void 0;
En.metadataVocabulary = [
  "title",
  "description",
  "default",
  "deprecated",
  "readOnly",
  "writeOnly",
  "examples"
];
En.contentVocabulary = [
  "contentMediaType",
  "contentEncoding",
  "contentSchema"
];
Object.defineProperty(lc, "__esModule", { value: !0 });
const lw = uc, uw = fc, dw = Sc, fw = Lc, hw = xc, mw = Kc, pw = Hc, rd = En, yw = [
  fw.default,
  lw.default,
  uw.default,
  (0, dw.default)(!0),
  pw.default,
  rd.metadataVocabulary,
  rd.contentVocabulary,
  hw.default,
  mw.default
];
lc.default = yw;
var Jc = {}, lo = {};
Object.defineProperty(lo, "__esModule", { value: !0 });
lo.DiscrError = void 0;
var nd;
(function(t) {
  t.Tag = "tag", t.Mapping = "mapping";
})(nd || (lo.DiscrError = nd = {}));
Object.defineProperty(Jc, "__esModule", { value: !0 });
const cn = oe, _i = lo, sd = Je, $w = On, gw = F, _w = {
  message: ({ params: { discrError: t, tagName: e } }) => t === _i.DiscrError.Tag ? `tag "${e}" must be string` : `value of tag "${e}" must be in oneOf`,
  params: ({ params: { discrError: t, tag: e, tagName: r } }) => (0, cn._)`{error: ${t}, tag: ${r}, tagValue: ${e}}`
}, vw = {
  keyword: "discriminator",
  type: "object",
  schemaType: "object",
  error: _w,
  code(t) {
    const { gen: e, data: r, schema: n, parentSchema: s, it: a } = t, { oneOf: o } = s;
    if (!a.opts.discriminator)
      throw new Error("discriminator: requires discriminator option");
    const i = n.propertyName;
    if (typeof i != "string")
      throw new Error("discriminator: requires propertyName");
    if (n.mapping)
      throw new Error("discriminator: mapping is not supported");
    if (!o)
      throw new Error("discriminator: requires oneOf keyword");
    const c = e.let("valid", !1), d = e.const("tag", (0, cn._)`${r}${(0, cn.getProperty)(i)}`);
    e.if((0, cn._)`typeof ${d} == "string"`, () => l(), () => t.error(!1, { discrError: _i.DiscrError.Tag, tag: d, tagName: i })), t.ok(c);
    function l() {
      const p = _();
      e.if(!1);
      for (const w in p)
        e.elseIf((0, cn._)`${d} === ${w}`), e.assign(c, f(p[w]));
      e.else(), t.error(!1, { discrError: _i.DiscrError.Mapping, tag: d, tagName: i }), e.endIf();
    }
    function f(p) {
      const w = e.name("valid"), $ = t.subschema({ keyword: "oneOf", schemaProp: p }, w);
      return t.mergeEvaluated($, cn.Name), w;
    }
    function _() {
      var p;
      const w = {}, $ = m(s);
      let y = !0;
      for (let R = 0; R < o.length; R++) {
        let N = o[R];
        if (N != null && N.$ref && !(0, gw.schemaHasRulesButRef)(N, a.self.RULES)) {
          const L = N.$ref;
          if (N = sd.resolveRef.call(a.self, a.schemaEnv.root, a.baseId, L), N instanceof sd.SchemaEnv && (N = N.schema), N === void 0)
            throw new $w.default(a.opts.uriResolver, a.baseId, L);
        }
        const D = (p = N == null ? void 0 : N.properties) === null || p === void 0 ? void 0 : p[i];
        if (typeof D != "object")
          throw new Error(`discriminator: oneOf subschemas (or referenced schemas) must have "properties/${i}"`);
        y = y && ($ || m(N)), v(D, R);
      }
      if (!y)
        throw new Error(`discriminator: "${i}" must be required`);
      return w;
      function m({ required: R }) {
        return Array.isArray(R) && R.includes(i);
      }
      function v(R, N) {
        if (R.const)
          P(R.const, N);
        else if (R.enum)
          for (const D of R.enum)
            P(D, N);
        else
          throw new Error(`discriminator: "properties/${i}" must have "const" or "enum"`);
      }
      function P(R, N) {
        if (typeof R != "string" || R in w)
          throw new Error(`discriminator: "${i}" values must be unique strings`);
        w[R] = N;
      }
    }
  }
};
Jc.default = vw;
var Xc = {};
const ww = "https://json-schema.org/draft/2020-12/schema", bw = "https://json-schema.org/draft/2020-12/schema", Ew = {
  "https://json-schema.org/draft/2020-12/vocab/core": !0,
  "https://json-schema.org/draft/2020-12/vocab/applicator": !0,
  "https://json-schema.org/draft/2020-12/vocab/unevaluated": !0,
  "https://json-schema.org/draft/2020-12/vocab/validation": !0,
  "https://json-schema.org/draft/2020-12/vocab/meta-data": !0,
  "https://json-schema.org/draft/2020-12/vocab/format-annotation": !0,
  "https://json-schema.org/draft/2020-12/vocab/content": !0
}, Sw = "meta", Pw = "Core and Validation specifications meta-schema", Rw = [
  {
    $ref: "meta/core"
  },
  {
    $ref: "meta/applicator"
  },
  {
    $ref: "meta/unevaluated"
  },
  {
    $ref: "meta/validation"
  },
  {
    $ref: "meta/meta-data"
  },
  {
    $ref: "meta/format-annotation"
  },
  {
    $ref: "meta/content"
  }
], Ow = [
  "object",
  "boolean"
], Iw = "This meta-schema also defines keywords that have appeared in previous drafts in order to prevent incompatible extensions as they remain in common use.", Nw = {
  definitions: {
    $comment: '"definitions" has been replaced by "$defs".',
    type: "object",
    additionalProperties: {
      $dynamicRef: "#meta"
    },
    deprecated: !0,
    default: {}
  },
  dependencies: {
    $comment: '"dependencies" has been split and replaced by "dependentSchemas" and "dependentRequired" in order to serve their differing semantics.',
    type: "object",
    additionalProperties: {
      anyOf: [
        {
          $dynamicRef: "#meta"
        },
        {
          $ref: "meta/validation#/$defs/stringArray"
        }
      ]
    },
    deprecated: !0,
    default: {}
  },
  $recursiveAnchor: {
    $comment: '"$recursiveAnchor" has been replaced by "$dynamicAnchor".',
    $ref: "meta/core#/$defs/anchorString",
    deprecated: !0
  },
  $recursiveRef: {
    $comment: '"$recursiveRef" has been replaced by "$dynamicRef".',
    $ref: "meta/core#/$defs/uriReferenceString",
    deprecated: !0
  }
}, Tw = {
  $schema: ww,
  $id: bw,
  $vocabulary: Ew,
  $dynamicAnchor: Sw,
  title: Pw,
  allOf: Rw,
  type: Ow,
  $comment: Iw,
  properties: Nw
}, kw = "https://json-schema.org/draft/2020-12/schema", Aw = "https://json-schema.org/draft/2020-12/meta/applicator", Cw = {
  "https://json-schema.org/draft/2020-12/vocab/applicator": !0
}, jw = "meta", Mw = "Applicator vocabulary meta-schema", Dw = [
  "object",
  "boolean"
], Lw = {
  prefixItems: {
    $ref: "#/$defs/schemaArray"
  },
  items: {
    $dynamicRef: "#meta"
  },
  contains: {
    $dynamicRef: "#meta"
  },
  additionalProperties: {
    $dynamicRef: "#meta"
  },
  properties: {
    type: "object",
    additionalProperties: {
      $dynamicRef: "#meta"
    },
    default: {}
  },
  patternProperties: {
    type: "object",
    additionalProperties: {
      $dynamicRef: "#meta"
    },
    propertyNames: {
      format: "regex"
    },
    default: {}
  },
  dependentSchemas: {
    type: "object",
    additionalProperties: {
      $dynamicRef: "#meta"
    },
    default: {}
  },
  propertyNames: {
    $dynamicRef: "#meta"
  },
  if: {
    $dynamicRef: "#meta"
  },
  then: {
    $dynamicRef: "#meta"
  },
  else: {
    $dynamicRef: "#meta"
  },
  allOf: {
    $ref: "#/$defs/schemaArray"
  },
  anyOf: {
    $ref: "#/$defs/schemaArray"
  },
  oneOf: {
    $ref: "#/$defs/schemaArray"
  },
  not: {
    $dynamicRef: "#meta"
  }
}, Fw = {
  schemaArray: {
    type: "array",
    minItems: 1,
    items: {
      $dynamicRef: "#meta"
    }
  }
}, Vw = {
  $schema: kw,
  $id: Aw,
  $vocabulary: Cw,
  $dynamicAnchor: jw,
  title: Mw,
  type: Dw,
  properties: Lw,
  $defs: Fw
}, xw = "https://json-schema.org/draft/2020-12/schema", Uw = "https://json-schema.org/draft/2020-12/meta/unevaluated", qw = {
  "https://json-schema.org/draft/2020-12/vocab/unevaluated": !0
}, zw = "meta", Kw = "Unevaluated applicator vocabulary meta-schema", Gw = [
  "object",
  "boolean"
], Bw = {
  unevaluatedItems: {
    $dynamicRef: "#meta"
  },
  unevaluatedProperties: {
    $dynamicRef: "#meta"
  }
}, Hw = {
  $schema: xw,
  $id: Uw,
  $vocabulary: qw,
  $dynamicAnchor: zw,
  title: Kw,
  type: Gw,
  properties: Bw
}, Ww = "https://json-schema.org/draft/2020-12/schema", Jw = "https://json-schema.org/draft/2020-12/meta/content", Xw = {
  "https://json-schema.org/draft/2020-12/vocab/content": !0
}, Yw = "meta", Qw = "Content vocabulary meta-schema", Zw = [
  "object",
  "boolean"
], eb = {
  contentEncoding: {
    type: "string"
  },
  contentMediaType: {
    type: "string"
  },
  contentSchema: {
    $dynamicRef: "#meta"
  }
}, tb = {
  $schema: Ww,
  $id: Jw,
  $vocabulary: Xw,
  $dynamicAnchor: Yw,
  title: Qw,
  type: Zw,
  properties: eb
}, rb = "https://json-schema.org/draft/2020-12/schema", nb = "https://json-schema.org/draft/2020-12/meta/core", sb = {
  "https://json-schema.org/draft/2020-12/vocab/core": !0
}, ab = "meta", ob = "Core vocabulary meta-schema", ib = [
  "object",
  "boolean"
], cb = {
  $id: {
    $ref: "#/$defs/uriReferenceString",
    $comment: "Non-empty fragments not allowed.",
    pattern: "^[^#]*#?$"
  },
  $schema: {
    $ref: "#/$defs/uriString"
  },
  $ref: {
    $ref: "#/$defs/uriReferenceString"
  },
  $anchor: {
    $ref: "#/$defs/anchorString"
  },
  $dynamicRef: {
    $ref: "#/$defs/uriReferenceString"
  },
  $dynamicAnchor: {
    $ref: "#/$defs/anchorString"
  },
  $vocabulary: {
    type: "object",
    propertyNames: {
      $ref: "#/$defs/uriString"
    },
    additionalProperties: {
      type: "boolean"
    }
  },
  $comment: {
    type: "string"
  },
  $defs: {
    type: "object",
    additionalProperties: {
      $dynamicRef: "#meta"
    }
  }
}, lb = {
  anchorString: {
    type: "string",
    pattern: "^[A-Za-z_][-A-Za-z0-9._]*$"
  },
  uriString: {
    type: "string",
    format: "uri"
  },
  uriReferenceString: {
    type: "string",
    format: "uri-reference"
  }
}, ub = {
  $schema: rb,
  $id: nb,
  $vocabulary: sb,
  $dynamicAnchor: ab,
  title: ob,
  type: ib,
  properties: cb,
  $defs: lb
}, db = "https://json-schema.org/draft/2020-12/schema", fb = "https://json-schema.org/draft/2020-12/meta/format-annotation", hb = {
  "https://json-schema.org/draft/2020-12/vocab/format-annotation": !0
}, mb = "meta", pb = "Format vocabulary meta-schema for annotation results", yb = [
  "object",
  "boolean"
], $b = {
  format: {
    type: "string"
  }
}, gb = {
  $schema: db,
  $id: fb,
  $vocabulary: hb,
  $dynamicAnchor: mb,
  title: pb,
  type: yb,
  properties: $b
}, _b = "https://json-schema.org/draft/2020-12/schema", vb = "https://json-schema.org/draft/2020-12/meta/meta-data", wb = {
  "https://json-schema.org/draft/2020-12/vocab/meta-data": !0
}, bb = "meta", Eb = "Meta-data vocabulary meta-schema", Sb = [
  "object",
  "boolean"
], Pb = {
  title: {
    type: "string"
  },
  description: {
    type: "string"
  },
  default: !0,
  deprecated: {
    type: "boolean",
    default: !1
  },
  readOnly: {
    type: "boolean",
    default: !1
  },
  writeOnly: {
    type: "boolean",
    default: !1
  },
  examples: {
    type: "array",
    items: !0
  }
}, Rb = {
  $schema: _b,
  $id: vb,
  $vocabulary: wb,
  $dynamicAnchor: bb,
  title: Eb,
  type: Sb,
  properties: Pb
}, Ob = "https://json-schema.org/draft/2020-12/schema", Ib = "https://json-schema.org/draft/2020-12/meta/validation", Nb = {
  "https://json-schema.org/draft/2020-12/vocab/validation": !0
}, Tb = "meta", kb = "Validation vocabulary meta-schema", Ab = [
  "object",
  "boolean"
], Cb = {
  type: {
    anyOf: [
      {
        $ref: "#/$defs/simpleTypes"
      },
      {
        type: "array",
        items: {
          $ref: "#/$defs/simpleTypes"
        },
        minItems: 1,
        uniqueItems: !0
      }
    ]
  },
  const: !0,
  enum: {
    type: "array",
    items: !0
  },
  multipleOf: {
    type: "number",
    exclusiveMinimum: 0
  },
  maximum: {
    type: "number"
  },
  exclusiveMaximum: {
    type: "number"
  },
  minimum: {
    type: "number"
  },
  exclusiveMinimum: {
    type: "number"
  },
  maxLength: {
    $ref: "#/$defs/nonNegativeInteger"
  },
  minLength: {
    $ref: "#/$defs/nonNegativeIntegerDefault0"
  },
  pattern: {
    type: "string",
    format: "regex"
  },
  maxItems: {
    $ref: "#/$defs/nonNegativeInteger"
  },
  minItems: {
    $ref: "#/$defs/nonNegativeIntegerDefault0"
  },
  uniqueItems: {
    type: "boolean",
    default: !1
  },
  maxContains: {
    $ref: "#/$defs/nonNegativeInteger"
  },
  minContains: {
    $ref: "#/$defs/nonNegativeInteger",
    default: 1
  },
  maxProperties: {
    $ref: "#/$defs/nonNegativeInteger"
  },
  minProperties: {
    $ref: "#/$defs/nonNegativeIntegerDefault0"
  },
  required: {
    $ref: "#/$defs/stringArray"
  },
  dependentRequired: {
    type: "object",
    additionalProperties: {
      $ref: "#/$defs/stringArray"
    }
  }
}, jb = {
  nonNegativeInteger: {
    type: "integer",
    minimum: 0
  },
  nonNegativeIntegerDefault0: {
    $ref: "#/$defs/nonNegativeInteger",
    default: 0
  },
  simpleTypes: {
    enum: [
      "array",
      "boolean",
      "integer",
      "null",
      "number",
      "object",
      "string"
    ]
  },
  stringArray: {
    type: "array",
    items: {
      type: "string"
    },
    uniqueItems: !0,
    default: []
  }
}, Mb = {
  $schema: Ob,
  $id: Ib,
  $vocabulary: Nb,
  $dynamicAnchor: Tb,
  title: kb,
  type: Ab,
  properties: Cb,
  $defs: jb
};
Object.defineProperty(Xc, "__esModule", { value: !0 });
const Db = Tw, Lb = Vw, Fb = Hw, Vb = tb, xb = ub, Ub = gb, qb = Rb, zb = Mb, Kb = ["/properties"];
function Gb(t) {
  return [
    Db,
    Lb,
    Fb,
    Vb,
    xb,
    e(this, Ub),
    qb,
    e(this, zb)
  ].forEach((r) => this.addMetaSchema(r, void 0, !1)), this;
  function e(r, n) {
    return t ? r.$dataMetaSchema(n, Kb) : n;
  }
}
Xc.default = Gb;
(function(t, e) {
  Object.defineProperty(e, "__esModule", { value: !0 }), e.MissingRefError = e.ValidationError = e.CodeGen = e.Name = e.nil = e.stringify = e.str = e._ = e.KeywordCxt = e.Ajv2020 = void 0;
  const r = Lf, n = lc, s = Jc, a = Xc, o = "https://json-schema.org/draft/2020-12/schema";
  class i extends r.default {
    constructor(p = {}) {
      super({
        ...p,
        dynamicRef: !0,
        next: !0,
        unevaluated: !0
      });
    }
    _addVocabularies() {
      super._addVocabularies(), n.default.forEach((p) => this.addVocabulary(p)), this.opts.discriminator && this.addKeyword(s.default);
    }
    _addDefaultMetaSchema() {
      super._addDefaultMetaSchema();
      const { $data: p, meta: w } = this.opts;
      w && (a.default.call(this, p), this.refs["http://json-schema.org/schema"] = o);
    }
    defaultMeta() {
      return this.opts.defaultMeta = super.defaultMeta() || (this.getSchema(o) ? o : void 0);
    }
  }
  e.Ajv2020 = i, t.exports = e = i, t.exports.Ajv2020 = i, Object.defineProperty(e, "__esModule", { value: !0 }), e.default = i;
  var c = Et;
  Object.defineProperty(e, "KeywordCxt", { enumerable: !0, get: function() {
    return c.KeywordCxt;
  } });
  var d = oe;
  Object.defineProperty(e, "_", { enumerable: !0, get: function() {
    return d._;
  } }), Object.defineProperty(e, "str", { enumerable: !0, get: function() {
    return d.str;
  } }), Object.defineProperty(e, "stringify", { enumerable: !0, get: function() {
    return d.stringify;
  } }), Object.defineProperty(e, "nil", { enumerable: !0, get: function() {
    return d.nil;
  } }), Object.defineProperty(e, "Name", { enumerable: !0, get: function() {
    return d.Name;
  } }), Object.defineProperty(e, "CodeGen", { enumerable: !0, get: function() {
    return d.CodeGen;
  } });
  var l = Rs;
  Object.defineProperty(e, "ValidationError", { enumerable: !0, get: function() {
    return l.default;
  } });
  var f = On;
  Object.defineProperty(e, "MissingRefError", { enumerable: !0, get: function() {
    return f.default;
  } });
})(fi, fi.exports);
var Bb = fi.exports, vi = { exports: {} }, Dh = {};
(function(t) {
  Object.defineProperty(t, "__esModule", { value: !0 }), t.formatNames = t.fastFormats = t.fullFormats = void 0;
  function e(M, B) {
    return { validate: M, compare: B };
  }
  t.fullFormats = {
    // date: http://tools.ietf.org/html/rfc3339#section-5.6
    date: e(a, o),
    // date-time: http://tools.ietf.org/html/rfc3339#section-5.6
    time: e(c(!0), d),
    "date-time": e(_(!0), p),
    "iso-time": e(c(), l),
    "iso-date-time": e(_(), w),
    // duration: https://tools.ietf.org/html/rfc3339#appendix-A
    duration: /^P(?!$)((\d+Y)?(\d+M)?(\d+D)?(T(?=\d)(\d+H)?(\d+M)?(\d+S)?)?|(\d+W)?)$/,
    uri: m,
    "uri-reference": /^(?:[a-z][a-z0-9+\-.]*:)?(?:\/?\/(?:(?:[a-z0-9\-._~!$&'()*+,;=:]|%[0-9a-f]{2})*@)?(?:\[(?:(?:(?:(?:[0-9a-f]{1,4}:){6}|::(?:[0-9a-f]{1,4}:){5}|(?:[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){4}|(?:(?:[0-9a-f]{1,4}:){0,1}[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){3}|(?:(?:[0-9a-f]{1,4}:){0,2}[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){2}|(?:(?:[0-9a-f]{1,4}:){0,3}[0-9a-f]{1,4})?::[0-9a-f]{1,4}:|(?:(?:[0-9a-f]{1,4}:){0,4}[0-9a-f]{1,4})?::)(?:[0-9a-f]{1,4}:[0-9a-f]{1,4}|(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?))|(?:(?:[0-9a-f]{1,4}:){0,5}[0-9a-f]{1,4})?::[0-9a-f]{1,4}|(?:(?:[0-9a-f]{1,4}:){0,6}[0-9a-f]{1,4})?::)|[Vv][0-9a-f]+\.[a-z0-9\-._~!$&'()*+,;=:]+)\]|(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)|(?:[a-z0-9\-._~!$&'"()*+,;=]|%[0-9a-f]{2})*)(?::\d*)?(?:\/(?:[a-z0-9\-._~!$&'"()*+,;=:@]|%[0-9a-f]{2})*)*|\/(?:(?:[a-z0-9\-._~!$&'"()*+,;=:@]|%[0-9a-f]{2})+(?:\/(?:[a-z0-9\-._~!$&'"()*+,;=:@]|%[0-9a-f]{2})*)*)?|(?:[a-z0-9\-._~!$&'"()*+,;=:@]|%[0-9a-f]{2})+(?:\/(?:[a-z0-9\-._~!$&'"()*+,;=:@]|%[0-9a-f]{2})*)*)?(?:\?(?:[a-z0-9\-._~!$&'"()*+,;=:@/?]|%[0-9a-f]{2})*)?(?:#(?:[a-z0-9\-._~!$&'"()*+,;=:@/?]|%[0-9a-f]{2})*)?$/i,
    // uri-template: https://tools.ietf.org/html/rfc6570
    "uri-template": /^(?:(?:[^\x00-\x20"'<>%\\^`{|}]|%[0-9a-f]{2})|\{[+#./;?&=,!@|]?(?:[a-z0-9_]|%[0-9a-f]{2})+(?::[1-9][0-9]{0,3}|\*)?(?:,(?:[a-z0-9_]|%[0-9a-f]{2})+(?::[1-9][0-9]{0,3}|\*)?)*\})*$/i,
    // For the source: https://gist.github.com/dperini/729294
    // For test cases: https://mathiasbynens.be/demo/url-regex
    url: /^(?:https?|ftp):\/\/(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z0-9\u{00a1}-\u{ffff}]+-)*[a-z0-9\u{00a1}-\u{ffff}]+)(?:\.(?:[a-z0-9\u{00a1}-\u{ffff}]+-)*[a-z0-9\u{00a1}-\u{ffff}]+)*(?:\.(?:[a-z\u{00a1}-\u{ffff}]{2,})))(?::\d{2,5})?(?:\/[^\s]*)?$/iu,
    email: /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/i,
    hostname: /^(?=.{1,253}\.?$)[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[-0-9a-z]{0,61}[0-9a-z])?)*\.?$/i,
    // optimized https://www.safaribooksonline.com/library/view/regular-expressions-cookbook/9780596802837/ch07s16.html
    ipv4: /^(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)\.){3}(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)$/,
    ipv6: /^((([0-9a-f]{1,4}:){7}([0-9a-f]{1,4}|:))|(([0-9a-f]{1,4}:){6}(:[0-9a-f]{1,4}|((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9a-f]{1,4}:){5}(((:[0-9a-f]{1,4}){1,2})|:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9a-f]{1,4}:){4}(((:[0-9a-f]{1,4}){1,3})|((:[0-9a-f]{1,4})?:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9a-f]{1,4}:){3}(((:[0-9a-f]{1,4}){1,4})|((:[0-9a-f]{1,4}){0,2}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9a-f]{1,4}:){2}(((:[0-9a-f]{1,4}){1,5})|((:[0-9a-f]{1,4}){0,3}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9a-f]{1,4}:){1}(((:[0-9a-f]{1,4}){1,6})|((:[0-9a-f]{1,4}){0,4}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(:(((:[0-9a-f]{1,4}){1,7})|((:[0-9a-f]{1,4}){0,5}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:)))$/i,
    regex: ne,
    // uuid: http://tools.ietf.org/html/rfc4122
    uuid: /^(?:urn:uuid:)?[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i,
    // JSON-pointer: https://tools.ietf.org/html/rfc6901
    // uri fragment: https://tools.ietf.org/html/rfc3986#appendix-A
    "json-pointer": /^(?:\/(?:[^~/]|~0|~1)*)*$/,
    "json-pointer-uri-fragment": /^#(?:\/(?:[a-z0-9_\-.!$&'()*+,;:=@]|%[0-9a-f]{2}|~0|~1)*)*$/i,
    // relative JSON-pointer: http://tools.ietf.org/html/draft-luff-relative-json-pointer-00
    "relative-json-pointer": /^(?:0|[1-9][0-9]*)(?:#|(?:\/(?:[^~/]|~0|~1)*)*)$/,
    // the following formats are used by the openapi specification: https://spec.openapis.org/oas/v3.0.0#data-types
    // byte: https://github.com/miguelmota/is-base64
    byte: P,
    // signed 32 bit integer
    int32: { type: "number", validate: D },
    // signed 64 bit integer
    int64: { type: "number", validate: L },
    // C-type float
    float: { type: "number", validate: de },
    // C-type double
    double: { type: "number", validate: de },
    // hint to the UI to hide input strings
    password: !0,
    // unchecked string payload
    binary: !0
  }, t.fastFormats = {
    ...t.fullFormats,
    date: e(/^\d\d\d\d-[0-1]\d-[0-3]\d$/, o),
    time: e(/^(?:[0-2]\d:[0-5]\d:[0-5]\d|23:59:60)(?:\.\d+)?(?:z|[+-]\d\d(?::?\d\d)?)$/i, d),
    "date-time": e(/^\d\d\d\d-[0-1]\d-[0-3]\dt(?:[0-2]\d:[0-5]\d:[0-5]\d|23:59:60)(?:\.\d+)?(?:z|[+-]\d\d(?::?\d\d)?)$/i, p),
    "iso-time": e(/^(?:[0-2]\d:[0-5]\d:[0-5]\d|23:59:60)(?:\.\d+)?(?:z|[+-]\d\d(?::?\d\d)?)?$/i, l),
    "iso-date-time": e(/^\d\d\d\d-[0-1]\d-[0-3]\d[t\s](?:[0-2]\d:[0-5]\d:[0-5]\d|23:59:60)(?:\.\d+)?(?:z|[+-]\d\d(?::?\d\d)?)?$/i, w),
    // uri: https://github.com/mafintosh/is-my-json-valid/blob/master/formats.js
    uri: /^(?:[a-z][a-z0-9+\-.]*:)(?:\/?\/)?[^\s]*$/i,
    "uri-reference": /^(?:(?:[a-z][a-z0-9+\-.]*:)?\/?\/)?(?:[^\\\s#][^\s#]*)?(?:#[^\\\s]*)?$/i,
    // email (sources from jsen validator):
    // http://stackoverflow.com/questions/201323/using-a-regular-expression-to-validate-an-email-address#answer-8829363
    // http://www.w3.org/TR/html5/forms.html#valid-e-mail-address (search for 'wilful violation')
    email: /^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)*$/i
  }, t.formatNames = Object.keys(t.fullFormats);
  function r(M) {
    return M % 4 === 0 && (M % 100 !== 0 || M % 400 === 0);
  }
  const n = /^(\d\d\d\d)-(\d\d)-(\d\d)$/, s = [0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  function a(M) {
    const B = n.exec(M);
    if (!B)
      return !1;
    const me = +B[1], k = +B[2], C = +B[3];
    return k >= 1 && k <= 12 && C >= 1 && C <= (k === 2 && r(me) ? 29 : s[k]);
  }
  function o(M, B) {
    if (M && B)
      return M > B ? 1 : M < B ? -1 : 0;
  }
  const i = /^(\d\d):(\d\d):(\d\d(?:\.\d+)?)(z|([+-])(\d\d)(?::?(\d\d))?)?$/i;
  function c(M) {
    return function(me) {
      const k = i.exec(me);
      if (!k)
        return !1;
      const C = +k[1], z = +k[2], x = +k[3], J = k[4], U = k[5] === "-" ? -1 : 1, O = +(k[6] || 0), g = +(k[7] || 0);
      if (O > 23 || g > 59 || M && !J)
        return !1;
      if (C <= 23 && z <= 59 && x < 60)
        return !0;
      const S = z - g * U, b = C - O * U - (S < 0 ? 1 : 0);
      return (b === 23 || b === -1) && (S === 59 || S === -1) && x < 61;
    };
  }
  function d(M, B) {
    if (!(M && B))
      return;
    const me = (/* @__PURE__ */ new Date("2020-01-01T" + M)).valueOf(), k = (/* @__PURE__ */ new Date("2020-01-01T" + B)).valueOf();
    if (me && k)
      return me - k;
  }
  function l(M, B) {
    if (!(M && B))
      return;
    const me = i.exec(M), k = i.exec(B);
    if (me && k)
      return M = me[1] + me[2] + me[3], B = k[1] + k[2] + k[3], M > B ? 1 : M < B ? -1 : 0;
  }
  const f = /t|\s/i;
  function _(M) {
    const B = c(M);
    return function(k) {
      const C = k.split(f);
      return C.length === 2 && a(C[0]) && B(C[1]);
    };
  }
  function p(M, B) {
    if (!(M && B))
      return;
    const me = new Date(M).valueOf(), k = new Date(B).valueOf();
    if (me && k)
      return me - k;
  }
  function w(M, B) {
    if (!(M && B))
      return;
    const [me, k] = M.split(f), [C, z] = B.split(f), x = o(me, C);
    if (x !== void 0)
      return x || d(k, z);
  }
  const $ = /\/|:/, y = /^(?:[a-z][a-z0-9+\-.]*:)(?:\/?\/(?:(?:[a-z0-9\-._~!$&'()*+,;=:]|%[0-9a-f]{2})*@)?(?:\[(?:(?:(?:(?:[0-9a-f]{1,4}:){6}|::(?:[0-9a-f]{1,4}:){5}|(?:[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){4}|(?:(?:[0-9a-f]{1,4}:){0,1}[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){3}|(?:(?:[0-9a-f]{1,4}:){0,2}[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){2}|(?:(?:[0-9a-f]{1,4}:){0,3}[0-9a-f]{1,4})?::[0-9a-f]{1,4}:|(?:(?:[0-9a-f]{1,4}:){0,4}[0-9a-f]{1,4})?::)(?:[0-9a-f]{1,4}:[0-9a-f]{1,4}|(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?))|(?:(?:[0-9a-f]{1,4}:){0,5}[0-9a-f]{1,4})?::[0-9a-f]{1,4}|(?:(?:[0-9a-f]{1,4}:){0,6}[0-9a-f]{1,4})?::)|[Vv][0-9a-f]+\.[a-z0-9\-._~!$&'()*+,;=:]+)\]|(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)|(?:[a-z0-9\-._~!$&'()*+,;=]|%[0-9a-f]{2})*)(?::\d*)?(?:\/(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})*)*|\/(?:(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})+(?:\/(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})*)*)?|(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})+(?:\/(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})*)*)(?:\?(?:[a-z0-9\-._~!$&'()*+,;=:@/?]|%[0-9a-f]{2})*)?(?:#(?:[a-z0-9\-._~!$&'()*+,;=:@/?]|%[0-9a-f]{2})*)?$/i;
  function m(M) {
    return $.test(M) && y.test(M);
  }
  const v = /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/gm;
  function P(M) {
    return v.lastIndex = 0, v.test(M);
  }
  const R = -2147483648, N = 2 ** 31 - 1;
  function D(M) {
    return Number.isInteger(M) && M <= N && M >= R;
  }
  function L(M) {
    return Number.isInteger(M);
  }
  function de() {
    return !0;
  }
  const Z = /[^\\]\\Z/;
  function ne(M) {
    if (Z.test(M))
      return !1;
    try {
      return new RegExp(M), !0;
    } catch {
      return !1;
    }
  }
})(Dh);
var Lh = {}, wi = { exports: {} }, Fh = {}, St = {}, Sn = {}, Is = {}, le = {}, bs = {};
(function(t) {
  Object.defineProperty(t, "__esModule", { value: !0 }), t.regexpCode = t.getEsmExportName = t.getProperty = t.safeStringify = t.stringify = t.strConcat = t.addCodeArg = t.str = t._ = t.nil = t._Code = t.Name = t.IDENTIFIER = t._CodeOrName = void 0;
  class e {
  }
  t._CodeOrName = e, t.IDENTIFIER = /^[a-z$_][a-z$_0-9]*$/i;
  class r extends e {
    constructor(v) {
      if (super(), !t.IDENTIFIER.test(v))
        throw new Error("CodeGen: name must be a valid identifier");
      this.str = v;
    }
    toString() {
      return this.str;
    }
    emptyStr() {
      return !1;
    }
    get names() {
      return { [this.str]: 1 };
    }
  }
  t.Name = r;
  class n extends e {
    constructor(v) {
      super(), this._items = typeof v == "string" ? [v] : v;
    }
    toString() {
      return this.str;
    }
    emptyStr() {
      if (this._items.length > 1)
        return !1;
      const v = this._items[0];
      return v === "" || v === '""';
    }
    get str() {
      var v;
      return (v = this._str) !== null && v !== void 0 ? v : this._str = this._items.reduce((P, R) => `${P}${R}`, "");
    }
    get names() {
      var v;
      return (v = this._names) !== null && v !== void 0 ? v : this._names = this._items.reduce((P, R) => (R instanceof r && (P[R.str] = (P[R.str] || 0) + 1), P), {});
    }
  }
  t._Code = n, t.nil = new n("");
  function s(m, ...v) {
    const P = [m[0]];
    let R = 0;
    for (; R < v.length; )
      i(P, v[R]), P.push(m[++R]);
    return new n(P);
  }
  t._ = s;
  const a = new n("+");
  function o(m, ...v) {
    const P = [p(m[0])];
    let R = 0;
    for (; R < v.length; )
      P.push(a), i(P, v[R]), P.push(a, p(m[++R]));
    return c(P), new n(P);
  }
  t.str = o;
  function i(m, v) {
    v instanceof n ? m.push(...v._items) : v instanceof r ? m.push(v) : m.push(f(v));
  }
  t.addCodeArg = i;
  function c(m) {
    let v = 1;
    for (; v < m.length - 1; ) {
      if (m[v] === a) {
        const P = d(m[v - 1], m[v + 1]);
        if (P !== void 0) {
          m.splice(v - 1, 3, P);
          continue;
        }
        m[v++] = "+";
      }
      v++;
    }
  }
  function d(m, v) {
    if (v === '""')
      return m;
    if (m === '""')
      return v;
    if (typeof m == "string")
      return v instanceof r || m[m.length - 1] !== '"' ? void 0 : typeof v != "string" ? `${m.slice(0, -1)}${v}"` : v[0] === '"' ? m.slice(0, -1) + v.slice(1) : void 0;
    if (typeof v == "string" && v[0] === '"' && !(m instanceof r))
      return `"${m}${v.slice(1)}`;
  }
  function l(m, v) {
    return v.emptyStr() ? m : m.emptyStr() ? v : o`${m}${v}`;
  }
  t.strConcat = l;
  function f(m) {
    return typeof m == "number" || typeof m == "boolean" || m === null ? m : p(Array.isArray(m) ? m.join(",") : m);
  }
  function _(m) {
    return new n(p(m));
  }
  t.stringify = _;
  function p(m) {
    return JSON.stringify(m).replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029");
  }
  t.safeStringify = p;
  function w(m) {
    return typeof m == "string" && t.IDENTIFIER.test(m) ? new n(`.${m}`) : s`[${m}]`;
  }
  t.getProperty = w;
  function $(m) {
    if (typeof m == "string" && t.IDENTIFIER.test(m))
      return new n(`${m}`);
    throw new Error(`CodeGen: invalid export name: ${m}, use explicit $id name mapping`);
  }
  t.getEsmExportName = $;
  function y(m) {
    return new n(m.toString());
  }
  t.regexpCode = y;
})(bs);
var bi = {};
(function(t) {
  Object.defineProperty(t, "__esModule", { value: !0 }), t.ValueScope = t.ValueScopeName = t.Scope = t.varKinds = t.UsedValueState = void 0;
  const e = bs;
  class r extends Error {
    constructor(d) {
      super(`CodeGen: "code" for ${d} not defined`), this.value = d.value;
    }
  }
  var n;
  (function(c) {
    c[c.Started = 0] = "Started", c[c.Completed = 1] = "Completed";
  })(n || (t.UsedValueState = n = {})), t.varKinds = {
    const: new e.Name("const"),
    let: new e.Name("let"),
    var: new e.Name("var")
  };
  class s {
    constructor({ prefixes: d, parent: l } = {}) {
      this._names = {}, this._prefixes = d, this._parent = l;
    }
    toName(d) {
      return d instanceof e.Name ? d : this.name(d);
    }
    name(d) {
      return new e.Name(this._newName(d));
    }
    _newName(d) {
      const l = this._names[d] || this._nameGroup(d);
      return `${d}${l.index++}`;
    }
    _nameGroup(d) {
      var l, f;
      if (!((f = (l = this._parent) === null || l === void 0 ? void 0 : l._prefixes) === null || f === void 0) && f.has(d) || this._prefixes && !this._prefixes.has(d))
        throw new Error(`CodeGen: prefix "${d}" is not allowed in this scope`);
      return this._names[d] = { prefix: d, index: 0 };
    }
  }
  t.Scope = s;
  class a extends e.Name {
    constructor(d, l) {
      super(l), this.prefix = d;
    }
    setValue(d, { property: l, itemIndex: f }) {
      this.value = d, this.scopePath = (0, e._)`.${new e.Name(l)}[${f}]`;
    }
  }
  t.ValueScopeName = a;
  const o = (0, e._)`\n`;
  class i extends s {
    constructor(d) {
      super(d), this._values = {}, this._scope = d.scope, this.opts = { ...d, _n: d.lines ? o : e.nil };
    }
    get() {
      return this._scope;
    }
    name(d) {
      return new a(d, this._newName(d));
    }
    value(d, l) {
      var f;
      if (l.ref === void 0)
        throw new Error("CodeGen: ref must be passed in value");
      const _ = this.toName(d), { prefix: p } = _, w = (f = l.key) !== null && f !== void 0 ? f : l.ref;
      let $ = this._values[p];
      if ($) {
        const v = $.get(w);
        if (v)
          return v;
      } else
        $ = this._values[p] = /* @__PURE__ */ new Map();
      $.set(w, _);
      const y = this._scope[p] || (this._scope[p] = []), m = y.length;
      return y[m] = l.ref, _.setValue(l, { property: p, itemIndex: m }), _;
    }
    getValue(d, l) {
      const f = this._values[d];
      if (f)
        return f.get(l);
    }
    scopeRefs(d, l = this._values) {
      return this._reduceValues(l, (f) => {
        if (f.scopePath === void 0)
          throw new Error(`CodeGen: name "${f}" has no value`);
        return (0, e._)`${d}${f.scopePath}`;
      });
    }
    scopeCode(d = this._values, l, f) {
      return this._reduceValues(d, (_) => {
        if (_.value === void 0)
          throw new Error(`CodeGen: name "${_}" has no value`);
        return _.value.code;
      }, l, f);
    }
    _reduceValues(d, l, f = {}, _) {
      let p = e.nil;
      for (const w in d) {
        const $ = d[w];
        if (!$)
          continue;
        const y = f[w] = f[w] || /* @__PURE__ */ new Map();
        $.forEach((m) => {
          if (y.has(m))
            return;
          y.set(m, n.Started);
          let v = l(m);
          if (v) {
            const P = this.opts.es5 ? t.varKinds.var : t.varKinds.const;
            p = (0, e._)`${p}${P} ${m} = ${v};${this.opts._n}`;
          } else if (v = _ == null ? void 0 : _(m))
            p = (0, e._)`${p}${v}${this.opts._n}`;
          else
            throw new r(m);
          y.set(m, n.Completed);
        });
      }
      return p;
    }
  }
  t.ValueScope = i;
})(bi);
(function(t) {
  Object.defineProperty(t, "__esModule", { value: !0 }), t.or = t.and = t.not = t.CodeGen = t.operators = t.varKinds = t.ValueScopeName = t.ValueScope = t.Scope = t.Name = t.regexpCode = t.stringify = t.getProperty = t.nil = t.strConcat = t.str = t._ = void 0;
  const e = bs, r = bi;
  var n = bs;
  Object.defineProperty(t, "_", { enumerable: !0, get: function() {
    return n._;
  } }), Object.defineProperty(t, "str", { enumerable: !0, get: function() {
    return n.str;
  } }), Object.defineProperty(t, "strConcat", { enumerable: !0, get: function() {
    return n.strConcat;
  } }), Object.defineProperty(t, "nil", { enumerable: !0, get: function() {
    return n.nil;
  } }), Object.defineProperty(t, "getProperty", { enumerable: !0, get: function() {
    return n.getProperty;
  } }), Object.defineProperty(t, "stringify", { enumerable: !0, get: function() {
    return n.stringify;
  } }), Object.defineProperty(t, "regexpCode", { enumerable: !0, get: function() {
    return n.regexpCode;
  } }), Object.defineProperty(t, "Name", { enumerable: !0, get: function() {
    return n.Name;
  } });
  var s = bi;
  Object.defineProperty(t, "Scope", { enumerable: !0, get: function() {
    return s.Scope;
  } }), Object.defineProperty(t, "ValueScope", { enumerable: !0, get: function() {
    return s.ValueScope;
  } }), Object.defineProperty(t, "ValueScopeName", { enumerable: !0, get: function() {
    return s.ValueScopeName;
  } }), Object.defineProperty(t, "varKinds", { enumerable: !0, get: function() {
    return s.varKinds;
  } }), t.operators = {
    GT: new e._Code(">"),
    GTE: new e._Code(">="),
    LT: new e._Code("<"),
    LTE: new e._Code("<="),
    EQ: new e._Code("==="),
    NEQ: new e._Code("!=="),
    NOT: new e._Code("!"),
    OR: new e._Code("||"),
    AND: new e._Code("&&"),
    ADD: new e._Code("+")
  };
  class a {
    optimizeNodes() {
      return this;
    }
    optimizeNames(u, h) {
      return this;
    }
  }
  class o extends a {
    constructor(u, h, E) {
      super(), this.varKind = u, this.name = h, this.rhs = E;
    }
    render({ es5: u, _n: h }) {
      const E = u ? r.varKinds.var : this.varKind, T = this.rhs === void 0 ? "" : ` = ${this.rhs}`;
      return `${E} ${this.name}${T};` + h;
    }
    optimizeNames(u, h) {
      if (u[this.name.str])
        return this.rhs && (this.rhs = k(this.rhs, u, h)), this;
    }
    get names() {
      return this.rhs instanceof e._CodeOrName ? this.rhs.names : {};
    }
  }
  class i extends a {
    constructor(u, h, E) {
      super(), this.lhs = u, this.rhs = h, this.sideEffects = E;
    }
    render({ _n: u }) {
      return `${this.lhs} = ${this.rhs};` + u;
    }
    optimizeNames(u, h) {
      if (!(this.lhs instanceof e.Name && !u[this.lhs.str] && !this.sideEffects))
        return this.rhs = k(this.rhs, u, h), this;
    }
    get names() {
      const u = this.lhs instanceof e.Name ? {} : { ...this.lhs.names };
      return me(u, this.rhs);
    }
  }
  class c extends i {
    constructor(u, h, E, T) {
      super(u, E, T), this.op = h;
    }
    render({ _n: u }) {
      return `${this.lhs} ${this.op}= ${this.rhs};` + u;
    }
  }
  class d extends a {
    constructor(u) {
      super(), this.label = u, this.names = {};
    }
    render({ _n: u }) {
      return `${this.label}:` + u;
    }
  }
  class l extends a {
    constructor(u) {
      super(), this.label = u, this.names = {};
    }
    render({ _n: u }) {
      return `break${this.label ? ` ${this.label}` : ""};` + u;
    }
  }
  class f extends a {
    constructor(u) {
      super(), this.error = u;
    }
    render({ _n: u }) {
      return `throw ${this.error};` + u;
    }
    get names() {
      return this.error.names;
    }
  }
  class _ extends a {
    constructor(u) {
      super(), this.code = u;
    }
    render({ _n: u }) {
      return `${this.code};` + u;
    }
    optimizeNodes() {
      return `${this.code}` ? this : void 0;
    }
    optimizeNames(u, h) {
      return this.code = k(this.code, u, h), this;
    }
    get names() {
      return this.code instanceof e._CodeOrName ? this.code.names : {};
    }
  }
  class p extends a {
    constructor(u = []) {
      super(), this.nodes = u;
    }
    render(u) {
      return this.nodes.reduce((h, E) => h + E.render(u), "");
    }
    optimizeNodes() {
      const { nodes: u } = this;
      let h = u.length;
      for (; h--; ) {
        const E = u[h].optimizeNodes();
        Array.isArray(E) ? u.splice(h, 1, ...E) : E ? u[h] = E : u.splice(h, 1);
      }
      return u.length > 0 ? this : void 0;
    }
    optimizeNames(u, h) {
      const { nodes: E } = this;
      let T = E.length;
      for (; T--; ) {
        const A = E[T];
        A.optimizeNames(u, h) || (C(u, A.names), E.splice(T, 1));
      }
      return E.length > 0 ? this : void 0;
    }
    get names() {
      return this.nodes.reduce((u, h) => B(u, h.names), {});
    }
  }
  class w extends p {
    render(u) {
      return "{" + u._n + super.render(u) + "}" + u._n;
    }
  }
  class $ extends p {
  }
  class y extends w {
  }
  y.kind = "else";
  class m extends w {
    constructor(u, h) {
      super(h), this.condition = u;
    }
    render(u) {
      let h = `if(${this.condition})` + super.render(u);
      return this.else && (h += "else " + this.else.render(u)), h;
    }
    optimizeNodes() {
      super.optimizeNodes();
      const u = this.condition;
      if (u === !0)
        return this.nodes;
      let h = this.else;
      if (h) {
        const E = h.optimizeNodes();
        h = this.else = Array.isArray(E) ? new y(E) : E;
      }
      if (h)
        return u === !1 ? h instanceof m ? h : h.nodes : this.nodes.length ? this : new m(z(u), h instanceof m ? [h] : h.nodes);
      if (!(u === !1 || !this.nodes.length))
        return this;
    }
    optimizeNames(u, h) {
      var E;
      if (this.else = (E = this.else) === null || E === void 0 ? void 0 : E.optimizeNames(u, h), !!(super.optimizeNames(u, h) || this.else))
        return this.condition = k(this.condition, u, h), this;
    }
    get names() {
      const u = super.names;
      return me(u, this.condition), this.else && B(u, this.else.names), u;
    }
  }
  m.kind = "if";
  class v extends w {
  }
  v.kind = "for";
  class P extends v {
    constructor(u) {
      super(), this.iteration = u;
    }
    render(u) {
      return `for(${this.iteration})` + super.render(u);
    }
    optimizeNames(u, h) {
      if (super.optimizeNames(u, h))
        return this.iteration = k(this.iteration, u, h), this;
    }
    get names() {
      return B(super.names, this.iteration.names);
    }
  }
  class R extends v {
    constructor(u, h, E, T) {
      super(), this.varKind = u, this.name = h, this.from = E, this.to = T;
    }
    render(u) {
      const h = u.es5 ? r.varKinds.var : this.varKind, { name: E, from: T, to: A } = this;
      return `for(${h} ${E}=${T}; ${E}<${A}; ${E}++)` + super.render(u);
    }
    get names() {
      const u = me(super.names, this.from);
      return me(u, this.to);
    }
  }
  class N extends v {
    constructor(u, h, E, T) {
      super(), this.loop = u, this.varKind = h, this.name = E, this.iterable = T;
    }
    render(u) {
      return `for(${this.varKind} ${this.name} ${this.loop} ${this.iterable})` + super.render(u);
    }
    optimizeNames(u, h) {
      if (super.optimizeNames(u, h))
        return this.iterable = k(this.iterable, u, h), this;
    }
    get names() {
      return B(super.names, this.iterable.names);
    }
  }
  class D extends w {
    constructor(u, h, E) {
      super(), this.name = u, this.args = h, this.async = E;
    }
    render(u) {
      return `${this.async ? "async " : ""}function ${this.name}(${this.args})` + super.render(u);
    }
  }
  D.kind = "func";
  class L extends p {
    render(u) {
      return "return " + super.render(u);
    }
  }
  L.kind = "return";
  class de extends w {
    render(u) {
      let h = "try" + super.render(u);
      return this.catch && (h += this.catch.render(u)), this.finally && (h += this.finally.render(u)), h;
    }
    optimizeNodes() {
      var u, h;
      return super.optimizeNodes(), (u = this.catch) === null || u === void 0 || u.optimizeNodes(), (h = this.finally) === null || h === void 0 || h.optimizeNodes(), this;
    }
    optimizeNames(u, h) {
      var E, T;
      return super.optimizeNames(u, h), (E = this.catch) === null || E === void 0 || E.optimizeNames(u, h), (T = this.finally) === null || T === void 0 || T.optimizeNames(u, h), this;
    }
    get names() {
      const u = super.names;
      return this.catch && B(u, this.catch.names), this.finally && B(u, this.finally.names), u;
    }
  }
  class Z extends w {
    constructor(u) {
      super(), this.error = u;
    }
    render(u) {
      return `catch(${this.error})` + super.render(u);
    }
  }
  Z.kind = "catch";
  class ne extends w {
    render(u) {
      return "finally" + super.render(u);
    }
  }
  ne.kind = "finally";
  class M {
    constructor(u, h = {}) {
      this._values = {}, this._blockStarts = [], this._constants = {}, this.opts = { ...h, _n: h.lines ? `
` : "" }, this._extScope = u, this._scope = new r.Scope({ parent: u }), this._nodes = [new $()];
    }
    toString() {
      return this._root.render(this.opts);
    }
    // returns unique name in the internal scope
    name(u) {
      return this._scope.name(u);
    }
    // reserves unique name in the external scope
    scopeName(u) {
      return this._extScope.name(u);
    }
    // reserves unique name in the external scope and assigns value to it
    scopeValue(u, h) {
      const E = this._extScope.value(u, h);
      return (this._values[E.prefix] || (this._values[E.prefix] = /* @__PURE__ */ new Set())).add(E), E;
    }
    getScopeValue(u, h) {
      return this._extScope.getValue(u, h);
    }
    // return code that assigns values in the external scope to the names that are used internally
    // (same names that were returned by gen.scopeName or gen.scopeValue)
    scopeRefs(u) {
      return this._extScope.scopeRefs(u, this._values);
    }
    scopeCode() {
      return this._extScope.scopeCode(this._values);
    }
    _def(u, h, E, T) {
      const A = this._scope.toName(h);
      return E !== void 0 && T && (this._constants[A.str] = E), this._leafNode(new o(u, A, E)), A;
    }
    // `const` declaration (`var` in es5 mode)
    const(u, h, E) {
      return this._def(r.varKinds.const, u, h, E);
    }
    // `let` declaration with optional assignment (`var` in es5 mode)
    let(u, h, E) {
      return this._def(r.varKinds.let, u, h, E);
    }
    // `var` declaration with optional assignment
    var(u, h, E) {
      return this._def(r.varKinds.var, u, h, E);
    }
    // assignment code
    assign(u, h, E) {
      return this._leafNode(new i(u, h, E));
    }
    // `+=` code
    add(u, h) {
      return this._leafNode(new c(u, t.operators.ADD, h));
    }
    // appends passed SafeExpr to code or executes Block
    code(u) {
      return typeof u == "function" ? u() : u !== e.nil && this._leafNode(new _(u)), this;
    }
    // returns code for object literal for the passed argument list of key-value pairs
    object(...u) {
      const h = ["{"];
      for (const [E, T] of u)
        h.length > 1 && h.push(","), h.push(E), (E !== T || this.opts.es5) && (h.push(":"), (0, e.addCodeArg)(h, T));
      return h.push("}"), new e._Code(h);
    }
    // `if` clause (or statement if `thenBody` and, optionally, `elseBody` are passed)
    if(u, h, E) {
      if (this._blockNode(new m(u)), h && E)
        this.code(h).else().code(E).endIf();
      else if (h)
        this.code(h).endIf();
      else if (E)
        throw new Error('CodeGen: "else" body without "then" body');
      return this;
    }
    // `else if` clause - invalid without `if` or after `else` clauses
    elseIf(u) {
      return this._elseNode(new m(u));
    }
    // `else` clause - only valid after `if` or `else if` clauses
    else() {
      return this._elseNode(new y());
    }
    // end `if` statement (needed if gen.if was used only with condition)
    endIf() {
      return this._endBlockNode(m, y);
    }
    _for(u, h) {
      return this._blockNode(u), h && this.code(h).endFor(), this;
    }
    // a generic `for` clause (or statement if `forBody` is passed)
    for(u, h) {
      return this._for(new P(u), h);
    }
    // `for` statement for a range of values
    forRange(u, h, E, T, A = this.opts.es5 ? r.varKinds.var : r.varKinds.let) {
      const G = this._scope.toName(u);
      return this._for(new R(A, G, h, E), () => T(G));
    }
    // `for-of` statement (in es5 mode replace with a normal for loop)
    forOf(u, h, E, T = r.varKinds.const) {
      const A = this._scope.toName(u);
      if (this.opts.es5) {
        const G = h instanceof e.Name ? h : this.var("_arr", h);
        return this.forRange("_i", 0, (0, e._)`${G}.length`, (K) => {
          this.var(A, (0, e._)`${G}[${K}]`), E(A);
        });
      }
      return this._for(new N("of", T, A, h), () => E(A));
    }
    // `for-in` statement.
    // With option `ownProperties` replaced with a `for-of` loop for object keys
    forIn(u, h, E, T = this.opts.es5 ? r.varKinds.var : r.varKinds.const) {
      if (this.opts.ownProperties)
        return this.forOf(u, (0, e._)`Object.keys(${h})`, E);
      const A = this._scope.toName(u);
      return this._for(new N("in", T, A, h), () => E(A));
    }
    // end `for` loop
    endFor() {
      return this._endBlockNode(v);
    }
    // `label` statement
    label(u) {
      return this._leafNode(new d(u));
    }
    // `break` statement
    break(u) {
      return this._leafNode(new l(u));
    }
    // `return` statement
    return(u) {
      const h = new L();
      if (this._blockNode(h), this.code(u), h.nodes.length !== 1)
        throw new Error('CodeGen: "return" should have one node');
      return this._endBlockNode(L);
    }
    // `try` statement
    try(u, h, E) {
      if (!h && !E)
        throw new Error('CodeGen: "try" without "catch" and "finally"');
      const T = new de();
      if (this._blockNode(T), this.code(u), h) {
        const A = this.name("e");
        this._currNode = T.catch = new Z(A), h(A);
      }
      return E && (this._currNode = T.finally = new ne(), this.code(E)), this._endBlockNode(Z, ne);
    }
    // `throw` statement
    throw(u) {
      return this._leafNode(new f(u));
    }
    // start self-balancing block
    block(u, h) {
      return this._blockStarts.push(this._nodes.length), u && this.code(u).endBlock(h), this;
    }
    // end the current self-balancing block
    endBlock(u) {
      const h = this._blockStarts.pop();
      if (h === void 0)
        throw new Error("CodeGen: not in self-balancing block");
      const E = this._nodes.length - h;
      if (E < 0 || u !== void 0 && E !== u)
        throw new Error(`CodeGen: wrong number of nodes: ${E} vs ${u} expected`);
      return this._nodes.length = h, this;
    }
    // `function` heading (or definition if funcBody is passed)
    func(u, h = e.nil, E, T) {
      return this._blockNode(new D(u, h, E)), T && this.code(T).endFunc(), this;
    }
    // end function definition
    endFunc() {
      return this._endBlockNode(D);
    }
    optimize(u = 1) {
      for (; u-- > 0; )
        this._root.optimizeNodes(), this._root.optimizeNames(this._root.names, this._constants);
    }
    _leafNode(u) {
      return this._currNode.nodes.push(u), this;
    }
    _blockNode(u) {
      this._currNode.nodes.push(u), this._nodes.push(u);
    }
    _endBlockNode(u, h) {
      const E = this._currNode;
      if (E instanceof u || h && E instanceof h)
        return this._nodes.pop(), this;
      throw new Error(`CodeGen: not in block "${h ? `${u.kind}/${h.kind}` : u.kind}"`);
    }
    _elseNode(u) {
      const h = this._currNode;
      if (!(h instanceof m))
        throw new Error('CodeGen: "else" without "if"');
      return this._currNode = h.else = u, this;
    }
    get _root() {
      return this._nodes[0];
    }
    get _currNode() {
      const u = this._nodes;
      return u[u.length - 1];
    }
    set _currNode(u) {
      const h = this._nodes;
      h[h.length - 1] = u;
    }
  }
  t.CodeGen = M;
  function B(b, u) {
    for (const h in u)
      b[h] = (b[h] || 0) + (u[h] || 0);
    return b;
  }
  function me(b, u) {
    return u instanceof e._CodeOrName ? B(b, u.names) : b;
  }
  function k(b, u, h) {
    if (b instanceof e.Name)
      return E(b);
    if (!T(b))
      return b;
    return new e._Code(b._items.reduce((A, G) => (G instanceof e.Name && (G = E(G)), G instanceof e._Code ? A.push(...G._items) : A.push(G), A), []));
    function E(A) {
      const G = h[A.str];
      return G === void 0 || u[A.str] !== 1 ? A : (delete u[A.str], G);
    }
    function T(A) {
      return A instanceof e._Code && A._items.some((G) => G instanceof e.Name && u[G.str] === 1 && h[G.str] !== void 0);
    }
  }
  function C(b, u) {
    for (const h in u)
      b[h] = (b[h] || 0) - (u[h] || 0);
  }
  function z(b) {
    return typeof b == "boolean" || typeof b == "number" || b === null ? !b : (0, e._)`!${S(b)}`;
  }
  t.not = z;
  const x = g(t.operators.AND);
  function J(...b) {
    return b.reduce(x);
  }
  t.and = J;
  const U = g(t.operators.OR);
  function O(...b) {
    return b.reduce(U);
  }
  t.or = O;
  function g(b) {
    return (u, h) => u === e.nil ? h : h === e.nil ? u : (0, e._)`${S(u)} ${b} ${S(h)}`;
  }
  function S(b) {
    return b instanceof e.Name ? b : (0, e._)`(${b})`;
  }
})(le);
var V = {};
Object.defineProperty(V, "__esModule", { value: !0 });
V.checkStrictMode = V.getErrorPath = V.Type = V.useFunc = V.setEvaluated = V.evaluatedPropsToName = V.mergeEvaluated = V.eachItem = V.unescapeJsonPointer = V.escapeJsonPointer = V.escapeFragment = V.unescapeFragment = V.schemaRefOrVal = V.schemaHasRulesButRef = V.schemaHasRules = V.checkUnknownRules = V.alwaysValidSchema = V.toHash = void 0;
const ge = le, Hb = bs;
function Wb(t) {
  const e = {};
  for (const r of t)
    e[r] = !0;
  return e;
}
V.toHash = Wb;
function Jb(t, e) {
  return typeof e == "boolean" ? e : Object.keys(e).length === 0 ? !0 : (Vh(t, e), !xh(e, t.self.RULES.all));
}
V.alwaysValidSchema = Jb;
function Vh(t, e = t.schema) {
  const { opts: r, self: n } = t;
  if (!r.strictSchema || typeof e == "boolean")
    return;
  const s = n.RULES.keywords;
  for (const a in e)
    s[a] || zh(t, `unknown keyword: "${a}"`);
}
V.checkUnknownRules = Vh;
function xh(t, e) {
  if (typeof t == "boolean")
    return !t;
  for (const r in t)
    if (e[r])
      return !0;
  return !1;
}
V.schemaHasRules = xh;
function Xb(t, e) {
  if (typeof t == "boolean")
    return !t;
  for (const r in t)
    if (r !== "$ref" && e.all[r])
      return !0;
  return !1;
}
V.schemaHasRulesButRef = Xb;
function Yb({ topSchemaRef: t, schemaPath: e }, r, n, s) {
  if (!s) {
    if (typeof r == "number" || typeof r == "boolean")
      return r;
    if (typeof r == "string")
      return (0, ge._)`${r}`;
  }
  return (0, ge._)`${t}${e}${(0, ge.getProperty)(n)}`;
}
V.schemaRefOrVal = Yb;
function Qb(t) {
  return Uh(decodeURIComponent(t));
}
V.unescapeFragment = Qb;
function Zb(t) {
  return encodeURIComponent(Yc(t));
}
V.escapeFragment = Zb;
function Yc(t) {
  return typeof t == "number" ? `${t}` : t.replace(/~/g, "~0").replace(/\//g, "~1");
}
V.escapeJsonPointer = Yc;
function Uh(t) {
  return t.replace(/~1/g, "/").replace(/~0/g, "~");
}
V.unescapeJsonPointer = Uh;
function eE(t, e) {
  if (Array.isArray(t))
    for (const r of t)
      e(r);
  else
    e(t);
}
V.eachItem = eE;
function ad({ mergeNames: t, mergeToName: e, mergeValues: r, resultToName: n }) {
  return (s, a, o, i) => {
    const c = o === void 0 ? a : o instanceof ge.Name ? (a instanceof ge.Name ? t(s, a, o) : e(s, a, o), o) : a instanceof ge.Name ? (e(s, o, a), a) : r(a, o);
    return i === ge.Name && !(c instanceof ge.Name) ? n(s, c) : c;
  };
}
V.mergeEvaluated = {
  props: ad({
    mergeNames: (t, e, r) => t.if((0, ge._)`${r} !== true && ${e} !== undefined`, () => {
      t.if((0, ge._)`${e} === true`, () => t.assign(r, !0), () => t.assign(r, (0, ge._)`${r} || {}`).code((0, ge._)`Object.assign(${r}, ${e})`));
    }),
    mergeToName: (t, e, r) => t.if((0, ge._)`${r} !== true`, () => {
      e === !0 ? t.assign(r, !0) : (t.assign(r, (0, ge._)`${r} || {}`), Qc(t, r, e));
    }),
    mergeValues: (t, e) => t === !0 ? !0 : { ...t, ...e },
    resultToName: qh
  }),
  items: ad({
    mergeNames: (t, e, r) => t.if((0, ge._)`${r} !== true && ${e} !== undefined`, () => t.assign(r, (0, ge._)`${e} === true ? true : ${r} > ${e} ? ${r} : ${e}`)),
    mergeToName: (t, e, r) => t.if((0, ge._)`${r} !== true`, () => t.assign(r, e === !0 ? !0 : (0, ge._)`${r} > ${e} ? ${r} : ${e}`)),
    mergeValues: (t, e) => t === !0 ? !0 : Math.max(t, e),
    resultToName: (t, e) => t.var("items", e)
  })
};
function qh(t, e) {
  if (e === !0)
    return t.var("props", !0);
  const r = t.var("props", (0, ge._)`{}`);
  return e !== void 0 && Qc(t, r, e), r;
}
V.evaluatedPropsToName = qh;
function Qc(t, e, r) {
  Object.keys(r).forEach((n) => t.assign((0, ge._)`${e}${(0, ge.getProperty)(n)}`, !0));
}
V.setEvaluated = Qc;
const od = {};
function tE(t, e) {
  return t.scopeValue("func", {
    ref: e,
    code: od[e.code] || (od[e.code] = new Hb._Code(e.code))
  });
}
V.useFunc = tE;
var Ei;
(function(t) {
  t[t.Num = 0] = "Num", t[t.Str = 1] = "Str";
})(Ei || (V.Type = Ei = {}));
function rE(t, e, r) {
  if (t instanceof ge.Name) {
    const n = e === Ei.Num;
    return r ? n ? (0, ge._)`"[" + ${t} + "]"` : (0, ge._)`"['" + ${t} + "']"` : n ? (0, ge._)`"/" + ${t}` : (0, ge._)`"/" + ${t}.replace(/~/g, "~0").replace(/\\//g, "~1")`;
  }
  return r ? (0, ge.getProperty)(t).toString() : "/" + Yc(t);
}
V.getErrorPath = rE;
function zh(t, e, r = t.opts.strictSchema) {
  if (r) {
    if (e = `strict mode: ${e}`, r === !0)
      throw new Error(e);
    t.self.logger.warn(e);
  }
}
V.checkStrictMode = zh;
var Ft = {};
Object.defineProperty(Ft, "__esModule", { value: !0 });
const ze = le, nE = {
  // validation function arguments
  data: new ze.Name("data"),
  // data passed to validation function
  // args passed from referencing schema
  valCxt: new ze.Name("valCxt"),
  // validation/data context - should not be used directly, it is destructured to the names below
  instancePath: new ze.Name("instancePath"),
  parentData: new ze.Name("parentData"),
  parentDataProperty: new ze.Name("parentDataProperty"),
  rootData: new ze.Name("rootData"),
  // root data - same as the data passed to the first/top validation function
  dynamicAnchors: new ze.Name("dynamicAnchors"),
  // used to support recursiveRef and dynamicRef
  // function scoped variables
  vErrors: new ze.Name("vErrors"),
  // null or array of validation errors
  errors: new ze.Name("errors"),
  // counter of validation errors
  this: new ze.Name("this"),
  // "globals"
  self: new ze.Name("self"),
  scope: new ze.Name("scope"),
  // JTD serialize/parse name for JSON string and position
  json: new ze.Name("json"),
  jsonPos: new ze.Name("jsonPos"),
  jsonLen: new ze.Name("jsonLen"),
  jsonPart: new ze.Name("jsonPart")
};
Ft.default = nE;
(function(t) {
  Object.defineProperty(t, "__esModule", { value: !0 }), t.extendErrors = t.resetErrorsCount = t.reportExtraError = t.reportError = t.keyword$DataError = t.keywordError = void 0;
  const e = le, r = V, n = Ft;
  t.keywordError = {
    message: ({ keyword: y }) => (0, e.str)`must pass "${y}" keyword validation`
  }, t.keyword$DataError = {
    message: ({ keyword: y, schemaType: m }) => m ? (0, e.str)`"${y}" keyword must be ${m} ($data)` : (0, e.str)`"${y}" keyword is invalid ($data)`
  };
  function s(y, m = t.keywordError, v, P) {
    const { it: R } = y, { gen: N, compositeRule: D, allErrors: L } = R, de = f(y, m, v);
    P ?? (D || L) ? c(N, de) : d(R, (0, e._)`[${de}]`);
  }
  t.reportError = s;
  function a(y, m = t.keywordError, v) {
    const { it: P } = y, { gen: R, compositeRule: N, allErrors: D } = P, L = f(y, m, v);
    c(R, L), N || D || d(P, n.default.vErrors);
  }
  t.reportExtraError = a;
  function o(y, m) {
    y.assign(n.default.errors, m), y.if((0, e._)`${n.default.vErrors} !== null`, () => y.if(m, () => y.assign((0, e._)`${n.default.vErrors}.length`, m), () => y.assign(n.default.vErrors, null)));
  }
  t.resetErrorsCount = o;
  function i({ gen: y, keyword: m, schemaValue: v, data: P, errsCount: R, it: N }) {
    if (R === void 0)
      throw new Error("ajv implementation error");
    const D = y.name("err");
    y.forRange("i", R, n.default.errors, (L) => {
      y.const(D, (0, e._)`${n.default.vErrors}[${L}]`), y.if((0, e._)`${D}.instancePath === undefined`, () => y.assign((0, e._)`${D}.instancePath`, (0, e.strConcat)(n.default.instancePath, N.errorPath))), y.assign((0, e._)`${D}.schemaPath`, (0, e.str)`${N.errSchemaPath}/${m}`), N.opts.verbose && (y.assign((0, e._)`${D}.schema`, v), y.assign((0, e._)`${D}.data`, P));
    });
  }
  t.extendErrors = i;
  function c(y, m) {
    const v = y.const("err", m);
    y.if((0, e._)`${n.default.vErrors} === null`, () => y.assign(n.default.vErrors, (0, e._)`[${v}]`), (0, e._)`${n.default.vErrors}.push(${v})`), y.code((0, e._)`${n.default.errors}++`);
  }
  function d(y, m) {
    const { gen: v, validateName: P, schemaEnv: R } = y;
    R.$async ? v.throw((0, e._)`new ${y.ValidationError}(${m})`) : (v.assign((0, e._)`${P}.errors`, m), v.return(!1));
  }
  const l = {
    keyword: new e.Name("keyword"),
    schemaPath: new e.Name("schemaPath"),
    // also used in JTD errors
    params: new e.Name("params"),
    propertyName: new e.Name("propertyName"),
    message: new e.Name("message"),
    schema: new e.Name("schema"),
    parentSchema: new e.Name("parentSchema")
  };
  function f(y, m, v) {
    const { createErrors: P } = y.it;
    return P === !1 ? (0, e._)`{}` : _(y, m, v);
  }
  function _(y, m, v = {}) {
    const { gen: P, it: R } = y, N = [
      p(R, v),
      w(y, v)
    ];
    return $(y, m, N), P.object(...N);
  }
  function p({ errorPath: y }, { instancePath: m }) {
    const v = m ? (0, e.str)`${y}${(0, r.getErrorPath)(m, r.Type.Str)}` : y;
    return [n.default.instancePath, (0, e.strConcat)(n.default.instancePath, v)];
  }
  function w({ keyword: y, it: { errSchemaPath: m } }, { schemaPath: v, parentSchema: P }) {
    let R = P ? m : (0, e.str)`${m}/${y}`;
    return v && (R = (0, e.str)`${R}${(0, r.getErrorPath)(v, r.Type.Str)}`), [l.schemaPath, R];
  }
  function $(y, { params: m, message: v }, P) {
    const { keyword: R, data: N, schemaValue: D, it: L } = y, { opts: de, propertyName: Z, topSchemaRef: ne, schemaPath: M } = L;
    P.push([l.keyword, R], [l.params, typeof m == "function" ? m(y) : m || (0, e._)`{}`]), de.messages && P.push([l.message, typeof v == "function" ? v(y) : v]), de.verbose && P.push([l.schema, D], [l.parentSchema, (0, e._)`${ne}${M}`], [n.default.data, N]), Z && P.push([l.propertyName, Z]);
  }
})(Is);
Object.defineProperty(Sn, "__esModule", { value: !0 });
Sn.boolOrEmptySchema = Sn.topBoolOrEmptySchema = void 0;
const sE = Is, aE = le, oE = Ft, iE = {
  message: "boolean schema is false"
};
function cE(t) {
  const { gen: e, schema: r, validateName: n } = t;
  r === !1 ? Kh(t, !1) : typeof r == "object" && r.$async === !0 ? e.return(oE.default.data) : (e.assign((0, aE._)`${n}.errors`, null), e.return(!0));
}
Sn.topBoolOrEmptySchema = cE;
function lE(t, e) {
  const { gen: r, schema: n } = t;
  n === !1 ? (r.var(e, !1), Kh(t)) : r.var(e, !0);
}
Sn.boolOrEmptySchema = lE;
function Kh(t, e) {
  const { gen: r, data: n } = t, s = {
    gen: r,
    keyword: "false schema",
    data: n,
    schema: !1,
    schemaCode: !1,
    schemaValue: !1,
    params: {},
    it: t
  };
  (0, sE.reportError)(s, iE, void 0, e);
}
var Ie = {}, Wr = {};
Object.defineProperty(Wr, "__esModule", { value: !0 });
Wr.getRules = Wr.isJSONType = void 0;
const uE = ["string", "number", "integer", "boolean", "null", "object", "array"], dE = new Set(uE);
function fE(t) {
  return typeof t == "string" && dE.has(t);
}
Wr.isJSONType = fE;
function hE() {
  const t = {
    number: { type: "number", rules: [] },
    string: { type: "string", rules: [] },
    array: { type: "array", rules: [] },
    object: { type: "object", rules: [] }
  };
  return {
    types: { ...t, integer: !0, boolean: !0, null: !0 },
    rules: [{ rules: [] }, t.number, t.string, t.array, t.object],
    post: { rules: [] },
    all: {},
    keywords: {}
  };
}
Wr.getRules = hE;
var Gt = {};
Object.defineProperty(Gt, "__esModule", { value: !0 });
Gt.shouldUseRule = Gt.shouldUseGroup = Gt.schemaHasRulesForType = void 0;
function mE({ schema: t, self: e }, r) {
  const n = e.RULES.types[r];
  return n && n !== !0 && Gh(t, n);
}
Gt.schemaHasRulesForType = mE;
function Gh(t, e) {
  return e.rules.some((r) => Bh(t, r));
}
Gt.shouldUseGroup = Gh;
function Bh(t, e) {
  var r;
  return t[e.keyword] !== void 0 || ((r = e.definition.implements) === null || r === void 0 ? void 0 : r.some((n) => t[n] !== void 0));
}
Gt.shouldUseRule = Bh;
Object.defineProperty(Ie, "__esModule", { value: !0 });
Ie.reportTypeError = Ie.checkDataTypes = Ie.checkDataType = Ie.coerceAndCheckDataType = Ie.getJSONTypes = Ie.getSchemaTypes = Ie.DataType = void 0;
const pE = Wr, yE = Gt, $E = Is, ce = le, Hh = V;
var _n;
(function(t) {
  t[t.Correct = 0] = "Correct", t[t.Wrong = 1] = "Wrong";
})(_n || (Ie.DataType = _n = {}));
function gE(t) {
  const e = Wh(t.type);
  if (e.includes("null")) {
    if (t.nullable === !1)
      throw new Error("type: null contradicts nullable: false");
  } else {
    if (!e.length && t.nullable !== void 0)
      throw new Error('"nullable" cannot be used without "type"');
    t.nullable === !0 && e.push("null");
  }
  return e;
}
Ie.getSchemaTypes = gE;
function Wh(t) {
  const e = Array.isArray(t) ? t : t ? [t] : [];
  if (e.every(pE.isJSONType))
    return e;
  throw new Error("type must be JSONType or JSONType[]: " + e.join(","));
}
Ie.getJSONTypes = Wh;
function _E(t, e) {
  const { gen: r, data: n, opts: s } = t, a = vE(e, s.coerceTypes), o = e.length > 0 && !(a.length === 0 && e.length === 1 && (0, yE.schemaHasRulesForType)(t, e[0]));
  if (o) {
    const i = Zc(e, n, s.strictNumbers, _n.Wrong);
    r.if(i, () => {
      a.length ? wE(t, e, a) : el(t);
    });
  }
  return o;
}
Ie.coerceAndCheckDataType = _E;
const Jh = /* @__PURE__ */ new Set(["string", "number", "integer", "boolean", "null"]);
function vE(t, e) {
  return e ? t.filter((r) => Jh.has(r) || e === "array" && r === "array") : [];
}
function wE(t, e, r) {
  const { gen: n, data: s, opts: a } = t, o = n.let("dataType", (0, ce._)`typeof ${s}`), i = n.let("coerced", (0, ce._)`undefined`);
  a.coerceTypes === "array" && n.if((0, ce._)`${o} == 'object' && Array.isArray(${s}) && ${s}.length == 1`, () => n.assign(s, (0, ce._)`${s}[0]`).assign(o, (0, ce._)`typeof ${s}`).if(Zc(e, s, a.strictNumbers), () => n.assign(i, s))), n.if((0, ce._)`${i} !== undefined`);
  for (const d of r)
    (Jh.has(d) || d === "array" && a.coerceTypes === "array") && c(d);
  n.else(), el(t), n.endIf(), n.if((0, ce._)`${i} !== undefined`, () => {
    n.assign(s, i), bE(t, i);
  });
  function c(d) {
    switch (d) {
      case "string":
        n.elseIf((0, ce._)`${o} == "number" || ${o} == "boolean"`).assign(i, (0, ce._)`"" + ${s}`).elseIf((0, ce._)`${s} === null`).assign(i, (0, ce._)`""`);
        return;
      case "number":
        n.elseIf((0, ce._)`${o} == "boolean" || ${s} === null
              || (${o} == "string" && ${s} && ${s} == +${s})`).assign(i, (0, ce._)`+${s}`);
        return;
      case "integer":
        n.elseIf((0, ce._)`${o} === "boolean" || ${s} === null
              || (${o} === "string" && ${s} && ${s} == +${s} && !(${s} % 1))`).assign(i, (0, ce._)`+${s}`);
        return;
      case "boolean":
        n.elseIf((0, ce._)`${s} === "false" || ${s} === 0 || ${s} === null`).assign(i, !1).elseIf((0, ce._)`${s} === "true" || ${s} === 1`).assign(i, !0);
        return;
      case "null":
        n.elseIf((0, ce._)`${s} === "" || ${s} === 0 || ${s} === false`), n.assign(i, null);
        return;
      case "array":
        n.elseIf((0, ce._)`${o} === "string" || ${o} === "number"
              || ${o} === "boolean" || ${s} === null`).assign(i, (0, ce._)`[${s}]`);
    }
  }
}
function bE({ gen: t, parentData: e, parentDataProperty: r }, n) {
  t.if((0, ce._)`${e} !== undefined`, () => t.assign((0, ce._)`${e}[${r}]`, n));
}
function Si(t, e, r, n = _n.Correct) {
  const s = n === _n.Correct ? ce.operators.EQ : ce.operators.NEQ;
  let a;
  switch (t) {
    case "null":
      return (0, ce._)`${e} ${s} null`;
    case "array":
      a = (0, ce._)`Array.isArray(${e})`;
      break;
    case "object":
      a = (0, ce._)`${e} && typeof ${e} == "object" && !Array.isArray(${e})`;
      break;
    case "integer":
      a = o((0, ce._)`!(${e} % 1) && !isNaN(${e})`);
      break;
    case "number":
      a = o();
      break;
    default:
      return (0, ce._)`typeof ${e} ${s} ${t}`;
  }
  return n === _n.Correct ? a : (0, ce.not)(a);
  function o(i = ce.nil) {
    return (0, ce.and)((0, ce._)`typeof ${e} == "number"`, i, r ? (0, ce._)`isFinite(${e})` : ce.nil);
  }
}
Ie.checkDataType = Si;
function Zc(t, e, r, n) {
  if (t.length === 1)
    return Si(t[0], e, r, n);
  let s;
  const a = (0, Hh.toHash)(t);
  if (a.array && a.object) {
    const o = (0, ce._)`typeof ${e} != "object"`;
    s = a.null ? o : (0, ce._)`!${e} || ${o}`, delete a.null, delete a.array, delete a.object;
  } else
    s = ce.nil;
  a.number && delete a.integer;
  for (const o in a)
    s = (0, ce.and)(s, Si(o, e, r, n));
  return s;
}
Ie.checkDataTypes = Zc;
const EE = {
  message: ({ schema: t }) => `must be ${t}`,
  params: ({ schema: t, schemaValue: e }) => typeof t == "string" ? (0, ce._)`{type: ${t}}` : (0, ce._)`{type: ${e}}`
};
function el(t) {
  const e = SE(t);
  (0, $E.reportError)(e, EE);
}
Ie.reportTypeError = el;
function SE(t) {
  const { gen: e, data: r, schema: n } = t, s = (0, Hh.schemaRefOrVal)(t, n, "type");
  return {
    gen: e,
    keyword: "type",
    data: r,
    schema: n.type,
    schemaCode: s,
    schemaValue: s,
    parentSchema: n,
    params: {},
    it: t
  };
}
var uo = {};
Object.defineProperty(uo, "__esModule", { value: !0 });
uo.assignDefaults = void 0;
const en = le, PE = V;
function RE(t, e) {
  const { properties: r, items: n } = t.schema;
  if (e === "object" && r)
    for (const s in r)
      id(t, s, r[s].default);
  else e === "array" && Array.isArray(n) && n.forEach((s, a) => id(t, a, s.default));
}
uo.assignDefaults = RE;
function id(t, e, r) {
  const { gen: n, compositeRule: s, data: a, opts: o } = t;
  if (r === void 0)
    return;
  const i = (0, en._)`${a}${(0, en.getProperty)(e)}`;
  if (s) {
    (0, PE.checkStrictMode)(t, `default is ignored for: ${i}`);
    return;
  }
  let c = (0, en._)`${i} === undefined`;
  o.useDefaults === "empty" && (c = (0, en._)`${c} || ${i} === null || ${i} === ""`), n.if(c, (0, en._)`${i} = ${(0, en.stringify)(r)}`);
}
var Dt = {}, he = {};
Object.defineProperty(he, "__esModule", { value: !0 });
he.validateUnion = he.validateArray = he.usePattern = he.callValidateCode = he.schemaProperties = he.allSchemaProperties = he.noPropertyInData = he.propertyInData = he.isOwnProperty = he.hasPropFunc = he.reportMissingProp = he.checkMissingProp = he.checkReportMissingProp = void 0;
const ve = le, tl = V, tr = Ft, OE = V;
function IE(t, e) {
  const { gen: r, data: n, it: s } = t;
  r.if(nl(r, n, e, s.opts.ownProperties), () => {
    t.setParams({ missingProperty: (0, ve._)`${e}` }, !0), t.error();
  });
}
he.checkReportMissingProp = IE;
function NE({ gen: t, data: e, it: { opts: r } }, n, s) {
  return (0, ve.or)(...n.map((a) => (0, ve.and)(nl(t, e, a, r.ownProperties), (0, ve._)`${s} = ${a}`)));
}
he.checkMissingProp = NE;
function TE(t, e) {
  t.setParams({ missingProperty: e }, !0), t.error();
}
he.reportMissingProp = TE;
function Xh(t) {
  return t.scopeValue("func", {
    // eslint-disable-next-line @typescript-eslint/unbound-method
    ref: Object.prototype.hasOwnProperty,
    code: (0, ve._)`Object.prototype.hasOwnProperty`
  });
}
he.hasPropFunc = Xh;
function rl(t, e, r) {
  return (0, ve._)`${Xh(t)}.call(${e}, ${r})`;
}
he.isOwnProperty = rl;
function kE(t, e, r, n) {
  const s = (0, ve._)`${e}${(0, ve.getProperty)(r)} !== undefined`;
  return n ? (0, ve._)`${s} && ${rl(t, e, r)}` : s;
}
he.propertyInData = kE;
function nl(t, e, r, n) {
  const s = (0, ve._)`${e}${(0, ve.getProperty)(r)} === undefined`;
  return n ? (0, ve.or)(s, (0, ve.not)(rl(t, e, r))) : s;
}
he.noPropertyInData = nl;
function Yh(t) {
  return t ? Object.keys(t).filter((e) => e !== "__proto__") : [];
}
he.allSchemaProperties = Yh;
function AE(t, e) {
  return Yh(e).filter((r) => !(0, tl.alwaysValidSchema)(t, e[r]));
}
he.schemaProperties = AE;
function CE({ schemaCode: t, data: e, it: { gen: r, topSchemaRef: n, schemaPath: s, errorPath: a }, it: o }, i, c, d) {
  const l = d ? (0, ve._)`${t}, ${e}, ${n}${s}` : e, f = [
    [tr.default.instancePath, (0, ve.strConcat)(tr.default.instancePath, a)],
    [tr.default.parentData, o.parentData],
    [tr.default.parentDataProperty, o.parentDataProperty],
    [tr.default.rootData, tr.default.rootData]
  ];
  o.opts.dynamicRef && f.push([tr.default.dynamicAnchors, tr.default.dynamicAnchors]);
  const _ = (0, ve._)`${l}, ${r.object(...f)}`;
  return c !== ve.nil ? (0, ve._)`${i}.call(${c}, ${_})` : (0, ve._)`${i}(${_})`;
}
he.callValidateCode = CE;
const jE = (0, ve._)`new RegExp`;
function ME({ gen: t, it: { opts: e } }, r) {
  const n = e.unicodeRegExp ? "u" : "", { regExp: s } = e.code, a = s(r, n);
  return t.scopeValue("pattern", {
    key: a.toString(),
    ref: a,
    code: (0, ve._)`${s.code === "new RegExp" ? jE : (0, OE.useFunc)(t, s)}(${r}, ${n})`
  });
}
he.usePattern = ME;
function DE(t) {
  const { gen: e, data: r, keyword: n, it: s } = t, a = e.name("valid");
  if (s.allErrors) {
    const i = e.let("valid", !0);
    return o(() => e.assign(i, !1)), i;
  }
  return e.var(a, !0), o(() => e.break()), a;
  function o(i) {
    const c = e.const("len", (0, ve._)`${r}.length`);
    e.forRange("i", 0, c, (d) => {
      t.subschema({
        keyword: n,
        dataProp: d,
        dataPropType: tl.Type.Num
      }, a), e.if((0, ve.not)(a), i);
    });
  }
}
he.validateArray = DE;
function LE(t) {
  const { gen: e, schema: r, keyword: n, it: s } = t;
  if (!Array.isArray(r))
    throw new Error("ajv implementation error");
  if (r.some((c) => (0, tl.alwaysValidSchema)(s, c)) && !s.opts.unevaluated)
    return;
  const o = e.let("valid", !1), i = e.name("_valid");
  e.block(() => r.forEach((c, d) => {
    const l = t.subschema({
      keyword: n,
      schemaProp: d,
      compositeRule: !0
    }, i);
    e.assign(o, (0, ve._)`${o} || ${i}`), t.mergeValidEvaluated(l, i) || e.if((0, ve.not)(o));
  })), t.result(o, () => t.reset(), () => t.error(!0));
}
he.validateUnion = LE;
Object.defineProperty(Dt, "__esModule", { value: !0 });
Dt.validateKeywordUsage = Dt.validSchemaType = Dt.funcKeywordCode = Dt.macroKeywordCode = void 0;
const We = le, Fr = Ft, FE = he, VE = Is;
function xE(t, e) {
  const { gen: r, keyword: n, schema: s, parentSchema: a, it: o } = t, i = e.macro.call(o.self, s, a, o), c = Qh(r, n, i);
  o.opts.validateSchema !== !1 && o.self.validateSchema(i, !0);
  const d = r.name("valid");
  t.subschema({
    schema: i,
    schemaPath: We.nil,
    errSchemaPath: `${o.errSchemaPath}/${n}`,
    topSchemaRef: c,
    compositeRule: !0
  }, d), t.pass(d, () => t.error(!0));
}
Dt.macroKeywordCode = xE;
function UE(t, e) {
  var r;
  const { gen: n, keyword: s, schema: a, parentSchema: o, $data: i, it: c } = t;
  zE(c, e);
  const d = !i && e.compile ? e.compile.call(c.self, a, o, c) : e.validate, l = Qh(n, s, d), f = n.let("valid");
  t.block$data(f, _), t.ok((r = e.valid) !== null && r !== void 0 ? r : f);
  function _() {
    if (e.errors === !1)
      $(), e.modifying && cd(t), y(() => t.error());
    else {
      const m = e.async ? p() : w();
      e.modifying && cd(t), y(() => qE(t, m));
    }
  }
  function p() {
    const m = n.let("ruleErrs", null);
    return n.try(() => $((0, We._)`await `), (v) => n.assign(f, !1).if((0, We._)`${v} instanceof ${c.ValidationError}`, () => n.assign(m, (0, We._)`${v}.errors`), () => n.throw(v))), m;
  }
  function w() {
    const m = (0, We._)`${l}.errors`;
    return n.assign(m, null), $(We.nil), m;
  }
  function $(m = e.async ? (0, We._)`await ` : We.nil) {
    const v = c.opts.passContext ? Fr.default.this : Fr.default.self, P = !("compile" in e && !i || e.schema === !1);
    n.assign(f, (0, We._)`${m}${(0, FE.callValidateCode)(t, l, v, P)}`, e.modifying);
  }
  function y(m) {
    var v;
    n.if((0, We.not)((v = e.valid) !== null && v !== void 0 ? v : f), m);
  }
}
Dt.funcKeywordCode = UE;
function cd(t) {
  const { gen: e, data: r, it: n } = t;
  e.if(n.parentData, () => e.assign(r, (0, We._)`${n.parentData}[${n.parentDataProperty}]`));
}
function qE(t, e) {
  const { gen: r } = t;
  r.if((0, We._)`Array.isArray(${e})`, () => {
    r.assign(Fr.default.vErrors, (0, We._)`${Fr.default.vErrors} === null ? ${e} : ${Fr.default.vErrors}.concat(${e})`).assign(Fr.default.errors, (0, We._)`${Fr.default.vErrors}.length`), (0, VE.extendErrors)(t);
  }, () => t.error());
}
function zE({ schemaEnv: t }, e) {
  if (e.async && !t.$async)
    throw new Error("async keyword in sync schema");
}
function Qh(t, e, r) {
  if (r === void 0)
    throw new Error(`keyword "${e}" failed to compile`);
  return t.scopeValue("keyword", typeof r == "function" ? { ref: r } : { ref: r, code: (0, We.stringify)(r) });
}
function KE(t, e, r = !1) {
  return !e.length || e.some((n) => n === "array" ? Array.isArray(t) : n === "object" ? t && typeof t == "object" && !Array.isArray(t) : typeof t == n || r && typeof t > "u");
}
Dt.validSchemaType = KE;
function GE({ schema: t, opts: e, self: r, errSchemaPath: n }, s, a) {
  if (Array.isArray(s.keyword) ? !s.keyword.includes(a) : s.keyword !== a)
    throw new Error("ajv implementation error");
  const o = s.dependencies;
  if (o != null && o.some((i) => !Object.prototype.hasOwnProperty.call(t, i)))
    throw new Error(`parent schema must have dependencies of ${a}: ${o.join(",")}`);
  if (s.validateSchema && !s.validateSchema(t[a])) {
    const c = `keyword "${a}" value is invalid at path "${n}": ` + r.errorsText(s.validateSchema.errors);
    if (e.validateSchema === "log")
      r.logger.error(c);
    else
      throw new Error(c);
  }
}
Dt.validateKeywordUsage = GE;
var hr = {};
Object.defineProperty(hr, "__esModule", { value: !0 });
hr.extendSubschemaMode = hr.extendSubschemaData = hr.getSubschema = void 0;
const Ct = le, Zh = V;
function BE(t, { keyword: e, schemaProp: r, schema: n, schemaPath: s, errSchemaPath: a, topSchemaRef: o }) {
  if (e !== void 0 && n !== void 0)
    throw new Error('both "keyword" and "schema" passed, only one allowed');
  if (e !== void 0) {
    const i = t.schema[e];
    return r === void 0 ? {
      schema: i,
      schemaPath: (0, Ct._)`${t.schemaPath}${(0, Ct.getProperty)(e)}`,
      errSchemaPath: `${t.errSchemaPath}/${e}`
    } : {
      schema: i[r],
      schemaPath: (0, Ct._)`${t.schemaPath}${(0, Ct.getProperty)(e)}${(0, Ct.getProperty)(r)}`,
      errSchemaPath: `${t.errSchemaPath}/${e}/${(0, Zh.escapeFragment)(r)}`
    };
  }
  if (n !== void 0) {
    if (s === void 0 || a === void 0 || o === void 0)
      throw new Error('"schemaPath", "errSchemaPath" and "topSchemaRef" are required with "schema"');
    return {
      schema: n,
      schemaPath: s,
      topSchemaRef: o,
      errSchemaPath: a
    };
  }
  throw new Error('either "keyword" or "schema" must be passed');
}
hr.getSubschema = BE;
function HE(t, e, { dataProp: r, dataPropType: n, data: s, dataTypes: a, propertyName: o }) {
  if (s !== void 0 && r !== void 0)
    throw new Error('both "data" and "dataProp" passed, only one allowed');
  const { gen: i } = e;
  if (r !== void 0) {
    const { errorPath: d, dataPathArr: l, opts: f } = e, _ = i.let("data", (0, Ct._)`${e.data}${(0, Ct.getProperty)(r)}`, !0);
    c(_), t.errorPath = (0, Ct.str)`${d}${(0, Zh.getErrorPath)(r, n, f.jsPropertySyntax)}`, t.parentDataProperty = (0, Ct._)`${r}`, t.dataPathArr = [...l, t.parentDataProperty];
  }
  if (s !== void 0) {
    const d = s instanceof Ct.Name ? s : i.let("data", s, !0);
    c(d), o !== void 0 && (t.propertyName = o);
  }
  a && (t.dataTypes = a);
  function c(d) {
    t.data = d, t.dataLevel = e.dataLevel + 1, t.dataTypes = [], e.definedProperties = /* @__PURE__ */ new Set(), t.parentData = e.data, t.dataNames = [...e.dataNames, d];
  }
}
hr.extendSubschemaData = HE;
function WE(t, { jtdDiscriminator: e, jtdMetadata: r, compositeRule: n, createErrors: s, allErrors: a }) {
  n !== void 0 && (t.compositeRule = n), s !== void 0 && (t.createErrors = s), a !== void 0 && (t.allErrors = a), t.jtdDiscriminator = e, t.jtdMetadata = r;
}
hr.extendSubschemaMode = WE;
var Fe = {}, em = { exports: {} }, dr = em.exports = function(t, e, r) {
  typeof e == "function" && (r = e, e = {}), r = e.cb || r;
  var n = typeof r == "function" ? r : r.pre || function() {
  }, s = r.post || function() {
  };
  $a(e, n, s, t, "", t);
};
dr.keywords = {
  additionalItems: !0,
  items: !0,
  contains: !0,
  additionalProperties: !0,
  propertyNames: !0,
  not: !0,
  if: !0,
  then: !0,
  else: !0
};
dr.arrayKeywords = {
  items: !0,
  allOf: !0,
  anyOf: !0,
  oneOf: !0
};
dr.propsKeywords = {
  $defs: !0,
  definitions: !0,
  properties: !0,
  patternProperties: !0,
  dependencies: !0
};
dr.skipKeywords = {
  default: !0,
  enum: !0,
  const: !0,
  required: !0,
  maximum: !0,
  minimum: !0,
  exclusiveMaximum: !0,
  exclusiveMinimum: !0,
  multipleOf: !0,
  maxLength: !0,
  minLength: !0,
  pattern: !0,
  format: !0,
  maxItems: !0,
  minItems: !0,
  uniqueItems: !0,
  maxProperties: !0,
  minProperties: !0
};
function $a(t, e, r, n, s, a, o, i, c, d) {
  if (n && typeof n == "object" && !Array.isArray(n)) {
    e(n, s, a, o, i, c, d);
    for (var l in n) {
      var f = n[l];
      if (Array.isArray(f)) {
        if (l in dr.arrayKeywords)
          for (var _ = 0; _ < f.length; _++)
            $a(t, e, r, f[_], s + "/" + l + "/" + _, a, s, l, n, _);
      } else if (l in dr.propsKeywords) {
        if (f && typeof f == "object")
          for (var p in f)
            $a(t, e, r, f[p], s + "/" + l + "/" + JE(p), a, s, l, n, p);
      } else (l in dr.keywords || t.allKeys && !(l in dr.skipKeywords)) && $a(t, e, r, f, s + "/" + l, a, s, l, n);
    }
    r(n, s, a, o, i, c, d);
  }
}
function JE(t) {
  return t.replace(/~/g, "~0").replace(/\//g, "~1");
}
var XE = em.exports;
Object.defineProperty(Fe, "__esModule", { value: !0 });
Fe.getSchemaRefs = Fe.resolveUrl = Fe.normalizeId = Fe._getFullPath = Fe.getFullPath = Fe.inlineRef = void 0;
const YE = V, QE = no, ZE = XE, eS = /* @__PURE__ */ new Set([
  "type",
  "format",
  "pattern",
  "maxLength",
  "minLength",
  "maxProperties",
  "minProperties",
  "maxItems",
  "minItems",
  "maximum",
  "minimum",
  "uniqueItems",
  "multipleOf",
  "required",
  "enum",
  "const"
]);
function tS(t, e = !0) {
  return typeof t == "boolean" ? !0 : e === !0 ? !Pi(t) : e ? tm(t) <= e : !1;
}
Fe.inlineRef = tS;
const rS = /* @__PURE__ */ new Set([
  "$ref",
  "$recursiveRef",
  "$recursiveAnchor",
  "$dynamicRef",
  "$dynamicAnchor"
]);
function Pi(t) {
  for (const e in t) {
    if (rS.has(e))
      return !0;
    const r = t[e];
    if (Array.isArray(r) && r.some(Pi) || typeof r == "object" && Pi(r))
      return !0;
  }
  return !1;
}
function tm(t) {
  let e = 0;
  for (const r in t) {
    if (r === "$ref")
      return 1 / 0;
    if (e++, !eS.has(r) && (typeof t[r] == "object" && (0, YE.eachItem)(t[r], (n) => e += tm(n)), e === 1 / 0))
      return 1 / 0;
  }
  return e;
}
function rm(t, e = "", r) {
  r !== !1 && (e = vn(e));
  const n = t.parse(e);
  return nm(t, n);
}
Fe.getFullPath = rm;
function nm(t, e) {
  return t.serialize(e).split("#")[0] + "#";
}
Fe._getFullPath = nm;
const nS = /#\/?$/;
function vn(t) {
  return t ? t.replace(nS, "") : "";
}
Fe.normalizeId = vn;
function sS(t, e, r) {
  return r = vn(r), t.resolve(e, r);
}
Fe.resolveUrl = sS;
const aS = /^[a-z_][-a-z0-9._]*$/i;
function oS(t, e) {
  if (typeof t == "boolean")
    return {};
  const { schemaId: r, uriResolver: n } = this.opts, s = vn(t[r] || e), a = { "": s }, o = rm(n, s, !1), i = {}, c = /* @__PURE__ */ new Set();
  return ZE(t, { allKeys: !0 }, (f, _, p, w) => {
    if (w === void 0)
      return;
    const $ = o + _;
    let y = a[w];
    typeof f[r] == "string" && (y = m.call(this, f[r])), v.call(this, f.$anchor), v.call(this, f.$dynamicAnchor), a[_] = y;
    function m(P) {
      const R = this.opts.uriResolver.resolve;
      if (P = vn(y ? R(y, P) : P), c.has(P))
        throw l(P);
      c.add(P);
      let N = this.refs[P];
      return typeof N == "string" && (N = this.refs[N]), typeof N == "object" ? d(f, N.schema, P) : P !== vn($) && (P[0] === "#" ? (d(f, i[P], P), i[P] = f) : this.refs[P] = $), P;
    }
    function v(P) {
      if (typeof P == "string") {
        if (!aS.test(P))
          throw new Error(`invalid anchor "${P}"`);
        m.call(this, `#${P}`);
      }
    }
  }), i;
  function d(f, _, p) {
    if (_ !== void 0 && !QE(f, _))
      throw l(p);
  }
  function l(f) {
    return new Error(`reference "${f}" resolves to more than one schema`);
  }
}
Fe.getSchemaRefs = oS;
Object.defineProperty(St, "__esModule", { value: !0 });
St.getData = St.KeywordCxt = St.validateFunctionCode = void 0;
const sm = Sn, ld = Ie, sl = Gt, La = Ie, iS = uo, fs = Dt, zo = hr, W = le, te = Ft, cS = Fe, Bt = V, Kn = Is;
function lS(t) {
  if (im(t) && (cm(t), om(t))) {
    fS(t);
    return;
  }
  am(t, () => (0, sm.topBoolOrEmptySchema)(t));
}
St.validateFunctionCode = lS;
function am({ gen: t, validateName: e, schema: r, schemaEnv: n, opts: s }, a) {
  s.code.es5 ? t.func(e, (0, W._)`${te.default.data}, ${te.default.valCxt}`, n.$async, () => {
    t.code((0, W._)`"use strict"; ${ud(r, s)}`), dS(t, s), t.code(a);
  }) : t.func(e, (0, W._)`${te.default.data}, ${uS(s)}`, n.$async, () => t.code(ud(r, s)).code(a));
}
function uS(t) {
  return (0, W._)`{${te.default.instancePath}="", ${te.default.parentData}, ${te.default.parentDataProperty}, ${te.default.rootData}=${te.default.data}${t.dynamicRef ? (0, W._)`, ${te.default.dynamicAnchors}={}` : W.nil}}={}`;
}
function dS(t, e) {
  t.if(te.default.valCxt, () => {
    t.var(te.default.instancePath, (0, W._)`${te.default.valCxt}.${te.default.instancePath}`), t.var(te.default.parentData, (0, W._)`${te.default.valCxt}.${te.default.parentData}`), t.var(te.default.parentDataProperty, (0, W._)`${te.default.valCxt}.${te.default.parentDataProperty}`), t.var(te.default.rootData, (0, W._)`${te.default.valCxt}.${te.default.rootData}`), e.dynamicRef && t.var(te.default.dynamicAnchors, (0, W._)`${te.default.valCxt}.${te.default.dynamicAnchors}`);
  }, () => {
    t.var(te.default.instancePath, (0, W._)`""`), t.var(te.default.parentData, (0, W._)`undefined`), t.var(te.default.parentDataProperty, (0, W._)`undefined`), t.var(te.default.rootData, te.default.data), e.dynamicRef && t.var(te.default.dynamicAnchors, (0, W._)`{}`);
  });
}
function fS(t) {
  const { schema: e, opts: r, gen: n } = t;
  am(t, () => {
    r.$comment && e.$comment && um(t), $S(t), n.let(te.default.vErrors, null), n.let(te.default.errors, 0), r.unevaluated && hS(t), lm(t), vS(t);
  });
}
function hS(t) {
  const { gen: e, validateName: r } = t;
  t.evaluated = e.const("evaluated", (0, W._)`${r}.evaluated`), e.if((0, W._)`${t.evaluated}.dynamicProps`, () => e.assign((0, W._)`${t.evaluated}.props`, (0, W._)`undefined`)), e.if((0, W._)`${t.evaluated}.dynamicItems`, () => e.assign((0, W._)`${t.evaluated}.items`, (0, W._)`undefined`));
}
function ud(t, e) {
  const r = typeof t == "object" && t[e.schemaId];
  return r && (e.code.source || e.code.process) ? (0, W._)`/*# sourceURL=${r} */` : W.nil;
}
function mS(t, e) {
  if (im(t) && (cm(t), om(t))) {
    pS(t, e);
    return;
  }
  (0, sm.boolOrEmptySchema)(t, e);
}
function om({ schema: t, self: e }) {
  if (typeof t == "boolean")
    return !t;
  for (const r in t)
    if (e.RULES.all[r])
      return !0;
  return !1;
}
function im(t) {
  return typeof t.schema != "boolean";
}
function pS(t, e) {
  const { schema: r, gen: n, opts: s } = t;
  s.$comment && r.$comment && um(t), gS(t), _S(t);
  const a = n.const("_errs", te.default.errors);
  lm(t, a), n.var(e, (0, W._)`${a} === ${te.default.errors}`);
}
function cm(t) {
  (0, Bt.checkUnknownRules)(t), yS(t);
}
function lm(t, e) {
  if (t.opts.jtd)
    return dd(t, [], !1, e);
  const r = (0, ld.getSchemaTypes)(t.schema), n = (0, ld.coerceAndCheckDataType)(t, r);
  dd(t, r, !n, e);
}
function yS(t) {
  const { schema: e, errSchemaPath: r, opts: n, self: s } = t;
  e.$ref && n.ignoreKeywordsWithRef && (0, Bt.schemaHasRulesButRef)(e, s.RULES) && s.logger.warn(`$ref: keywords ignored in schema at path "${r}"`);
}
function $S(t) {
  const { schema: e, opts: r } = t;
  e.default !== void 0 && r.useDefaults && r.strictSchema && (0, Bt.checkStrictMode)(t, "default is ignored in the schema root");
}
function gS(t) {
  const e = t.schema[t.opts.schemaId];
  e && (t.baseId = (0, cS.resolveUrl)(t.opts.uriResolver, t.baseId, e));
}
function _S(t) {
  if (t.schema.$async && !t.schemaEnv.$async)
    throw new Error("async schema in sync schema");
}
function um({ gen: t, schemaEnv: e, schema: r, errSchemaPath: n, opts: s }) {
  const a = r.$comment;
  if (s.$comment === !0)
    t.code((0, W._)`${te.default.self}.logger.log(${a})`);
  else if (typeof s.$comment == "function") {
    const o = (0, W.str)`${n}/$comment`, i = t.scopeValue("root", { ref: e.root });
    t.code((0, W._)`${te.default.self}.opts.$comment(${a}, ${o}, ${i}.schema)`);
  }
}
function vS(t) {
  const { gen: e, schemaEnv: r, validateName: n, ValidationError: s, opts: a } = t;
  r.$async ? e.if((0, W._)`${te.default.errors} === 0`, () => e.return(te.default.data), () => e.throw((0, W._)`new ${s}(${te.default.vErrors})`)) : (e.assign((0, W._)`${n}.errors`, te.default.vErrors), a.unevaluated && wS(t), e.return((0, W._)`${te.default.errors} === 0`));
}
function wS({ gen: t, evaluated: e, props: r, items: n }) {
  r instanceof W.Name && t.assign((0, W._)`${e}.props`, r), n instanceof W.Name && t.assign((0, W._)`${e}.items`, n);
}
function dd(t, e, r, n) {
  const { gen: s, schema: a, data: o, allErrors: i, opts: c, self: d } = t, { RULES: l } = d;
  if (a.$ref && (c.ignoreKeywordsWithRef || !(0, Bt.schemaHasRulesButRef)(a, l))) {
    s.block(() => hm(t, "$ref", l.all.$ref.definition));
    return;
  }
  c.jtd || bS(t, e), s.block(() => {
    for (const _ of l.rules)
      f(_);
    f(l.post);
  });
  function f(_) {
    (0, sl.shouldUseGroup)(a, _) && (_.type ? (s.if((0, La.checkDataType)(_.type, o, c.strictNumbers)), fd(t, _), e.length === 1 && e[0] === _.type && r && (s.else(), (0, La.reportTypeError)(t)), s.endIf()) : fd(t, _), i || s.if((0, W._)`${te.default.errors} === ${n || 0}`));
  }
}
function fd(t, e) {
  const { gen: r, schema: n, opts: { useDefaults: s } } = t;
  s && (0, iS.assignDefaults)(t, e.type), r.block(() => {
    for (const a of e.rules)
      (0, sl.shouldUseRule)(n, a) && hm(t, a.keyword, a.definition, e.type);
  });
}
function bS(t, e) {
  t.schemaEnv.meta || !t.opts.strictTypes || (ES(t, e), t.opts.allowUnionTypes || SS(t, e), PS(t, t.dataTypes));
}
function ES(t, e) {
  if (e.length) {
    if (!t.dataTypes.length) {
      t.dataTypes = e;
      return;
    }
    e.forEach((r) => {
      dm(t.dataTypes, r) || al(t, `type "${r}" not allowed by context "${t.dataTypes.join(",")}"`);
    }), OS(t, e);
  }
}
function SS(t, e) {
  e.length > 1 && !(e.length === 2 && e.includes("null")) && al(t, "use allowUnionTypes to allow union type keyword");
}
function PS(t, e) {
  const r = t.self.RULES.all;
  for (const n in r) {
    const s = r[n];
    if (typeof s == "object" && (0, sl.shouldUseRule)(t.schema, s)) {
      const { type: a } = s.definition;
      a.length && !a.some((o) => RS(e, o)) && al(t, `missing type "${a.join(",")}" for keyword "${n}"`);
    }
  }
}
function RS(t, e) {
  return t.includes(e) || e === "number" && t.includes("integer");
}
function dm(t, e) {
  return t.includes(e) || e === "integer" && t.includes("number");
}
function OS(t, e) {
  const r = [];
  for (const n of t.dataTypes)
    dm(e, n) ? r.push(n) : e.includes("integer") && n === "number" && r.push("integer");
  t.dataTypes = r;
}
function al(t, e) {
  const r = t.schemaEnv.baseId + t.errSchemaPath;
  e += ` at "${r}" (strictTypes)`, (0, Bt.checkStrictMode)(t, e, t.opts.strictTypes);
}
class fm {
  constructor(e, r, n) {
    if ((0, fs.validateKeywordUsage)(e, r, n), this.gen = e.gen, this.allErrors = e.allErrors, this.keyword = n, this.data = e.data, this.schema = e.schema[n], this.$data = r.$data && e.opts.$data && this.schema && this.schema.$data, this.schemaValue = (0, Bt.schemaRefOrVal)(e, this.schema, n, this.$data), this.schemaType = r.schemaType, this.parentSchema = e.schema, this.params = {}, this.it = e, this.def = r, this.$data)
      this.schemaCode = e.gen.const("vSchema", mm(this.$data, e));
    else if (this.schemaCode = this.schemaValue, !(0, fs.validSchemaType)(this.schema, r.schemaType, r.allowUndefined))
      throw new Error(`${n} value must be ${JSON.stringify(r.schemaType)}`);
    ("code" in r ? r.trackErrors : r.errors !== !1) && (this.errsCount = e.gen.const("_errs", te.default.errors));
  }
  result(e, r, n) {
    this.failResult((0, W.not)(e), r, n);
  }
  failResult(e, r, n) {
    this.gen.if(e), n ? n() : this.error(), r ? (this.gen.else(), r(), this.allErrors && this.gen.endIf()) : this.allErrors ? this.gen.endIf() : this.gen.else();
  }
  pass(e, r) {
    this.failResult((0, W.not)(e), void 0, r);
  }
  fail(e) {
    if (e === void 0) {
      this.error(), this.allErrors || this.gen.if(!1);
      return;
    }
    this.gen.if(e), this.error(), this.allErrors ? this.gen.endIf() : this.gen.else();
  }
  fail$data(e) {
    if (!this.$data)
      return this.fail(e);
    const { schemaCode: r } = this;
    this.fail((0, W._)`${r} !== undefined && (${(0, W.or)(this.invalid$data(), e)})`);
  }
  error(e, r, n) {
    if (r) {
      this.setParams(r), this._error(e, n), this.setParams({});
      return;
    }
    this._error(e, n);
  }
  _error(e, r) {
    (e ? Kn.reportExtraError : Kn.reportError)(this, this.def.error, r);
  }
  $dataError() {
    (0, Kn.reportError)(this, this.def.$dataError || Kn.keyword$DataError);
  }
  reset() {
    if (this.errsCount === void 0)
      throw new Error('add "trackErrors" to keyword definition');
    (0, Kn.resetErrorsCount)(this.gen, this.errsCount);
  }
  ok(e) {
    this.allErrors || this.gen.if(e);
  }
  setParams(e, r) {
    r ? Object.assign(this.params, e) : this.params = e;
  }
  block$data(e, r, n = W.nil) {
    this.gen.block(() => {
      this.check$data(e, n), r();
    });
  }
  check$data(e = W.nil, r = W.nil) {
    if (!this.$data)
      return;
    const { gen: n, schemaCode: s, schemaType: a, def: o } = this;
    n.if((0, W.or)((0, W._)`${s} === undefined`, r)), e !== W.nil && n.assign(e, !0), (a.length || o.validateSchema) && (n.elseIf(this.invalid$data()), this.$dataError(), e !== W.nil && n.assign(e, !1)), n.else();
  }
  invalid$data() {
    const { gen: e, schemaCode: r, schemaType: n, def: s, it: a } = this;
    return (0, W.or)(o(), i());
    function o() {
      if (n.length) {
        if (!(r instanceof W.Name))
          throw new Error("ajv implementation error");
        const c = Array.isArray(n) ? n : [n];
        return (0, W._)`${(0, La.checkDataTypes)(c, r, a.opts.strictNumbers, La.DataType.Wrong)}`;
      }
      return W.nil;
    }
    function i() {
      if (s.validateSchema) {
        const c = e.scopeValue("validate$data", { ref: s.validateSchema });
        return (0, W._)`!${c}(${r})`;
      }
      return W.nil;
    }
  }
  subschema(e, r) {
    const n = (0, zo.getSubschema)(this.it, e);
    (0, zo.extendSubschemaData)(n, this.it, e), (0, zo.extendSubschemaMode)(n, e);
    const s = { ...this.it, ...n, items: void 0, props: void 0 };
    return mS(s, r), s;
  }
  mergeEvaluated(e, r) {
    const { it: n, gen: s } = this;
    n.opts.unevaluated && (n.props !== !0 && e.props !== void 0 && (n.props = Bt.mergeEvaluated.props(s, e.props, n.props, r)), n.items !== !0 && e.items !== void 0 && (n.items = Bt.mergeEvaluated.items(s, e.items, n.items, r)));
  }
  mergeValidEvaluated(e, r) {
    const { it: n, gen: s } = this;
    if (n.opts.unevaluated && (n.props !== !0 || n.items !== !0))
      return s.if(r, () => this.mergeEvaluated(e, W.Name)), !0;
  }
}
St.KeywordCxt = fm;
function hm(t, e, r, n) {
  const s = new fm(t, r, e);
  "code" in r ? r.code(s, n) : s.$data && r.validate ? (0, fs.funcKeywordCode)(s, r) : "macro" in r ? (0, fs.macroKeywordCode)(s, r) : (r.compile || r.validate) && (0, fs.funcKeywordCode)(s, r);
}
const IS = /^\/(?:[^~]|~0|~1)*$/, NS = /^([0-9]+)(#|\/(?:[^~]|~0|~1)*)?$/;
function mm(t, { dataLevel: e, dataNames: r, dataPathArr: n }) {
  let s, a;
  if (t === "")
    return te.default.rootData;
  if (t[0] === "/") {
    if (!IS.test(t))
      throw new Error(`Invalid JSON-pointer: ${t}`);
    s = t, a = te.default.rootData;
  } else {
    const d = NS.exec(t);
    if (!d)
      throw new Error(`Invalid JSON-pointer: ${t}`);
    const l = +d[1];
    if (s = d[2], s === "#") {
      if (l >= e)
        throw new Error(c("property/index", l));
      return n[e - l];
    }
    if (l > e)
      throw new Error(c("data", l));
    if (a = r[e - l], !s)
      return a;
  }
  let o = a;
  const i = s.split("/");
  for (const d of i)
    d && (a = (0, W._)`${a}${(0, W.getProperty)((0, Bt.unescapeJsonPointer)(d))}`, o = (0, W._)`${o} && ${a}`);
  return o;
  function c(d, l) {
    return `Cannot access ${d} ${l} levels up, current level is ${e}`;
  }
}
St.getData = mm;
var zs = {}, hd;
function ol() {
  if (hd) return zs;
  hd = 1, Object.defineProperty(zs, "__esModule", { value: !0 });
  class t extends Error {
    constructor(r) {
      super("validation failed"), this.errors = r, this.ajv = this.validation = !0;
    }
  }
  return zs.default = t, zs;
}
var An = {};
Object.defineProperty(An, "__esModule", { value: !0 });
const Ko = Fe;
class TS extends Error {
  constructor(e, r, n, s) {
    super(s || `can't resolve reference ${n} from id ${r}`), this.missingRef = (0, Ko.resolveUrl)(e, r, n), this.missingSchema = (0, Ko.normalizeId)((0, Ko.getFullPath)(e, this.missingRef));
  }
}
An.default = TS;
var tt = {};
Object.defineProperty(tt, "__esModule", { value: !0 });
tt.resolveSchema = tt.getCompilingSchema = tt.resolveRef = tt.compileSchema = tt.SchemaEnv = void 0;
const yt = le, kS = ol(), kr = Ft, bt = Fe, md = V, AS = St;
class fo {
  constructor(e) {
    var r;
    this.refs = {}, this.dynamicAnchors = {};
    let n;
    typeof e.schema == "object" && (n = e.schema), this.schema = e.schema, this.schemaId = e.schemaId, this.root = e.root || this, this.baseId = (r = e.baseId) !== null && r !== void 0 ? r : (0, bt.normalizeId)(n == null ? void 0 : n[e.schemaId || "$id"]), this.schemaPath = e.schemaPath, this.localRefs = e.localRefs, this.meta = e.meta, this.$async = n == null ? void 0 : n.$async, this.refs = {};
  }
}
tt.SchemaEnv = fo;
function il(t) {
  const e = pm.call(this, t);
  if (e)
    return e;
  const r = (0, bt.getFullPath)(this.opts.uriResolver, t.root.baseId), { es5: n, lines: s } = this.opts.code, { ownProperties: a } = this.opts, o = new yt.CodeGen(this.scope, { es5: n, lines: s, ownProperties: a });
  let i;
  t.$async && (i = o.scopeValue("Error", {
    ref: kS.default,
    code: (0, yt._)`require("ajv/dist/runtime/validation_error").default`
  }));
  const c = o.scopeName("validate");
  t.validateName = c;
  const d = {
    gen: o,
    allErrors: this.opts.allErrors,
    data: kr.default.data,
    parentData: kr.default.parentData,
    parentDataProperty: kr.default.parentDataProperty,
    dataNames: [kr.default.data],
    dataPathArr: [yt.nil],
    // TODO can its length be used as dataLevel if nil is removed?
    dataLevel: 0,
    dataTypes: [],
    definedProperties: /* @__PURE__ */ new Set(),
    topSchemaRef: o.scopeValue("schema", this.opts.code.source === !0 ? { ref: t.schema, code: (0, yt.stringify)(t.schema) } : { ref: t.schema }),
    validateName: c,
    ValidationError: i,
    schema: t.schema,
    schemaEnv: t,
    rootId: r,
    baseId: t.baseId || r,
    schemaPath: yt.nil,
    errSchemaPath: t.schemaPath || (this.opts.jtd ? "" : "#"),
    errorPath: (0, yt._)`""`,
    opts: this.opts,
    self: this
  };
  let l;
  try {
    this._compilations.add(t), (0, AS.validateFunctionCode)(d), o.optimize(this.opts.code.optimize);
    const f = o.toString();
    l = `${o.scopeRefs(kr.default.scope)}return ${f}`, this.opts.code.process && (l = this.opts.code.process(l, t));
    const p = new Function(`${kr.default.self}`, `${kr.default.scope}`, l)(this, this.scope.get());
    if (this.scope.value(c, { ref: p }), p.errors = null, p.schema = t.schema, p.schemaEnv = t, t.$async && (p.$async = !0), this.opts.code.source === !0 && (p.source = { validateName: c, validateCode: f, scopeValues: o._values }), this.opts.unevaluated) {
      const { props: w, items: $ } = d;
      p.evaluated = {
        props: w instanceof yt.Name ? void 0 : w,
        items: $ instanceof yt.Name ? void 0 : $,
        dynamicProps: w instanceof yt.Name,
        dynamicItems: $ instanceof yt.Name
      }, p.source && (p.source.evaluated = (0, yt.stringify)(p.evaluated));
    }
    return t.validate = p, t;
  } catch (f) {
    throw delete t.validate, delete t.validateName, l && this.logger.error("Error compiling schema, function code:", l), f;
  } finally {
    this._compilations.delete(t);
  }
}
tt.compileSchema = il;
function CS(t, e, r) {
  var n;
  r = (0, bt.resolveUrl)(this.opts.uriResolver, e, r);
  const s = t.refs[r];
  if (s)
    return s;
  let a = DS.call(this, t, r);
  if (a === void 0) {
    const o = (n = t.localRefs) === null || n === void 0 ? void 0 : n[r], { schemaId: i } = this.opts;
    o && (a = new fo({ schema: o, schemaId: i, root: t, baseId: e }));
  }
  if (a !== void 0)
    return t.refs[r] = jS.call(this, a);
}
tt.resolveRef = CS;
function jS(t) {
  return (0, bt.inlineRef)(t.schema, this.opts.inlineRefs) ? t.schema : t.validate ? t : il.call(this, t);
}
function pm(t) {
  for (const e of this._compilations)
    if (MS(e, t))
      return e;
}
tt.getCompilingSchema = pm;
function MS(t, e) {
  return t.schema === e.schema && t.root === e.root && t.baseId === e.baseId;
}
function DS(t, e) {
  let r;
  for (; typeof (r = this.refs[e]) == "string"; )
    e = r;
  return r || this.schemas[e] || ho.call(this, t, e);
}
function ho(t, e) {
  const r = this.opts.uriResolver.parse(e), n = (0, bt._getFullPath)(this.opts.uriResolver, r);
  let s = (0, bt.getFullPath)(this.opts.uriResolver, t.baseId, void 0);
  if (Object.keys(t.schema).length > 0 && n === s)
    return Go.call(this, r, t);
  const a = (0, bt.normalizeId)(n), o = this.refs[a] || this.schemas[a];
  if (typeof o == "string") {
    const i = ho.call(this, t, o);
    return typeof (i == null ? void 0 : i.schema) != "object" ? void 0 : Go.call(this, r, i);
  }
  if (typeof (o == null ? void 0 : o.schema) == "object") {
    if (o.validate || il.call(this, o), a === (0, bt.normalizeId)(e)) {
      const { schema: i } = o, { schemaId: c } = this.opts, d = i[c];
      return d && (s = (0, bt.resolveUrl)(this.opts.uriResolver, s, d)), new fo({ schema: i, schemaId: c, root: t, baseId: s });
    }
    return Go.call(this, r, o);
  }
}
tt.resolveSchema = ho;
const LS = /* @__PURE__ */ new Set([
  "properties",
  "patternProperties",
  "enum",
  "dependencies",
  "definitions"
]);
function Go(t, { baseId: e, schema: r, root: n }) {
  var s;
  if (((s = t.fragment) === null || s === void 0 ? void 0 : s[0]) !== "/")
    return;
  for (const i of t.fragment.slice(1).split("/")) {
    if (typeof r == "boolean")
      return;
    const c = r[(0, md.unescapeFragment)(i)];
    if (c === void 0)
      return;
    r = c;
    const d = typeof r == "object" && r[this.opts.schemaId];
    !LS.has(i) && d && (e = (0, bt.resolveUrl)(this.opts.uriResolver, e, d));
  }
  let a;
  if (typeof r != "boolean" && r.$ref && !(0, md.schemaHasRulesButRef)(r, this.RULES)) {
    const i = (0, bt.resolveUrl)(this.opts.uriResolver, e, r.$ref);
    a = ho.call(this, n, i);
  }
  const { schemaId: o } = this.opts;
  if (a = a || new fo({ schema: r, schemaId: o, root: n, baseId: e }), a.schema !== a.root.schema)
    return a;
}
const FS = "https://raw.githubusercontent.com/ajv-validator/ajv/master/lib/refs/data.json#", VS = "Meta-schema for $data reference (JSON AnySchema extension proposal)", xS = "object", US = [
  "$data"
], qS = {
  $data: {
    type: "string",
    anyOf: [
      {
        format: "relative-json-pointer"
      },
      {
        format: "json-pointer"
      }
    ]
  }
}, zS = !1, KS = {
  $id: FS,
  description: VS,
  type: xS,
  required: US,
  properties: qS,
  additionalProperties: zS
};
var cl = {};
Object.defineProperty(cl, "__esModule", { value: !0 });
const ym = Ph;
ym.code = 'require("ajv/dist/runtime/uri").default';
cl.default = ym;
(function(t) {
  Object.defineProperty(t, "__esModule", { value: !0 }), t.CodeGen = t.Name = t.nil = t.stringify = t.str = t._ = t.KeywordCxt = void 0;
  var e = St;
  Object.defineProperty(t, "KeywordCxt", { enumerable: !0, get: function() {
    return e.KeywordCxt;
  } });
  var r = le;
  Object.defineProperty(t, "_", { enumerable: !0, get: function() {
    return r._;
  } }), Object.defineProperty(t, "str", { enumerable: !0, get: function() {
    return r.str;
  } }), Object.defineProperty(t, "stringify", { enumerable: !0, get: function() {
    return r.stringify;
  } }), Object.defineProperty(t, "nil", { enumerable: !0, get: function() {
    return r.nil;
  } }), Object.defineProperty(t, "Name", { enumerable: !0, get: function() {
    return r.Name;
  } }), Object.defineProperty(t, "CodeGen", { enumerable: !0, get: function() {
    return r.CodeGen;
  } });
  const n = ol(), s = An, a = Wr, o = tt, i = le, c = Fe, d = Ie, l = V, f = KS, _ = cl, p = (O, g) => new RegExp(O, g);
  p.code = "new RegExp";
  const w = ["removeAdditional", "useDefaults", "coerceTypes"], $ = /* @__PURE__ */ new Set([
    "validate",
    "serialize",
    "parse",
    "wrapper",
    "root",
    "schema",
    "keyword",
    "pattern",
    "formats",
    "validate$data",
    "func",
    "obj",
    "Error"
  ]), y = {
    errorDataPath: "",
    format: "`validateFormats: false` can be used instead.",
    nullable: '"nullable" keyword is supported by default.',
    jsonPointers: "Deprecated jsPropertySyntax can be used instead.",
    extendRefs: "Deprecated ignoreKeywordsWithRef can be used instead.",
    missingRefs: "Pass empty schema with $id that should be ignored to ajv.addSchema.",
    processCode: "Use option `code: {process: (code, schemaEnv: object) => string}`",
    sourceCode: "Use option `code: {source: true}`",
    strictDefaults: "It is default now, see option `strict`.",
    strictKeywords: "It is default now, see option `strict`.",
    uniqueItems: '"uniqueItems" keyword is always validated.',
    unknownFormats: "Disable strict mode or pass `true` to `ajv.addFormat` (or `formats` option).",
    cache: "Map is used as cache, schema object as key.",
    serialize: "Map is used as cache, schema object as key.",
    ajvErrors: "It is default now."
  }, m = {
    ignoreKeywordsWithRef: "",
    jsPropertySyntax: "",
    unicode: '"minLength"/"maxLength" account for unicode characters by default.'
  }, v = 200;
  function P(O) {
    var g, S, b, u, h, E, T, A, G, K, pe, rt, pr, yr, $r, gr, _r, vr, wr, br, Er, Sr, Pr, Rr, Or;
    const mt = O.strict, Ir = (g = O.code) === null || g === void 0 ? void 0 : g.optimize, Fn = Ir === !0 || Ir === void 0 ? 1 : Ir || 0, Vn = (b = (S = O.code) === null || S === void 0 ? void 0 : S.regExp) !== null && b !== void 0 ? b : p, ko = (u = O.uriResolver) !== null && u !== void 0 ? u : _.default;
    return {
      strictSchema: (E = (h = O.strictSchema) !== null && h !== void 0 ? h : mt) !== null && E !== void 0 ? E : !0,
      strictNumbers: (A = (T = O.strictNumbers) !== null && T !== void 0 ? T : mt) !== null && A !== void 0 ? A : !0,
      strictTypes: (K = (G = O.strictTypes) !== null && G !== void 0 ? G : mt) !== null && K !== void 0 ? K : "log",
      strictTuples: (rt = (pe = O.strictTuples) !== null && pe !== void 0 ? pe : mt) !== null && rt !== void 0 ? rt : "log",
      strictRequired: (yr = (pr = O.strictRequired) !== null && pr !== void 0 ? pr : mt) !== null && yr !== void 0 ? yr : !1,
      code: O.code ? { ...O.code, optimize: Fn, regExp: Vn } : { optimize: Fn, regExp: Vn },
      loopRequired: ($r = O.loopRequired) !== null && $r !== void 0 ? $r : v,
      loopEnum: (gr = O.loopEnum) !== null && gr !== void 0 ? gr : v,
      meta: (_r = O.meta) !== null && _r !== void 0 ? _r : !0,
      messages: (vr = O.messages) !== null && vr !== void 0 ? vr : !0,
      inlineRefs: (wr = O.inlineRefs) !== null && wr !== void 0 ? wr : !0,
      schemaId: (br = O.schemaId) !== null && br !== void 0 ? br : "$id",
      addUsedSchema: (Er = O.addUsedSchema) !== null && Er !== void 0 ? Er : !0,
      validateSchema: (Sr = O.validateSchema) !== null && Sr !== void 0 ? Sr : !0,
      validateFormats: (Pr = O.validateFormats) !== null && Pr !== void 0 ? Pr : !0,
      unicodeRegExp: (Rr = O.unicodeRegExp) !== null && Rr !== void 0 ? Rr : !0,
      int32range: (Or = O.int32range) !== null && Or !== void 0 ? Or : !0,
      uriResolver: ko
    };
  }
  class R {
    constructor(g = {}) {
      this.schemas = {}, this.refs = {}, this.formats = {}, this._compilations = /* @__PURE__ */ new Set(), this._loading = {}, this._cache = /* @__PURE__ */ new Map(), g = this.opts = { ...g, ...P(g) };
      const { es5: S, lines: b } = this.opts.code;
      this.scope = new i.ValueScope({ scope: {}, prefixes: $, es5: S, lines: b }), this.logger = B(g.logger);
      const u = g.validateFormats;
      g.validateFormats = !1, this.RULES = (0, a.getRules)(), N.call(this, y, g, "NOT SUPPORTED"), N.call(this, m, g, "DEPRECATED", "warn"), this._metaOpts = ne.call(this), g.formats && de.call(this), this._addVocabularies(), this._addDefaultMetaSchema(), g.keywords && Z.call(this, g.keywords), typeof g.meta == "object" && this.addMetaSchema(g.meta), L.call(this), g.validateFormats = u;
    }
    _addVocabularies() {
      this.addKeyword("$async");
    }
    _addDefaultMetaSchema() {
      const { $data: g, meta: S, schemaId: b } = this.opts;
      let u = f;
      b === "id" && (u = { ...f }, u.id = u.$id, delete u.$id), S && g && this.addMetaSchema(u, u[b], !1);
    }
    defaultMeta() {
      const { meta: g, schemaId: S } = this.opts;
      return this.opts.defaultMeta = typeof g == "object" ? g[S] || g : void 0;
    }
    validate(g, S) {
      let b;
      if (typeof g == "string") {
        if (b = this.getSchema(g), !b)
          throw new Error(`no schema with key or ref "${g}"`);
      } else
        b = this.compile(g);
      const u = b(S);
      return "$async" in b || (this.errors = b.errors), u;
    }
    compile(g, S) {
      const b = this._addSchema(g, S);
      return b.validate || this._compileSchemaEnv(b);
    }
    compileAsync(g, S) {
      if (typeof this.opts.loadSchema != "function")
        throw new Error("options.loadSchema should be a function");
      const { loadSchema: b } = this.opts;
      return u.call(this, g, S);
      async function u(K, pe) {
        await h.call(this, K.$schema);
        const rt = this._addSchema(K, pe);
        return rt.validate || E.call(this, rt);
      }
      async function h(K) {
        K && !this.getSchema(K) && await u.call(this, { $ref: K }, !0);
      }
      async function E(K) {
        try {
          return this._compileSchemaEnv(K);
        } catch (pe) {
          if (!(pe instanceof s.default))
            throw pe;
          return T.call(this, pe), await A.call(this, pe.missingSchema), E.call(this, K);
        }
      }
      function T({ missingSchema: K, missingRef: pe }) {
        if (this.refs[K])
          throw new Error(`AnySchema ${K} is loaded but ${pe} cannot be resolved`);
      }
      async function A(K) {
        const pe = await G.call(this, K);
        this.refs[K] || await h.call(this, pe.$schema), this.refs[K] || this.addSchema(pe, K, S);
      }
      async function G(K) {
        const pe = this._loading[K];
        if (pe)
          return pe;
        try {
          return await (this._loading[K] = b(K));
        } finally {
          delete this._loading[K];
        }
      }
    }
    // Adds schema to the instance
    addSchema(g, S, b, u = this.opts.validateSchema) {
      if (Array.isArray(g)) {
        for (const E of g)
          this.addSchema(E, void 0, b, u);
        return this;
      }
      let h;
      if (typeof g == "object") {
        const { schemaId: E } = this.opts;
        if (h = g[E], h !== void 0 && typeof h != "string")
          throw new Error(`schema ${E} must be string`);
      }
      return S = (0, c.normalizeId)(S || h), this._checkUnique(S), this.schemas[S] = this._addSchema(g, b, S, u, !0), this;
    }
    // Add schema that will be used to validate other schemas
    // options in META_IGNORE_OPTIONS are alway set to false
    addMetaSchema(g, S, b = this.opts.validateSchema) {
      return this.addSchema(g, S, !0, b), this;
    }
    //  Validate schema against its meta-schema
    validateSchema(g, S) {
      if (typeof g == "boolean")
        return !0;
      let b;
      if (b = g.$schema, b !== void 0 && typeof b != "string")
        throw new Error("$schema must be a string");
      if (b = b || this.opts.defaultMeta || this.defaultMeta(), !b)
        return this.logger.warn("meta-schema not available"), this.errors = null, !0;
      const u = this.validate(b, g);
      if (!u && S) {
        const h = "schema is invalid: " + this.errorsText();
        if (this.opts.validateSchema === "log")
          this.logger.error(h);
        else
          throw new Error(h);
      }
      return u;
    }
    // Get compiled schema by `key` or `ref`.
    // (`key` that was passed to `addSchema` or full schema reference - `schema.$id` or resolved id)
    getSchema(g) {
      let S;
      for (; typeof (S = D.call(this, g)) == "string"; )
        g = S;
      if (S === void 0) {
        const { schemaId: b } = this.opts, u = new o.SchemaEnv({ schema: {}, schemaId: b });
        if (S = o.resolveSchema.call(this, u, g), !S)
          return;
        this.refs[g] = S;
      }
      return S.validate || this._compileSchemaEnv(S);
    }
    // Remove cached schema(s).
    // If no parameter is passed all schemas but meta-schemas are removed.
    // If RegExp is passed all schemas with key/id matching pattern but meta-schemas are removed.
    // Even if schema is referenced by other schemas it still can be removed as other schemas have local references.
    removeSchema(g) {
      if (g instanceof RegExp)
        return this._removeAllSchemas(this.schemas, g), this._removeAllSchemas(this.refs, g), this;
      switch (typeof g) {
        case "undefined":
          return this._removeAllSchemas(this.schemas), this._removeAllSchemas(this.refs), this._cache.clear(), this;
        case "string": {
          const S = D.call(this, g);
          return typeof S == "object" && this._cache.delete(S.schema), delete this.schemas[g], delete this.refs[g], this;
        }
        case "object": {
          const S = g;
          this._cache.delete(S);
          let b = g[this.opts.schemaId];
          return b && (b = (0, c.normalizeId)(b), delete this.schemas[b], delete this.refs[b]), this;
        }
        default:
          throw new Error("ajv.removeSchema: invalid parameter");
      }
    }
    // add "vocabulary" - a collection of keywords
    addVocabulary(g) {
      for (const S of g)
        this.addKeyword(S);
      return this;
    }
    addKeyword(g, S) {
      let b;
      if (typeof g == "string")
        b = g, typeof S == "object" && (this.logger.warn("these parameters are deprecated, see docs for addKeyword"), S.keyword = b);
      else if (typeof g == "object" && S === void 0) {
        if (S = g, b = S.keyword, Array.isArray(b) && !b.length)
          throw new Error("addKeywords: keyword must be string or non-empty array");
      } else
        throw new Error("invalid addKeywords parameters");
      if (k.call(this, b, S), !S)
        return (0, l.eachItem)(b, (h) => C.call(this, h)), this;
      x.call(this, S);
      const u = {
        ...S,
        type: (0, d.getJSONTypes)(S.type),
        schemaType: (0, d.getJSONTypes)(S.schemaType)
      };
      return (0, l.eachItem)(b, u.type.length === 0 ? (h) => C.call(this, h, u) : (h) => u.type.forEach((E) => C.call(this, h, u, E))), this;
    }
    getKeyword(g) {
      const S = this.RULES.all[g];
      return typeof S == "object" ? S.definition : !!S;
    }
    // Remove keyword
    removeKeyword(g) {
      const { RULES: S } = this;
      delete S.keywords[g], delete S.all[g];
      for (const b of S.rules) {
        const u = b.rules.findIndex((h) => h.keyword === g);
        u >= 0 && b.rules.splice(u, 1);
      }
      return this;
    }
    // Add format
    addFormat(g, S) {
      return typeof S == "string" && (S = new RegExp(S)), this.formats[g] = S, this;
    }
    errorsText(g = this.errors, { separator: S = ", ", dataVar: b = "data" } = {}) {
      return !g || g.length === 0 ? "No errors" : g.map((u) => `${b}${u.instancePath} ${u.message}`).reduce((u, h) => u + S + h);
    }
    $dataMetaSchema(g, S) {
      const b = this.RULES.all;
      g = JSON.parse(JSON.stringify(g));
      for (const u of S) {
        const h = u.split("/").slice(1);
        let E = g;
        for (const T of h)
          E = E[T];
        for (const T in b) {
          const A = b[T];
          if (typeof A != "object")
            continue;
          const { $data: G } = A.definition, K = E[T];
          G && K && (E[T] = U(K));
        }
      }
      return g;
    }
    _removeAllSchemas(g, S) {
      for (const b in g) {
        const u = g[b];
        (!S || S.test(b)) && (typeof u == "string" ? delete g[b] : u && !u.meta && (this._cache.delete(u.schema), delete g[b]));
      }
    }
    _addSchema(g, S, b, u = this.opts.validateSchema, h = this.opts.addUsedSchema) {
      let E;
      const { schemaId: T } = this.opts;
      if (typeof g == "object")
        E = g[T];
      else {
        if (this.opts.jtd)
          throw new Error("schema must be object");
        if (typeof g != "boolean")
          throw new Error("schema must be object or boolean");
      }
      let A = this._cache.get(g);
      if (A !== void 0)
        return A;
      b = (0, c.normalizeId)(E || b);
      const G = c.getSchemaRefs.call(this, g, b);
      return A = new o.SchemaEnv({ schema: g, schemaId: T, meta: S, baseId: b, localRefs: G }), this._cache.set(A.schema, A), h && !b.startsWith("#") && (b && this._checkUnique(b), this.refs[b] = A), u && this.validateSchema(g, !0), A;
    }
    _checkUnique(g) {
      if (this.schemas[g] || this.refs[g])
        throw new Error(`schema with key or id "${g}" already exists`);
    }
    _compileSchemaEnv(g) {
      if (g.meta ? this._compileMetaSchema(g) : o.compileSchema.call(this, g), !g.validate)
        throw new Error("ajv implementation error");
      return g.validate;
    }
    _compileMetaSchema(g) {
      const S = this.opts;
      this.opts = this._metaOpts;
      try {
        o.compileSchema.call(this, g);
      } finally {
        this.opts = S;
      }
    }
  }
  R.ValidationError = n.default, R.MissingRefError = s.default, t.default = R;
  function N(O, g, S, b = "error") {
    for (const u in O) {
      const h = u;
      h in g && this.logger[b](`${S}: option ${u}. ${O[h]}`);
    }
  }
  function D(O) {
    return O = (0, c.normalizeId)(O), this.schemas[O] || this.refs[O];
  }
  function L() {
    const O = this.opts.schemas;
    if (O)
      if (Array.isArray(O))
        this.addSchema(O);
      else
        for (const g in O)
          this.addSchema(O[g], g);
  }
  function de() {
    for (const O in this.opts.formats) {
      const g = this.opts.formats[O];
      g && this.addFormat(O, g);
    }
  }
  function Z(O) {
    if (Array.isArray(O)) {
      this.addVocabulary(O);
      return;
    }
    this.logger.warn("keywords option as map is deprecated, pass array");
    for (const g in O) {
      const S = O[g];
      S.keyword || (S.keyword = g), this.addKeyword(S);
    }
  }
  function ne() {
    const O = { ...this.opts };
    for (const g of w)
      delete O[g];
    return O;
  }
  const M = { log() {
  }, warn() {
  }, error() {
  } };
  function B(O) {
    if (O === !1)
      return M;
    if (O === void 0)
      return console;
    if (O.log && O.warn && O.error)
      return O;
    throw new Error("logger must implement log, warn and error methods");
  }
  const me = /^[a-z_$][a-z0-9_$:-]*$/i;
  function k(O, g) {
    const { RULES: S } = this;
    if ((0, l.eachItem)(O, (b) => {
      if (S.keywords[b])
        throw new Error(`Keyword ${b} is already defined`);
      if (!me.test(b))
        throw new Error(`Keyword ${b} has invalid name`);
    }), !!g && g.$data && !("code" in g || "validate" in g))
      throw new Error('$data keyword must have "code" or "validate" function');
  }
  function C(O, g, S) {
    var b;
    const u = g == null ? void 0 : g.post;
    if (S && u)
      throw new Error('keyword with "post" flag cannot have "type"');
    const { RULES: h } = this;
    let E = u ? h.post : h.rules.find(({ type: A }) => A === S);
    if (E || (E = { type: S, rules: [] }, h.rules.push(E)), h.keywords[O] = !0, !g)
      return;
    const T = {
      keyword: O,
      definition: {
        ...g,
        type: (0, d.getJSONTypes)(g.type),
        schemaType: (0, d.getJSONTypes)(g.schemaType)
      }
    };
    g.before ? z.call(this, E, T, g.before) : E.rules.push(T), h.all[O] = T, (b = g.implements) === null || b === void 0 || b.forEach((A) => this.addKeyword(A));
  }
  function z(O, g, S) {
    const b = O.rules.findIndex((u) => u.keyword === S);
    b >= 0 ? O.rules.splice(b, 0, g) : (O.rules.push(g), this.logger.warn(`rule ${S} is not defined`));
  }
  function x(O) {
    let { metaSchema: g } = O;
    g !== void 0 && (O.$data && this.opts.$data && (g = U(g)), O.validateSchema = this.compile(g, !0));
  }
  const J = {
    $ref: "https://raw.githubusercontent.com/ajv-validator/ajv/master/lib/refs/data.json#"
  };
  function U(O) {
    return { anyOf: [O, J] };
  }
})(Fh);
var ll = {}, ul = {}, dl = {};
Object.defineProperty(dl, "__esModule", { value: !0 });
const GS = {
  keyword: "id",
  code() {
    throw new Error('NOT SUPPORTED: keyword "id", use "$id" for schema ID');
  }
};
dl.default = GS;
var Jr = {};
Object.defineProperty(Jr, "__esModule", { value: !0 });
Jr.callRef = Jr.getValidate = void 0;
const BS = An, pd = he, Ze = le, tn = Ft, yd = tt, Ks = V, HS = {
  keyword: "$ref",
  schemaType: "string",
  code(t) {
    const { gen: e, schema: r, it: n } = t, { baseId: s, schemaEnv: a, validateName: o, opts: i, self: c } = n, { root: d } = a;
    if ((r === "#" || r === "#/") && s === d.baseId)
      return f();
    const l = yd.resolveRef.call(c, d, s, r);
    if (l === void 0)
      throw new BS.default(n.opts.uriResolver, s, r);
    if (l instanceof yd.SchemaEnv)
      return _(l);
    return p(l);
    function f() {
      if (a === d)
        return ga(t, o, a, a.$async);
      const w = e.scopeValue("root", { ref: d });
      return ga(t, (0, Ze._)`${w}.validate`, d, d.$async);
    }
    function _(w) {
      const $ = $m(t, w);
      ga(t, $, w, w.$async);
    }
    function p(w) {
      const $ = e.scopeValue("schema", i.code.source === !0 ? { ref: w, code: (0, Ze.stringify)(w) } : { ref: w }), y = e.name("valid"), m = t.subschema({
        schema: w,
        dataTypes: [],
        schemaPath: Ze.nil,
        topSchemaRef: $,
        errSchemaPath: r
      }, y);
      t.mergeEvaluated(m), t.ok(y);
    }
  }
};
function $m(t, e) {
  const { gen: r } = t;
  return e.validate ? r.scopeValue("validate", { ref: e.validate }) : (0, Ze._)`${r.scopeValue("wrapper", { ref: e })}.validate`;
}
Jr.getValidate = $m;
function ga(t, e, r, n) {
  const { gen: s, it: a } = t, { allErrors: o, schemaEnv: i, opts: c } = a, d = c.passContext ? tn.default.this : Ze.nil;
  n ? l() : f();
  function l() {
    if (!i.$async)
      throw new Error("async schema referenced by sync schema");
    const w = s.let("valid");
    s.try(() => {
      s.code((0, Ze._)`await ${(0, pd.callValidateCode)(t, e, d)}`), p(e), o || s.assign(w, !0);
    }, ($) => {
      s.if((0, Ze._)`!(${$} instanceof ${a.ValidationError})`, () => s.throw($)), _($), o || s.assign(w, !1);
    }), t.ok(w);
  }
  function f() {
    t.result((0, pd.callValidateCode)(t, e, d), () => p(e), () => _(e));
  }
  function _(w) {
    const $ = (0, Ze._)`${w}.errors`;
    s.assign(tn.default.vErrors, (0, Ze._)`${tn.default.vErrors} === null ? ${$} : ${tn.default.vErrors}.concat(${$})`), s.assign(tn.default.errors, (0, Ze._)`${tn.default.vErrors}.length`);
  }
  function p(w) {
    var $;
    if (!a.opts.unevaluated)
      return;
    const y = ($ = r == null ? void 0 : r.validate) === null || $ === void 0 ? void 0 : $.evaluated;
    if (a.props !== !0)
      if (y && !y.dynamicProps)
        y.props !== void 0 && (a.props = Ks.mergeEvaluated.props(s, y.props, a.props));
      else {
        const m = s.var("props", (0, Ze._)`${w}.evaluated.props`);
        a.props = Ks.mergeEvaluated.props(s, m, a.props, Ze.Name);
      }
    if (a.items !== !0)
      if (y && !y.dynamicItems)
        y.items !== void 0 && (a.items = Ks.mergeEvaluated.items(s, y.items, a.items));
      else {
        const m = s.var("items", (0, Ze._)`${w}.evaluated.items`);
        a.items = Ks.mergeEvaluated.items(s, m, a.items, Ze.Name);
      }
  }
}
Jr.callRef = ga;
Jr.default = HS;
Object.defineProperty(ul, "__esModule", { value: !0 });
const WS = dl, JS = Jr, XS = [
  "$schema",
  "$id",
  "$defs",
  "$vocabulary",
  { keyword: "$comment" },
  "definitions",
  WS.default,
  JS.default
];
ul.default = XS;
var fl = {}, hl = {};
Object.defineProperty(hl, "__esModule", { value: !0 });
const Fa = le, rr = Fa.operators, Va = {
  maximum: { okStr: "<=", ok: rr.LTE, fail: rr.GT },
  minimum: { okStr: ">=", ok: rr.GTE, fail: rr.LT },
  exclusiveMaximum: { okStr: "<", ok: rr.LT, fail: rr.GTE },
  exclusiveMinimum: { okStr: ">", ok: rr.GT, fail: rr.LTE }
}, YS = {
  message: ({ keyword: t, schemaCode: e }) => (0, Fa.str)`must be ${Va[t].okStr} ${e}`,
  params: ({ keyword: t, schemaCode: e }) => (0, Fa._)`{comparison: ${Va[t].okStr}, limit: ${e}}`
}, QS = {
  keyword: Object.keys(Va),
  type: "number",
  schemaType: "number",
  $data: !0,
  error: YS,
  code(t) {
    const { keyword: e, data: r, schemaCode: n } = t;
    t.fail$data((0, Fa._)`${r} ${Va[e].fail} ${n} || isNaN(${r})`);
  }
};
hl.default = QS;
var ml = {};
Object.defineProperty(ml, "__esModule", { value: !0 });
const hs = le, ZS = {
  message: ({ schemaCode: t }) => (0, hs.str)`must be multiple of ${t}`,
  params: ({ schemaCode: t }) => (0, hs._)`{multipleOf: ${t}}`
}, e1 = {
  keyword: "multipleOf",
  type: "number",
  schemaType: "number",
  $data: !0,
  error: ZS,
  code(t) {
    const { gen: e, data: r, schemaCode: n, it: s } = t, a = s.opts.multipleOfPrecision, o = e.let("res"), i = a ? (0, hs._)`Math.abs(Math.round(${o}) - ${o}) > 1e-${a}` : (0, hs._)`${o} !== parseInt(${o})`;
    t.fail$data((0, hs._)`(${n} === 0 || (${o} = ${r}/${n}, ${i}))`);
  }
};
ml.default = e1;
var pl = {}, yl = {};
Object.defineProperty(yl, "__esModule", { value: !0 });
function gm(t) {
  const e = t.length;
  let r = 0, n = 0, s;
  for (; n < e; )
    r++, s = t.charCodeAt(n++), s >= 55296 && s <= 56319 && n < e && (s = t.charCodeAt(n), (s & 64512) === 56320 && n++);
  return r;
}
yl.default = gm;
gm.code = 'require("ajv/dist/runtime/ucs2length").default';
Object.defineProperty(pl, "__esModule", { value: !0 });
const Vr = le, t1 = V, r1 = yl, n1 = {
  message({ keyword: t, schemaCode: e }) {
    const r = t === "maxLength" ? "more" : "fewer";
    return (0, Vr.str)`must NOT have ${r} than ${e} characters`;
  },
  params: ({ schemaCode: t }) => (0, Vr._)`{limit: ${t}}`
}, s1 = {
  keyword: ["maxLength", "minLength"],
  type: "string",
  schemaType: "number",
  $data: !0,
  error: n1,
  code(t) {
    const { keyword: e, data: r, schemaCode: n, it: s } = t, a = e === "maxLength" ? Vr.operators.GT : Vr.operators.LT, o = s.opts.unicode === !1 ? (0, Vr._)`${r}.length` : (0, Vr._)`${(0, t1.useFunc)(t.gen, r1.default)}(${r})`;
    t.fail$data((0, Vr._)`${o} ${a} ${n}`);
  }
};
pl.default = s1;
var $l = {};
Object.defineProperty($l, "__esModule", { value: !0 });
const a1 = he, xa = le, o1 = {
  message: ({ schemaCode: t }) => (0, xa.str)`must match pattern "${t}"`,
  params: ({ schemaCode: t }) => (0, xa._)`{pattern: ${t}}`
}, i1 = {
  keyword: "pattern",
  type: "string",
  schemaType: "string",
  $data: !0,
  error: o1,
  code(t) {
    const { data: e, $data: r, schema: n, schemaCode: s, it: a } = t, o = a.opts.unicodeRegExp ? "u" : "", i = r ? (0, xa._)`(new RegExp(${s}, ${o}))` : (0, a1.usePattern)(t, n);
    t.fail$data((0, xa._)`!${i}.test(${e})`);
  }
};
$l.default = i1;
var gl = {};
Object.defineProperty(gl, "__esModule", { value: !0 });
const ms = le, c1 = {
  message({ keyword: t, schemaCode: e }) {
    const r = t === "maxProperties" ? "more" : "fewer";
    return (0, ms.str)`must NOT have ${r} than ${e} properties`;
  },
  params: ({ schemaCode: t }) => (0, ms._)`{limit: ${t}}`
}, l1 = {
  keyword: ["maxProperties", "minProperties"],
  type: "object",
  schemaType: "number",
  $data: !0,
  error: c1,
  code(t) {
    const { keyword: e, data: r, schemaCode: n } = t, s = e === "maxProperties" ? ms.operators.GT : ms.operators.LT;
    t.fail$data((0, ms._)`Object.keys(${r}).length ${s} ${n}`);
  }
};
gl.default = l1;
var _l = {};
Object.defineProperty(_l, "__esModule", { value: !0 });
const Gn = he, ps = le, u1 = V, d1 = {
  message: ({ params: { missingProperty: t } }) => (0, ps.str)`must have required property '${t}'`,
  params: ({ params: { missingProperty: t } }) => (0, ps._)`{missingProperty: ${t}}`
}, f1 = {
  keyword: "required",
  type: "object",
  schemaType: "array",
  $data: !0,
  error: d1,
  code(t) {
    const { gen: e, schema: r, schemaCode: n, data: s, $data: a, it: o } = t, { opts: i } = o;
    if (!a && r.length === 0)
      return;
    const c = r.length >= i.loopRequired;
    if (o.allErrors ? d() : l(), i.strictRequired) {
      const p = t.parentSchema.properties, { definedProperties: w } = t.it;
      for (const $ of r)
        if ((p == null ? void 0 : p[$]) === void 0 && !w.has($)) {
          const y = o.schemaEnv.baseId + o.errSchemaPath, m = `required property "${$}" is not defined at "${y}" (strictRequired)`;
          (0, u1.checkStrictMode)(o, m, o.opts.strictRequired);
        }
    }
    function d() {
      if (c || a)
        t.block$data(ps.nil, f);
      else
        for (const p of r)
          (0, Gn.checkReportMissingProp)(t, p);
    }
    function l() {
      const p = e.let("missing");
      if (c || a) {
        const w = e.let("valid", !0);
        t.block$data(w, () => _(p, w)), t.ok(w);
      } else
        e.if((0, Gn.checkMissingProp)(t, r, p)), (0, Gn.reportMissingProp)(t, p), e.else();
    }
    function f() {
      e.forOf("prop", n, (p) => {
        t.setParams({ missingProperty: p }), e.if((0, Gn.noPropertyInData)(e, s, p, i.ownProperties), () => t.error());
      });
    }
    function _(p, w) {
      t.setParams({ missingProperty: p }), e.forOf(p, n, () => {
        e.assign(w, (0, Gn.propertyInData)(e, s, p, i.ownProperties)), e.if((0, ps.not)(w), () => {
          t.error(), e.break();
        });
      }, ps.nil);
    }
  }
};
_l.default = f1;
var vl = {};
Object.defineProperty(vl, "__esModule", { value: !0 });
const ys = le, h1 = {
  message({ keyword: t, schemaCode: e }) {
    const r = t === "maxItems" ? "more" : "fewer";
    return (0, ys.str)`must NOT have ${r} than ${e} items`;
  },
  params: ({ schemaCode: t }) => (0, ys._)`{limit: ${t}}`
}, m1 = {
  keyword: ["maxItems", "minItems"],
  type: "array",
  schemaType: "number",
  $data: !0,
  error: h1,
  code(t) {
    const { keyword: e, data: r, schemaCode: n } = t, s = e === "maxItems" ? ys.operators.GT : ys.operators.LT;
    t.fail$data((0, ys._)`${r}.length ${s} ${n}`);
  }
};
vl.default = m1;
var wl = {}, Ns = {};
Object.defineProperty(Ns, "__esModule", { value: !0 });
const _m = no;
_m.code = 'require("ajv/dist/runtime/equal").default';
Ns.default = _m;
Object.defineProperty(wl, "__esModule", { value: !0 });
const Bo = Ie, je = le, p1 = V, y1 = Ns, $1 = {
  message: ({ params: { i: t, j: e } }) => (0, je.str)`must NOT have duplicate items (items ## ${e} and ${t} are identical)`,
  params: ({ params: { i: t, j: e } }) => (0, je._)`{i: ${t}, j: ${e}}`
}, g1 = {
  keyword: "uniqueItems",
  type: "array",
  schemaType: "boolean",
  $data: !0,
  error: $1,
  code(t) {
    const { gen: e, data: r, $data: n, schema: s, parentSchema: a, schemaCode: o, it: i } = t;
    if (!n && !s)
      return;
    const c = e.let("valid"), d = a.items ? (0, Bo.getSchemaTypes)(a.items) : [];
    t.block$data(c, l, (0, je._)`${o} === false`), t.ok(c);
    function l() {
      const w = e.let("i", (0, je._)`${r}.length`), $ = e.let("j");
      t.setParams({ i: w, j: $ }), e.assign(c, !0), e.if((0, je._)`${w} > 1`, () => (f() ? _ : p)(w, $));
    }
    function f() {
      return d.length > 0 && !d.some((w) => w === "object" || w === "array");
    }
    function _(w, $) {
      const y = e.name("item"), m = (0, Bo.checkDataTypes)(d, y, i.opts.strictNumbers, Bo.DataType.Wrong), v = e.const("indices", (0, je._)`{}`);
      e.for((0, je._)`;${w}--;`, () => {
        e.let(y, (0, je._)`${r}[${w}]`), e.if(m, (0, je._)`continue`), d.length > 1 && e.if((0, je._)`typeof ${y} == "string"`, (0, je._)`${y} += "_"`), e.if((0, je._)`typeof ${v}[${y}] == "number"`, () => {
          e.assign($, (0, je._)`${v}[${y}]`), t.error(), e.assign(c, !1).break();
        }).code((0, je._)`${v}[${y}] = ${w}`);
      });
    }
    function p(w, $) {
      const y = (0, p1.useFunc)(e, y1.default), m = e.name("outer");
      e.label(m).for((0, je._)`;${w}--;`, () => e.for((0, je._)`${$} = ${w}; ${$}--;`, () => e.if((0, je._)`${y}(${r}[${w}], ${r}[${$}])`, () => {
        t.error(), e.assign(c, !1).break(m);
      })));
    }
  }
};
wl.default = g1;
var bl = {};
Object.defineProperty(bl, "__esModule", { value: !0 });
const Ri = le, _1 = V, v1 = Ns, w1 = {
  message: "must be equal to constant",
  params: ({ schemaCode: t }) => (0, Ri._)`{allowedValue: ${t}}`
}, b1 = {
  keyword: "const",
  $data: !0,
  error: w1,
  code(t) {
    const { gen: e, data: r, $data: n, schemaCode: s, schema: a } = t;
    n || a && typeof a == "object" ? t.fail$data((0, Ri._)`!${(0, _1.useFunc)(e, v1.default)}(${r}, ${s})`) : t.fail((0, Ri._)`${a} !== ${r}`);
  }
};
bl.default = b1;
var El = {};
Object.defineProperty(El, "__esModule", { value: !0 });
const Xn = le, E1 = V, S1 = Ns, P1 = {
  message: "must be equal to one of the allowed values",
  params: ({ schemaCode: t }) => (0, Xn._)`{allowedValues: ${t}}`
}, R1 = {
  keyword: "enum",
  schemaType: "array",
  $data: !0,
  error: P1,
  code(t) {
    const { gen: e, data: r, $data: n, schema: s, schemaCode: a, it: o } = t;
    if (!n && s.length === 0)
      throw new Error("enum must have non-empty array");
    const i = s.length >= o.opts.loopEnum;
    let c;
    const d = () => c ?? (c = (0, E1.useFunc)(e, S1.default));
    let l;
    if (i || n)
      l = e.let("valid"), t.block$data(l, f);
    else {
      if (!Array.isArray(s))
        throw new Error("ajv implementation error");
      const p = e.const("vSchema", a);
      l = (0, Xn.or)(...s.map((w, $) => _(p, $)));
    }
    t.pass(l);
    function f() {
      e.assign(l, !1), e.forOf("v", a, (p) => e.if((0, Xn._)`${d()}(${r}, ${p})`, () => e.assign(l, !0).break()));
    }
    function _(p, w) {
      const $ = s[w];
      return typeof $ == "object" && $ !== null ? (0, Xn._)`${d()}(${r}, ${p}[${w}])` : (0, Xn._)`${r} === ${$}`;
    }
  }
};
El.default = R1;
Object.defineProperty(fl, "__esModule", { value: !0 });
const O1 = hl, I1 = ml, N1 = pl, T1 = $l, k1 = gl, A1 = _l, C1 = vl, j1 = wl, M1 = bl, D1 = El, L1 = [
  // number
  O1.default,
  I1.default,
  // string
  N1.default,
  T1.default,
  // object
  k1.default,
  A1.default,
  // array
  C1.default,
  j1.default,
  // any
  { keyword: "type", schemaType: ["string", "array"] },
  { keyword: "nullable", schemaType: "boolean" },
  M1.default,
  D1.default
];
fl.default = L1;
var Sl = {}, Cn = {};
Object.defineProperty(Cn, "__esModule", { value: !0 });
Cn.validateAdditionalItems = void 0;
const xr = le, Oi = V, F1 = {
  message: ({ params: { len: t } }) => (0, xr.str)`must NOT have more than ${t} items`,
  params: ({ params: { len: t } }) => (0, xr._)`{limit: ${t}}`
}, V1 = {
  keyword: "additionalItems",
  type: "array",
  schemaType: ["boolean", "object"],
  before: "uniqueItems",
  error: F1,
  code(t) {
    const { parentSchema: e, it: r } = t, { items: n } = e;
    if (!Array.isArray(n)) {
      (0, Oi.checkStrictMode)(r, '"additionalItems" is ignored when "items" is not an array of schemas');
      return;
    }
    vm(t, n);
  }
};
function vm(t, e) {
  const { gen: r, schema: n, data: s, keyword: a, it: o } = t;
  o.items = !0;
  const i = r.const("len", (0, xr._)`${s}.length`);
  if (n === !1)
    t.setParams({ len: e.length }), t.pass((0, xr._)`${i} <= ${e.length}`);
  else if (typeof n == "object" && !(0, Oi.alwaysValidSchema)(o, n)) {
    const d = r.var("valid", (0, xr._)`${i} <= ${e.length}`);
    r.if((0, xr.not)(d), () => c(d)), t.ok(d);
  }
  function c(d) {
    r.forRange("i", e.length, i, (l) => {
      t.subschema({ keyword: a, dataProp: l, dataPropType: Oi.Type.Num }, d), o.allErrors || r.if((0, xr.not)(d), () => r.break());
    });
  }
}
Cn.validateAdditionalItems = vm;
Cn.default = V1;
var Pl = {}, jn = {};
Object.defineProperty(jn, "__esModule", { value: !0 });
jn.validateTuple = void 0;
const $d = le, _a = V, x1 = he, U1 = {
  keyword: "items",
  type: "array",
  schemaType: ["object", "array", "boolean"],
  before: "uniqueItems",
  code(t) {
    const { schema: e, it: r } = t;
    if (Array.isArray(e))
      return wm(t, "additionalItems", e);
    r.items = !0, !(0, _a.alwaysValidSchema)(r, e) && t.ok((0, x1.validateArray)(t));
  }
};
function wm(t, e, r = t.schema) {
  const { gen: n, parentSchema: s, data: a, keyword: o, it: i } = t;
  l(s), i.opts.unevaluated && r.length && i.items !== !0 && (i.items = _a.mergeEvaluated.items(n, r.length, i.items));
  const c = n.name("valid"), d = n.const("len", (0, $d._)`${a}.length`);
  r.forEach((f, _) => {
    (0, _a.alwaysValidSchema)(i, f) || (n.if((0, $d._)`${d} > ${_}`, () => t.subschema({
      keyword: o,
      schemaProp: _,
      dataProp: _
    }, c)), t.ok(c));
  });
  function l(f) {
    const { opts: _, errSchemaPath: p } = i, w = r.length, $ = w === f.minItems && (w === f.maxItems || f[e] === !1);
    if (_.strictTuples && !$) {
      const y = `"${o}" is ${w}-tuple, but minItems or maxItems/${e} are not specified or different at path "${p}"`;
      (0, _a.checkStrictMode)(i, y, _.strictTuples);
    }
  }
}
jn.validateTuple = wm;
jn.default = U1;
Object.defineProperty(Pl, "__esModule", { value: !0 });
const q1 = jn, z1 = {
  keyword: "prefixItems",
  type: "array",
  schemaType: ["array"],
  before: "uniqueItems",
  code: (t) => (0, q1.validateTuple)(t, "items")
};
Pl.default = z1;
var Rl = {};
Object.defineProperty(Rl, "__esModule", { value: !0 });
const gd = le, K1 = V, G1 = he, B1 = Cn, H1 = {
  message: ({ params: { len: t } }) => (0, gd.str)`must NOT have more than ${t} items`,
  params: ({ params: { len: t } }) => (0, gd._)`{limit: ${t}}`
}, W1 = {
  keyword: "items",
  type: "array",
  schemaType: ["object", "boolean"],
  before: "uniqueItems",
  error: H1,
  code(t) {
    const { schema: e, parentSchema: r, it: n } = t, { prefixItems: s } = r;
    n.items = !0, !(0, K1.alwaysValidSchema)(n, e) && (s ? (0, B1.validateAdditionalItems)(t, s) : t.ok((0, G1.validateArray)(t)));
  }
};
Rl.default = W1;
var Ol = {};
Object.defineProperty(Ol, "__esModule", { value: !0 });
const dt = le, Gs = V, J1 = {
  message: ({ params: { min: t, max: e } }) => e === void 0 ? (0, dt.str)`must contain at least ${t} valid item(s)` : (0, dt.str)`must contain at least ${t} and no more than ${e} valid item(s)`,
  params: ({ params: { min: t, max: e } }) => e === void 0 ? (0, dt._)`{minContains: ${t}}` : (0, dt._)`{minContains: ${t}, maxContains: ${e}}`
}, X1 = {
  keyword: "contains",
  type: "array",
  schemaType: ["object", "boolean"],
  before: "uniqueItems",
  trackErrors: !0,
  error: J1,
  code(t) {
    const { gen: e, schema: r, parentSchema: n, data: s, it: a } = t;
    let o, i;
    const { minContains: c, maxContains: d } = n;
    a.opts.next ? (o = c === void 0 ? 1 : c, i = d) : o = 1;
    const l = e.const("len", (0, dt._)`${s}.length`);
    if (t.setParams({ min: o, max: i }), i === void 0 && o === 0) {
      (0, Gs.checkStrictMode)(a, '"minContains" == 0 without "maxContains": "contains" keyword ignored');
      return;
    }
    if (i !== void 0 && o > i) {
      (0, Gs.checkStrictMode)(a, '"minContains" > "maxContains" is always invalid'), t.fail();
      return;
    }
    if ((0, Gs.alwaysValidSchema)(a, r)) {
      let $ = (0, dt._)`${l} >= ${o}`;
      i !== void 0 && ($ = (0, dt._)`${$} && ${l} <= ${i}`), t.pass($);
      return;
    }
    a.items = !0;
    const f = e.name("valid");
    i === void 0 && o === 1 ? p(f, () => e.if(f, () => e.break())) : o === 0 ? (e.let(f, !0), i !== void 0 && e.if((0, dt._)`${s}.length > 0`, _)) : (e.let(f, !1), _()), t.result(f, () => t.reset());
    function _() {
      const $ = e.name("_valid"), y = e.let("count", 0);
      p($, () => e.if($, () => w(y)));
    }
    function p($, y) {
      e.forRange("i", 0, l, (m) => {
        t.subschema({
          keyword: "contains",
          dataProp: m,
          dataPropType: Gs.Type.Num,
          compositeRule: !0
        }, $), y();
      });
    }
    function w($) {
      e.code((0, dt._)`${$}++`), i === void 0 ? e.if((0, dt._)`${$} >= ${o}`, () => e.assign(f, !0).break()) : (e.if((0, dt._)`${$} > ${i}`, () => e.assign(f, !1).break()), o === 1 ? e.assign(f, !0) : e.if((0, dt._)`${$} >= ${o}`, () => e.assign(f, !0)));
    }
  }
};
Ol.default = X1;
var bm = {};
(function(t) {
  Object.defineProperty(t, "__esModule", { value: !0 }), t.validateSchemaDeps = t.validatePropertyDeps = t.error = void 0;
  const e = le, r = V, n = he;
  t.error = {
    message: ({ params: { property: c, depsCount: d, deps: l } }) => {
      const f = d === 1 ? "property" : "properties";
      return (0, e.str)`must have ${f} ${l} when property ${c} is present`;
    },
    params: ({ params: { property: c, depsCount: d, deps: l, missingProperty: f } }) => (0, e._)`{property: ${c},
    missingProperty: ${f},
    depsCount: ${d},
    deps: ${l}}`
    // TODO change to reference
  };
  const s = {
    keyword: "dependencies",
    type: "object",
    schemaType: "object",
    error: t.error,
    code(c) {
      const [d, l] = a(c);
      o(c, d), i(c, l);
    }
  };
  function a({ schema: c }) {
    const d = {}, l = {};
    for (const f in c) {
      if (f === "__proto__")
        continue;
      const _ = Array.isArray(c[f]) ? d : l;
      _[f] = c[f];
    }
    return [d, l];
  }
  function o(c, d = c.schema) {
    const { gen: l, data: f, it: _ } = c;
    if (Object.keys(d).length === 0)
      return;
    const p = l.let("missing");
    for (const w in d) {
      const $ = d[w];
      if ($.length === 0)
        continue;
      const y = (0, n.propertyInData)(l, f, w, _.opts.ownProperties);
      c.setParams({
        property: w,
        depsCount: $.length,
        deps: $.join(", ")
      }), _.allErrors ? l.if(y, () => {
        for (const m of $)
          (0, n.checkReportMissingProp)(c, m);
      }) : (l.if((0, e._)`${y} && (${(0, n.checkMissingProp)(c, $, p)})`), (0, n.reportMissingProp)(c, p), l.else());
    }
  }
  t.validatePropertyDeps = o;
  function i(c, d = c.schema) {
    const { gen: l, data: f, keyword: _, it: p } = c, w = l.name("valid");
    for (const $ in d)
      (0, r.alwaysValidSchema)(p, d[$]) || (l.if(
        (0, n.propertyInData)(l, f, $, p.opts.ownProperties),
        () => {
          const y = c.subschema({ keyword: _, schemaProp: $ }, w);
          c.mergeValidEvaluated(y, w);
        },
        () => l.var(w, !0)
        // TODO var
      ), c.ok(w));
  }
  t.validateSchemaDeps = i, t.default = s;
})(bm);
var Il = {};
Object.defineProperty(Il, "__esModule", { value: !0 });
const Em = le, Y1 = V, Q1 = {
  message: "property name must be valid",
  params: ({ params: t }) => (0, Em._)`{propertyName: ${t.propertyName}}`
}, Z1 = {
  keyword: "propertyNames",
  type: "object",
  schemaType: ["object", "boolean"],
  error: Q1,
  code(t) {
    const { gen: e, schema: r, data: n, it: s } = t;
    if ((0, Y1.alwaysValidSchema)(s, r))
      return;
    const a = e.name("valid");
    e.forIn("key", n, (o) => {
      t.setParams({ propertyName: o }), t.subschema({
        keyword: "propertyNames",
        data: o,
        dataTypes: ["string"],
        propertyName: o,
        compositeRule: !0
      }, a), e.if((0, Em.not)(a), () => {
        t.error(!0), s.allErrors || e.break();
      });
    }), t.ok(a);
  }
};
Il.default = Z1;
var mo = {};
Object.defineProperty(mo, "__esModule", { value: !0 });
const Bs = he, gt = le, eP = Ft, Hs = V, tP = {
  message: "must NOT have additional properties",
  params: ({ params: t }) => (0, gt._)`{additionalProperty: ${t.additionalProperty}}`
}, rP = {
  keyword: "additionalProperties",
  type: ["object"],
  schemaType: ["boolean", "object"],
  allowUndefined: !0,
  trackErrors: !0,
  error: tP,
  code(t) {
    const { gen: e, schema: r, parentSchema: n, data: s, errsCount: a, it: o } = t;
    if (!a)
      throw new Error("ajv implementation error");
    const { allErrors: i, opts: c } = o;
    if (o.props = !0, c.removeAdditional !== "all" && (0, Hs.alwaysValidSchema)(o, r))
      return;
    const d = (0, Bs.allSchemaProperties)(n.properties), l = (0, Bs.allSchemaProperties)(n.patternProperties);
    f(), t.ok((0, gt._)`${a} === ${eP.default.errors}`);
    function f() {
      e.forIn("key", s, (y) => {
        !d.length && !l.length ? w(y) : e.if(_(y), () => w(y));
      });
    }
    function _(y) {
      let m;
      if (d.length > 8) {
        const v = (0, Hs.schemaRefOrVal)(o, n.properties, "properties");
        m = (0, Bs.isOwnProperty)(e, v, y);
      } else d.length ? m = (0, gt.or)(...d.map((v) => (0, gt._)`${y} === ${v}`)) : m = gt.nil;
      return l.length && (m = (0, gt.or)(m, ...l.map((v) => (0, gt._)`${(0, Bs.usePattern)(t, v)}.test(${y})`))), (0, gt.not)(m);
    }
    function p(y) {
      e.code((0, gt._)`delete ${s}[${y}]`);
    }
    function w(y) {
      if (c.removeAdditional === "all" || c.removeAdditional && r === !1) {
        p(y);
        return;
      }
      if (r === !1) {
        t.setParams({ additionalProperty: y }), t.error(), i || e.break();
        return;
      }
      if (typeof r == "object" && !(0, Hs.alwaysValidSchema)(o, r)) {
        const m = e.name("valid");
        c.removeAdditional === "failing" ? ($(y, m, !1), e.if((0, gt.not)(m), () => {
          t.reset(), p(y);
        })) : ($(y, m), i || e.if((0, gt.not)(m), () => e.break()));
      }
    }
    function $(y, m, v) {
      const P = {
        keyword: "additionalProperties",
        dataProp: y,
        dataPropType: Hs.Type.Str
      };
      v === !1 && Object.assign(P, {
        compositeRule: !0,
        createErrors: !1,
        allErrors: !1
      }), t.subschema(P, m);
    }
  }
};
mo.default = rP;
var Nl = {};
Object.defineProperty(Nl, "__esModule", { value: !0 });
const nP = St, _d = he, Ho = V, vd = mo, sP = {
  keyword: "properties",
  type: "object",
  schemaType: "object",
  code(t) {
    const { gen: e, schema: r, parentSchema: n, data: s, it: a } = t;
    a.opts.removeAdditional === "all" && n.additionalProperties === void 0 && vd.default.code(new nP.KeywordCxt(a, vd.default, "additionalProperties"));
    const o = (0, _d.allSchemaProperties)(r);
    for (const f of o)
      a.definedProperties.add(f);
    a.opts.unevaluated && o.length && a.props !== !0 && (a.props = Ho.mergeEvaluated.props(e, (0, Ho.toHash)(o), a.props));
    const i = o.filter((f) => !(0, Ho.alwaysValidSchema)(a, r[f]));
    if (i.length === 0)
      return;
    const c = e.name("valid");
    for (const f of i)
      d(f) ? l(f) : (e.if((0, _d.propertyInData)(e, s, f, a.opts.ownProperties)), l(f), a.allErrors || e.else().var(c, !0), e.endIf()), t.it.definedProperties.add(f), t.ok(c);
    function d(f) {
      return a.opts.useDefaults && !a.compositeRule && r[f].default !== void 0;
    }
    function l(f) {
      t.subschema({
        keyword: "properties",
        schemaProp: f,
        dataProp: f
      }, c);
    }
  }
};
Nl.default = sP;
var Tl = {};
Object.defineProperty(Tl, "__esModule", { value: !0 });
const wd = he, Ws = le, bd = V, Ed = V, aP = {
  keyword: "patternProperties",
  type: "object",
  schemaType: "object",
  code(t) {
    const { gen: e, schema: r, data: n, parentSchema: s, it: a } = t, { opts: o } = a, i = (0, wd.allSchemaProperties)(r), c = i.filter(($) => (0, bd.alwaysValidSchema)(a, r[$]));
    if (i.length === 0 || c.length === i.length && (!a.opts.unevaluated || a.props === !0))
      return;
    const d = o.strictSchema && !o.allowMatchingProperties && s.properties, l = e.name("valid");
    a.props !== !0 && !(a.props instanceof Ws.Name) && (a.props = (0, Ed.evaluatedPropsToName)(e, a.props));
    const { props: f } = a;
    _();
    function _() {
      for (const $ of i)
        d && p($), a.allErrors ? w($) : (e.var(l, !0), w($), e.if(l));
    }
    function p($) {
      for (const y in d)
        new RegExp($).test(y) && (0, bd.checkStrictMode)(a, `property ${y} matches pattern ${$} (use allowMatchingProperties)`);
    }
    function w($) {
      e.forIn("key", n, (y) => {
        e.if((0, Ws._)`${(0, wd.usePattern)(t, $)}.test(${y})`, () => {
          const m = c.includes($);
          m || t.subschema({
            keyword: "patternProperties",
            schemaProp: $,
            dataProp: y,
            dataPropType: Ed.Type.Str
          }, l), a.opts.unevaluated && f !== !0 ? e.assign((0, Ws._)`${f}[${y}]`, !0) : !m && !a.allErrors && e.if((0, Ws.not)(l), () => e.break());
        });
      });
    }
  }
};
Tl.default = aP;
var kl = {};
Object.defineProperty(kl, "__esModule", { value: !0 });
const oP = V, iP = {
  keyword: "not",
  schemaType: ["object", "boolean"],
  trackErrors: !0,
  code(t) {
    const { gen: e, schema: r, it: n } = t;
    if ((0, oP.alwaysValidSchema)(n, r)) {
      t.fail();
      return;
    }
    const s = e.name("valid");
    t.subschema({
      keyword: "not",
      compositeRule: !0,
      createErrors: !1,
      allErrors: !1
    }, s), t.failResult(s, () => t.reset(), () => t.error());
  },
  error: { message: "must NOT be valid" }
};
kl.default = iP;
var Al = {};
Object.defineProperty(Al, "__esModule", { value: !0 });
const cP = he, lP = {
  keyword: "anyOf",
  schemaType: "array",
  trackErrors: !0,
  code: cP.validateUnion,
  error: { message: "must match a schema in anyOf" }
};
Al.default = lP;
var Cl = {};
Object.defineProperty(Cl, "__esModule", { value: !0 });
const va = le, uP = V, dP = {
  message: "must match exactly one schema in oneOf",
  params: ({ params: t }) => (0, va._)`{passingSchemas: ${t.passing}}`
}, fP = {
  keyword: "oneOf",
  schemaType: "array",
  trackErrors: !0,
  error: dP,
  code(t) {
    const { gen: e, schema: r, parentSchema: n, it: s } = t;
    if (!Array.isArray(r))
      throw new Error("ajv implementation error");
    if (s.opts.discriminator && n.discriminator)
      return;
    const a = r, o = e.let("valid", !1), i = e.let("passing", null), c = e.name("_valid");
    t.setParams({ passing: i }), e.block(d), t.result(o, () => t.reset(), () => t.error(!0));
    function d() {
      a.forEach((l, f) => {
        let _;
        (0, uP.alwaysValidSchema)(s, l) ? e.var(c, !0) : _ = t.subschema({
          keyword: "oneOf",
          schemaProp: f,
          compositeRule: !0
        }, c), f > 0 && e.if((0, va._)`${c} && ${o}`).assign(o, !1).assign(i, (0, va._)`[${i}, ${f}]`).else(), e.if(c, () => {
          e.assign(o, !0), e.assign(i, f), _ && t.mergeEvaluated(_, va.Name);
        });
      });
    }
  }
};
Cl.default = fP;
var jl = {};
Object.defineProperty(jl, "__esModule", { value: !0 });
const hP = V, mP = {
  keyword: "allOf",
  schemaType: "array",
  code(t) {
    const { gen: e, schema: r, it: n } = t;
    if (!Array.isArray(r))
      throw new Error("ajv implementation error");
    const s = e.name("valid");
    r.forEach((a, o) => {
      if ((0, hP.alwaysValidSchema)(n, a))
        return;
      const i = t.subschema({ keyword: "allOf", schemaProp: o }, s);
      t.ok(s), t.mergeEvaluated(i);
    });
  }
};
jl.default = mP;
var Ml = {};
Object.defineProperty(Ml, "__esModule", { value: !0 });
const Ua = le, Sm = V, pP = {
  message: ({ params: t }) => (0, Ua.str)`must match "${t.ifClause}" schema`,
  params: ({ params: t }) => (0, Ua._)`{failingKeyword: ${t.ifClause}}`
}, yP = {
  keyword: "if",
  schemaType: ["object", "boolean"],
  trackErrors: !0,
  error: pP,
  code(t) {
    const { gen: e, parentSchema: r, it: n } = t;
    r.then === void 0 && r.else === void 0 && (0, Sm.checkStrictMode)(n, '"if" without "then" and "else" is ignored');
    const s = Sd(n, "then"), a = Sd(n, "else");
    if (!s && !a)
      return;
    const o = e.let("valid", !0), i = e.name("_valid");
    if (c(), t.reset(), s && a) {
      const l = e.let("ifClause");
      t.setParams({ ifClause: l }), e.if(i, d("then", l), d("else", l));
    } else s ? e.if(i, d("then")) : e.if((0, Ua.not)(i), d("else"));
    t.pass(o, () => t.error(!0));
    function c() {
      const l = t.subschema({
        keyword: "if",
        compositeRule: !0,
        createErrors: !1,
        allErrors: !1
      }, i);
      t.mergeEvaluated(l);
    }
    function d(l, f) {
      return () => {
        const _ = t.subschema({ keyword: l }, i);
        e.assign(o, i), t.mergeValidEvaluated(_, o), f ? e.assign(f, (0, Ua._)`${l}`) : t.setParams({ ifClause: l });
      };
    }
  }
};
function Sd(t, e) {
  const r = t.schema[e];
  return r !== void 0 && !(0, Sm.alwaysValidSchema)(t, r);
}
Ml.default = yP;
var Dl = {};
Object.defineProperty(Dl, "__esModule", { value: !0 });
const $P = V, gP = {
  keyword: ["then", "else"],
  schemaType: ["object", "boolean"],
  code({ keyword: t, parentSchema: e, it: r }) {
    e.if === void 0 && (0, $P.checkStrictMode)(r, `"${t}" without "if" is ignored`);
  }
};
Dl.default = gP;
Object.defineProperty(Sl, "__esModule", { value: !0 });
const _P = Cn, vP = Pl, wP = jn, bP = Rl, EP = Ol, SP = bm, PP = Il, RP = mo, OP = Nl, IP = Tl, NP = kl, TP = Al, kP = Cl, AP = jl, CP = Ml, jP = Dl;
function MP(t = !1) {
  const e = [
    // any
    NP.default,
    TP.default,
    kP.default,
    AP.default,
    CP.default,
    jP.default,
    // object
    PP.default,
    RP.default,
    SP.default,
    OP.default,
    IP.default
  ];
  return t ? e.push(vP.default, bP.default) : e.push(_P.default, wP.default), e.push(EP.default), e;
}
Sl.default = MP;
var Ll = {}, Fl = {};
Object.defineProperty(Fl, "__esModule", { value: !0 });
const Ee = le, DP = {
  message: ({ schemaCode: t }) => (0, Ee.str)`must match format "${t}"`,
  params: ({ schemaCode: t }) => (0, Ee._)`{format: ${t}}`
}, LP = {
  keyword: "format",
  type: ["number", "string"],
  schemaType: "string",
  $data: !0,
  error: DP,
  code(t, e) {
    const { gen: r, data: n, $data: s, schema: a, schemaCode: o, it: i } = t, { opts: c, errSchemaPath: d, schemaEnv: l, self: f } = i;
    if (!c.validateFormats)
      return;
    s ? _() : p();
    function _() {
      const w = r.scopeValue("formats", {
        ref: f.formats,
        code: c.code.formats
      }), $ = r.const("fDef", (0, Ee._)`${w}[${o}]`), y = r.let("fType"), m = r.let("format");
      r.if((0, Ee._)`typeof ${$} == "object" && !(${$} instanceof RegExp)`, () => r.assign(y, (0, Ee._)`${$}.type || "string"`).assign(m, (0, Ee._)`${$}.validate`), () => r.assign(y, (0, Ee._)`"string"`).assign(m, $)), t.fail$data((0, Ee.or)(v(), P()));
      function v() {
        return c.strictSchema === !1 ? Ee.nil : (0, Ee._)`${o} && !${m}`;
      }
      function P() {
        const R = l.$async ? (0, Ee._)`(${$}.async ? await ${m}(${n}) : ${m}(${n}))` : (0, Ee._)`${m}(${n})`, N = (0, Ee._)`(typeof ${m} == "function" ? ${R} : ${m}.test(${n}))`;
        return (0, Ee._)`${m} && ${m} !== true && ${y} === ${e} && !${N}`;
      }
    }
    function p() {
      const w = f.formats[a];
      if (!w) {
        v();
        return;
      }
      if (w === !0)
        return;
      const [$, y, m] = P(w);
      $ === e && t.pass(R());
      function v() {
        if (c.strictSchema === !1) {
          f.logger.warn(N());
          return;
        }
        throw new Error(N());
        function N() {
          return `unknown format "${a}" ignored in schema at path "${d}"`;
        }
      }
      function P(N) {
        const D = N instanceof RegExp ? (0, Ee.regexpCode)(N) : c.code.formats ? (0, Ee._)`${c.code.formats}${(0, Ee.getProperty)(a)}` : void 0, L = r.scopeValue("formats", { key: a, ref: N, code: D });
        return typeof N == "object" && !(N instanceof RegExp) ? [N.type || "string", N.validate, (0, Ee._)`${L}.validate`] : ["string", N, L];
      }
      function R() {
        if (typeof w == "object" && !(w instanceof RegExp) && w.async) {
          if (!l.$async)
            throw new Error("async format in sync schema");
          return (0, Ee._)`await ${m}(${n})`;
        }
        return typeof y == "function" ? (0, Ee._)`${m}(${n})` : (0, Ee._)`${m}.test(${n})`;
      }
    }
  }
};
Fl.default = LP;
Object.defineProperty(Ll, "__esModule", { value: !0 });
const FP = Fl, VP = [FP.default];
Ll.default = VP;
var Pn = {};
Object.defineProperty(Pn, "__esModule", { value: !0 });
Pn.contentVocabulary = Pn.metadataVocabulary = void 0;
Pn.metadataVocabulary = [
  "title",
  "description",
  "default",
  "deprecated",
  "readOnly",
  "writeOnly",
  "examples"
];
Pn.contentVocabulary = [
  "contentMediaType",
  "contentEncoding",
  "contentSchema"
];
Object.defineProperty(ll, "__esModule", { value: !0 });
const xP = ul, UP = fl, qP = Sl, zP = Ll, Pd = Pn, KP = [
  xP.default,
  UP.default,
  (0, qP.default)(),
  zP.default,
  Pd.metadataVocabulary,
  Pd.contentVocabulary
];
ll.default = KP;
var Vl = {}, po = {};
Object.defineProperty(po, "__esModule", { value: !0 });
po.DiscrError = void 0;
var Rd;
(function(t) {
  t.Tag = "tag", t.Mapping = "mapping";
})(Rd || (po.DiscrError = Rd = {}));
Object.defineProperty(Vl, "__esModule", { value: !0 });
const ln = le, Ii = po, Od = tt, GP = An, BP = V, HP = {
  message: ({ params: { discrError: t, tagName: e } }) => t === Ii.DiscrError.Tag ? `tag "${e}" must be string` : `value of tag "${e}" must be in oneOf`,
  params: ({ params: { discrError: t, tag: e, tagName: r } }) => (0, ln._)`{error: ${t}, tag: ${r}, tagValue: ${e}}`
}, WP = {
  keyword: "discriminator",
  type: "object",
  schemaType: "object",
  error: HP,
  code(t) {
    const { gen: e, data: r, schema: n, parentSchema: s, it: a } = t, { oneOf: o } = s;
    if (!a.opts.discriminator)
      throw new Error("discriminator: requires discriminator option");
    const i = n.propertyName;
    if (typeof i != "string")
      throw new Error("discriminator: requires propertyName");
    if (n.mapping)
      throw new Error("discriminator: mapping is not supported");
    if (!o)
      throw new Error("discriminator: requires oneOf keyword");
    const c = e.let("valid", !1), d = e.const("tag", (0, ln._)`${r}${(0, ln.getProperty)(i)}`);
    e.if((0, ln._)`typeof ${d} == "string"`, () => l(), () => t.error(!1, { discrError: Ii.DiscrError.Tag, tag: d, tagName: i })), t.ok(c);
    function l() {
      const p = _();
      e.if(!1);
      for (const w in p)
        e.elseIf((0, ln._)`${d} === ${w}`), e.assign(c, f(p[w]));
      e.else(), t.error(!1, { discrError: Ii.DiscrError.Mapping, tag: d, tagName: i }), e.endIf();
    }
    function f(p) {
      const w = e.name("valid"), $ = t.subschema({ keyword: "oneOf", schemaProp: p }, w);
      return t.mergeEvaluated($, ln.Name), w;
    }
    function _() {
      var p;
      const w = {}, $ = m(s);
      let y = !0;
      for (let R = 0; R < o.length; R++) {
        let N = o[R];
        if (N != null && N.$ref && !(0, BP.schemaHasRulesButRef)(N, a.self.RULES)) {
          const L = N.$ref;
          if (N = Od.resolveRef.call(a.self, a.schemaEnv.root, a.baseId, L), N instanceof Od.SchemaEnv && (N = N.schema), N === void 0)
            throw new GP.default(a.opts.uriResolver, a.baseId, L);
        }
        const D = (p = N == null ? void 0 : N.properties) === null || p === void 0 ? void 0 : p[i];
        if (typeof D != "object")
          throw new Error(`discriminator: oneOf subschemas (or referenced schemas) must have "properties/${i}"`);
        y = y && ($ || m(N)), v(D, R);
      }
      if (!y)
        throw new Error(`discriminator: "${i}" must be required`);
      return w;
      function m({ required: R }) {
        return Array.isArray(R) && R.includes(i);
      }
      function v(R, N) {
        if (R.const)
          P(R.const, N);
        else if (R.enum)
          for (const D of R.enum)
            P(D, N);
        else
          throw new Error(`discriminator: "properties/${i}" must have "const" or "enum"`);
      }
      function P(R, N) {
        if (typeof R != "string" || R in w)
          throw new Error(`discriminator: "${i}" values must be unique strings`);
        w[R] = N;
      }
    }
  }
};
Vl.default = WP;
const JP = "http://json-schema.org/draft-07/schema#", XP = "http://json-schema.org/draft-07/schema#", YP = "Core schema meta-schema", QP = {
  schemaArray: {
    type: "array",
    minItems: 1,
    items: {
      $ref: "#"
    }
  },
  nonNegativeInteger: {
    type: "integer",
    minimum: 0
  },
  nonNegativeIntegerDefault0: {
    allOf: [
      {
        $ref: "#/definitions/nonNegativeInteger"
      },
      {
        default: 0
      }
    ]
  },
  simpleTypes: {
    enum: [
      "array",
      "boolean",
      "integer",
      "null",
      "number",
      "object",
      "string"
    ]
  },
  stringArray: {
    type: "array",
    items: {
      type: "string"
    },
    uniqueItems: !0,
    default: []
  }
}, ZP = [
  "object",
  "boolean"
], eR = {
  $id: {
    type: "string",
    format: "uri-reference"
  },
  $schema: {
    type: "string",
    format: "uri"
  },
  $ref: {
    type: "string",
    format: "uri-reference"
  },
  $comment: {
    type: "string"
  },
  title: {
    type: "string"
  },
  description: {
    type: "string"
  },
  default: !0,
  readOnly: {
    type: "boolean",
    default: !1
  },
  examples: {
    type: "array",
    items: !0
  },
  multipleOf: {
    type: "number",
    exclusiveMinimum: 0
  },
  maximum: {
    type: "number"
  },
  exclusiveMaximum: {
    type: "number"
  },
  minimum: {
    type: "number"
  },
  exclusiveMinimum: {
    type: "number"
  },
  maxLength: {
    $ref: "#/definitions/nonNegativeInteger"
  },
  minLength: {
    $ref: "#/definitions/nonNegativeIntegerDefault0"
  },
  pattern: {
    type: "string",
    format: "regex"
  },
  additionalItems: {
    $ref: "#"
  },
  items: {
    anyOf: [
      {
        $ref: "#"
      },
      {
        $ref: "#/definitions/schemaArray"
      }
    ],
    default: !0
  },
  maxItems: {
    $ref: "#/definitions/nonNegativeInteger"
  },
  minItems: {
    $ref: "#/definitions/nonNegativeIntegerDefault0"
  },
  uniqueItems: {
    type: "boolean",
    default: !1
  },
  contains: {
    $ref: "#"
  },
  maxProperties: {
    $ref: "#/definitions/nonNegativeInteger"
  },
  minProperties: {
    $ref: "#/definitions/nonNegativeIntegerDefault0"
  },
  required: {
    $ref: "#/definitions/stringArray"
  },
  additionalProperties: {
    $ref: "#"
  },
  definitions: {
    type: "object",
    additionalProperties: {
      $ref: "#"
    },
    default: {}
  },
  properties: {
    type: "object",
    additionalProperties: {
      $ref: "#"
    },
    default: {}
  },
  patternProperties: {
    type: "object",
    additionalProperties: {
      $ref: "#"
    },
    propertyNames: {
      format: "regex"
    },
    default: {}
  },
  dependencies: {
    type: "object",
    additionalProperties: {
      anyOf: [
        {
          $ref: "#"
        },
        {
          $ref: "#/definitions/stringArray"
        }
      ]
    }
  },
  propertyNames: {
    $ref: "#"
  },
  const: !0,
  enum: {
    type: "array",
    items: !0,
    minItems: 1,
    uniqueItems: !0
  },
  type: {
    anyOf: [
      {
        $ref: "#/definitions/simpleTypes"
      },
      {
        type: "array",
        items: {
          $ref: "#/definitions/simpleTypes"
        },
        minItems: 1,
        uniqueItems: !0
      }
    ]
  },
  format: {
    type: "string"
  },
  contentMediaType: {
    type: "string"
  },
  contentEncoding: {
    type: "string"
  },
  if: {
    $ref: "#"
  },
  then: {
    $ref: "#"
  },
  else: {
    $ref: "#"
  },
  allOf: {
    $ref: "#/definitions/schemaArray"
  },
  anyOf: {
    $ref: "#/definitions/schemaArray"
  },
  oneOf: {
    $ref: "#/definitions/schemaArray"
  },
  not: {
    $ref: "#"
  }
}, tR = {
  $schema: JP,
  $id: XP,
  title: YP,
  definitions: QP,
  type: ZP,
  properties: eR,
  default: !0
};
(function(t, e) {
  Object.defineProperty(e, "__esModule", { value: !0 }), e.MissingRefError = e.ValidationError = e.CodeGen = e.Name = e.nil = e.stringify = e.str = e._ = e.KeywordCxt = e.Ajv = void 0;
  const r = Fh, n = ll, s = Vl, a = tR, o = ["/properties"], i = "http://json-schema.org/draft-07/schema";
  class c extends r.default {
    _addVocabularies() {
      super._addVocabularies(), n.default.forEach((w) => this.addVocabulary(w)), this.opts.discriminator && this.addKeyword(s.default);
    }
    _addDefaultMetaSchema() {
      if (super._addDefaultMetaSchema(), !this.opts.meta)
        return;
      const w = this.opts.$data ? this.$dataMetaSchema(a, o) : a;
      this.addMetaSchema(w, i, !1), this.refs["http://json-schema.org/schema"] = i;
    }
    defaultMeta() {
      return this.opts.defaultMeta = super.defaultMeta() || (this.getSchema(i) ? i : void 0);
    }
  }
  e.Ajv = c, t.exports = e = c, t.exports.Ajv = c, Object.defineProperty(e, "__esModule", { value: !0 }), e.default = c;
  var d = St;
  Object.defineProperty(e, "KeywordCxt", { enumerable: !0, get: function() {
    return d.KeywordCxt;
  } });
  var l = le;
  Object.defineProperty(e, "_", { enumerable: !0, get: function() {
    return l._;
  } }), Object.defineProperty(e, "str", { enumerable: !0, get: function() {
    return l.str;
  } }), Object.defineProperty(e, "stringify", { enumerable: !0, get: function() {
    return l.stringify;
  } }), Object.defineProperty(e, "nil", { enumerable: !0, get: function() {
    return l.nil;
  } }), Object.defineProperty(e, "Name", { enumerable: !0, get: function() {
    return l.Name;
  } }), Object.defineProperty(e, "CodeGen", { enumerable: !0, get: function() {
    return l.CodeGen;
  } });
  var f = ol();
  Object.defineProperty(e, "ValidationError", { enumerable: !0, get: function() {
    return f.default;
  } });
  var _ = An;
  Object.defineProperty(e, "MissingRefError", { enumerable: !0, get: function() {
    return _.default;
  } });
})(wi, wi.exports);
var rR = wi.exports;
(function(t) {
  Object.defineProperty(t, "__esModule", { value: !0 }), t.formatLimitDefinition = void 0;
  const e = rR, r = le, n = r.operators, s = {
    formatMaximum: { okStr: "<=", ok: n.LTE, fail: n.GT },
    formatMinimum: { okStr: ">=", ok: n.GTE, fail: n.LT },
    formatExclusiveMaximum: { okStr: "<", ok: n.LT, fail: n.GTE },
    formatExclusiveMinimum: { okStr: ">", ok: n.GT, fail: n.LTE }
  }, a = {
    message: ({ keyword: i, schemaCode: c }) => (0, r.str)`should be ${s[i].okStr} ${c}`,
    params: ({ keyword: i, schemaCode: c }) => (0, r._)`{comparison: ${s[i].okStr}, limit: ${c}}`
  };
  t.formatLimitDefinition = {
    keyword: Object.keys(s),
    type: "string",
    schemaType: "string",
    $data: !0,
    error: a,
    code(i) {
      const { gen: c, data: d, schemaCode: l, keyword: f, it: _ } = i, { opts: p, self: w } = _;
      if (!p.validateFormats)
        return;
      const $ = new e.KeywordCxt(_, w.RULES.all.format.definition, "format");
      $.$data ? y() : m();
      function y() {
        const P = c.scopeValue("formats", {
          ref: w.formats,
          code: p.code.formats
        }), R = c.const("fmt", (0, r._)`${P}[${$.schemaCode}]`);
        i.fail$data((0, r.or)((0, r._)`typeof ${R} != "object"`, (0, r._)`${R} instanceof RegExp`, (0, r._)`typeof ${R}.compare != "function"`, v(R)));
      }
      function m() {
        const P = $.schema, R = w.formats[P];
        if (!R || R === !0)
          return;
        if (typeof R != "object" || R instanceof RegExp || typeof R.compare != "function")
          throw new Error(`"${f}": format "${P}" does not define "compare" function`);
        const N = c.scopeValue("formats", {
          key: P,
          ref: R,
          code: p.code.formats ? (0, r._)`${p.code.formats}${(0, r.getProperty)(P)}` : void 0
        });
        i.fail$data(v(N));
      }
      function v(P) {
        return (0, r._)`${P}.compare(${d}, ${l}) ${s[f].fail} 0`;
      }
    },
    dependencies: ["format"]
  };
  const o = (i) => (i.addKeyword(t.formatLimitDefinition), i);
  t.default = o;
})(Lh);
(function(t, e) {
  Object.defineProperty(e, "__esModule", { value: !0 });
  const r = Dh, n = Lh, s = le, a = new s.Name("fullFormats"), o = new s.Name("fastFormats"), i = (d, l = { keywords: !0 }) => {
    if (Array.isArray(l))
      return c(d, l, r.fullFormats, a), d;
    const [f, _] = l.mode === "fast" ? [r.fastFormats, o] : [r.fullFormats, a], p = l.formats || r.formatNames;
    return c(d, p, f, _), l.keywords && (0, n.default)(d), d;
  };
  i.get = (d, l = "full") => {
    const _ = (l === "fast" ? r.fastFormats : r.fullFormats)[d];
    if (!_)
      throw new Error(`Unknown format "${d}"`);
    return _;
  };
  function c(d, l, f, _) {
    var p, w;
    (p = (w = d.opts.code).formats) !== null && p !== void 0 || (w.formats = (0, s._)`require("ajv-formats/dist/formats").${_}`);
    for (const $ of l)
      d.addFormat($, f[$]);
  }
  t.exports = e = i, Object.defineProperty(e, "__esModule", { value: !0 }), e.default = i;
})(vi, vi.exports);
var nR = vi.exports;
const sR = /* @__PURE__ */ Ji(nR), aR = (t, e, r, n) => {
  if (r === "length" || r === "prototype" || r === "arguments" || r === "caller")
    return;
  const s = Object.getOwnPropertyDescriptor(t, r), a = Object.getOwnPropertyDescriptor(e, r);
  !oR(s, a) && n || Object.defineProperty(t, r, a);
}, oR = function(t, e) {
  return t === void 0 || t.configurable || t.writable === e.writable && t.enumerable === e.enumerable && t.configurable === e.configurable && (t.writable || t.value === e.value);
}, iR = (t, e) => {
  const r = Object.getPrototypeOf(e);
  r !== Object.getPrototypeOf(t) && Object.setPrototypeOf(t, r);
}, cR = (t, e) => `/* Wrapped ${t}*/
${e}`, lR = Object.getOwnPropertyDescriptor(Function.prototype, "toString"), uR = Object.getOwnPropertyDescriptor(Function.prototype.toString, "name"), dR = (t, e, r) => {
  const n = r === "" ? "" : `with ${r.trim()}() `, s = cR.bind(null, n, e.toString());
  Object.defineProperty(s, "name", uR);
  const { writable: a, enumerable: o, configurable: i } = lR;
  Object.defineProperty(t, "toString", { value: s, writable: a, enumerable: o, configurable: i });
};
function fR(t, e, { ignoreNonConfigurable: r = !1 } = {}) {
  const { name: n } = t;
  for (const s of Reflect.ownKeys(e))
    aR(t, e, s, r);
  return iR(t, e), dR(t, e, n), t;
}
const Id = (t, e = {}) => {
  if (typeof t != "function")
    throw new TypeError(`Expected the first argument to be a function, got \`${typeof t}\``);
  const {
    wait: r = 0,
    maxWait: n = Number.POSITIVE_INFINITY,
    before: s = !1,
    after: a = !0
  } = e;
  if (r < 0 || n < 0)
    throw new RangeError("`wait` and `maxWait` must not be negative.");
  if (!s && !a)
    throw new Error("Both `before` and `after` are false, function wouldn't be called.");
  let o, i, c;
  const d = function(...l) {
    const f = this, _ = () => {
      o = void 0, i && (clearTimeout(i), i = void 0), a && (c = t.apply(f, l));
    }, p = () => {
      i = void 0, o && (clearTimeout(o), o = void 0), a && (c = t.apply(f, l));
    }, w = s && !o;
    return clearTimeout(o), o = setTimeout(_, r), n > 0 && n !== Number.POSITIVE_INFINITY && !i && (i = setTimeout(p, n)), w && (c = t.apply(f, l)), c;
  };
  return fR(d, t), d.cancel = () => {
    o && (clearTimeout(o), o = void 0), i && (clearTimeout(i), i = void 0);
  }, d;
};
var Ni = { exports: {} };
const hR = "2.0.0", Pm = 256, mR = Number.MAX_SAFE_INTEGER || /* istanbul ignore next */
9007199254740991, pR = 16, yR = Pm - 6, $R = [
  "major",
  "premajor",
  "minor",
  "preminor",
  "patch",
  "prepatch",
  "prerelease"
];
var yo = {
  MAX_LENGTH: Pm,
  MAX_SAFE_COMPONENT_LENGTH: pR,
  MAX_SAFE_BUILD_LENGTH: yR,
  MAX_SAFE_INTEGER: mR,
  RELEASE_TYPES: $R,
  SEMVER_SPEC_VERSION: hR,
  FLAG_INCLUDE_PRERELEASE: 1,
  FLAG_LOOSE: 2
};
const gR = typeof process == "object" && process.env && process.env.NODE_DEBUG && /\bsemver\b/i.test(process.env.NODE_DEBUG) ? (...t) => console.error("SEMVER", ...t) : () => {
};
var $o = gR;
(function(t, e) {
  const {
    MAX_SAFE_COMPONENT_LENGTH: r,
    MAX_SAFE_BUILD_LENGTH: n,
    MAX_LENGTH: s
  } = yo, a = $o;
  e = t.exports = {};
  const o = e.re = [], i = e.safeRe = [], c = e.src = [], d = e.safeSrc = [], l = e.t = {};
  let f = 0;
  const _ = "[a-zA-Z0-9-]", p = [
    ["\\s", 1],
    ["\\d", s],
    [_, n]
  ], w = (y) => {
    for (const [m, v] of p)
      y = y.split(`${m}*`).join(`${m}{0,${v}}`).split(`${m}+`).join(`${m}{1,${v}}`);
    return y;
  }, $ = (y, m, v) => {
    const P = w(m), R = f++;
    a(y, R, m), l[y] = R, c[R] = m, d[R] = P, o[R] = new RegExp(m, v ? "g" : void 0), i[R] = new RegExp(P, v ? "g" : void 0);
  };
  $("NUMERICIDENTIFIER", "0|[1-9]\\d*"), $("NUMERICIDENTIFIERLOOSE", "\\d+"), $("NONNUMERICIDENTIFIER", `\\d*[a-zA-Z-]${_}*`), $("MAINVERSION", `(${c[l.NUMERICIDENTIFIER]})\\.(${c[l.NUMERICIDENTIFIER]})\\.(${c[l.NUMERICIDENTIFIER]})`), $("MAINVERSIONLOOSE", `(${c[l.NUMERICIDENTIFIERLOOSE]})\\.(${c[l.NUMERICIDENTIFIERLOOSE]})\\.(${c[l.NUMERICIDENTIFIERLOOSE]})`), $("PRERELEASEIDENTIFIER", `(?:${c[l.NONNUMERICIDENTIFIER]}|${c[l.NUMERICIDENTIFIER]})`), $("PRERELEASEIDENTIFIERLOOSE", `(?:${c[l.NONNUMERICIDENTIFIER]}|${c[l.NUMERICIDENTIFIERLOOSE]})`), $("PRERELEASE", `(?:-(${c[l.PRERELEASEIDENTIFIER]}(?:\\.${c[l.PRERELEASEIDENTIFIER]})*))`), $("PRERELEASELOOSE", `(?:-?(${c[l.PRERELEASEIDENTIFIERLOOSE]}(?:\\.${c[l.PRERELEASEIDENTIFIERLOOSE]})*))`), $("BUILDIDENTIFIER", `${_}+`), $("BUILD", `(?:\\+(${c[l.BUILDIDENTIFIER]}(?:\\.${c[l.BUILDIDENTIFIER]})*))`), $("FULLPLAIN", `v?${c[l.MAINVERSION]}${c[l.PRERELEASE]}?${c[l.BUILD]}?`), $("FULL", `^${c[l.FULLPLAIN]}$`), $("LOOSEPLAIN", `[v=\\s]*${c[l.MAINVERSIONLOOSE]}${c[l.PRERELEASELOOSE]}?${c[l.BUILD]}?`), $("LOOSE", `^${c[l.LOOSEPLAIN]}$`), $("GTLT", "((?:<|>)?=?)"), $("XRANGEIDENTIFIERLOOSE", `${c[l.NUMERICIDENTIFIERLOOSE]}|x|X|\\*`), $("XRANGEIDENTIFIER", `${c[l.NUMERICIDENTIFIER]}|x|X|\\*`), $("XRANGEPLAIN", `[v=\\s]*(${c[l.XRANGEIDENTIFIER]})(?:\\.(${c[l.XRANGEIDENTIFIER]})(?:\\.(${c[l.XRANGEIDENTIFIER]})(?:${c[l.PRERELEASE]})?${c[l.BUILD]}?)?)?`), $("XRANGEPLAINLOOSE", `[v=\\s]*(${c[l.XRANGEIDENTIFIERLOOSE]})(?:\\.(${c[l.XRANGEIDENTIFIERLOOSE]})(?:\\.(${c[l.XRANGEIDENTIFIERLOOSE]})(?:${c[l.PRERELEASELOOSE]})?${c[l.BUILD]}?)?)?`), $("XRANGE", `^${c[l.GTLT]}\\s*${c[l.XRANGEPLAIN]}$`), $("XRANGELOOSE", `^${c[l.GTLT]}\\s*${c[l.XRANGEPLAINLOOSE]}$`), $("COERCEPLAIN", `(^|[^\\d])(\\d{1,${r}})(?:\\.(\\d{1,${r}}))?(?:\\.(\\d{1,${r}}))?`), $("COERCE", `${c[l.COERCEPLAIN]}(?:$|[^\\d])`), $("COERCEFULL", c[l.COERCEPLAIN] + `(?:${c[l.PRERELEASE]})?(?:${c[l.BUILD]})?(?:$|[^\\d])`), $("COERCERTL", c[l.COERCE], !0), $("COERCERTLFULL", c[l.COERCEFULL], !0), $("LONETILDE", "(?:~>?)"), $("TILDETRIM", `(\\s*)${c[l.LONETILDE]}\\s+`, !0), e.tildeTrimReplace = "$1~", $("TILDE", `^${c[l.LONETILDE]}${c[l.XRANGEPLAIN]}$`), $("TILDELOOSE", `^${c[l.LONETILDE]}${c[l.XRANGEPLAINLOOSE]}$`), $("LONECARET", "(?:\\^)"), $("CARETTRIM", `(\\s*)${c[l.LONECARET]}\\s+`, !0), e.caretTrimReplace = "$1^", $("CARET", `^${c[l.LONECARET]}${c[l.XRANGEPLAIN]}$`), $("CARETLOOSE", `^${c[l.LONECARET]}${c[l.XRANGEPLAINLOOSE]}$`), $("COMPARATORLOOSE", `^${c[l.GTLT]}\\s*(${c[l.LOOSEPLAIN]})$|^$`), $("COMPARATOR", `^${c[l.GTLT]}\\s*(${c[l.FULLPLAIN]})$|^$`), $("COMPARATORTRIM", `(\\s*)${c[l.GTLT]}\\s*(${c[l.LOOSEPLAIN]}|${c[l.XRANGEPLAIN]})`, !0), e.comparatorTrimReplace = "$1$2$3", $("HYPHENRANGE", `^\\s*(${c[l.XRANGEPLAIN]})\\s+-\\s+(${c[l.XRANGEPLAIN]})\\s*$`), $("HYPHENRANGELOOSE", `^\\s*(${c[l.XRANGEPLAINLOOSE]})\\s+-\\s+(${c[l.XRANGEPLAINLOOSE]})\\s*$`), $("STAR", "(<|>)?=?\\s*\\*"), $("GTE0", "^\\s*>=\\s*0\\.0\\.0\\s*$"), $("GTE0PRE", "^\\s*>=\\s*0\\.0\\.0-0\\s*$");
})(Ni, Ni.exports);
var Ts = Ni.exports;
const _R = Object.freeze({ loose: !0 }), vR = Object.freeze({}), wR = (t) => t ? typeof t != "object" ? _R : t : vR;
var xl = wR;
const Nd = /^[0-9]+$/, Rm = (t, e) => {
  if (typeof t == "number" && typeof e == "number")
    return t === e ? 0 : t < e ? -1 : 1;
  const r = Nd.test(t), n = Nd.test(e);
  return r && n && (t = +t, e = +e), t === e ? 0 : r && !n ? -1 : n && !r ? 1 : t < e ? -1 : 1;
}, bR = (t, e) => Rm(e, t);
var Om = {
  compareIdentifiers: Rm,
  rcompareIdentifiers: bR
};
const Js = $o, { MAX_LENGTH: Td, MAX_SAFE_INTEGER: Xs } = yo, { safeRe: Ys, t: Qs } = Ts, ER = xl, { compareIdentifiers: Wo } = Om;
let SR = class Nt {
  constructor(e, r) {
    if (r = ER(r), e instanceof Nt) {
      if (e.loose === !!r.loose && e.includePrerelease === !!r.includePrerelease)
        return e;
      e = e.version;
    } else if (typeof e != "string")
      throw new TypeError(`Invalid version. Must be a string. Got type "${typeof e}".`);
    if (e.length > Td)
      throw new TypeError(
        `version is longer than ${Td} characters`
      );
    Js("SemVer", e, r), this.options = r, this.loose = !!r.loose, this.includePrerelease = !!r.includePrerelease;
    const n = e.trim().match(r.loose ? Ys[Qs.LOOSE] : Ys[Qs.FULL]);
    if (!n)
      throw new TypeError(`Invalid Version: ${e}`);
    if (this.raw = e, this.major = +n[1], this.minor = +n[2], this.patch = +n[3], this.major > Xs || this.major < 0)
      throw new TypeError("Invalid major version");
    if (this.minor > Xs || this.minor < 0)
      throw new TypeError("Invalid minor version");
    if (this.patch > Xs || this.patch < 0)
      throw new TypeError("Invalid patch version");
    n[4] ? this.prerelease = n[4].split(".").map((s) => {
      if (/^[0-9]+$/.test(s)) {
        const a = +s;
        if (a >= 0 && a < Xs)
          return a;
      }
      return s;
    }) : this.prerelease = [], this.build = n[5] ? n[5].split(".") : [], this.format();
  }
  format() {
    return this.version = `${this.major}.${this.minor}.${this.patch}`, this.prerelease.length && (this.version += `-${this.prerelease.join(".")}`), this.version;
  }
  toString() {
    return this.version;
  }
  compare(e) {
    if (Js("SemVer.compare", this.version, this.options, e), !(e instanceof Nt)) {
      if (typeof e == "string" && e === this.version)
        return 0;
      e = new Nt(e, this.options);
    }
    return e.version === this.version ? 0 : this.compareMain(e) || this.comparePre(e);
  }
  compareMain(e) {
    return e instanceof Nt || (e = new Nt(e, this.options)), this.major < e.major ? -1 : this.major > e.major ? 1 : this.minor < e.minor ? -1 : this.minor > e.minor ? 1 : this.patch < e.patch ? -1 : this.patch > e.patch ? 1 : 0;
  }
  comparePre(e) {
    if (e instanceof Nt || (e = new Nt(e, this.options)), this.prerelease.length && !e.prerelease.length)
      return -1;
    if (!this.prerelease.length && e.prerelease.length)
      return 1;
    if (!this.prerelease.length && !e.prerelease.length)
      return 0;
    let r = 0;
    do {
      const n = this.prerelease[r], s = e.prerelease[r];
      if (Js("prerelease compare", r, n, s), n === void 0 && s === void 0)
        return 0;
      if (s === void 0)
        return 1;
      if (n === void 0)
        return -1;
      if (n === s)
        continue;
      return Wo(n, s);
    } while (++r);
  }
  compareBuild(e) {
    e instanceof Nt || (e = new Nt(e, this.options));
    let r = 0;
    do {
      const n = this.build[r], s = e.build[r];
      if (Js("build compare", r, n, s), n === void 0 && s === void 0)
        return 0;
      if (s === void 0)
        return 1;
      if (n === void 0)
        return -1;
      if (n === s)
        continue;
      return Wo(n, s);
    } while (++r);
  }
  // preminor will bump the version up to the next minor release, and immediately
  // down to pre-release. premajor and prepatch work the same way.
  inc(e, r, n) {
    if (e.startsWith("pre")) {
      if (!r && n === !1)
        throw new Error("invalid increment argument: identifier is empty");
      if (r) {
        const s = `-${r}`.match(this.options.loose ? Ys[Qs.PRERELEASELOOSE] : Ys[Qs.PRERELEASE]);
        if (!s || s[1] !== r)
          throw new Error(`invalid identifier: ${r}`);
      }
    }
    switch (e) {
      case "premajor":
        this.prerelease.length = 0, this.patch = 0, this.minor = 0, this.major++, this.inc("pre", r, n);
        break;
      case "preminor":
        this.prerelease.length = 0, this.patch = 0, this.minor++, this.inc("pre", r, n);
        break;
      case "prepatch":
        this.prerelease.length = 0, this.inc("patch", r, n), this.inc("pre", r, n);
        break;
      case "prerelease":
        this.prerelease.length === 0 && this.inc("patch", r, n), this.inc("pre", r, n);
        break;
      case "release":
        if (this.prerelease.length === 0)
          throw new Error(`version ${this.raw} is not a prerelease`);
        this.prerelease.length = 0;
        break;
      case "major":
        (this.minor !== 0 || this.patch !== 0 || this.prerelease.length === 0) && this.major++, this.minor = 0, this.patch = 0, this.prerelease = [];
        break;
      case "minor":
        (this.patch !== 0 || this.prerelease.length === 0) && this.minor++, this.patch = 0, this.prerelease = [];
        break;
      case "patch":
        this.prerelease.length === 0 && this.patch++, this.prerelease = [];
        break;
      case "pre": {
        const s = Number(n) ? 1 : 0;
        if (this.prerelease.length === 0)
          this.prerelease = [s];
        else {
          let a = this.prerelease.length;
          for (; --a >= 0; )
            typeof this.prerelease[a] == "number" && (this.prerelease[a]++, a = -2);
          if (a === -1) {
            if (r === this.prerelease.join(".") && n === !1)
              throw new Error("invalid increment argument: identifier already exists");
            this.prerelease.push(s);
          }
        }
        if (r) {
          let a = [r, s];
          n === !1 && (a = [r]), Wo(this.prerelease[0], r) === 0 ? isNaN(this.prerelease[1]) && (this.prerelease = a) : this.prerelease = a;
        }
        break;
      }
      default:
        throw new Error(`invalid increment argument: ${e}`);
    }
    return this.raw = this.format(), this.build.length && (this.raw += `+${this.build.join(".")}`), this;
  }
};
var Xe = SR;
const kd = Xe, PR = (t, e, r = !1) => {
  if (t instanceof kd)
    return t;
  try {
    return new kd(t, e);
  } catch (n) {
    if (!r)
      return null;
    throw n;
  }
};
var Mn = PR;
const RR = Mn, OR = (t, e) => {
  const r = RR(t, e);
  return r ? r.version : null;
};
var IR = OR;
const NR = Mn, TR = (t, e) => {
  const r = NR(t.trim().replace(/^[=v]+/, ""), e);
  return r ? r.version : null;
};
var kR = TR;
const Ad = Xe, AR = (t, e, r, n, s) => {
  typeof r == "string" && (s = n, n = r, r = void 0);
  try {
    return new Ad(
      t instanceof Ad ? t.version : t,
      r
    ).inc(e, n, s).version;
  } catch {
    return null;
  }
};
var CR = AR;
const Cd = Mn, jR = (t, e) => {
  const r = Cd(t, null, !0), n = Cd(e, null, !0), s = r.compare(n);
  if (s === 0)
    return null;
  const a = s > 0, o = a ? r : n, i = a ? n : r, c = !!o.prerelease.length;
  if (!!i.prerelease.length && !c) {
    if (!i.patch && !i.minor)
      return "major";
    if (i.compareMain(o) === 0)
      return i.minor && !i.patch ? "minor" : "patch";
  }
  const l = c ? "pre" : "";
  return r.major !== n.major ? l + "major" : r.minor !== n.minor ? l + "minor" : r.patch !== n.patch ? l + "patch" : "prerelease";
};
var MR = jR;
const DR = Xe, LR = (t, e) => new DR(t, e).major;
var FR = LR;
const VR = Xe, xR = (t, e) => new VR(t, e).minor;
var UR = xR;
const qR = Xe, zR = (t, e) => new qR(t, e).patch;
var KR = zR;
const GR = Mn, BR = (t, e) => {
  const r = GR(t, e);
  return r && r.prerelease.length ? r.prerelease : null;
};
var HR = BR;
const jd = Xe, WR = (t, e, r) => new jd(t, r).compare(new jd(e, r));
var Pt = WR;
const JR = Pt, XR = (t, e, r) => JR(e, t, r);
var YR = XR;
const QR = Pt, ZR = (t, e) => QR(t, e, !0);
var eO = ZR;
const Md = Xe, tO = (t, e, r) => {
  const n = new Md(t, r), s = new Md(e, r);
  return n.compare(s) || n.compareBuild(s);
};
var Ul = tO;
const rO = Ul, nO = (t, e) => t.sort((r, n) => rO(r, n, e));
var sO = nO;
const aO = Ul, oO = (t, e) => t.sort((r, n) => aO(n, r, e));
var iO = oO;
const cO = Pt, lO = (t, e, r) => cO(t, e, r) > 0;
var go = lO;
const uO = Pt, dO = (t, e, r) => uO(t, e, r) < 0;
var ql = dO;
const fO = Pt, hO = (t, e, r) => fO(t, e, r) === 0;
var Im = hO;
const mO = Pt, pO = (t, e, r) => mO(t, e, r) !== 0;
var Nm = pO;
const yO = Pt, $O = (t, e, r) => yO(t, e, r) >= 0;
var zl = $O;
const gO = Pt, _O = (t, e, r) => gO(t, e, r) <= 0;
var Kl = _O;
const vO = Im, wO = Nm, bO = go, EO = zl, SO = ql, PO = Kl, RO = (t, e, r, n) => {
  switch (e) {
    case "===":
      return typeof t == "object" && (t = t.version), typeof r == "object" && (r = r.version), t === r;
    case "!==":
      return typeof t == "object" && (t = t.version), typeof r == "object" && (r = r.version), t !== r;
    case "":
    case "=":
    case "==":
      return vO(t, r, n);
    case "!=":
      return wO(t, r, n);
    case ">":
      return bO(t, r, n);
    case ">=":
      return EO(t, r, n);
    case "<":
      return SO(t, r, n);
    case "<=":
      return PO(t, r, n);
    default:
      throw new TypeError(`Invalid operator: ${e}`);
  }
};
var Tm = RO;
const OO = Xe, IO = Mn, { safeRe: Zs, t: ea } = Ts, NO = (t, e) => {
  if (t instanceof OO)
    return t;
  if (typeof t == "number" && (t = String(t)), typeof t != "string")
    return null;
  e = e || {};
  let r = null;
  if (!e.rtl)
    r = t.match(e.includePrerelease ? Zs[ea.COERCEFULL] : Zs[ea.COERCE]);
  else {
    const c = e.includePrerelease ? Zs[ea.COERCERTLFULL] : Zs[ea.COERCERTL];
    let d;
    for (; (d = c.exec(t)) && (!r || r.index + r[0].length !== t.length); )
      (!r || d.index + d[0].length !== r.index + r[0].length) && (r = d), c.lastIndex = d.index + d[1].length + d[2].length;
    c.lastIndex = -1;
  }
  if (r === null)
    return null;
  const n = r[2], s = r[3] || "0", a = r[4] || "0", o = e.includePrerelease && r[5] ? `-${r[5]}` : "", i = e.includePrerelease && r[6] ? `+${r[6]}` : "";
  return IO(`${n}.${s}.${a}${o}${i}`, e);
};
var TO = NO;
class kO {
  constructor() {
    this.max = 1e3, this.map = /* @__PURE__ */ new Map();
  }
  get(e) {
    const r = this.map.get(e);
    if (r !== void 0)
      return this.map.delete(e), this.map.set(e, r), r;
  }
  delete(e) {
    return this.map.delete(e);
  }
  set(e, r) {
    if (!this.delete(e) && r !== void 0) {
      if (this.map.size >= this.max) {
        const s = this.map.keys().next().value;
        this.delete(s);
      }
      this.map.set(e, r);
    }
    return this;
  }
}
var AO = kO, Jo, Dd;
function Rt() {
  if (Dd) return Jo;
  Dd = 1;
  const t = /\s+/g;
  class e {
    constructor(C, z) {
      if (z = s(z), C instanceof e)
        return C.loose === !!z.loose && C.includePrerelease === !!z.includePrerelease ? C : new e(C.raw, z);
      if (C instanceof a)
        return this.raw = C.value, this.set = [[C]], this.formatted = void 0, this;
      if (this.options = z, this.loose = !!z.loose, this.includePrerelease = !!z.includePrerelease, this.raw = C.trim().replace(t, " "), this.set = this.raw.split("||").map((x) => this.parseRange(x.trim())).filter((x) => x.length), !this.set.length)
        throw new TypeError(`Invalid SemVer Range: ${this.raw}`);
      if (this.set.length > 1) {
        const x = this.set[0];
        if (this.set = this.set.filter((J) => !$(J[0])), this.set.length === 0)
          this.set = [x];
        else if (this.set.length > 1) {
          for (const J of this.set)
            if (J.length === 1 && y(J[0])) {
              this.set = [J];
              break;
            }
        }
      }
      this.formatted = void 0;
    }
    get range() {
      if (this.formatted === void 0) {
        this.formatted = "";
        for (let C = 0; C < this.set.length; C++) {
          C > 0 && (this.formatted += "||");
          const z = this.set[C];
          for (let x = 0; x < z.length; x++)
            x > 0 && (this.formatted += " "), this.formatted += z[x].toString().trim();
        }
      }
      return this.formatted;
    }
    format() {
      return this.range;
    }
    toString() {
      return this.range;
    }
    parseRange(C) {
      const x = ((this.options.includePrerelease && p) | (this.options.loose && w)) + ":" + C, J = n.get(x);
      if (J)
        return J;
      const U = this.options.loose, O = U ? c[d.HYPHENRANGELOOSE] : c[d.HYPHENRANGE];
      C = C.replace(O, B(this.options.includePrerelease)), o("hyphen replace", C), C = C.replace(c[d.COMPARATORTRIM], l), o("comparator trim", C), C = C.replace(c[d.TILDETRIM], f), o("tilde trim", C), C = C.replace(c[d.CARETTRIM], _), o("caret trim", C);
      let g = C.split(" ").map((h) => v(h, this.options)).join(" ").split(/\s+/).map((h) => M(h, this.options));
      U && (g = g.filter((h) => (o("loose invalid filter", h, this.options), !!h.match(c[d.COMPARATORLOOSE])))), o("range list", g);
      const S = /* @__PURE__ */ new Map(), b = g.map((h) => new a(h, this.options));
      for (const h of b) {
        if ($(h))
          return [h];
        S.set(h.value, h);
      }
      S.size > 1 && S.has("") && S.delete("");
      const u = [...S.values()];
      return n.set(x, u), u;
    }
    intersects(C, z) {
      if (!(C instanceof e))
        throw new TypeError("a Range is required");
      return this.set.some((x) => m(x, z) && C.set.some((J) => m(J, z) && x.every((U) => J.every((O) => U.intersects(O, z)))));
    }
    // if ANY of the sets match ALL of its comparators, then pass
    test(C) {
      if (!C)
        return !1;
      if (typeof C == "string")
        try {
          C = new i(C, this.options);
        } catch {
          return !1;
        }
      for (let z = 0; z < this.set.length; z++)
        if (me(this.set[z], C, this.options))
          return !0;
      return !1;
    }
  }
  Jo = e;
  const r = AO, n = new r(), s = xl, a = _o(), o = $o, i = Xe, {
    safeRe: c,
    t: d,
    comparatorTrimReplace: l,
    tildeTrimReplace: f,
    caretTrimReplace: _
  } = Ts, { FLAG_INCLUDE_PRERELEASE: p, FLAG_LOOSE: w } = yo, $ = (k) => k.value === "<0.0.0-0", y = (k) => k.value === "", m = (k, C) => {
    let z = !0;
    const x = k.slice();
    let J = x.pop();
    for (; z && x.length; )
      z = x.every((U) => J.intersects(U, C)), J = x.pop();
    return z;
  }, v = (k, C) => (k = k.replace(c[d.BUILD], ""), o("comp", k, C), k = D(k, C), o("caret", k), k = R(k, C), o("tildes", k), k = de(k, C), o("xrange", k), k = ne(k, C), o("stars", k), k), P = (k) => !k || k.toLowerCase() === "x" || k === "*", R = (k, C) => k.trim().split(/\s+/).map((z) => N(z, C)).join(" "), N = (k, C) => {
    const z = C.loose ? c[d.TILDELOOSE] : c[d.TILDE];
    return k.replace(z, (x, J, U, O, g) => {
      o("tilde", k, x, J, U, O, g);
      let S;
      return P(J) ? S = "" : P(U) ? S = `>=${J}.0.0 <${+J + 1}.0.0-0` : P(O) ? S = `>=${J}.${U}.0 <${J}.${+U + 1}.0-0` : g ? (o("replaceTilde pr", g), S = `>=${J}.${U}.${O}-${g} <${J}.${+U + 1}.0-0`) : S = `>=${J}.${U}.${O} <${J}.${+U + 1}.0-0`, o("tilde return", S), S;
    });
  }, D = (k, C) => k.trim().split(/\s+/).map((z) => L(z, C)).join(" "), L = (k, C) => {
    o("caret", k, C);
    const z = C.loose ? c[d.CARETLOOSE] : c[d.CARET], x = C.includePrerelease ? "-0" : "";
    return k.replace(z, (J, U, O, g, S) => {
      o("caret", k, J, U, O, g, S);
      let b;
      return P(U) ? b = "" : P(O) ? b = `>=${U}.0.0${x} <${+U + 1}.0.0-0` : P(g) ? U === "0" ? b = `>=${U}.${O}.0${x} <${U}.${+O + 1}.0-0` : b = `>=${U}.${O}.0${x} <${+U + 1}.0.0-0` : S ? (o("replaceCaret pr", S), U === "0" ? O === "0" ? b = `>=${U}.${O}.${g}-${S} <${U}.${O}.${+g + 1}-0` : b = `>=${U}.${O}.${g}-${S} <${U}.${+O + 1}.0-0` : b = `>=${U}.${O}.${g}-${S} <${+U + 1}.0.0-0`) : (o("no pr"), U === "0" ? O === "0" ? b = `>=${U}.${O}.${g}${x} <${U}.${O}.${+g + 1}-0` : b = `>=${U}.${O}.${g}${x} <${U}.${+O + 1}.0-0` : b = `>=${U}.${O}.${g} <${+U + 1}.0.0-0`), o("caret return", b), b;
    });
  }, de = (k, C) => (o("replaceXRanges", k, C), k.split(/\s+/).map((z) => Z(z, C)).join(" ")), Z = (k, C) => {
    k = k.trim();
    const z = C.loose ? c[d.XRANGELOOSE] : c[d.XRANGE];
    return k.replace(z, (x, J, U, O, g, S) => {
      o("xRange", k, x, J, U, O, g, S);
      const b = P(U), u = b || P(O), h = u || P(g), E = h;
      return J === "=" && E && (J = ""), S = C.includePrerelease ? "-0" : "", b ? J === ">" || J === "<" ? x = "<0.0.0-0" : x = "*" : J && E ? (u && (O = 0), g = 0, J === ">" ? (J = ">=", u ? (U = +U + 1, O = 0, g = 0) : (O = +O + 1, g = 0)) : J === "<=" && (J = "<", u ? U = +U + 1 : O = +O + 1), J === "<" && (S = "-0"), x = `${J + U}.${O}.${g}${S}`) : u ? x = `>=${U}.0.0${S} <${+U + 1}.0.0-0` : h && (x = `>=${U}.${O}.0${S} <${U}.${+O + 1}.0-0`), o("xRange return", x), x;
    });
  }, ne = (k, C) => (o("replaceStars", k, C), k.trim().replace(c[d.STAR], "")), M = (k, C) => (o("replaceGTE0", k, C), k.trim().replace(c[C.includePrerelease ? d.GTE0PRE : d.GTE0], "")), B = (k) => (C, z, x, J, U, O, g, S, b, u, h, E) => (P(x) ? z = "" : P(J) ? z = `>=${x}.0.0${k ? "-0" : ""}` : P(U) ? z = `>=${x}.${J}.0${k ? "-0" : ""}` : O ? z = `>=${z}` : z = `>=${z}${k ? "-0" : ""}`, P(b) ? S = "" : P(u) ? S = `<${+b + 1}.0.0-0` : P(h) ? S = `<${b}.${+u + 1}.0-0` : E ? S = `<=${b}.${u}.${h}-${E}` : k ? S = `<${b}.${u}.${+h + 1}-0` : S = `<=${S}`, `${z} ${S}`.trim()), me = (k, C, z) => {
    for (let x = 0; x < k.length; x++)
      if (!k[x].test(C))
        return !1;
    if (C.prerelease.length && !z.includePrerelease) {
      for (let x = 0; x < k.length; x++)
        if (o(k[x].semver), k[x].semver !== a.ANY && k[x].semver.prerelease.length > 0) {
          const J = k[x].semver;
          if (J.major === C.major && J.minor === C.minor && J.patch === C.patch)
            return !0;
        }
      return !1;
    }
    return !0;
  };
  return Jo;
}
var Xo, Ld;
function _o() {
  if (Ld) return Xo;
  Ld = 1;
  const t = Symbol("SemVer ANY");
  class e {
    static get ANY() {
      return t;
    }
    constructor(l, f) {
      if (f = r(f), l instanceof e) {
        if (l.loose === !!f.loose)
          return l;
        l = l.value;
      }
      l = l.trim().split(/\s+/).join(" "), o("comparator", l, f), this.options = f, this.loose = !!f.loose, this.parse(l), this.semver === t ? this.value = "" : this.value = this.operator + this.semver.version, o("comp", this);
    }
    parse(l) {
      const f = this.options.loose ? n[s.COMPARATORLOOSE] : n[s.COMPARATOR], _ = l.match(f);
      if (!_)
        throw new TypeError(`Invalid comparator: ${l}`);
      this.operator = _[1] !== void 0 ? _[1] : "", this.operator === "=" && (this.operator = ""), _[2] ? this.semver = new i(_[2], this.options.loose) : this.semver = t;
    }
    toString() {
      return this.value;
    }
    test(l) {
      if (o("Comparator.test", l, this.options.loose), this.semver === t || l === t)
        return !0;
      if (typeof l == "string")
        try {
          l = new i(l, this.options);
        } catch {
          return !1;
        }
      return a(l, this.operator, this.semver, this.options);
    }
    intersects(l, f) {
      if (!(l instanceof e))
        throw new TypeError("a Comparator is required");
      return this.operator === "" ? this.value === "" ? !0 : new c(l.value, f).test(this.value) : l.operator === "" ? l.value === "" ? !0 : new c(this.value, f).test(l.semver) : (f = r(f), f.includePrerelease && (this.value === "<0.0.0-0" || l.value === "<0.0.0-0") || !f.includePrerelease && (this.value.startsWith("<0.0.0") || l.value.startsWith("<0.0.0")) ? !1 : !!(this.operator.startsWith(">") && l.operator.startsWith(">") || this.operator.startsWith("<") && l.operator.startsWith("<") || this.semver.version === l.semver.version && this.operator.includes("=") && l.operator.includes("=") || a(this.semver, "<", l.semver, f) && this.operator.startsWith(">") && l.operator.startsWith("<") || a(this.semver, ">", l.semver, f) && this.operator.startsWith("<") && l.operator.startsWith(">")));
    }
  }
  Xo = e;
  const r = xl, { safeRe: n, t: s } = Ts, a = Tm, o = $o, i = Xe, c = Rt();
  return Xo;
}
const CO = Rt(), jO = (t, e, r) => {
  try {
    e = new CO(e, r);
  } catch {
    return !1;
  }
  return e.test(t);
};
var vo = jO;
const MO = Rt(), DO = (t, e) => new MO(t, e).set.map((r) => r.map((n) => n.value).join(" ").trim().split(" "));
var LO = DO;
const FO = Xe, VO = Rt(), xO = (t, e, r) => {
  let n = null, s = null, a = null;
  try {
    a = new VO(e, r);
  } catch {
    return null;
  }
  return t.forEach((o) => {
    a.test(o) && (!n || s.compare(o) === -1) && (n = o, s = new FO(n, r));
  }), n;
};
var UO = xO;
const qO = Xe, zO = Rt(), KO = (t, e, r) => {
  let n = null, s = null, a = null;
  try {
    a = new zO(e, r);
  } catch {
    return null;
  }
  return t.forEach((o) => {
    a.test(o) && (!n || s.compare(o) === 1) && (n = o, s = new qO(n, r));
  }), n;
};
var GO = KO;
const Yo = Xe, BO = Rt(), Fd = go, HO = (t, e) => {
  t = new BO(t, e);
  let r = new Yo("0.0.0");
  if (t.test(r) || (r = new Yo("0.0.0-0"), t.test(r)))
    return r;
  r = null;
  for (let n = 0; n < t.set.length; ++n) {
    const s = t.set[n];
    let a = null;
    s.forEach((o) => {
      const i = new Yo(o.semver.version);
      switch (o.operator) {
        case ">":
          i.prerelease.length === 0 ? i.patch++ : i.prerelease.push(0), i.raw = i.format();
        case "":
        case ">=":
          (!a || Fd(i, a)) && (a = i);
          break;
        case "<":
        case "<=":
          break;
        default:
          throw new Error(`Unexpected operation: ${o.operator}`);
      }
    }), a && (!r || Fd(r, a)) && (r = a);
  }
  return r && t.test(r) ? r : null;
};
var WO = HO;
const JO = Rt(), XO = (t, e) => {
  try {
    return new JO(t, e).range || "*";
  } catch {
    return null;
  }
};
var YO = XO;
const QO = Xe, km = _o(), { ANY: ZO } = km, eI = Rt(), tI = vo, Vd = go, xd = ql, rI = Kl, nI = zl, sI = (t, e, r, n) => {
  t = new QO(t, n), e = new eI(e, n);
  let s, a, o, i, c;
  switch (r) {
    case ">":
      s = Vd, a = rI, o = xd, i = ">", c = ">=";
      break;
    case "<":
      s = xd, a = nI, o = Vd, i = "<", c = "<=";
      break;
    default:
      throw new TypeError('Must provide a hilo val of "<" or ">"');
  }
  if (tI(t, e, n))
    return !1;
  for (let d = 0; d < e.set.length; ++d) {
    const l = e.set[d];
    let f = null, _ = null;
    if (l.forEach((p) => {
      p.semver === ZO && (p = new km(">=0.0.0")), f = f || p, _ = _ || p, s(p.semver, f.semver, n) ? f = p : o(p.semver, _.semver, n) && (_ = p);
    }), f.operator === i || f.operator === c || (!_.operator || _.operator === i) && a(t, _.semver))
      return !1;
    if (_.operator === c && o(t, _.semver))
      return !1;
  }
  return !0;
};
var Gl = sI;
const aI = Gl, oI = (t, e, r) => aI(t, e, ">", r);
var iI = oI;
const cI = Gl, lI = (t, e, r) => cI(t, e, "<", r);
var uI = lI;
const Ud = Rt(), dI = (t, e, r) => (t = new Ud(t, r), e = new Ud(e, r), t.intersects(e, r));
var fI = dI;
const hI = vo, mI = Pt;
var pI = (t, e, r) => {
  const n = [];
  let s = null, a = null;
  const o = t.sort((l, f) => mI(l, f, r));
  for (const l of o)
    hI(l, e, r) ? (a = l, s || (s = l)) : (a && n.push([s, a]), a = null, s = null);
  s && n.push([s, null]);
  const i = [];
  for (const [l, f] of n)
    l === f ? i.push(l) : !f && l === o[0] ? i.push("*") : f ? l === o[0] ? i.push(`<=${f}`) : i.push(`${l} - ${f}`) : i.push(`>=${l}`);
  const c = i.join(" || "), d = typeof e.raw == "string" ? e.raw : String(e);
  return c.length < d.length ? c : e;
};
const qd = Rt(), Bl = _o(), { ANY: Qo } = Bl, Bn = vo, Hl = Pt, yI = (t, e, r = {}) => {
  if (t === e)
    return !0;
  t = new qd(t, r), e = new qd(e, r);
  let n = !1;
  e: for (const s of t.set) {
    for (const a of e.set) {
      const o = gI(s, a, r);
      if (n = n || o !== null, o)
        continue e;
    }
    if (n)
      return !1;
  }
  return !0;
}, $I = [new Bl(">=0.0.0-0")], zd = [new Bl(">=0.0.0")], gI = (t, e, r) => {
  if (t === e)
    return !0;
  if (t.length === 1 && t[0].semver === Qo) {
    if (e.length === 1 && e[0].semver === Qo)
      return !0;
    r.includePrerelease ? t = $I : t = zd;
  }
  if (e.length === 1 && e[0].semver === Qo) {
    if (r.includePrerelease)
      return !0;
    e = zd;
  }
  const n = /* @__PURE__ */ new Set();
  let s, a;
  for (const p of t)
    p.operator === ">" || p.operator === ">=" ? s = Kd(s, p, r) : p.operator === "<" || p.operator === "<=" ? a = Gd(a, p, r) : n.add(p.semver);
  if (n.size > 1)
    return null;
  let o;
  if (s && a) {
    if (o = Hl(s.semver, a.semver, r), o > 0)
      return null;
    if (o === 0 && (s.operator !== ">=" || a.operator !== "<="))
      return null;
  }
  for (const p of n) {
    if (s && !Bn(p, String(s), r) || a && !Bn(p, String(a), r))
      return null;
    for (const w of e)
      if (!Bn(p, String(w), r))
        return !1;
    return !0;
  }
  let i, c, d, l, f = a && !r.includePrerelease && a.semver.prerelease.length ? a.semver : !1, _ = s && !r.includePrerelease && s.semver.prerelease.length ? s.semver : !1;
  f && f.prerelease.length === 1 && a.operator === "<" && f.prerelease[0] === 0 && (f = !1);
  for (const p of e) {
    if (l = l || p.operator === ">" || p.operator === ">=", d = d || p.operator === "<" || p.operator === "<=", s) {
      if (_ && p.semver.prerelease && p.semver.prerelease.length && p.semver.major === _.major && p.semver.minor === _.minor && p.semver.patch === _.patch && (_ = !1), p.operator === ">" || p.operator === ">=") {
        if (i = Kd(s, p, r), i === p && i !== s)
          return !1;
      } else if (s.operator === ">=" && !Bn(s.semver, String(p), r))
        return !1;
    }
    if (a) {
      if (f && p.semver.prerelease && p.semver.prerelease.length && p.semver.major === f.major && p.semver.minor === f.minor && p.semver.patch === f.patch && (f = !1), p.operator === "<" || p.operator === "<=") {
        if (c = Gd(a, p, r), c === p && c !== a)
          return !1;
      } else if (a.operator === "<=" && !Bn(a.semver, String(p), r))
        return !1;
    }
    if (!p.operator && (a || s) && o !== 0)
      return !1;
  }
  return !(s && d && !a && o !== 0 || a && l && !s && o !== 0 || _ || f);
}, Kd = (t, e, r) => {
  if (!t)
    return e;
  const n = Hl(t.semver, e.semver, r);
  return n > 0 ? t : n < 0 || e.operator === ">" && t.operator === ">=" ? e : t;
}, Gd = (t, e, r) => {
  if (!t)
    return e;
  const n = Hl(t.semver, e.semver, r);
  return n < 0 ? t : n > 0 || e.operator === "<" && t.operator === "<=" ? e : t;
};
var _I = yI;
const Zo = Ts, Bd = yo, vI = Xe, Hd = Om, wI = Mn, bI = IR, EI = kR, SI = CR, PI = MR, RI = FR, OI = UR, II = KR, NI = HR, TI = Pt, kI = YR, AI = eO, CI = Ul, jI = sO, MI = iO, DI = go, LI = ql, FI = Im, VI = Nm, xI = zl, UI = Kl, qI = Tm, zI = TO, KI = _o(), GI = Rt(), BI = vo, HI = LO, WI = UO, JI = GO, XI = WO, YI = YO, QI = Gl, ZI = iI, eN = uI, tN = fI, rN = pI, nN = _I;
var sN = {
  parse: wI,
  valid: bI,
  clean: EI,
  inc: SI,
  diff: PI,
  major: RI,
  minor: OI,
  patch: II,
  prerelease: NI,
  compare: TI,
  rcompare: kI,
  compareLoose: AI,
  compareBuild: CI,
  sort: jI,
  rsort: MI,
  gt: DI,
  lt: LI,
  eq: FI,
  neq: VI,
  gte: xI,
  lte: UI,
  cmp: qI,
  coerce: zI,
  Comparator: KI,
  Range: GI,
  satisfies: BI,
  toComparators: HI,
  maxSatisfying: WI,
  minSatisfying: JI,
  minVersion: XI,
  validRange: YI,
  outside: QI,
  gtr: ZI,
  ltr: eN,
  intersects: tN,
  simplifyRange: rN,
  subset: nN,
  SemVer: vI,
  re: Zo.re,
  src: Zo.src,
  tokens: Zo.t,
  SEMVER_SPEC_VERSION: Bd.SEMVER_SPEC_VERSION,
  RELEASE_TYPES: Bd.RELEASE_TYPES,
  compareIdentifiers: Hd.compareIdentifiers,
  rcompareIdentifiers: Hd.rcompareIdentifiers
};
const rn = /* @__PURE__ */ Ji(sN), aN = Object.prototype.toString, oN = "[object Uint8Array]", iN = "[object ArrayBuffer]";
function Am(t, e, r) {
  return t ? t.constructor === e ? !0 : aN.call(t) === r : !1;
}
function Cm(t) {
  return Am(t, Uint8Array, oN);
}
function cN(t) {
  return Am(t, ArrayBuffer, iN);
}
function lN(t) {
  return Cm(t) || cN(t);
}
function uN(t) {
  if (!Cm(t))
    throw new TypeError(`Expected \`Uint8Array\`, got \`${typeof t}\``);
}
function dN(t) {
  if (!lN(t))
    throw new TypeError(`Expected \`Uint8Array\` or \`ArrayBuffer\`, got \`${typeof t}\``);
}
function ei(t, e) {
  if (t.length === 0)
    return new Uint8Array(0);
  e ?? (e = t.reduce((s, a) => s + a.length, 0));
  const r = new Uint8Array(e);
  let n = 0;
  for (const s of t)
    uN(s), r.set(s, n), n += s.length;
  return r;
}
const ta = {
  utf8: new globalThis.TextDecoder("utf8")
};
function ra(t, e = "utf8") {
  return dN(t), ta[e] ?? (ta[e] = new globalThis.TextDecoder(e)), ta[e].decode(t);
}
function fN(t) {
  if (typeof t != "string")
    throw new TypeError(`Expected \`string\`, got \`${typeof t}\``);
}
const hN = new globalThis.TextEncoder();
function na(t) {
  return fN(t), hN.encode(t);
}
Array.from({ length: 256 }, (t, e) => e.toString(16).padStart(2, "0"));
const ti = "aes-256-cbc", nr = () => /* @__PURE__ */ Object.create(null), Wd = (t) => t !== void 0, ri = (t, e) => {
  const r = /* @__PURE__ */ new Set([
    "undefined",
    "symbol",
    "function"
  ]), n = typeof e;
  if (r.has(n))
    throw new TypeError(`Setting a value of type \`${n}\` for key \`${t}\` is not allowed as it's not supported by JSON`);
}, ir = "__internal__", ni = `${ir}.migrations.version`;
var lr, vt, Ye, lt, Kr, Gr, wn, kt, Ae, jm, Mm, Dm, Lm, Fm, Vm, xm, Um;
class mN {
  constructor(e = {}) {
    Ot(this, Ae);
    xn(this, "path");
    xn(this, "events");
    Ot(this, lr);
    Ot(this, vt);
    Ot(this, Ye);
    Ot(this, lt, {});
    Ot(this, Kr, !1);
    Ot(this, Gr);
    Ot(this, wn);
    Ot(this, kt);
    xn(this, "_deserialize", (e) => JSON.parse(e));
    xn(this, "_serialize", (e) => JSON.stringify(e, void 0, "	"));
    const r = Vt(this, Ae, jm).call(this, e);
    nt(this, Ye, r), Vt(this, Ae, Mm).call(this, r), Vt(this, Ae, Lm).call(this, r), Vt(this, Ae, Fm).call(this, r), this.events = new EventTarget(), nt(this, vt, r.encryptionKey), this.path = Vt(this, Ae, Vm).call(this, r), Vt(this, Ae, xm).call(this, r), r.watch && this._watch();
  }
  get(e, r) {
    if (se(this, Ye).accessPropertiesByDotNotation)
      return this._get(e, r);
    const { store: n } = this;
    return e in n ? n[e] : r;
  }
  set(e, r) {
    if (typeof e != "string" && typeof e != "object")
      throw new TypeError(`Expected \`key\` to be of type \`string\` or \`object\`, got ${typeof e}`);
    if (typeof e != "object" && r === void 0)
      throw new TypeError("Use `delete()` to clear values");
    if (this._containsReservedKey(e))
      throw new TypeError(`Please don't use the ${ir} key, as it's used to manage this module internal operations.`);
    const { store: n } = this, s = (a, o) => {
      if (ri(a, o), se(this, Ye).accessPropertiesByDotNotation)
        Ms(n, a, o);
      else {
        if (a === "__proto__" || a === "constructor" || a === "prototype")
          return;
        n[a] = o;
      }
    };
    if (typeof e == "object") {
      const a = e;
      for (const [o, i] of Object.entries(a))
        s(o, i);
    } else
      s(e, r);
    this.store = n;
  }
  has(e) {
    return se(this, Ye).accessPropertiesByDotNotation ? Mo(this.store, e) : e in this.store;
  }
  appendToArray(e, r) {
    ri(e, r);
    const n = se(this, Ye).accessPropertiesByDotNotation ? this._get(e, []) : e in this.store ? this.store[e] : [];
    if (!Array.isArray(n))
      throw new TypeError(`The key \`${e}\` is already set to a non-array value`);
    this.set(e, [...n, r]);
  }
  /**
      Reset items to their default values, as defined by the `defaults` or `schema` option.
  
      @see `clear()` to reset all items.
  
      @param keys - The keys of the items to reset.
      */
  reset(...e) {
    for (const r of e)
      Wd(se(this, lt)[r]) && this.set(r, se(this, lt)[r]);
  }
  delete(e) {
    const { store: r } = this;
    se(this, Ye).accessPropertiesByDotNotation ? Uy(r, e) : delete r[e], this.store = r;
  }
  /**
      Delete all items.
  
      This resets known items to their default values, if defined by the `defaults` or `schema` option.
      */
  clear() {
    const e = nr();
    for (const r of Object.keys(se(this, lt)))
      Wd(se(this, lt)[r]) && (ri(r, se(this, lt)[r]), se(this, Ye).accessPropertiesByDotNotation ? Ms(e, r, se(this, lt)[r]) : e[r] = se(this, lt)[r]);
    this.store = e;
  }
  onDidChange(e, r) {
    if (typeof e != "string")
      throw new TypeError(`Expected \`key\` to be of type \`string\`, got ${typeof e}`);
    if (typeof r != "function")
      throw new TypeError(`Expected \`callback\` to be of type \`function\`, got ${typeof r}`);
    return this._handleValueChange(() => this.get(e), r);
  }
  /**
      Watches the whole config object, calling `callback` on any changes.
  
      @param callback - A callback function that is called on any changes. When a `key` is first set `oldValue` will be `undefined`, and when a key is deleted `newValue` will be `undefined`.
      @returns A function, that when called, will unsubscribe.
      */
  onDidAnyChange(e) {
    if (typeof e != "function")
      throw new TypeError(`Expected \`callback\` to be of type \`function\`, got ${typeof e}`);
    return this._handleStoreChange(e);
  }
  get size() {
    return Object.keys(this.store).filter((r) => !this._isReservedKeyPath(r)).length;
  }
  /**
      Get all the config as an object or replace the current config with an object.
  
      @example
      ```
      console.log(config.store);
      //=> {name: 'John', age: 30}
      ```
  
      @example
      ```
      config.store = {
          hello: 'world'
      };
      ```
      */
  get store() {
    var e;
    try {
      const r = ae.readFileSync(this.path, se(this, vt) ? null : "utf8"), n = this._decryptData(r), s = this._deserialize(n);
      return se(this, Kr) || this._validate(s), Object.assign(nr(), s);
    } catch (r) {
      if ((r == null ? void 0 : r.code) === "ENOENT")
        return this._ensureDirectory(), nr();
      if (se(this, Ye).clearInvalidConfig) {
        const n = r;
        if (n.name === "SyntaxError" || (e = n.message) != null && e.startsWith("Config schema violation:"))
          return nr();
      }
      throw r;
    }
  }
  set store(e) {
    if (this._ensureDirectory(), !Mo(e, ir))
      try {
        const r = ae.readFileSync(this.path, se(this, vt) ? null : "utf8"), n = this._decryptData(r), s = this._deserialize(n);
        Mo(s, ir) && Ms(e, ir, Ru(s, ir));
      } catch {
      }
    se(this, Kr) || this._validate(e), this._write(e), this.events.dispatchEvent(new Event("change"));
  }
  *[Symbol.iterator]() {
    for (const [e, r] of Object.entries(this.store))
      this._isReservedKeyPath(e) || (yield [e, r]);
  }
  /**
  Close the file watcher if one exists. This is useful in tests to prevent the process from hanging.
  */
  _closeWatcher() {
    se(this, Gr) && (se(this, Gr).close(), nt(this, Gr, void 0)), se(this, wn) && (ae.unwatchFile(this.path), nt(this, wn, !1)), nt(this, kt, void 0);
  }
  _decryptData(e) {
    if (!se(this, vt))
      return typeof e == "string" ? e : ra(e);
    try {
      const r = e.slice(0, 16), n = Nr.pbkdf2Sync(se(this, vt), r, 1e4, 32, "sha512"), s = Nr.createDecipheriv(ti, n, r), a = e.slice(17), o = typeof a == "string" ? na(a) : a;
      return ra(ei([s.update(o), s.final()]));
    } catch {
      try {
        const r = e.slice(0, 16), n = Nr.pbkdf2Sync(se(this, vt), r.toString(), 1e4, 32, "sha512"), s = Nr.createDecipheriv(ti, n, r), a = e.slice(17), o = typeof a == "string" ? na(a) : a;
        return ra(ei([s.update(o), s.final()]));
      } catch {
      }
    }
    return typeof e == "string" ? e : ra(e);
  }
  _handleStoreChange(e) {
    let r = this.store;
    const n = () => {
      const s = r, a = this.store;
      Su(a, s) || (r = a, e.call(this, a, s));
    };
    return this.events.addEventListener("change", n), () => {
      this.events.removeEventListener("change", n);
    };
  }
  _handleValueChange(e, r) {
    let n = e();
    const s = () => {
      const a = n, o = e();
      Su(o, a) || (n = o, r.call(this, o, a));
    };
    return this.events.addEventListener("change", s), () => {
      this.events.removeEventListener("change", s);
    };
  }
  _validate(e) {
    if (!se(this, lr) || se(this, lr).call(this, e) || !se(this, lr).errors)
      return;
    const n = se(this, lr).errors.map(({ instancePath: s, message: a = "" }) => `\`${s.slice(1)}\` ${a}`);
    throw new Error("Config schema violation: " + n.join("; "));
  }
  _ensureDirectory() {
    ae.mkdirSync(re.dirname(this.path), { recursive: !0 });
  }
  _write(e) {
    let r = this._serialize(e);
    if (se(this, vt)) {
      const n = Nr.randomBytes(16), s = Nr.pbkdf2Sync(se(this, vt), n, 1e4, 32, "sha512"), a = Nr.createCipheriv(ti, s, n);
      r = ei([n, na(":"), a.update(na(r)), a.final()]);
    }
    if (we.env.SNAP)
      ae.writeFileSync(this.path, r, { mode: se(this, Ye).configFileMode });
    else
      try {
        Df(this.path, r, { mode: se(this, Ye).configFileMode });
      } catch (n) {
        if ((n == null ? void 0 : n.code) === "EXDEV") {
          ae.writeFileSync(this.path, r, { mode: se(this, Ye).configFileMode });
          return;
        }
        throw n;
      }
  }
  _watch() {
    if (this._ensureDirectory(), ae.existsSync(this.path) || this._write(nr()), we.platform === "win32" || we.platform === "darwin") {
      se(this, kt) ?? nt(this, kt, Id(() => {
        this.events.dispatchEvent(new Event("change"));
      }, { wait: 100 }));
      const e = re.dirname(this.path), r = re.basename(this.path);
      nt(this, Gr, ae.watch(e, { persistent: !1, encoding: "utf8" }, (n, s) => {
        s && s !== r || typeof se(this, kt) == "function" && se(this, kt).call(this);
      }));
    } else
      se(this, kt) ?? nt(this, kt, Id(() => {
        this.events.dispatchEvent(new Event("change"));
      }, { wait: 1e3 })), ae.watchFile(this.path, { persistent: !1 }, (e, r) => {
        typeof se(this, kt) == "function" && se(this, kt).call(this);
      }), nt(this, wn, !0);
  }
  _migrate(e, r, n) {
    let s = this._get(ni, "0.0.0");
    const a = Object.keys(e).filter((i) => this._shouldPerformMigration(i, s, r));
    let o = structuredClone(this.store);
    for (const i of a)
      try {
        n && n(this, {
          fromVersion: s,
          toVersion: i,
          finalVersion: r,
          versions: a
        });
        const c = e[i];
        c == null || c(this), this._set(ni, i), s = i, o = structuredClone(this.store);
      } catch (c) {
        this.store = o;
        try {
          this._write(o);
        } catch {
        }
        const d = c instanceof Error ? c.message : String(c);
        throw new Error(`Something went wrong during the migration! Changes applied to the store until this failed migration will be restored. ${d}`);
      }
    (this._isVersionInRangeFormat(s) || !rn.eq(s, r)) && this._set(ni, r);
  }
  _containsReservedKey(e) {
    return typeof e == "string" ? this._isReservedKeyPath(e) : !e || typeof e != "object" ? !1 : this._objectContainsReservedKey(e);
  }
  _objectContainsReservedKey(e) {
    if (!e || typeof e != "object")
      return !1;
    for (const [r, n] of Object.entries(e))
      if (this._isReservedKeyPath(r) || this._objectContainsReservedKey(n))
        return !0;
    return !1;
  }
  _isReservedKeyPath(e) {
    return e === ir || e.startsWith(`${ir}.`);
  }
  _isVersionInRangeFormat(e) {
    return rn.clean(e) === null;
  }
  _shouldPerformMigration(e, r, n) {
    return this._isVersionInRangeFormat(e) ? r !== "0.0.0" && rn.satisfies(r, e) ? !1 : rn.satisfies(n, e) : !(rn.lte(e, r) || rn.gt(e, n));
  }
  _get(e, r) {
    return Ru(this.store, e, r);
  }
  _set(e, r) {
    const { store: n } = this;
    Ms(n, e, r), this.store = n;
  }
}
lr = new WeakMap(), vt = new WeakMap(), Ye = new WeakMap(), lt = new WeakMap(), Kr = new WeakMap(), Gr = new WeakMap(), wn = new WeakMap(), kt = new WeakMap(), Ae = new WeakSet(), jm = function(e) {
  const r = {
    configName: "config",
    fileExtension: "json",
    projectSuffix: "nodejs",
    clearInvalidConfig: !1,
    accessPropertiesByDotNotation: !0,
    configFileMode: 438,
    ...e
  };
  if (!r.cwd) {
    if (!r.projectName)
      throw new Error("Please specify the `projectName` option.");
    r.cwd = Gy(r.projectName, { suffix: r.projectSuffix }).config;
  }
  return typeof r.fileExtension == "string" && (r.fileExtension = r.fileExtension.replace(/^\.+/, "")), r;
}, Mm = function(e) {
  if (!(e.schema ?? e.ajvOptions ?? e.rootSchema))
    return;
  if (e.schema && typeof e.schema != "object")
    throw new TypeError("The `schema` option must be an object.");
  const r = sR.default, n = new Bb.Ajv2020({
    allErrors: !0,
    useDefaults: !0,
    ...e.ajvOptions
  });
  r(n);
  const s = {
    ...e.rootSchema,
    type: "object",
    properties: e.schema
  };
  nt(this, lr, n.compile(s)), Vt(this, Ae, Dm).call(this, e.schema);
}, Dm = function(e) {
  const r = Object.entries(e ?? {});
  for (const [n, s] of r) {
    if (!s || typeof s != "object" || !Object.hasOwn(s, "default"))
      continue;
    const { default: a } = s;
    a !== void 0 && (se(this, lt)[n] = a);
  }
}, Lm = function(e) {
  e.defaults && Object.assign(se(this, lt), e.defaults);
}, Fm = function(e) {
  e.serialize && (this._serialize = e.serialize), e.deserialize && (this._deserialize = e.deserialize);
}, Vm = function(e) {
  const r = typeof e.fileExtension == "string" ? e.fileExtension : void 0, n = r ? `.${r}` : "";
  return re.resolve(e.cwd, `${e.configName ?? "config"}${n}`);
}, xm = function(e) {
  if (e.migrations) {
    Vt(this, Ae, Um).call(this, e), this._validate(this.store);
    return;
  }
  const r = this.store, n = Object.assign(nr(), e.defaults ?? {}, r);
  this._validate(n);
  try {
    Pu.deepEqual(r, n);
  } catch {
    this.store = n;
  }
}, Um = function(e) {
  const { migrations: r, projectVersion: n } = e;
  if (r) {
    if (!n)
      throw new Error("Please specify the `projectVersion` option.");
    nt(this, Kr, !0);
    try {
      const s = this.store, a = Object.assign(nr(), e.defaults ?? {}, s);
      try {
        Pu.deepEqual(s, a);
      } catch {
        this._write(a);
      }
      this._migrate(r, n, e.beforeEachMigration);
    } finally {
      nt(this, Kr, !1);
    }
  }
};
const { app: wa, ipcMain: Ti, shell: pN } = Nf;
let Jd = !1;
const Xd = () => {
  if (!Ti || !wa)
    throw new Error("Electron Store: You need to call `.initRenderer()` from the main process.");
  const t = {
    defaultCwd: wa.getPath("userData"),
    appVersion: wa.getVersion()
  };
  return Jd || (Ti.on("electron-store-get-data", (e) => {
    e.returnValue = t;
  }), Jd = !0), t;
};
class Wl extends mN {
  constructor(e) {
    let r, n;
    if (we.type === "renderer") {
      const s = Nf.ipcRenderer.sendSync("electron-store-get-data");
      if (!s)
        throw new Error("Electron Store: You need to call `.initRenderer()` from the main process.");
      ({ defaultCwd: r, appVersion: n } = s);
    } else Ti && wa && ({ defaultCwd: r, appVersion: n } = Xd());
    e = {
      name: "config",
      ...e
    }, e.projectVersion || (e.projectVersion = n), e.cwd ? e.cwd = re.isAbsolute(e.cwd) ? e.cwd : re.join(r, e.cwd) : e.cwd = r, e.configName = e.name, delete e.name, super(e);
  }
  static initRenderer() {
    Xd();
  }
  async openInEditor() {
    const e = await pN.openPath(this.path);
    if (e)
      throw new Error(e);
  }
}
function Q(t, e, r, n, s) {
  if (typeof e == "function" ? t !== e || !0 : !e.has(t))
    throw new TypeError("Cannot write private member to an object whose class did not declare it");
  return e.set(t, r), r;
}
function I(t, e, r, n) {
  if (r === "a" && !n)
    throw new TypeError("Private accessor was defined without a getter");
  if (typeof e == "function" ? t !== e || !n : !e.has(t))
    throw new TypeError("Cannot read private member from an object whose class did not declare it");
  return r === "m" ? n : r === "a" ? n.call(t) : n ? n.value : e.get(t);
}
let qm = function() {
  const { crypto: t } = globalThis;
  if (t != null && t.randomUUID)
    return qm = t.randomUUID.bind(t), t.randomUUID();
  const e = new Uint8Array(1), r = t ? () => t.getRandomValues(e)[0] : () => Math.random() * 255 & 255;
  return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, (n) => (+n ^ r() & 15 >> +n / 4).toString(16));
};
function ki(t) {
  return typeof t == "object" && t !== null && // Spec-compliant fetch implementations
  ("name" in t && t.name === "AbortError" || // Expo fetch
  "message" in t && String(t.message).includes("FetchRequestCanceledException"));
}
const Ai = (t) => {
  if (t instanceof Error)
    return t;
  if (typeof t == "object" && t !== null) {
    try {
      if (Object.prototype.toString.call(t) === "[object Error]") {
        const e = new Error(t.message, t.cause ? { cause: t.cause } : {});
        return t.stack && (e.stack = t.stack), t.cause && !e.cause && (e.cause = t.cause), t.name && (e.name = t.name), e;
      }
    } catch {
    }
    try {
      return new Error(JSON.stringify(t));
    } catch {
    }
  }
  return new Error(t);
};
class Y extends Error {
}
class Ve extends Y {
  constructor(e, r, n, s) {
    super(`${Ve.makeMessage(e, r, n)}`), this.status = e, this.headers = s, this.requestID = s == null ? void 0 : s.get("x-request-id"), this.error = r;
    const a = r;
    this.code = a == null ? void 0 : a.code, this.param = a == null ? void 0 : a.param, this.type = a == null ? void 0 : a.type;
  }
  static makeMessage(e, r, n) {
    const s = r != null && r.message ? typeof r.message == "string" ? r.message : JSON.stringify(r.message) : r ? JSON.stringify(r) : n;
    return e && s ? `${e} ${s}` : e ? `${e} status code (no body)` : s || "(no status code or body)";
  }
  static generate(e, r, n, s) {
    if (!e || !s)
      return new wo({ message: n, cause: Ai(r) });
    const a = r == null ? void 0 : r.error;
    return e === 400 ? new zm(e, a, n, s) : e === 401 ? new Km(e, a, n, s) : e === 403 ? new Gm(e, a, n, s) : e === 404 ? new Bm(e, a, n, s) : e === 409 ? new Hm(e, a, n, s) : e === 422 ? new Wm(e, a, n, s) : e === 429 ? new Jm(e, a, n, s) : e >= 500 ? new Xm(e, a, n, s) : new Ve(e, a, n, s);
  }
}
class ft extends Ve {
  constructor({ message: e } = {}) {
    super(void 0, void 0, e || "Request was aborted.", void 0);
  }
}
class wo extends Ve {
  constructor({ message: e, cause: r }) {
    super(void 0, void 0, e || "Connection error.", void 0), r && (this.cause = r);
  }
}
class Jl extends wo {
  constructor({ message: e } = {}) {
    super({ message: e ?? "Request timed out." });
  }
}
class zm extends Ve {
}
class Km extends Ve {
}
class Gm extends Ve {
}
class Bm extends Ve {
}
class Hm extends Ve {
}
class Wm extends Ve {
}
class Jm extends Ve {
}
class Xm extends Ve {
}
class Ym extends Y {
  constructor() {
    super("Could not parse response content as the length limit was reached");
  }
}
class Qm extends Y {
  constructor() {
    super("Could not parse response content as the request was rejected by the content filter");
  }
}
class Yn extends Error {
  constructor(e) {
    super(e);
  }
}
const yN = /^[a-z][a-z0-9+.-]*:/i, $N = (t) => yN.test(t);
let et = (t) => (et = Array.isArray, et(t)), Yd = et;
function Zm(t) {
  return typeof t != "object" ? {} : t ?? {};
}
function gN(t) {
  if (!t)
    return !0;
  for (const e in t)
    return !1;
  return !0;
}
function _N(t, e) {
  return Object.prototype.hasOwnProperty.call(t, e);
}
function si(t) {
  return t != null && typeof t == "object" && !Array.isArray(t);
}
const vN = (t, e) => {
  if (typeof e != "number" || !Number.isInteger(e))
    throw new Y(`${t} must be an integer`);
  if (e < 0)
    throw new Y(`${t} must be a positive integer`);
  return e;
}, wN = (t) => {
  try {
    return JSON.parse(t);
  } catch {
    return;
  }
}, ks = (t) => new Promise((e) => setTimeout(e, t)), un = "6.15.0", bN = () => (
  // @ts-ignore
  typeof window < "u" && // @ts-ignore
  typeof window.document < "u" && // @ts-ignore
  typeof navigator < "u"
);
function EN() {
  return typeof Deno < "u" && Deno.build != null ? "deno" : typeof EdgeRuntime < "u" ? "edge" : Object.prototype.toString.call(typeof globalThis.process < "u" ? globalThis.process : 0) === "[object process]" ? "node" : "unknown";
}
const SN = () => {
  var r;
  const t = EN();
  if (t === "deno")
    return {
      "X-Stainless-Lang": "js",
      "X-Stainless-Package-Version": un,
      "X-Stainless-OS": Zd(Deno.build.os),
      "X-Stainless-Arch": Qd(Deno.build.arch),
      "X-Stainless-Runtime": "deno",
      "X-Stainless-Runtime-Version": typeof Deno.version == "string" ? Deno.version : ((r = Deno.version) == null ? void 0 : r.deno) ?? "unknown"
    };
  if (typeof EdgeRuntime < "u")
    return {
      "X-Stainless-Lang": "js",
      "X-Stainless-Package-Version": un,
      "X-Stainless-OS": "Unknown",
      "X-Stainless-Arch": `other:${EdgeRuntime}`,
      "X-Stainless-Runtime": "edge",
      "X-Stainless-Runtime-Version": globalThis.process.version
    };
  if (t === "node")
    return {
      "X-Stainless-Lang": "js",
      "X-Stainless-Package-Version": un,
      "X-Stainless-OS": Zd(globalThis.process.platform ?? "unknown"),
      "X-Stainless-Arch": Qd(globalThis.process.arch ?? "unknown"),
      "X-Stainless-Runtime": "node",
      "X-Stainless-Runtime-Version": globalThis.process.version ?? "unknown"
    };
  const e = PN();
  return e ? {
    "X-Stainless-Lang": "js",
    "X-Stainless-Package-Version": un,
    "X-Stainless-OS": "Unknown",
    "X-Stainless-Arch": "unknown",
    "X-Stainless-Runtime": `browser:${e.browser}`,
    "X-Stainless-Runtime-Version": e.version
  } : {
    "X-Stainless-Lang": "js",
    "X-Stainless-Package-Version": un,
    "X-Stainless-OS": "Unknown",
    "X-Stainless-Arch": "unknown",
    "X-Stainless-Runtime": "unknown",
    "X-Stainless-Runtime-Version": "unknown"
  };
};
function PN() {
  if (typeof navigator > "u" || !navigator)
    return null;
  const t = [
    { key: "edge", pattern: /Edge(?:\W+(\d+)\.(\d+)(?:\.(\d+))?)?/ },
    { key: "ie", pattern: /MSIE(?:\W+(\d+)\.(\d+)(?:\.(\d+))?)?/ },
    { key: "ie", pattern: /Trident(?:.*rv\:(\d+)\.(\d+)(?:\.(\d+))?)?/ },
    { key: "chrome", pattern: /Chrome(?:\W+(\d+)\.(\d+)(?:\.(\d+))?)?/ },
    { key: "firefox", pattern: /Firefox(?:\W+(\d+)\.(\d+)(?:\.(\d+))?)?/ },
    { key: "safari", pattern: /(?:Version\W+(\d+)\.(\d+)(?:\.(\d+))?)?(?:\W+Mobile\S*)?\W+Safari/ }
  ];
  for (const { key: e, pattern: r } of t) {
    const n = r.exec(navigator.userAgent);
    if (n) {
      const s = n[1] || 0, a = n[2] || 0, o = n[3] || 0;
      return { browser: e, version: `${s}.${a}.${o}` };
    }
  }
  return null;
}
const Qd = (t) => t === "x32" ? "x32" : t === "x86_64" || t === "x64" ? "x64" : t === "arm" ? "arm" : t === "aarch64" || t === "arm64" ? "arm64" : t ? `other:${t}` : "unknown", Zd = (t) => (t = t.toLowerCase(), t.includes("ios") ? "iOS" : t === "android" ? "Android" : t === "darwin" ? "MacOS" : t === "win32" ? "Windows" : t === "freebsd" ? "FreeBSD" : t === "openbsd" ? "OpenBSD" : t === "linux" ? "Linux" : t ? `Other:${t}` : "Unknown");
let ef;
const RN = () => ef ?? (ef = SN());
function ON() {
  if (typeof fetch < "u")
    return fetch;
  throw new Error("`fetch` is not defined as a global; Either pass `fetch` to the client, `new OpenAI({ fetch })` or polyfill the global, `globalThis.fetch = fetch`");
}
function ep(...t) {
  const e = globalThis.ReadableStream;
  if (typeof e > "u")
    throw new Error("`ReadableStream` is not defined as a global; You will need to polyfill it, `globalThis.ReadableStream = ReadableStream`");
  return new e(...t);
}
function tp(t) {
  let e = Symbol.asyncIterator in t ? t[Symbol.asyncIterator]() : t[Symbol.iterator]();
  return ep({
    start() {
    },
    async pull(r) {
      const { done: n, value: s } = await e.next();
      n ? r.close() : r.enqueue(s);
    },
    async cancel() {
      var r;
      await ((r = e.return) == null ? void 0 : r.call(e));
    }
  });
}
function rp(t) {
  if (t[Symbol.asyncIterator])
    return t;
  const e = t.getReader();
  return {
    async next() {
      try {
        const r = await e.read();
        return r != null && r.done && e.releaseLock(), r;
      } catch (r) {
        throw e.releaseLock(), r;
      }
    },
    async return() {
      const r = e.cancel();
      return e.releaseLock(), await r, { done: !0, value: void 0 };
    },
    [Symbol.asyncIterator]() {
      return this;
    }
  };
}
async function IN(t) {
  var n, s;
  if (t === null || typeof t != "object")
    return;
  if (t[Symbol.asyncIterator]) {
    await ((s = (n = t[Symbol.asyncIterator]()).return) == null ? void 0 : s.call(n));
    return;
  }
  const e = t.getReader(), r = e.cancel();
  e.releaseLock(), await r;
}
const NN = ({ headers: t, body: e }) => ({
  bodyHeaders: {
    "content-type": "application/json"
  },
  body: JSON.stringify(e)
}), np = "RFC3986", sp = (t) => String(t), tf = {
  RFC1738: (t) => String(t).replace(/%20/g, "+"),
  RFC3986: sp
}, TN = "RFC1738";
let Ci = (t, e) => (Ci = Object.hasOwn ?? Function.prototype.call.bind(Object.prototype.hasOwnProperty), Ci(t, e));
const It = /* @__PURE__ */ (() => {
  const t = [];
  for (let e = 0; e < 256; ++e)
    t.push("%" + ((e < 16 ? "0" : "") + e.toString(16)).toUpperCase());
  return t;
})(), ai = 1024, kN = (t, e, r, n, s) => {
  if (t.length === 0)
    return t;
  let a = t;
  if (typeof t == "symbol" ? a = Symbol.prototype.toString.call(t) : typeof t != "string" && (a = String(t)), r === "iso-8859-1")
    return escape(a).replace(/%u[0-9a-f]{4}/gi, function(i) {
      return "%26%23" + parseInt(i.slice(2), 16) + "%3B";
    });
  let o = "";
  for (let i = 0; i < a.length; i += ai) {
    const c = a.length >= ai ? a.slice(i, i + ai) : a, d = [];
    for (let l = 0; l < c.length; ++l) {
      let f = c.charCodeAt(l);
      if (f === 45 || // -
      f === 46 || // .
      f === 95 || // _
      f === 126 || // ~
      f >= 48 && f <= 57 || // 0-9
      f >= 65 && f <= 90 || // a-z
      f >= 97 && f <= 122 || // A-Z
      s === TN && (f === 40 || f === 41)) {
        d[d.length] = c.charAt(l);
        continue;
      }
      if (f < 128) {
        d[d.length] = It[f];
        continue;
      }
      if (f < 2048) {
        d[d.length] = It[192 | f >> 6] + It[128 | f & 63];
        continue;
      }
      if (f < 55296 || f >= 57344) {
        d[d.length] = It[224 | f >> 12] + It[128 | f >> 6 & 63] + It[128 | f & 63];
        continue;
      }
      l += 1, f = 65536 + ((f & 1023) << 10 | c.charCodeAt(l) & 1023), d[d.length] = It[240 | f >> 18] + It[128 | f >> 12 & 63] + It[128 | f >> 6 & 63] + It[128 | f & 63];
    }
    o += d.join("");
  }
  return o;
};
function AN(t) {
  return !t || typeof t != "object" ? !1 : !!(t.constructor && t.constructor.isBuffer && t.constructor.isBuffer(t));
}
function rf(t, e) {
  if (et(t)) {
    const r = [];
    for (let n = 0; n < t.length; n += 1)
      r.push(e(t[n]));
    return r;
  }
  return e(t);
}
const ap = {
  brackets(t) {
    return String(t) + "[]";
  },
  comma: "comma",
  indices(t, e) {
    return String(t) + "[" + e + "]";
  },
  repeat(t) {
    return String(t);
  }
}, op = function(t, e) {
  Array.prototype.push.apply(t, et(e) ? e : [e]);
};
let nf;
const Re = {
  addQueryPrefix: !1,
  allowDots: !1,
  allowEmptyArrays: !1,
  arrayFormat: "indices",
  charset: "utf-8",
  charsetSentinel: !1,
  delimiter: "&",
  encode: !0,
  encodeDotInKeys: !1,
  encoder: kN,
  encodeValuesOnly: !1,
  format: np,
  formatter: sp,
  /** @deprecated */
  indices: !1,
  serializeDate(t) {
    return (nf ?? (nf = Function.prototype.call.bind(Date.prototype.toISOString)))(t);
  },
  skipNulls: !1,
  strictNullHandling: !1
};
function CN(t) {
  return typeof t == "string" || typeof t == "number" || typeof t == "boolean" || typeof t == "symbol" || typeof t == "bigint";
}
const oi = {};
function ip(t, e, r, n, s, a, o, i, c, d, l, f, _, p, w, $, y, m) {
  let v = t, P = m, R = 0, N = !1;
  for (; (P = P.get(oi)) !== void 0 && !N; ) {
    const ne = P.get(t);
    if (R += 1, typeof ne < "u") {
      if (ne === R)
        throw new RangeError("Cyclic object value");
      N = !0;
    }
    typeof P.get(oi) > "u" && (R = 0);
  }
  if (typeof d == "function" ? v = d(e, v) : v instanceof Date ? v = _ == null ? void 0 : _(v) : r === "comma" && et(v) && (v = rf(v, function(ne) {
    return ne instanceof Date ? _ == null ? void 0 : _(ne) : ne;
  })), v === null) {
    if (a)
      return c && !$ ? (
        // @ts-expect-error
        c(e, Re.encoder, y, "key", p)
      ) : e;
    v = "";
  }
  if (CN(v) || AN(v)) {
    if (c) {
      const ne = $ ? e : c(e, Re.encoder, y, "key", p);
      return [
        (w == null ? void 0 : w(ne)) + "=" + // @ts-expect-error
        (w == null ? void 0 : w(c(v, Re.encoder, y, "value", p)))
      ];
    }
    return [(w == null ? void 0 : w(e)) + "=" + (w == null ? void 0 : w(String(v)))];
  }
  const D = [];
  if (typeof v > "u")
    return D;
  let L;
  if (r === "comma" && et(v))
    $ && c && (v = rf(v, c)), L = [{ value: v.length > 0 ? v.join(",") || null : void 0 }];
  else if (et(d))
    L = d;
  else {
    const ne = Object.keys(v);
    L = l ? ne.sort(l) : ne;
  }
  const de = i ? String(e).replace(/\./g, "%2E") : String(e), Z = n && et(v) && v.length === 1 ? de + "[]" : de;
  if (s && et(v) && v.length === 0)
    return Z + "[]";
  for (let ne = 0; ne < L.length; ++ne) {
    const M = L[ne], B = (
      // @ts-ignore
      typeof M == "object" && typeof M.value < "u" ? M.value : v[M]
    );
    if (o && B === null)
      continue;
    const me = f && i ? M.replace(/\./g, "%2E") : M, k = et(v) ? typeof r == "function" ? r(Z, me) : Z : Z + (f ? "." + me : "[" + me + "]");
    m.set(t, R);
    const C = /* @__PURE__ */ new WeakMap();
    C.set(oi, m), op(D, ip(
      B,
      k,
      r,
      n,
      s,
      a,
      o,
      i,
      // @ts-ignore
      r === "comma" && $ && et(v) ? null : c,
      d,
      l,
      f,
      _,
      p,
      w,
      $,
      y,
      C
    ));
  }
  return D;
}
function jN(t = Re) {
  if (typeof t.allowEmptyArrays < "u" && typeof t.allowEmptyArrays != "boolean")
    throw new TypeError("`allowEmptyArrays` option can only be `true` or `false`, when provided");
  if (typeof t.encodeDotInKeys < "u" && typeof t.encodeDotInKeys != "boolean")
    throw new TypeError("`encodeDotInKeys` option can only be `true` or `false`, when provided");
  if (t.encoder !== null && typeof t.encoder < "u" && typeof t.encoder != "function")
    throw new TypeError("Encoder has to be a function.");
  const e = t.charset || Re.charset;
  if (typeof t.charset < "u" && t.charset !== "utf-8" && t.charset !== "iso-8859-1")
    throw new TypeError("The charset option must be either utf-8, iso-8859-1, or undefined");
  let r = np;
  if (typeof t.format < "u") {
    if (!Ci(tf, t.format))
      throw new TypeError("Unknown format option provided.");
    r = t.format;
  }
  const n = tf[r];
  let s = Re.filter;
  (typeof t.filter == "function" || et(t.filter)) && (s = t.filter);
  let a;
  if (t.arrayFormat && t.arrayFormat in ap ? a = t.arrayFormat : "indices" in t ? a = t.indices ? "indices" : "repeat" : a = Re.arrayFormat, "commaRoundTrip" in t && typeof t.commaRoundTrip != "boolean")
    throw new TypeError("`commaRoundTrip` must be a boolean, or absent");
  const o = typeof t.allowDots > "u" ? t.encodeDotInKeys ? !0 : Re.allowDots : !!t.allowDots;
  return {
    addQueryPrefix: typeof t.addQueryPrefix == "boolean" ? t.addQueryPrefix : Re.addQueryPrefix,
    // @ts-ignore
    allowDots: o,
    allowEmptyArrays: typeof t.allowEmptyArrays == "boolean" ? !!t.allowEmptyArrays : Re.allowEmptyArrays,
    arrayFormat: a,
    charset: e,
    charsetSentinel: typeof t.charsetSentinel == "boolean" ? t.charsetSentinel : Re.charsetSentinel,
    commaRoundTrip: !!t.commaRoundTrip,
    delimiter: typeof t.delimiter > "u" ? Re.delimiter : t.delimiter,
    encode: typeof t.encode == "boolean" ? t.encode : Re.encode,
    encodeDotInKeys: typeof t.encodeDotInKeys == "boolean" ? t.encodeDotInKeys : Re.encodeDotInKeys,
    encoder: typeof t.encoder == "function" ? t.encoder : Re.encoder,
    encodeValuesOnly: typeof t.encodeValuesOnly == "boolean" ? t.encodeValuesOnly : Re.encodeValuesOnly,
    filter: s,
    format: r,
    formatter: n,
    serializeDate: typeof t.serializeDate == "function" ? t.serializeDate : Re.serializeDate,
    skipNulls: typeof t.skipNulls == "boolean" ? t.skipNulls : Re.skipNulls,
    // @ts-ignore
    sort: typeof t.sort == "function" ? t.sort : null,
    strictNullHandling: typeof t.strictNullHandling == "boolean" ? t.strictNullHandling : Re.strictNullHandling
  };
}
function MN(t, e = {}) {
  let r = t;
  const n = jN(e);
  let s, a;
  typeof n.filter == "function" ? (a = n.filter, r = a("", r)) : et(n.filter) && (a = n.filter, s = a);
  const o = [];
  if (typeof r != "object" || r === null)
    return "";
  const i = ap[n.arrayFormat], c = i === "comma" && n.commaRoundTrip;
  s || (s = Object.keys(r)), n.sort && s.sort(n.sort);
  const d = /* @__PURE__ */ new WeakMap();
  for (let _ = 0; _ < s.length; ++_) {
    const p = s[_];
    n.skipNulls && r[p] === null || op(o, ip(
      r[p],
      p,
      // @ts-expect-error
      i,
      c,
      n.allowEmptyArrays,
      n.strictNullHandling,
      n.skipNulls,
      n.encodeDotInKeys,
      n.encode ? n.encoder : null,
      n.filter,
      n.sort,
      n.allowDots,
      n.serializeDate,
      n.format,
      n.formatter,
      n.encodeValuesOnly,
      n.charset,
      d
    ));
  }
  const l = o.join(n.delimiter);
  let f = n.addQueryPrefix === !0 ? "?" : "";
  return n.charsetSentinel && (n.charset === "iso-8859-1" ? f += "utf8=%26%2310003%3B&" : f += "utf8=%E2%9C%93&"), l.length > 0 ? f + l : "";
}
function DN(t) {
  let e = 0;
  for (const s of t)
    e += s.length;
  const r = new Uint8Array(e);
  let n = 0;
  for (const s of t)
    r.set(s, n), n += s.length;
  return r;
}
let sf;
function Xl(t) {
  let e;
  return (sf ?? (e = new globalThis.TextEncoder(), sf = e.encode.bind(e)))(t);
}
let af;
function of(t) {
  let e;
  return (af ?? (e = new globalThis.TextDecoder(), af = e.decode.bind(e)))(t);
}
var at, ot;
class bo {
  constructor() {
    at.set(this, void 0), ot.set(this, void 0), Q(this, at, new Uint8Array()), Q(this, ot, null);
  }
  decode(e) {
    if (e == null)
      return [];
    const r = e instanceof ArrayBuffer ? new Uint8Array(e) : typeof e == "string" ? Xl(e) : e;
    Q(this, at, DN([I(this, at, "f"), r]));
    const n = [];
    let s;
    for (; (s = LN(I(this, at, "f"), I(this, ot, "f"))) != null; ) {
      if (s.carriage && I(this, ot, "f") == null) {
        Q(this, ot, s.index);
        continue;
      }
      if (I(this, ot, "f") != null && (s.index !== I(this, ot, "f") + 1 || s.carriage)) {
        n.push(of(I(this, at, "f").subarray(0, I(this, ot, "f") - 1))), Q(this, at, I(this, at, "f").subarray(I(this, ot, "f"))), Q(this, ot, null);
        continue;
      }
      const a = I(this, ot, "f") !== null ? s.preceding - 1 : s.preceding, o = of(I(this, at, "f").subarray(0, a));
      n.push(o), Q(this, at, I(this, at, "f").subarray(s.index)), Q(this, ot, null);
    }
    return n;
  }
  flush() {
    return I(this, at, "f").length ? this.decode(`
`) : [];
  }
}
at = /* @__PURE__ */ new WeakMap(), ot = /* @__PURE__ */ new WeakMap();
bo.NEWLINE_CHARS = /* @__PURE__ */ new Set([`
`, "\r"]);
bo.NEWLINE_REGEXP = /\r\n|[\n\r]/g;
function LN(t, e) {
  for (let s = e ?? 0; s < t.length; s++) {
    if (t[s] === 10)
      return { preceding: s, index: s + 1, carriage: !1 };
    if (t[s] === 13)
      return { preceding: s, index: s + 1, carriage: !0 };
  }
  return null;
}
function FN(t) {
  for (let n = 0; n < t.length - 1; n++) {
    if (t[n] === 10 && t[n + 1] === 10 || t[n] === 13 && t[n + 1] === 13)
      return n + 2;
    if (t[n] === 13 && t[n + 1] === 10 && n + 3 < t.length && t[n + 2] === 13 && t[n + 3] === 10)
      return n + 4;
  }
  return -1;
}
const qa = {
  off: 0,
  error: 200,
  warn: 300,
  info: 400,
  debug: 500
}, cf = (t, e, r) => {
  if (t) {
    if (_N(qa, t))
      return t;
    Me(r).warn(`${e} was set to ${JSON.stringify(t)}, expected one of ${JSON.stringify(Object.keys(qa))}`);
  }
};
function Qn() {
}
function sa(t, e, r) {
  return !e || qa[t] > qa[r] ? Qn : e[t].bind(e);
}
const VN = {
  error: Qn,
  warn: Qn,
  info: Qn,
  debug: Qn
};
let lf = /* @__PURE__ */ new WeakMap();
function Me(t) {
  const e = t.logger, r = t.logLevel ?? "off";
  if (!e)
    return VN;
  const n = lf.get(e);
  if (n && n[0] === r)
    return n[1];
  const s = {
    error: sa("error", e, r),
    warn: sa("warn", e, r),
    info: sa("info", e, r),
    debug: sa("debug", e, r)
  };
  return lf.set(e, [r, s]), s;
}
const Cr = (t) => (t.options && (t.options = { ...t.options }, delete t.options.headers), t.headers && (t.headers = Object.fromEntries((t.headers instanceof Headers ? [...t.headers] : Object.entries(t.headers)).map(([e, r]) => [
  e,
  e.toLowerCase() === "authorization" || e.toLowerCase() === "cookie" || e.toLowerCase() === "set-cookie" ? "***" : r
]))), "retryOfRequestLogID" in t && (t.retryOfRequestLogID && (t.retryOf = t.retryOfRequestLogID), delete t.retryOfRequestLogID), t);
var Hn;
class Lt {
  constructor(e, r, n) {
    this.iterator = e, Hn.set(this, void 0), this.controller = r, Q(this, Hn, n);
  }
  static fromSSEResponse(e, r, n) {
    let s = !1;
    const a = n ? Me(n) : console;
    async function* o() {
      if (s)
        throw new Y("Cannot iterate over a consumed stream, use `.tee()` to split the stream.");
      s = !0;
      let i = !1;
      try {
        for await (const c of xN(e, r))
          if (!i) {
            if (c.data.startsWith("[DONE]")) {
              i = !0;
              continue;
            }
            if (c.event === null || !c.event.startsWith("thread.")) {
              let d;
              try {
                d = JSON.parse(c.data);
              } catch (l) {
                throw a.error("Could not parse message into JSON:", c.data), a.error("From chunk:", c.raw), l;
              }
              if (d && d.error)
                throw new Ve(void 0, d.error, void 0, e.headers);
              yield d;
            } else {
              let d;
              try {
                d = JSON.parse(c.data);
              } catch (l) {
                throw console.error("Could not parse message into JSON:", c.data), console.error("From chunk:", c.raw), l;
              }
              if (c.event == "error")
                throw new Ve(void 0, d.error, d.message, void 0);
              yield { event: c.event, data: d };
            }
          }
        i = !0;
      } catch (c) {
        if (ki(c))
          return;
        throw c;
      } finally {
        i || r.abort();
      }
    }
    return new Lt(o, r, n);
  }
  /**
   * Generates a Stream from a newline-separated ReadableStream
   * where each item is a JSON value.
   */
  static fromReadableStream(e, r, n) {
    let s = !1;
    async function* a() {
      const i = new bo(), c = rp(e);
      for await (const d of c)
        for (const l of i.decode(d))
          yield l;
      for (const d of i.flush())
        yield d;
    }
    async function* o() {
      if (s)
        throw new Y("Cannot iterate over a consumed stream, use `.tee()` to split the stream.");
      s = !0;
      let i = !1;
      try {
        for await (const c of a())
          i || c && (yield JSON.parse(c));
        i = !0;
      } catch (c) {
        if (ki(c))
          return;
        throw c;
      } finally {
        i || r.abort();
      }
    }
    return new Lt(o, r, n);
  }
  [(Hn = /* @__PURE__ */ new WeakMap(), Symbol.asyncIterator)]() {
    return this.iterator();
  }
  /**
   * Splits the stream into two streams which can be
   * independently read from at different speeds.
   */
  tee() {
    const e = [], r = [], n = this.iterator(), s = (a) => ({
      next: () => {
        if (a.length === 0) {
          const o = n.next();
          e.push(o), r.push(o);
        }
        return a.shift();
      }
    });
    return [
      new Lt(() => s(e), this.controller, I(this, Hn, "f")),
      new Lt(() => s(r), this.controller, I(this, Hn, "f"))
    ];
  }
  /**
   * Converts this stream to a newline-separated ReadableStream of
   * JSON stringified values in the stream
   * which can be turned back into a Stream with `Stream.fromReadableStream()`.
   */
  toReadableStream() {
    const e = this;
    let r;
    return ep({
      async start() {
        r = e[Symbol.asyncIterator]();
      },
      async pull(n) {
        try {
          const { value: s, done: a } = await r.next();
          if (a)
            return n.close();
          const o = Xl(JSON.stringify(s) + `
`);
          n.enqueue(o);
        } catch (s) {
          n.error(s);
        }
      },
      async cancel() {
        var n;
        await ((n = r.return) == null ? void 0 : n.call(r));
      }
    });
  }
}
async function* xN(t, e) {
  if (!t.body)
    throw e.abort(), typeof globalThis.navigator < "u" && globalThis.navigator.product === "ReactNative" ? new Y("The default react-native fetch implementation does not support streaming. Please use expo/fetch: https://docs.expo.dev/versions/latest/sdk/expo/#expofetch-api") : new Y("Attempted to iterate over a response with no body");
  const r = new qN(), n = new bo(), s = rp(t.body);
  for await (const a of UN(s))
    for (const o of n.decode(a)) {
      const i = r.decode(o);
      i && (yield i);
    }
  for (const a of n.flush()) {
    const o = r.decode(a);
    o && (yield o);
  }
}
async function* UN(t) {
  let e = new Uint8Array();
  for await (const r of t) {
    if (r == null)
      continue;
    const n = r instanceof ArrayBuffer ? new Uint8Array(r) : typeof r == "string" ? Xl(r) : r;
    let s = new Uint8Array(e.length + n.length);
    s.set(e), s.set(n, e.length), e = s;
    let a;
    for (; (a = FN(e)) !== -1; )
      yield e.slice(0, a), e = e.slice(a);
  }
  e.length > 0 && (yield e);
}
class qN {
  constructor() {
    this.event = null, this.data = [], this.chunks = [];
  }
  decode(e) {
    if (e.endsWith("\r") && (e = e.substring(0, e.length - 1)), !e) {
      if (!this.event && !this.data.length)
        return null;
      const a = {
        event: this.event,
        data: this.data.join(`
`),
        raw: this.chunks
      };
      return this.event = null, this.data = [], this.chunks = [], a;
    }
    if (this.chunks.push(e), e.startsWith(":"))
      return null;
    let [r, n, s] = zN(e, ":");
    return s.startsWith(" ") && (s = s.substring(1)), r === "event" ? this.event = s : r === "data" && this.data.push(s), null;
  }
}
function zN(t, e) {
  const r = t.indexOf(e);
  return r !== -1 ? [t.substring(0, r), e, t.substring(r + e.length)] : [t, "", ""];
}
async function cp(t, e) {
  const { response: r, requestLogID: n, retryOfRequestLogID: s, startTime: a } = e, o = await (async () => {
    var f;
    if (e.options.stream)
      return Me(t).debug("response", r.status, r.url, r.headers, r.body), e.options.__streamClass ? e.options.__streamClass.fromSSEResponse(r, e.controller, t) : Lt.fromSSEResponse(r, e.controller, t);
    if (r.status === 204)
      return null;
    if (e.options.__binaryResponse)
      return r;
    const i = r.headers.get("content-type"), c = (f = i == null ? void 0 : i.split(";")[0]) == null ? void 0 : f.trim();
    if ((c == null ? void 0 : c.includes("application/json")) || (c == null ? void 0 : c.endsWith("+json"))) {
      const _ = await r.json();
      return lp(_, r);
    }
    return await r.text();
  })();
  return Me(t).debug(`[${n}] response parsed`, Cr({
    retryOfRequestLogID: s,
    url: r.url,
    status: r.status,
    body: o,
    durationMs: Date.now() - a
  })), o;
}
function lp(t, e) {
  return !t || typeof t != "object" || Array.isArray(t) ? t : Object.defineProperty(t, "_request_id", {
    value: e.headers.get("x-request-id"),
    enumerable: !1
  });
}
var Zn;
class Eo extends Promise {
  constructor(e, r, n = cp) {
    super((s) => {
      s(null);
    }), this.responsePromise = r, this.parseResponse = n, Zn.set(this, void 0), Q(this, Zn, e);
  }
  _thenUnwrap(e) {
    return new Eo(I(this, Zn, "f"), this.responsePromise, async (r, n) => lp(e(await this.parseResponse(r, n), n), n.response));
  }
  /**
   * Gets the raw `Response` instance instead of parsing the response
   * data.
   *
   * If you want to parse the response body but still get the `Response`
   * instance, you can use {@link withResponse()}.
   *
   * 👋 Getting the wrong TypeScript type for `Response`?
   * Try setting `"moduleResolution": "NodeNext"` or add `"lib": ["DOM"]`
   * to your `tsconfig.json`.
   */
  asResponse() {
    return this.responsePromise.then((e) => e.response);
  }
  /**
   * Gets the parsed response data, the raw `Response` instance and the ID of the request,
   * returned via the X-Request-ID header which is useful for debugging requests and reporting
   * issues to OpenAI.
   *
   * If you just want to get the raw `Response` instance without parsing it,
   * you can use {@link asResponse()}.
   *
   * 👋 Getting the wrong TypeScript type for `Response`?
   * Try setting `"moduleResolution": "NodeNext"` or add `"lib": ["DOM"]`
   * to your `tsconfig.json`.
   */
  async withResponse() {
    const [e, r] = await Promise.all([this.parse(), this.asResponse()]);
    return { data: e, response: r, request_id: r.headers.get("x-request-id") };
  }
  parse() {
    return this.parsedPromise || (this.parsedPromise = this.responsePromise.then((e) => this.parseResponse(I(this, Zn, "f"), e))), this.parsedPromise;
  }
  then(e, r) {
    return this.parse().then(e, r);
  }
  catch(e) {
    return this.parse().catch(e);
  }
  finally(e) {
    return this.parse().finally(e);
  }
}
Zn = /* @__PURE__ */ new WeakMap();
var aa;
class Yl {
  constructor(e, r, n, s) {
    aa.set(this, void 0), Q(this, aa, e), this.options = s, this.response = r, this.body = n;
  }
  hasNextPage() {
    return this.getPaginatedItems().length ? this.nextPageRequestOptions() != null : !1;
  }
  async getNextPage() {
    const e = this.nextPageRequestOptions();
    if (!e)
      throw new Y("No next page expected; please check `.hasNextPage()` before calling `.getNextPage()`.");
    return await I(this, aa, "f").requestAPIList(this.constructor, e);
  }
  async *iterPages() {
    let e = this;
    for (yield e; e.hasNextPage(); )
      e = await e.getNextPage(), yield e;
  }
  async *[(aa = /* @__PURE__ */ new WeakMap(), Symbol.asyncIterator)]() {
    for await (const e of this.iterPages())
      for (const r of e.getPaginatedItems())
        yield r;
  }
}
class KN extends Eo {
  constructor(e, r, n) {
    super(e, r, async (s, a) => new n(s, a.response, await cp(s, a), a.options));
  }
  /**
   * Allow auto-paginating iteration on an unawaited list call, eg:
   *
   *    for await (const item of client.items.list()) {
   *      console.log(item)
   *    }
   */
  async *[Symbol.asyncIterator]() {
    const e = await this;
    for await (const r of e)
      yield r;
  }
}
class So extends Yl {
  constructor(e, r, n, s) {
    super(e, r, n, s), this.data = n.data || [], this.object = n.object;
  }
  getPaginatedItems() {
    return this.data ?? [];
  }
  nextPageRequestOptions() {
    return null;
  }
}
class Se extends Yl {
  constructor(e, r, n, s) {
    super(e, r, n, s), this.data = n.data || [], this.has_more = n.has_more || !1;
  }
  getPaginatedItems() {
    return this.data ?? [];
  }
  hasNextPage() {
    return this.has_more === !1 ? !1 : super.hasNextPage();
  }
  nextPageRequestOptions() {
    var n;
    const e = this.getPaginatedItems(), r = (n = e[e.length - 1]) == null ? void 0 : n.id;
    return r ? {
      ...this.options,
      query: {
        ...Zm(this.options.query),
        after: r
      }
    } : null;
  }
}
class za extends Yl {
  constructor(e, r, n, s) {
    super(e, r, n, s), this.data = n.data || [], this.has_more = n.has_more || !1, this.last_id = n.last_id || "";
  }
  getPaginatedItems() {
    return this.data ?? [];
  }
  hasNextPage() {
    return this.has_more === !1 ? !1 : super.hasNextPage();
  }
  nextPageRequestOptions() {
    const e = this.last_id;
    return e ? {
      ...this.options,
      query: {
        ...Zm(this.options.query),
        after: e
      }
    } : null;
  }
}
const up = () => {
  var t;
  if (typeof File > "u") {
    const { process: e } = globalThis, r = typeof ((t = e == null ? void 0 : e.versions) == null ? void 0 : t.node) == "string" && parseInt(e.versions.node.split(".")) < 20;
    throw new Error("`File` is not defined as a global, which is required for file uploads." + (r ? " Update to Node 20 LTS or newer, or set `globalThis.File` to `import('node:buffer').File`." : ""));
  }
};
function $s(t, e, r) {
  return up(), new File(t, e ?? "unknown_file", r);
}
function ba(t) {
  return (typeof t == "object" && t !== null && ("name" in t && t.name && String(t.name) || "url" in t && t.url && String(t.url) || "filename" in t && t.filename && String(t.filename) || "path" in t && t.path && String(t.path)) || "").split(/[\\/]/).pop() || void 0;
}
const Ql = (t) => t != null && typeof t == "object" && typeof t[Symbol.asyncIterator] == "function", uf = async (t, e) => ji(t.body) ? { ...t, body: await dp(t.body, e) } : t, Xr = async (t, e) => ({ ...t, body: await dp(t.body, e) }), df = /* @__PURE__ */ new WeakMap();
function GN(t) {
  const e = typeof t == "function" ? t : t.fetch, r = df.get(e);
  if (r)
    return r;
  const n = (async () => {
    try {
      const s = "Response" in e ? e.Response : (await e("data:,")).constructor, a = new FormData();
      return a.toString() !== await new s(a).text();
    } catch {
      return !0;
    }
  })();
  return df.set(e, n), n;
}
const dp = async (t, e) => {
  if (!await GN(e))
    throw new TypeError("The provided fetch function does not support file uploads with the current global FormData class.");
  const r = new FormData();
  return await Promise.all(Object.entries(t || {}).map(([n, s]) => Mi(r, n, s))), r;
}, fp = (t) => t instanceof Blob && "name" in t, BN = (t) => typeof t == "object" && t !== null && (t instanceof Response || Ql(t) || fp(t)), ji = (t) => {
  if (BN(t))
    return !0;
  if (Array.isArray(t))
    return t.some(ji);
  if (t && typeof t == "object") {
    for (const e in t)
      if (ji(t[e]))
        return !0;
  }
  return !1;
}, Mi = async (t, e, r) => {
  if (r !== void 0) {
    if (r == null)
      throw new TypeError(`Received null for "${e}"; to pass null in FormData, you must use the string 'null'`);
    if (typeof r == "string" || typeof r == "number" || typeof r == "boolean")
      t.append(e, String(r));
    else if (r instanceof Response)
      t.append(e, $s([await r.blob()], ba(r)));
    else if (Ql(r))
      t.append(e, $s([await new Response(tp(r)).blob()], ba(r)));
    else if (fp(r))
      t.append(e, r, ba(r));
    else if (Array.isArray(r))
      await Promise.all(r.map((n) => Mi(t, e + "[]", n)));
    else if (typeof r == "object")
      await Promise.all(Object.entries(r).map(([n, s]) => Mi(t, `${e}[${n}]`, s)));
    else
      throw new TypeError(`Invalid value given to form, expected a string, number, boolean, object, Array, File or Blob but got ${r} instead`);
  }
}, hp = (t) => t != null && typeof t == "object" && typeof t.size == "number" && typeof t.type == "string" && typeof t.text == "function" && typeof t.slice == "function" && typeof t.arrayBuffer == "function", HN = (t) => t != null && typeof t == "object" && typeof t.name == "string" && typeof t.lastModified == "number" && hp(t), WN = (t) => t != null && typeof t == "object" && typeof t.url == "string" && typeof t.blob == "function";
async function JN(t, e, r) {
  if (up(), t = await t, HN(t))
    return t instanceof File ? t : $s([await t.arrayBuffer()], t.name);
  if (WN(t)) {
    const s = await t.blob();
    return e || (e = new URL(t.url).pathname.split(/[\\/]/).pop()), $s(await Di(s), e, r);
  }
  const n = await Di(t);
  if (e || (e = ba(t)), !(r != null && r.type)) {
    const s = n.find((a) => typeof a == "object" && "type" in a && a.type);
    typeof s == "string" && (r = { ...r, type: s });
  }
  return $s(n, e, r);
}
async function Di(t) {
  var r;
  let e = [];
  if (typeof t == "string" || ArrayBuffer.isView(t) || // includes Uint8Array, Buffer, etc.
  t instanceof ArrayBuffer)
    e.push(t);
  else if (hp(t))
    e.push(t instanceof Blob ? t : await t.arrayBuffer());
  else if (Ql(t))
    for await (const n of t)
      e.push(...await Di(n));
  else {
    const n = (r = t == null ? void 0 : t.constructor) == null ? void 0 : r.name;
    throw new Error(`Unexpected data type: ${typeof t}${n ? `; constructor: ${n}` : ""}${XN(t)}`);
  }
  return e;
}
function XN(t) {
  return typeof t != "object" || t === null ? "" : `; props: [${Object.getOwnPropertyNames(t).map((r) => `"${r}"`).join(", ")}]`;
}
class X {
  constructor(e) {
    this._client = e;
  }
}
function mp(t) {
  return t.replace(/[^A-Za-z0-9\-._~!$&'()*+,;=:@]+/g, encodeURIComponent);
}
const ff = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.create(null)), YN = (t = mp) => function(r, ...n) {
  if (r.length === 1)
    return r[0];
  let s = !1;
  const a = [], o = r.reduce((l, f, _) => {
    var $;
    /[?#]/.test(f) && (s = !0);
    const p = n[_];
    let w = (s ? encodeURIComponent : t)("" + p);
    return _ !== n.length && (p == null || typeof p == "object" && // handle values from other realms
    p.toString === (($ = Object.getPrototypeOf(Object.getPrototypeOf(p.hasOwnProperty ?? ff) ?? ff)) == null ? void 0 : $.toString)) && (w = p + "", a.push({
      start: l.length + f.length,
      length: w.length,
      error: `Value of type ${Object.prototype.toString.call(p).slice(8, -1)} is not a valid path parameter`
    })), l + f + (_ === n.length ? "" : w);
  }, ""), i = o.split(/[?#]/, 1)[0], c = new RegExp("(?<=^|\\/)(?:\\.|%2e){1,2}(?=\\/|$)", "gi");
  let d;
  for (; (d = c.exec(i)) !== null; )
    a.push({
      start: d.index,
      length: d[0].length,
      error: `Value "${d[0]}" can't be safely passed as a path parameter`
    });
  if (a.sort((l, f) => l.start - f.start), a.length > 0) {
    let l = 0;
    const f = a.reduce((_, p) => {
      const w = " ".repeat(p.start - l), $ = "^".repeat(p.length);
      return l = p.start + p.length, _ + w + $;
    }, "");
    throw new Y(`Path parameters result in path with invalid segments:
${a.map((_) => _.error).join(`
`)}
${o}
${f}`);
  }
  return o;
}, j = /* @__PURE__ */ YN(mp);
let pp = class extends X {
  /**
   * Get the messages in a stored chat completion. Only Chat Completions that have
   * been created with the `store` parameter set to `true` will be returned.
   *
   * @example
   * ```ts
   * // Automatically fetches more pages as needed.
   * for await (const chatCompletionStoreMessage of client.chat.completions.messages.list(
   *   'completion_id',
   * )) {
   *   // ...
   * }
   * ```
   */
  list(e, r = {}, n) {
    return this._client.getAPIList(j`/chat/completions/${e}/messages`, Se, { query: r, ...n });
  }
};
function Ka(t) {
  return t !== void 0 && "function" in t && t.function !== void 0;
}
function Zl(t) {
  return (t == null ? void 0 : t.$brand) === "auto-parseable-response-format";
}
function As(t) {
  return (t == null ? void 0 : t.$brand) === "auto-parseable-tool";
}
function QN(t, e) {
  return !e || !yp(e) ? {
    ...t,
    choices: t.choices.map((r) => ($p(r.message.tool_calls), {
      ...r,
      message: {
        ...r.message,
        parsed: null,
        ...r.message.tool_calls ? {
          tool_calls: r.message.tool_calls
        } : void 0
      }
    }))
  } : eu(t, e);
}
function eu(t, e) {
  const r = t.choices.map((n) => {
    var s;
    if (n.finish_reason === "length")
      throw new Ym();
    if (n.finish_reason === "content_filter")
      throw new Qm();
    return $p(n.message.tool_calls), {
      ...n,
      message: {
        ...n.message,
        ...n.message.tool_calls ? {
          tool_calls: ((s = n.message.tool_calls) == null ? void 0 : s.map((a) => eT(e, a))) ?? void 0
        } : void 0,
        parsed: n.message.content && !n.message.refusal ? ZN(e, n.message.content) : null
      }
    };
  });
  return { ...t, choices: r };
}
function ZN(t, e) {
  var r, n;
  return ((r = t.response_format) == null ? void 0 : r.type) !== "json_schema" ? null : ((n = t.response_format) == null ? void 0 : n.type) === "json_schema" ? "$parseRaw" in t.response_format ? t.response_format.$parseRaw(e) : JSON.parse(e) : null;
}
function eT(t, e) {
  var n;
  const r = (n = t.tools) == null ? void 0 : n.find((s) => {
    var a;
    return Ka(s) && ((a = s.function) == null ? void 0 : a.name) === e.function.name;
  });
  return {
    ...e,
    function: {
      ...e.function,
      parsed_arguments: As(r) ? r.$parseRaw(e.function.arguments) : r != null && r.function.strict ? JSON.parse(e.function.arguments) : null
    }
  };
}
function tT(t, e) {
  var n;
  if (!t || !("tools" in t) || !t.tools)
    return !1;
  const r = (n = t.tools) == null ? void 0 : n.find((s) => {
    var a;
    return Ka(s) && ((a = s.function) == null ? void 0 : a.name) === e.function.name;
  });
  return Ka(r) && (As(r) || (r == null ? void 0 : r.function.strict) || !1);
}
function yp(t) {
  var e;
  return Zl(t.response_format) ? !0 : ((e = t.tools) == null ? void 0 : e.some((r) => As(r) || r.type === "function" && r.function.strict === !0)) ?? !1;
}
function $p(t) {
  for (const e of t || [])
    if (e.type !== "function")
      throw new Y(`Currently only \`function\` tool calls are supported; Received \`${e.type}\``);
}
function rT(t) {
  for (const e of t ?? []) {
    if (e.type !== "function")
      throw new Y(`Currently only \`function\` tool types support auto-parsing; Received \`${e.type}\``);
    if (e.function.strict !== !0)
      throw new Y(`The \`${e.function.name}\` tool is not marked with \`strict: true\`. Only strict function tools can be auto-parsed`);
  }
}
const Ga = (t) => (t == null ? void 0 : t.role) === "assistant", gp = (t) => (t == null ? void 0 : t.role) === "tool";
var Li, Ea, Sa, es, ts, Pa, rs, qt, ns, Ba, Ha, dn, _p;
class tu {
  constructor() {
    Li.add(this), this.controller = new AbortController(), Ea.set(this, void 0), Sa.set(this, () => {
    }), es.set(this, () => {
    }), ts.set(this, void 0), Pa.set(this, () => {
    }), rs.set(this, () => {
    }), qt.set(this, {}), ns.set(this, !1), Ba.set(this, !1), Ha.set(this, !1), dn.set(this, !1), Q(this, Ea, new Promise((e, r) => {
      Q(this, Sa, e, "f"), Q(this, es, r, "f");
    })), Q(this, ts, new Promise((e, r) => {
      Q(this, Pa, e, "f"), Q(this, rs, r, "f");
    })), I(this, Ea, "f").catch(() => {
    }), I(this, ts, "f").catch(() => {
    });
  }
  _run(e) {
    setTimeout(() => {
      e().then(() => {
        this._emitFinal(), this._emit("end");
      }, I(this, Li, "m", _p).bind(this));
    }, 0);
  }
  _connected() {
    this.ended || (I(this, Sa, "f").call(this), this._emit("connect"));
  }
  get ended() {
    return I(this, ns, "f");
  }
  get errored() {
    return I(this, Ba, "f");
  }
  get aborted() {
    return I(this, Ha, "f");
  }
  abort() {
    this.controller.abort();
  }
  /**
   * Adds the listener function to the end of the listeners array for the event.
   * No checks are made to see if the listener has already been added. Multiple calls passing
   * the same combination of event and listener will result in the listener being added, and
   * called, multiple times.
   * @returns this ChatCompletionStream, so that calls can be chained
   */
  on(e, r) {
    return (I(this, qt, "f")[e] || (I(this, qt, "f")[e] = [])).push({ listener: r }), this;
  }
  /**
   * Removes the specified listener from the listener array for the event.
   * off() will remove, at most, one instance of a listener from the listener array. If any single
   * listener has been added multiple times to the listener array for the specified event, then
   * off() must be called multiple times to remove each instance.
   * @returns this ChatCompletionStream, so that calls can be chained
   */
  off(e, r) {
    const n = I(this, qt, "f")[e];
    if (!n)
      return this;
    const s = n.findIndex((a) => a.listener === r);
    return s >= 0 && n.splice(s, 1), this;
  }
  /**
   * Adds a one-time listener function for the event. The next time the event is triggered,
   * this listener is removed and then invoked.
   * @returns this ChatCompletionStream, so that calls can be chained
   */
  once(e, r) {
    return (I(this, qt, "f")[e] || (I(this, qt, "f")[e] = [])).push({ listener: r, once: !0 }), this;
  }
  /**
   * This is similar to `.once()`, but returns a Promise that resolves the next time
   * the event is triggered, instead of calling a listener callback.
   * @returns a Promise that resolves the next time given event is triggered,
   * or rejects if an error is emitted.  (If you request the 'error' event,
   * returns a promise that resolves with the error).
   *
   * Example:
   *
   *   const message = await stream.emitted('message') // rejects if the stream errors
   */
  emitted(e) {
    return new Promise((r, n) => {
      Q(this, dn, !0), e !== "error" && this.once("error", n), this.once(e, r);
    });
  }
  async done() {
    Q(this, dn, !0), await I(this, ts, "f");
  }
  _emit(e, ...r) {
    if (I(this, ns, "f"))
      return;
    e === "end" && (Q(this, ns, !0), I(this, Pa, "f").call(this));
    const n = I(this, qt, "f")[e];
    if (n && (I(this, qt, "f")[e] = n.filter((s) => !s.once), n.forEach(({ listener: s }) => s(...r))), e === "abort") {
      const s = r[0];
      !I(this, dn, "f") && !(n != null && n.length) && Promise.reject(s), I(this, es, "f").call(this, s), I(this, rs, "f").call(this, s), this._emit("end");
      return;
    }
    if (e === "error") {
      const s = r[0];
      !I(this, dn, "f") && !(n != null && n.length) && Promise.reject(s), I(this, es, "f").call(this, s), I(this, rs, "f").call(this, s), this._emit("end");
    }
  }
  _emitFinal() {
  }
}
Ea = /* @__PURE__ */ new WeakMap(), Sa = /* @__PURE__ */ new WeakMap(), es = /* @__PURE__ */ new WeakMap(), ts = /* @__PURE__ */ new WeakMap(), Pa = /* @__PURE__ */ new WeakMap(), rs = /* @__PURE__ */ new WeakMap(), qt = /* @__PURE__ */ new WeakMap(), ns = /* @__PURE__ */ new WeakMap(), Ba = /* @__PURE__ */ new WeakMap(), Ha = /* @__PURE__ */ new WeakMap(), dn = /* @__PURE__ */ new WeakMap(), Li = /* @__PURE__ */ new WeakSet(), _p = function(e) {
  if (Q(this, Ba, !0), e instanceof Error && e.name === "AbortError" && (e = new ft()), e instanceof ft)
    return Q(this, Ha, !0), this._emit("abort", e);
  if (e instanceof Y)
    return this._emit("error", e);
  if (e instanceof Error) {
    const r = new Y(e.message);
    return r.cause = e, this._emit("error", r);
  }
  return this._emit("error", new Y(String(e)));
};
function nT(t) {
  return typeof t.parse == "function";
}
var Be, Fi, Wa, Vi, xi, Ui, vp, wp;
const sT = 10;
class bp extends tu {
  constructor() {
    super(...arguments), Be.add(this), this._chatCompletions = [], this.messages = [];
  }
  _addChatCompletion(e) {
    var n;
    this._chatCompletions.push(e), this._emit("chatCompletion", e);
    const r = (n = e.choices[0]) == null ? void 0 : n.message;
    return r && this._addMessage(r), e;
  }
  _addMessage(e, r = !0) {
    if ("content" in e || (e.content = null), this.messages.push(e), r) {
      if (this._emit("message", e), gp(e) && e.content)
        this._emit("functionToolCallResult", e.content);
      else if (Ga(e) && e.tool_calls)
        for (const n of e.tool_calls)
          n.type === "function" && this._emit("functionToolCall", n.function);
    }
  }
  /**
   * @returns a promise that resolves with the final ChatCompletion, or rejects
   * if an error occurred or the stream ended prematurely without producing a ChatCompletion.
   */
  async finalChatCompletion() {
    await this.done();
    const e = this._chatCompletions[this._chatCompletions.length - 1];
    if (!e)
      throw new Y("stream ended without producing a ChatCompletion");
    return e;
  }
  /**
   * @returns a promise that resolves with the content of the final ChatCompletionMessage, or rejects
   * if an error occurred or the stream ended prematurely without producing a ChatCompletionMessage.
   */
  async finalContent() {
    return await this.done(), I(this, Be, "m", Fi).call(this);
  }
  /**
   * @returns a promise that resolves with the the final assistant ChatCompletionMessage response,
   * or rejects if an error occurred or the stream ended prematurely without producing a ChatCompletionMessage.
   */
  async finalMessage() {
    return await this.done(), I(this, Be, "m", Wa).call(this);
  }
  /**
   * @returns a promise that resolves with the content of the final FunctionCall, or rejects
   * if an error occurred or the stream ended prematurely without producing a ChatCompletionMessage.
   */
  async finalFunctionToolCall() {
    return await this.done(), I(this, Be, "m", Vi).call(this);
  }
  async finalFunctionToolCallResult() {
    return await this.done(), I(this, Be, "m", xi).call(this);
  }
  async totalUsage() {
    return await this.done(), I(this, Be, "m", Ui).call(this);
  }
  allChatCompletions() {
    return [...this._chatCompletions];
  }
  _emitFinal() {
    const e = this._chatCompletions[this._chatCompletions.length - 1];
    e && this._emit("finalChatCompletion", e);
    const r = I(this, Be, "m", Wa).call(this);
    r && this._emit("finalMessage", r);
    const n = I(this, Be, "m", Fi).call(this);
    n && this._emit("finalContent", n);
    const s = I(this, Be, "m", Vi).call(this);
    s && this._emit("finalFunctionToolCall", s);
    const a = I(this, Be, "m", xi).call(this);
    a != null && this._emit("finalFunctionToolCallResult", a), this._chatCompletions.some((o) => o.usage) && this._emit("totalUsage", I(this, Be, "m", Ui).call(this));
  }
  async _createChatCompletion(e, r, n) {
    const s = n == null ? void 0 : n.signal;
    s && (s.aborted && this.controller.abort(), s.addEventListener("abort", () => this.controller.abort())), I(this, Be, "m", vp).call(this, r);
    const a = await e.chat.completions.create({ ...r, stream: !1 }, { ...n, signal: this.controller.signal });
    return this._connected(), this._addChatCompletion(eu(a, r));
  }
  async _runChatCompletion(e, r, n) {
    for (const s of r.messages)
      this._addMessage(s, !1);
    return await this._createChatCompletion(e, r, n);
  }
  async _runTools(e, r, n) {
    var p, w, $;
    const s = "tool", { tool_choice: a = "auto", stream: o, ...i } = r, c = typeof a != "string" && a.type === "function" && ((p = a == null ? void 0 : a.function) == null ? void 0 : p.name), { maxChatCompletions: d = sT } = n || {}, l = r.tools.map((y) => {
      if (As(y)) {
        if (!y.$callback)
          throw new Y("Tool given to `.runTools()` that does not have an associated function");
        return {
          type: "function",
          function: {
            function: y.$callback,
            name: y.function.name,
            description: y.function.description || "",
            parameters: y.function.parameters,
            parse: y.$parseRaw,
            strict: !0
          }
        };
      }
      return y;
    }), f = {};
    for (const y of l)
      y.type === "function" && (f[y.function.name || y.function.function.name] = y.function);
    const _ = "tools" in r ? l.map((y) => y.type === "function" ? {
      type: "function",
      function: {
        name: y.function.name || y.function.function.name,
        parameters: y.function.parameters,
        description: y.function.description,
        strict: y.function.strict
      }
    } : y) : void 0;
    for (const y of r.messages)
      this._addMessage(y, !1);
    for (let y = 0; y < d; ++y) {
      const v = (w = (await this._createChatCompletion(e, {
        ...i,
        tool_choice: a,
        tools: _,
        messages: [...this.messages]
      }, n)).choices[0]) == null ? void 0 : w.message;
      if (!v)
        throw new Y("missing message in ChatCompletion response");
      if (!(($ = v.tool_calls) != null && $.length))
        return;
      for (const P of v.tool_calls) {
        if (P.type !== "function")
          continue;
        const R = P.id, { name: N, arguments: D } = P.function, L = f[N];
        if (L) {
          if (c && c !== N) {
            const M = `Invalid tool_call: ${JSON.stringify(N)}. ${JSON.stringify(c)} requested. Please try again`;
            this._addMessage({ role: s, tool_call_id: R, content: M });
            continue;
          }
        } else {
          const M = `Invalid tool_call: ${JSON.stringify(N)}. Available options are: ${Object.keys(f).map((B) => JSON.stringify(B)).join(", ")}. Please try again`;
          this._addMessage({ role: s, tool_call_id: R, content: M });
          continue;
        }
        let de;
        try {
          de = nT(L) ? await L.parse(D) : D;
        } catch (M) {
          const B = M instanceof Error ? M.message : String(M);
          this._addMessage({ role: s, tool_call_id: R, content: B });
          continue;
        }
        const Z = await L.function(de, this), ne = I(this, Be, "m", wp).call(this, Z);
        if (this._addMessage({ role: s, tool_call_id: R, content: ne }), c)
          return;
      }
    }
  }
}
Be = /* @__PURE__ */ new WeakSet(), Fi = function() {
  return I(this, Be, "m", Wa).call(this).content ?? null;
}, Wa = function() {
  let e = this.messages.length;
  for (; e-- > 0; ) {
    const r = this.messages[e];
    if (Ga(r))
      return {
        ...r,
        content: r.content ?? null,
        refusal: r.refusal ?? null
      };
  }
  throw new Y("stream ended without producing a ChatCompletionMessage with role=assistant");
}, Vi = function() {
  var e, r;
  for (let n = this.messages.length - 1; n >= 0; n--) {
    const s = this.messages[n];
    if (Ga(s) && ((e = s == null ? void 0 : s.tool_calls) != null && e.length))
      return (r = s.tool_calls.filter((a) => a.type === "function").at(-1)) == null ? void 0 : r.function;
  }
}, xi = function() {
  for (let e = this.messages.length - 1; e >= 0; e--) {
    const r = this.messages[e];
    if (gp(r) && r.content != null && typeof r.content == "string" && this.messages.some((n) => {
      var s;
      return n.role === "assistant" && ((s = n.tool_calls) == null ? void 0 : s.some((a) => a.type === "function" && a.id === r.tool_call_id));
    }))
      return r.content;
  }
}, Ui = function() {
  const e = {
    completion_tokens: 0,
    prompt_tokens: 0,
    total_tokens: 0
  };
  for (const { usage: r } of this._chatCompletions)
    r && (e.completion_tokens += r.completion_tokens, e.prompt_tokens += r.prompt_tokens, e.total_tokens += r.total_tokens);
  return e;
}, vp = function(e) {
  if (e.n != null && e.n > 1)
    throw new Y("ChatCompletion convenience helpers only support n=1 at this time. To use n>1, please use chat.completions.create() directly.");
}, wp = function(e) {
  return typeof e == "string" ? e : e === void 0 ? "undefined" : JSON.stringify(e);
};
class ru extends bp {
  static runTools(e, r, n) {
    const s = new ru(), a = {
      ...n,
      headers: { ...n == null ? void 0 : n.headers, "X-Stainless-Helper-Method": "runTools" }
    };
    return s._run(() => s._runTools(e, r, a)), s;
  }
  _addMessage(e, r = !0) {
    super._addMessage(e, r), Ga(e) && e.content && this._emit("content", e.content);
  }
}
const Ep = 1, Sp = 2, Pp = 4, Rp = 8, Op = 16, Ip = 32, Np = 64, Tp = 128, kp = 256, Ap = Tp | kp, Cp = Op | Ip | Ap | Np, jp = Ep | Sp | Cp, Mp = Pp | Rp, aT = jp | Mp, Te = {
  STR: Ep,
  NUM: Sp,
  ARR: Pp,
  OBJ: Rp,
  NULL: Op,
  BOOL: Ip,
  NAN: Np,
  INFINITY: Tp,
  MINUS_INFINITY: kp,
  INF: Ap,
  SPECIAL: Cp,
  ATOM: jp,
  COLLECTION: Mp,
  ALL: aT
};
class oT extends Error {
}
class iT extends Error {
}
function cT(t, e = Te.ALL) {
  if (typeof t != "string")
    throw new TypeError(`expecting str, got ${typeof t}`);
  if (!t.trim())
    throw new Error(`${t} is empty`);
  return lT(t.trim(), e);
}
const lT = (t, e) => {
  const r = t.length;
  let n = 0;
  const s = (_) => {
    throw new oT(`${_} at position ${n}`);
  }, a = (_) => {
    throw new iT(`${_} at position ${n}`);
  }, o = () => (f(), n >= r && s("Unexpected end of input"), t[n] === '"' ? i() : t[n] === "{" ? c() : t[n] === "[" ? d() : t.substring(n, n + 4) === "null" || Te.NULL & e && r - n < 4 && "null".startsWith(t.substring(n)) ? (n += 4, null) : t.substring(n, n + 4) === "true" || Te.BOOL & e && r - n < 4 && "true".startsWith(t.substring(n)) ? (n += 4, !0) : t.substring(n, n + 5) === "false" || Te.BOOL & e && r - n < 5 && "false".startsWith(t.substring(n)) ? (n += 5, !1) : t.substring(n, n + 8) === "Infinity" || Te.INFINITY & e && r - n < 8 && "Infinity".startsWith(t.substring(n)) ? (n += 8, 1 / 0) : t.substring(n, n + 9) === "-Infinity" || Te.MINUS_INFINITY & e && 1 < r - n && r - n < 9 && "-Infinity".startsWith(t.substring(n)) ? (n += 9, -1 / 0) : t.substring(n, n + 3) === "NaN" || Te.NAN & e && r - n < 3 && "NaN".startsWith(t.substring(n)) ? (n += 3, NaN) : l()), i = () => {
    const _ = n;
    let p = !1;
    for (n++; n < r && (t[n] !== '"' || p && t[n - 1] === "\\"); )
      p = t[n] === "\\" ? !p : !1, n++;
    if (t.charAt(n) == '"')
      try {
        return JSON.parse(t.substring(_, ++n - Number(p)));
      } catch (w) {
        a(String(w));
      }
    else if (Te.STR & e)
      try {
        return JSON.parse(t.substring(_, n - Number(p)) + '"');
      } catch {
        return JSON.parse(t.substring(_, t.lastIndexOf("\\")) + '"');
      }
    s("Unterminated string literal");
  }, c = () => {
    n++, f();
    const _ = {};
    try {
      for (; t[n] !== "}"; ) {
        if (f(), n >= r && Te.OBJ & e)
          return _;
        const p = i();
        f(), n++;
        try {
          const w = o();
          Object.defineProperty(_, p, { value: w, writable: !0, enumerable: !0, configurable: !0 });
        } catch (w) {
          if (Te.OBJ & e)
            return _;
          throw w;
        }
        f(), t[n] === "," && n++;
      }
    } catch {
      if (Te.OBJ & e)
        return _;
      s("Expected '}' at end of object");
    }
    return n++, _;
  }, d = () => {
    n++;
    const _ = [];
    try {
      for (; t[n] !== "]"; )
        _.push(o()), f(), t[n] === "," && n++;
    } catch {
      if (Te.ARR & e)
        return _;
      s("Expected ']' at end of array");
    }
    return n++, _;
  }, l = () => {
    if (n === 0) {
      t === "-" && Te.NUM & e && s("Not sure what '-' is");
      try {
        return JSON.parse(t);
      } catch (p) {
        if (Te.NUM & e)
          try {
            return t[t.length - 1] === "." ? JSON.parse(t.substring(0, t.lastIndexOf("."))) : JSON.parse(t.substring(0, t.lastIndexOf("e")));
          } catch {
          }
        a(String(p));
      }
    }
    const _ = n;
    for (t[n] === "-" && n++; t[n] && !",]}".includes(t[n]); )
      n++;
    n == r && !(Te.NUM & e) && s("Unterminated number literal");
    try {
      return JSON.parse(t.substring(_, n));
    } catch {
      t.substring(_, n) === "-" && Te.NUM & e && s("Not sure what '-' is");
      try {
        return JSON.parse(t.substring(_, t.lastIndexOf("e")));
      } catch (w) {
        a(String(w));
      }
    }
  }, f = () => {
    for (; n < r && ` 
\r	`.includes(t[n]); )
      n++;
  };
  return o();
}, hf = (t) => cT(t, Te.ALL ^ Te.NUM);
var Pe, Ut, nn, sr, ii, oa, ci, li, ui, ia, di, mf;
class Es extends bp {
  constructor(e) {
    super(), Pe.add(this), Ut.set(this, void 0), nn.set(this, void 0), sr.set(this, void 0), Q(this, Ut, e), Q(this, nn, []);
  }
  get currentChatCompletionSnapshot() {
    return I(this, sr, "f");
  }
  /**
   * Intended for use on the frontend, consuming a stream produced with
   * `.toReadableStream()` on the backend.
   *
   * Note that messages sent to the model do not appear in `.on('message')`
   * in this context.
   */
  static fromReadableStream(e) {
    const r = new Es(null);
    return r._run(() => r._fromReadableStream(e)), r;
  }
  static createChatCompletion(e, r, n) {
    const s = new Es(r);
    return s._run(() => s._runChatCompletion(e, { ...r, stream: !0 }, { ...n, headers: { ...n == null ? void 0 : n.headers, "X-Stainless-Helper-Method": "stream" } })), s;
  }
  async _createChatCompletion(e, r, n) {
    var o;
    super._createChatCompletion;
    const s = n == null ? void 0 : n.signal;
    s && (s.aborted && this.controller.abort(), s.addEventListener("abort", () => this.controller.abort())), I(this, Pe, "m", ii).call(this);
    const a = await e.chat.completions.create({ ...r, stream: !0 }, { ...n, signal: this.controller.signal });
    this._connected();
    for await (const i of a)
      I(this, Pe, "m", ci).call(this, i);
    if ((o = a.controller.signal) != null && o.aborted)
      throw new ft();
    return this._addChatCompletion(I(this, Pe, "m", ia).call(this));
  }
  async _fromReadableStream(e, r) {
    var o;
    const n = r == null ? void 0 : r.signal;
    n && (n.aborted && this.controller.abort(), n.addEventListener("abort", () => this.controller.abort())), I(this, Pe, "m", ii).call(this), this._connected();
    const s = Lt.fromReadableStream(e, this.controller);
    let a;
    for await (const i of s)
      a && a !== i.id && this._addChatCompletion(I(this, Pe, "m", ia).call(this)), I(this, Pe, "m", ci).call(this, i), a = i.id;
    if ((o = s.controller.signal) != null && o.aborted)
      throw new ft();
    return this._addChatCompletion(I(this, Pe, "m", ia).call(this));
  }
  [(Ut = /* @__PURE__ */ new WeakMap(), nn = /* @__PURE__ */ new WeakMap(), sr = /* @__PURE__ */ new WeakMap(), Pe = /* @__PURE__ */ new WeakSet(), ii = function() {
    this.ended || Q(this, sr, void 0);
  }, oa = function(r) {
    let n = I(this, nn, "f")[r.index];
    return n || (n = {
      content_done: !1,
      refusal_done: !1,
      logprobs_content_done: !1,
      logprobs_refusal_done: !1,
      done_tool_calls: /* @__PURE__ */ new Set(),
      current_tool_call_index: null
    }, I(this, nn, "f")[r.index] = n, n);
  }, ci = function(r) {
    var s, a, o, i, c, d, l, f, _, p, w, $, y, m, v;
    if (this.ended)
      return;
    const n = I(this, Pe, "m", mf).call(this, r);
    this._emit("chunk", r, n);
    for (const P of r.choices) {
      const R = n.choices[P.index];
      P.delta.content != null && ((s = R.message) == null ? void 0 : s.role) === "assistant" && ((a = R.message) != null && a.content) && (this._emit("content", P.delta.content, R.message.content), this._emit("content.delta", {
        delta: P.delta.content,
        snapshot: R.message.content,
        parsed: R.message.parsed
      })), P.delta.refusal != null && ((o = R.message) == null ? void 0 : o.role) === "assistant" && ((i = R.message) != null && i.refusal) && this._emit("refusal.delta", {
        delta: P.delta.refusal,
        snapshot: R.message.refusal
      }), ((c = P.logprobs) == null ? void 0 : c.content) != null && ((d = R.message) == null ? void 0 : d.role) === "assistant" && this._emit("logprobs.content.delta", {
        content: (l = P.logprobs) == null ? void 0 : l.content,
        snapshot: ((f = R.logprobs) == null ? void 0 : f.content) ?? []
      }), ((_ = P.logprobs) == null ? void 0 : _.refusal) != null && ((p = R.message) == null ? void 0 : p.role) === "assistant" && this._emit("logprobs.refusal.delta", {
        refusal: (w = P.logprobs) == null ? void 0 : w.refusal,
        snapshot: (($ = R.logprobs) == null ? void 0 : $.refusal) ?? []
      });
      const N = I(this, Pe, "m", oa).call(this, R);
      R.finish_reason && (I(this, Pe, "m", ui).call(this, R), N.current_tool_call_index != null && I(this, Pe, "m", li).call(this, R, N.current_tool_call_index));
      for (const D of P.delta.tool_calls ?? [])
        N.current_tool_call_index !== D.index && (I(this, Pe, "m", ui).call(this, R), N.current_tool_call_index != null && I(this, Pe, "m", li).call(this, R, N.current_tool_call_index)), N.current_tool_call_index = D.index;
      for (const D of P.delta.tool_calls ?? []) {
        const L = (y = R.message.tool_calls) == null ? void 0 : y[D.index];
        L != null && L.type && ((L == null ? void 0 : L.type) === "function" ? this._emit("tool_calls.function.arguments.delta", {
          name: (m = L.function) == null ? void 0 : m.name,
          index: D.index,
          arguments: L.function.arguments,
          parsed_arguments: L.function.parsed_arguments,
          arguments_delta: ((v = D.function) == null ? void 0 : v.arguments) ?? ""
        }) : (L == null || L.type, void 0));
      }
    }
  }, li = function(r, n) {
    var o, i, c;
    if (I(this, Pe, "m", oa).call(this, r).done_tool_calls.has(n))
      return;
    const a = (o = r.message.tool_calls) == null ? void 0 : o[n];
    if (!a)
      throw new Error("no tool call snapshot");
    if (!a.type)
      throw new Error("tool call snapshot missing `type`");
    if (a.type === "function") {
      const d = (c = (i = I(this, Ut, "f")) == null ? void 0 : i.tools) == null ? void 0 : c.find((l) => Ka(l) && l.function.name === a.function.name);
      this._emit("tool_calls.function.arguments.done", {
        name: a.function.name,
        index: n,
        arguments: a.function.arguments,
        parsed_arguments: As(d) ? d.$parseRaw(a.function.arguments) : d != null && d.function.strict ? JSON.parse(a.function.arguments) : null
      });
    } else
      a.type;
  }, ui = function(r) {
    var s, a;
    const n = I(this, Pe, "m", oa).call(this, r);
    if (r.message.content && !n.content_done) {
      n.content_done = !0;
      const o = I(this, Pe, "m", di).call(this);
      this._emit("content.done", {
        content: r.message.content,
        parsed: o ? o.$parseRaw(r.message.content) : null
      });
    }
    r.message.refusal && !n.refusal_done && (n.refusal_done = !0, this._emit("refusal.done", { refusal: r.message.refusal })), (s = r.logprobs) != null && s.content && !n.logprobs_content_done && (n.logprobs_content_done = !0, this._emit("logprobs.content.done", { content: r.logprobs.content })), (a = r.logprobs) != null && a.refusal && !n.logprobs_refusal_done && (n.logprobs_refusal_done = !0, this._emit("logprobs.refusal.done", { refusal: r.logprobs.refusal }));
  }, ia = function() {
    if (this.ended)
      throw new Y("stream has ended, this shouldn't happen");
    const r = I(this, sr, "f");
    if (!r)
      throw new Y("request ended without sending any chunks");
    return Q(this, sr, void 0), Q(this, nn, []), uT(r, I(this, Ut, "f"));
  }, di = function() {
    var n;
    const r = (n = I(this, Ut, "f")) == null ? void 0 : n.response_format;
    return Zl(r) ? r : null;
  }, mf = function(r) {
    var n, s, a, o;
    let i = I(this, sr, "f");
    const { choices: c, ...d } = r;
    i ? Object.assign(i, d) : i = Q(this, sr, {
      ...d,
      choices: []
    });
    for (const { delta: l, finish_reason: f, index: _, logprobs: p = null, ...w } of r.choices) {
      let $ = i.choices[_];
      if ($ || ($ = i.choices[_] = { finish_reason: f, index: _, message: {}, logprobs: p, ...w }), p)
        if (!$.logprobs)
          $.logprobs = Object.assign({}, p);
        else {
          const { content: D, refusal: L, ...de } = p;
          Object.assign($.logprobs, de), D && ((n = $.logprobs).content ?? (n.content = []), $.logprobs.content.push(...D)), L && ((s = $.logprobs).refusal ?? (s.refusal = []), $.logprobs.refusal.push(...L));
        }
      if (f && ($.finish_reason = f, I(this, Ut, "f") && yp(I(this, Ut, "f")))) {
        if (f === "length")
          throw new Ym();
        if (f === "content_filter")
          throw new Qm();
      }
      if (Object.assign($, w), !l)
        continue;
      const { content: y, refusal: m, function_call: v, role: P, tool_calls: R, ...N } = l;
      if (Object.assign($.message, N), m && ($.message.refusal = ($.message.refusal || "") + m), P && ($.message.role = P), v && ($.message.function_call ? (v.name && ($.message.function_call.name = v.name), v.arguments && ((a = $.message.function_call).arguments ?? (a.arguments = ""), $.message.function_call.arguments += v.arguments)) : $.message.function_call = v), y && ($.message.content = ($.message.content || "") + y, !$.message.refusal && I(this, Pe, "m", di).call(this) && ($.message.parsed = hf($.message.content))), R) {
        $.message.tool_calls || ($.message.tool_calls = []);
        for (const { index: D, id: L, type: de, function: Z, ...ne } of R) {
          const M = (o = $.message.tool_calls)[D] ?? (o[D] = {});
          Object.assign(M, ne), L && (M.id = L), de && (M.type = de), Z && (M.function ?? (M.function = { name: Z.name ?? "", arguments: "" })), Z != null && Z.name && (M.function.name = Z.name), Z != null && Z.arguments && (M.function.arguments += Z.arguments, tT(I(this, Ut, "f"), M) && (M.function.parsed_arguments = hf(M.function.arguments)));
        }
      }
    }
    return i;
  }, Symbol.asyncIterator)]() {
    const e = [], r = [];
    let n = !1;
    return this.on("chunk", (s) => {
      const a = r.shift();
      a ? a.resolve(s) : e.push(s);
    }), this.on("end", () => {
      n = !0;
      for (const s of r)
        s.resolve(void 0);
      r.length = 0;
    }), this.on("abort", (s) => {
      n = !0;
      for (const a of r)
        a.reject(s);
      r.length = 0;
    }), this.on("error", (s) => {
      n = !0;
      for (const a of r)
        a.reject(s);
      r.length = 0;
    }), {
      next: async () => e.length ? { value: e.shift(), done: !1 } : n ? { value: void 0, done: !0 } : new Promise((a, o) => r.push({ resolve: a, reject: o })).then((a) => a ? { value: a, done: !1 } : { value: void 0, done: !0 }),
      return: async () => (this.abort(), { value: void 0, done: !0 })
    };
  }
  toReadableStream() {
    return new Lt(this[Symbol.asyncIterator].bind(this), this.controller).toReadableStream();
  }
}
function uT(t, e) {
  const { id: r, choices: n, created: s, model: a, system_fingerprint: o, ...i } = t, c = {
    ...i,
    id: r,
    choices: n.map(({ message: d, finish_reason: l, index: f, logprobs: _, ...p }) => {
      if (!l)
        throw new Y(`missing finish_reason for choice ${f}`);
      const { content: w = null, function_call: $, tool_calls: y, ...m } = d, v = d.role;
      if (!v)
        throw new Y(`missing role for choice ${f}`);
      if ($) {
        const { arguments: P, name: R } = $;
        if (P == null)
          throw new Y(`missing function_call.arguments for choice ${f}`);
        if (!R)
          throw new Y(`missing function_call.name for choice ${f}`);
        return {
          ...p,
          message: {
            content: w,
            function_call: { arguments: P, name: R },
            role: v,
            refusal: d.refusal ?? null
          },
          finish_reason: l,
          index: f,
          logprobs: _
        };
      }
      return y ? {
        ...p,
        index: f,
        finish_reason: l,
        logprobs: _,
        message: {
          ...m,
          role: v,
          content: w,
          refusal: d.refusal ?? null,
          tool_calls: y.map((P, R) => {
            const { function: N, type: D, id: L, ...de } = P, { arguments: Z, name: ne, ...M } = N || {};
            if (L == null)
              throw new Y(`missing choices[${f}].tool_calls[${R}].id
${ca(t)}`);
            if (D == null)
              throw new Y(`missing choices[${f}].tool_calls[${R}].type
${ca(t)}`);
            if (ne == null)
              throw new Y(`missing choices[${f}].tool_calls[${R}].function.name
${ca(t)}`);
            if (Z == null)
              throw new Y(`missing choices[${f}].tool_calls[${R}].function.arguments
${ca(t)}`);
            return { ...de, id: L, type: D, function: { ...M, name: ne, arguments: Z } };
          })
        }
      } : {
        ...p,
        message: { ...m, content: w, role: v, refusal: d.refusal ?? null },
        finish_reason: l,
        index: f,
        logprobs: _
      };
    }),
    created: s,
    model: a,
    object: "chat.completion",
    ...o ? { system_fingerprint: o } : {}
  };
  return QN(c, e);
}
function ca(t) {
  return JSON.stringify(t);
}
class Ja extends Es {
  static fromReadableStream(e) {
    const r = new Ja(null);
    return r._run(() => r._fromReadableStream(e)), r;
  }
  static runTools(e, r, n) {
    const s = new Ja(
      // @ts-expect-error TODO these types are incompatible
      r
    ), a = {
      ...n,
      headers: { ...n == null ? void 0 : n.headers, "X-Stainless-Helper-Method": "runTools" }
    };
    return s._run(() => s._runTools(e, r, a)), s;
  }
}
let nu = class extends X {
  constructor() {
    super(...arguments), this.messages = new pp(this._client);
  }
  create(e, r) {
    return this._client.post("/chat/completions", { body: e, ...r, stream: e.stream ?? !1 });
  }
  /**
   * Get a stored chat completion. Only Chat Completions that have been created with
   * the `store` parameter set to `true` will be returned.
   *
   * @example
   * ```ts
   * const chatCompletion =
   *   await client.chat.completions.retrieve('completion_id');
   * ```
   */
  retrieve(e, r) {
    return this._client.get(j`/chat/completions/${e}`, r);
  }
  /**
   * Modify a stored chat completion. Only Chat Completions that have been created
   * with the `store` parameter set to `true` can be modified. Currently, the only
   * supported modification is to update the `metadata` field.
   *
   * @example
   * ```ts
   * const chatCompletion = await client.chat.completions.update(
   *   'completion_id',
   *   { metadata: { foo: 'string' } },
   * );
   * ```
   */
  update(e, r, n) {
    return this._client.post(j`/chat/completions/${e}`, { body: r, ...n });
  }
  /**
   * List stored Chat Completions. Only Chat Completions that have been stored with
   * the `store` parameter set to `true` will be returned.
   *
   * @example
   * ```ts
   * // Automatically fetches more pages as needed.
   * for await (const chatCompletion of client.chat.completions.list()) {
   *   // ...
   * }
   * ```
   */
  list(e = {}, r) {
    return this._client.getAPIList("/chat/completions", Se, { query: e, ...r });
  }
  /**
   * Delete a stored chat completion. Only Chat Completions that have been created
   * with the `store` parameter set to `true` can be deleted.
   *
   * @example
   * ```ts
   * const chatCompletionDeleted =
   *   await client.chat.completions.delete('completion_id');
   * ```
   */
  delete(e, r) {
    return this._client.delete(j`/chat/completions/${e}`, r);
  }
  parse(e, r) {
    return rT(e.tools), this._client.chat.completions.create(e, {
      ...r,
      headers: {
        ...r == null ? void 0 : r.headers,
        "X-Stainless-Helper-Method": "chat.completions.parse"
      }
    })._thenUnwrap((n) => eu(n, e));
  }
  runTools(e, r) {
    return e.stream ? Ja.runTools(this._client, e, r) : ru.runTools(this._client, e, r);
  }
  /**
   * Creates a chat completion stream
   */
  stream(e, r) {
    return Es.createChatCompletion(this._client, e, r);
  }
};
nu.Messages = pp;
class su extends X {
  constructor() {
    super(...arguments), this.completions = new nu(this._client);
  }
}
su.Completions = nu;
const Dp = /* @__PURE__ */ Symbol("brand.privateNullableHeaders");
function* dT(t) {
  if (!t)
    return;
  if (Dp in t) {
    const { values: n, nulls: s } = t;
    yield* n.entries();
    for (const a of s)
      yield [a, null];
    return;
  }
  let e = !1, r;
  t instanceof Headers ? r = t.entries() : Yd(t) ? r = t : (e = !0, r = Object.entries(t ?? {}));
  for (let n of r) {
    const s = n[0];
    if (typeof s != "string")
      throw new TypeError("expected header name to be a string");
    const a = Yd(n[1]) ? n[1] : [n[1]];
    let o = !1;
    for (const i of a)
      i !== void 0 && (e && !o && (o = !0, yield [s, null]), yield [s, i]);
  }
}
const q = (t) => {
  const e = new Headers(), r = /* @__PURE__ */ new Set();
  for (const n of t) {
    const s = /* @__PURE__ */ new Set();
    for (const [a, o] of dT(n)) {
      const i = a.toLowerCase();
      s.has(i) || (e.delete(a), s.add(i)), o === null ? (e.delete(a), r.add(i)) : (e.append(a, o), r.delete(i));
    }
  }
  return { [Dp]: !0, values: e, nulls: r };
};
class Lp extends X {
  /**
   * Generates audio from the input text.
   *
   * @example
   * ```ts
   * const speech = await client.audio.speech.create({
   *   input: 'input',
   *   model: 'string',
   *   voice: 'ash',
   * });
   *
   * const content = await speech.blob();
   * console.log(content);
   * ```
   */
  create(e, r) {
    return this._client.post("/audio/speech", {
      body: e,
      ...r,
      headers: q([{ Accept: "application/octet-stream" }, r == null ? void 0 : r.headers]),
      __binaryResponse: !0
    });
  }
}
class Fp extends X {
  create(e, r) {
    return this._client.post("/audio/transcriptions", Xr({
      body: e,
      ...r,
      stream: e.stream ?? !1,
      __metadata: { model: e.model }
    }, this._client));
  }
}
class Vp extends X {
  create(e, r) {
    return this._client.post("/audio/translations", Xr({ body: e, ...r, __metadata: { model: e.model } }, this._client));
  }
}
class Cs extends X {
  constructor() {
    super(...arguments), this.transcriptions = new Fp(this._client), this.translations = new Vp(this._client), this.speech = new Lp(this._client);
  }
}
Cs.Transcriptions = Fp;
Cs.Translations = Vp;
Cs.Speech = Lp;
class xp extends X {
  /**
   * Creates and executes a batch from an uploaded file of requests
   */
  create(e, r) {
    return this._client.post("/batches", { body: e, ...r });
  }
  /**
   * Retrieves a batch.
   */
  retrieve(e, r) {
    return this._client.get(j`/batches/${e}`, r);
  }
  /**
   * List your organization's batches.
   */
  list(e = {}, r) {
    return this._client.getAPIList("/batches", Se, { query: e, ...r });
  }
  /**
   * Cancels an in-progress batch. The batch will be in status `cancelling` for up to
   * 10 minutes, before changing to `cancelled`, where it will have partial results
   * (if any) available in the output file.
   */
  cancel(e, r) {
    return this._client.post(j`/batches/${e}/cancel`, r);
  }
}
class Up extends X {
  /**
   * Create an assistant with a model and instructions.
   *
   * @example
   * ```ts
   * const assistant = await client.beta.assistants.create({
   *   model: 'gpt-4o',
   * });
   * ```
   */
  create(e, r) {
    return this._client.post("/assistants", {
      body: e,
      ...r,
      headers: q([{ "OpenAI-Beta": "assistants=v2" }, r == null ? void 0 : r.headers])
    });
  }
  /**
   * Retrieves an assistant.
   *
   * @example
   * ```ts
   * const assistant = await client.beta.assistants.retrieve(
   *   'assistant_id',
   * );
   * ```
   */
  retrieve(e, r) {
    return this._client.get(j`/assistants/${e}`, {
      ...r,
      headers: q([{ "OpenAI-Beta": "assistants=v2" }, r == null ? void 0 : r.headers])
    });
  }
  /**
   * Modifies an assistant.
   *
   * @example
   * ```ts
   * const assistant = await client.beta.assistants.update(
   *   'assistant_id',
   * );
   * ```
   */
  update(e, r, n) {
    return this._client.post(j`/assistants/${e}`, {
      body: r,
      ...n,
      headers: q([{ "OpenAI-Beta": "assistants=v2" }, n == null ? void 0 : n.headers])
    });
  }
  /**
   * Returns a list of assistants.
   *
   * @example
   * ```ts
   * // Automatically fetches more pages as needed.
   * for await (const assistant of client.beta.assistants.list()) {
   *   // ...
   * }
   * ```
   */
  list(e = {}, r) {
    return this._client.getAPIList("/assistants", Se, {
      query: e,
      ...r,
      headers: q([{ "OpenAI-Beta": "assistants=v2" }, r == null ? void 0 : r.headers])
    });
  }
  /**
   * Delete an assistant.
   *
   * @example
   * ```ts
   * const assistantDeleted =
   *   await client.beta.assistants.delete('assistant_id');
   * ```
   */
  delete(e, r) {
    return this._client.delete(j`/assistants/${e}`, {
      ...r,
      headers: q([{ "OpenAI-Beta": "assistants=v2" }, r == null ? void 0 : r.headers])
    });
  }
}
let qp = class extends X {
  /**
   * Create an ephemeral API token for use in client-side applications with the
   * Realtime API. Can be configured with the same session parameters as the
   * `session.update` client event.
   *
   * It responds with a session object, plus a `client_secret` key which contains a
   * usable ephemeral API token that can be used to authenticate browser clients for
   * the Realtime API.
   *
   * @example
   * ```ts
   * const session =
   *   await client.beta.realtime.sessions.create();
   * ```
   */
  create(e, r) {
    return this._client.post("/realtime/sessions", {
      body: e,
      ...r,
      headers: q([{ "OpenAI-Beta": "assistants=v2" }, r == null ? void 0 : r.headers])
    });
  }
};
class zp extends X {
  /**
   * Create an ephemeral API token for use in client-side applications with the
   * Realtime API specifically for realtime transcriptions. Can be configured with
   * the same session parameters as the `transcription_session.update` client event.
   *
   * It responds with a session object, plus a `client_secret` key which contains a
   * usable ephemeral API token that can be used to authenticate browser clients for
   * the Realtime API.
   *
   * @example
   * ```ts
   * const transcriptionSession =
   *   await client.beta.realtime.transcriptionSessions.create();
   * ```
   */
  create(e, r) {
    return this._client.post("/realtime/transcription_sessions", {
      body: e,
      ...r,
      headers: q([{ "OpenAI-Beta": "assistants=v2" }, r == null ? void 0 : r.headers])
    });
  }
}
let Po = class extends X {
  constructor() {
    super(...arguments), this.sessions = new qp(this._client), this.transcriptionSessions = new zp(this._client);
  }
};
Po.Sessions = qp;
Po.TranscriptionSessions = zp;
class Kp extends X {
  /**
   * Create a ChatKit session
   *
   * @example
   * ```ts
   * const chatSession =
   *   await client.beta.chatkit.sessions.create({
   *     user: 'x',
   *     workflow: { id: 'id' },
   *   });
   * ```
   */
  create(e, r) {
    return this._client.post("/chatkit/sessions", {
      body: e,
      ...r,
      headers: q([{ "OpenAI-Beta": "chatkit_beta=v1" }, r == null ? void 0 : r.headers])
    });
  }
  /**
   * Cancel a ChatKit session
   *
   * @example
   * ```ts
   * const chatSession =
   *   await client.beta.chatkit.sessions.cancel('cksess_123');
   * ```
   */
  cancel(e, r) {
    return this._client.post(j`/chatkit/sessions/${e}/cancel`, {
      ...r,
      headers: q([{ "OpenAI-Beta": "chatkit_beta=v1" }, r == null ? void 0 : r.headers])
    });
  }
}
let Gp = class extends X {
  /**
   * Retrieve a ChatKit thread
   *
   * @example
   * ```ts
   * const chatkitThread =
   *   await client.beta.chatkit.threads.retrieve('cthr_123');
   * ```
   */
  retrieve(e, r) {
    return this._client.get(j`/chatkit/threads/${e}`, {
      ...r,
      headers: q([{ "OpenAI-Beta": "chatkit_beta=v1" }, r == null ? void 0 : r.headers])
    });
  }
  /**
   * List ChatKit threads
   *
   * @example
   * ```ts
   * // Automatically fetches more pages as needed.
   * for await (const chatkitThread of client.beta.chatkit.threads.list()) {
   *   // ...
   * }
   * ```
   */
  list(e = {}, r) {
    return this._client.getAPIList("/chatkit/threads", za, {
      query: e,
      ...r,
      headers: q([{ "OpenAI-Beta": "chatkit_beta=v1" }, r == null ? void 0 : r.headers])
    });
  }
  /**
   * Delete a ChatKit thread
   *
   * @example
   * ```ts
   * const thread = await client.beta.chatkit.threads.delete(
   *   'cthr_123',
   * );
   * ```
   */
  delete(e, r) {
    return this._client.delete(j`/chatkit/threads/${e}`, {
      ...r,
      headers: q([{ "OpenAI-Beta": "chatkit_beta=v1" }, r == null ? void 0 : r.headers])
    });
  }
  /**
   * List ChatKit thread items
   *
   * @example
   * ```ts
   * // Automatically fetches more pages as needed.
   * for await (const thread of client.beta.chatkit.threads.listItems(
   *   'cthr_123',
   * )) {
   *   // ...
   * }
   * ```
   */
  listItems(e, r = {}, n) {
    return this._client.getAPIList(j`/chatkit/threads/${e}/items`, za, { query: r, ...n, headers: q([{ "OpenAI-Beta": "chatkit_beta=v1" }, n == null ? void 0 : n.headers]) });
  }
};
class Ro extends X {
  constructor() {
    super(...arguments), this.sessions = new Kp(this._client), this.threads = new Gp(this._client);
  }
}
Ro.Sessions = Kp;
Ro.Threads = Gp;
class Bp extends X {
  /**
   * Create a message.
   *
   * @deprecated The Assistants API is deprecated in favor of the Responses API
   */
  create(e, r, n) {
    return this._client.post(j`/threads/${e}/messages`, {
      body: r,
      ...n,
      headers: q([{ "OpenAI-Beta": "assistants=v2" }, n == null ? void 0 : n.headers])
    });
  }
  /**
   * Retrieve a message.
   *
   * @deprecated The Assistants API is deprecated in favor of the Responses API
   */
  retrieve(e, r, n) {
    const { thread_id: s } = r;
    return this._client.get(j`/threads/${s}/messages/${e}`, {
      ...n,
      headers: q([{ "OpenAI-Beta": "assistants=v2" }, n == null ? void 0 : n.headers])
    });
  }
  /**
   * Modifies a message.
   *
   * @deprecated The Assistants API is deprecated in favor of the Responses API
   */
  update(e, r, n) {
    const { thread_id: s, ...a } = r;
    return this._client.post(j`/threads/${s}/messages/${e}`, {
      body: a,
      ...n,
      headers: q([{ "OpenAI-Beta": "assistants=v2" }, n == null ? void 0 : n.headers])
    });
  }
  /**
   * Returns a list of messages for a given thread.
   *
   * @deprecated The Assistants API is deprecated in favor of the Responses API
   */
  list(e, r = {}, n) {
    return this._client.getAPIList(j`/threads/${e}/messages`, Se, {
      query: r,
      ...n,
      headers: q([{ "OpenAI-Beta": "assistants=v2" }, n == null ? void 0 : n.headers])
    });
  }
  /**
   * Deletes a message.
   *
   * @deprecated The Assistants API is deprecated in favor of the Responses API
   */
  delete(e, r, n) {
    const { thread_id: s } = r;
    return this._client.delete(j`/threads/${s}/messages/${e}`, {
      ...n,
      headers: q([{ "OpenAI-Beta": "assistants=v2" }, n == null ? void 0 : n.headers])
    });
  }
}
class Hp extends X {
  /**
   * Retrieves a run step.
   *
   * @deprecated The Assistants API is deprecated in favor of the Responses API
   */
  retrieve(e, r, n) {
    const { thread_id: s, run_id: a, ...o } = r;
    return this._client.get(j`/threads/${s}/runs/${a}/steps/${e}`, {
      query: o,
      ...n,
      headers: q([{ "OpenAI-Beta": "assistants=v2" }, n == null ? void 0 : n.headers])
    });
  }
  /**
   * Returns a list of run steps belonging to a run.
   *
   * @deprecated The Assistants API is deprecated in favor of the Responses API
   */
  list(e, r, n) {
    const { thread_id: s, ...a } = r;
    return this._client.getAPIList(j`/threads/${s}/runs/${e}/steps`, Se, {
      query: a,
      ...n,
      headers: q([{ "OpenAI-Beta": "assistants=v2" }, n == null ? void 0 : n.headers])
    });
  }
}
const fT = (t) => {
  if (typeof Buffer < "u") {
    const e = Buffer.from(t, "base64");
    return Array.from(new Float32Array(e.buffer, e.byteOffset, e.length / Float32Array.BYTES_PER_ELEMENT));
  } else {
    const e = atob(t), r = e.length, n = new Uint8Array(r);
    for (let s = 0; s < r; s++)
      n[s] = e.charCodeAt(s);
    return Array.from(new Float32Array(n.buffer));
  }
}, sn = (t) => {
  var e, r, n, s, a;
  if (typeof globalThis.process < "u")
    return ((r = (e = globalThis.process.env) == null ? void 0 : e[t]) == null ? void 0 : r.trim()) ?? void 0;
  if (typeof globalThis.Deno < "u")
    return (a = (s = (n = globalThis.Deno.env) == null ? void 0 : n.get) == null ? void 0 : s.call(n, t)) == null ? void 0 : a.trim();
};
var De, qr, qi, Tt, Ra, _t, zr, pn, Ur, Xa, it, Oa, Ia, gs, ss, as, pf, yf, $f, gf, _f, vf, wf;
class _s extends tu {
  constructor() {
    super(...arguments), De.add(this), qi.set(this, []), Tt.set(this, {}), Ra.set(this, {}), _t.set(this, void 0), zr.set(this, void 0), pn.set(this, void 0), Ur.set(this, void 0), Xa.set(this, void 0), it.set(this, void 0), Oa.set(this, void 0), Ia.set(this, void 0), gs.set(this, void 0);
  }
  [(qi = /* @__PURE__ */ new WeakMap(), Tt = /* @__PURE__ */ new WeakMap(), Ra = /* @__PURE__ */ new WeakMap(), _t = /* @__PURE__ */ new WeakMap(), zr = /* @__PURE__ */ new WeakMap(), pn = /* @__PURE__ */ new WeakMap(), Ur = /* @__PURE__ */ new WeakMap(), Xa = /* @__PURE__ */ new WeakMap(), it = /* @__PURE__ */ new WeakMap(), Oa = /* @__PURE__ */ new WeakMap(), Ia = /* @__PURE__ */ new WeakMap(), gs = /* @__PURE__ */ new WeakMap(), De = /* @__PURE__ */ new WeakSet(), Symbol.asyncIterator)]() {
    const e = [], r = [];
    let n = !1;
    return this.on("event", (s) => {
      const a = r.shift();
      a ? a.resolve(s) : e.push(s);
    }), this.on("end", () => {
      n = !0;
      for (const s of r)
        s.resolve(void 0);
      r.length = 0;
    }), this.on("abort", (s) => {
      n = !0;
      for (const a of r)
        a.reject(s);
      r.length = 0;
    }), this.on("error", (s) => {
      n = !0;
      for (const a of r)
        a.reject(s);
      r.length = 0;
    }), {
      next: async () => e.length ? { value: e.shift(), done: !1 } : n ? { value: void 0, done: !0 } : new Promise((a, o) => r.push({ resolve: a, reject: o })).then((a) => a ? { value: a, done: !1 } : { value: void 0, done: !0 }),
      return: async () => (this.abort(), { value: void 0, done: !0 })
    };
  }
  static fromReadableStream(e) {
    const r = new qr();
    return r._run(() => r._fromReadableStream(e)), r;
  }
  async _fromReadableStream(e, r) {
    var a;
    const n = r == null ? void 0 : r.signal;
    n && (n.aborted && this.controller.abort(), n.addEventListener("abort", () => this.controller.abort())), this._connected();
    const s = Lt.fromReadableStream(e, this.controller);
    for await (const o of s)
      I(this, De, "m", ss).call(this, o);
    if ((a = s.controller.signal) != null && a.aborted)
      throw new ft();
    return this._addRun(I(this, De, "m", as).call(this));
  }
  toReadableStream() {
    return new Lt(this[Symbol.asyncIterator].bind(this), this.controller).toReadableStream();
  }
  static createToolAssistantStream(e, r, n, s) {
    const a = new qr();
    return a._run(() => a._runToolAssistantStream(e, r, n, {
      ...s,
      headers: { ...s == null ? void 0 : s.headers, "X-Stainless-Helper-Method": "stream" }
    })), a;
  }
  async _createToolAssistantStream(e, r, n, s) {
    var c;
    const a = s == null ? void 0 : s.signal;
    a && (a.aborted && this.controller.abort(), a.addEventListener("abort", () => this.controller.abort()));
    const o = { ...n, stream: !0 }, i = await e.submitToolOutputs(r, o, {
      ...s,
      signal: this.controller.signal
    });
    this._connected();
    for await (const d of i)
      I(this, De, "m", ss).call(this, d);
    if ((c = i.controller.signal) != null && c.aborted)
      throw new ft();
    return this._addRun(I(this, De, "m", as).call(this));
  }
  static createThreadAssistantStream(e, r, n) {
    const s = new qr();
    return s._run(() => s._threadAssistantStream(e, r, {
      ...n,
      headers: { ...n == null ? void 0 : n.headers, "X-Stainless-Helper-Method": "stream" }
    })), s;
  }
  static createAssistantStream(e, r, n, s) {
    const a = new qr();
    return a._run(() => a._runAssistantStream(e, r, n, {
      ...s,
      headers: { ...s == null ? void 0 : s.headers, "X-Stainless-Helper-Method": "stream" }
    })), a;
  }
  currentEvent() {
    return I(this, Oa, "f");
  }
  currentRun() {
    return I(this, Ia, "f");
  }
  currentMessageSnapshot() {
    return I(this, _t, "f");
  }
  currentRunStepSnapshot() {
    return I(this, gs, "f");
  }
  async finalRunSteps() {
    return await this.done(), Object.values(I(this, Tt, "f"));
  }
  async finalMessages() {
    return await this.done(), Object.values(I(this, Ra, "f"));
  }
  async finalRun() {
    if (await this.done(), !I(this, zr, "f"))
      throw Error("Final run was not received.");
    return I(this, zr, "f");
  }
  async _createThreadAssistantStream(e, r, n) {
    var i;
    const s = n == null ? void 0 : n.signal;
    s && (s.aborted && this.controller.abort(), s.addEventListener("abort", () => this.controller.abort()));
    const a = { ...r, stream: !0 }, o = await e.createAndRun(a, { ...n, signal: this.controller.signal });
    this._connected();
    for await (const c of o)
      I(this, De, "m", ss).call(this, c);
    if ((i = o.controller.signal) != null && i.aborted)
      throw new ft();
    return this._addRun(I(this, De, "m", as).call(this));
  }
  async _createAssistantStream(e, r, n, s) {
    var c;
    const a = s == null ? void 0 : s.signal;
    a && (a.aborted && this.controller.abort(), a.addEventListener("abort", () => this.controller.abort()));
    const o = { ...n, stream: !0 }, i = await e.create(r, o, { ...s, signal: this.controller.signal });
    this._connected();
    for await (const d of i)
      I(this, De, "m", ss).call(this, d);
    if ((c = i.controller.signal) != null && c.aborted)
      throw new ft();
    return this._addRun(I(this, De, "m", as).call(this));
  }
  static accumulateDelta(e, r) {
    for (const [n, s] of Object.entries(r)) {
      if (!e.hasOwnProperty(n)) {
        e[n] = s;
        continue;
      }
      let a = e[n];
      if (a == null) {
        e[n] = s;
        continue;
      }
      if (n === "index" || n === "type") {
        e[n] = s;
        continue;
      }
      if (typeof a == "string" && typeof s == "string")
        a += s;
      else if (typeof a == "number" && typeof s == "number")
        a += s;
      else if (si(a) && si(s))
        a = this.accumulateDelta(a, s);
      else if (Array.isArray(a) && Array.isArray(s)) {
        if (a.every((o) => typeof o == "string" || typeof o == "number")) {
          a.push(...s);
          continue;
        }
        for (const o of s) {
          if (!si(o))
            throw new Error(`Expected array delta entry to be an object but got: ${o}`);
          const i = o.index;
          if (i == null)
            throw console.error(o), new Error("Expected array delta entry to have an `index` property");
          if (typeof i != "number")
            throw new Error(`Expected array delta entry \`index\` property to be a number but got ${i}`);
          const c = a[i];
          c == null ? a.push(o) : a[i] = this.accumulateDelta(c, o);
        }
        continue;
      } else
        throw Error(`Unhandled record type: ${n}, deltaValue: ${s}, accValue: ${a}`);
      e[n] = a;
    }
    return e;
  }
  _addRun(e) {
    return e;
  }
  async _threadAssistantStream(e, r, n) {
    return await this._createThreadAssistantStream(r, e, n);
  }
  async _runAssistantStream(e, r, n, s) {
    return await this._createAssistantStream(r, e, n, s);
  }
  async _runToolAssistantStream(e, r, n, s) {
    return await this._createToolAssistantStream(r, e, n, s);
  }
}
qr = _s, ss = function(e) {
  if (!this.ended)
    switch (Q(this, Oa, e), I(this, De, "m", $f).call(this, e), e.event) {
      case "thread.created":
        break;
      case "thread.run.created":
      case "thread.run.queued":
      case "thread.run.in_progress":
      case "thread.run.requires_action":
      case "thread.run.completed":
      case "thread.run.incomplete":
      case "thread.run.failed":
      case "thread.run.cancelling":
      case "thread.run.cancelled":
      case "thread.run.expired":
        I(this, De, "m", wf).call(this, e);
        break;
      case "thread.run.step.created":
      case "thread.run.step.in_progress":
      case "thread.run.step.delta":
      case "thread.run.step.completed":
      case "thread.run.step.failed":
      case "thread.run.step.cancelled":
      case "thread.run.step.expired":
        I(this, De, "m", yf).call(this, e);
        break;
      case "thread.message.created":
      case "thread.message.in_progress":
      case "thread.message.delta":
      case "thread.message.completed":
      case "thread.message.incomplete":
        I(this, De, "m", pf).call(this, e);
        break;
      case "error":
        throw new Error("Encountered an error event in event processing - errors should be processed earlier");
    }
}, as = function() {
  if (this.ended)
    throw new Y("stream has ended, this shouldn't happen");
  if (!I(this, zr, "f"))
    throw Error("Final run has not been received");
  return I(this, zr, "f");
}, pf = function(e) {
  const [r, n] = I(this, De, "m", _f).call(this, e, I(this, _t, "f"));
  Q(this, _t, r), I(this, Ra, "f")[r.id] = r;
  for (const s of n) {
    const a = r.content[s.index];
    (a == null ? void 0 : a.type) == "text" && this._emit("textCreated", a.text);
  }
  switch (e.event) {
    case "thread.message.created":
      this._emit("messageCreated", e.data);
      break;
    case "thread.message.in_progress":
      break;
    case "thread.message.delta":
      if (this._emit("messageDelta", e.data.delta, r), e.data.delta.content)
        for (const s of e.data.delta.content) {
          if (s.type == "text" && s.text) {
            let a = s.text, o = r.content[s.index];
            if (o && o.type == "text")
              this._emit("textDelta", a, o.text);
            else
              throw Error("The snapshot associated with this text delta is not text or missing");
          }
          if (s.index != I(this, pn, "f")) {
            if (I(this, Ur, "f"))
              switch (I(this, Ur, "f").type) {
                case "text":
                  this._emit("textDone", I(this, Ur, "f").text, I(this, _t, "f"));
                  break;
                case "image_file":
                  this._emit("imageFileDone", I(this, Ur, "f").image_file, I(this, _t, "f"));
                  break;
              }
            Q(this, pn, s.index);
          }
          Q(this, Ur, r.content[s.index]);
        }
      break;
    case "thread.message.completed":
    case "thread.message.incomplete":
      if (I(this, pn, "f") !== void 0) {
        const s = e.data.content[I(this, pn, "f")];
        if (s)
          switch (s.type) {
            case "image_file":
              this._emit("imageFileDone", s.image_file, I(this, _t, "f"));
              break;
            case "text":
              this._emit("textDone", s.text, I(this, _t, "f"));
              break;
          }
      }
      I(this, _t, "f") && this._emit("messageDone", e.data), Q(this, _t, void 0);
  }
}, yf = function(e) {
  const r = I(this, De, "m", gf).call(this, e);
  switch (Q(this, gs, r), e.event) {
    case "thread.run.step.created":
      this._emit("runStepCreated", e.data);
      break;
    case "thread.run.step.delta":
      const n = e.data.delta;
      if (n.step_details && n.step_details.type == "tool_calls" && n.step_details.tool_calls && r.step_details.type == "tool_calls")
        for (const a of n.step_details.tool_calls)
          a.index == I(this, Xa, "f") ? this._emit("toolCallDelta", a, r.step_details.tool_calls[a.index]) : (I(this, it, "f") && this._emit("toolCallDone", I(this, it, "f")), Q(this, Xa, a.index), Q(this, it, r.step_details.tool_calls[a.index]), I(this, it, "f") && this._emit("toolCallCreated", I(this, it, "f")));
      this._emit("runStepDelta", e.data.delta, r);
      break;
    case "thread.run.step.completed":
    case "thread.run.step.failed":
    case "thread.run.step.cancelled":
    case "thread.run.step.expired":
      Q(this, gs, void 0), e.data.step_details.type == "tool_calls" && I(this, it, "f") && (this._emit("toolCallDone", I(this, it, "f")), Q(this, it, void 0)), this._emit("runStepDone", e.data, r);
      break;
  }
}, $f = function(e) {
  I(this, qi, "f").push(e), this._emit("event", e);
}, gf = function(e) {
  switch (e.event) {
    case "thread.run.step.created":
      return I(this, Tt, "f")[e.data.id] = e.data, e.data;
    case "thread.run.step.delta":
      let r = I(this, Tt, "f")[e.data.id];
      if (!r)
        throw Error("Received a RunStepDelta before creation of a snapshot");
      let n = e.data;
      if (n.delta) {
        const s = qr.accumulateDelta(r, n.delta);
        I(this, Tt, "f")[e.data.id] = s;
      }
      return I(this, Tt, "f")[e.data.id];
    case "thread.run.step.completed":
    case "thread.run.step.failed":
    case "thread.run.step.cancelled":
    case "thread.run.step.expired":
    case "thread.run.step.in_progress":
      I(this, Tt, "f")[e.data.id] = e.data;
      break;
  }
  if (I(this, Tt, "f")[e.data.id])
    return I(this, Tt, "f")[e.data.id];
  throw new Error("No snapshot available");
}, _f = function(e, r) {
  let n = [];
  switch (e.event) {
    case "thread.message.created":
      return [e.data, n];
    case "thread.message.delta":
      if (!r)
        throw Error("Received a delta with no existing snapshot (there should be one from message creation)");
      let s = e.data;
      if (s.delta.content)
        for (const a of s.delta.content)
          if (a.index in r.content) {
            let o = r.content[a.index];
            r.content[a.index] = I(this, De, "m", vf).call(this, a, o);
          } else
            r.content[a.index] = a, n.push(a);
      return [r, n];
    case "thread.message.in_progress":
    case "thread.message.completed":
    case "thread.message.incomplete":
      if (r)
        return [r, n];
      throw Error("Received thread message event with no existing snapshot");
  }
  throw Error("Tried to accumulate a non-message event");
}, vf = function(e, r) {
  return qr.accumulateDelta(r, e);
}, wf = function(e) {
  switch (Q(this, Ia, e.data), e.event) {
    case "thread.run.created":
      break;
    case "thread.run.queued":
      break;
    case "thread.run.in_progress":
      break;
    case "thread.run.requires_action":
    case "thread.run.cancelled":
    case "thread.run.failed":
    case "thread.run.completed":
    case "thread.run.expired":
    case "thread.run.incomplete":
      Q(this, zr, e.data), I(this, it, "f") && (this._emit("toolCallDone", I(this, it, "f")), Q(this, it, void 0));
      break;
  }
};
let au = class extends X {
  constructor() {
    super(...arguments), this.steps = new Hp(this._client);
  }
  create(e, r, n) {
    const { include: s, ...a } = r;
    return this._client.post(j`/threads/${e}/runs`, {
      query: { include: s },
      body: a,
      ...n,
      headers: q([{ "OpenAI-Beta": "assistants=v2" }, n == null ? void 0 : n.headers]),
      stream: r.stream ?? !1
    });
  }
  /**
   * Retrieves a run.
   *
   * @deprecated The Assistants API is deprecated in favor of the Responses API
   */
  retrieve(e, r, n) {
    const { thread_id: s } = r;
    return this._client.get(j`/threads/${s}/runs/${e}`, {
      ...n,
      headers: q([{ "OpenAI-Beta": "assistants=v2" }, n == null ? void 0 : n.headers])
    });
  }
  /**
   * Modifies a run.
   *
   * @deprecated The Assistants API is deprecated in favor of the Responses API
   */
  update(e, r, n) {
    const { thread_id: s, ...a } = r;
    return this._client.post(j`/threads/${s}/runs/${e}`, {
      body: a,
      ...n,
      headers: q([{ "OpenAI-Beta": "assistants=v2" }, n == null ? void 0 : n.headers])
    });
  }
  /**
   * Returns a list of runs belonging to a thread.
   *
   * @deprecated The Assistants API is deprecated in favor of the Responses API
   */
  list(e, r = {}, n) {
    return this._client.getAPIList(j`/threads/${e}/runs`, Se, {
      query: r,
      ...n,
      headers: q([{ "OpenAI-Beta": "assistants=v2" }, n == null ? void 0 : n.headers])
    });
  }
  /**
   * Cancels a run that is `in_progress`.
   *
   * @deprecated The Assistants API is deprecated in favor of the Responses API
   */
  cancel(e, r, n) {
    const { thread_id: s } = r;
    return this._client.post(j`/threads/${s}/runs/${e}/cancel`, {
      ...n,
      headers: q([{ "OpenAI-Beta": "assistants=v2" }, n == null ? void 0 : n.headers])
    });
  }
  /**
   * A helper to create a run an poll for a terminal state. More information on Run
   * lifecycles can be found here:
   * https://platform.openai.com/docs/assistants/how-it-works/runs-and-run-steps
   */
  async createAndPoll(e, r, n) {
    const s = await this.create(e, r, n);
    return await this.poll(s.id, { thread_id: e }, n);
  }
  /**
   * Create a Run stream
   *
   * @deprecated use `stream` instead
   */
  createAndStream(e, r, n) {
    return _s.createAssistantStream(e, this._client.beta.threads.runs, r, n);
  }
  /**
   * A helper to poll a run status until it reaches a terminal state. More
   * information on Run lifecycles can be found here:
   * https://platform.openai.com/docs/assistants/how-it-works/runs-and-run-steps
   */
  async poll(e, r, n) {
    var a;
    const s = q([
      n == null ? void 0 : n.headers,
      {
        "X-Stainless-Poll-Helper": "true",
        "X-Stainless-Custom-Poll-Interval": ((a = n == null ? void 0 : n.pollIntervalMs) == null ? void 0 : a.toString()) ?? void 0
      }
    ]);
    for (; ; ) {
      const { data: o, response: i } = await this.retrieve(e, r, {
        ...n,
        headers: { ...n == null ? void 0 : n.headers, ...s }
      }).withResponse();
      switch (o.status) {
        case "queued":
        case "in_progress":
        case "cancelling":
          let c = 5e3;
          if (n != null && n.pollIntervalMs)
            c = n.pollIntervalMs;
          else {
            const d = i.headers.get("openai-poll-after-ms");
            if (d) {
              const l = parseInt(d);
              isNaN(l) || (c = l);
            }
          }
          await ks(c);
          break;
        case "requires_action":
        case "incomplete":
        case "cancelled":
        case "completed":
        case "failed":
        case "expired":
          return o;
      }
    }
  }
  /**
   * Create a Run stream
   */
  stream(e, r, n) {
    return _s.createAssistantStream(e, this._client.beta.threads.runs, r, n);
  }
  submitToolOutputs(e, r, n) {
    const { thread_id: s, ...a } = r;
    return this._client.post(j`/threads/${s}/runs/${e}/submit_tool_outputs`, {
      body: a,
      ...n,
      headers: q([{ "OpenAI-Beta": "assistants=v2" }, n == null ? void 0 : n.headers]),
      stream: r.stream ?? !1
    });
  }
  /**
   * A helper to submit a tool output to a run and poll for a terminal run state.
   * More information on Run lifecycles can be found here:
   * https://platform.openai.com/docs/assistants/how-it-works/runs-and-run-steps
   */
  async submitToolOutputsAndPoll(e, r, n) {
    const s = await this.submitToolOutputs(e, r, n);
    return await this.poll(s.id, r, n);
  }
  /**
   * Submit the tool outputs from a previous run and stream the run to a terminal
   * state. More information on Run lifecycles can be found here:
   * https://platform.openai.com/docs/assistants/how-it-works/runs-and-run-steps
   */
  submitToolOutputsStream(e, r, n) {
    return _s.createToolAssistantStream(e, this._client.beta.threads.runs, r, n);
  }
};
au.Steps = Hp;
class Oo extends X {
  constructor() {
    super(...arguments), this.runs = new au(this._client), this.messages = new Bp(this._client);
  }
  /**
   * Create a thread.
   *
   * @deprecated The Assistants API is deprecated in favor of the Responses API
   */
  create(e = {}, r) {
    return this._client.post("/threads", {
      body: e,
      ...r,
      headers: q([{ "OpenAI-Beta": "assistants=v2" }, r == null ? void 0 : r.headers])
    });
  }
  /**
   * Retrieves a thread.
   *
   * @deprecated The Assistants API is deprecated in favor of the Responses API
   */
  retrieve(e, r) {
    return this._client.get(j`/threads/${e}`, {
      ...r,
      headers: q([{ "OpenAI-Beta": "assistants=v2" }, r == null ? void 0 : r.headers])
    });
  }
  /**
   * Modifies a thread.
   *
   * @deprecated The Assistants API is deprecated in favor of the Responses API
   */
  update(e, r, n) {
    return this._client.post(j`/threads/${e}`, {
      body: r,
      ...n,
      headers: q([{ "OpenAI-Beta": "assistants=v2" }, n == null ? void 0 : n.headers])
    });
  }
  /**
   * Delete a thread.
   *
   * @deprecated The Assistants API is deprecated in favor of the Responses API
   */
  delete(e, r) {
    return this._client.delete(j`/threads/${e}`, {
      ...r,
      headers: q([{ "OpenAI-Beta": "assistants=v2" }, r == null ? void 0 : r.headers])
    });
  }
  createAndRun(e, r) {
    return this._client.post("/threads/runs", {
      body: e,
      ...r,
      headers: q([{ "OpenAI-Beta": "assistants=v2" }, r == null ? void 0 : r.headers]),
      stream: e.stream ?? !1
    });
  }
  /**
   * A helper to create a thread, start a run and then poll for a terminal state.
   * More information on Run lifecycles can be found here:
   * https://platform.openai.com/docs/assistants/how-it-works/runs-and-run-steps
   */
  async createAndRunPoll(e, r) {
    const n = await this.createAndRun(e, r);
    return await this.runs.poll(n.id, { thread_id: n.thread_id }, r);
  }
  /**
   * Create a thread and stream the run back
   */
  createAndRunStream(e, r) {
    return _s.createThreadAssistantStream(e, this._client.beta.threads, r);
  }
}
Oo.Runs = au;
Oo.Messages = Bp;
class Dn extends X {
  constructor() {
    super(...arguments), this.realtime = new Po(this._client), this.chatkit = new Ro(this._client), this.assistants = new Up(this._client), this.threads = new Oo(this._client);
  }
}
Dn.Realtime = Po;
Dn.ChatKit = Ro;
Dn.Assistants = Up;
Dn.Threads = Oo;
class Wp extends X {
  create(e, r) {
    return this._client.post("/completions", { body: e, ...r, stream: e.stream ?? !1 });
  }
}
class Jp extends X {
  /**
   * Retrieve Container File Content
   */
  retrieve(e, r, n) {
    const { container_id: s } = r;
    return this._client.get(j`/containers/${s}/files/${e}/content`, {
      ...n,
      headers: q([{ Accept: "application/binary" }, n == null ? void 0 : n.headers]),
      __binaryResponse: !0
    });
  }
}
let ou = class extends X {
  constructor() {
    super(...arguments), this.content = new Jp(this._client);
  }
  /**
   * Create a Container File
   *
   * You can send either a multipart/form-data request with the raw file content, or
   * a JSON request with a file ID.
   */
  create(e, r, n) {
    return this._client.post(j`/containers/${e}/files`, Xr({ body: r, ...n }, this._client));
  }
  /**
   * Retrieve Container File
   */
  retrieve(e, r, n) {
    const { container_id: s } = r;
    return this._client.get(j`/containers/${s}/files/${e}`, n);
  }
  /**
   * List Container files
   */
  list(e, r = {}, n) {
    return this._client.getAPIList(j`/containers/${e}/files`, Se, {
      query: r,
      ...n
    });
  }
  /**
   * Delete Container File
   */
  delete(e, r, n) {
    const { container_id: s } = r;
    return this._client.delete(j`/containers/${s}/files/${e}`, {
      ...n,
      headers: q([{ Accept: "*/*" }, n == null ? void 0 : n.headers])
    });
  }
};
ou.Content = Jp;
class iu extends X {
  constructor() {
    super(...arguments), this.files = new ou(this._client);
  }
  /**
   * Create Container
   */
  create(e, r) {
    return this._client.post("/containers", { body: e, ...r });
  }
  /**
   * Retrieve Container
   */
  retrieve(e, r) {
    return this._client.get(j`/containers/${e}`, r);
  }
  /**
   * List Containers
   */
  list(e = {}, r) {
    return this._client.getAPIList("/containers", Se, { query: e, ...r });
  }
  /**
   * Delete Container
   */
  delete(e, r) {
    return this._client.delete(j`/containers/${e}`, {
      ...r,
      headers: q([{ Accept: "*/*" }, r == null ? void 0 : r.headers])
    });
  }
}
iu.Files = ou;
class Xp extends X {
  /**
   * Create items in a conversation with the given ID.
   */
  create(e, r, n) {
    const { include: s, ...a } = r;
    return this._client.post(j`/conversations/${e}/items`, {
      query: { include: s },
      body: a,
      ...n
    });
  }
  /**
   * Get a single item from a conversation with the given IDs.
   */
  retrieve(e, r, n) {
    const { conversation_id: s, ...a } = r;
    return this._client.get(j`/conversations/${s}/items/${e}`, { query: a, ...n });
  }
  /**
   * List all items for a conversation with the given ID.
   */
  list(e, r = {}, n) {
    return this._client.getAPIList(j`/conversations/${e}/items`, za, { query: r, ...n });
  }
  /**
   * Delete an item from a conversation with the given IDs.
   */
  delete(e, r, n) {
    const { conversation_id: s } = r;
    return this._client.delete(j`/conversations/${s}/items/${e}`, n);
  }
}
class cu extends X {
  constructor() {
    super(...arguments), this.items = new Xp(this._client);
  }
  /**
   * Create a conversation.
   */
  create(e = {}, r) {
    return this._client.post("/conversations", { body: e, ...r });
  }
  /**
   * Get a conversation
   */
  retrieve(e, r) {
    return this._client.get(j`/conversations/${e}`, r);
  }
  /**
   * Update a conversation
   */
  update(e, r, n) {
    return this._client.post(j`/conversations/${e}`, { body: r, ...n });
  }
  /**
   * Delete a conversation. Items in the conversation will not be deleted.
   */
  delete(e, r) {
    return this._client.delete(j`/conversations/${e}`, r);
  }
}
cu.Items = Xp;
class Yp extends X {
  /**
   * Creates an embedding vector representing the input text.
   *
   * @example
   * ```ts
   * const createEmbeddingResponse =
   *   await client.embeddings.create({
   *     input: 'The quick brown fox jumped over the lazy dog',
   *     model: 'text-embedding-3-small',
   *   });
   * ```
   */
  create(e, r) {
    const n = !!e.encoding_format;
    let s = n ? e.encoding_format : "base64";
    n && Me(this._client).debug("embeddings/user defined encoding_format:", e.encoding_format);
    const a = this._client.post("/embeddings", {
      body: {
        ...e,
        encoding_format: s
      },
      ...r
    });
    return n ? a : (Me(this._client).debug("embeddings/decoding base64 embeddings from base64"), a._thenUnwrap((o) => (o && o.data && o.data.forEach((i) => {
      const c = i.embedding;
      i.embedding = fT(c);
    }), o)));
  }
}
class Qp extends X {
  /**
   * Get an evaluation run output item by ID.
   */
  retrieve(e, r, n) {
    const { eval_id: s, run_id: a } = r;
    return this._client.get(j`/evals/${s}/runs/${a}/output_items/${e}`, n);
  }
  /**
   * Get a list of output items for an evaluation run.
   */
  list(e, r, n) {
    const { eval_id: s, ...a } = r;
    return this._client.getAPIList(j`/evals/${s}/runs/${e}/output_items`, Se, { query: a, ...n });
  }
}
class lu extends X {
  constructor() {
    super(...arguments), this.outputItems = new Qp(this._client);
  }
  /**
   * Kicks off a new run for a given evaluation, specifying the data source, and what
   * model configuration to use to test. The datasource will be validated against the
   * schema specified in the config of the evaluation.
   */
  create(e, r, n) {
    return this._client.post(j`/evals/${e}/runs`, { body: r, ...n });
  }
  /**
   * Get an evaluation run by ID.
   */
  retrieve(e, r, n) {
    const { eval_id: s } = r;
    return this._client.get(j`/evals/${s}/runs/${e}`, n);
  }
  /**
   * Get a list of runs for an evaluation.
   */
  list(e, r = {}, n) {
    return this._client.getAPIList(j`/evals/${e}/runs`, Se, {
      query: r,
      ...n
    });
  }
  /**
   * Delete an eval run.
   */
  delete(e, r, n) {
    const { eval_id: s } = r;
    return this._client.delete(j`/evals/${s}/runs/${e}`, n);
  }
  /**
   * Cancel an ongoing evaluation run.
   */
  cancel(e, r, n) {
    const { eval_id: s } = r;
    return this._client.post(j`/evals/${s}/runs/${e}`, n);
  }
}
lu.OutputItems = Qp;
class uu extends X {
  constructor() {
    super(...arguments), this.runs = new lu(this._client);
  }
  /**
   * Create the structure of an evaluation that can be used to test a model's
   * performance. An evaluation is a set of testing criteria and the config for a
   * data source, which dictates the schema of the data used in the evaluation. After
   * creating an evaluation, you can run it on different models and model parameters.
   * We support several types of graders and datasources. For more information, see
   * the [Evals guide](https://platform.openai.com/docs/guides/evals).
   */
  create(e, r) {
    return this._client.post("/evals", { body: e, ...r });
  }
  /**
   * Get an evaluation by ID.
   */
  retrieve(e, r) {
    return this._client.get(j`/evals/${e}`, r);
  }
  /**
   * Update certain properties of an evaluation.
   */
  update(e, r, n) {
    return this._client.post(j`/evals/${e}`, { body: r, ...n });
  }
  /**
   * List evaluations for a project.
   */
  list(e = {}, r) {
    return this._client.getAPIList("/evals", Se, { query: e, ...r });
  }
  /**
   * Delete an evaluation.
   */
  delete(e, r) {
    return this._client.delete(j`/evals/${e}`, r);
  }
}
uu.Runs = lu;
let Zp = class extends X {
  /**
   * Upload a file that can be used across various endpoints. Individual files can be
   * up to 512 MB, and the size of all files uploaded by one organization can be up
   * to 1 TB.
   *
   * - The Assistants API supports files up to 2 million tokens and of specific file
   *   types. See the
   *   [Assistants Tools guide](https://platform.openai.com/docs/assistants/tools)
   *   for details.
   * - The Fine-tuning API only supports `.jsonl` files. The input also has certain
   *   required formats for fine-tuning
   *   [chat](https://platform.openai.com/docs/api-reference/fine-tuning/chat-input)
   *   or
   *   [completions](https://platform.openai.com/docs/api-reference/fine-tuning/completions-input)
   *   models.
   * - The Batch API only supports `.jsonl` files up to 200 MB in size. The input
   *   also has a specific required
   *   [format](https://platform.openai.com/docs/api-reference/batch/request-input).
   *
   * Please [contact us](https://help.openai.com/) if you need to increase these
   * storage limits.
   */
  create(e, r) {
    return this._client.post("/files", Xr({ body: e, ...r }, this._client));
  }
  /**
   * Returns information about a specific file.
   */
  retrieve(e, r) {
    return this._client.get(j`/files/${e}`, r);
  }
  /**
   * Returns a list of files.
   */
  list(e = {}, r) {
    return this._client.getAPIList("/files", Se, { query: e, ...r });
  }
  /**
   * Delete a file and remove it from all vector stores.
   */
  delete(e, r) {
    return this._client.delete(j`/files/${e}`, r);
  }
  /**
   * Returns the contents of the specified file.
   */
  content(e, r) {
    return this._client.get(j`/files/${e}/content`, {
      ...r,
      headers: q([{ Accept: "application/binary" }, r == null ? void 0 : r.headers]),
      __binaryResponse: !0
    });
  }
  /**
   * Waits for the given file to be processed, default timeout is 30 mins.
   */
  async waitForProcessing(e, { pollInterval: r = 5e3, maxWait: n = 30 * 60 * 1e3 } = {}) {
    const s = /* @__PURE__ */ new Set(["processed", "error", "deleted"]), a = Date.now();
    let o = await this.retrieve(e);
    for (; !o.status || !s.has(o.status); )
      if (await ks(r), o = await this.retrieve(e), Date.now() - a > n)
        throw new Jl({
          message: `Giving up on waiting for file ${e} to finish processing after ${n} milliseconds.`
        });
    return o;
  }
};
class ey extends X {
}
let ty = class extends X {
  /**
   * Run a grader.
   *
   * @example
   * ```ts
   * const response = await client.fineTuning.alpha.graders.run({
   *   grader: {
   *     input: 'input',
   *     name: 'name',
   *     operation: 'eq',
   *     reference: 'reference',
   *     type: 'string_check',
   *   },
   *   model_sample: 'model_sample',
   * });
   * ```
   */
  run(e, r) {
    return this._client.post("/fine_tuning/alpha/graders/run", { body: e, ...r });
  }
  /**
   * Validate a grader.
   *
   * @example
   * ```ts
   * const response =
   *   await client.fineTuning.alpha.graders.validate({
   *     grader: {
   *       input: 'input',
   *       name: 'name',
   *       operation: 'eq',
   *       reference: 'reference',
   *       type: 'string_check',
   *     },
   *   });
   * ```
   */
  validate(e, r) {
    return this._client.post("/fine_tuning/alpha/graders/validate", { body: e, ...r });
  }
};
class du extends X {
  constructor() {
    super(...arguments), this.graders = new ty(this._client);
  }
}
du.Graders = ty;
class ry extends X {
  /**
   * **NOTE:** Calling this endpoint requires an [admin API key](../admin-api-keys).
   *
   * This enables organization owners to share fine-tuned models with other projects
   * in their organization.
   *
   * @example
   * ```ts
   * // Automatically fetches more pages as needed.
   * for await (const permissionCreateResponse of client.fineTuning.checkpoints.permissions.create(
   *   'ft:gpt-4o-mini-2024-07-18:org:weather:B7R9VjQd',
   *   { project_ids: ['string'] },
   * )) {
   *   // ...
   * }
   * ```
   */
  create(e, r, n) {
    return this._client.getAPIList(j`/fine_tuning/checkpoints/${e}/permissions`, So, { body: r, method: "post", ...n });
  }
  /**
   * **NOTE:** This endpoint requires an [admin API key](../admin-api-keys).
   *
   * Organization owners can use this endpoint to view all permissions for a
   * fine-tuned model checkpoint.
   *
   * @example
   * ```ts
   * const permission =
   *   await client.fineTuning.checkpoints.permissions.retrieve(
   *     'ft-AF1WoRqd3aJAHsqc9NY7iL8F',
   *   );
   * ```
   */
  retrieve(e, r = {}, n) {
    return this._client.get(j`/fine_tuning/checkpoints/${e}/permissions`, {
      query: r,
      ...n
    });
  }
  /**
   * **NOTE:** This endpoint requires an [admin API key](../admin-api-keys).
   *
   * Organization owners can use this endpoint to delete a permission for a
   * fine-tuned model checkpoint.
   *
   * @example
   * ```ts
   * const permission =
   *   await client.fineTuning.checkpoints.permissions.delete(
   *     'cp_zc4Q7MP6XxulcVzj4MZdwsAB',
   *     {
   *       fine_tuned_model_checkpoint:
   *         'ft:gpt-4o-mini-2024-07-18:org:weather:B7R9VjQd',
   *     },
   *   );
   * ```
   */
  delete(e, r, n) {
    const { fine_tuned_model_checkpoint: s } = r;
    return this._client.delete(j`/fine_tuning/checkpoints/${s}/permissions/${e}`, n);
  }
}
let fu = class extends X {
  constructor() {
    super(...arguments), this.permissions = new ry(this._client);
  }
};
fu.Permissions = ry;
class ny extends X {
  /**
   * List checkpoints for a fine-tuning job.
   *
   * @example
   * ```ts
   * // Automatically fetches more pages as needed.
   * for await (const fineTuningJobCheckpoint of client.fineTuning.jobs.checkpoints.list(
   *   'ft-AF1WoRqd3aJAHsqc9NY7iL8F',
   * )) {
   *   // ...
   * }
   * ```
   */
  list(e, r = {}, n) {
    return this._client.getAPIList(j`/fine_tuning/jobs/${e}/checkpoints`, Se, { query: r, ...n });
  }
}
class hu extends X {
  constructor() {
    super(...arguments), this.checkpoints = new ny(this._client);
  }
  /**
   * Creates a fine-tuning job which begins the process of creating a new model from
   * a given dataset.
   *
   * Response includes details of the enqueued job including job status and the name
   * of the fine-tuned models once complete.
   *
   * [Learn more about fine-tuning](https://platform.openai.com/docs/guides/model-optimization)
   *
   * @example
   * ```ts
   * const fineTuningJob = await client.fineTuning.jobs.create({
   *   model: 'gpt-4o-mini',
   *   training_file: 'file-abc123',
   * });
   * ```
   */
  create(e, r) {
    return this._client.post("/fine_tuning/jobs", { body: e, ...r });
  }
  /**
   * Get info about a fine-tuning job.
   *
   * [Learn more about fine-tuning](https://platform.openai.com/docs/guides/model-optimization)
   *
   * @example
   * ```ts
   * const fineTuningJob = await client.fineTuning.jobs.retrieve(
   *   'ft-AF1WoRqd3aJAHsqc9NY7iL8F',
   * );
   * ```
   */
  retrieve(e, r) {
    return this._client.get(j`/fine_tuning/jobs/${e}`, r);
  }
  /**
   * List your organization's fine-tuning jobs
   *
   * @example
   * ```ts
   * // Automatically fetches more pages as needed.
   * for await (const fineTuningJob of client.fineTuning.jobs.list()) {
   *   // ...
   * }
   * ```
   */
  list(e = {}, r) {
    return this._client.getAPIList("/fine_tuning/jobs", Se, { query: e, ...r });
  }
  /**
   * Immediately cancel a fine-tune job.
   *
   * @example
   * ```ts
   * const fineTuningJob = await client.fineTuning.jobs.cancel(
   *   'ft-AF1WoRqd3aJAHsqc9NY7iL8F',
   * );
   * ```
   */
  cancel(e, r) {
    return this._client.post(j`/fine_tuning/jobs/${e}/cancel`, r);
  }
  /**
   * Get status updates for a fine-tuning job.
   *
   * @example
   * ```ts
   * // Automatically fetches more pages as needed.
   * for await (const fineTuningJobEvent of client.fineTuning.jobs.listEvents(
   *   'ft-AF1WoRqd3aJAHsqc9NY7iL8F',
   * )) {
   *   // ...
   * }
   * ```
   */
  listEvents(e, r = {}, n) {
    return this._client.getAPIList(j`/fine_tuning/jobs/${e}/events`, Se, { query: r, ...n });
  }
  /**
   * Pause a fine-tune job.
   *
   * @example
   * ```ts
   * const fineTuningJob = await client.fineTuning.jobs.pause(
   *   'ft-AF1WoRqd3aJAHsqc9NY7iL8F',
   * );
   * ```
   */
  pause(e, r) {
    return this._client.post(j`/fine_tuning/jobs/${e}/pause`, r);
  }
  /**
   * Resume a fine-tune job.
   *
   * @example
   * ```ts
   * const fineTuningJob = await client.fineTuning.jobs.resume(
   *   'ft-AF1WoRqd3aJAHsqc9NY7iL8F',
   * );
   * ```
   */
  resume(e, r) {
    return this._client.post(j`/fine_tuning/jobs/${e}/resume`, r);
  }
}
hu.Checkpoints = ny;
class Ln extends X {
  constructor() {
    super(...arguments), this.methods = new ey(this._client), this.jobs = new hu(this._client), this.checkpoints = new fu(this._client), this.alpha = new du(this._client);
  }
}
Ln.Methods = ey;
Ln.Jobs = hu;
Ln.Checkpoints = fu;
Ln.Alpha = du;
class sy extends X {
}
class mu extends X {
  constructor() {
    super(...arguments), this.graderModels = new sy(this._client);
  }
}
mu.GraderModels = sy;
class ay extends X {
  /**
   * Creates a variation of a given image. This endpoint only supports `dall-e-2`.
   *
   * @example
   * ```ts
   * const imagesResponse = await client.images.createVariation({
   *   image: fs.createReadStream('otter.png'),
   * });
   * ```
   */
  createVariation(e, r) {
    return this._client.post("/images/variations", Xr({ body: e, ...r }, this._client));
  }
  edit(e, r) {
    return this._client.post("/images/edits", Xr({ body: e, ...r, stream: e.stream ?? !1 }, this._client));
  }
  generate(e, r) {
    return this._client.post("/images/generations", { body: e, ...r, stream: e.stream ?? !1 });
  }
}
class oy extends X {
  /**
   * Retrieves a model instance, providing basic information about the model such as
   * the owner and permissioning.
   */
  retrieve(e, r) {
    return this._client.get(j`/models/${e}`, r);
  }
  /**
   * Lists the currently available models, and provides basic information about each
   * one such as the owner and availability.
   */
  list(e) {
    return this._client.getAPIList("/models", So, e);
  }
  /**
   * Delete a fine-tuned model. You must have the Owner role in your organization to
   * delete a model.
   */
  delete(e, r) {
    return this._client.delete(j`/models/${e}`, r);
  }
}
class iy extends X {
  /**
   * Classifies if text and/or image inputs are potentially harmful. Learn more in
   * the [moderation guide](https://platform.openai.com/docs/guides/moderation).
   */
  create(e, r) {
    return this._client.post("/moderations", { body: e, ...r });
  }
}
class cy extends X {
  /**
   * Accept an incoming SIP call and configure the realtime session that will handle
   * it.
   *
   * @example
   * ```ts
   * await client.realtime.calls.accept('call_id', {
   *   type: 'realtime',
   * });
   * ```
   */
  accept(e, r, n) {
    return this._client.post(j`/realtime/calls/${e}/accept`, {
      body: r,
      ...n,
      headers: q([{ Accept: "*/*" }, n == null ? void 0 : n.headers])
    });
  }
  /**
   * End an active Realtime API call, whether it was initiated over SIP or WebRTC.
   *
   * @example
   * ```ts
   * await client.realtime.calls.hangup('call_id');
   * ```
   */
  hangup(e, r) {
    return this._client.post(j`/realtime/calls/${e}/hangup`, {
      ...r,
      headers: q([{ Accept: "*/*" }, r == null ? void 0 : r.headers])
    });
  }
  /**
   * Transfer an active SIP call to a new destination using the SIP REFER verb.
   *
   * @example
   * ```ts
   * await client.realtime.calls.refer('call_id', {
   *   target_uri: 'tel:+14155550123',
   * });
   * ```
   */
  refer(e, r, n) {
    return this._client.post(j`/realtime/calls/${e}/refer`, {
      body: r,
      ...n,
      headers: q([{ Accept: "*/*" }, n == null ? void 0 : n.headers])
    });
  }
  /**
   * Decline an incoming SIP call by returning a SIP status code to the caller.
   *
   * @example
   * ```ts
   * await client.realtime.calls.reject('call_id');
   * ```
   */
  reject(e, r = {}, n) {
    return this._client.post(j`/realtime/calls/${e}/reject`, {
      body: r,
      ...n,
      headers: q([{ Accept: "*/*" }, n == null ? void 0 : n.headers])
    });
  }
}
class ly extends X {
  /**
   * Create a Realtime client secret with an associated session configuration.
   *
   * @example
   * ```ts
   * const clientSecret =
   *   await client.realtime.clientSecrets.create();
   * ```
   */
  create(e, r) {
    return this._client.post("/realtime/client_secrets", { body: e, ...r });
  }
}
class Io extends X {
  constructor() {
    super(...arguments), this.clientSecrets = new ly(this._client), this.calls = new cy(this._client);
  }
}
Io.ClientSecrets = ly;
Io.Calls = cy;
function hT(t, e) {
  return !e || !pT(e) ? {
    ...t,
    output_parsed: null,
    output: t.output.map((r) => r.type === "function_call" ? {
      ...r,
      parsed_arguments: null
    } : r.type === "message" ? {
      ...r,
      content: r.content.map((n) => ({
        ...n,
        parsed: null
      }))
    } : r)
  } : uy(t, e);
}
function uy(t, e) {
  const r = t.output.map((s) => {
    if (s.type === "function_call")
      return {
        ...s,
        parsed_arguments: gT(e, s)
      };
    if (s.type === "message") {
      const a = s.content.map((o) => o.type === "output_text" ? {
        ...o,
        parsed: mT(e, o.text)
      } : o);
      return {
        ...s,
        content: a
      };
    }
    return s;
  }), n = Object.assign({}, t, { output: r });
  return Object.getOwnPropertyDescriptor(t, "output_text") || zi(n), Object.defineProperty(n, "output_parsed", {
    enumerable: !0,
    get() {
      for (const s of n.output)
        if (s.type === "message") {
          for (const a of s.content)
            if (a.type === "output_text" && a.parsed !== null)
              return a.parsed;
        }
      return null;
    }
  }), n;
}
function mT(t, e) {
  var r, n, s, a;
  return ((n = (r = t.text) == null ? void 0 : r.format) == null ? void 0 : n.type) !== "json_schema" ? null : "$parseRaw" in ((s = t.text) == null ? void 0 : s.format) ? ((a = t.text) == null ? void 0 : a.format).$parseRaw(e) : JSON.parse(e);
}
function pT(t) {
  var e;
  return !!Zl((e = t.text) == null ? void 0 : e.format);
}
function yT(t) {
  return (t == null ? void 0 : t.$brand) === "auto-parseable-tool";
}
function $T(t, e) {
  return t.find((r) => r.type === "function" && r.name === e);
}
function gT(t, e) {
  const r = $T(t.tools ?? [], e.name);
  return {
    ...e,
    ...e,
    parsed_arguments: yT(r) ? r.$parseRaw(e.arguments) : r != null && r.strict ? JSON.parse(e.arguments) : null
  };
}
function zi(t) {
  const e = [];
  for (const r of t.output)
    if (r.type === "message")
      for (const n of r.content)
        n.type === "output_text" && e.push(n.text);
  t.output_text = e.join("");
}
var an, la, ar, ua, bf, Ef, Sf, Pf;
class pu extends tu {
  constructor(e) {
    super(), an.add(this), la.set(this, void 0), ar.set(this, void 0), ua.set(this, void 0), Q(this, la, e);
  }
  static createResponse(e, r, n) {
    const s = new pu(r);
    return s._run(() => s._createOrRetrieveResponse(e, r, {
      ...n,
      headers: { ...n == null ? void 0 : n.headers, "X-Stainless-Helper-Method": "stream" }
    })), s;
  }
  async _createOrRetrieveResponse(e, r, n) {
    var i;
    const s = n == null ? void 0 : n.signal;
    s && (s.aborted && this.controller.abort(), s.addEventListener("abort", () => this.controller.abort())), I(this, an, "m", bf).call(this);
    let a, o = null;
    "response_id" in r ? (a = await e.responses.retrieve(r.response_id, { stream: !0 }, { ...n, signal: this.controller.signal, stream: !0 }), o = r.starting_after ?? null) : a = await e.responses.create({ ...r, stream: !0 }, { ...n, signal: this.controller.signal }), this._connected();
    for await (const c of a)
      I(this, an, "m", Ef).call(this, c, o);
    if ((i = a.controller.signal) != null && i.aborted)
      throw new ft();
    return I(this, an, "m", Sf).call(this);
  }
  [(la = /* @__PURE__ */ new WeakMap(), ar = /* @__PURE__ */ new WeakMap(), ua = /* @__PURE__ */ new WeakMap(), an = /* @__PURE__ */ new WeakSet(), bf = function() {
    this.ended || Q(this, ar, void 0);
  }, Ef = function(r, n) {
    if (this.ended)
      return;
    const s = (o, i) => {
      (n == null || i.sequence_number > n) && this._emit(o, i);
    }, a = I(this, an, "m", Pf).call(this, r);
    switch (s("event", r), r.type) {
      case "response.output_text.delta": {
        const o = a.output[r.output_index];
        if (!o)
          throw new Y(`missing output at index ${r.output_index}`);
        if (o.type === "message") {
          const i = o.content[r.content_index];
          if (!i)
            throw new Y(`missing content at index ${r.content_index}`);
          if (i.type !== "output_text")
            throw new Y(`expected content to be 'output_text', got ${i.type}`);
          s("response.output_text.delta", {
            ...r,
            snapshot: i.text
          });
        }
        break;
      }
      case "response.function_call_arguments.delta": {
        const o = a.output[r.output_index];
        if (!o)
          throw new Y(`missing output at index ${r.output_index}`);
        o.type === "function_call" && s("response.function_call_arguments.delta", {
          ...r,
          snapshot: o.arguments
        });
        break;
      }
      default:
        s(r.type, r);
        break;
    }
  }, Sf = function() {
    if (this.ended)
      throw new Y("stream has ended, this shouldn't happen");
    const r = I(this, ar, "f");
    if (!r)
      throw new Y("request ended without sending any events");
    Q(this, ar, void 0);
    const n = _T(r, I(this, la, "f"));
    return Q(this, ua, n), n;
  }, Pf = function(r) {
    var s;
    let n = I(this, ar, "f");
    if (!n) {
      if (r.type !== "response.created")
        throw new Y(`When snapshot hasn't been set yet, expected 'response.created' event, got ${r.type}`);
      return n = Q(this, ar, r.response), n;
    }
    switch (r.type) {
      case "response.output_item.added": {
        n.output.push(r.item);
        break;
      }
      case "response.content_part.added": {
        const a = n.output[r.output_index];
        if (!a)
          throw new Y(`missing output at index ${r.output_index}`);
        const o = a.type, i = r.part;
        o === "message" && i.type !== "reasoning_text" ? a.content.push(i) : o === "reasoning" && i.type === "reasoning_text" && (a.content || (a.content = []), a.content.push(i));
        break;
      }
      case "response.output_text.delta": {
        const a = n.output[r.output_index];
        if (!a)
          throw new Y(`missing output at index ${r.output_index}`);
        if (a.type === "message") {
          const o = a.content[r.content_index];
          if (!o)
            throw new Y(`missing content at index ${r.content_index}`);
          if (o.type !== "output_text")
            throw new Y(`expected content to be 'output_text', got ${o.type}`);
          o.text += r.delta;
        }
        break;
      }
      case "response.function_call_arguments.delta": {
        const a = n.output[r.output_index];
        if (!a)
          throw new Y(`missing output at index ${r.output_index}`);
        a.type === "function_call" && (a.arguments += r.delta);
        break;
      }
      case "response.reasoning_text.delta": {
        const a = n.output[r.output_index];
        if (!a)
          throw new Y(`missing output at index ${r.output_index}`);
        if (a.type === "reasoning") {
          const o = (s = a.content) == null ? void 0 : s[r.content_index];
          if (!o)
            throw new Y(`missing content at index ${r.content_index}`);
          if (o.type !== "reasoning_text")
            throw new Y(`expected content to be 'reasoning_text', got ${o.type}`);
          o.text += r.delta;
        }
        break;
      }
      case "response.completed": {
        Q(this, ar, r.response);
        break;
      }
    }
    return n;
  }, Symbol.asyncIterator)]() {
    const e = [], r = [];
    let n = !1;
    return this.on("event", (s) => {
      const a = r.shift();
      a ? a.resolve(s) : e.push(s);
    }), this.on("end", () => {
      n = !0;
      for (const s of r)
        s.resolve(void 0);
      r.length = 0;
    }), this.on("abort", (s) => {
      n = !0;
      for (const a of r)
        a.reject(s);
      r.length = 0;
    }), this.on("error", (s) => {
      n = !0;
      for (const a of r)
        a.reject(s);
      r.length = 0;
    }), {
      next: async () => e.length ? { value: e.shift(), done: !1 } : n ? { value: void 0, done: !0 } : new Promise((a, o) => r.push({ resolve: a, reject: o })).then((a) => a ? { value: a, done: !1 } : { value: void 0, done: !0 }),
      return: async () => (this.abort(), { value: void 0, done: !0 })
    };
  }
  /**
   * @returns a promise that resolves with the final Response, or rejects
   * if an error occurred or the stream ended prematurely without producing a REsponse.
   */
  async finalResponse() {
    await this.done();
    const e = I(this, ua, "f");
    if (!e)
      throw new Y("stream ended without producing a ChatCompletion");
    return e;
  }
}
function _T(t, e) {
  return hT(t, e);
}
class dy extends X {
  /**
   * Returns a list of input items for a given response.
   *
   * @example
   * ```ts
   * // Automatically fetches more pages as needed.
   * for await (const responseItem of client.responses.inputItems.list(
   *   'response_id',
   * )) {
   *   // ...
   * }
   * ```
   */
  list(e, r = {}, n) {
    return this._client.getAPIList(j`/responses/${e}/input_items`, Se, { query: r, ...n });
  }
}
class fy extends X {
  /**
   * Get input token counts
   *
   * @example
   * ```ts
   * const response = await client.responses.inputTokens.count();
   * ```
   */
  count(e = {}, r) {
    return this._client.post("/responses/input_tokens", { body: e, ...r });
  }
}
class No extends X {
  constructor() {
    super(...arguments), this.inputItems = new dy(this._client), this.inputTokens = new fy(this._client);
  }
  create(e, r) {
    return this._client.post("/responses", { body: e, ...r, stream: e.stream ?? !1 })._thenUnwrap((n) => ("object" in n && n.object === "response" && zi(n), n));
  }
  retrieve(e, r = {}, n) {
    return this._client.get(j`/responses/${e}`, {
      query: r,
      ...n,
      stream: (r == null ? void 0 : r.stream) ?? !1
    })._thenUnwrap((s) => ("object" in s && s.object === "response" && zi(s), s));
  }
  /**
   * Deletes a model response with the given ID.
   *
   * @example
   * ```ts
   * await client.responses.delete(
   *   'resp_677efb5139a88190b512bc3fef8e535d',
   * );
   * ```
   */
  delete(e, r) {
    return this._client.delete(j`/responses/${e}`, {
      ...r,
      headers: q([{ Accept: "*/*" }, r == null ? void 0 : r.headers])
    });
  }
  parse(e, r) {
    return this._client.responses.create(e, r)._thenUnwrap((n) => uy(n, e));
  }
  /**
   * Creates a model response stream
   */
  stream(e, r) {
    return pu.createResponse(this._client, e, r);
  }
  /**
   * Cancels a model response with the given ID. Only responses created with the
   * `background` parameter set to `true` can be cancelled.
   * [Learn more](https://platform.openai.com/docs/guides/background).
   *
   * @example
   * ```ts
   * const response = await client.responses.cancel(
   *   'resp_677efb5139a88190b512bc3fef8e535d',
   * );
   * ```
   */
  cancel(e, r) {
    return this._client.post(j`/responses/${e}/cancel`, r);
  }
  /**
   * Compact conversation
   *
   * @example
   * ```ts
   * const compactedResponse = await client.responses.compact({
   *   model: 'gpt-5.2',
   * });
   * ```
   */
  compact(e, r) {
    return this._client.post("/responses/compact", { body: e, ...r });
  }
}
No.InputItems = dy;
No.InputTokens = fy;
class hy extends X {
  /**
   * Adds a
   * [Part](https://platform.openai.com/docs/api-reference/uploads/part-object) to an
   * [Upload](https://platform.openai.com/docs/api-reference/uploads/object) object.
   * A Part represents a chunk of bytes from the file you are trying to upload.
   *
   * Each Part can be at most 64 MB, and you can add Parts until you hit the Upload
   * maximum of 8 GB.
   *
   * It is possible to add multiple Parts in parallel. You can decide the intended
   * order of the Parts when you
   * [complete the Upload](https://platform.openai.com/docs/api-reference/uploads/complete).
   */
  create(e, r, n) {
    return this._client.post(j`/uploads/${e}/parts`, Xr({ body: r, ...n }, this._client));
  }
}
class yu extends X {
  constructor() {
    super(...arguments), this.parts = new hy(this._client);
  }
  /**
   * Creates an intermediate
   * [Upload](https://platform.openai.com/docs/api-reference/uploads/object) object
   * that you can add
   * [Parts](https://platform.openai.com/docs/api-reference/uploads/part-object) to.
   * Currently, an Upload can accept at most 8 GB in total and expires after an hour
   * after you create it.
   *
   * Once you complete the Upload, we will create a
   * [File](https://platform.openai.com/docs/api-reference/files/object) object that
   * contains all the parts you uploaded. This File is usable in the rest of our
   * platform as a regular File object.
   *
   * For certain `purpose` values, the correct `mime_type` must be specified. Please
   * refer to documentation for the
   * [supported MIME types for your use case](https://platform.openai.com/docs/assistants/tools/file-search#supported-files).
   *
   * For guidance on the proper filename extensions for each purpose, please follow
   * the documentation on
   * [creating a File](https://platform.openai.com/docs/api-reference/files/create).
   */
  create(e, r) {
    return this._client.post("/uploads", { body: e, ...r });
  }
  /**
   * Cancels the Upload. No Parts may be added after an Upload is cancelled.
   */
  cancel(e, r) {
    return this._client.post(j`/uploads/${e}/cancel`, r);
  }
  /**
   * Completes the
   * [Upload](https://platform.openai.com/docs/api-reference/uploads/object).
   *
   * Within the returned Upload object, there is a nested
   * [File](https://platform.openai.com/docs/api-reference/files/object) object that
   * is ready to use in the rest of the platform.
   *
   * You can specify the order of the Parts by passing in an ordered list of the Part
   * IDs.
   *
   * The number of bytes uploaded upon completion must match the number of bytes
   * initially specified when creating the Upload object. No Parts may be added after
   * an Upload is completed.
   */
  complete(e, r, n) {
    return this._client.post(j`/uploads/${e}/complete`, { body: r, ...n });
  }
}
yu.Parts = hy;
const vT = async (t) => {
  const e = await Promise.allSettled(t), r = e.filter((s) => s.status === "rejected");
  if (r.length) {
    for (const s of r)
      console.error(s.reason);
    throw new Error(`${r.length} promise(s) failed - see the above errors`);
  }
  const n = [];
  for (const s of e)
    s.status === "fulfilled" && n.push(s.value);
  return n;
};
class my extends X {
  /**
   * Create a vector store file batch.
   */
  create(e, r, n) {
    return this._client.post(j`/vector_stores/${e}/file_batches`, {
      body: r,
      ...n,
      headers: q([{ "OpenAI-Beta": "assistants=v2" }, n == null ? void 0 : n.headers])
    });
  }
  /**
   * Retrieves a vector store file batch.
   */
  retrieve(e, r, n) {
    const { vector_store_id: s } = r;
    return this._client.get(j`/vector_stores/${s}/file_batches/${e}`, {
      ...n,
      headers: q([{ "OpenAI-Beta": "assistants=v2" }, n == null ? void 0 : n.headers])
    });
  }
  /**
   * Cancel a vector store file batch. This attempts to cancel the processing of
   * files in this batch as soon as possible.
   */
  cancel(e, r, n) {
    const { vector_store_id: s } = r;
    return this._client.post(j`/vector_stores/${s}/file_batches/${e}/cancel`, {
      ...n,
      headers: q([{ "OpenAI-Beta": "assistants=v2" }, n == null ? void 0 : n.headers])
    });
  }
  /**
   * Create a vector store batch and poll until all files have been processed.
   */
  async createAndPoll(e, r, n) {
    const s = await this.create(e, r);
    return await this.poll(e, s.id, n);
  }
  /**
   * Returns a list of vector store files in a batch.
   */
  listFiles(e, r, n) {
    const { vector_store_id: s, ...a } = r;
    return this._client.getAPIList(j`/vector_stores/${s}/file_batches/${e}/files`, Se, { query: a, ...n, headers: q([{ "OpenAI-Beta": "assistants=v2" }, n == null ? void 0 : n.headers]) });
  }
  /**
   * Wait for the given file batch to be processed.
   *
   * Note: this will return even if one of the files failed to process, you need to
   * check batch.file_counts.failed_count to handle this case.
   */
  async poll(e, r, n) {
    var a;
    const s = q([
      n == null ? void 0 : n.headers,
      {
        "X-Stainless-Poll-Helper": "true",
        "X-Stainless-Custom-Poll-Interval": ((a = n == null ? void 0 : n.pollIntervalMs) == null ? void 0 : a.toString()) ?? void 0
      }
    ]);
    for (; ; ) {
      const { data: o, response: i } = await this.retrieve(r, { vector_store_id: e }, {
        ...n,
        headers: s
      }).withResponse();
      switch (o.status) {
        case "in_progress":
          let c = 5e3;
          if (n != null && n.pollIntervalMs)
            c = n.pollIntervalMs;
          else {
            const d = i.headers.get("openai-poll-after-ms");
            if (d) {
              const l = parseInt(d);
              isNaN(l) || (c = l);
            }
          }
          await ks(c);
          break;
        case "failed":
        case "cancelled":
        case "completed":
          return o;
      }
    }
  }
  /**
   * Uploads the given files concurrently and then creates a vector store file batch.
   *
   * The concurrency limit is configurable using the `maxConcurrency` parameter.
   */
  async uploadAndPoll(e, { files: r, fileIds: n = [] }, s) {
    if (r == null || r.length == 0)
      throw new Error("No `files` provided to process. If you've already uploaded files you should use `.createAndPoll()` instead");
    const a = (s == null ? void 0 : s.maxConcurrency) ?? 5, o = Math.min(a, r.length), i = this._client, c = r.values(), d = [...n];
    async function l(_) {
      for (let p of _) {
        const w = await i.files.create({ file: p, purpose: "assistants" }, s);
        d.push(w.id);
      }
    }
    const f = Array(o).fill(c).map(l);
    return await vT(f), await this.createAndPoll(e, {
      file_ids: d
    });
  }
}
class py extends X {
  /**
   * Create a vector store file by attaching a
   * [File](https://platform.openai.com/docs/api-reference/files) to a
   * [vector store](https://platform.openai.com/docs/api-reference/vector-stores/object).
   */
  create(e, r, n) {
    return this._client.post(j`/vector_stores/${e}/files`, {
      body: r,
      ...n,
      headers: q([{ "OpenAI-Beta": "assistants=v2" }, n == null ? void 0 : n.headers])
    });
  }
  /**
   * Retrieves a vector store file.
   */
  retrieve(e, r, n) {
    const { vector_store_id: s } = r;
    return this._client.get(j`/vector_stores/${s}/files/${e}`, {
      ...n,
      headers: q([{ "OpenAI-Beta": "assistants=v2" }, n == null ? void 0 : n.headers])
    });
  }
  /**
   * Update attributes on a vector store file.
   */
  update(e, r, n) {
    const { vector_store_id: s, ...a } = r;
    return this._client.post(j`/vector_stores/${s}/files/${e}`, {
      body: a,
      ...n,
      headers: q([{ "OpenAI-Beta": "assistants=v2" }, n == null ? void 0 : n.headers])
    });
  }
  /**
   * Returns a list of vector store files.
   */
  list(e, r = {}, n) {
    return this._client.getAPIList(j`/vector_stores/${e}/files`, Se, {
      query: r,
      ...n,
      headers: q([{ "OpenAI-Beta": "assistants=v2" }, n == null ? void 0 : n.headers])
    });
  }
  /**
   * Delete a vector store file. This will remove the file from the vector store but
   * the file itself will not be deleted. To delete the file, use the
   * [delete file](https://platform.openai.com/docs/api-reference/files/delete)
   * endpoint.
   */
  delete(e, r, n) {
    const { vector_store_id: s } = r;
    return this._client.delete(j`/vector_stores/${s}/files/${e}`, {
      ...n,
      headers: q([{ "OpenAI-Beta": "assistants=v2" }, n == null ? void 0 : n.headers])
    });
  }
  /**
   * Attach a file to the given vector store and wait for it to be processed.
   */
  async createAndPoll(e, r, n) {
    const s = await this.create(e, r, n);
    return await this.poll(e, s.id, n);
  }
  /**
   * Wait for the vector store file to finish processing.
   *
   * Note: this will return even if the file failed to process, you need to check
   * file.last_error and file.status to handle these cases
   */
  async poll(e, r, n) {
    var a;
    const s = q([
      n == null ? void 0 : n.headers,
      {
        "X-Stainless-Poll-Helper": "true",
        "X-Stainless-Custom-Poll-Interval": ((a = n == null ? void 0 : n.pollIntervalMs) == null ? void 0 : a.toString()) ?? void 0
      }
    ]);
    for (; ; ) {
      const o = await this.retrieve(r, {
        vector_store_id: e
      }, { ...n, headers: s }).withResponse(), i = o.data;
      switch (i.status) {
        case "in_progress":
          let c = 5e3;
          if (n != null && n.pollIntervalMs)
            c = n.pollIntervalMs;
          else {
            const d = o.response.headers.get("openai-poll-after-ms");
            if (d) {
              const l = parseInt(d);
              isNaN(l) || (c = l);
            }
          }
          await ks(c);
          break;
        case "failed":
        case "completed":
          return i;
      }
    }
  }
  /**
   * Upload a file to the `files` API and then attach it to the given vector store.
   *
   * Note the file will be asynchronously processed (you can use the alternative
   * polling helper method to wait for processing to complete).
   */
  async upload(e, r, n) {
    const s = await this._client.files.create({ file: r, purpose: "assistants" }, n);
    return this.create(e, { file_id: s.id }, n);
  }
  /**
   * Add a file to a vector store and poll until processing is complete.
   */
  async uploadAndPoll(e, r, n) {
    const s = await this.upload(e, r, n);
    return await this.poll(e, s.id, n);
  }
  /**
   * Retrieve the parsed contents of a vector store file.
   */
  content(e, r, n) {
    const { vector_store_id: s } = r;
    return this._client.getAPIList(j`/vector_stores/${s}/files/${e}/content`, So, { ...n, headers: q([{ "OpenAI-Beta": "assistants=v2" }, n == null ? void 0 : n.headers]) });
  }
}
class To extends X {
  constructor() {
    super(...arguments), this.files = new py(this._client), this.fileBatches = new my(this._client);
  }
  /**
   * Create a vector store.
   */
  create(e, r) {
    return this._client.post("/vector_stores", {
      body: e,
      ...r,
      headers: q([{ "OpenAI-Beta": "assistants=v2" }, r == null ? void 0 : r.headers])
    });
  }
  /**
   * Retrieves a vector store.
   */
  retrieve(e, r) {
    return this._client.get(j`/vector_stores/${e}`, {
      ...r,
      headers: q([{ "OpenAI-Beta": "assistants=v2" }, r == null ? void 0 : r.headers])
    });
  }
  /**
   * Modifies a vector store.
   */
  update(e, r, n) {
    return this._client.post(j`/vector_stores/${e}`, {
      body: r,
      ...n,
      headers: q([{ "OpenAI-Beta": "assistants=v2" }, n == null ? void 0 : n.headers])
    });
  }
  /**
   * Returns a list of vector stores.
   */
  list(e = {}, r) {
    return this._client.getAPIList("/vector_stores", Se, {
      query: e,
      ...r,
      headers: q([{ "OpenAI-Beta": "assistants=v2" }, r == null ? void 0 : r.headers])
    });
  }
  /**
   * Delete a vector store.
   */
  delete(e, r) {
    return this._client.delete(j`/vector_stores/${e}`, {
      ...r,
      headers: q([{ "OpenAI-Beta": "assistants=v2" }, r == null ? void 0 : r.headers])
    });
  }
  /**
   * Search a vector store for relevant chunks based on a query and file attributes
   * filter.
   */
  search(e, r, n) {
    return this._client.getAPIList(j`/vector_stores/${e}/search`, So, {
      body: r,
      method: "post",
      ...n,
      headers: q([{ "OpenAI-Beta": "assistants=v2" }, n == null ? void 0 : n.headers])
    });
  }
}
To.Files = py;
To.FileBatches = my;
class yy extends X {
  /**
   * Create a video
   */
  create(e, r) {
    return this._client.post("/videos", uf({ body: e, ...r }, this._client));
  }
  /**
   * Retrieve a video
   */
  retrieve(e, r) {
    return this._client.get(j`/videos/${e}`, r);
  }
  /**
   * List videos
   */
  list(e = {}, r) {
    return this._client.getAPIList("/videos", za, { query: e, ...r });
  }
  /**
   * Delete a video
   */
  delete(e, r) {
    return this._client.delete(j`/videos/${e}`, r);
  }
  /**
   * Download video content
   */
  downloadContent(e, r = {}, n) {
    return this._client.get(j`/videos/${e}/content`, {
      query: r,
      ...n,
      headers: q([{ Accept: "application/binary" }, n == null ? void 0 : n.headers]),
      __binaryResponse: !0
    });
  }
  /**
   * Create a video remix
   */
  remix(e, r, n) {
    return this._client.post(j`/videos/${e}/remix`, uf({ body: r, ...n }, this._client));
  }
}
var fn, $y, Na;
class gy extends X {
  constructor() {
    super(...arguments), fn.add(this);
  }
  /**
   * Validates that the given payload was sent by OpenAI and parses the payload.
   */
  async unwrap(e, r, n = this._client.webhookSecret, s = 300) {
    return await this.verifySignature(e, r, n, s), JSON.parse(e);
  }
  /**
   * Validates whether or not the webhook payload was sent by OpenAI.
   *
   * An error will be raised if the webhook payload was not sent by OpenAI.
   *
   * @param payload - The webhook payload
   * @param headers - The webhook headers
   * @param secret - The webhook secret (optional, will use client secret if not provided)
   * @param tolerance - Maximum age of the webhook in seconds (default: 300 = 5 minutes)
   */
  async verifySignature(e, r, n = this._client.webhookSecret, s = 300) {
    if (typeof crypto > "u" || typeof crypto.subtle.importKey != "function" || typeof crypto.subtle.verify != "function")
      throw new Error("Webhook signature verification is only supported when the `crypto` global is defined");
    I(this, fn, "m", $y).call(this, n);
    const a = q([r]).values, o = I(this, fn, "m", Na).call(this, a, "webhook-signature"), i = I(this, fn, "m", Na).call(this, a, "webhook-timestamp"), c = I(this, fn, "m", Na).call(this, a, "webhook-id"), d = parseInt(i, 10);
    if (isNaN(d))
      throw new Yn("Invalid webhook timestamp format");
    const l = Math.floor(Date.now() / 1e3);
    if (l - d > s)
      throw new Yn("Webhook timestamp is too old");
    if (d > l + s)
      throw new Yn("Webhook timestamp is too new");
    const f = o.split(" ").map(($) => $.startsWith("v1,") ? $.substring(3) : $), _ = n.startsWith("whsec_") ? Buffer.from(n.replace("whsec_", ""), "base64") : Buffer.from(n, "utf-8"), p = c ? `${c}.${i}.${e}` : `${i}.${e}`, w = await crypto.subtle.importKey("raw", _, { name: "HMAC", hash: "SHA-256" }, !1, ["verify"]);
    for (const $ of f)
      try {
        const y = Buffer.from($, "base64");
        if (await crypto.subtle.verify("HMAC", w, y, new TextEncoder().encode(p)))
          return;
      } catch {
        continue;
      }
    throw new Yn("The given webhook signature does not match the expected signature");
  }
}
fn = /* @__PURE__ */ new WeakSet(), $y = function(e) {
  if (typeof e != "string" || e.length === 0)
    throw new Error("The webhook secret must either be set using the env var, OPENAI_WEBHOOK_SECRET, on the client class, OpenAI({ webhookSecret: '123' }), or passed to this function");
}, Na = function(e, r) {
  if (!e)
    throw new Error("Headers are required");
  const n = e.get(r);
  if (n == null)
    throw new Error(`Missing required header: ${r}`);
  return n;
};
var Ki, $u, Ta, _y;
class ue {
  /**
   * API Client for interfacing with the OpenAI API.
   *
   * @param {string | undefined} [opts.apiKey=process.env['OPENAI_API_KEY'] ?? undefined]
   * @param {string | null | undefined} [opts.organization=process.env['OPENAI_ORG_ID'] ?? null]
   * @param {string | null | undefined} [opts.project=process.env['OPENAI_PROJECT_ID'] ?? null]
   * @param {string | null | undefined} [opts.webhookSecret=process.env['OPENAI_WEBHOOK_SECRET'] ?? null]
   * @param {string} [opts.baseURL=process.env['OPENAI_BASE_URL'] ?? https://api.openai.com/v1] - Override the default base URL for the API.
   * @param {number} [opts.timeout=10 minutes] - The maximum amount of time (in milliseconds) the client will wait for a response before timing out.
   * @param {MergedRequestInit} [opts.fetchOptions] - Additional `RequestInit` options to be passed to `fetch` calls.
   * @param {Fetch} [opts.fetch] - Specify a custom `fetch` function implementation.
   * @param {number} [opts.maxRetries=2] - The maximum number of times the client will retry a request.
   * @param {HeadersLike} opts.defaultHeaders - Default headers to include with every request to the API.
   * @param {Record<string, string | undefined>} opts.defaultQuery - Default query parameters to include with every request to the API.
   * @param {boolean} [opts.dangerouslyAllowBrowser=false] - By default, client-side use of this library is not allowed, as it risks exposing your secret API credentials to attackers.
   */
  constructor({ baseURL: e = sn("OPENAI_BASE_URL"), apiKey: r = sn("OPENAI_API_KEY"), organization: n = sn("OPENAI_ORG_ID") ?? null, project: s = sn("OPENAI_PROJECT_ID") ?? null, webhookSecret: a = sn("OPENAI_WEBHOOK_SECRET") ?? null, ...o } = {}) {
    if (Ki.add(this), Ta.set(this, void 0), this.completions = new Wp(this), this.chat = new su(this), this.embeddings = new Yp(this), this.files = new Zp(this), this.images = new ay(this), this.audio = new Cs(this), this.moderations = new iy(this), this.models = new oy(this), this.fineTuning = new Ln(this), this.graders = new mu(this), this.vectorStores = new To(this), this.webhooks = new gy(this), this.beta = new Dn(this), this.batches = new xp(this), this.uploads = new yu(this), this.responses = new No(this), this.realtime = new Io(this), this.conversations = new cu(this), this.evals = new uu(this), this.containers = new iu(this), this.videos = new yy(this), r === void 0)
      throw new Y("Missing credentials. Please pass an `apiKey`, or set the `OPENAI_API_KEY` environment variable.");
    const i = {
      apiKey: r,
      organization: n,
      project: s,
      webhookSecret: a,
      ...o,
      baseURL: e || "https://api.openai.com/v1"
    };
    if (!i.dangerouslyAllowBrowser && bN())
      throw new Y(`It looks like you're running in a browser-like environment.

This is disabled by default, as it risks exposing your secret API credentials to attackers.
If you understand the risks and have appropriate mitigations in place,
you can set the \`dangerouslyAllowBrowser\` option to \`true\`, e.g.,

new OpenAI({ apiKey, dangerouslyAllowBrowser: true });

https://help.openai.com/en/articles/5112595-best-practices-for-api-key-safety
`);
    this.baseURL = i.baseURL, this.timeout = i.timeout ?? $u.DEFAULT_TIMEOUT, this.logger = i.logger ?? console;
    const c = "warn";
    this.logLevel = c, this.logLevel = cf(i.logLevel, "ClientOptions.logLevel", this) ?? cf(sn("OPENAI_LOG"), "process.env['OPENAI_LOG']", this) ?? c, this.fetchOptions = i.fetchOptions, this.maxRetries = i.maxRetries ?? 2, this.fetch = i.fetch ?? ON(), Q(this, Ta, NN), this._options = i, this.apiKey = typeof r == "string" ? r : "Missing Key", this.organization = n, this.project = s, this.webhookSecret = a;
  }
  /**
   * Create a new client instance re-using the same options given to the current client with optional overriding.
   */
  withOptions(e) {
    return new this.constructor({
      ...this._options,
      baseURL: this.baseURL,
      maxRetries: this.maxRetries,
      timeout: this.timeout,
      logger: this.logger,
      logLevel: this.logLevel,
      fetch: this.fetch,
      fetchOptions: this.fetchOptions,
      apiKey: this.apiKey,
      organization: this.organization,
      project: this.project,
      webhookSecret: this.webhookSecret,
      ...e
    });
  }
  defaultQuery() {
    return this._options.defaultQuery;
  }
  validateHeaders({ values: e, nulls: r }) {
  }
  async authHeaders(e) {
    return q([{ Authorization: `Bearer ${this.apiKey}` }]);
  }
  stringifyQuery(e) {
    return MN(e, { arrayFormat: "brackets" });
  }
  getUserAgent() {
    return `${this.constructor.name}/JS ${un}`;
  }
  defaultIdempotencyKey() {
    return `stainless-node-retry-${qm()}`;
  }
  makeStatusError(e, r, n, s) {
    return Ve.generate(e, r, n, s);
  }
  async _callApiKey() {
    const e = this._options.apiKey;
    if (typeof e != "function")
      return !1;
    let r;
    try {
      r = await e();
    } catch (n) {
      throw n instanceof Y ? n : new Y(
        `Failed to get token from 'apiKey' function: ${n.message}`,
        // @ts-ignore
        { cause: n }
      );
    }
    if (typeof r != "string" || !r)
      throw new Y(`Expected 'apiKey' function argument to return a string but it returned ${r}`);
    return this.apiKey = r, !0;
  }
  buildURL(e, r, n) {
    const s = !I(this, Ki, "m", _y).call(this) && n || this.baseURL, a = $N(e) ? new URL(e) : new URL(s + (s.endsWith("/") && e.startsWith("/") ? e.slice(1) : e)), o = this.defaultQuery();
    return gN(o) || (r = { ...o, ...r }), typeof r == "object" && r && !Array.isArray(r) && (a.search = this.stringifyQuery(r)), a.toString();
  }
  /**
   * Used as a callback for mutating the given `FinalRequestOptions` object.
   */
  async prepareOptions(e) {
    await this._callApiKey();
  }
  /**
   * Used as a callback for mutating the given `RequestInit` object.
   *
   * This is useful for cases where you want to add certain headers based off of
   * the request properties, e.g. `method` or `url`.
   */
  async prepareRequest(e, { url: r, options: n }) {
  }
  get(e, r) {
    return this.methodRequest("get", e, r);
  }
  post(e, r) {
    return this.methodRequest("post", e, r);
  }
  patch(e, r) {
    return this.methodRequest("patch", e, r);
  }
  put(e, r) {
    return this.methodRequest("put", e, r);
  }
  delete(e, r) {
    return this.methodRequest("delete", e, r);
  }
  methodRequest(e, r, n) {
    return this.request(Promise.resolve(n).then((s) => ({ method: e, path: r, ...s })));
  }
  request(e, r = null) {
    return new Eo(this, this.makeRequest(e, r, void 0));
  }
  async makeRequest(e, r, n) {
    var m, v;
    const s = await e, a = s.maxRetries ?? this.maxRetries;
    r == null && (r = a), await this.prepareOptions(s);
    const { req: o, url: i, timeout: c } = await this.buildRequest(s, {
      retryCount: a - r
    });
    await this.prepareRequest(o, { url: i, options: s });
    const d = "log_" + (Math.random() * (1 << 24) | 0).toString(16).padStart(6, "0"), l = n === void 0 ? "" : `, retryOf: ${n}`, f = Date.now();
    if (Me(this).debug(`[${d}] sending request`, Cr({
      retryOfRequestLogID: n,
      method: s.method,
      url: i,
      options: s,
      headers: o.headers
    })), (m = s.signal) != null && m.aborted)
      throw new ft();
    const _ = new AbortController(), p = await this.fetchWithTimeout(i, o, c, _).catch(Ai), w = Date.now();
    if (p instanceof globalThis.Error) {
      const P = `retrying, ${r} attempts remaining`;
      if ((v = s.signal) != null && v.aborted)
        throw new ft();
      const R = ki(p) || /timed? ?out/i.test(String(p) + ("cause" in p ? String(p.cause) : ""));
      if (r)
        return Me(this).info(`[${d}] connection ${R ? "timed out" : "failed"} - ${P}`), Me(this).debug(`[${d}] connection ${R ? "timed out" : "failed"} (${P})`, Cr({
          retryOfRequestLogID: n,
          url: i,
          durationMs: w - f,
          message: p.message
        })), this.retryRequest(s, r, n ?? d);
      throw Me(this).info(`[${d}] connection ${R ? "timed out" : "failed"} - error; no more retries left`), Me(this).debug(`[${d}] connection ${R ? "timed out" : "failed"} (error; no more retries left)`, Cr({
        retryOfRequestLogID: n,
        url: i,
        durationMs: w - f,
        message: p.message
      })), R ? new Jl() : new wo({ cause: p });
    }
    const $ = [...p.headers.entries()].filter(([P]) => P === "x-request-id").map(([P, R]) => ", " + P + ": " + JSON.stringify(R)).join(""), y = `[${d}${l}${$}] ${o.method} ${i} ${p.ok ? "succeeded" : "failed"} with status ${p.status} in ${w - f}ms`;
    if (!p.ok) {
      const P = await this.shouldRetry(p);
      if (r && P) {
        const Z = `retrying, ${r} attempts remaining`;
        return await IN(p.body), Me(this).info(`${y} - ${Z}`), Me(this).debug(`[${d}] response error (${Z})`, Cr({
          retryOfRequestLogID: n,
          url: p.url,
          status: p.status,
          headers: p.headers,
          durationMs: w - f
        })), this.retryRequest(s, r, n ?? d, p.headers);
      }
      const R = P ? "error; no more retries left" : "error; not retryable";
      Me(this).info(`${y} - ${R}`);
      const N = await p.text().catch((Z) => Ai(Z).message), D = wN(N), L = D ? void 0 : N;
      throw Me(this).debug(`[${d}] response error (${R})`, Cr({
        retryOfRequestLogID: n,
        url: p.url,
        status: p.status,
        headers: p.headers,
        message: L,
        durationMs: Date.now() - f
      })), this.makeStatusError(p.status, D, L, p.headers);
    }
    return Me(this).info(y), Me(this).debug(`[${d}] response start`, Cr({
      retryOfRequestLogID: n,
      url: p.url,
      status: p.status,
      headers: p.headers,
      durationMs: w - f
    })), { response: p, options: s, controller: _, requestLogID: d, retryOfRequestLogID: n, startTime: f };
  }
  getAPIList(e, r, n) {
    return this.requestAPIList(r, { method: "get", path: e, ...n });
  }
  requestAPIList(e, r) {
    const n = this.makeRequest(r, null, void 0);
    return new KN(this, n, e);
  }
  async fetchWithTimeout(e, r, n, s) {
    const { signal: a, method: o, ...i } = r || {};
    a && a.addEventListener("abort", () => s.abort());
    const c = setTimeout(() => s.abort(), n), d = globalThis.ReadableStream && i.body instanceof globalThis.ReadableStream || typeof i.body == "object" && i.body !== null && Symbol.asyncIterator in i.body, l = {
      signal: s.signal,
      ...d ? { duplex: "half" } : {},
      method: "GET",
      ...i
    };
    o && (l.method = o.toUpperCase());
    try {
      return await this.fetch.call(void 0, e, l);
    } finally {
      clearTimeout(c);
    }
  }
  async shouldRetry(e) {
    const r = e.headers.get("x-should-retry");
    return r === "true" ? !0 : r === "false" ? !1 : e.status === 408 || e.status === 409 || e.status === 429 || e.status >= 500;
  }
  async retryRequest(e, r, n, s) {
    let a;
    const o = s == null ? void 0 : s.get("retry-after-ms");
    if (o) {
      const c = parseFloat(o);
      Number.isNaN(c) || (a = c);
    }
    const i = s == null ? void 0 : s.get("retry-after");
    if (i && !a) {
      const c = parseFloat(i);
      Number.isNaN(c) ? a = Date.parse(i) - Date.now() : a = c * 1e3;
    }
    if (!(a && 0 <= a && a < 60 * 1e3)) {
      const c = e.maxRetries ?? this.maxRetries;
      a = this.calculateDefaultRetryTimeoutMillis(r, c);
    }
    return await ks(a), this.makeRequest(e, r - 1, n);
  }
  calculateDefaultRetryTimeoutMillis(e, r) {
    const a = r - e, o = Math.min(0.5 * Math.pow(2, a), 8), i = 1 - Math.random() * 0.25;
    return o * i * 1e3;
  }
  async buildRequest(e, { retryCount: r = 0 } = {}) {
    const n = { ...e }, { method: s, path: a, query: o, defaultBaseURL: i } = n, c = this.buildURL(a, o, i);
    "timeout" in n && vN("timeout", n.timeout), n.timeout = n.timeout ?? this.timeout;
    const { bodyHeaders: d, body: l } = this.buildBody({ options: n }), f = await this.buildHeaders({ options: e, method: s, bodyHeaders: d, retryCount: r });
    return { req: {
      method: s,
      headers: f,
      ...n.signal && { signal: n.signal },
      ...globalThis.ReadableStream && l instanceof globalThis.ReadableStream && { duplex: "half" },
      ...l && { body: l },
      ...this.fetchOptions ?? {},
      ...n.fetchOptions ?? {}
    }, url: c, timeout: n.timeout };
  }
  async buildHeaders({ options: e, method: r, bodyHeaders: n, retryCount: s }) {
    let a = {};
    this.idempotencyHeader && r !== "get" && (e.idempotencyKey || (e.idempotencyKey = this.defaultIdempotencyKey()), a[this.idempotencyHeader] = e.idempotencyKey);
    const o = q([
      a,
      {
        Accept: "application/json",
        "User-Agent": this.getUserAgent(),
        "X-Stainless-Retry-Count": String(s),
        ...e.timeout ? { "X-Stainless-Timeout": String(Math.trunc(e.timeout / 1e3)) } : {},
        ...RN(),
        "OpenAI-Organization": this.organization,
        "OpenAI-Project": this.project
      },
      await this.authHeaders(e),
      this._options.defaultHeaders,
      n,
      e.headers
    ]);
    return this.validateHeaders(o), o.values;
  }
  buildBody({ options: { body: e, headers: r } }) {
    if (!e)
      return { bodyHeaders: void 0, body: void 0 };
    const n = q([r]);
    return (
      // Pass raw type verbatim
      ArrayBuffer.isView(e) || e instanceof ArrayBuffer || e instanceof DataView || typeof e == "string" && // Preserve legacy string encoding behavior for now
      n.values.has("content-type") || // `Blob` is superset of `File`
      globalThis.Blob && e instanceof globalThis.Blob || // `FormData` -> `multipart/form-data`
      e instanceof FormData || // `URLSearchParams` -> `application/x-www-form-urlencoded`
      e instanceof URLSearchParams || // Send chunked stream (each chunk has own `length`)
      globalThis.ReadableStream && e instanceof globalThis.ReadableStream ? { bodyHeaders: void 0, body: e } : typeof e == "object" && (Symbol.asyncIterator in e || Symbol.iterator in e && "next" in e && typeof e.next == "function") ? { bodyHeaders: void 0, body: tp(e) } : I(this, Ta, "f").call(this, { body: e, headers: n })
    );
  }
}
$u = ue, Ta = /* @__PURE__ */ new WeakMap(), Ki = /* @__PURE__ */ new WeakSet(), _y = function() {
  return this.baseURL !== "https://api.openai.com/v1";
};
ue.OpenAI = $u;
ue.DEFAULT_TIMEOUT = 6e5;
ue.OpenAIError = Y;
ue.APIError = Ve;
ue.APIConnectionError = wo;
ue.APIConnectionTimeoutError = Jl;
ue.APIUserAbortError = ft;
ue.NotFoundError = Bm;
ue.ConflictError = Hm;
ue.RateLimitError = Jm;
ue.BadRequestError = zm;
ue.AuthenticationError = Km;
ue.InternalServerError = Xm;
ue.PermissionDeniedError = Gm;
ue.UnprocessableEntityError = Wm;
ue.InvalidWebhookSignatureError = Yn;
ue.toFile = JN;
ue.Completions = Wp;
ue.Chat = su;
ue.Embeddings = Yp;
ue.Files = Zp;
ue.Images = ay;
ue.Audio = Cs;
ue.Moderations = iy;
ue.Models = oy;
ue.FineTuning = Ln;
ue.Graders = mu;
ue.VectorStores = To;
ue.Webhooks = gy;
ue.Beta = Dn;
ue.Batches = xp;
ue.Uploads = yu;
ue.Responses = No;
ue.Realtime = Io;
ue.Conversations = cu;
ue.Evals = uu;
ue.Containers = iu;
ue.Videos = yy;
var Jt = { exports: {} };
const wT = "17.2.3", bT = {
  version: wT
}, Gi = My, Ya = Dy, ET = Ly, ST = Fy, PT = bT, gu = PT.version, Rf = [
  "🔐 encrypt with Dotenvx: https://dotenvx.com",
  "🔐 prevent committing .env to code: https://dotenvx.com/precommit",
  "🔐 prevent building .env in docker: https://dotenvx.com/prebuild",
  "📡 add observability to secrets: https://dotenvx.com/ops",
  "👥 sync secrets across teammates & machines: https://dotenvx.com/ops",
  "🗂️ backup and recover secrets: https://dotenvx.com/ops",
  "✅ audit secrets and track compliance: https://dotenvx.com/ops",
  "🔄 add secrets lifecycle management: https://dotenvx.com/ops",
  "🔑 add access controls to secrets: https://dotenvx.com/ops",
  "🛠️  run anywhere with `dotenvx run -- yourcommand`",
  "⚙️  specify custom .env file path with { path: '/custom/path/.env' }",
  "⚙️  enable debug logging with { debug: true }",
  "⚙️  override existing env vars with { override: true }",
  "⚙️  suppress all logs with { quiet: true }",
  "⚙️  write to custom object with { processEnv: myObject }",
  "⚙️  load multiple .env files with { path: ['.env.local', '.env'] }"
];
function RT() {
  return Rf[Math.floor(Math.random() * Rf.length)];
}
function yn(t) {
  return typeof t == "string" ? !["false", "0", "no", "off", ""].includes(t.toLowerCase()) : !!t;
}
function OT() {
  return process.stdout.isTTY;
}
function IT(t) {
  return OT() ? `\x1B[2m${t}\x1B[0m` : t;
}
const NT = /(?:^|^)\s*(?:export\s+)?([\w.-]+)(?:\s*=\s*?|:\s+?)(\s*'(?:\\'|[^'])*'|\s*"(?:\\"|[^"])*"|\s*`(?:\\`|[^`])*`|[^#\r\n]+)?\s*(?:#.*)?(?:$|$)/mg;
function TT(t) {
  const e = {};
  let r = t.toString();
  r = r.replace(/\r\n?/mg, `
`);
  let n;
  for (; (n = NT.exec(r)) != null; ) {
    const s = n[1];
    let a = n[2] || "";
    a = a.trim();
    const o = a[0];
    a = a.replace(/^(['"`])([\s\S]*)\1$/mg, "$2"), o === '"' && (a = a.replace(/\\n/g, `
`), a = a.replace(/\\r/g, "\r")), e[s] = a;
  }
  return e;
}
function kT(t) {
  t = t || {};
  const e = by(t);
  t.path = e;
  const r = Ne.configDotenv(t);
  if (!r.parsed) {
    const o = new Error(`MISSING_DATA: Cannot parse ${e} for an unknown reason`);
    throw o.code = "MISSING_DATA", o;
  }
  const n = wy(t).split(","), s = n.length;
  let a;
  for (let o = 0; o < s; o++)
    try {
      const i = n[o].trim(), c = CT(r, i);
      a = Ne.decrypt(c.ciphertext, c.key);
      break;
    } catch (i) {
      if (o + 1 >= s)
        throw i;
    }
  return Ne.parse(a);
}
function AT(t) {
  console.error(`[dotenv@${gu}][WARN] ${t}`);
}
function vs(t) {
  console.log(`[dotenv@${gu}][DEBUG] ${t}`);
}
function vy(t) {
  console.log(`[dotenv@${gu}] ${t}`);
}
function wy(t) {
  return t && t.DOTENV_KEY && t.DOTENV_KEY.length > 0 ? t.DOTENV_KEY : process.env.DOTENV_KEY && process.env.DOTENV_KEY.length > 0 ? process.env.DOTENV_KEY : "";
}
function CT(t, e) {
  let r;
  try {
    r = new URL(e);
  } catch (i) {
    if (i.code === "ERR_INVALID_URL") {
      const c = new Error("INVALID_DOTENV_KEY: Wrong format. Must be in valid uri format like dotenv://:key_1234@dotenvx.com/vault/.env.vault?environment=development");
      throw c.code = "INVALID_DOTENV_KEY", c;
    }
    throw i;
  }
  const n = r.password;
  if (!n) {
    const i = new Error("INVALID_DOTENV_KEY: Missing key part");
    throw i.code = "INVALID_DOTENV_KEY", i;
  }
  const s = r.searchParams.get("environment");
  if (!s) {
    const i = new Error("INVALID_DOTENV_KEY: Missing environment part");
    throw i.code = "INVALID_DOTENV_KEY", i;
  }
  const a = `DOTENV_VAULT_${s.toUpperCase()}`, o = t.parsed[a];
  if (!o) {
    const i = new Error(`NOT_FOUND_DOTENV_ENVIRONMENT: Cannot locate environment ${a} in your .env.vault file.`);
    throw i.code = "NOT_FOUND_DOTENV_ENVIRONMENT", i;
  }
  return { ciphertext: o, key: n };
}
function by(t) {
  let e = null;
  if (t && t.path && t.path.length > 0)
    if (Array.isArray(t.path))
      for (const r of t.path)
        Gi.existsSync(r) && (e = r.endsWith(".vault") ? r : `${r}.vault`);
    else
      e = t.path.endsWith(".vault") ? t.path : `${t.path}.vault`;
  else
    e = Ya.resolve(process.cwd(), ".env.vault");
  return Gi.existsSync(e) ? e : null;
}
function Of(t) {
  return t[0] === "~" ? Ya.join(ET.homedir(), t.slice(1)) : t;
}
function jT(t) {
  const e = yn(process.env.DOTENV_CONFIG_DEBUG || t && t.debug), r = yn(process.env.DOTENV_CONFIG_QUIET || t && t.quiet);
  (e || !r) && vy("Loading env from encrypted .env.vault");
  const n = Ne._parseVault(t);
  let s = process.env;
  return t && t.processEnv != null && (s = t.processEnv), Ne.populate(s, n, t), { parsed: n };
}
function MT(t) {
  const e = Ya.resolve(process.cwd(), ".env");
  let r = "utf8", n = process.env;
  t && t.processEnv != null && (n = t.processEnv);
  let s = yn(n.DOTENV_CONFIG_DEBUG || t && t.debug), a = yn(n.DOTENV_CONFIG_QUIET || t && t.quiet);
  t && t.encoding ? r = t.encoding : s && vs("No encoding is specified. UTF-8 is used by default");
  let o = [e];
  if (t && t.path)
    if (!Array.isArray(t.path))
      o = [Of(t.path)];
    else {
      o = [];
      for (const l of t.path)
        o.push(Of(l));
    }
  let i;
  const c = {};
  for (const l of o)
    try {
      const f = Ne.parse(Gi.readFileSync(l, { encoding: r }));
      Ne.populate(c, f, t);
    } catch (f) {
      s && vs(`Failed to load ${l} ${f.message}`), i = f;
    }
  const d = Ne.populate(n, c, t);
  if (s = yn(n.DOTENV_CONFIG_DEBUG || s), a = yn(n.DOTENV_CONFIG_QUIET || a), s || !a) {
    const l = Object.keys(d).length, f = [];
    for (const _ of o)
      try {
        const p = Ya.relative(process.cwd(), _);
        f.push(p);
      } catch (p) {
        s && vs(`Failed to load ${_} ${p.message}`), i = p;
      }
    vy(`injecting env (${l}) from ${f.join(",")} ${IT(`-- tip: ${RT()}`)}`);
  }
  return i ? { parsed: c, error: i } : { parsed: c };
}
function DT(t) {
  if (wy(t).length === 0)
    return Ne.configDotenv(t);
  const e = by(t);
  return e ? Ne._configVault(t) : (AT(`You set DOTENV_KEY but you are missing a .env.vault file at ${e}. Did you forget to build it?`), Ne.configDotenv(t));
}
function LT(t, e) {
  const r = Buffer.from(e.slice(-64), "hex");
  let n = Buffer.from(t, "base64");
  const s = n.subarray(0, 12), a = n.subarray(-16);
  n = n.subarray(12, -16);
  try {
    const o = ST.createDecipheriv("aes-256-gcm", r, s);
    return o.setAuthTag(a), `${o.update(n)}${o.final()}`;
  } catch (o) {
    const i = o instanceof RangeError, c = o.message === "Invalid key length", d = o.message === "Unsupported state or unable to authenticate data";
    if (i || c) {
      const l = new Error("INVALID_DOTENV_KEY: It must be 64 characters long (or more)");
      throw l.code = "INVALID_DOTENV_KEY", l;
    } else if (d) {
      const l = new Error("DECRYPTION_FAILED: Please check your DOTENV_KEY");
      throw l.code = "DECRYPTION_FAILED", l;
    } else
      throw o;
  }
}
function FT(t, e, r = {}) {
  const n = !!(r && r.debug), s = !!(r && r.override), a = {};
  if (typeof e != "object") {
    const o = new Error("OBJECT_REQUIRED: Please check the processEnv argument being passed to populate");
    throw o.code = "OBJECT_REQUIRED", o;
  }
  for (const o of Object.keys(e))
    Object.prototype.hasOwnProperty.call(t, o) ? (s === !0 && (t[o] = e[o], a[o] = e[o]), n && vs(s === !0 ? `"${o}" is already defined and WAS overwritten` : `"${o}" is already defined and was NOT overwritten`)) : (t[o] = e[o], a[o] = e[o]);
  return a;
}
const Ne = {
  configDotenv: MT,
  _configVault: jT,
  _parseVault: kT,
  config: DT,
  decrypt: LT,
  parse: TT,
  populate: FT
};
Jt.exports.configDotenv = Ne.configDotenv;
Jt.exports._configVault = Ne._configVault;
Jt.exports._parseVault = Ne._parseVault;
Jt.exports.config = Ne.config;
Jt.exports.decrypt = Ne.decrypt;
Jt.exports.parse = Ne.parse;
Jt.exports.populate = Ne.populate;
Jt.exports = Ne;
var VT = Jt.exports;
const xT = /* @__PURE__ */ Ji(VT);
xT.config({ path: re.join(process.cwd(), ".env") });
let os = null;
function Ey() {
  const e = Rn.get("preferences").apiKey;
  if (!e)
    throw new Error("No OpenAI API Key found. Please set it in Settings.");
  return (!os || os.apiKey !== e) && (os = new ue({
    apiKey: e,
    dangerouslyAllowBrowser: !0
  })), os;
}
const _u = re.dirname(Cy(import.meta.url));
process.env.APP_ROOT = re.join(_u, "..");
const Ss = process.env.VITE_DEV_SERVER_URL, Ok = re.join(process.env.APP_ROOT, "dist-electron"), vu = re.join(process.env.APP_ROOT, "dist");
process.env.VITE_PUBLIC = Ss ? re.join(process.env.APP_ROOT, "public") : vu;
let ye, ke, da = null, wu = !1;
function bu() {
  ye = new Za({
    width: 1250,
    height: 800,
    icon: re.join(process.env.VITE_PUBLIC, "electron-vite.svg"),
    titleBarStyle: "hidden",
    trafficLightPosition: { x: 16, y: 16 },
    // Explicitly disabling frame to ensure no system borders render
    frame: !1,
    // Custom/CSS shadow only. System shadow causes artifacts with custom border radius.
    hasShadow: !1,
    // transparent: true is required for custom rounded corners (masking the rectangular window)
    transparent: !0,
    // REMOVED vibrancy: 'sidebar' because it fills the rectangular window bounds, 
    // creating "grey bits" in the corners outside our custom border-radius.
    // vibrancy: 'sidebar', 
    // visualEffectState: 'active',
    backgroundColor: "#00000000",
    // Explicitly transparent
    webPreferences: {
      preload: re.join(_u, "preload.mjs")
    }
  }), Ss ? ye.loadURL(Ss) : ye.loadFile(re.join(vu, "index.html")), ye.on("close", (t) => (wu || (t.preventDefault(), ye == null || ye.hide()), !1));
}
function UT() {
  const t = re.join(process.env.APP_ROOT, "build", "tray.png"), e = Ny.createFromPath(t).resize({ width: 22, height: 22 });
  e.setTemplateImage(!0), da = new Ty(e), da.setToolTip("Stroke.ai");
  const r = ky.buildFromTemplate([
    {
      label: "Open Dashboard",
      click: () => ye == null ? void 0 : ye.show()
    },
    { type: "separator" },
    {
      label: "Quit",
      click: () => {
        wu = !0, ht.quit();
      }
    }
  ]);
  da.setContextMenu(r), da.on("double-click", () => {
    ye == null || ye.show();
  });
}
let on = 4444;
function Sy(t = 0) {
  if (t > 100) {
    console.error("[Electron Server] Failed to find an open port after 100 attempts.");
    return;
  }
  const r = jy.createServer((n, s) => {
    if (n.method === "POST" && n.url === "/trigger") {
      let a = "";
      n.on("data", (o) => {
        a += o.toString();
      }), n.on("end", () => {
        try {
          const o = JSON.parse(a), i = o.message || "triggered";
          console.log(`[Electron Server] Received trigger: ${i}`), ke && !ke.isDestroyed() ? ke.webContents.send("trigger", o) : console.log("[Electron Server] Overlay window not found or destroyed"), s.writeHead(200, { "Content-Type": "application/json" }), s.end(JSON.stringify({ status: "ok" }));
        } catch (o) {
          console.error("Failed to parse trigger body", o), s.writeHead(400), s.end(JSON.stringify({ status: "error", message: "Invalid JSON" }));
        }
      });
    } else
      s.writeHead(404), s.end();
  });
  r.on("error", (n) => {
    n.code === "EADDRINUSE" ? (console.log(`[Electron Server] Port ${on} is in use, trying ${on + 1}...`), on++, r.close(), Sy(t + 1)) : console.error(`[Electron Server] Failed to start server on port ${on}:`, n);
  }), r.listen(on, "127.0.0.1", () => {
    console.log(`[Electron Main] Listening for triggers on http://127.0.0.1:${on}`);
  });
}
function Py() {
  const t = Tf.getPrimaryDisplay(), { width: e, height: r } = t.workAreaSize, n = 300, s = 60, a = Math.round(e / 2 - n / 2), o = Math.round(r - 80);
  if (console.log(`Creating overlay at x=${a}, y=${o}, width=${e}, height=${r}`), ke = new Za({
    width: n,
    height: s,
    x: a,
    y: o,
    frame: !1,
    transparent: !0,
    alwaysOnTop: !0,
    hasShadow: !1,
    resizable: !1,
    focusable: !1,
    // Prevent stealing focus
    webPreferences: {
      preload: re.join(_u, "preload.mjs")
    },
    type: "panel",
    minimizable: !1
  }), ke.setAlwaysOnTop(!0, "floating", 1), ke.setVisibleOnAllWorkspaces(!0, { visibleOnFullScreen: !0 }), ke.setIgnoreMouseEvents(!0), Ss) {
    const i = `${Ss}?overlay`;
    console.log(`Loading overlay URL: ${i}`), ke.loadURL(i);
  } else
    ke.loadFile(re.join(vu, "index.html"), { search: "?overlay" });
}
function Ry() {
  bu(), Py(), Sy(), process.platform === "darwin" && ht.dock.show(), ye && (ye.show(), ye.focus()), js();
}
ht.on("before-quit", () => {
  console.log("[Electron Main] App is quitting...");
});
ht.on("window-all-closed", () => {
  process.platform !== "darwin" && (ht.quit(), ye = null, ke = null);
});
ht.on("activate", () => {
  Za.getAllWindows().length === 0 ? Ry() : !ye || ye.isDestroyed() ? (bu(), ye == null || ye.show()) : (ye.isMinimized() && ye.restore(), ye.show(), ye.focus());
});
ht.whenReady().then(Ry);
const qT = `
You are an automation planner for a macOS keyboard-shortcut agent.
Given a natural language command, you respond with a JSON workflow.

Device Context:
You will receive a "context" JSON object with the user's name, environment and existing hotkeys.
The "reserved_hotkeys" list contains keys that are ALREADY IN USE. You MUST NOT use them.
If you suggest a hotkey that is in "reserved_hotkeys", the system will reject your plan.
Pick a unique key (e.g. use a different letter).

Tools Available (Client-Side Execution):
1. "debug_log": { text: string }
2. "open_url": { url: string }
3. "wait": { seconds: float }
4. "copy_selection": {} (Cmd+C)
5. "paste_clipboard": {} (Cmd+V)
6. "open_app": { name: string }
7. "press_enter": {}
8. "focus_url_bar": {} (Cmd+L)
9. "append_to_clipboard": { text: string }
10. "replace_clipboard": { text: string }
11. "transform_clipboard": { instruction: string }
   - Uses an LLM to rewrite/transform the clipboard content in-place.
   - Use this for "rewrite this", "explain this", "tailor this prompt", "audit this code", OR "draft a reply to this".
12. "snap_window": { target: "left" | "right" | "top" | "bottom" | "maximize", app_name?: string }
    - If you just opened an app, PASS "app_name" to ensure the correct window is snapped.
13. "press_key": { key: string, mods?: string[] }
    - Simulates a keystroke. "key" is a single character (e.g. "c") or special key.
    - "mods" is an array: "cmd", "alt", "ctrl", "shift".

Usage Rules:
- Return ONLY JSON.
- The JSON object MUST have a "reasoning" field where you explain your plan step-by-step before generating the "steps" array.
- Do NOT use reserved hotkeys. Check "reserved_hotkeys" in the context. If a conflict exists, choose a different key.
- Prefer efficient tool chains.
- Use the provided context (e.g. username) to personalize instructions.
- WEB APPS: When interacting with websites (Gmail, YouTube, etc), prefer their native single-key shortcuts (e.g. 'c' for compose, 'k' for pause) over OS-standard shortcuts like Cmd+N or Space.
- ACTION URLS (WEB ONLY): If a task can be accomplished by opening a specific URL (e.g. "mail.google.com/...?compose=new"), PREFER that over opening the homepage and pressing keys. It is faster and error-proof.
- DESKTOP APPS: If the user explicitly asks for a desktop app (e.g. "Open Outlook", "Open Notes"), use "open_app". Do NOT use "open_url" for native apps unless it is clearly a web-only service (like Gmail). IMPORTANT: Use the FULL macOS application name (e.g. "Microsoft Outlook" instead of "Outlook", "Google Chrome" instead of "Chrome").
- For transform_clipboard: If the task implies a personal response(like an email reply), explicitly tell the LLM to sign off or refer to the user by their name from the context.
- CRITICAL: If the user wants to modify, explain, or generate text based on their selection, use "transform_clipboard" instead of opening a browser.It is much faster.

ALWAYS respond with ONLY the JSON object.No backticks, no markdown, no explanation.

  Example 1: "Tailor this prompt for an LLM"
{
  "reasoning": "The user wants to refine text for an LLM. 1. I need to get the current text (copy). 2. Use the transform tool to rewrite it. 3. Paste it back. 'Cmd+T' might be common, so I'll use Cmd+Alt+T which is safer.",
    "name": "Tailor prompt for LLM",
      "hotkey": { "mods": ["cmd", "alt"], "key": "T" },
  "steps": [
    { "tool": "debug_log", "input": { "text": "Tailoring prompt..." } },
    { "tool": "copy_selection", "input": {} },
    { "tool": "wait", "input": { "seconds": 0.2 } },
    { "tool": "transform_clipboard", "input": { "instruction": "Refine this text to be a high-quality, precise LLM prompt." } },
    { "tool": "wait", "input": { "seconds": 0.2 } },
    { "tool": "paste_clipboard", "input": {} }
  ]
}

Example 2: "Draft a polite reply to this email"
{
  "name": "Draft polite reply",
    "hotkey": { "mods": ["cmd", "alt"], "key": "R" },
  "steps": [
    { "tool": "debug_log", "input": { "text": "Drafting reply..." } },
    { "tool": "copy_selection", "input": {} },
    { "tool": "wait", "input": { "seconds": 0.3 } },
    { "tool": "transform_clipboard", "input": { "instruction": "Write a short, polite reply to this email." } },
    { "tool": "wait", "input": { "seconds": 0.3 } },
    { "tool": "paste_clipboard", "input": {} }
  ]
}

Example 3: "Snap window left"
{
  "name": "Snap Left",
    "hotkey": { "mods": ["cmd", "alt"], "key": "Left" },
  "steps": [
    { "tool": "snap_window", "input": { "target": "left", "app_name": "Google Chrome" } }
  ]
}

Example 4: "Open Gmail and draft email"
{
  "reasoning": "User wants to draft email. The most robust way is to use the direct compose URL (?compose=new) which works even if hotkeys are disabled.",
    "name": "Draft Email",
      "hotkey": { "mods": ["cmd", "alt"], "key": "C" },
  "steps": [
    { "tool": "debug_log", "input": { "text": "Opening Gmail Compose..." } },
    { "tool": "open_url", "input": { "url": "https://mail.google.com/mail/u/0/#inbox?compose=new" } }
  ]
}
`;
function zT() {
  const t = Yr.get("workflows", []), e = t.map((a) => ({
    id: a.id,
    name: a.name,
    hotkey: a.hotkey
  })), n = Rn.get("preferences").overlayHotkey || { mods: ["cmd", "alt"], key: "O" }, s = t.map((a) => a.hotkey).filter((a) => a !== void 0);
  return n && s.push(n), {
    environment: {
      os: "macOS",
      name: eo.userInfo().username,
      default_browser: Rn.get("preferences").defaultBrowser || "Google Chrome"
    },
    preferences: {
      default_hotkey_mods: ["cmd", "alt"],
      chatgpt_url: "https://chatgpt.com",
      default_wait_seconds: 0.4
    },
    existing_workflows: e,
    reserved_hotkeys: s
  };
}
async function KT(t) {
  const e = zT(), r = JSON.stringify(e, null, 2), a = (await Ey().chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: qT },
      { role: "system", content: `Context: 
${r} ` },
      { role: "user", content: t }
    ],
    response_format: { type: "json_object" }
  })).choices[0].message.content || "{}";
  try {
    const o = JSON.parse(a);
    if (!o.steps) throw new Error("No steps generated");
    return o.id = crypto.randomUUID(), o.name || (o.name = t.slice(0, 50)), o.reasoning && console.log(`[Planner Reasoning]: ${o.reasoning} `), o;
  } catch (o) {
    throw new Error("Failed to parse LLM plan: " + o);
  }
}
async function GT(t, e) {
  const r = Ey(), n = eo.userInfo().username;
  return (await r.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: `You are a text transformation assistant. The user's name is ${n}. Your goal is to strictly follow the transformation instruction. Modify the text only as much as needed to fulfill the request. Maintain the core idea and original style. Do not overly transform or rewrite unnecessarily. Be concise. Return ONLY the transformed text. No explanation.` },
      { role: "user", content: `Instruction: ${e}

Input Text:
${t}` }
    ]
  })).choices[0].message.content || "";
}
const Qa = new Wl({
  name: "run-history",
  defaults: { history: [] }
}), Yr = new Wl({
  name: "workflows",
  defaults: { workflows: [] }
}), Rn = new Wl({
  name: "preferences",
  defaults: {
    preferences: {
      apiKey: "",
      defaultBrowser: "Google Chrome",
      overlayHotkey: { mods: ["cmd", "alt"], key: "O" }
    }
  }
});
mr.handle("get-preferences", () => Rn.get("preferences"));
mr.handle("save-preferences", (t, e) => (Rn.set("preferences", e), os = null, js(), { status: "success" }));
mr.handle("get-workflows", () => Yr.get("workflows", []));
mr.handle("save-workflow", (t, e) => {
  const r = Yr.get("workflows", []), n = r.findIndex((s) => s.id === e.id);
  return n >= 0 ? r[n] = e : r.push(e), Yr.set("workflows", r), js(), { status: "success" };
});
mr.handle("delete-workflow", (t, e) => {
  const n = Yr.get("workflows", []).filter((s) => s.id !== e);
  return Yr.set("workflows", n), js(), { status: "success" };
});
mr.handle("plan-workflow", async (t, e) => {
  try {
    return { status: "success", workflow: await KT(e) };
  } catch (r) {
    return console.error("Planning failed:", r), { status: "error", message: r.message };
  }
});
function js() {
  const t = Yr.get("workflows", []);
  console.log(`[Workflows] Reloading ${t.length} workflows...`), Bi.clear(), Co.unregisterAll();
  try {
    const r = Rn.get("preferences").overlayHotkey || { mods: ["cmd", "alt"], key: "O" }, n = (s) => s === "cmd" ? "Command" : s === "alt" ? "Alt" : s === "ctrl" ? "Control" : s === "shift" ? "Shift" : s;
    if (r.key) {
      const s = [...(r.mods || []).map(n), r.key].join("+");
      Co.register(s, () => {
        console.log("[System] Toggling Overlay"), ke && !ke.isDestroyed() && (ke.isVisible() ? ke.hide() : ke.showInactive());
      });
    }
  } catch (e) {
    console.error("[Hotkeys] Failed to register overlay toggle:", e);
  }
  t.forEach((e) => {
    if (Bi.set(e.id, e), e.hotkey && e.hotkey.key) {
      const r = e.hotkey.mods || [];
      if (r.length === 0) return;
      const n = (a) => a === "cmd" ? "Command" : a === "alt" ? "Alt" : a === "ctrl" ? "Control" : a === "shift" ? "Shift" : a, s = [...r.map(n), e.hotkey.key].join("+");
      try {
        Co.register(s, () => {
          JT(e.id, e.name);
        });
      } catch (a) {
        console.error(`[Hotkeys] Error registering ${s}:`, a);
      }
    }
  });
}
mr.handle("get-run-history", () => Qa.get("history", []).reverse());
mr.handle("clear-run-history", () => (Qa.set("history", []), !0));
function Ar(t) {
  return new Promise((e, r) => {
    const s = `osascript -e '${t.replace(/'/g, "'\\''")}'`;
    kf(s, (a, o, i) => {
      if (a) {
        r(a);
        return;
      }
      e(o.trim());
    });
  });
}
function If(t) {
  return new Promise((e) => setTimeout(e, t * 1e3));
}
function BT() {
  return new Promise((t) => {
    kf(`python3 -c '
import sys
import time
from ctypes import cdll, util

cg_path = util.find_library("CoreGraphics")
if not cg_path:
    sys.exit(0)

cg = cdll.LoadLibrary(cg_path)
# kCGEventSourceStateHIDSystemState = 1
# Masks: Shift(0x20000), Control(0x40000), Alt(0x80000), Command(0x100000)
MASK = 0x20000 | 0x40000 | 0x80000 | 0x100000

for i in range(20): # Try for 2 seconds
    flags = cg.CGEventSourceFlagsState(1)
    if not (flags & MASK):
        sys.exit(0)
    time.sleep(0.05)
'`, { timeout: 2100 }, () => {
      t();
    });
  });
}
const HT = {
  debug_log: async (t) => (console.log("[Tool:debug_log]", t.text), { success: !0, text: t.text }),
  wait: async (t) => {
    const e = Number(t.seconds) || 1;
    return console.log(`[Tool:wait] Sleeping ${e}s`), await If(e), { success: !0 };
  },
  open_url: async (t) => {
    const e = t.url;
    return e ? (console.log(`[Tool:open_url] Opening ${e}`), await Ay.openExternal(e), { success: !0 }) : { success: !1, text: "No URL" };
  },
  open_app: async (t) => {
    const e = t.name;
    if (!e) return { success: !1, text: "No app name" };
    console.log(`[Tool:open_app] Activating ${e}`);
    try {
      return await Ar(`tell application "${e}" to activate`), { success: !0 };
    } catch (r) {
      return { success: !1, text: String(r) };
    }
  },
  copy_selection: async () => {
    console.log("[Tool:copy_selection] Waiting for key release then Cmd+C");
    try {
      return await BT(), await Ar('tell application "System Events" to keystroke "c" using command down'), await If(0.2), { success: !0 };
    } catch (t) {
      return { success: !1, text: String(t) };
    }
  },
  paste_clipboard: async () => {
    console.log("[Tool:paste_clipboard] Cmd+V");
    try {
      return await Ar('tell application "System Events" to keystroke "v" using command down'), { success: !0 };
    } catch (t) {
      return { success: !1, text: String(t) };
    }
  },
  press_enter: async () => {
    console.log("[Tool:press_enter]");
    try {
      return await Ar('tell application "System Events" to key code 36'), { success: !0 };
    } catch (t) {
      return { success: !1, text: String(t) };
    }
  },
  focus_url_bar: async () => {
    console.log("[Tool:focus_url_bar]");
    try {
      return await Ar('tell application "System Events" to keystroke "l" using command down'), { success: !0 };
    } catch (t) {
      return { success: !1, text: String(t) };
    }
  },
  press_key: async (t) => {
    const e = t.key, r = t.mods || [];
    if (console.log(`[Tool:press_key] Pressing ${e} with mods: ${r}`), !e) return { success: !1, text: "No key provided" };
    const n = {
      cmd: "command down",
      alt: "option down",
      ctrl: "control down",
      shift: "shift down"
    }, s = r.map((i) => n[i]).filter(Boolean).join(", "), a = s ? ` using {${s}}` : "";
    let o = "";
    e.toLowerCase() === "enter" || e.toLowerCase() === "return" ? o = `tell application "System Events" to key code 36${a}` : o = `tell application "System Events" to keystroke "${e}"${a}`;
    try {
      return await Ar(o), { success: !0 };
    } catch (i) {
      return { success: !1, text: String(i) };
    }
  },
  append_to_clipboard: async (t) => {
    const e = t.text || "", r = Un.readText();
    return Un.writeText(r + `
` + e), { success: !0 };
  },
  snap_window: async (t) => {
    const e = t.target || "maximize";
    console.log(`[Tool:snap_window] Snapping to ${e}`);
    const r = Tf.getPrimaryDisplay(), { x: n, y: s, width: a, height: o } = r.workArea;
    let i = n, c = s, d = a, l = o;
    e === "left" ? d = a / 2 : e === "right" ? (i = n + a / 2, d = a / 2) : e === "top" ? l = o / 2 : e === "bottom" && (c = s + o / 2, l = o / 2), i = Math.floor(i), c = Math.floor(c), d = Math.floor(d), l = Math.floor(l), d = Math.floor(d), l = Math.floor(l);
    const f = t.app_name, _ = f ? `process "${f}"` : "first application process whose frontmost is true", p = `
      tell application "${f || "System Events"}" to activate
      tell application "System Events"
        set targetProc to ${_}
        set frontWindow to first window of targetProc
        set position of frontWindow to {${i}, ${c}}
        set size of frontWindow to {${d}, ${l}}
      end tell
    `;
    try {
      return await Ar(p), { success: !0 };
    } catch (w) {
      return { success: !1, text: String(w) };
    }
  },
  replace_clipboard: async (t) => {
    const e = t.text || "";
    return Un.writeText(e), { success: !0 };
  },
  transform_clipboard: async (t) => {
    const e = t.instruction || "Improve this text";
    console.log(`[Tool:transform_clipboard] ${e}`);
    try {
      const r = Un.readText();
      if (!r) return { success: !1, text: "Clipboard empty" };
      const n = await GT(r, e);
      return n ? (Un.writeText(n), { success: !0, text: "Transformed clipboard" }) : { success: !1, text: "No result from LLM" };
    } catch (r) {
      return console.error("Transform failed", r), { success: !1, text: String(r) };
    }
  }
};
async function WT(t) {
  console.log("--- Executing Plan ---");
  for (const e of t) {
    const r = HT[e.tool];
    if (r)
      try {
        await r(e.input || {});
      } catch (n) {
        console.error(`Error executing ${e.tool}:`, n);
      }
    else
      console.warn(`Unknown tool: ${e.tool}`);
  }
  console.log("--- Plan Complete ---");
}
const Bi = /* @__PURE__ */ new Map();
async function JT(t, e) {
  console.log(`[Trigger] Workflow ${t} (${e}) triggered`);
  const r = Bi.get(t);
  if (!r) {
    console.error(`[Trigger] Workflow ${t} not found in registry`);
    return;
  }
  ke && !ke.isDestroyed() && ke.webContents.send("trigger", {
    message: `Running: ${e}`,
    hotkey: r.hotkey
  });
  let n = "success";
  const s = [];
  if (r.steps && r.steps.length > 0)
    try {
      await WT(r.steps);
    } catch (i) {
      n = "error", console.error("Workflow execution failed", i);
    }
  else
    console.log("[Trigger] No steps to execute.");
  const a = {
    id: crypto.randomUUID(),
    workflowId: t,
    workflowName: e,
    timestamp: Date.now(),
    status: n,
    results: s
    // Populating results would require refactoring executePlan
  }, o = Qa.get("history", []);
  o.push(a), o.length > 50 && o.shift(), Qa.set("history", o), ye && !ye.isDestroyed() && ye.webContents.send("run-history-updated");
}
ht.whenReady().then(() => {
  UT(), js();
});
ht.on("window-all-closed", () => {
  process.platform !== "darwin" && ht.quit();
});
ht.on("activate", () => {
  Za.getAllWindows().length === 0 ? (bu(), Py()) : ye == null || ye.show();
});
ht.on("before-quit", () => {
  wu = !0;
});
export {
  Ok as MAIN_DIST,
  vu as RENDERER_DIST,
  Ss as VITE_DEV_SERVER_URL
};
