var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
var _a, e_1, _b, _c;
import "dotenv/config";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
const llm = new ChatGoogleGenerativeAI({
    model: "gemini-2.0-flash",
    temperature: 0.5,
    maxOutputTokens: 2048,
    streaming: true,
});
const query = "Are you a multi-modal model?, what inputs do you take?, can you take a pdf file as input?";
// Using streaming
const stream = await llm.stream(query);
console.log(); // Add a newline for better formatting
try {
    for (var _d = true, stream_1 = __asyncValues(stream), stream_1_1; stream_1_1 = await stream_1.next(), _a = stream_1_1.done, !_a; _d = true) {
        _c = stream_1_1.value;
        _d = false;
        const chunk = _c;
        // Print each chunk of the response as it arrives
        process.stdout.write(chunk.content instanceof Array ? chunk.content.join("") : chunk.content);
    }
}
catch (e_1_1) { e_1 = { error: e_1_1 }; }
finally {
    try {
        if (!_d && !_a && (_b = stream_1.return)) await _b.call(stream_1);
    }
    finally { if (e_1) throw e_1.error; }
}
