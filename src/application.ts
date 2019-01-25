import OperationProcessor from "./operation-processor";
import Resource from "./resource";
import { Operation, OperationResponse, ResourceConstructor } from "./types";

export default class Application {
  public types: ResourceConstructor[];
  public processors: OperationProcessor[];
  public defaultProcessor: OperationProcessor;
  public user: Resource;

  constructor(settings: {
    types?: ResourceConstructor[];
    processors?: OperationProcessor[];
    defaultProcessor?: OperationProcessor;
  }) {
    this.types = settings.types || [];
    this.processors = settings.processors || [];
    this.defaultProcessor =
      settings.defaultProcessor || new OperationProcessor();

    this.defaultProcessor.app = this;
    this.processors.forEach(processor => (processor.app = this));
  }

  async executeOperations(ops: Operation[]): Promise<OperationResponse[]> {
    return await this.createTransaction(
      ops.map(async op => {
        const processor = this.processorFor(op);
        const result = await processor.execute(op);
        return this.buildOperationResponse(result);
      })
    );
  }

  private async createTransaction(ops: Promise<OperationResponse>[]) {
    return await Promise.all(ops);
  }

  private processorFor(op: Operation): OperationProcessor {
    return (
      this.processors.find(processor => processor.shouldHandle(op)) ||
      this.defaultProcessor
    );
  }

  private buildOperationResponse(
    data: Resource | Resource[] | void
  ): OperationResponse {
    return {
      data: data || null
    };
  }
}
