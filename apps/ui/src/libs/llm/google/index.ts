import { getApiKey } from "../config";

const { COPILOT_GOOGLE_API_URL } = import.meta.env;

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

    return fetch(`${COPILOT_GOOGLE_API_URL}/v1beta/models/gemini-pro:generateContent?key=${apiKey}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Authorization: `Bearer ${getApiKey()}`,
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{
                text: query,
            }]
          }
        ]
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
        const suggestion = data.candidates[0].content.parts[0].text;
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