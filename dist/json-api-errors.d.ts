import { JsonApiError } from "./types";
declare const jsonApiErrors: {
    [key: string]: (args?: {
        [key: string]: string | number | boolean;
    }) => JsonApiError;
};
export default jsonApiErrors;
