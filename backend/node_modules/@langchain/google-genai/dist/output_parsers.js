import { BaseLLMOutputParser, OutputParserException, } from "@langchain/core/output_parsers";
export class GoogleGenerativeAIToolsOutputParser extends BaseLLMOutputParser {
    static lc_name() {
        return "GoogleGenerativeAIToolsOutputParser";
    }
    constructor(params) {
        super(params);
        Object.defineProperty(this, "lc_namespace", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: ["langchain", "google_genai", "output_parsers"]
        });
        Object.defineProperty(this, "returnId", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
        /** The type of tool calls to return. */
        Object.defineProperty(this, "keyName", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        /** Whether to return only the first tool call. */
        Object.defineProperty(this, "returnSingle", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
        Object.defineProperty(this, "zodSchema", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.keyName = params.keyName;
        this.returnSingle = params.returnSingle ?? this.returnSingle;
        this.zodSchema = params.zodSchema;
    }
    async _validateResult(result) {
        if (this.zodSchema === undefined) {
            return result;
        }
        const zodParsedResult = await this.zodSchema.safeParseAsync(result);
        if (zodParsedResult.success) {
            return zodParsedResult.data;
        }
        else {
            throw new OutputParserException(`Failed to parse. Text: "${JSON.stringify(result, null, 2)}". Error: ${JSON.stringify(zodParsedResult.error.errors)}`, JSON.stringify(result, null, 2));
        }
    }
    async parseResult(generations) {
        const tools = generations.flatMap((generation) => {
            const { message } = generation;
            if (!("tool_calls" in message) || !Array.isArray(message.tool_calls)) {
                return [];
            }
            return message.tool_calls;
        });
        if (tools[0] === undefined) {
            throw new Error("No parseable tool calls provided to GoogleGenerativeAIToolsOutputParser.");
        }
        const [tool] = tools;
        const validatedResult = await this._validateResult(tool.args);
        return validatedResult;
    }
}
