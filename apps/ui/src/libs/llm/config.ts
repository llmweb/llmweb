import { EVENT_COPILOT_DEBUG } from "../../const";
import { eventBus } from "../EventBus";
import { getModels } from ".";
import { getModel } from "./models";

const { COPILOT_OPENAI_API_URL, COPILOT_OPENAI_API_KEY } = import.meta.env;

const _ctx = {
  apiUrl: COPILOT_OPENAI_API_URL,
  apiKey: localStorage.getItem('apiKey') || COPILOT_OPENAI_API_KEY,
  llmMode: localStorage.getItem('model') || '',
}

export const getApiKey = () => _ctx.apiKey;

export const setApiKey = (apiKey) => _ctx.apiKey = apiKey;

export const getLangModel = () => _ctx.llmMode || getModels()[0].key;

export const setLangModel = (mode) => {
  _ctx.llmMode = mode;
  getModel(mode).initModel((msg) => eventBus.publish(EVENT_COPILOT_DEBUG, msg));
}
