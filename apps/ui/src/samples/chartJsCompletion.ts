export const CHART_JS_COMPLETION = {
    name: 'code_completion',
    description: 'Complete Javascript like Github Copilot.',
    flows: `
js_completion:
  description: Complete Code
  type: llm
  context:
    entry: js_completion
    module: custom_prompts
  inputs:
    message: "{{inputs.message}}"
    `.trim(),
    prompts: `
js_completion: |
  SYSTEM:
  You are a helpful code assistant. Your task is to complete the javascript code from input. You should return the code block only with no explanation. 

  USER:
  {{message}}
    `.trim(),
    datasets: `
    `.trim(),
    functions: `
    `.trim(),
}