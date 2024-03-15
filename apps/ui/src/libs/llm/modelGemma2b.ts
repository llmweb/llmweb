import { EVENT_COPILOT_DEBUG } from "../../const";
import { eventBus } from "../EventBus";
import { createModel } from "./webllm";

// web-llm prompting
// https://www.promptingguide.ai/models/gemma
const model = createModel("gemma-2b-it-q4f16_1", (msg) =>
  eventBus.publish(EVENT_COPILOT_DEBUG, msg)
);

export const MODEL_GEMMA_2B = {
  key: "gemma-2b",
  name: "Gemma 2B (WebLLM)",
  description: "Google Gemma 2B based on WebLLM",
  initModel: model.initModel,
  queryModel: async (query) => {
    const prompt = `
<start_of_turn>user
${query}
<end_of_turn>
<start_of_turn>model
        `.trim();

    return await model.queryModel(prompt);
  },
};
