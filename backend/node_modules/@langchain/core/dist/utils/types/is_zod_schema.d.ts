import { z } from "zod";
/**
 * Given either a Zod schema, or plain object, determine if the input is a Zod schema.
 *
 * @param {z.ZodType<RunOutput> | Record<string, unknown>} input
 * @returns {boolean} Whether or not the provided input is a Zod schema.
 */
export declare function isZodSchema<RunOutput extends Record<string, unknown> = Record<string, unknown>>(input: z.ZodType<RunOutput> | Record<string, unknown>): input is z.ZodType<RunOutput>;
