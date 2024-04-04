
import { getApiKey } from "../config";

const { COPILOT_OPENAI_API_URL } = import.meta.env;

export const createModel = (modelId: string, progressCallback) => {
  const initModel = async (
    progressCallback: (message: string, step?: number) => void
  ) => {
    progressCallback(`${modelId} initialized`);
  };

  const queryModel = async (query: string): Promise<string> => {
    const apiKey = getApiKey();
    if (!apiKey) {
      return "API Key is not defined";
    }

    return fetch(`${COPILOT_OPENAI_API_URL}/v1/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getApiKey()}`,
      },
      body: JSON.stringify({
        model: "gpt-4",
        // max_tokens: 64,
        ...JSON.parse(query), 
      }),
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Error: ${res.status} ${res.statusText}`);
        } else {
          return res.json();
        }
      })
      .then((data) => {
        const suggestion = data.choices[0].message.content;
        return suggestion;
      })
      .catch((err) => {
        return `Error: ${err}`;
      });
  }

  return {
    initModel,
    queryModel,
  }
}