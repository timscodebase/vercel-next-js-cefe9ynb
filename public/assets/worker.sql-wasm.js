// We are modularizing this manually because the current modularize setting in Emscripten has some issues:
// https://github.com/kripken/emscripten/issues/5820
// In addition, When you use emcc's modularization, it still expects to export a global object called `Module`,
// which is able to be used/called before the WASM is loaded.
// The modularization below exports a promise that loads and resolves to the actual sql.js module.
// That way, this module can't be used before the WASM is finished loading.

// We are going to define a function that a user will call to start loading initializing our Sql.js library
// However, that function might be called multiple times, and on subsequent calls, we don't actually want it to instantiate a new instance of the Module
// Instead, we want to return the previously loaded module

// TODO: Make this not declare a global if used in the browser
var initSqlJsPromise = undefined;

var initSqlJs = function (moduleConfig) {
  if (initSqlJsPromise) {
    return initSqlJsPromise;
  }
  // If we're here, we've never called this function before
  initSqlJsPromise = new Promise(function (resolveModule, reject) {
    // We are modularizing this manually because the current modularize setting in Emscripten has some issues:
    // https://github.com/kripken/emscripten/issues/5820

    // The way to affect the loading of emcc compiled modules is to create a variable called `Module` and add
    // properties to it, like `preRun`, `postRun`, etc
    // We are using that to get notified when the WASM has finished loading.
    // Only then will we return our promise

    // If they passed in a moduleConfig object, use that
    // Otherwise, initialize Module to the empty object
    var Module = typeof moduleConfig !== 'undefined' ? moduleConfig : {};

    // EMCC only allows for a single onAbort function (not an array of functions)
    // So if the user defined their own onAbort function, we remember it and call it
    var originalOnAbortFunction = Module['onAbort'];
    Module['onAbort'] = function (errorThatCausedAbort) {
      reject(new Error(errorThatCausedAbort));
      if (originalOnAbortFunction) {
        originalOnAbortFunction(errorThatCausedAbort);
      }
    };

    Module['postRun'] = Module['postRun'] || [];
    Module['postRun'].push(function () {
      // When Emscripted calls postRun, this promise resolves with the built Module
      resolveModule(Module);
    });

    // There is a section of code in the emcc-generated code below that looks like this:
    // (Note that this is lowercase `module`)
    // if (typeof module !== 'undefined') {
    //     module['exports'] = Module;
    // }
    // When that runs, it's going to overwrite our own modularization export efforts in shell-post.js!
    // The only way to tell emcc not to emit it is to pass the MODULARIZE=1 or MODULARIZE_INSTANCE=1 flags,
    // but that carries with it additional unnecessary baggage/bugs we don't want either.
    // So, we have three options:
    // 1) We undefine `module`
    // 2) We remember what `module['exports']` was at the beginning of this function and we restore it later
    // 3) We write a script to remove those lines of code as part of the Make process.
    //
    // Since those are the only lines of code that care about module, we will undefine it. It's the most straightforward
    // of the options, and has the side effect of reducing emcc's efforts to modify the module if its output were to change in the future.
    // That's a nice side effect since we're handling the modularization efforts ourselves
    module = undefined;

    // The emcc-generated code and shell-post.js code goes below,
    // meaning that all of it runs inside of this promise. If anything throws an exception, our promise will abort

    var e;
    e || (e = typeof Module !== 'undefined' ? Module : {});
    null;
    e.onRuntimeInitialized = function () {
      function a(h, l) {
        this.Ka = h;
        this.db = l;
        this.Ia = 1;
        this.cb = [];
      }
      function b(h, l) {
        this.db = l;
        l = aa(h) + 1;
        this.Xa = ba(l);
        if (null === this.Xa)
          throw Error('Unable to allocate memory for the SQL string');
        k(h, n, this.Xa, l);
        this.bb = this.Xa;
        this.Ta = this.hb = null;
      }
      function c(h) {
        this.filename = 'dbfile_' + ((4294967295 * Math.random()) >>> 0);
        if (null != h) {
          var l = this.filename,
            p = '/',
            q = l;
          p &&
            ((p = 'string' == typeof p ? p : ca(p)),
            (q = l ? t(p + '/' + l) : p));
          l = ea(!0, !0);
          q = fa(q, ((void 0 !== l ? l : 438) & 4095) | 32768, 0);
          if (h) {
            if ('string' == typeof h) {
              p = Array(h.length);
              for (var y = 0, H = h.length; y < H; ++y) p[y] = h.charCodeAt(y);
              h = p;
            }
            ha(q, l | 146);
            p = w(q, 577);
            ia(p, h, 0, h.length, 0, void 0);
            ja(p);
            ha(q, l);
          }
        }
        this.handleError(g(this.filename, d));
        this.db = x(d, 'i32');
        ac(this.db);
        this.Ya = {};
        this.Qa = {};
      }
      var d = z(4),
        f = e.cwrap,
        g = f('sqlite3_open', 'number', ['string', 'number']),
        m = f('sqlite3_close_v2', 'number', ['number']),
        r = f('sqlite3_exec', 'number', [
          'number',
          'string',
          'number',
          'number',
          'number',
        ]),
        u = f('sqlite3_changes', 'number', ['number']),
        v = f('sqlite3_prepare_v2', 'number', [
          'number',
          'string',
          'number',
          'number',
          'number',
        ]),
        B = f('sqlite3_sql', 'string', ['number']),
        R = f('sqlite3_normalized_sql', 'string', ['number']),
        La = f('sqlite3_prepare_v2', 'number', [
          'number',
          'number',
          'number',
          'number',
          'number',
        ]),
        bc = f('sqlite3_bind_text', 'number', [
          'number',
          'number',
          'number',
          'number',
          'number',
        ]),
        kb = f('sqlite3_bind_blob', 'number', [
          'number',
          'number',
          'number',
          'number',
          'number',
        ]),
        cc = f('sqlite3_bind_double', 'number', ['number', 'number', 'number']),
        dc = f('sqlite3_bind_int', 'number', ['number', 'number', 'number']),
        ec = f('sqlite3_bind_parameter_index', 'number', ['number', 'string']),
        fc = f('sqlite3_step', 'number', ['number']),
        gc = f('sqlite3_errmsg', 'string', ['number']),
        hc = f('sqlite3_column_count', 'number', ['number']),
        ic = f('sqlite3_data_count', 'number', ['number']),
        jc = f('sqlite3_column_double', 'number', ['number', 'number']),
        lb = f('sqlite3_column_text', 'string', ['number', 'number']),
        kc = f('sqlite3_column_blob', 'number', ['number', 'number']),
        lc = f('sqlite3_column_bytes', 'number', ['number', 'number']),
        mc = f('sqlite3_column_type', 'number', ['number', 'number']),
        nc = f('sqlite3_column_name', 'string', ['number', 'number']),
        oc = f('sqlite3_reset', 'number', ['number']),
        pc = f('sqlite3_clear_bindings', 'number', ['number']),
        qc = f('sqlite3_finalize', 'number', ['number']),
        rc = f(
          'sqlite3_create_function_v2',
          'number',
          'number string number number number number number number number'.split(
            ' '
          )
        ),
        sc = f('sqlite3_value_type', 'number', ['number']),
        tc = f('sqlite3_value_bytes', 'number', ['number']),
        uc = f('sqlite3_value_text', 'string', ['number']),
        vc = f('sqlite3_value_blob', 'number', ['number']),
        wc = f('sqlite3_value_double', 'number', ['number']),
        xc = f('sqlite3_result_double', '', ['number', 'number']),
        mb = f('sqlite3_result_null', '', ['number']),
        yc = f('sqlite3_result_text', '', [
          'number',
          'string',
          'number',
          'number',
        ]),
        zc = f('sqlite3_result_blob', '', [
          'number',
          'number',
          'number',
          'number',
        ]),
        Ac = f('sqlite3_result_int', '', ['number', 'number']),
        nb = f('sqlite3_result_error', '', ['number', 'string', 'number']),
        ac = f('RegisterExtensionFunctions', 'number', ['number']);
      a.prototype.bind = function (h) {
        if (!this.Ka) throw 'Statement closed';
        this.reset();
        return Array.isArray(h)
          ? this.wb(h)
          : null != h && 'object' === typeof h
          ? this.xb(h)
          : !0;
      };
      a.prototype.step = function () {
        if (!this.Ka) throw 'Statement closed';
        this.Ia = 1;
        var h = fc(this.Ka);
        switch (h) {
          case 100:
            return !0;
          case 101:
            return !1;
          default:
            throw this.db.handleError(h);
        }
      };
      a.prototype.rb = function (h) {
        null == h && ((h = this.Ia), (this.Ia += 1));
        return jc(this.Ka, h);
      };
      a.prototype.Bb = function (h) {
        null == h && ((h = this.Ia), (this.Ia += 1));
        h = lb(this.Ka, h);
        if ('function' !== typeof BigInt)
          throw Error('BigInt is not supported');
        return BigInt(h);
      };
      a.prototype.Cb = function (h) {
        null == h && ((h = this.Ia), (this.Ia += 1));
        return lb(this.Ka, h);
      };
      a.prototype.getBlob = function (h) {
        null == h && ((h = this.Ia), (this.Ia += 1));
        var l = lc(this.Ka, h);
        h = kc(this.Ka, h);
        for (var p = new Uint8Array(l), q = 0; q < l; q += 1) p[q] = A[h + q];
        return p;
      };
      a.prototype.get = function (h, l) {
        l = l || {};
        null != h && this.bind(h) && this.step();
        h = [];
        for (var p = ic(this.Ka), q = 0; q < p; q += 1)
          switch (mc(this.Ka, q)) {
            case 1:
              var y = l.useBigInt ? this.Bb(q) : this.rb(q);
              h.push(y);
              break;
            case 2:
              h.push(this.rb(q));
              break;
            case 3:
              h.push(this.Cb(q));
              break;
            case 4:
              h.push(this.getBlob(q));
              break;
            default:
              h.push(null);
          }
        return h;
      };
      a.prototype.getColumnNames = function () {
        for (var h = [], l = hc(this.Ka), p = 0; p < l; p += 1)
          h.push(nc(this.Ka, p));
        return h;
      };
      a.prototype.getAsObject = function (h, l) {
        h = this.get(h, l);
        l = this.getColumnNames();
        for (var p = {}, q = 0; q < l.length; q += 1) p[l[q]] = h[q];
        return p;
      };
      a.prototype.getSQL = function () {
        return B(this.Ka);
      };
      a.prototype.getNormalizedSQL = function () {
        return R(this.Ka);
      };
      a.prototype.run = function (h) {
        null != h && this.bind(h);
        this.step();
        return this.reset();
      };
      a.prototype.mb = function (h, l) {
        null == l && ((l = this.Ia), (this.Ia += 1));
        h = ka(h);
        var p = la(h);
        this.cb.push(p);
        this.db.handleError(bc(this.Ka, l, p, h.length - 1, 0));
      };
      a.prototype.vb = function (h, l) {
        null == l && ((l = this.Ia), (this.Ia += 1));
        var p = la(h);
        this.cb.push(p);
        this.db.handleError(kb(this.Ka, l, p, h.length, 0));
      };
      a.prototype.lb = function (h, l) {
        null == l && ((l = this.Ia), (this.Ia += 1));
        this.db.handleError((h === (h | 0) ? dc : cc)(this.Ka, l, h));
      };
      a.prototype.yb = function (h) {
        null == h && ((h = this.Ia), (this.Ia += 1));
        kb(this.Ka, h, 0, 0, 0);
      };
      a.prototype.nb = function (h, l) {
        null == l && ((l = this.Ia), (this.Ia += 1));
        switch (typeof h) {
          case 'string':
            this.mb(h, l);
            return;
          case 'number':
            this.lb(h, l);
            return;
          case 'bigint':
            this.mb(h.toString(), l);
            return;
          case 'boolean':
            this.lb(h + 0, l);
            return;
          case 'object':
            if (null === h) {
              this.yb(l);
              return;
            }
            if (null != h.length) {
              this.vb(h, l);
              return;
            }
        }
        throw (
          'Wrong API use : tried to bind a value of an unknown type (' +
          h +
          ').'
        );
      };
      a.prototype.xb = function (h) {
        var l = this;
        Object.keys(h).forEach(function (p) {
          var q = ec(l.Ka, p);
          0 !== q && l.nb(h[p], q);
        });
        return !0;
      };
      a.prototype.wb = function (h) {
        for (var l = 0; l < h.length; l += 1) this.nb(h[l], l + 1);
        return !0;
      };
      a.prototype.reset = function () {
        this.freemem();
        return 0 === pc(this.Ka) && 0 === oc(this.Ka);
      };
      a.prototype.freemem = function () {
        for (var h; void 0 !== (h = this.cb.pop()); ) ma(h);
      };
      a.prototype.free = function () {
        this.freemem();
        var h = 0 === qc(this.Ka);
        delete this.db.Ya[this.Ka];
        this.Ka = 0;
        return h;
      };
      b.prototype.next = function () {
        if (null === this.Xa) return { done: !0 };
        null !== this.Ta && (this.Ta.free(), (this.Ta = null));
        if (!this.db.db) throw (this.fb(), Error('Database closed'));
        var h = na(),
          l = z(4);
        oa(d);
        oa(l);
        try {
          this.db.handleError(La(this.db.db, this.bb, -1, d, l));
          this.bb = x(l, 'i32');
          var p = x(d, 'i32');
          if (0 === p) return this.fb(), { done: !0 };
          this.Ta = new a(p, this.db);
          this.db.Ya[p] = this.Ta;
          return { value: this.Ta, done: !1 };
        } catch (q) {
          throw ((this.hb = D(this.bb)), this.fb(), q);
        } finally {
          pa(h);
        }
      };
      b.prototype.fb = function () {
        ma(this.Xa);
        this.Xa = null;
      };
      b.prototype.getRemainingSQL = function () {
        return null !== this.hb ? this.hb : D(this.bb);
      };
      'function' === typeof Symbol &&
        'symbol' === typeof Symbol.iterator &&
        (b.prototype[Symbol.iterator] = function () {
          return this;
        });
      c.prototype.run = function (h, l) {
        if (!this.db) throw 'Database closed';
        if (l) {
          h = this.prepare(h, l);
          try {
            h.step();
          } finally {
            h.free();
          }
        } else this.handleError(r(this.db, h, 0, 0, d));
        return this;
      };
      c.prototype.exec = function (h, l, p) {
        if (!this.db) throw 'Database closed';
        var q = na(),
          y = null;
        try {
          var H = aa(h) + 1,
            E = z(H);
          k(h, A, E, H);
          var da = E;
          var X = z(4);
          for (h = []; 0 !== x(da, 'i8'); ) {
            oa(d);
            oa(X);
            this.handleError(La(this.db, da, -1, d, X));
            var C = x(d, 'i32');
            da = x(X, 'i32');
            if (0 !== C) {
              H = null;
              y = new a(C, this);
              for (null != l && y.bind(l); y.step(); )
                null === H &&
                  ((H = { columns: y.getColumnNames(), values: [] }),
                  h.push(H)),
                  H.values.push(y.get(null, p));
              y.free();
            }
          }
          return h;
        } catch (I) {
          throw (y && y.free(), I);
        } finally {
          pa(q);
        }
      };
      c.prototype.each = function (h, l, p, q, y) {
        'function' === typeof l && ((q = p), (p = l), (l = void 0));
        h = this.prepare(h, l);
        try {
          for (; h.step(); ) p(h.getAsObject(null, y));
        } finally {
          h.free();
        }
        if ('function' === typeof q) return q();
      };
      c.prototype.prepare = function (h, l) {
        oa(d);
        this.handleError(v(this.db, h, -1, d, 0));
        h = x(d, 'i32');
        if (0 === h) throw 'Nothing to prepare';
        var p = new a(h, this);
        null != l && p.bind(l);
        return (this.Ya[h] = p);
      };
      c.prototype.iterateStatements = function (h) {
        return new b(h, this);
      };
      c.prototype['export'] = function () {
        Object.values(this.Ya).forEach(function (l) {
          l.free();
        });
        Object.values(this.Qa).forEach(qa);
        this.Qa = {};
        this.handleError(m(this.db));
        var h = ra(this.filename);
        this.handleError(g(this.filename, d));
        this.db = x(d, 'i32');
        return h;
      };
      c.prototype.close = function () {
        null !== this.db &&
          (Object.values(this.Ya).forEach(function (h) {
            h.free();
          }),
          Object.values(this.Qa).forEach(qa),
          (this.Qa = {}),
          this.handleError(m(this.db)),
          sa('/' + this.filename),
          (this.db = null));
      };
      c.prototype.handleError = function (h) {
        if (0 === h) return null;
        h = gc(this.db);
        throw Error(h);
      };
      c.prototype.getRowsModified = function () {
        return u(this.db);
      };
      c.prototype.create_function = function (h, l) {
        Object.prototype.hasOwnProperty.call(this.Qa, h) &&
          (qa(this.Qa[h]), delete this.Qa[h]);
        var p = ta(function (q, y, H) {
          for (var E, da = [], X = 0; X < y; X += 1) {
            var C = x(H + 4 * X, 'i32'),
              I = sc(C);
            if (1 === I || 2 === I) C = wc(C);
            else if (3 === I) C = uc(C);
            else if (4 === I) {
              I = C;
              C = tc(I);
              I = vc(I);
              for (var qb = new Uint8Array(C), va = 0; va < C; va += 1)
                qb[va] = A[I + va];
              C = qb;
            } else C = null;
            da.push(C);
          }
          try {
            E = l.apply(null, da);
          } catch (Dc) {
            nb(q, Dc, -1);
            return;
          }
          switch (typeof E) {
            case 'boolean':
              Ac(q, E ? 1 : 0);
              break;
            case 'number':
              xc(q, E);
              break;
            case 'string':
              yc(q, E, -1, -1);
              break;
            case 'object':
              null === E
                ? mb(q)
                : null != E.length
                ? ((y = la(E)), zc(q, y, E.length, -1), ma(y))
                : nb(
                    q,
                    'Wrong API use : tried to return a value of an unknown type (' +
                      E +
                      ').',
                    -1
                  );
              break;
            default:
              mb(q);
          }
        });
        this.Qa[h] = p;
        this.handleError(rc(this.db, h, l.length, 1, 0, p, 0, 0, 0));
        return this;
      };
      e.Database = c;
    };
    var ua = Object.assign({}, e),
      wa = './this.program',
      xa = 'object' == typeof window,
      ya = 'function' == typeof importScripts,
      za =
        'object' == typeof process &&
        'object' == typeof process.versions &&
        'string' == typeof process.versions.node,
      F = '',
      Aa,
      Ba,
      Ca,
      fs,
      Da,
      Ea;
    if (za)
      (F = ya ? require('path').dirname(F) + '/' : __dirname + '/'),
        (Ea = () => {
          Da || ((fs = require('fs')), (Da = require('path')));
        }),
        (Aa = function (a, b) {
          Ea();
          a = Da.normalize(a);
          return fs.readFileSync(a, b ? void 0 : 'utf8');
        }),
        (Ca = (a) => {
          a = Aa(a, !0);
          a.buffer || (a = new Uint8Array(a));
          return a;
        }),
        (Ba = (a, b, c) => {
          Ea();
          a = Da.normalize(a);
          fs.readFile(a, function (d, f) {
            d ? c(d) : b(f.buffer);
          });
        }),
        1 < process.argv.length && (wa = process.argv[1].replace(/\\/g, '/')),
        process.argv.slice(2),
        'undefined' != typeof module && (module.exports = e),
        (e.inspect = function () {
          return '[Emscripten Module object]';
        });
    else if (xa || ya)
      ya
        ? (F = self.location.href)
        : 'undefined' != typeof document &&
          document.currentScript &&
          (F = document.currentScript.src),
        (F =
          0 !== F.indexOf('blob:')
            ? F.substr(0, F.replace(/[?#].*/, '').lastIndexOf('/') + 1)
            : ''),
        (Aa = (a) => {
          var b = new XMLHttpRequest();
          b.open('GET', a, !1);
          b.send(null);
          return b.responseText;
        }),
        ya &&
          (Ca = (a) => {
            var b = new XMLHttpRequest();
            b.open('GET', a, !1);
            b.responseType = 'arraybuffer';
            b.send(null);
            return new Uint8Array(b.response);
          }),
        (Ba = (a, b, c) => {
          var d = new XMLHttpRequest();
          d.open('GET', a, !0);
          d.responseType = 'arraybuffer';
          d.onload = () => {
            200 == d.status || (0 == d.status && d.response)
              ? b(d.response)
              : c();
          };
          d.onerror = c;
          d.send(null);
        });
    var Fa = e.print || console.log.bind(console),
      G = e.printErr || console.warn.bind(console);
    Object.assign(e, ua);
    ua = null;
    e.thisProgram && (wa = e.thisProgram);
    var Ga = [],
      J;
    function ta(a) {
      if (!J) {
        J = new WeakMap();
        for (var b = K.length, c = 0; c < 0 + b; c++) {
          var d = K.get(c);
          d && J.set(d, c);
        }
      }
      if (J.has(a)) return J.get(a);
      if (Ga.length) b = Ga.pop();
      else {
        try {
          K.grow(1);
        } catch (g) {
          if (!(g instanceof RangeError)) throw g;
          throw 'Unable to grow wasm table. Set ALLOW_TABLE_GROWTH.';
        }
        b = K.length - 1;
      }
      try {
        K.set(b, a);
      } catch (g) {
        if (!(g instanceof TypeError)) throw g;
        if ('function' == typeof WebAssembly.Function) {
          d = { i: 'i32', j: 'i64', f: 'f32', d: 'f64' };
          var f = { parameters: [], results: [] };
          for (c = 1; 4 > c; ++c) f.parameters.push(d['viii'[c]]);
          c = new WebAssembly.Function(f, a);
        } else {
          d = [1, 0, 1, 96];
          f = { i: 127, j: 126, f: 125, d: 124 };
          d.push(3);
          for (c = 0; 3 > c; ++c) d.push(f['iii'[c]]);
          d.push(0);
          d[1] = d.length - 2;
          c = new Uint8Array(
            [0, 97, 115, 109, 1, 0, 0, 0].concat(
              d,
              [2, 7, 1, 1, 101, 1, 102, 0, 0, 7, 5, 1, 1, 102, 0, 0]
            )
          );
          c = new WebAssembly.Module(c);
          c = new WebAssembly.Instance(c, { e: { f: a } }).exports.f;
        }
        K.set(b, c);
      }
      J.set(a, b);
      return b;
    }
    function qa(a) {
      J.delete(K.get(a));
      Ga.push(a);
    }
    var Ha;
    e.wasmBinary && (Ha = e.wasmBinary);
    var noExitRuntime = e.noExitRuntime || !0;
    'object' != typeof WebAssembly && L('no native wasm support detected');
    function oa(a) {
      var b = 'i32';
      '*' === b.charAt(b.length - 1) && (b = 'i32');
      switch (b) {
        case 'i1':
          A[a >> 0] = 0;
          break;
        case 'i8':
          A[a >> 0] = 0;
          break;
        case 'i16':
          Ia[a >> 1] = 0;
          break;
        case 'i32':
          M[a >> 2] = 0;
          break;
        case 'i64':
          N = [
            0,
            ((O = 0),
            1 <= +Math.abs(O)
              ? 0 < O
                ? (Math.min(+Math.floor(O / 4294967296), 4294967295) | 0) >>> 0
                : ~~+Math.ceil((O - +(~~O >>> 0)) / 4294967296) >>> 0
              : 0),
          ];
          M[a >> 2] = N[0];
          M[(a + 4) >> 2] = N[1];
          break;
        case 'float':
          Ja[a >> 2] = 0;
          break;
        case 'double':
          Ka[a >> 3] = 0;
          break;
        default:
          L('invalid type for setValue: ' + b);
      }
    }
    function x(a, b = 'i8') {
      '*' === b.charAt(b.length - 1) && (b = 'i32');
      switch (b) {
        case 'i1':
          return A[a >> 0];
        case 'i8':
          return A[a >> 0];
        case 'i16':
          return Ia[a >> 1];
        case 'i32':
          return M[a >> 2];
        case 'i64':
          return M[a >> 2];
        case 'float':
          return Ja[a >> 2];
        case 'double':
          return Number(Ka[a >> 3]);
        default:
          L('invalid type for getValue: ' + b);
      }
      return null;
    }
    var Ma,
      Na = !1;
    function Oa(a, b, c, d) {
      var f = {
        string: function (v) {
          var B = 0;
          if (null !== v && void 0 !== v && 0 !== v) {
            var R = (v.length << 2) + 1;
            B = z(R);
            k(v, n, B, R);
          }
          return B;
        },
        array: function (v) {
          var B = z(v.length);
          A.set(v, B);
          return B;
        },
      };
      a = e['_' + a];
      var g = [],
        m = 0;
      if (d)
        for (var r = 0; r < d.length; r++) {
          var u = f[c[r]];
          u ? (0 === m && (m = na()), (g[r] = u(d[r]))) : (g[r] = d[r]);
        }
      c = a.apply(null, g);
      return (c = (function (v) {
        0 !== m && pa(m);
        return 'string' === b ? D(v) : 'boolean' === b ? !!v : v;
      })(c));
    }
    var Pa = 0,
      Qa = 1;
    function la(a) {
      var b = Pa == Qa ? z(a.length) : ba(a.length);
      a.subarray || a.slice || (a = new Uint8Array(a));
      n.set(a, b);
      return b;
    }
    var Ra =
      'undefined' != typeof TextDecoder ? new TextDecoder('utf8') : void 0;
    function Sa(a, b, c) {
      var d = b + c;
      for (c = b; a[c] && !(c >= d); ) ++c;
      if (16 < c - b && a.buffer && Ra) return Ra.decode(a.subarray(b, c));
      for (d = ''; b < c; ) {
        var f = a[b++];
        if (f & 128) {
          var g = a[b++] & 63;
          if (192 == (f & 224)) d += String.fromCharCode(((f & 31) << 6) | g);
          else {
            var m = a[b++] & 63;
            f =
              224 == (f & 240)
                ? ((f & 15) << 12) | (g << 6) | m
                : ((f & 7) << 18) | (g << 12) | (m << 6) | (a[b++] & 63);
            65536 > f
              ? (d += String.fromCharCode(f))
              : ((f -= 65536),
                (d += String.fromCharCode(
                  55296 | (f >> 10),
                  56320 | (f & 1023)
                )));
          }
        } else d += String.fromCharCode(f);
      }
      return d;
    }
    function D(a, b) {
      return a ? Sa(n, a, b) : '';
    }
    function k(a, b, c, d) {
      if (!(0 < d)) return 0;
      var f = c;
      d = c + d - 1;
      for (var g = 0; g < a.length; ++g) {
        var m = a.charCodeAt(g);
        if (55296 <= m && 57343 >= m) {
          var r = a.charCodeAt(++g);
          m = (65536 + ((m & 1023) << 10)) | (r & 1023);
        }
        if (127 >= m) {
          if (c >= d) break;
          b[c++] = m;
        } else {
          if (2047 >= m) {
            if (c + 1 >= d) break;
            b[c++] = 192 | (m >> 6);
          } else {
            if (65535 >= m) {
              if (c + 2 >= d) break;
              b[c++] = 224 | (m >> 12);
            } else {
              if (c + 3 >= d) break;
              b[c++] = 240 | (m >> 18);
              b[c++] = 128 | ((m >> 12) & 63);
            }
            b[c++] = 128 | ((m >> 6) & 63);
          }
          b[c++] = 128 | (m & 63);
        }
      }
      b[c] = 0;
      return c - f;
    }
    function aa(a) {
      for (var b = 0, c = 0; c < a.length; ++c) {
        var d = a.charCodeAt(c);
        55296 <= d &&
          57343 >= d &&
          (d = (65536 + ((d & 1023) << 10)) | (a.charCodeAt(++c) & 1023));
        127 >= d ? ++b : (b = 2047 >= d ? b + 2 : 65535 >= d ? b + 3 : b + 4);
      }
      return b;
    }
    function Ta(a) {
      var b = aa(a) + 1,
        c = ba(b);
      c && k(a, A, c, b);
      return c;
    }
    var Ua, A, n, Ia, M, Ja, Ka;
    function Va() {
      var a = Ma.buffer;
      Ua = a;
      e.HEAP8 = A = new Int8Array(a);
      e.HEAP16 = Ia = new Int16Array(a);
      e.HEAP32 = M = new Int32Array(a);
      e.HEAPU8 = n = new Uint8Array(a);
      e.HEAPU16 = new Uint16Array(a);
      e.HEAPU32 = new Uint32Array(a);
      e.HEAPF32 = Ja = new Float32Array(a);
      e.HEAPF64 = Ka = new Float64Array(a);
    }
    var K,
      Wa = [],
      Xa = [],
      Ya = [];
    function Za() {
      var a = e.preRun.shift();
      Wa.unshift(a);
    }
    var $a = 0,
      ab = null,
      bb = null;
    e.preloadedImages = {};
    e.preloadedAudios = {};
    function L(a) {
      if (e.onAbort) e.onAbort(a);
      a = 'Aborted(' + a + ')';
      G(a);
      Na = !0;
      throw new WebAssembly.RuntimeError(
        a + '. Build with -s ASSERTIONS=1 for more info.'
      );
    }
    function cb() {
      return P.startsWith('data:application/octet-stream;base64,');
    }
    var P;
    P = 'sql-wasm.wasm';
    if (!cb()) {
      var db = P;
      P = e.locateFile ? e.locateFile(db, F) : F + db;
    }
    function eb() {
      var a = P;
      try {
        if (a == P && Ha) return new Uint8Array(Ha);
        if (Ca) return Ca(a);
        throw 'both async and sync fetching of the wasm failed';
      } catch (b) {
        L(b);
      }
    }
    function fb() {
      if (!Ha && (xa || ya)) {
        if ('function' == typeof fetch && !P.startsWith('file://'))
          return fetch(P, { credentials: 'same-origin' })
            .then(function (a) {
              if (!a.ok) throw "failed to load wasm binary file at '" + P + "'";
              return a.arrayBuffer();
            })
            .catch(function () {
              return eb();
            });
        if (Ba)
          return new Promise(function (a, b) {
            Ba(
              P,
              function (c) {
                a(new Uint8Array(c));
              },
              b
            );
          });
      }
      return Promise.resolve().then(function () {
        return eb();
      });
    }
    var O, N;
    function gb(a) {
      for (; 0 < a.length; ) {
        var b = a.shift();
        if ('function' == typeof b) b(e);
        else {
          var c = b.Ib;
          'number' == typeof c
            ? void 0 === b.eb
              ? K.get(c)()
              : K.get(c)(b.eb)
            : c(void 0 === b.eb ? null : b.eb);
        }
      }
    }
    function hb(a, b) {
      for (var c = 0, d = a.length - 1; 0 <= d; d--) {
        var f = a[d];
        '.' === f
          ? a.splice(d, 1)
          : '..' === f
          ? (a.splice(d, 1), c++)
          : c && (a.splice(d, 1), c--);
      }
      if (b) for (; c; c--) a.unshift('..');
      return a;
    }
    function t(a) {
      var b = '/' === a.charAt(0),
        c = '/' === a.substr(-1);
      (a = hb(
        a.split('/').filter(function (d) {
          return !!d;
        }),
        !b
      ).join('/')) ||
        b ||
        (a = '.');
      a && c && (a += '/');
      return (b ? '/' : '') + a;
    }
    function ib(a) {
      var b = /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/
        .exec(a)
        .slice(1);
      a = b[0];
      b = b[1];
      if (!a && !b) return '.';
      b && (b = b.substr(0, b.length - 1));
      return a + b;
    }
    function jb(a) {
      if ('/' === a) return '/';
      a = t(a);
      a = a.replace(/\/$/, '');
      var b = a.lastIndexOf('/');
      return -1 === b ? a : a.substr(b + 1);
    }
    function ob() {
      if (
        'object' == typeof crypto &&
        'function' == typeof crypto.getRandomValues
      ) {
        var a = new Uint8Array(1);
        return function () {
          crypto.getRandomValues(a);
          return a[0];
        };
      }
      if (za)
        try {
          var b = require('crypto');
          return function () {
            return b.randomBytes(1)[0];
          };
        } catch (c) {}
      return function () {
        L('randomDevice');
      };
    }
    function pb() {
      for (var a = '', b = !1, c = arguments.length - 1; -1 <= c && !b; c--) {
        b = 0 <= c ? arguments[c] : '/';
        if ('string' != typeof b)
          throw new TypeError('Arguments to path.resolve must be strings');
        if (!b) return '';
        a = b + '/' + a;
        b = '/' === b.charAt(0);
      }
      a = hb(
        a.split('/').filter(function (d) {
          return !!d;
        }),
        !b
      ).join('/');
      return (b ? '/' : '') + a || '.';
    }
    var rb = [];
    function sb(a, b) {
      rb[a] = { input: [], output: [], Wa: b };
      tb(a, ub);
    }
    var ub = {
        open: function (a) {
          var b = rb[a.node.rdev];
          if (!b) throw new Q(43);
          a.tty = b;
          a.seekable = !1;
        },
        close: function (a) {
          a.tty.Wa.flush(a.tty);
        },
        flush: function (a) {
          a.tty.Wa.flush(a.tty);
        },
        read: function (a, b, c, d) {
          if (!a.tty || !a.tty.Wa.sb) throw new Q(60);
          for (var f = 0, g = 0; g < d; g++) {
            try {
              var m = a.tty.Wa.sb(a.tty);
            } catch (r) {
              throw new Q(29);
            }
            if (void 0 === m && 0 === f) throw new Q(6);
            if (null === m || void 0 === m) break;
            f++;
            b[c + g] = m;
          }
          f && (a.node.timestamp = Date.now());
          return f;
        },
        write: function (a, b, c, d) {
          if (!a.tty || !a.tty.Wa.ib) throw new Q(60);
          try {
            for (var f = 0; f < d; f++) a.tty.Wa.ib(a.tty, b[c + f]);
          } catch (g) {
            throw new Q(29);
          }
          d && (a.node.timestamp = Date.now());
          return f;
        },
      },
      vb = {
        sb: function (a) {
          if (!a.input.length) {
            var b = null;
            if (za) {
              var c = Buffer.alloc(256),
                d = 0;
              try {
                d = fs.readSync(process.stdin.fd, c, 0, 256, -1);
              } catch (f) {
                if (f.toString().includes('EOF')) d = 0;
                else throw f;
              }
              0 < d ? (b = c.slice(0, d).toString('utf-8')) : (b = null);
            } else
              'undefined' != typeof window && 'function' == typeof window.prompt
                ? ((b = window.prompt('Input: ')), null !== b && (b += '\n'))
                : 'function' == typeof readline &&
                  ((b = readline()), null !== b && (b += '\n'));
            if (!b) return null;
            a.input = ka(b, !0);
          }
          return a.input.shift();
        },
        ib: function (a, b) {
          null === b || 10 === b
            ? (Fa(Sa(a.output, 0)), (a.output = []))
            : 0 != b && a.output.push(b);
        },
        flush: function (a) {
          a.output &&
            0 < a.output.length &&
            (Fa(Sa(a.output, 0)), (a.output = []));
        },
      },
      wb = {
        ib: function (a, b) {
          null === b || 10 === b
            ? (G(Sa(a.output, 0)), (a.output = []))
            : 0 != b && a.output.push(b);
        },
        flush: function (a) {
          a.output &&
            0 < a.output.length &&
            (G(Sa(a.output, 0)), (a.output = []));
        },
      },
      S = {
        Oa: null,
        Pa: function () {
          return S.createNode(null, '/', 16895, 0);
        },
        createNode: function (a, b, c, d) {
          if (24576 === (c & 61440) || 4096 === (c & 61440)) throw new Q(63);
          S.Oa ||
            (S.Oa = {
              dir: {
                node: {
                  Na: S.Fa.Na,
                  Ma: S.Fa.Ma,
                  lookup: S.Fa.lookup,
                  Za: S.Fa.Za,
                  rename: S.Fa.rename,
                  unlink: S.Fa.unlink,
                  rmdir: S.Fa.rmdir,
                  readdir: S.Fa.readdir,
                  symlink: S.Fa.symlink,
                },
                stream: { Sa: S.Ga.Sa },
              },
              file: {
                node: { Na: S.Fa.Na, Ma: S.Fa.Ma },
                stream: {
                  Sa: S.Ga.Sa,
                  read: S.Ga.read,
                  write: S.Ga.write,
                  kb: S.Ga.kb,
                  $a: S.Ga.$a,
                  ab: S.Ga.ab,
                },
              },
              link: {
                node: { Na: S.Fa.Na, Ma: S.Fa.Ma, readlink: S.Fa.readlink },
                stream: {},
              },
              ob: { node: { Na: S.Fa.Na, Ma: S.Fa.Ma }, stream: xb },
            });
          c = yb(a, b, c, d);
          16384 === (c.mode & 61440)
            ? ((c.Fa = S.Oa.dir.node), (c.Ga = S.Oa.dir.stream), (c.Ha = {}))
            : 32768 === (c.mode & 61440)
            ? ((c.Fa = S.Oa.file.node),
              (c.Ga = S.Oa.file.stream),
              (c.La = 0),
              (c.Ha = null))
            : 40960 === (c.mode & 61440)
            ? ((c.Fa = S.Oa.link.node), (c.Ga = S.Oa.link.stream))
            : 8192 === (c.mode & 61440) &&
              ((c.Fa = S.Oa.ob.node), (c.Ga = S.Oa.ob.stream));
          c.timestamp = Date.now();
          a && ((a.Ha[b] = c), (a.timestamp = c.timestamp));
          return c;
        },
        Jb: function (a) {
          return a.Ha
            ? a.Ha.subarray
              ? a.Ha.subarray(0, a.La)
              : new Uint8Array(a.Ha)
            : new Uint8Array(0);
        },
        pb: function (a, b) {
          var c = a.Ha ? a.Ha.length : 0;
          c >= b ||
            ((b = Math.max(b, (c * (1048576 > c ? 2 : 1.125)) >>> 0)),
            0 != c && (b = Math.max(b, 256)),
            (c = a.Ha),
            (a.Ha = new Uint8Array(b)),
            0 < a.La && a.Ha.set(c.subarray(0, a.La), 0));
        },
        Fb: function (a, b) {
          if (a.La != b)
            if (0 == b) (a.Ha = null), (a.La = 0);
            else {
              var c = a.Ha;
              a.Ha = new Uint8Array(b);
              c && a.Ha.set(c.subarray(0, Math.min(b, a.La)));
              a.La = b;
            }
        },
        Fa: {
          Na: function (a) {
            var b = {};
            b.dev = 8192 === (a.mode & 61440) ? a.id : 1;
            b.ino = a.id;
            b.mode = a.mode;
            b.nlink = 1;
            b.uid = 0;
            b.gid = 0;
            b.rdev = a.rdev;
            16384 === (a.mode & 61440)
              ? (b.size = 4096)
              : 32768 === (a.mode & 61440)
              ? (b.size = a.La)
              : 40960 === (a.mode & 61440)
              ? (b.size = a.link.length)
              : (b.size = 0);
            b.atime = new Date(a.timestamp);
            b.mtime = new Date(a.timestamp);
            b.ctime = new Date(a.timestamp);
            b.zb = 4096;
            b.blocks = Math.ceil(b.size / b.zb);
            return b;
          },
          Ma: function (a, b) {
            void 0 !== b.mode && (a.mode = b.mode);
            void 0 !== b.timestamp && (a.timestamp = b.timestamp);
            void 0 !== b.size && S.Fb(a, b.size);
          },
          lookup: function () {
            throw zb[44];
          },
          Za: function (a, b, c, d) {
            return S.createNode(a, b, c, d);
          },
          rename: function (a, b, c) {
            if (16384 === (a.mode & 61440)) {
              try {
                var d = Ab(b, c);
              } catch (g) {}
              if (d) for (var f in d.Ha) throw new Q(55);
            }
            delete a.parent.Ha[a.name];
            a.parent.timestamp = Date.now();
            a.name = c;
            b.Ha[c] = a;
            b.timestamp = a.parent.timestamp;
            a.parent = b;
          },
          unlink: function (a, b) {
            delete a.Ha[b];
            a.timestamp = Date.now();
          },
          rmdir: function (a, b) {
            var c = Ab(a, b),
              d;
            for (d in c.Ha) throw new Q(55);
            delete a.Ha[b];
            a.timestamp = Date.now();
          },
          readdir: function (a) {
            var b = ['.', '..'],
              c;
            for (c in a.Ha) a.Ha.hasOwnProperty(c) && b.push(c);
            return b;
          },
          symlink: function (a, b, c) {
            a = S.createNode(a, b, 41471, 0);
            a.link = c;
            return a;
          },
          readlink: function (a) {
            if (40960 !== (a.mode & 61440)) throw new Q(28);
            return a.link;
          },
        },
        Ga: {
          read: function (a, b, c, d, f) {
            var g = a.node.Ha;
            if (f >= a.node.La) return 0;
            a = Math.min(a.node.La - f, d);
            if (8 < a && g.subarray) b.set(g.subarray(f, f + a), c);
            else for (d = 0; d < a; d++) b[c + d] = g[f + d];
            return a;
          },
          write: function (a, b, c, d, f, g) {
            b.buffer === A.buffer && (g = !1);
            if (!d) return 0;
            a = a.node;
            a.timestamp = Date.now();
            if (b.subarray && (!a.Ha || a.Ha.subarray)) {
              if (g) return (a.Ha = b.subarray(c, c + d)), (a.La = d);
              if (0 === a.La && 0 === f)
                return (a.Ha = b.slice(c, c + d)), (a.La = d);
              if (f + d <= a.La) return a.Ha.set(b.subarray(c, c + d), f), d;
            }
            S.pb(a, f + d);
            if (a.Ha.subarray && b.subarray) a.Ha.set(b.subarray(c, c + d), f);
            else for (g = 0; g < d; g++) a.Ha[f + g] = b[c + g];
            a.La = Math.max(a.La, f + d);
            return d;
          },
          Sa: function (a, b, c) {
            1 === c
              ? (b += a.position)
              : 2 === c && 32768 === (a.node.mode & 61440) && (b += a.node.La);
            if (0 > b) throw new Q(28);
            return b;
          },
          kb: function (a, b, c) {
            S.pb(a.node, b + c);
            a.node.La = Math.max(a.node.La, b + c);
          },
          $a: function (a, b, c, d, f, g) {
            if (0 !== b) throw new Q(28);
            if (32768 !== (a.node.mode & 61440)) throw new Q(43);
            a = a.node.Ha;
            if (g & 2 || a.buffer !== Ua) {
              if (0 < d || d + c < a.length)
                a.subarray
                  ? (a = a.subarray(d, d + c))
                  : (a = Array.prototype.slice.call(a, d, d + c));
              d = !0;
              c = 65536 * Math.ceil(c / 65536);
              (g = Bb(65536, c)) ? (n.fill(0, g, g + c), (c = g)) : (c = 0);
              if (!c) throw new Q(48);
              A.set(a, c);
            } else (d = !1), (c = a.byteOffset);
            return { Eb: c, ub: d };
          },
          ab: function (a, b, c, d, f) {
            if (32768 !== (a.node.mode & 61440)) throw new Q(43);
            if (f & 2) return 0;
            S.Ga.write(a, b, 0, d, c, !1);
            return 0;
          },
        },
      },
      Cb = null,
      Db = {},
      T = [],
      Eb = 1,
      U = null,
      Fb = !0,
      Q = null,
      zb = {},
      V = (a, b = {}) => {
        a = pb('/', a);
        if (!a) return { path: '', node: null };
        b = Object.assign({ qb: !0, jb: 0 }, b);
        if (8 < b.jb) throw new Q(32);
        a = hb(
          a.split('/').filter((m) => !!m),
          !1
        );
        for (var c = Cb, d = '/', f = 0; f < a.length; f++) {
          var g = f === a.length - 1;
          if (g && b.parent) break;
          c = Ab(c, a[f]);
          d = t(d + '/' + a[f]);
          c.Ua && (!g || (g && b.qb)) && (c = c.Ua.root);
          if (!g || b.Ra)
            for (g = 0; 40960 === (c.mode & 61440); )
              if (
                ((c = Gb(d)),
                (d = pb(ib(d), c)),
                (c = V(d, { jb: b.jb + 1 }).node),
                40 < g++)
              )
                throw new Q(32);
        }
        return { path: d, node: c };
      },
      ca = (a) => {
        for (var b; ; ) {
          if (a === a.parent)
            return (
              (a = a.Pa.tb),
              b ? ('/' !== a[a.length - 1] ? a + '/' + b : a + b) : a
            );
          b = b ? a.name + '/' + b : a.name;
          a = a.parent;
        }
      },
      Hb = (a, b) => {
        for (var c = 0, d = 0; d < b.length; d++)
          c = ((c << 5) - c + b.charCodeAt(d)) | 0;
        return ((a + c) >>> 0) % U.length;
      },
      Ib = (a) => {
        var b = Hb(a.parent.id, a.name);
        if (U[b] === a) U[b] = a.Va;
        else
          for (b = U[b]; b; ) {
            if (b.Va === a) {
              b.Va = a.Va;
              break;
            }
            b = b.Va;
          }
      },
      Ab = (a, b) => {
        var c;
        if ((c = (c = Jb(a, 'x')) ? c : a.Fa.lookup ? 0 : 2)) throw new Q(c, a);
        for (c = U[Hb(a.id, b)]; c; c = c.Va) {
          var d = c.name;
          if (c.parent.id === a.id && d === b) return c;
        }
        return a.Fa.lookup(a, b);
      },
      yb = (a, b, c, d) => {
        a = new Kb(a, b, c, d);
        b = Hb(a.parent.id, a.name);
        a.Va = U[b];
        return (U[b] = a);
      },
      Lb = { r: 0, 'r+': 2, w: 577, 'w+': 578, a: 1089, 'a+': 1090 },
      Mb = (a) => {
        var b = ['r', 'w', 'rw'][a & 3];
        a & 512 && (b += 'w');
        return b;
      },
      Jb = (a, b) => {
        if (Fb) return 0;
        if (!b.includes('r') || a.mode & 292) {
          if (
            (b.includes('w') && !(a.mode & 146)) ||
            (b.includes('x') && !(a.mode & 73))
          )
            return 2;
        } else return 2;
        return 0;
      },
      Nb = (a, b) => {
        try {
          return Ab(a, b), 20;
        } catch (c) {}
        return Jb(a, 'wx');
      },
      Ob = (a, b, c) => {
        try {
          var d = Ab(a, b);
        } catch (f) {
          return f.Ja;
        }
        if ((a = Jb(a, 'wx'))) return a;
        if (c) {
          if (16384 !== (d.mode & 61440)) return 54;
          if (d === d.parent || '/' === ca(d)) return 10;
        } else if (16384 === (d.mode & 61440)) return 31;
        return 0;
      },
      Pb = (a = 0, b = 4096) => {
        for (; a <= b; a++) if (!T[a]) return a;
        throw new Q(33);
      },
      Rb = (a, b) => {
        Qb || ((Qb = function () {}), (Qb.prototype = {}));
        a = Object.assign(new Qb(), a);
        b = Pb(b, void 0);
        a.fd = b;
        return (T[b] = a);
      },
      xb = {
        open: (a) => {
          a.Ga = Db[a.node.rdev].Ga;
          a.Ga.open && a.Ga.open(a);
        },
        Sa: () => {
          throw new Q(70);
        },
      },
      tb = (a, b) => {
        Db[a] = { Ga: b };
      },
      Sb = (a, b) => {
        var c = '/' === b,
          d = !b;
        if (c && Cb) throw new Q(10);
        if (!c && !d) {
          var f = V(b, { qb: !1 });
          b = f.path;
          f = f.node;
          if (f.Ua) throw new Q(10);
          if (16384 !== (f.mode & 61440)) throw new Q(54);
        }
        b = { type: a, Kb: {}, tb: b, Db: [] };
        a = a.Pa(b);
        a.Pa = b;
        b.root = a;
        c ? (Cb = a) : f && ((f.Ua = b), f.Pa && f.Pa.Db.push(b));
      },
      fa = (a, b, c) => {
        var d = V(a, { parent: !0 }).node;
        a = jb(a);
        if (!a || '.' === a || '..' === a) throw new Q(28);
        var f = Nb(d, a);
        if (f) throw new Q(f);
        if (!d.Fa.Za) throw new Q(63);
        return d.Fa.Za(d, a, b, c);
      },
      W = (a, b) => fa(a, ((void 0 !== b ? b : 511) & 1023) | 16384, 0),
      Tb = (a, b, c) => {
        'undefined' == typeof c && ((c = b), (b = 438));
        fa(a, b | 8192, c);
      },
      Ub = (a, b) => {
        if (!pb(a)) throw new Q(44);
        var c = V(b, { parent: !0 }).node;
        if (!c) throw new Q(44);
        b = jb(b);
        var d = Nb(c, b);
        if (d) throw new Q(d);
        if (!c.Fa.symlink) throw new Q(63);
        c.Fa.symlink(c, b, a);
      },
      Vb = (a) => {
        var b = V(a, { parent: !0 }).node;
        a = jb(a);
        var c = Ab(b, a),
          d = Ob(b, a, !0);
        if (d) throw new Q(d);
        if (!b.Fa.rmdir) throw new Q(63);
        if (c.Ua) throw new Q(10);
        b.Fa.rmdir(b, a);
        Ib(c);
      },
      sa = (a) => {
        var b = V(a, { parent: !0 }).node;
        if (!b) throw new Q(44);
        a = jb(a);
        var c = Ab(b, a),
          d = Ob(b, a, !1);
        if (d) throw new Q(d);
        if (!b.Fa.unlink) throw new Q(63);
        if (c.Ua) throw new Q(10);
        b.Fa.unlink(b, a);
        Ib(c);
      },
      Gb = (a) => {
        a = V(a).node;
        if (!a) throw new Q(44);
        if (!a.Fa.readlink) throw new Q(28);
        return pb(ca(a.parent), a.Fa.readlink(a));
      },
      Wb = (a, b) => {
        a = V(a, { Ra: !b }).node;
        if (!a) throw new Q(44);
        if (!a.Fa.Na) throw new Q(63);
        return a.Fa.Na(a);
      },
      Xb = (a) => Wb(a, !0),
      ha = (a, b) => {
        a = 'string' == typeof a ? V(a, { Ra: !0 }).node : a;
        if (!a.Fa.Ma) throw new Q(63);
        a.Fa.Ma(a, {
          mode: (b & 4095) | (a.mode & -4096),
          timestamp: Date.now(),
        });
      },
      Yb = (a, b) => {
        if (0 > b) throw new Q(28);
        a = 'string' == typeof a ? V(a, { Ra: !0 }).node : a;
        if (!a.Fa.Ma) throw new Q(63);
        if (16384 === (a.mode & 61440)) throw new Q(31);
        if (32768 !== (a.mode & 61440)) throw new Q(28);
        var c = Jb(a, 'w');
        if (c) throw new Q(c);
        a.Fa.Ma(a, { size: b, timestamp: Date.now() });
      },
      w = (a, b, c, d) => {
        if ('' === a) throw new Q(44);
        if ('string' == typeof b) {
          var f = Lb[b];
          if ('undefined' == typeof f)
            throw Error('Unknown file open mode: ' + b);
          b = f;
        }
        c = b & 64 ? (('undefined' == typeof c ? 438 : c) & 4095) | 32768 : 0;
        if ('object' == typeof a) var g = a;
        else {
          a = t(a);
          try {
            g = V(a, { Ra: !(b & 131072) }).node;
          } catch (m) {}
        }
        f = !1;
        if (b & 64)
          if (g) {
            if (b & 128) throw new Q(20);
          } else (g = fa(a, c, 0)), (f = !0);
        if (!g) throw new Q(44);
        8192 === (g.mode & 61440) && (b &= -513);
        if (b & 65536 && 16384 !== (g.mode & 61440)) throw new Q(54);
        if (
          !f &&
          (c = g
            ? 40960 === (g.mode & 61440)
              ? 32
              : 16384 === (g.mode & 61440) && ('r' !== Mb(b) || b & 512)
              ? 31
              : Jb(g, Mb(b))
            : 44)
        )
          throw new Q(c);
        b & 512 && Yb(g, 0);
        b &= -131713;
        d = Rb(
          {
            node: g,
            path: ca(g),
            flags: b,
            seekable: !0,
            position: 0,
            Ga: g.Ga,
            Hb: [],
            error: !1,
          },
          d
        );
        d.Ga.open && d.Ga.open(d);
        !e.logReadFiles || b & 1 || (Zb || (Zb = {}), a in Zb || (Zb[a] = 1));
        return d;
      },
      ja = (a) => {
        if (null === a.fd) throw new Q(8);
        a.gb && (a.gb = null);
        try {
          a.Ga.close && a.Ga.close(a);
        } catch (b) {
          throw b;
        } finally {
          T[a.fd] = null;
        }
        a.fd = null;
      },
      $b = (a, b, c) => {
        if (null === a.fd) throw new Q(8);
        if (!a.seekable || !a.Ga.Sa) throw new Q(70);
        if (0 != c && 1 != c && 2 != c) throw new Q(28);
        a.position = a.Ga.Sa(a, b, c);
        a.Hb = [];
      },
      Bc = (a, b, c, d, f) => {
        if (0 > d || 0 > f) throw new Q(28);
        if (null === a.fd) throw new Q(8);
        if (1 === (a.flags & 2097155)) throw new Q(8);
        if (16384 === (a.node.mode & 61440)) throw new Q(31);
        if (!a.Ga.read) throw new Q(28);
        var g = 'undefined' != typeof f;
        if (!g) f = a.position;
        else if (!a.seekable) throw new Q(70);
        b = a.Ga.read(a, b, c, d, f);
        g || (a.position += b);
        return b;
      },
      ia = (a, b, c, d, f, g) => {
        if (0 > d || 0 > f) throw new Q(28);
        if (null === a.fd) throw new Q(8);
        if (0 === (a.flags & 2097155)) throw new Q(8);
        if (16384 === (a.node.mode & 61440)) throw new Q(31);
        if (!a.Ga.write) throw new Q(28);
        a.seekable && a.flags & 1024 && $b(a, 0, 2);
        var m = 'undefined' != typeof f;
        if (!m) f = a.position;
        else if (!a.seekable) throw new Q(70);
        b = a.Ga.write(a, b, c, d, f, g);
        m || (a.position += b);
        return b;
      },
      ra = (a) => {
        var b = 'binary';
        if ('utf8' !== b && 'binary' !== b)
          throw Error('Invalid encoding type "' + b + '"');
        var c;
        var d = w(a, d || 0);
        a = Wb(a).size;
        var f = new Uint8Array(a);
        Bc(d, f, 0, a, 0);
        'utf8' === b ? (c = Sa(f, 0)) : 'binary' === b && (c = f);
        ja(d);
        return c;
      },
      Cc = () => {
        Q ||
          ((Q = function (a, b) {
            this.node = b;
            this.Gb = function (c) {
              this.Ja = c;
            };
            this.Gb(a);
            this.message = 'FS error';
          }),
          (Q.prototype = Error()),
          (Q.prototype.constructor = Q),
          [44].forEach((a) => {
            zb[a] = new Q(a);
            zb[a].stack = '<generic error, no stack>';
          }));
      },
      Ec,
      ea = (a, b) => {
        var c = 0;
        a && (c |= 365);
        b && (c |= 146);
        return c;
      },
      Gc = (a, b, c) => {
        a = t('/dev/' + a);
        var d = ea(!!b, !!c);
        Fc || (Fc = 64);
        var f = (Fc++ << 8) | 0;
        tb(f, {
          open: (g) => {
            g.seekable = !1;
          },
          close: () => {
            c && c.buffer && c.buffer.length && c(10);
          },
          read: (g, m, r, u) => {
            for (var v = 0, B = 0; B < u; B++) {
              try {
                var R = b();
              } catch (La) {
                throw new Q(29);
              }
              if (void 0 === R && 0 === v) throw new Q(6);
              if (null === R || void 0 === R) break;
              v++;
              m[r + B] = R;
            }
            v && (g.node.timestamp = Date.now());
            return v;
          },
          write: (g, m, r, u) => {
            for (var v = 0; v < u; v++)
              try {
                c(m[r + v]);
              } catch (B) {
                throw new Q(29);
              }
            u && (g.node.timestamp = Date.now());
            return v;
          },
        });
        Tb(a, d, f);
      },
      Fc,
      Y = {},
      Qb,
      Zb;
    function Hc(a, b, c) {
      if ('/' === b[0]) return b;
      if (-100 === a) a = '/';
      else {
        a = T[a];
        if (!a) throw new Q(8);
        a = a.path;
      }
      if (0 == b.length) {
        if (!c) throw new Q(44);
        return a;
      }
      return t(a + '/' + b);
    }
    function Ic(a, b, c) {
      try {
        var d = a(b);
      } catch (f) {
        if (f && f.node && t(b) !== t(ca(f.node))) return -54;
        throw f;
      }
      M[c >> 2] = d.dev;
      M[(c + 4) >> 2] = 0;
      M[(c + 8) >> 2] = d.ino;
      M[(c + 12) >> 2] = d.mode;
      M[(c + 16) >> 2] = d.nlink;
      M[(c + 20) >> 2] = d.uid;
      M[(c + 24) >> 2] = d.gid;
      M[(c + 28) >> 2] = d.rdev;
      M[(c + 32) >> 2] = 0;
      N = [
        d.size >>> 0,
        ((O = d.size),
        1 <= +Math.abs(O)
          ? 0 < O
            ? (Math.min(+Math.floor(O / 4294967296), 4294967295) | 0) >>> 0
            : ~~+Math.ceil((O - +(~~O >>> 0)) / 4294967296) >>> 0
          : 0),
      ];
      M[(c + 40) >> 2] = N[0];
      M[(c + 44) >> 2] = N[1];
      M[(c + 48) >> 2] = 4096;
      M[(c + 52) >> 2] = d.blocks;
      M[(c + 56) >> 2] = (d.atime.getTime() / 1e3) | 0;
      M[(c + 60) >> 2] = 0;
      M[(c + 64) >> 2] = (d.mtime.getTime() / 1e3) | 0;
      M[(c + 68) >> 2] = 0;
      M[(c + 72) >> 2] = (d.ctime.getTime() / 1e3) | 0;
      M[(c + 76) >> 2] = 0;
      N = [
        d.ino >>> 0,
        ((O = d.ino),
        1 <= +Math.abs(O)
          ? 0 < O
            ? (Math.min(+Math.floor(O / 4294967296), 4294967295) | 0) >>> 0
            : ~~+Math.ceil((O - +(~~O >>> 0)) / 4294967296) >>> 0
          : 0),
      ];
      M[(c + 80) >> 2] = N[0];
      M[(c + 84) >> 2] = N[1];
      return 0;
    }
    var Jc = void 0;
    function Kc() {
      Jc += 4;
      return M[(Jc - 4) >> 2];
    }
    function Z(a) {
      a = T[a];
      if (!a) throw new Q(8);
      return a;
    }
    function Lc(a, b, c) {
      function d(u) {
        return (u = u.toTimeString().match(/\(([A-Za-z ]+)\)$/)) ? u[1] : 'GMT';
      }
      var f = new Date().getFullYear(),
        g = new Date(f, 0, 1),
        m = new Date(f, 6, 1);
      f = g.getTimezoneOffset();
      var r = m.getTimezoneOffset();
      M[a >> 2] = 60 * Math.max(f, r);
      M[b >> 2] = Number(f != r);
      a = d(g);
      b = d(m);
      a = Ta(a);
      b = Ta(b);
      r < f
        ? ((M[c >> 2] = a), (M[(c + 4) >> 2] = b))
        : ((M[c >> 2] = b), (M[(c + 4) >> 2] = a));
    }
    function Mc(a, b, c) {
      Mc.Ab || ((Mc.Ab = !0), Lc(a, b, c));
    }
    var Nc;
    Nc = za
      ? () => {
          var a = process.hrtime();
          return 1e3 * a[0] + a[1] / 1e6;
        }
      : () => performance.now();
    var Oc = {};
    function Pc() {
      if (!Qc) {
        var a = {
            USER: 'web_user',
            LOGNAME: 'web_user',
            PATH: '/',
            PWD: '/',
            HOME: '/home/web_user',
            LANG:
              (
                ('object' == typeof navigator &&
                  navigator.languages &&
                  navigator.languages[0]) ||
                'C'
              ).replace('-', '_') + '.UTF-8',
            _: wa || './this.program',
          },
          b;
        for (b in Oc) void 0 === Oc[b] ? delete a[b] : (a[b] = Oc[b]);
        var c = [];
        for (b in a) c.push(b + '=' + a[b]);
        Qc = c;
      }
      return Qc;
    }
    var Qc;
    function Kb(a, b, c, d) {
      a || (a = this);
      this.parent = a;
      this.Pa = a.Pa;
      this.Ua = null;
      this.id = Eb++;
      this.name = b;
      this.mode = c;
      this.Fa = {};
      this.Ga = {};
      this.rdev = d;
    }
    Object.defineProperties(Kb.prototype, {
      read: {
        get: function () {
          return 365 === (this.mode & 365);
        },
        set: function (a) {
          a ? (this.mode |= 365) : (this.mode &= -366);
        },
      },
      write: {
        get: function () {
          return 146 === (this.mode & 146);
        },
        set: function (a) {
          a ? (this.mode |= 146) : (this.mode &= -147);
        },
      },
    });
    Cc();
    U = Array(4096);
    Sb(S, '/');
    W('/tmp');
    W('/home');
    W('/home/web_user');
    (() => {
      W('/dev');
      tb(259, { read: () => 0, write: (b, c, d, f) => f });
      Tb('/dev/null', 259);
      sb(1280, vb);
      sb(1536, wb);
      Tb('/dev/tty', 1280);
      Tb('/dev/tty1', 1536);
      var a = ob();
      Gc('random', a);
      Gc('urandom', a);
      W('/dev/shm');
      W('/dev/shm/tmp');
    })();
    (() => {
      W('/proc');
      var a = W('/proc/self');
      W('/proc/self/fd');
      Sb(
        {
          Pa: () => {
            var b = yb(a, 'fd', 16895, 73);
            b.Fa = {
              lookup: (c, d) => {
                var f = T[+d];
                if (!f) throw new Q(8);
                c = {
                  parent: null,
                  Pa: { tb: 'fake' },
                  Fa: { readlink: () => f.path },
                };
                return (c.parent = c);
              },
            };
            return b;
          },
        },
        '/proc/self/fd'
      );
    })();
    function ka(a, b) {
      var c = Array(aa(a) + 1);
      a = k(a, c, 0, c.length);
      b && (c.length = a);
      return c;
    }
    var Sc = {
      a: function (a, b, c, d) {
        L(
          'Assertion failed: ' +
            D(a) +
            ', at: ' +
            [b ? D(b) : 'unknown filename', c, d ? D(d) : 'unknown function']
        );
      },
      h: function (a, b) {
        try {
          return (a = D(a)), ha(a, b), 0;
        } catch (c) {
          if ('undefined' == typeof Y || !(c instanceof Q)) throw c;
          return -c.Ja;
        }
      },
      H: function (a, b, c) {
        try {
          b = D(b);
          b = Hc(a, b);
          if (c & -8) var d = -28;
          else {
            var f = V(b, { Ra: !0 }).node;
            f
              ? ((a = ''),
                c & 4 && (a += 'r'),
                c & 2 && (a += 'w'),
                c & 1 && (a += 'x'),
                (d = a && Jb(f, a) ? -2 : 0))
              : (d = -44);
          }
          return d;
        } catch (g) {
          if ('undefined' == typeof Y || !(g instanceof Q)) throw g;
          return -g.Ja;
        }
      },
      i: function (a, b) {
        try {
          var c = T[a];
          if (!c) throw new Q(8);
          ha(c.node, b);
          return 0;
        } catch (d) {
          if ('undefined' == typeof Y || !(d instanceof Q)) throw d;
          return -d.Ja;
        }
      },
      g: function (a) {
        try {
          var b = T[a];
          if (!b) throw new Q(8);
          var c = b.node;
          var d = 'string' == typeof c ? V(c, { Ra: !0 }).node : c;
          if (!d.Fa.Ma) throw new Q(63);
          d.Fa.Ma(d, { timestamp: Date.now() });
          return 0;
        } catch (f) {
          if ('undefined' == typeof Y || !(f instanceof Q)) throw f;
          return -f.Ja;
        }
      },
      b: function (a, b, c) {
        Jc = c;
        try {
          var d = Z(a);
          switch (b) {
            case 0:
              var f = Kc();
              return 0 > f ? -28 : w(d.path, d.flags, 0, f).fd;
            case 1:
            case 2:
              return 0;
            case 3:
              return d.flags;
            case 4:
              return (f = Kc()), (d.flags |= f), 0;
            case 5:
              return (f = Kc()), (Ia[(f + 0) >> 1] = 2), 0;
            case 6:
            case 7:
              return 0;
            case 16:
            case 8:
              return -28;
            case 9:
              return (M[Rc() >> 2] = 28), -1;
            default:
              return -28;
          }
        } catch (g) {
          if ('undefined' == typeof Y || !(g instanceof Q)) throw g;
          return -g.Ja;
        }
      },
      G: function (a, b) {
        try {
          var c = Z(a);
          return Ic(Wb, c.path, b);
        } catch (d) {
          if ('undefined' == typeof Y || !(d instanceof Q)) throw d;
          return -d.Ja;
        }
      },
      B: function (a, b) {
        try {
          var c = T[a];
          if (!c) throw new Q(8);
          if (0 === (c.flags & 2097155)) throw new Q(28);
          Yb(c.node, b);
          return 0;
        } catch (d) {
          if ('undefined' == typeof Y || !(d instanceof Q)) throw d;
          return -d.Ja;
        }
      },
      A: function (a, b) {
        try {
          if (0 === b) return -28;
          if (b < aa('/') + 1) return -68;
          k('/', n, a, b);
          return a;
        } catch (c) {
          if ('undefined' == typeof Y || !(c instanceof Q)) throw c;
          return -c.Ja;
        }
      },
      E: function (a, b) {
        try {
          return (a = D(a)), Ic(Xb, a, b);
        } catch (c) {
          if ('undefined' == typeof Y || !(c instanceof Q)) throw c;
          return -c.Ja;
        }
      },
      x: function (a, b) {
        try {
          return (
            (a = D(a)),
            (a = t(a)),
            '/' === a[a.length - 1] && (a = a.substr(0, a.length - 1)),
            W(a, b),
            0
          );
        } catch (c) {
          if ('undefined' == typeof Y || !(c instanceof Q)) throw c;
          return -c.Ja;
        }
      },
      D: function (a, b, c, d) {
        try {
          b = D(b);
          var f = d & 256;
          b = Hc(a, b, d & 4096);
          return Ic(f ? Xb : Wb, b, c);
        } catch (g) {
          if ('undefined' == typeof Y || !(g instanceof Q)) throw g;
          return -g.Ja;
        }
      },
      u: function (a, b, c, d) {
        Jc = d;
        try {
          b = D(b);
          b = Hc(a, b);
          var f = d ? Kc() : 0;
          return w(b, c, f).fd;
        } catch (g) {
          if ('undefined' == typeof Y || !(g instanceof Q)) throw g;
          return -g.Ja;
        }
      },
      s: function (a, b, c, d) {
        try {
          b = D(b);
          b = Hc(a, b);
          if (0 >= d) var f = -28;
          else {
            var g = Gb(b),
              m = Math.min(d, aa(g)),
              r = A[c + m];
            k(g, n, c, d + 1);
            A[c + m] = r;
            f = m;
          }
          return f;
        } catch (u) {
          if ('undefined' == typeof Y || !(u instanceof Q)) throw u;
          return -u.Ja;
        }
      },
      r: function (a) {
        try {
          return (a = D(a)), Vb(a), 0;
        } catch (b) {
          if ('undefined' == typeof Y || !(b instanceof Q)) throw b;
          return -b.Ja;
        }
      },
      F: function (a, b) {
        try {
          return (a = D(a)), Ic(Wb, a, b);
        } catch (c) {
          if ('undefined' == typeof Y || !(c instanceof Q)) throw c;
          return -c.Ja;
        }
      },
      o: function (a, b, c) {
        try {
          return (
            (b = D(b)),
            (b = Hc(a, b)),
            0 === c
              ? sa(b)
              : 512 === c
              ? Vb(b)
              : L('Invalid flags passed to unlinkat'),
            0
          );
        } catch (d) {
          if ('undefined' == typeof Y || !(d instanceof Q)) throw d;
          return -d.Ja;
        }
      },
      m: function (a, b, c) {
        try {
          b = D(b);
          b = Hc(a, b, !0);
          if (c) {
            var d = M[c >> 2],
              f = M[(c + 4) >> 2];
            g = 1e3 * d + f / 1e6;
            c += 8;
            d = M[c >> 2];
            f = M[(c + 4) >> 2];
            m = 1e3 * d + f / 1e6;
          } else
            var g = Date.now(),
              m = g;
          a = g;
          var r = V(b, { Ra: !0 }).node;
          r.Fa.Ma(r, { timestamp: Math.max(a, m) });
          return 0;
        } catch (u) {
          if ('undefined' == typeof Y || !(u instanceof Q)) throw u;
          return -u.Ja;
        }
      },
      e: function () {
        return Date.now();
      },
      j: function (a, b) {
        a = new Date(1e3 * M[a >> 2]);
        M[b >> 2] = a.getSeconds();
        M[(b + 4) >> 2] = a.getMinutes();
        M[(b + 8) >> 2] = a.getHours();
        M[(b + 12) >> 2] = a.getDate();
        M[(b + 16) >> 2] = a.getMonth();
        M[(b + 20) >> 2] = a.getFullYear() - 1900;
        M[(b + 24) >> 2] = a.getDay();
        var c = new Date(a.getFullYear(), 0, 1);
        M[(b + 28) >> 2] = ((a.getTime() - c.getTime()) / 864e5) | 0;
        M[(b + 36) >> 2] = -(60 * a.getTimezoneOffset());
        var d = new Date(a.getFullYear(), 6, 1).getTimezoneOffset();
        c = c.getTimezoneOffset();
        M[(b + 32) >> 2] =
          (d != c && a.getTimezoneOffset() == Math.min(c, d)) | 0;
      },
      v: function (a, b, c, d, f, g, m) {
        try {
          var r = T[f];
          if (!r) return -8;
          if (0 !== (c & 2) && 0 === (d & 2) && 2 !== (r.flags & 2097155))
            throw new Q(2);
          if (1 === (r.flags & 2097155)) throw new Q(2);
          if (!r.Ga.$a) throw new Q(43);
          var u = r.Ga.$a(r, a, b, g, c, d);
          var v = u.Eb;
          M[m >> 2] = u.ub;
          return v;
        } catch (B) {
          if ('undefined' == typeof Y || !(B instanceof Q)) throw B;
          return -B.Ja;
        }
      },
      w: function (a, b, c, d, f, g) {
        try {
          var m = T[f];
          if (m && c & 2) {
            var r = n.slice(a, a + b);
            m && m.Ga.ab && m.Ga.ab(m, r, g, b, d);
          }
        } catch (u) {
          if ('undefined' == typeof Y || !(u instanceof Q)) throw u;
          return -u.Ja;
        }
      },
      n: Mc,
      p: function () {
        return 2147483648;
      },
      d: Nc,
      c: function (a) {
        var b = n.length;
        a >>>= 0;
        if (2147483648 < a) return !1;
        for (var c = 1; 4 >= c; c *= 2) {
          var d = b * (1 + 0.2 / c);
          d = Math.min(d, a + 100663296);
          var f = Math;
          d = Math.max(a, d);
          f = f.min.call(f, 2147483648, d + ((65536 - (d % 65536)) % 65536));
          a: {
            try {
              Ma.grow((f - Ua.byteLength + 65535) >>> 16);
              Va();
              var g = 1;
              break a;
            } catch (m) {}
            g = void 0;
          }
          if (g) return !0;
        }
        return !1;
      },
      y: function (a, b) {
        var c = 0;
        Pc().forEach(function (d, f) {
          var g = b + c;
          f = M[(a + 4 * f) >> 2] = g;
          for (g = 0; g < d.length; ++g) A[f++ >> 0] = d.charCodeAt(g);
          A[f >> 0] = 0;
          c += d.length + 1;
        });
        return 0;
      },
      z: function (a, b) {
        var c = Pc();
        M[a >> 2] = c.length;
        var d = 0;
        c.forEach(function (f) {
          d += f.length + 1;
        });
        M[b >> 2] = d;
        return 0;
      },
      f: function (a) {
        try {
          var b = Z(a);
          ja(b);
          return 0;
        } catch (c) {
          if ('undefined' == typeof Y || !(c instanceof Q)) throw c;
          return c.Ja;
        }
      },
      l: function (a, b) {
        try {
          var c = Z(a);
          A[b >> 0] = c.tty
            ? 2
            : 16384 === (c.mode & 61440)
            ? 3
            : 40960 === (c.mode & 61440)
            ? 7
            : 4;
          return 0;
        } catch (d) {
          if ('undefined' == typeof Y || !(d instanceof Q)) throw d;
          return d.Ja;
        }
      },
      t: function (a, b, c, d) {
        try {
          a: {
            for (var f = Z(a), g = (a = 0); g < c; g++) {
              var m = M[(b + (8 * g + 4)) >> 2],
                r = Bc(f, A, M[(b + 8 * g) >> 2], m, void 0);
              if (0 > r) {
                var u = -1;
                break a;
              }
              a += r;
              if (r < m) break;
            }
            u = a;
          }
          M[d >> 2] = u;
          return 0;
        } catch (v) {
          if ('undefined' == typeof Y || !(v instanceof Q)) throw v;
          return v.Ja;
        }
      },
      k: function (a, b, c, d, f) {
        try {
          var g = Z(a);
          a = 4294967296 * c + (b >>> 0);
          if (-9007199254740992 >= a || 9007199254740992 <= a) return -61;
          $b(g, a, d);
          N = [
            g.position >>> 0,
            ((O = g.position),
            1 <= +Math.abs(O)
              ? 0 < O
                ? (Math.min(+Math.floor(O / 4294967296), 4294967295) | 0) >>> 0
                : ~~+Math.ceil((O - +(~~O >>> 0)) / 4294967296) >>> 0
              : 0),
          ];
          M[f >> 2] = N[0];
          M[(f + 4) >> 2] = N[1];
          g.gb && 0 === a && 0 === d && (g.gb = null);
          return 0;
        } catch (m) {
          if ('undefined' == typeof Y || !(m instanceof Q)) throw m;
          return m.Ja;
        }
      },
      C: function (a) {
        try {
          var b = Z(a);
          return b.Ga && b.Ga.fsync ? -b.Ga.fsync(b) : 0;
        } catch (c) {
          if ('undefined' == typeof Y || !(c instanceof Q)) throw c;
          return c.Ja;
        }
      },
      q: function (a, b, c, d) {
        try {
          a: {
            for (var f = Z(a), g = (a = 0); g < c; g++) {
              var m = ia(
                f,
                A,
                M[(b + 8 * g) >> 2],
                M[(b + (8 * g + 4)) >> 2],
                void 0
              );
              if (0 > m) {
                var r = -1;
                break a;
              }
              a += m;
            }
            r = a;
          }
          M[d >> 2] = r;
          return 0;
        } catch (u) {
          if ('undefined' == typeof Y || !(u instanceof Q)) throw u;
          return u.Ja;
        }
      },
    };
    (function () {
      function a(f) {
        e.asm = f.exports;
        Ma = e.asm.I;
        Va();
        K = e.asm.za;
        Xa.unshift(e.asm.J);
        $a--;
        e.monitorRunDependencies && e.monitorRunDependencies($a);
        0 == $a &&
          (null !== ab && (clearInterval(ab), (ab = null)),
          bb && ((f = bb), (bb = null), f()));
      }
      function b(f) {
        a(f.instance);
      }
      function c(f) {
        return fb()
          .then(function (g) {
            return WebAssembly.instantiate(g, d);
          })
          .then(function (g) {
            return g;
          })
          .then(f, function (g) {
            G('failed to asynchronously prepare wasm: ' + g);
            L(g);
          });
      }
      var d = { a: Sc };
      $a++;
      e.monitorRunDependencies && e.monitorRunDependencies($a);
      if (e.instantiateWasm)
        try {
          return e.instantiateWasm(d, a);
        } catch (f) {
          return (
            G('Module.instantiateWasm callback failed with error: ' + f), !1
          );
        }
      (function () {
        return Ha ||
          'function' != typeof WebAssembly.instantiateStreaming ||
          cb() ||
          P.startsWith('file://') ||
          'function' != typeof fetch
          ? c(b)
          : fetch(P, { credentials: 'same-origin' }).then(function (f) {
              return WebAssembly.instantiateStreaming(f, d).then(
                b,
                function (g) {
                  G('wasm streaming compile failed: ' + g);
                  G('falling back to ArrayBuffer instantiation');
                  return c(b);
                }
              );
            });
      })();
      return {};
    })();
    e.___wasm_call_ctors = function () {
      return (e.___wasm_call_ctors = e.asm.J).apply(null, arguments);
    };
    e._sqlite3_free = function () {
      return (e._sqlite3_free = e.asm.K).apply(null, arguments);
    };
    e._sqlite3_value_double = function () {
      return (e._sqlite3_value_double = e.asm.L).apply(null, arguments);
    };
    e._sqlite3_value_text = function () {
      return (e._sqlite3_value_text = e.asm.M).apply(null, arguments);
    };
    var Rc = (e.___errno_location = function () {
      return (Rc = e.___errno_location = e.asm.N).apply(null, arguments);
    });
    e._sqlite3_prepare_v2 = function () {
      return (e._sqlite3_prepare_v2 = e.asm.O).apply(null, arguments);
    };
    e._sqlite3_step = function () {
      return (e._sqlite3_step = e.asm.P).apply(null, arguments);
    };
    e._sqlite3_finalize = function () {
      return (e._sqlite3_finalize = e.asm.Q).apply(null, arguments);
    };
    e._sqlite3_reset = function () {
      return (e._sqlite3_reset = e.asm.R).apply(null, arguments);
    };
    e._sqlite3_value_int = function () {
      return (e._sqlite3_value_int = e.asm.S).apply(null, arguments);
    };
    e._sqlite3_clear_bindings = function () {
      return (e._sqlite3_clear_bindings = e.asm.T).apply(null, arguments);
    };
    e._sqlite3_value_blob = function () {
      return (e._sqlite3_value_blob = e.asm.U).apply(null, arguments);
    };
    e._sqlite3_value_bytes = function () {
      return (e._sqlite3_value_bytes = e.asm.V).apply(null, arguments);
    };
    e._sqlite3_value_type = function () {
      return (e._sqlite3_value_type = e.asm.W).apply(null, arguments);
    };
    e._sqlite3_result_blob = function () {
      return (e._sqlite3_result_blob = e.asm.X).apply(null, arguments);
    };
    e._sqlite3_result_double = function () {
      return (e._sqlite3_result_double = e.asm.Y).apply(null, arguments);
    };
    e._sqlite3_result_error = function () {
      return (e._sqlite3_result_error = e.asm.Z).apply(null, arguments);
    };
    e._sqlite3_result_int = function () {
      return (e._sqlite3_result_int = e.asm._).apply(null, arguments);
    };
    e._sqlite3_result_int64 = function () {
      return (e._sqlite3_result_int64 = e.asm.$).apply(null, arguments);
    };
    e._sqlite3_result_null = function () {
      return (e._sqlite3_result_null = e.asm.aa).apply(null, arguments);
    };
    e._sqlite3_result_text = function () {
      return (e._sqlite3_result_text = e.asm.ba).apply(null, arguments);
    };
    e._sqlite3_sql = function () {
      return (e._sqlite3_sql = e.asm.ca).apply(null, arguments);
    };
    e._sqlite3_column_count = function () {
      return (e._sqlite3_column_count = e.asm.da).apply(null, arguments);
    };
    e._sqlite3_data_count = function () {
      return (e._sqlite3_data_count = e.asm.ea).apply(null, arguments);
    };
    e._sqlite3_column_blob = function () {
      return (e._sqlite3_column_blob = e.asm.fa).apply(null, arguments);
    };
    e._sqlite3_column_bytes = function () {
      return (e._sqlite3_column_bytes = e.asm.ga).apply(null, arguments);
    };
    e._sqlite3_column_double = function () {
      return (e._sqlite3_column_double = e.asm.ha).apply(null, arguments);
    };
    e._sqlite3_column_text = function () {
      return (e._sqlite3_column_text = e.asm.ia).apply(null, arguments);
    };
    e._sqlite3_column_type = function () {
      return (e._sqlite3_column_type = e.asm.ja).apply(null, arguments);
    };
    e._sqlite3_column_name = function () {
      return (e._sqlite3_column_name = e.asm.ka).apply(null, arguments);
    };
    e._sqlite3_bind_blob = function () {
      return (e._sqlite3_bind_blob = e.asm.la).apply(null, arguments);
    };
    e._sqlite3_bind_double = function () {
      return (e._sqlite3_bind_double = e.asm.ma).apply(null, arguments);
    };
    e._sqlite3_bind_int = function () {
      return (e._sqlite3_bind_int = e.asm.na).apply(null, arguments);
    };
    e._sqlite3_bind_text = function () {
      return (e._sqlite3_bind_text = e.asm.oa).apply(null, arguments);
    };
    e._sqlite3_bind_parameter_index = function () {
      return (e._sqlite3_bind_parameter_index = e.asm.pa).apply(
        null,
        arguments
      );
    };
    e._sqlite3_normalized_sql = function () {
      return (e._sqlite3_normalized_sql = e.asm.qa).apply(null, arguments);
    };
    e._sqlite3_errmsg = function () {
      return (e._sqlite3_errmsg = e.asm.ra).apply(null, arguments);
    };
    e._sqlite3_exec = function () {
      return (e._sqlite3_exec = e.asm.sa).apply(null, arguments);
    };
    e._sqlite3_changes = function () {
      return (e._sqlite3_changes = e.asm.ta).apply(null, arguments);
    };
    e._sqlite3_close_v2 = function () {
      return (e._sqlite3_close_v2 = e.asm.ua).apply(null, arguments);
    };
    e._sqlite3_create_function_v2 = function () {
      return (e._sqlite3_create_function_v2 = e.asm.va).apply(null, arguments);
    };
    e._sqlite3_open = function () {
      return (e._sqlite3_open = e.asm.wa).apply(null, arguments);
    };
    var ba = (e._malloc = function () {
        return (ba = e._malloc = e.asm.xa).apply(null, arguments);
      }),
      ma = (e._free = function () {
        return (ma = e._free = e.asm.ya).apply(null, arguments);
      });
    e._RegisterExtensionFunctions = function () {
      return (e._RegisterExtensionFunctions = e.asm.Aa).apply(null, arguments);
    };
    var Bb = (e._emscripten_builtin_memalign = function () {
        return (Bb = e._emscripten_builtin_memalign = e.asm.Ba).apply(
          null,
          arguments
        );
      }),
      na = (e.stackSave = function () {
        return (na = e.stackSave = e.asm.Ca).apply(null, arguments);
      }),
      pa = (e.stackRestore = function () {
        return (pa = e.stackRestore = e.asm.Da).apply(null, arguments);
      }),
      z = (e.stackAlloc = function () {
        return (z = e.stackAlloc = e.asm.Ea).apply(null, arguments);
      });
    e.cwrap = function (a, b, c, d) {
      c = c || [];
      var f = c.every(function (g) {
        return 'number' === g;
      });
      return 'string' !== b && f && !d
        ? e['_' + a]
        : function () {
            return Oa(a, b, c, arguments);
          };
    };
    e.UTF8ToString = D;
    e.stackSave = na;
    e.stackRestore = pa;
    e.stackAlloc = z;
    var Tc;
    bb = function Uc() {
      Tc || Vc();
      Tc || (bb = Uc);
    };
    function Vc() {
      function a() {
        if (!Tc && ((Tc = !0), (e.calledRun = !0), !Na)) {
          e.noFSInit ||
            Ec ||
            ((Ec = !0),
            Cc(),
            (e.stdin = e.stdin),
            (e.stdout = e.stdout),
            (e.stderr = e.stderr),
            e.stdin ? Gc('stdin', e.stdin) : Ub('/dev/tty', '/dev/stdin'),
            e.stdout
              ? Gc('stdout', null, e.stdout)
              : Ub('/dev/tty', '/dev/stdout'),
            e.stderr
              ? Gc('stderr', null, e.stderr)
              : Ub('/dev/tty1', '/dev/stderr'),
            w('/dev/stdin', 0),
            w('/dev/stdout', 1),
            w('/dev/stderr', 1));
          Fb = !1;
          gb(Xa);
          if (e.onRuntimeInitialized) e.onRuntimeInitialized();
          if (e.postRun)
            for (
              'function' == typeof e.postRun && (e.postRun = [e.postRun]);
              e.postRun.length;

            ) {
              var b = e.postRun.shift();
              Ya.unshift(b);
            }
          gb(Ya);
        }
      }
      if (!(0 < $a)) {
        if (e.preRun)
          for (
            'function' == typeof e.preRun && (e.preRun = [e.preRun]);
            e.preRun.length;

          )
            Za();
        gb(Wa);
        0 < $a ||
          (e.setStatus
            ? (e.setStatus('Running...'),
              setTimeout(function () {
                setTimeout(function () {
                  e.setStatus('');
                }, 1);
                a();
              }, 1))
            : a());
      }
    }
    e.run = Vc;
    if (e.preInit)
      for (
        'function' == typeof e.preInit && (e.preInit = [e.preInit]);
        0 < e.preInit.length;

      )
        e.preInit.pop()();
    Vc();

    // The shell-pre.js and emcc-generated code goes above
    return Module;
  }); // The end of the promise being returned

  return initSqlJsPromise;
}; // The end of our initSqlJs function

// This bit below is copied almost exactly from what you get when you use the MODULARIZE=1 flag with emcc
// However, we don't want to use the emcc modularization. See shell-pre.js
if (typeof exports === 'object' && typeof module === 'object') {
  module.exports = initSqlJs;
  // This will allow the module to be used in ES6 or CommonJS
  module.exports.default = initSqlJs;
} else if (typeof define === 'function' && define['amd']) {
  define([], function () {
    return initSqlJs;
  });
} else if (typeof exports === 'object') {
  exports['Module'] = initSqlJs;
}
/* global initSqlJs */
/* eslint-env worker */
/* eslint no-restricted-globals: ["error"] */

('use strict');

var db;

function onModuleReady(SQL) {
  function createDb(data) {
    if (db != null) db.close();
    db = new SQL.Database(data);
    return db;
  }

  var buff;
  var data;
  var result;
  data = this['data'];
  var config = data['config'] ? data['config'] : {};
  switch (data && data['action']) {
    case 'open':
      buff = data['buffer'];
      createDb(buff && new Uint8Array(buff));
      return postMessage({
        id: data['id'],
        ready: true,
      });
    case 'exec':
      if (db === null) {
        createDb();
      }
      if (!data['sql']) {
        throw 'exec: Missing query string';
      }
      return postMessage({
        id: data['id'],
        results: db.exec(data['sql'], data['params'], config),
      });
    case 'each':
      if (db === null) {
        createDb();
      }
      var callback = function callback(row) {
        return postMessage({
          id: data['id'],
          row: row,
          finished: false,
        });
      };
      var done = function done() {
        return postMessage({
          id: data['id'],
          finished: true,
        });
      };
      return db.each(data['sql'], data['params'], callback, done, config);
    case 'export':
      buff = db['export']();
      result = {
        id: data['id'],
        buffer: buff,
      };
      try {
        return postMessage(result, [result]);
      } catch (error) {
        return postMessage(result);
      }
    case 'close':
      if (db) {
        db.close();
      }
      return postMessage({
        id: data['id'],
      });
    default:
      throw new Error('Invalid action : ' + (data && data['action']));
  }
}

function onError(err) {
  return postMessage({
    id: this['data']['id'],
    error: err['message'],
  });
}

if (typeof importScripts === 'function') {
  db = null;
  var sqlModuleReady = initSqlJs();
  self.onmessage = function onmessage(event) {
    return sqlModuleReady
      .then(onModuleReady.bind(event))
      .catch(onError.bind(event));
  };
}
