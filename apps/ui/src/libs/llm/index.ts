import { Data } from "../types";

import { MODEL_GEMINI_PRO } from "./modelGeminiPro";
import { MODEL_GEMMA_2B } from "./modelGemma2b";
import { MODEL_GPT4 } from "./modelGpt4";
import { getModel, registerModel } from "./models";

interface LLMParamsBase {
  query: string;
  model: string;
}

interface LLMParamsJSON extends LLMParamsBase {
  toJSON: true;
}

interface LLMParamsTEXT extends LLMParamsBase {
  toJSON?: false;
}

export async function queryModel(inputs: LLMParamsJSON): Promise<Data>;
export async function queryModel(
  inputs: LLMParamsTEXT
): Promise<{ message: string }>;

export async function queryModel({
  query,
  model,
  toJSON,
}: LLMParamsBase & { toJSON?: boolean }): Promise<Data | { message: string }> {
  const langModel = getModel(model);
  let resp = await langModel.queryModel(query);

  // post processing
  if (toJSON) {
    // remove the first and last line if it's a code block
    if (resp.startsWith("```")) {
      resp = resp.split("\n").slice(1, -1).join("\n");
    }
    return JSON.parse(resp);
  }

  return { message: resp };
}

registerModel(MODEL_GEMMA_2B);
registerModel(MODEL_GEMINI_PRO);
registerModel(MODEL_GPT4);

export { getModels } from "./models";
export { getApiKey, setApiKey, getLangModel, setLangModel } from "./config";
