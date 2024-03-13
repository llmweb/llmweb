// TODO: LLM for global provider, needs to be refactor
import { wait } from "../utils";
import { MODE_OPENAI, MODE_SERVER, MODE_WEBLLM } from "../../const";
import { initLLM as initWebLLM, queryOne as queryWebLLM } from "./webllm";
import { queryOne as queryOpenAI } from "./openai";
import { queryOne as queryServer } from "./server";


interface QueryContext {
  mode: string;
  category: string;
}


export const initLLM = async (mode, progressCallback) => {
  if (mode === MODE_WEBLLM) {
    return initWebLLM(progressCallback);
  }
};

export const queryOne = async (query: string, {mode, category}: QueryContext): Promise<string> => {
  if (mode === MODE_WEBLLM) {
    return queryWebLLM(category, query);
  } else if (mode === MODE_OPENAI) {
    return queryOpenAI(category, query);
  } else if (mode === MODE_SERVER) {
    return queryServer(category, query);
  } else {
    // default mode === MODE_MOCK
    return wait(1000).then(() => {
      return  Promise.resolve(`{ "modelTypes": ["this is a mock response"], "prop": {}, "iconName": "dummy" }`);
    });
  }
};