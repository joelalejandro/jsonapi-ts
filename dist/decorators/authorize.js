"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const json_api_errors_1 = require("../json-api-errors");
const decorator_1 = require("./decorator");
function authorizeMiddleware(operation) {
    return function () {
        if (!this.app.user) {
            throw json_api_errors_1.default.Unauthorized();
        }
        return operation.call(this, ...arguments);
    };
}
/**
 * This decorator is responsible of checking if there's a user in the API's
 * context object. If there is, it'll allow the operation to continue.
 * If not, it'll throw an `Unauthorized` error code.
 */
function authorize() {
    return decorator_1.default(authorizeMiddleware);
}
exports.default = authorize;
//# sourceMappingURL=authorize.js.map