/**
 * This decorator is responsible of checking if there's a user in the API's
 * context object. If there is, it'll allow the operation to continue.
 * If not, it'll throw an `Unauthorized` error code.
 */
export default function authorize(): (target: Function | import("..").OperationProcessor<any>, propertyKey?: string, descriptor?: TypedPropertyDescriptor<any>) => any;
