
const { COPILOT_OPENAI_API_URL, COPILOT_OPENAI_API_KEY } = import.meta.env;


const _ctx = {
  apiUrl: COPILOT_OPENAI_API_URL,
  apiKey: COPILOT_OPENAI_API_KEY,
}

export const getApiKey = () => _ctx.apiKey;
export const setApiKey = (apiKey) => _ctx.apiKey = apiKey;