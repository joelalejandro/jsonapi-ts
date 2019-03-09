"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const url_1 = require("url");
const JSON_API_ARRAY_KEYS = ["include", "sort", "fields"];
function parse(url) {
    const params = {};
    const nestedParamRegexp = new RegExp(/(\w+)\[(.*?)\]?$/);
    for (const param of new url_1.URL(url).searchParams) {
        const [paramKey, paramValue] = param;
        const nestedParam = nestedParamRegexp.exec(paramKey);
        if (nestedParam) {
            const [, key, nestedKey] = nestedParam;
            if (!(params[key] instanceof Object)) {
                params[key] = {};
            }
            if (paramValue !== "") {
                params[key][nestedKey] = parseValueForKey(paramKey, paramValue);
            }
        }
        else {
            if (paramValue !== "") {
                params[paramKey] = parseValueForKey(paramKey, paramValue);
            }
        }
    }
    return params;
}
exports.parse = parse;
function parseValueForKey(key, value = "") {
    if (JSON_API_ARRAY_KEYS.includes(key)) {
        return value.split(",");
    }
    return value;
}
//# sourceMappingURL=json-api-params.js.map