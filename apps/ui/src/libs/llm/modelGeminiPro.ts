import { EVENT_COPILOT_DEBUG } from "../../const";
import { eventBus } from "../EventBus";
import { createModel } from "./google";


const model = createModel("gemini-pro", (msg) =>
  eventBus.publish(EVENT_COPILOT_DEBUG, msg)
);

export const MODEL_GEMINI_PRO = {
  key: "gemini-pro",
  name: "Gemini Pro (Google)",
  description: "Gemini Pro API from Google",
  initModel: model.initModel,
  queryModel: model.queryModel,
};
