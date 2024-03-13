import {
    CATEGORY_CHAT,
    CATEGORY_JS_COMPLETION,
    CATEGORY_JS_COMPLETION_INLINE,
  } from "../../../const";

// Gemma
const PROMPTS = {
  [CATEGORY_CHAT]: `
<start_of_turn>user
You are a helpful assistant that can answer any question in one sentence.
  `,
  [CATEGORY_JS_COMPLETION]: `
<start_of_turn>user
You are a helpful code assistant. Your task is to complete the javascript code from input. You should only return the new completion part. No explanation needed.
  `,
  [CATEGORY_JS_COMPLETION_INLINE]: `
<start_of_turn>user
You are a helpful code assistant. Your task is to complete the javascript code from input. You should return the code block only. 

# Input
  `.trim(),
}

export const createPrompt = (category: string, query: string) => {
  return `${PROMPTS[category]}\n\`\`\`javascript\n${query}\n\`\`\`<end_of_turn><start_of_turn>model`;
};