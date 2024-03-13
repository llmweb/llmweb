import {
    CATEGORY_CHAT,
    CATEGORY_JS_COMPLETION,
    CATEGORY_JS_COMPLETION_INLINE,
  } from "../../../const";


// Mistral
const PROMPTS_MISTRAL = {
  /// what is 'Detroit'?
  [CATEGORY_CHAT]: `
    <s>[INST]You are a helpful assistant that can answer any question in one sentence.[/INST]<s>
    `,
  [CATEGORY_JS_COMPLETION]: `
    <s>[INST]You are a helpful code assistant. Your task is to complete the javascript code for the ask in js file. You should only return the code. No steps or explanations.[/INST]</s>
    `.trim(),
  [CATEGORY_JS_COMPLETION_INLINE]: `
    <s>[INST]You are a helpful code assistant. Your task is to complete the javascript code from input. You should only return the new completion part. No explanation needed.[/INST]</s>
    `.trim(),
};

export const createPrompt = (category: string, query: string) => {
  return `${PROMPTS_MISTRAL[category]}[INST]${query}[/INST]`;
};