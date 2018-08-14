// fulfill.js
// Douglas Crockford
// 2018-08-14

// Public Domain

/*property
    freeze, reduce, replace, split
*/

const rx_angle_brackets = /<|>/g;

const rx_syntactic_variable = /\{([^{}:\s]+)(?::([^{}:\s]+))?\}/g;

// pattern capturing groups:

// [0] original (symbolic variable wrapped in braces)
// [1] path
// [2] encoding

export default Object.freeze(function fulfill(
    string,
    container,
    encoder = function (replacement) {
        return (
            typeof replacement === "string"
            ? replacement.replace(rx_angle_brackets, "")
            : replacement
        );
    }
) {

// The fulfill function takes
//      string: containing symbolic variables.
//      container: an object or array containing values to replace the symbolic
//          variables, or a function.
//      encoder: (optional) An encoder function or an object of encoder
//          functions. The default is to remove all angle brackets.

// Most of the work is done by the string replace method, which will find the
// symbolic variables, presenting them here as the original substring, a path
// string, and an optional encoding string.

    return string.replace(
        rx_syntactic_variable,
        function (original, path, encoding = "") {
            try {

// Use the path to obtain a single replacement from the container of values.
// The path contains wun or more names (or numbers) separated by periods.

                let replacement = (
                    typeof container === "function"
                    ? container
                    : path.split(".").reduce(
                        function (refinement, element) {
                            return refinement[element];
                        },
                        container
                    )
                );

// If the replacement value is a function, call it.

                if (typeof replacement === "function") {
                    replacement = replacement(path, encoding);
                }

// If an encoder object was provided, call wun of its functions.
// Otherwise, call the encoder function.

                replacement = (
                    typeof encoder === "object"
                    ? encoder[encoding]
                    : encoder
                )(replacement, path, encoding);

// If the replacement is a number or boolean, convert it to a string.

                if (
                    typeof replacement === "number"
                    || typeof replacement === "boolean"
                ) {
                    replacement = String(replacement);
                }

// If the replacement is a string, then do the substitution.
// Otherwise, leave the symbolic variable in its original state.

                return (
                    typeof replacement === "string"
                    ? replacement
                    : original
                );

// If anything goes wrong, then leave the symbolic variable in its original
// state.

            } catch (ignore) {
                return original;
            }
        }
    );
});
