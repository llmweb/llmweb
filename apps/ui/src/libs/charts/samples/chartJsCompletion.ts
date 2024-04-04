export const CHART_JS_COMPLETION = {
  uri: "code_completion",
  name: "Code Completion",
  version: 1,
  flows: `
- step: js_completion
  name: Code Completion
  type: llm
  source: js_completion
  inputs:
    message: "{{inputs.message}}"
    `.trim(),
  prompts: `
js_completion: |-
  SYSTEM:
  You are a helpful code assistant. Your task is to complete the javascript code from input. You should return the code block only with no explanation. 

  USER:
  {{message}}
    `.trim(),
  datasets: `
    `.trim(),
  functions: `
    `.trim(),
};
