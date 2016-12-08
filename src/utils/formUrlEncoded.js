module.exports = function(data, opts) {
    opts = typeof opts === 'object' ? opts : {};
    return filterJoin(keys(data).map(function(key) {
        return nest(key, data[key]);
    }));

    function encode(value) {
        return String(value)
            .replace(/[^ !'()~\*]*/g, encodeURIComponent)
            .replace(/ /g, '+')
            .replace(/[!'()~\*]/g, function(ch) {
                return '%' + ch.charCodeAt().toString(16).slice(-2).toUpperCase();
            });
    }

    function keys(obj) {
        if (!(obj instanceof Object)) {//
            return [];
        }
        var keys = Object.keys(obj);
        if (keys.length === 0) {
            return [];
        }
        return opts.sorted ? keys.sort() : keys;
    }

    function filterJoin(arr) {
        return arr.filter(function(e) {
            return e;
        }).join('&');
    }

    function objectNest(name, obj) {
        return filterJoin(keys(obj).map(function(key) {
            return nest(name + '[' + key + ']', obj[key]);
        }));
    }

    function arrayNest(name, arr) {
        return filterJoin(arr.map(function(elem) {
            return nest(name + '[]', elem);
        }));
    }

    function nest(name, value) {
        var type = typeof value,
            f = null;

        if (value === f) {
            f = opts.ignorenull ? f : encode(name) + '=' + f;
        }
        else if (/string|number|boolean/.test(type)) {
            f = encode(name) + '=' + encode(value);
        }
        else if (Array.isArray(value)) {
            f = arrayNest(name, value);
        }
        else if (type === 'object') {
            f = objectNest(name, value);
        }

        return f;
    }
};
