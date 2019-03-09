"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const string_1 = require("../utils/string");
class OperationProcessor {
    constructor() {
        this.includedResources = [];
    }
    shouldHandle(op) {
        return this.resourceClass && op.ref.type === this.resourceClass.name;
    }
    execute(op) {
        const action = op.op;
        return this[action] && this[action].call(this, op);
    }
    resourceFor(type = "") {
        return this.app.types.find(({ name }) => {
            return name === string_1.classify(string_1.singularize(type));
        });
    }
    include(resources) {
        resources.forEach(resource => {
            if (!this.includedResources.find(included => included.id === resource.id)) {
                this.includedResources.push(resource);
            }
        });
    }
    flushIncludes() {
        const included = [...this.includedResources];
        this.includedResources = [];
        return included;
    }
    async get(op) {
        return [];
    }
    async remove(op) {
        return Promise.reject();
    }
    async update(op) {
        return Promise.reject();
    }
    async add(op) {
        return Promise.reject();
    }
}
exports.default = OperationProcessor;
//# sourceMappingURL=operation-processor.js.map