/* eslint-disable @typescript-eslint/no-unused-vars */
import { isZodSchema } from "@langchain/core/utils/types";
import { zodToJsonSchema } from "zod-to-json-schema";
export function removeAdditionalProperties(
// eslint-disable-next-line @typescript-eslint/no-explicit-any
obj) {
    if (typeof obj === "object" && obj !== null) {
        const newObj = { ...obj };
        if ("additionalProperties" in newObj) {
            delete newObj.additionalProperties;
        }
        if ("$schema" in newObj) {
            delete newObj.$schema;
        }
        if ("strict" in newObj) {
            delete newObj.strict;
        }
        for (const key in newObj) {
            if (key in newObj) {
                if (Array.isArray(newObj[key])) {
                    newObj[key] = newObj[key].map(removeAdditionalProperties);
                }
                else if (typeof newObj[key] === "object" && newObj[key] !== null) {
                    newObj[key] = removeAdditionalProperties(newObj[key]);
                }
            }
        }
        return newObj;
    }
    return obj;
}
export function schemaToGenerativeAIParameters(schema) {
    // GenerativeAI doesn't accept either the $schema or additionalProperties
    // attributes, so we need to explicitly remove them.
    const jsonSchema = removeAdditionalProperties(isZodSchema(schema) ? zodToJsonSchema(schema) : schema);
    const { $schema, ...rest } = jsonSchema;
    return rest;
}
export function jsonSchemaToGeminiParameters(
// eslint-disable-next-line @typescript-eslint/no-explicit-any
schema) {
    // Gemini doesn't accept either the $schema or additionalProperties
    // attributes, so we need to explicitly remove them.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const jsonSchema = removeAdditionalProperties(schema);
    const { $schema, ...rest } = jsonSchema;
    return rest;
}
