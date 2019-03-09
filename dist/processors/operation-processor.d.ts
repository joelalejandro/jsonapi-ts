import Application from "../application";
import Resource from "../resource";
import { Operation, ResourceConstructor } from "../types";
export default class OperationProcessor<ResourceT = Resource> {
    app: Application;
    resourceClass?: ResourceConstructor;
    protected includedResources: Resource[];
    shouldHandle(op: Operation): boolean;
    execute(op: Operation): Promise<ResourceT | ResourceT[] | void>;
    resourceFor(type?: string): ResourceConstructor;
    include(resources: Resource[]): void;
    flushIncludes(): Resource[];
    get(op: Operation): Promise<ResourceT[]>;
    remove(op: Operation): Promise<void>;
    update(op: Operation): Promise<ResourceT>;
    add(op: Operation): Promise<ResourceT>;
}
