import { Middleware } from "koa";
import * as compose from "koa-compose";
import Application from "../application";
export default function jsonApiKoa(app: Application, ...middlewares: Middleware[]): compose.ComposedMiddleware<import("koa").ParameterizedContext<any, {}>>;
