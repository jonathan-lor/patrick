import { ChatOpenAI } from "@langchain/openai";
import { g as getEnvironmentVariable } from "./index-BK9HCYb0.js";
class ChatTogetherAI extends ChatOpenAI {
  static lc_name() {
    return "ChatTogetherAI";
  }
  _llmType() {
    return "togetherAI";
  }
  get lc_secrets() {
    return {
      togetherAIApiKey: "TOGETHER_AI_API_KEY",
      apiKey: "TOGETHER_AI_API_KEY"
    };
  }
  constructor(fields) {
    const togetherAIApiKey = (fields == null ? void 0 : fields.apiKey) || (fields == null ? void 0 : fields.togetherAIApiKey) || getEnvironmentVariable("TOGETHER_AI_API_KEY");
    if (!togetherAIApiKey) {
      throw new Error(`TogetherAI API key not found. Please set the TOGETHER_AI_API_KEY environment variable or provide the key into "togetherAIApiKey"`);
    }
    super({
      ...fields,
      model: (fields == null ? void 0 : fields.model) || "mistralai/Mixtral-8x7B-Instruct-v0.1",
      apiKey: togetherAIApiKey,
      configuration: {
        baseURL: "https://api.together.xyz/v1/"
      }
    });
    Object.defineProperty(this, "lc_serializable", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: true
    });
  }
  getLsParams(options) {
    const params = super.getLsParams(options);
    params.ls_provider = "together";
    return params;
  }
  toJSON() {
    const result = super.toJSON();
    if ("kwargs" in result && typeof result.kwargs === "object" && result.kwargs != null) {
      delete result.kwargs.openai_api_key;
      delete result.kwargs.configuration;
    }
    return result;
  }
  /**
   * Calls the TogetherAI API with retry logic in case of failures.
   * @param request The request to send to the TogetherAI API.
   * @param options Optional configuration for the API call.
   * @returns The response from the TogetherAI API.
   */
  async completionWithRetry(request, options) {
    delete request.frequency_penalty;
    delete request.presence_penalty;
    delete request.logit_bias;
    delete request.functions;
    if (request.stream === true) {
      return super.completionWithRetry(request, options);
    }
    return super.completionWithRetry(request, options);
  }
}
export {
  ChatTogetherAI
};
//# sourceMappingURL=togetherai-ATqQdnmP.js.map
