import { EVENT_COPILOT_DEBUG } from "../../const";
import { eventBus } from "../EventBus";
import { createModel } from "./openai";


const model = createModel("gpt-4", (msg) =>
  eventBus.publish(EVENT_COPILOT_DEBUG, msg)
);

export const MODEL_GPT4 = {
  key: "gpt-4",
  name: "GPT-4 (OpenAI)",
  description: "GPT-4 API from OpenAI",
  initModel: model.initModel,
  queryModel: async (query: string) => {
    // preprocess prompt to gpt4 json
    const parts = query.split("USER:");
    const systemContent = parts[0].replace("SYSTEM:", "").trim();
    const userContent = parts[1].trim();

    const content = {
      messages: [
        {
          role: "system",
          content: systemContent,
        },
        {
          role: "user",
          content: userContent,
        },
      ],
    };

    return await model.queryModel(JSON.stringify(content));
  },
};
