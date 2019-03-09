"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const escapeStringRegexp = require("escape-string-regexp");
const jsonwebtoken_1 = require("jsonwebtoken");
const koaBody = require("koa-body");
const compose = require("koa-compose");
const json_api_errors_1 = require("../json-api-errors");
const json_api_params_1 = require("../utils/json-api-params");
const string_1 = require("../utils/string");
const STATUS_MAPPING = {
    GET: 200,
    POST: 201,
    PATCH: 200,
    PUT: 200,
    DELETE: 204
};
function jsonApiKoa(app, ...middlewares) {
    const jsonApiKoa = async (ctx, next) => {
        await authenticate(app, ctx);
        const data = urlData(app, ctx);
        if (ctx.method === "PATCH" && data.resource === "bulk") {
            await handleBulkEndpoint(app, ctx);
            return await next();
        }
        const typeNames = app.types.map(t => t.name);
        if (typeNames.includes(string_1.classify(string_1.singularize(data.resource)))) {
            ctx.urlData = data;
            return await handleJsonApiEndpoints(app, ctx).then(() => next());
        }
        await next();
    };
    return compose([koaBody({ json: true }), ...middlewares, jsonApiKoa]);
}
exports.default = jsonApiKoa;
async function authenticate(app, ctx) {
    const authHeader = ctx.request.headers.authorization;
    let currentUser = null;
    if (authHeader && authHeader.startsWith("Bearer ")) {
        const [, token] = authHeader.split(" ");
        const tokenPayload = jsonwebtoken_1.decode(token);
        const userId = tokenPayload["id"];
        if (!userId)
            return;
        const [user] = await app.executeOperations([
            {
                op: "get",
                ref: {
                    type: "user",
                    id: userId
                }
            }
        ]);
        currentUser = user.data[0];
    }
    app.user = currentUser;
}
function urlData(app, ctx) {
    const urlRegexp = new RegExp(`^\/?(?<namespace>${escapeStringRegexp(app.namespace)})(\/?(?<resource>[\\w|-]+))?(\/(?<id>\\S+))?`);
    return (ctx.path.match(urlRegexp) || {})["groups"] || {};
}
async function handleBulkEndpoint(app, ctx) {
    const operations = await app.executeOperations(ctx.request.body.operations || []);
    ctx.body = { operations };
}
async function handleJsonApiEndpoints(app, ctx) {
    const op = convertHttpRequestToOperation(ctx);
    try {
        const [result] = await app.executeOperations([op]);
        ctx.body = convertOperationResponseToHttpResponse(ctx, result);
        ctx.status = STATUS_MAPPING[ctx.method];
    }
    catch (e) {
        const isJsonApiError = e && e.status;
        if (!isJsonApiError)
            console.error("JSONAPI-TS: ", e);
        const jsonApiError = isJsonApiError ? e : json_api_errors_1.default.UnhandledError();
        ctx.body = convertJsonApiErrorToHttpResponse(jsonApiError);
        ctx.status = jsonApiError.status;
    }
}
function convertHttpRequestToOperation(ctx) {
    const { id, resource } = ctx.urlData;
    const type = string_1.classify(string_1.singularize(resource));
    const opMap = {
        GET: "get",
        POST: "add",
        PATCH: "update",
        PUT: "update",
        DELETE: "remove"
    };
    return {
        op: opMap[ctx.method],
        params: json_api_params_1.parse(ctx.href),
        ref: { id, type },
        data: ctx.request.body.data
    };
}
function convertOperationResponseToHttpResponse(ctx, operation) {
    const responseMethods = ["GET", "POST", "PATCH", "PUT"];
    if (responseMethods.includes(ctx.method)) {
        return { data: operation.data, included: operation.included };
    }
}
function convertJsonApiErrorToHttpResponse(error) {
    return { errors: [error] };
}
//# sourceMappingURL=json-api-koa.js.map