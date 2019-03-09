"use strict";
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
const application_1 = require("./application");
exports.Application = application_1.default;
const authorize_1 = require("./decorators/authorize");
exports.Authorize = authorize_1.default;
const decorator_1 = require("./decorators/decorator");
exports.decorateWith = decorator_1.default;
const json_api_errors_1 = require("./json-api-errors");
exports.JsonApiErrors = json_api_errors_1.default;
const json_api_koa_1 = require("./middlewares/json-api-koa");
exports.jsonApiKoa = json_api_koa_1.default;
const knex_processor_1 = require("./processors/knex-processor");
exports.KnexProcessor = knex_processor_1.default;
const operation_processor_1 = require("./processors/operation-processor");
exports.OperationProcessor = operation_processor_1.default;
const resource_1 = require("./resource");
exports.Resource = resource_1.default;
__export(require("./types"));
//# sourceMappingURL=index.js.map