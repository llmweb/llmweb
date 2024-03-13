import {
  CATEGORY_JS_COMPLETION,
  CATEGORY_JS_COMPLETION_INLINE,
} from "../../../const";
import { getApiKey } from "./config";

const { COPILOT_OPENAI_API_URL } = import.meta.env;

export const queryOne = async (category: string, query: string) => {
  const apiKey = getApiKey();

  if (!apiKey) {
    return Promise.resolve("COPILOT_OPENAI_API_KEY is not defined");
  }

  if (
    category === CATEGORY_JS_COMPLETION ||
    category === CATEGORY_JS_COMPLETION_INLINE
  ) {
    return fetch(`${COPILOT_OPENAI_API_URL}/v1/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content:
              "You are a JavaScript developer. you will complete the partial code with complete statement. The response should be code only without explanation.",
          },
          {
            role: "user",
            content: query,
          },
        ],
        max_tokens: 64,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        const suggestion = data.choices[0].message.content;
        return suggestion;
      });
  } else {
    return Promise.resolve("not supported in open AI mode");
  }
};

export { setApiKey } from "./config";
