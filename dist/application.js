"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const operation_processor_1 = require("./processors/operation-processor");
class Application {
    constructor(settings) {
        this.namespace = settings.namespace || "";
        this.types = settings.types || [];
        this.processors = settings.processors || [];
        this.defaultProcessor =
            settings.defaultProcessor || new operation_processor_1.default();
        this.defaultProcessor.app = this;
        this.processors.forEach(processor => (processor.app = this));
    }
    async executeOperations(ops) {
        return await this.createTransaction(ops.map(async (op) => {
            const processor = this.processorFor(op);
            const result = await processor.execute(op);
            return this.buildOperationResponse(result, processor.flushIncludes());
        }));
    }
    async createTransaction(ops) {
        return await Promise.all(ops);
    }
    processorFor(op) {
        return (this.processors.find(processor => processor.shouldHandle(op)) ||
            this.defaultProcessor);
    }
    buildOperationResponse(data, included) {
        return {
            data: data || null,
            included: included || null
        };
    }
}
exports.default = Application;
//# sourceMappingURL=application.js.map