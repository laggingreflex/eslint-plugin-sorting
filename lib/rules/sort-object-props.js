"use strict";

/**
 * @param {Property} prop ObjectExpression property.
 *
 * @returns {String} Property key as a string.
 */
function getKey(prop, context) {
    var ret, path =0;
    try{
    if (prop.key.type === "Literal") {
        path = 1;
        ret = prop.key.value.toString();
    } else {
        path = 2;
        ret = prop.key.name.toString();
    }
    }catch(err){
        if (ret) {
            console.dir({path}, {depth: 31});
            return ret;
        } else {
            console.dir({path, prop}, {depth: 31});
            throw err
        }
    }
}

module.exports = {
    create: function(context) {
        var opts = context.options[0] || {};
        return {
            ObjectExpression: function(node) {
                node.properties.reduce(function(prev, current) {
                    if (opts.ignoreMethods && current.value.type === "FunctionExpression") {
                        return current;
                    }
                    if (current.type === "ExperimentalSpreadProperty" ||
                        prev.type === "ExperimentalSpreadProperty") {
                        return current;
                    }
                    if (current.key.type === "CallExpression" ||
                        prev.key.type === "CallExpression") {
                        return current;
                    }

                    var prevKey = getKey(prev, context);
                    var currentKey = getKey(current, context);
                    if (opts.ignoreCase && prev) {
                        prevKey = prevKey.toLowerCase();
                        currentKey = currentKey.toLowerCase();
                    }

                    if (opts.ignorePrivate && /^_/.test(currentKey)) {
                        return current;
                    }

                    if (currentKey < prevKey) {
                        context.report(current, "Property names in an object literal should be sorted alphabetically");
                    }
                    return current;
                }, node.properties[0]);
            }
        };
    }
};
