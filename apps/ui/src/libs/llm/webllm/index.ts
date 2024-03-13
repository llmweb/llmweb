import * as webllm from "@mlc-ai/web-llm";
import appConfig from "./app_config";
import { createPrompt } from "./prompt_gemma_2b";
import { LLM_MODEL } from "./const";
import {
  CATEGORY_JS_COMPLETION_INLINE,
  EVENT_COPILOT_DEBUG,
} from "../../../const";
import { Data } from "../../types";
import { eventBus } from "../../EventBus";

// web-llm prompting
// https://www.promptingguide.ai/models/gemma

const _ctx = {
  clientChatInitPromise: null,
};

const createChat = async (
  { model, progressCallback } = {} as {
    model: string;
    progressCallback?: (msg: string, step?: number) => void;
  }
) => {
  // Use a chat worker client instead of ChatModule here
  const chat = new webllm.ChatWorkerClient(
    new Worker(new URL("./worker.ts", import.meta.url), { type: "module" })
  );

  chat.setInitProgressCallback((report: webllm.InitProgressReport) => {
    // setLabel("init-label", report.text);
    // console.log(report.text);
    progressCallback?.(report.text);
  });

  await chat.reload(model, undefined, appConfig);

  return {
    generate: async (prompt: string) => {
      // NOTE: seems like the conversation will impact next question in small model like gemma
      // disable it for now.
      chat.resetChat();
      const resp = await chat.generate(
        prompt,
        (_step: number, message: string) => {
          // setLabel("generate-label", message);
          progressCallback?.(message, _step);
        }
      );

      progressCallback?.(await chat.runtimeStatsText());

      return resp;
    },
  };
};

export const initLLM = async (progressCallback) => {
  if (!_ctx.clientChatInitPromise) {
    _ctx.clientChatInitPromise = createChat({
      model: LLM_MODEL,
      progressCallback,
    });
  }
};

// old interface for old copilot
export const queryOne = async (category: string, query: string) => {
  if (!_ctx.clientChatInitPromise) {
    await initLLM(console.log);
  }

  const clientChatObj = await _ctx.clientChatInitPromise;
  // hard code here for now
  return clientChatObj.generate(createPrompt(category, query)).then((resp) => {
    return resp.trim();
  });
};

// DAG interface
interface LLMParamsBase {
  query: string;
}

interface LLMParamsWithJSON extends LLMParamsBase {
  toJSON: true;
}

interface LLMParamsWithoutJSON extends LLMParamsBase {
  toJSON?: false;
}

export async function queryLLM(inputs: LLMParamsWithJSON): Promise<Data>;
export async function queryLLM(
  inputs: LLMParamsWithoutJSON
): Promise<{ message: string }>;

export async function queryLLM({
  query,
  toJSON,
}: LLMParamsBase & { toJSON?: boolean }): Promise<{ message: string } | Data> {
  if (!_ctx.clientChatInitPromise) {
    await initLLM((msg) => eventBus.publish(EVENT_COPILOT_DEBUG, msg));
  }
  const clientChatObj = await _ctx.clientChatInitPromise;

  // TODO: gemma specific, need to refactor later
  const prompt = `
<start_of_turn>user
${query}
<end_of_turn>
<start_of_turn>model
  `.trim();

  // hard code here for now
  return clientChatObj.generate(prompt).then((resp) => {
    resp = resp.trim();
    if (toJSON) {
      // remove the first and last line if it's a code block
      if (resp.startsWith("```")) {
        resp = resp.split("\n").slice(1, -1).join("\n");
      }
      return JSON.parse(resp);
    }

    return { message: resp };
  });
}
