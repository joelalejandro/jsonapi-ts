import { ResourceTypeAttributes, ResourceTypeRelationships } from "./types";
export default abstract class Resource {
    type: string;
    id?: string;
    attributes: ResourceTypeAttributes;
    relationships: ResourceTypeRelationships;
    constructor({ id, attributes, relationships }: {
        id?: string;
        attributes?: ResourceTypeAttributes;
        relationships?: ResourceTypeRelationships;
    });
}
