"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const string_1 = require("./utils/string");
class Resource {
    constructor({ id, attributes, relationships }) {
        this.type = string_1.camelize(this.constructor.name);
        this.id = id;
        this.attributes = attributes || {};
        this.relationships = relationships || {};
    }
}
exports.default = Resource;
//# sourceMappingURL=resource.js.map