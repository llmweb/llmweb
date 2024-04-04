import { registerModule } from "./functions";
import { queryVectorStore, getCurrentDataset } from "../datasets";
import { evalStringTemplate } from "../utils";
import { getPromptAsStringTemplate } from "../prompts";
import { queryModel } from "../llm";
import { getLangModel } from "../llm";
import { evalExpression } from "../utils";

/////////
const retrieveDataset = async (inputs, { toJSON }) => {
  if (inputs.hasOwnProperty("query")) {
    const { query, category, count } = inputs;
    const resp = await queryVectorStore(query, {
      category,
      count,
    });

    const result = resp.map((r) => (toJSON ? JSON.parse(r.text) : r.text));
    return result;
  } else {
    const { category, count } = inputs;
    let resp = getCurrentDataset(category);
    if( count > 0 ) {
      resp = resp.slice(0, count);
    }
    const result = resp.map((r) => (toJSON ? JSON.parse(r) : r));
    return result;
  }
};

const queryByPromptTemplate = async (promptInputs, { source, toJSON }) => {
  const promptTemplate = getPromptAsStringTemplate(source);
  const query = evalStringTemplate(
    promptTemplate,
    promptInputs,
    true
  ) as string;
  if (query) {
    return queryModel({
      query,
      model: getLangModel(),
      toJSON,
    });
  }
};

registerModule("default_functions", {
  // Register module
  registerModule,

  // Query LLM
  queryLLM: queryModel,

  // Query Vector Store
  queryVectorStore,

  // Default handler for retrieval, return texts or JSONs
  retrieveDataset,

  // Default handler for prompt, query LLM based on prompt template
  queryByPromptTemplate,

  // Return directly since merge happens in input processing
  merge_outputs: (data) => data,

  // evalExpression
  evalExpression,
});
