import type { z } from "zod";
import { type FunctionDeclarationSchema as GenerativeAIFunctionDeclarationSchema, type SchemaType as FunctionDeclarationSchemaType } from "@google/generative-ai";
import { type JsonSchema7Type } from "zod-to-json-schema";
export interface GenerativeAIJsonSchema extends Record<string, unknown> {
    properties?: Record<string, GenerativeAIJsonSchema>;
    type: FunctionDeclarationSchemaType;
}
export interface GenerativeAIJsonSchemaDirty extends GenerativeAIJsonSchema {
    properties?: Record<string, GenerativeAIJsonSchemaDirty>;
    additionalProperties?: boolean;
}
export declare function removeAdditionalProperties(obj: Record<string, any>): GenerativeAIJsonSchema;
export declare function schemaToGenerativeAIParameters<RunOutput extends Record<string, any> = Record<string, any>>(schema: z.ZodType<RunOutput> | z.ZodEffects<z.ZodType<RunOutput>> | JsonSchema7Type): GenerativeAIFunctionDeclarationSchema;
export declare function jsonSchemaToGeminiParameters(schema: Record<string, any>): GenerativeAIFunctionDeclarationSchema;
