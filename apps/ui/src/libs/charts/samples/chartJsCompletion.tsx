import CodeIcon from '@mui/icons-material/Code';

export const CHART_JS_COMPLETION = {
  uri: "code_completion",
  name: "Code Completion",
  description: "Completes the code from where you are stuck.",
  icon: <CodeIcon/>,
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
};
