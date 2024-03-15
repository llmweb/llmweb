import * as webllm from "@mlc-ai/web-llm";
import appConfig from "./app_config";


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

export const createModel = (model: string, progressCallback) => {
  const _ctx = {
    clientModelInitPromise: null,
  };

  const initModel = async (
    progressCallback: (message: string, step?: number) => void
  ) => {
    if (!_ctx.clientModelInitPromise) {
      // TODO: needs error handling
      _ctx.clientModelInitPromise = createChat({
        model,
        progressCallback,
      });
    }
  };

  const queryModel = async (query: string): Promise<string> => {
    if (!_ctx.clientModelInitPromise) {
      await initModel(progressCallback);
    }

    const clientChatObj = await _ctx.clientModelInitPromise;

    const resp = await clientChatObj.generate(query);

    return resp.trim();
  };

  return {
    initModel,
    queryModel,
  };
};