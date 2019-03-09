import * as escapeStringRegexp from "escape-string-regexp";
import { decode } from "jsonwebtoken";
import { Context, Middleware } from "koa";
import * as koaBody from "koa-body";
import * as compose from "koa-compose";

import Application from "../application";
import JsonApiErrors from "../json-api-errors";
import {
  JsonApiDocument,
  JsonApiError,
  JsonApiErrorsDocument,
  Operation,
  OperationResponse
} from "../types";
import { parse } from "../utils/json-api-params";
import { classify, singularize } from "../utils/string";

const STATUS_MAPPING = {
  GET: 200,
  POST: 201,
  PATCH: 200,
  PUT: 200,
  DELETE: 204
};

export default function jsonApiKoa(
  app: Application,
  ...middlewares: Middleware[]
) {
  const jsonApiKoa = async (ctx: Context, next: () => Promise<any>) => {
    await authenticate(app, ctx);

    const data = urlData(app, ctx);

    if (ctx.method === "PATCH" && data.resource === "bulk") {
      await handleBulkEndpoint(app, ctx);
      return await next();
    }

    const typeNames = app.types.map(t => t.name);

    if (typeNames.includes(classify(singularize(data.resource)))) {
      ctx.urlData = data;
      return await handleJsonApiEndpoints(app, ctx).then(() => next());
    }

    await next();
  };

  return compose([koaBody({ json: true }), ...middlewares, jsonApiKoa]);
}

async function authenticate(app: Application, ctx: Context) {
  const authHeader = ctx.request.headers.authorization;
  let currentUser = null;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    const [, token] = authHeader.split(" ");
    const tokenPayload = decode(token);
    const userId = tokenPayload["id"];

    if (!userId) return;

    const [user] = await app.executeOperations([
      {
        op: "get",
        ref: {
          type: "user",
          id: userId
        }
      } as Operation
    ]);

    currentUser = user.data[0];
  }

  app.user = currentUser;
}

function urlData(app: Application, ctx: Context) {
  const urlRegexp = new RegExp(
    `^\/?(?<namespace>${escapeStringRegexp(
      app.namespace
    )})(\/?(?<resource>[\\w|-]+))?(\/(?<id>\\S+))?`
  );

  return (ctx.path.match(urlRegexp) || {})["groups"] || {};
}

async function handleBulkEndpoint(app: Application, ctx: Context) {
  const operations = await app.executeOperations(
    ctx.request.body.operations || []
  );

  ctx.body = { operations };
}

async function handleJsonApiEndpoints(app: Application, ctx: Context) {
  const op: Operation = convertHttpRequestToOperation(ctx);

  try {
    const [result]: OperationResponse[] = await app.executeOperations([op]);

    ctx.body = convertOperationResponseToHttpResponse(ctx, result);
    ctx.status = STATUS_MAPPING[ctx.method];
  } catch (e) {
    const isJsonApiError = e && e.status;
    if (!isJsonApiError) console.error("JSONAPI-TS: ", e);

    const jsonApiError = isJsonApiError ? e : JsonApiErrors.UnhandledError();

    ctx.body = convertJsonApiErrorToHttpResponse(jsonApiError);
    ctx.status = jsonApiError.status;
  }
}

function convertHttpRequestToOperation(ctx: Context): Operation {
  const { id, resource } = ctx.urlData;
  const type = classify(singularize(resource));

  const opMap = {
    GET: "get",
    POST: "add",
    PATCH: "update",
    PUT: "update",
    DELETE: "remove"
  };

  return {
    op: opMap[ctx.method],
    params: parse(ctx.href),
    ref: { id, type },
    data: ctx.request.body.data
  } as Operation;
}

function convertOperationResponseToHttpResponse(
  ctx: Context,
  operation: OperationResponse
): JsonApiDocument {
  const responseMethods = ["GET", "POST", "PATCH", "PUT"];

  if (responseMethods.includes(ctx.method)) {
    return { data: operation.data, included: operation.included };
  }
}

function convertJsonApiErrorToHttpResponse(
  error: JsonApiError
): JsonApiErrorsDocument {
  return { errors: [error] };
}
