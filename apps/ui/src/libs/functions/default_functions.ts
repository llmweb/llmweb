import { queryLLM } from "../llm/webllm";
import { registerModule } from "./functions";
import { queryVectorStore } from "../vectordb";
import { evalStringTemplate } from "../utils";
import { getPromptAsStringTemplate } from "../prompts";

/////////
const retrieveContents = async ({ query, category, count, toJSON }) => {
  const resp = await queryVectorStore(query, {
    category,
    count,
  });

  const result = resp.map((r) => (toJSON ? JSON.parse(r.text) : r.text));
  return result;
};

const queryByPromptTemplate = async ({ source: { module, name }, inputs }) => {
  const promptTemplate = getPromptAsStringTemplate(module, name);
  const { toJSON, ...promptInputs } = inputs;
  const query = evalStringTemplate(
    promptTemplate,
    promptInputs,
    true
  ) as string;
  if (query) {
    return queryLLM({
      query,
      toJSON,
    });
  }
};

registerModule("default_functions", {
  // Register module
  registerModule,

  // Query LLM
  queryLLM,

  // Query Vector Store
  queryVectorStore,

  // Default handler for retrieval, return texts or JSONs
  retrieveContents,

  // Default handler for prompt, query LLM based on prompt template
  queryByPromptTemplate,

  // Return directly since merge happens in input processing
  merge_outputs: (data) => data,
});
