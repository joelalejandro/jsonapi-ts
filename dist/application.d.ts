import OperationProcessor from "./processors/operation-processor";
import Resource from "./resource";
import { Operation, OperationResponse, ResourceConstructor } from "./types";
export default class Application {
    namespace?: string;
    types: ResourceConstructor[];
    processors: OperationProcessor[];
    defaultProcessor: OperationProcessor;
    user: Resource;
    constructor(settings: {
        namespace?: string;
        types?: ResourceConstructor[];
        processors?: OperationProcessor[];
        defaultProcessor?: OperationProcessor;
    });
    executeOperations(ops: Operation[]): Promise<OperationResponse[]>;
    createTransaction(ops: Promise<OperationResponse>[]): Promise<OperationResponse[]>;
    processorFor(op: Operation): OperationProcessor;
    buildOperationResponse(data: Resource | Resource[] | void, included: Resource[] | void): OperationResponse;
}
