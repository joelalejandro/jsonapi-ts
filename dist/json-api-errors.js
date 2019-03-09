"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const types_1 = require("./types");
const jsonApiErrors = {
    UnhandledError: () => ({
        status: types_1.HttpStatusCode.InternalServerError,
        code: "unhandled_error"
    }),
    AccessDenied: () => ({
        status: types_1.HttpStatusCode.Forbidden,
        code: "access_denied"
    }),
    Unauthorized: () => ({
        status: types_1.HttpStatusCode.Unauthorized,
        code: "unauthorized"
    })
};
exports.default = jsonApiErrors;
//# sourceMappingURL=json-api-errors.js.map