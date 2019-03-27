"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Knex = require("knex");
const string_1 = require("../utils/string");
const operation_processor_1 = require("./operation-processor");
const operators = {
    eq: "=",
    ne: "!=",
    lt: "<",
    gt: ">",
    le: "<=",
    ge: ">=",
    like: "like",
    in: "in",
    nin: "not in"
};
const getOperator = (paramValue) => operators[Object.keys(operators).find(operator => paramValue.indexOf(`${operator}:`) === 0)];
const buildSortClause = sort => sort.split(",").map(criteria => {
    if (criteria.startsWith("-")) {
        return { field: string_1.camelize(criteria.substr(1)), direction: "DESC" };
    }
    return { field: string_1.camelize(criteria), direction: "ASC" };
});
const getAttributes = (attributes, fields, type) => {
    if (Object.entries(fields).length === 0 && fields.constructor === Object) {
        return attributes;
    }
    return attributes.filter(attribute => fields[string_1.pluralize(type)].includes(attribute));
};
class KnexProcessor extends operation_processor_1.default {
    constructor(knexOptions = {}) {
        super();
        this.knexOptions = knexOptions;
        this.knex = Knex(knexOptions);
    }
    async get(op) {
        const { params, ref } = op;
        const { id, type } = ref;
        const tableName = this.typeToTableName(type);
        const filters = params ? Object.assign({ id }, (params.filter || {})) : { id };
        const resource = Object.create(this.resourceFor(type));
        const fields = params ? Object.assign({}, params.fields) : {};
        const attributes = getAttributes(Object.keys(resource.__proto__.attributes), fields, type);
        const records = await this.knex(tableName)
            .where(queryBuilder => this.filtersToKnex(queryBuilder, filters))
            .select(...attributes, "id")
            .modify(queryBuilder => this.optionsBuilder(queryBuilder, op));
        return this.convertToResources(type, records);
    }
    async remove(op) {
        const tableName = this.typeToTableName(op.ref.type);
        return await this.knex(tableName)
            .where({ id: op.ref.id })
            .del()
            .then(() => undefined);
    }
    async update(op) {
        const { id, type } = op.ref;
        const tableName = this.typeToTableName(type);
        await this.knex(tableName)
            .where({ id })
            .update(op.data.attributes);
        const records = await this.knex(tableName)
            .where({ id })
            .select();
        return this.convertToResources(type, records)[0];
    }
    async add(op) {
        const { type } = op.ref;
        const tableName = this.typeToTableName(type);
        const [id] = await this.knex(tableName).insert(Object.assign({}, (op.data.id ? { id: op.data.id } : {}), op.data.attributes), "id");
        const records = await this.knex(tableName)
            .where({ id })
            .select();
        return this.convertToResources(type, records)[0];
    }
    convertToResources(type, records) {
        return records.map(record => {
            const id = record.id;
            delete record.id;
            const attributes = record;
            const resourceClass = this.resourceFor(type);
            return new resourceClass({ id, attributes });
        });
    }
    typeToTableName(type) {
        return string_1.pluralize(type);
    }
    filtersToKnex(queryBuilder, filters) {
        const processedFilters = [];
        Object.keys(filters).forEach(key => filters[key] === undefined && delete filters[key]);
        Object.keys(filters).forEach(key => {
            let value = filters[key];
            const operator = getOperator(filters[key]) || "=";
            if (value.substring(value.indexOf(":") + 1)) {
                value = value.substring(value.indexOf(":") + 1);
            }
            value = value !== "null" ? value : 0;
            processedFilters.push({
                value,
                operator,
                column: string_1.camelize(key)
            });
        });
        return processedFilters.forEach(filter => {
            return queryBuilder.andWhere(filter.column, filter.operator, filter.value);
        });
    }
    optionsBuilder(queryBuilder, op) {
        const { sort, page } = op.params;
        if (sort) {
            buildSortClause(sort).forEach(({ field, direction }) => {
                queryBuilder.orderBy(field, direction);
            });
        }
        if (page) {
            queryBuilder.offset(page.offset).limit(page.limit);
        }
    }
}
exports.default = KnexProcessor;
//# sourceMappingURL=knex-processor.js.map