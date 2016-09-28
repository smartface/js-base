(function() {

    function debug(message, title) {
        if (typeof message === "object") {
            message = JSON.stringify(message, null, "\t");
        }
        else if (typeof message === "undefined") {
            message = "undefined";
        }
        else if (message === null) {
            message = "null";
        }
        alert({
            message: message,
            title: title || "Debug"
        });
    }

    if (!String.prototype.startsWith) {
        String.prototype.startsWith = function(searchString, position) {
            position = position || 0;
            return this.substr(position, searchString.length) === searchString;
        };
    }

    if (!String.prototype.endsWith) {
        String.prototype.endsWith = function(searchString, position) {
            var subjectString = this.toString();
            if (typeof position !== 'number' || !isFinite(position) || Math.floor(position) !== position || position > subjectString.length) {
                position = subjectString.length;
            }
            position -= searchString.length;
            var lastIndex = subjectString.indexOf(searchString, position);
            return lastIndex !== -1 && lastIndex === position;
        };
    }
    var libs = {};

    var process = {
        moduleLoadList: [],
        platform: "linux",
        cwd: function cwd() {
            return "";
        },
        argv: ["Smartface", "mainFile.js"],
        env: {},
        binding: function binding(nativeModuleName) {
            return libs[nativeModuleName]();
        },
        execPath: ""
    };

    libs.assert = function assert() {
        if (!assert.exports)
            assert.exports = initAssert();
        return assert.exports;
    };

    function initAssert() {
        var assert = ok;

        function fail(actual, expected, message, operator, stackStartFunction) {
            throw new assert.AssertionError({
                message: message,
                actual: actual,
                expected: expected,
                operator: operator,
                stackStartFunction: stackStartFunction
            });
        }

        // EXTENSION! allows for well behaved errors defined elsewhere.
        assert.fail = fail;

        // 4. Pure assertion tests whether a value is truthy, as determined
        // by !!guard.
        // assert.ok(guard, message_opt);
        // This statement is equivalent to assert.equal(true, !!guard,
        // message_opt);. To test strictly for the value true, use
        // assert.strictEqual(true, guard, message_opt);.

        function ok(value, message) {
            if (!value) fail(value, true, message, '==', assert.ok);
        }
        assert.ok = ok;

        return assert;
    }


    libs.Module = function Module() {
        if (!Module.exports)
            Module.exports = initModule();
        return Module.exports;
    };

    function initModule() {

        var NativeModule = libs.NativeModule();
        var util = libs.util();
        var internalModule = libs.internalModule();
        var vm = libs.vm();
        var assert = libs.assert().ok;
        var path = libs.path();

        // If obj.hasOwnProperty has been overridden, then calling
        // obj.hasOwnProperty(prop) will break.
        // See: https://github.com/joyent/node/issues/1707
        function hasOwnProperty(obj, prop) {
            return Object.prototype.hasOwnProperty.call(obj, prop);
        }


        function stat(filename) {
            filename = path._makeLong(filename);
            var cache = stat.cache,
                result;
            if (cache !== null) {
                result = cache.get(filename);
                if (result !== undefined) return result;
            }
            result = SMF.scriptStat(filename);
            if (cache !== null) cache.set(filename, result);
            return result;
        }
        stat.cache = null;


        function Module(id, parent) {
            this.id = id;
            this.exports = {};
            this.parent = parent;
            if (parent && parent.children) {
                parent.children.push(this);
            }

            this.filename = null;
            this.loaded = false;
            this.children = [];
        }
        // module.exports = Module;

        Module._cache = {};
        Module._pathCache = {};
        Module._extensions = {};
        var modulePaths = [];
        Module.globalPaths = [];

        Module.wrapper = NativeModule.wrapper;
        Module.wrap = NativeModule.wrap;
        Module._debug = util.debuglog('module');

        // We use this alias for the preprocessor that filters it out
        // var debug = Module._debug;


        // given a module name, and a list of paths to test, returns the first
        // matching file in the following precedence.
        //
        // require("a.<ext>")
        //   -> a.<ext>
        //
        // require("a")
        //   -> a
        //   -> a.<ext>
        //   -> a/index.<ext>

        // check if the directory is a package.json dir
        var packageMainCache = {};

        function readPackage(requestPath) {
            if (hasOwnProperty(packageMainCache, requestPath)) {
                return packageMainCache[requestPath];
            }
            var jsonPath = path.resolve(requestPath, 'package.json');
            var fileN = path._makeLong(jsonPath);
            fileN = fileN.startsWith("./") ? fileN.substr(2) : fileN;
            var json = SMF.readCode(fileN); //TODO: check

            if (!json) {
                return false;
            }

            try {
                var pkg = packageMainCache[requestPath] = JSON.parse(json).main;
            }
            catch (e) {
                e.path = jsonPath;
                e.message = 'Error parsing ' + jsonPath + ': ' + e.message;
                throw e;
            }
            return pkg;
        }

        function tryPackage(requestPath, exts, isMain) {
            var pkg = null;
            try {
                pkg = readPackage(requestPath);
            }
            catch (ex) {}

            if (!pkg) return false;

            var filename = path.resolve(requestPath, pkg);
            return tryFile(filename, isMain) ||
                tryExtensions(filename, exts, isMain) ||
                tryExtensions(path.resolve(filename, 'index'), exts, isMain);
        }

        // check if the file exists and is not a directory
        // if using --preserve-symlinks and isMain is false,
        // keep symlinks intact, otherwise resolve to the
        // absolute realpath.
        function tryFile(requestPath, isMain) {
            //check file exist, if not exists return false
            const rc = stat(requestPath);
            if (!isMain) {
                return rc === 0 && path.resolve(requestPath);
            }
            else
                return false;
        }

        // given a path check a the file exists with any of the set extensions
        function tryExtensions(p, exts, isMain) {
            for (var i = 0; i < exts.length; i++) {
                var filename = tryFile(p + exts[i], isMain);

                if (filename) {
                    return filename;
                }
            }
            return false;
        }

        var warned = false;
        Module._findPath = function(request, paths, isMain) {
            if (path.isAbsolute(request)) {
                paths = [''];
            }
            else if (!paths || paths.length === 0) {
                return false;
            }

            var cacheKey = JSON.stringify({
                request: request,
                paths: paths
            });
            if (Module._pathCache[cacheKey]) {
                return Module._pathCache[cacheKey];
            }

            var exts;
            var trailingSlash = request.length > 0 &&
                request.charCodeAt(request.length - 1) === 47 /*/*/ ;

            // For each path
            for (var i = 0; i < paths.length; i++) {
                // Don't search further if path doesn't exist
                var curPath = paths[i];
                //if (curPath /*&& stat(curPath) < 1*/ ) continue;
                var basePath = path.resolve(curPath, request);
                var filename;
                if (!trailingSlash) {
                    var rc = stat(basePath);
                    if (rc === 0) { // File.
                        filename = path.resolve(basePath);
                    }
                    else if (rc === 1) { // Directory.
                        if (exts === undefined)
                            exts = Object.keys(Module._extensions);
                        filename = tryPackage(basePath, exts, isMain);

                    }

                    if (!filename) {
                        // try it with each of the extensions
                        if (exts === undefined)
                            exts = Object.keys(Module._extensions);
                        filename = tryExtensions(basePath, exts, isMain);
                    }
                }

                if (!filename) {
                    if (exts === undefined)
                        exts = Object.keys(Module._extensions);
                    filename = tryPackage(basePath, exts, isMain);
                }

                /* if (!filename) {
                     // try it with each of the extensions at "index"
                     if (exts === undefined)
                         exts = Object.keys(Module._extensions);
                     filename = tryExtensions(path.resolve(basePath, 'index'), exts, isMain);
                 }*/

                if (filename) {
                    // Warn once if '.' resolved outside the module dir
                    if (request === '.' && i > 0) {
                        throw Error("Code should not go here");
                        // warned = internalUtil.printDeprecationMessage(
                        //     'warning: require(\'.\') resolved outside the package ' +
                        //     'directory. This functionality is deprecated and will be removed ' +
                        //     'soon.', warned);
                    }

                    Module._pathCache[cacheKey] = filename;
                    return filename;
                }
            }
            return false;
        };

        // 'node_modules' character codes reversed
        var nmChars = [115, 101, 108, 117, 100, 111, 109, 95, 101, 100, 111, 110];
        var nmLen = nmChars.length;
        if (process.platform === 'win32') {
            // 'from' is the __dirname of the module.
            Module._nodeModulePaths = function(from) {
                // guarantee that 'from' is absolute.
                from = path.resolve(from);

                // note: this approach *only* works when the path is guaranteed
                // to be absolute.  Doing a fully-edge-case-correct path.split
                // that works on both Windows and Posix is non-trivial.
                var paths = [];
                var p = 0;
                var last = from.length;
                for (var i = from.length - 1; i >= 0; --i) {
                    var code = from.charCodeAt(i);
                    if (code === 92 /*\*/ || code === 47 /*/*/ ) {
                        if (p !== nmLen)
                            paths.push(from.slice(0, last) + '\\node_modules');
                        last = i;
                        p = 0;
                    }
                    else if (p !== -1 && p < nmLen) {
                        if (nmChars[p] === code) {
                            ++p;
                        }
                        else {
                            p = -1;
                        }
                    }
                }

                return paths;
            };
        }
        else { // posix
            // 'from' is the __dirname of the module.
            Module._nodeModulePaths = function(from) {
                // guarantee that 'from' is absolute.
                from = path.resolve(from);
                // Return early not only to avoid unnecessary work, but to *avoid* returning
                // an array of two items for a root: [ '//node_modules', '/node_modules' ]
                if (from === '/')
                    return ['/node_modules'];

                // note: this approach *only* works when the path is guaranteed
                // to be absolute.  Doing a fully-edge-case-correct path.split
                // that works on both Windows and Posix is non-trivial.
                var paths = [];
                var p = 0;
                var last = from.length;
                for (var i = from.length - 1; i >= 0; --i) {
                    var code = from.charCodeAt(i);
                    if (code === 47 /*/*/ ) {
                        if (p !== nmLen)
                            paths.push(from.slice(0, last) + '/node_modules');
                        last = i;
                        p = 0;
                    }
                    else if (p !== -1 && p < nmLen) {
                        if (nmChars[p] === code) {
                            ++p;
                        }
                        else {
                            p = -1;
                        }
                    }
                }

                return paths;
            };
        }


        // 'index.' character codes
        var indexChars = [105, 110, 100, 101, 120, 46];
        var indexLen = indexChars.length;
        Module._resolveLookupPaths = function(request, parent) {
            if (NativeModule.nonInternalExists(request)) {
                return [request, []];
            }

            var reqLen = request.length;
            // Check for relative path
            if (reqLen < 2 ||
                request.charCodeAt(0) !== 46 /*.*/ ||
                (request.charCodeAt(1) !== 46 /*.*/ &&
                    request.charCodeAt(1) !== 47 /*/*/ )) {
                var paths = modulePaths;
                if (parent) {
                    if (!parent.paths)
                        paths = parent.paths = [];
                    else
                        paths = parent.paths.concat(paths);
                }

                // Maintain backwards compat with certain broken uses of require('.')
                // by putting the module's directory in front of the lookup paths.
                if (request === '.') {
                    if (parent && parent.filename) {
                        paths.unshift(path.dirname(parent.filename));
                    }
                    else {
                        paths.unshift(path.resolve(request));
                    }
                }

                return [request, paths];
            }

            // with --eval, parent.id is not set and parent.filename is null
            if (!parent || !parent.id || !parent.filename) {
                // make require('./path/to/foo') work - normally the path is taken
                // from realpath(__filename) but with eval there is no filename
                var mainPaths = ['.'].concat(Module._nodeModulePaths('.'), modulePaths);
                return [request, mainPaths];
            }

            // Is the parent an index module?
            // We can assume the parent has a valid extension,
            // as it already has been accepted as a module.
            var base = path.basename(parent.filename);
            var parentIdPath;
            if (base.length > indexLen) {
                var i = 0;
                for (; i < indexLen; ++i) {
                    if (indexChars[i] !== base.charCodeAt(i))
                        break;
                }
                if (i === indexLen) {
                    // We matched 'index.', let's validate the rest
                    for (; i < base.length; ++i) {
                        var code = base.charCodeAt(i);
                        if (code !== 95 /*_*/ &&
                            (code < 48 /*0*/ || code > 57 /*9*/ ) &&
                            (code < 65 /*A*/ || code > 90 /*Z*/ ) &&
                            (code < 97 /*a*/ || code > 122 /*z*/ ))
                            break;
                    }
                    if (i === base.length) {
                        // Is an index module
                        parentIdPath = parent.id;
                    }
                    else {
                        // Not an index module
                        parentIdPath = path.dirname(parent.id);
                    }
                }
                else {
                    // Not an index module
                    parentIdPath = path.dirname(parent.id);
                }
            }
            else {
                // Not an index module
                parentIdPath = path.dirname(parent.id);
            }
            var id = path.resolve(parentIdPath, request);

            // make sure require('./path') and require('path') get distinct ids, even
            // when called from the toplevel js file
            if (parentIdPath === '.' && id.indexOf('/') === -1) {
                id = './' + id;
            }

            return [id, [path.dirname(parent.filename)]];
        };


        // Check the cache for the requested file.
        // 1. If a module already exists in the cache: return its exports object.
        // 2. If the module is native: call `NativeModule.require()` with the
        //    filename and return the result.
        // 3. Otherwise, create a new module for the file and save it to the cache.
        //    Then have it load  the file contents before returning its exports
        //    object.
        Module._load = function(request, parent, isMain) {

            var filename = Module._resolveFilename(request, parent, isMain);

            var cachedModule = Module._cache[filename];
            if (cachedModule) {
                return cachedModule.exports;
            }

            if (NativeModule.nonInternalExists(filename)) {
                //TODO: in future load smartface internal modules for Node, such as 'fs'
                return NativeModule.require(filename);
            }

            var module = new Module(filename, parent);

            if (isMain) {
                process.mainModule = module;
                module.id = '.';
            }

            Module._cache[filename] = module;

            tryModuleLoad(module, filename);

            return module.exports;
        };

        function tryModuleLoad(module, filename) {
            var threw = true;
            try {
                module.load(filename);
                threw = false;
            }
            finally {
                if (threw) {
                    delete Module._cache[filename];
                }
            }
        }

        Module._resolveFilename = function(request, parent, isMain) {
            if (NativeModule.nonInternalExists(request)) {
                return request;
            }

            var resolvedModule = Module._resolveLookupPaths(request, parent);
            var id = resolvedModule[0];
            var paths = resolvedModule[1];

            // look up the filename first, since that's the cache key.

            var filename = Module._findPath(request, paths, isMain);
            if (!filename) {
                var err = new Error("Cannot find module '" + request + "'");
                err.code = 'MODULE_NOT_FOUND';
                throw err;
            }
            return filename;
        };


        // Given a file name, pass it to the proper extension handler.
        Module.prototype.load = function(filename) {

            assert(!this.loaded);
            this.filename = filename;
            this.paths = Module._nodeModulePaths(path.dirname(filename));

            var extension = path.extname(filename) || '.js';
            if (!Module._extensions[extension]) extension = '.js';
            Module._extensions[extension](this, filename);
            this.loaded = true;
        };


        // Loads a module at the given file path. Returns that module's
        // `exports` property.
        Module.prototype.require = function(path) {
            assert(path, 'missing path');
            assert(typeof path === 'string', 'path must be a string');
            return Module._load(path, this, /* isMain */ false);
        };


        // Resolved path to process.argv[1] will be lazily placed here
        // (needed for setting breakpoint when called with --debug-brk)
        var resolvedArgv;


        // Run the file contents in the correct scope or sandbox. Expose
        // the correct helper variables (require, module, exports) to
        // the file.
        // Returns exception, if any.
        Module.prototype._compile = function(content, filename) {
            // Remove shebang
            var contLen = content.length;
            if (contLen >= 2) {
                if (content.charCodeAt(0) === 35 /*#*/ &&
                    content.charCodeAt(1) === 33 /*!*/ ) {
                    if (contLen === 2) {
                        // Exact match
                        content = '';
                    }
                    else {
                        // Find end of shebang line and slice it off
                        var i = 2;
                        for (; i < contLen; ++i) {
                            var code = content.charCodeAt(i);
                            if (code === 10 /*\n*/ || code === 13 /*\r*/ )
                                break;
                        }
                        if (i === contLen)
                            content = '';
                        else {
                            // Note that this actually includes the newline character(s) in the
                            // new output. This duplicates the behavior of the regular expression
                            // that was previously used to replace the shebang line
                            content = content.slice(i);
                        }
                    }
                }
            }

            // create wrapper function
            var wrapper = Module.wrap(content);

            var compiledWrapper = vm.runInThisContext(wrapper, {
                filename: filename,
                lineOffset: 0,
                displayErrors: true
            });

            if (process._debugWaitConnect) {
                if (!resolvedArgv) {
                    // we enter the repl if we're not given a filename argument.
                    if (process.argv[1]) {
                        resolvedArgv = Module._resolveFilename(process.argv[1], null);
                    }
                    else {
                        resolvedArgv = 'repl';
                    }
                }

                // Set breakpoint on module start
                if (filename === resolvedArgv) {
                    delete process._debugWaitConnect;
                    var Debug = vm.runInDebugContext('Debug');
                    Debug.setBreakPoint(compiledWrapper, 0, 0);
                }
            }
            var dirname = path.dirname(filename);
            var require = internalModule.makeRequireFunction.call(this);
            var args = [this.exports, require, this, filename, dirname];
            var depth = internalModule.requireDepth;
            if (depth === 0) stat.cache = new Map();
            var result = compiledWrapper.apply(this.exports, args);
            if (depth === 0) stat.cache = null;
            return result;
        };


        // Native extension for .js
        Module._extensions['.js'] = function(module, filename) {
            // var content = fs.readFileSync(filename, 'utf8');
            var fileN = filename.startsWith("./") ? filename.substr(2) : filename;
            var content = SMF.readCode(fileN);
            module._compile(internalModule.stripBOM(content), filename);
        };


        // Native extension for .json
        Module._extensions['.json'] = function(module, filename) {
            // var content = fs.readFileSync(filename, 'utf8');
            throw Error("Not implemented");
            var fileN = filename.startsWith("./") ? filename.substr(2) : filename;
            var content = SMF.readCode(fileN);
            try {
                module.exports = JSON.parse(internalModule.stripBOM(content));
            }
            catch (err) {
                err.message = filename + ': ' + err.message;
                throw err;
            }
        };


        //Native extension for .node
        // Module._extensions['.node'] = function(module, filename) {
        //     return process.dlopen(module, path._makeLong(filename));
        // };


        // bootstrap main module.
        Module.runMain = function() {
            // Load the main module--the command line argument.
            Module._load(process.argv[1], null, true);
            // Handle any nextTicks added in the first tick of the program
            // process._tickCallback();
        };

        Module._initPaths = function() {
            var isWindows = process.platform === 'win32';

            var homeDir;
            if (isWindows) {
                homeDir = process.env.USERPROFILE;
            }
            else {
                homeDir = process.env.HOME;
            }

            var paths = ["", "node_modules" /*path.resolve(process.execPath, '..', '..', 'lib', 'node')*/ ];

            if (homeDir) {
                paths.unshift(path.resolve(homeDir, '.node_libraries'));
                paths.unshift(path.resolve(homeDir, '.node_modules'));
            }

            var nodePath = process.env['NODE_PATH'];
            if (nodePath) {
                paths = nodePath.split(path.delimiter).filter(function(path) {
                    return !!path;
                }).concat(paths);
            }

            modulePaths = paths;

            // clone as a read-only copy, for introspection.
            Module.globalPaths = modulePaths.slice(0);
        };


        Module._preloadModules = function(requests) {
            if (!Array.isArray(requests))
                return;

            // Preloaded modules have a dummy parent module which is deemed to exist
            // in the current working directory. This seeds the search path for
            // preloaded modules.
            var parent = new Module('internal/preload', null);
            try {
                parent.paths = Module._nodeModulePaths(process.cwd());
            }
            catch (e) {
                if (e.code !== 'ENOENT') {
                    throw e;
                }
            }
            requests.forEach(function(request) {
                parent.require(request);
            });
        };

        Module._initPaths();

        // backwards compatibility
        return Module.Module = Module;
    }

    libs.internalModule = function internalModule() {
        if (!internalModule.exports) {
            internalModule.exports = initInternalModule();
        }
        return internalModule.exports;
    };

    function initInternalModule() {
        // Invoke with makeRequireFunction.call(module) where |module| is the
        // Module object to use as the context for the require() function.
        function makeRequireFunction() {
            const Module = this.constructor;
            const self = this;

            function require(path) {
                return self.require(path);
            }

            require.resolve = function(request) {
                return Module._resolveFilename(request, self);
            };

            require.main = process.mainModule;

            // Enable support to add extra extension types.
            require.extensions = Module._extensions;

            require.cache = Module._cache;

            return require;
        }

        /**
         * Remove byte order marker. This catches EF BB BF (the UTF-8 BOM)
         * because the buffer-to-string conversion in `fs.readFileSync()`
         * translates it to FEFF, the UTF-16 BOM.
         */
        function stripBOM(content) {
            if (content.charCodeAt(0) === 0xFEFF) {
                content = content.slice(1);
            }
            return content;
        }

        return {
            makeRequireFunction: makeRequireFunction,
            stripBOM: stripBOM
        };
    }

    libs.NativeModule = function NativeModule() {
        if (!NativeModule.exports) {
            NativeModule.exports = initNativeModule();
        }
        return NativeModule.exports;
    };


    function initNativeModule() {
        //var ContextifyScript =  ContextifyScript; //process.binding('contextify').ContextifyScript;

        function NativeModule(id) {
            this.filename = `${id}.js`;
            this.id = id;
            this.exports = {};
            this.loaded = false;
            this.loading = false;
            this.binding = function binding(libName) {
                return libs[libName]();
            };
        }

        // NativeModule._source = process.binding('natives');
        NativeModule._cache = {};

        NativeModule.require = function(id) {
            if (id == 'native_module') {
                return NativeModule;
            }

            var cached = NativeModule.getCached(id);
            if (cached && (cached.loaded || cached.loading)) {
                return cached.exports;
            }

            if (!NativeModule.exists(id)) {
                throw new Error(`No such native module ${id}`);
            }

            process.moduleLoadList.push(`NativeModule ${id}`);

            var nativeModule = new NativeModule(id);

            nativeModule.cache();
            nativeModule.compile();

            return nativeModule.exports;
        };

        NativeModule.getCached = function(id) {
            return NativeModule._cache[id];
        };

        NativeModule.exists = function(id) {
            return false;
            // return NativeModule._source.hasOwnProperty(id);
        };

        var EXPOSE_INTERNALS;
        /* = process.execArgv.some(function(arg) {
                    return arg.match(/^--expose[-_]internals$/);
                });*/

        if (EXPOSE_INTERNALS) {
            NativeModule.nonInternalExists = NativeModule.exists;

            NativeModule.isInternal = function(id) {
                return false;
            };
        }
        else {
            NativeModule.nonInternalExists = function(id) {
                return NativeModule.exists(id) && !NativeModule.isInternal(id);
            };

            NativeModule.isInternal = function(id) {
                return id.startsWith('internal/');
            };
        }


        // NativeModule.getSource = function(id) {
        //     return NativeModule._source[id];
        // };

        NativeModule.wrap = function(script) {
            return NativeModule.wrapper[0] + script + NativeModule.wrapper[1];
        };

        NativeModule.wrapper = [
            '(function (exports, require, module, __filename, __dirname) { ',
            '\n});'
        ];

        NativeModule.prototype.compile = function() {
            var source = NativeModule.getSource(this.id);
            source = NativeModule.wrap(source);

            this.loading = true;

            try {
                var fn = runInThisContext(source, {
                    filename: this.filename,
                    lineOffset: 0,
                    displayErrors: true
                });
                fn(this.exports, NativeModule.require, this, this.filename);

                this.loaded = true;
            }
            finally {
                this.loading = false;
            }
        };

        NativeModule.prototype.cache = function() {
            NativeModule._cache[this.id] = this;
        };

        function runInThisContext(code, options) {
            var script = new ContextifyScript(code, options);
            return script.runInThisContext();
        }




        return NativeModule;
    }


    libs.path = function path() {
        if (!path.exports) {
            path.exports = InitPath();
        }
        return path.exports;
    };


    function InitPath() {
        var util = /*require('util');*/ libs.util();

        function assertPath(path) {
            if (typeof path !== 'string') {
                throw new TypeError('Path must be a string. Received ' +
                    util.inspect(path));
            }
        }

        // resolves . and .. elements in a path array with directory names there
        // must be no slashes or device names (c:\) in the array
        // (so also no leading and trailing slashes - it does not distinguish
        // relative and absolute paths)
        function normalizeArray(parts, allowAboveRoot) {
            var res = [];
            for (var i = 0; i < parts.length; i++) {
                var p = parts[i];

                // ignore empty parts
                if (!p || p === '.')
                    continue;

                if (p === '..') {
                    if (res.length && res[res.length - 1] !== '..') {
                        res.pop();
                    }
                    else if (allowAboveRoot) {
                        res.push('..');
                    }
                }
                else {
                    res.push(p);
                }
            }

            return res;
        }

        // Returns an array with empty elements removed from either end of the input
        // array or the original array if no elements need to be removed
        function trimArray(arr) {
            var lastIndex = arr.length - 1;
            var start = 0;
            for (; start <= lastIndex; start++) {
                if (arr[start])
                    break;
            }

            var end = lastIndex;
            for (; end >= 0; end--) {
                if (arr[end])
                    break;
            }

            if (start === 0 && end === lastIndex)
                return arr;
            if (start > end)
                return [];
            return arr.slice(start, end + 1);
        }

        // Split a filename into [root, dir, basename, ext], unix version
        // 'root' is just a slash, or nothing.
        var splitPathRe =
            /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;
        var posix = {};


        function posixSplitPath(filename) {
            var out = splitPathRe.exec(filename);
            out.shift();
            return out;
        }


        // path.resolve([from ...], to)
        // posix version
        posix.resolve = function() {
            var resolvedPath = '';
            var resolvedAbsolute = false;

            for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
                var path = (i >= 0) ? arguments[i] : process.cwd();

                assertPath(path);

                // Skip empty entries
                if (path === '') {
                    continue;
                }

                resolvedPath = path + '/' + resolvedPath;
                resolvedAbsolute = path[0] === '/';
            }

            // At this point the path should be resolved to a full absolute path, but
            // handle relative paths to be safe (might happen when process.cwd() fails)

            // Normalize the path
            resolvedPath = normalizeArray(resolvedPath.split('/'), !resolvedAbsolute).join('/');
            var returnValue = ((resolvedAbsolute ? '/' : '') + resolvedPath) || '.';
            return returnValue;
        };

        // path.normalize(path)
        // posix version
        posix.normalize = function(path) {
            assertPath(path);

            var isAbsolute = posix.isAbsolute(path);
            var trailingSlash = path && path[path.length - 1] === '/';

            // Normalize the path
            path = normalizeArray(path.split('/'), !isAbsolute).join('/');

            if (!path && !isAbsolute) {
                path = '.';
            }
            if (path && trailingSlash) {
                path += '/';
            }

            return (isAbsolute ? '/' : '') + path;
        };

        // posix version
        posix.isAbsolute = function(path) {
            assertPath(path);
            return !!path && path[0] === '/';
        };

        // posix version
        posix.join = function() {
            var path = '';
            for (var i = 0; i < arguments.length; i++) {
                var segment = arguments[i];
                assertPath(segment);
                if (segment) {
                    if (!path) {
                        path += segment;
                    }
                    else {
                        path += '/' + segment;
                    }
                }
            }
            return posix.normalize(path);
        };


        // path.relative(from, to)
        // posix version
        posix.relative = function(from, to) {
            assertPath(from);
            assertPath(to);

            from = posix.resolve(from).substr(1);
            to = posix.resolve(to).substr(1);

            var fromParts = trimArray(from.split('/'));
            var toParts = trimArray(to.split('/'));

            var length = Math.min(fromParts.length, toParts.length);
            var samePartsLength = length;
            for (var i = 0; i < length; i++) {
                if (fromParts[i] !== toParts[i]) {
                    samePartsLength = i;
                    break;
                }
            }

            var outputParts = [];
            for (var j = samePartsLength; j < fromParts.length; j++) {
                outputParts.push('..');
            }

            outputParts = outputParts.concat(toParts.slice(samePartsLength));

            return outputParts.join('/');
        };


        posix._makeLong = function(path) {
            return path;
        };


        posix.dirname = function(path) {
            var result = posixSplitPath(path);
            var root = result[0];
            var dir = result[1];

            if (!root && !dir) {
                // No dirname whatsoever
                return '.';
            }

            if (dir) {
                // It has a dirname, strip trailing slash
                dir = dir.substr(0, dir.length - 1);
            }

            return root + dir;
        };


        posix.basename = function(path, ext) {
            if (ext !== undefined && typeof ext !== 'string')
                throw new TypeError('ext must be a string');

            var f = posixSplitPath(path)[2];

            if (ext && f.substr(-1 * ext.length) === ext) {
                f = f.substr(0, f.length - ext.length);
            }
            return f;
        };


        posix.extname = function(path) {
            return posixSplitPath(path)[3];
        };


        posix.format = function(pathObject) {
            if (pathObject === null || typeof pathObject !== 'object') {
                throw new TypeError(
                    "Parameter 'pathObject' must be an object, not " + typeof pathObject
                );
            }

            var root = pathObject.root || '';

            if (typeof root !== 'string') {
                throw new TypeError(
                    "'pathObject.root' must be a string or undefined, not " +
                    typeof pathObject.root
                );
            }

            var dir = pathObject.dir ? pathObject.dir + posix.sep : '';
            var base = pathObject.base || '';
            return dir + base;
        };


        posix.parse = function(pathString) {
            assertPath(pathString);

            var allParts = posixSplitPath(pathString);
            return {
                root: allParts[0],
                dir: allParts[0] + allParts[1].slice(0, -1),
                base: allParts[2],
                ext: allParts[3],
                name: allParts[2].slice(0, allParts[2].length - allParts[3].length)
            };
        };


        posix.sep = '/';
        posix.delimiter = ':';

        return posix;

    }

    libs.util = function util() {
        if (!util.exports) {
            util.exports = initUtil();
        }
        return util.exports;
    };

    function initUtil() {

        var exports = {};


        var isError = /*internalUtil.isError;*/ function isError(value) {
            return (value instanceof Error);
        };
        var kDefaultMaxLength = 100;

        var simdFormatters;

        // SIMD is only available when --harmony_simd is specified on the command line
        // and the set of available types differs between v5 and v6, that's why we use
        // a map to look up and store the formatters.  It also provides a modicum of
        // protection against users monkey-patching the SIMD object.
        if (typeof global.SIMD === 'object' && global.SIMD !== null) {
            simdFormatters = new Map();

            var make = function(extractLane, count) {
                return function(ctx, value, recurseTimes, visibleKeys, keys) {
                    var output = new Array(count);
                    for (var i = 0; i < count; i += 1)
                        output[i] = formatPrimitive(ctx, extractLane(value, i));
                    return output;
                };
            };

            var SIMD = global.SIMD; // Pacify eslint.

            if (typeof SIMD.Bool16x8 === 'function')
                simdFormatters.set(SIMD.Bool16x8, make(SIMD.Bool16x8.extractLane, 8));

            if (typeof SIMD.Bool32x4 === 'function')
                simdFormatters.set(SIMD.Bool32x4, make(SIMD.Bool32x4.extractLane, 4));

            if (typeof SIMD.Bool8x16 === 'function')
                simdFormatters.set(SIMD.Bool8x16, make(SIMD.Bool8x16.extractLane, 16));

            if (typeof SIMD.Float32x4 === 'function')
                simdFormatters.set(SIMD.Float32x4, make(SIMD.Float32x4.extractLane, 4));

            if (typeof SIMD.Int16x8 === 'function')
                simdFormatters.set(SIMD.Int16x8, make(SIMD.Int16x8.extractLane, 8));

            if (typeof SIMD.Int32x4 === 'function')
                simdFormatters.set(SIMD.Int32x4, make(SIMD.Int32x4.extractLane, 4));

            if (typeof SIMD.Int8x16 === 'function')
                simdFormatters.set(SIMD.Int8x16, make(SIMD.Int8x16.extractLane, 16));

            if (typeof SIMD.Uint16x8 === 'function')
                simdFormatters.set(SIMD.Uint16x8, make(SIMD.Uint16x8.extractLane, 8));

            if (typeof SIMD.Uint32x4 === 'function')
                simdFormatters.set(SIMD.Uint32x4, make(SIMD.Uint32x4.extractLane, 4));

            if (typeof SIMD.Uint8x16 === 'function')
                simdFormatters.set(SIMD.Uint8x16, make(SIMD.Uint8x16.extractLane, 16));
        }

        function tryStringify(arg) {
            try {
                return JSON.stringify(arg);
            }
            catch (_) {
                return '[Circular]';
            }
        }

        exports.format = function(f) {
            if (typeof f !== 'string') {
                var objects = new Array(arguments.length);
                for (var index = 0; index < arguments.length; index++) {
                    objects[index] = inspect(arguments[index]);
                }
                return objects.join(' ');
            }

            var argLen = arguments.length;

            if (argLen === 1) return f;

            var str = '';
            var a = 1;
            var lastPos = 0;
            for (var i = 0; i < f.length;) {
                if (f.charCodeAt(i) === 37 /*'%'*/ && i + 1 < f.length) {
                    switch (f.charCodeAt(i + 1)) {
                        case 100: // 'd'
                            if (a >= argLen)
                                break;
                            if (lastPos < i)
                                str += f.slice(lastPos, i);
                            str += Number(arguments[a++]);
                            lastPos = i = i + 2;
                            continue;
                        case 106: // 'j'
                            if (a >= argLen)
                                break;
                            if (lastPos < i)
                                str += f.slice(lastPos, i);
                            str += tryStringify(arguments[a++]);
                            lastPos = i = i + 2;
                            continue;
                        case 115: // 's'
                            if (a >= argLen)
                                break;
                            if (lastPos < i)
                                str += f.slice(lastPos, i);
                            str += String(arguments[a++]);
                            lastPos = i = i + 2;
                            continue;
                        case 37: // '%'
                            if (lastPos < i)
                                str += f.slice(lastPos, i);
                            str += '%';
                            lastPos = i = i + 2;
                            continue;
                    }
                }
                ++i;
            }
            if (lastPos === 0)
                str = f;
            else if (lastPos < f.length)
                str += f.slice(lastPos);
            while (a < argLen) {
                var x = arguments[a++];
                if (x === null || (typeof x !== 'object' && typeof x !== 'symbol')) {
                    str += ' ' + x;
                }
                else {
                    str += ' ' + inspect(x);
                }
            }
            return str;
        };

        var debugs = {};
        var debugEnviron;
        exports.debuglog = function(set) {
            if (debugEnviron === undefined)
                debugEnviron = process.env.NODE_DEBUG || '';
            set = set.toUpperCase();
            if (!debugs[set]) {
                if (new RegExp('\\b' + set + '\\b', 'i').test(debugEnviron)) {
                    var pid = process.pid;
                    debugs[set] = function() {
                        var msg = exports.format.apply(exports, arguments);
                        console.error('%s %d: %s', set, pid, msg);
                    };
                }
                else {
                    debugs[set] = function() {};
                }
            }
            return debugs[set];
        };


        /**
         * Echos the value of a value. Tries to print the value out
         * in the best way possible given the different types.
         *
         * @param {Object} obj The object to print out.
         * @param {Object} opts Optional options object that alters the output.
         */
        /* legacy: obj, showHidden, depth, colors*/
        function inspect(obj, opts) {
            // default options
            var ctx = {
                seen: [],
                stylize: stylizeNoColor
            };
            // legacy...
            if (arguments.length >= 3) ctx.depth = arguments[2];
            if (arguments.length >= 4) ctx.colors = arguments[3];
            if (typeof opts === 'boolean') {
                // legacy...
                ctx.showHidden = opts;
            }
            else if (opts) {
                // got an "options" object
                exports._extend(ctx, opts);
            }
            // set default options
            if (ctx.showHidden === undefined) ctx.showHidden = false;
            if (ctx.depth === undefined) ctx.depth = 2;
            if (ctx.colors === undefined) ctx.colors = false;
            if (ctx.customInspect === undefined) ctx.customInspect = true;
            if (ctx.showProxy === undefined) ctx.showProxy = false;
            if (ctx.colors) ctx.stylize = stylizeWithColor;
            if (ctx.maxArrayLength === undefined) ctx.maxArrayLength = kDefaultMaxLength;
            if (ctx.maxArrayLength === null) ctx.maxArrayLength = Infinity;
            if (ctx.breakLength === undefined) ctx.breakLength = 60;
            return formatValue(ctx, obj, ctx.depth);
        }
        exports.inspect = inspect;


        // http://en.wikipedia.org/wiki/ANSI_escape_code#graphics
        inspect.colors = {
            'bold': [1, 22],
            'italic': [3, 23],
            'underline': [4, 24],
            'inverse': [7, 27],
            'white': [37, 39],
            'grey': [90, 39],
            'black': [30, 39],
            'blue': [34, 39],
            'cyan': [36, 39],
            'green': [32, 39],
            'magenta': [35, 39],
            'red': [31, 39],
            'yellow': [33, 39]
        };

        // Don't use 'blue' not visible on cmd.exe
        inspect.styles = {
            'special': 'cyan',
            'number': 'yellow',
            'boolean': 'yellow',
            'undefined': 'grey',
            'null': 'bold',
            'string': 'green',
            'symbol': 'green',
            'date': 'magenta',
            // "name": intentionally not styling
            'regexp': 'red'
        };


        function stylizeWithColor(str, styleType) {
            var style = inspect.styles[styleType];

            if (style) {
                return '\u001b[' + inspect.colors[style][0] + 'm' + str +
                    '\u001b[' + inspect.colors[style][1] + 'm';
            }
            else {
                return str;
            }
        }


        function stylizeNoColor(str, styleType) {
            return str;
        }


        function arrayToHash(array) {
            var hash = Object.create(null);

            for (var i = 0; i < array.length; i++) {
                var val = array[i];
                hash[val] = true;
            }

            return hash;
        }


        function getConstructorOf(obj) {
            while (obj) {
                var descriptor = Object.getOwnPropertyDescriptor(obj, 'constructor');
                if (descriptor !== undefined &&
                    typeof descriptor.value === 'function' &&
                    descriptor.value.name !== '') {
                    return descriptor.value;
                }

                obj = Object.getPrototypeOf(obj);
            }

            return null;
        }


        function formatValue(ctx, value, recurseTimes) {
            if (ctx.showProxy &&
                ((typeof value === 'object' && value !== null) ||
                    typeof value === 'function')) {
                throw Error("Proxy should be implemented");
            }

            // Provide a hook for user-specified inspect functions.
            // Check that value is an object with an inspect function on it
            if (ctx.customInspect &&
                value &&
                typeof value.inspect === 'function' &&
                // Filter out the util module, it's inspect function is special
                value.inspect !== exports.inspect &&
                // Also filter out any prototype objects using the circular check.
                !(value.constructor && value.constructor.prototype === value)) {
                var ret = value.inspect(recurseTimes, ctx);
                if (typeof ret !== 'string') {
                    ret = formatValue(ctx, ret, recurseTimes);
                }
                return ret;
            }

            // Primitive types cannot have properties
            var primitive = formatPrimitive(ctx, value);
            if (primitive) {
                return primitive;
            }

            // Look up the keys of the object.
            var keys = Object.keys(value);
            var visibleKeys = arrayToHash(keys);

            if (ctx.showHidden) {
                keys = Object.getOwnPropertyNames(value);
                keys = keys.concat(Object.getOwnPropertySymbols(value));
            }

            // This could be a boxed primitive (new String(), etc.), check valueOf()
            // NOTE: Avoid calling `valueOf` on `Date` instance because it will return
            // a number which, when object has some additional user-stored `keys`,
            // will be printed out.
            var formatted;
            var raw = value;
            try {
                // the .valueOf() call can fail for a multitude of reasons
                if (!isDate(value))
                    raw = value.valueOf();
            }
            catch (e) {
                // ignore...
            }

            if (typeof raw === 'string') {
                // for boxed Strings, we have to remove the 0-n indexed entries,
                // since they just noisy up the output and are redundant
                keys = keys.filter(function(key) {
                    return !(key >= 0 && key < raw.length);
                });
            }

            // Some type of object without properties can be shortcutted.
            if (keys.length === 0) {
                if (typeof value === 'function') {
                    var name = value.name ? ': ' + value.name : '';
                    return ctx.stylize('[Function' + name + ']', 'special');
                }
                if (isRegExp(value)) {
                    return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
                }
                if (isDate(value)) {
                    if (Number.isNaN(value.getTime())) {
                        return ctx.stylize(value.toString(), 'date');
                    }
                    else {
                        return ctx.stylize(Date.prototype.toISOString.call(value), 'date');
                    }
                }
                if (isError(value)) {
                    return formatError(value);
                }
                // now check the `raw` value to handle boxed primitives
                if (typeof raw === 'string') {
                    formatted = formatPrimitiveNoColor(ctx, raw);
                    return ctx.stylize('[String: ' + formatted + ']', 'string');
                }
                if (typeof raw === 'symbol') {
                    formatted = formatPrimitiveNoColor(ctx, raw);
                    return ctx.stylize('[Symbol: ' + formatted + ']', 'symbol');
                }
                if (typeof raw === 'number') {
                    formatted = formatPrimitiveNoColor(ctx, raw);
                    return ctx.stylize('[Number: ' + formatted + ']', 'number');
                }
                if (typeof raw === 'boolean') {
                    formatted = formatPrimitiveNoColor(ctx, raw);
                    return ctx.stylize('[Boolean: ' + formatted + ']', 'boolean');
                }
            }

            var constructor = getConstructorOf(value);
            var base = '',
                empty = false,
                braces;
            var formatter = formatObject;

            // We can't compare constructors for various objects using a comparison like
            // `constructor === Array` because the object could have come from a different
            // context and thus the constructor won't match. Instead we check the
            // constructor names (including those up the prototype chain where needed) to
            // determine object types.
            if (Array.isArray(value)) {
                // Unset the constructor to prevent "Array [...]" for ordinary arrays.
                if (constructor && constructor.name === 'Array')
                    constructor = null;
                braces = ['[', ']'];
                empty = value.length === 0;
                formatter = formatArray;
            }
            else if (simdFormatters &&
                typeof value.constructor === 'function' &&
                (formatter = simdFormatters.get(value.constructor))) {
                braces = ['[', ']'];
            }
            else {
                // Unset the constructor to prevent "Object {...}" for ordinary objects.
                if (constructor && constructor.name === 'Object')
                    constructor = null;
                braces = ['{', '}'];
                empty = true; // No other data than keys.
            }

            empty = empty === true && keys.length === 0;

            // Make functions say that they are functions
            if (typeof value === 'function') {
                var n = value.name ? ': ' + value.name : '';
                base = ' [Function' + n + ']';
            }

            // Make RegExps say that they are RegExps
            if (isRegExp(value)) {
                base = ' ' + RegExp.prototype.toString.call(value);
            }

            // Make dates with properties first say the date
            if (isDate(value)) {
                base = ' ' + Date.prototype.toISOString.call(value);
            }

            // Make error with message first say the error
            if (isError(value)) {
                base = ' ' + formatError(value);
            }

            // Make boxed primitive Strings look like such
            if (typeof raw === 'string') {
                formatted = formatPrimitiveNoColor(ctx, raw);
                base = ' ' + '[String: ' + formatted + ']';
            }

            // Make boxed primitive Numbers look like such
            if (typeof raw === 'number') {
                formatted = formatPrimitiveNoColor(ctx, raw);
                base = ' ' + '[Number: ' + formatted + ']';
            }

            // Make boxed primitive Booleans look like such
            if (typeof raw === 'boolean') {
                formatted = formatPrimitiveNoColor(ctx, raw);
                base = ' ' + '[Boolean: ' + formatted + ']';
            }

            // Add constructor name if available
            if (base === '' && constructor)
                braces[0] = constructor.name + ' ' + braces[0];

            if (empty === true) {
                return braces[0] + base + braces[1];
            }

            if (recurseTimes < 0) {
                if (isRegExp(value)) {
                    return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
                }
                else {
                    return ctx.stylize('[Object]', 'special');
                }
            }

            ctx.seen.push(value);

            var output = formatter(ctx, value, recurseTimes, visibleKeys, keys);

            ctx.seen.pop();

            return reduceToSingleString(output, base, braces, ctx.breakLength);
        }


        function formatNumber(ctx, value) {
            // Format -0 as '-0'. Strict equality won't distinguish 0 from -0,
            // so instead we use the fact that 1 / -0 < 0 whereas 1 / 0 > 0 .
            if (value === 0 && 1 / value < 0)
                return ctx.stylize('-0', 'number');
            return ctx.stylize('' + value, 'number');
        }


        function formatPrimitive(ctx, value) {
            if (value === undefined)
                return ctx.stylize('undefined', 'undefined');

            // For some reason typeof null is "object", so special case here.
            if (value === null)
                return ctx.stylize('null', 'null');

            var type = typeof value;

            if (type === 'string') {
                var simple = '\'' +
                    JSON.stringify(value)
                    .replace(/^"|"$/g, '')
                    .replace(/'/g, "\\'")
                    .replace(/\\"/g, '"') +
                    '\'';
                return ctx.stylize(simple, 'string');
            }
            if (type === 'number')
                return formatNumber(ctx, value);
            if (type === 'boolean')
                return ctx.stylize('' + value, 'boolean');
            // es6 symbol primitive
            if (type === 'symbol')
                return ctx.stylize(value.toString(), 'symbol');
        }


        function formatPrimitiveNoColor(ctx, value) {
            var stylize = ctx.stylize;
            ctx.stylize = stylizeNoColor;
            var str = formatPrimitive(ctx, value);
            ctx.stylize = stylize;
            return str;
        }


        function formatError(value) {
            return value.stack || '[' + Error.prototype.toString.call(value) + ']';
        }


        function formatObject(ctx, value, recurseTimes, visibleKeys, keys) {
            return keys.map(function(key) {
                return formatProperty(ctx, value, recurseTimes, visibleKeys, key, false);
            });
        }


        function formatArray(ctx, value, recurseTimes, visibleKeys, keys) {
            var output = [];
            var maxLength = Math.min(Math.max(0, ctx.maxArrayLength), value.length);
            var remaining = value.length - maxLength;
            for (var i = 0; i < maxLength; ++i) {
                if (hasOwnProperty(value, String(i))) {
                    output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
                        String(i), true));
                }
                else {
                    output.push('');
                }
            }
            if (remaining > 0) {
                output.push(`... ${remaining} more item${remaining > 1 ? 's' : ''}`);
            }
            keys.forEach(function(key) {
                if (typeof key === 'symbol' || !key.match(/^\d+$/)) {
                    output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
                        key, true));
                }
            });
            return output;
        }

        function formatProperty(ctx, value, recurseTimes, visibleKeys, key, array) {
            var name, str, desc;
            desc = Object.getOwnPropertyDescriptor(value, key) || {
                value: value[key]
            };
            if (desc.get) {
                if (desc.set) {
                    str = ctx.stylize('[Getter/Setter]', 'special');
                }
                else {
                    str = ctx.stylize('[Getter]', 'special');
                }
            }
            else {
                if (desc.set) {
                    str = ctx.stylize('[Setter]', 'special');
                }
            }
            if (!hasOwnProperty(visibleKeys, key)) {
                if (typeof key === 'symbol') {
                    name = '[' + ctx.stylize(key.toString(), 'symbol') + ']';
                }
                else {
                    name = '[' + key + ']';
                }
            }
            if (!str) {
                if (ctx.seen.indexOf(desc.value) < 0) {
                    if (recurseTimes === null) {
                        str = formatValue(ctx, desc.value, null);
                    }
                    else {
                        str = formatValue(ctx, desc.value, recurseTimes - 1);
                    }
                    if (str.indexOf('\n') > -1) {
                        if (array) {
                            str = str.replace(/\n/g, '\n  ');
                        }
                        else {
                            str = str.replace(/(^|\n)/g, '\n   ');
                        }
                    }
                }
                else {
                    str = ctx.stylize('[Circular]', 'special');
                }
            }
            if (name === undefined) {
                if (array && key.match(/^\d+$/)) {
                    return str;
                }
                name = JSON.stringify('' + key);
                if (name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)) {
                    name = name.substr(1, name.length - 2);
                    name = ctx.stylize(name, 'name');
                }
                else {
                    name = name.replace(/'/g, "\\'")
                        .replace(/\\"/g, '"')
                        .replace(/(^"|"$)/g, "'")
                        .replace(/\\\\/g, '\\');
                    name = ctx.stylize(name, 'string');
                }
            }

            return name + ': ' + str;
        }


        function reduceToSingleString(output, base, braces, breakLength) {
            var length = output.reduce(function(prev, cur) {
                return prev + cur.replace(/\u001b\[\d\d?m/g, '').length + 1;
            }, 0);

            if (length > breakLength) {
                return braces[0] +
                    // If the opening "brace" is too large, like in the case of "Set {",
                    // we need to force the first item to be on the next line or the
                    // items will not line up correctly.
                    (base === '' && braces[0].length === 1 ? '' : base + '\n ') +
                    ' ' +
                    output.join(',\n  ') +
                    ' ' +
                    braces[1];
            }

            return braces[0] + base + ' ' + output.join(', ') + ' ' + braces[1];
        }


        // NOTE: These type checking functions intentionally don't use `instanceof`
        // because it is fragile and can be easily faked with `Object.create()`.
        exports.isArray = Array.isArray;

        function isBoolean(arg) {
            return typeof arg === 'boolean';
        }
        exports.isBoolean = isBoolean;

        function isNull(arg) {
            return arg === null;
        }
        exports.isNull = isNull;

        function isNullOrUndefined(arg) {
            return arg === null || arg === undefined;
        }
        exports.isNullOrUndefined = isNullOrUndefined;

        function isNumber(arg) {
            return typeof arg === 'number';
        }
        exports.isNumber = isNumber;

        function isString(arg) {
            return typeof arg === 'string';
        }
        exports.isString = isString;

        function isSymbol(arg) {
            return typeof arg === 'symbol';
        }
        exports.isSymbol = isSymbol;

        function isUndefined(arg) {
            return arg === undefined;
        }
        exports.isUndefined = isUndefined;

        function isRegExp(re) {
            return re instanceof RegExp;
        }
        exports.isRegExp = isRegExp;

        function isObject(arg) {
            return arg !== null && typeof arg === 'object';
        }
        exports.isObject = isObject;

        function isDate(d) {
            return d instanceof Date;
        }
        exports.isDate = isDate;

        exports.isError = isError;

        function isFunction(arg) {
            return typeof arg === 'function';
        }
        exports.isFunction = isFunction;

        function isPrimitive(arg) {
            return arg === null ||
                typeof arg !== 'object' && typeof arg !== 'function';
        }
        exports.isPrimitive = isPrimitive;

        // exports.isBuffer = Buffer.isBuffer;

        function pad(n) {
            return n < 10 ? '0' + n.toString(10) : n.toString(10);
        }


        var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep',
            'Oct', 'Nov', 'Dec'
        ];

        // 26 Feb 16:19:34
        function timestamp() {
            var d = new Date();
            var time = [pad(d.getHours()),
                pad(d.getMinutes()),
                pad(d.getSeconds())
            ].join(':');
            return [d.getDate(), months[d.getMonth()], time].join(' ');
        }


        // log is just a thin wrapper to console.log that prepends a timestamp
        exports.log = function() {
            console.log('%s - %s', timestamp(), exports.format.apply(exports, arguments));
        };


        /**
         * Inherit the prototype methods from one constructor into another.
         *
         * The Function.prototype.inherits from lang.js rewritten as a standalone
         * function (not on Function.prototype). NOTE: If this file is to be loaded
         * during bootstrapping this function needs to be rewritten using some native
         * functions as prototype setup using normal JavaScript does not work as
         * expected during bootstrapping (see mirror.js in r114903).
         *
         * @param {function} ctor Constructor function which needs to inherit the
         *     prototype.
         * @param {function} superCtor Constructor function to inherit prototype from.
         * @throws {TypeError} Will error if either constructor is null, or if
         *     the super constructor lacks a prototype.
         */
        exports.inherits = function(ctor, superCtor) {

            if (ctor === undefined || ctor === null)
                throw new TypeError('The constructor to "inherits" must not be ' +
                    'null or undefined');

            if (superCtor === undefined || superCtor === null)
                throw new TypeError('The super constructor to "inherits" must not ' +
                    'be null or undefined');

            if (superCtor.prototype === undefined)
                throw new TypeError('The super constructor to "inherits" must ' +
                    'have a prototype');

            ctor.super_ = superCtor;
            Object.setPrototypeOf(ctor.prototype, superCtor.prototype);
        };

        exports._extend = function(origin, add) {
            // Don't do anything if add isn't an object
            if (add === null || typeof add !== 'object') return origin;

            var keys = Object.keys(add);
            var i = keys.length;
            while (i--) {
                origin[keys[i]] = add[keys[i]];
            }
            return origin;
        };

        function hasOwnProperty(obj, prop) {
            return Object.prototype.hasOwnProperty.call(obj, prop);
        }

        return exports;
    }

    libs.vm = function vm() {
        var exports;

        if (!vm.exports) {
            vm.exports = exports = {};

            // var binding = process.binding('contextify');
            var Script = ContextifyScript; //binding.ContextifyScript;

            exports.Script = Script;

            exports.createScript = function(code, options) {
                return new Script(code, options);
            };

            exports.runInThisContext = function(code, options) {
                var script = new Script(code, options);
                return script.runInThisContext(options);
            };

        }
        return vm.exports;
    };

    var contextify = {
        ContextifyScript: ContextifyScript
    };

    libs.contextify = function contextify() {
        return contextify;
    };



    function ContextifyScript(code, options) {
        if (SMF.Contextify)
            return new SMF.Contextify(code, options);

        this.runInContext = function runInContext(contextifiedSandbox, options) {
            throw Error("Not implemented");
        };

        this.runInNewContext = function runInNewContext(sandbox, options) {
            throw Error("Not implemented");
        };


        this.runInThisContext = function runInThisContext(options) {
            try {
                var fn = eval(code);

            }
            catch (ex) {
                throw ex;
            }
            //TODO: assign parameter values
            return fn;
        };


    }

    var initiatedRequire = false;

    function initRequire(startFile) {
        if (initiatedRequire) {
            throw Error("Should not initRequire more than once");
        }
        initiatedRequire = true;
        process.argv = ["smartface", startFile];
        var m = libs.Module();
        m.runMain();
    }

    global.initRequire = initRequire;

})();
