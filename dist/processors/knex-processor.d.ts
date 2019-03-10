import * as Knex from "knex";
import Resource from "../resource";
import { KnexRecord, Operation } from "../types";
import OperationProcessor from "./operation-processor";
export default class KnexProcessor<ResourceT = Resource> extends OperationProcessor<ResourceT> {
    knexOptions: Knex.Config;
    protected knex: Knex;
    constructor(knexOptions?: Knex.Config);
    get(op: Operation): Promise<ResourceT[]>;
    remove(op: Operation): Promise<void>;
    update(op: Operation): Promise<ResourceT>;
    add(op: Operation): Promise<ResourceT>;
    convertToResources(type: string, records: KnexRecord[]): ResourceT[];
    typeToTableName(type: string): string;
    filtersToKnex(queryBuilder: any, filters: {}): void;
    optionsBuilder(queryBuilder: any, op: any): void;
}
