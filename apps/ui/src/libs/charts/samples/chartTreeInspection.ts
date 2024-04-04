export const CHART_TREE_INSPECTION = {
  uri: "tree_inspection",
  name: "Tree Inspection",
  flows: `
# NOTE: Better LLM than 2B might be needed for this example
- step: get_file_tree_samples
  name: Get File Tree Samples
  type: retrieval
  toJSON: true
  inputs:
    category: files
    count: 5

- step: get_file_tree
  name: Get File Tree
  type: retrieval
  toJSON: true
  inputs:
    category: files

- step: get_process_function
  name: Analyze User Requirement
  type: llm
  source: get_process_function
  # toJSON: true
  inputs:
    samples: "{{JSON.stringify(get_file_tree_samples.outputs)}}"
    message: "{{inputs.message}}"

- step: apply_function_to_dataset 
  name: Apply Function to Dataset
  type: function
  source: apply_function_to_dataset
  inputs:
    dataset: "{{get_file_tree.outputs}}"
    functionInMarkdown: "{{get_process_function.outputs.message}}"
    `.trim(),
  prompts: `
get_process_function: |-
  SYSTEM:
  You are a helpful assistant to return JS function, based on the sample structure below which presents an assembly tree or table in JSON format:
  \`\`\`json
  {{samples}}
  \`\`\`

  The return value should be as javascript function below ONLY, which could be apply to a bigger data structure, without any explanation. Below is one example of response:
  \`\`\`javascript
  function functionName(json) {
    // logics on the json
    // ...

    // answer
    return \`
  <human language that answers the question by using result above>
    \`.trim();
  }
  \`\`\`

  USER:
  {{message}}
    `.trim(),
  datasets: `
# Supports Record<string, string[]>, each string value will be put to the vector store as one record
files: [
  '{"name": "MainProject", "owner": "Maria Garcia", "level": 1, "type": "folder", "size": 0}',
  '{"name": "MainProject_Doc1.pdf", "owner": "Maria Garcia", "level": 2, "type": "file", "size": 220}',
  '{"name": "MainProject_Doc2.pdf", "owner": "Maria Garcia", "level": 2, "type": "file", "size": 940}',
  '{"name": "MainProject_Doc3.pdf", "owner": "Maria Garcia", "level": 2, "type": "file", "size": 810}',
  '{"name": "MainProject_Doc4.pdf", "owner": "Maria Garcia", "level": 2, "type": "file", "size": 430}',
  '{"name": "MainProject_Doc5.pdf", "owner": "Maria Garcia", "level": 2, "type": "file", "size": 500}',
  '{"name": "Analytics1", "owner": "Emma Wilson", "level": 1, "type": "folder", "size": 0}',
  '{"name": "Analytics1_Doc1.pdf", "owner": "Emma Wilson", "level": 2, "type": "file", "size": 190}',
  '{"name": "Analytics1_Doc2.pdf", "owner": "Emma Wilson", "level": 2, "type": "file", "size": 900}',
  '{"name": "Analytics1_Doc3.pdf", "owner": "Emma Wilson", "level": 2, "type": "file", "size": 710}',
  '{"name": "Analytics1_Doc4.pdf", "owner": "Emma Wilson", "level": 2, "type": "file", "size": 260}',
  '{"name": "Analytics1_Doc5.pdf", "owner": "Emma Wilson", "level": 2, "type": "file", "size": 250}',
  '{"name": "Analytics1_Research1", "owner": "James Lee", "level": 2, "type": "folder", "size": 0}',
  '{"name": "Analytics1_Research1_Doc1.pdf", "owner": "James Lee", "level": 3, "type": "file", "size": 120}',
  '{"name": "Analytics1_Research1_Doc2.pdf", "owner": "James Lee", "level": 3, "type": "file", "size": 340}',
  '{"name": "Analytics1_Research1_Doc3.pdf", "owner": "James Lee", "level": 3, "type": "file", "size": 530}',
  '{"name": "Analytics1_Research1_Doc4.pdf", "owner": "James Lee", "level": 3, "type": "file", "size": 160}',
  '{"name": "ProjectBase", "owner": "Maria Garcia", "level": 1, "type": "folder", "size": 0}',
  '{"name": "ProjectBase_Doc1.pdf", "owner": "Maria Garcia", "level": 2, "type": "file", "size": 290}',
  '{"name": "ProjectBase_Doc2.pdf", "owner": "Maria Garcia", "level": 2, "type": "file", "size": 990}',
  '{"name": "ProjectBase_Folder1", "owner": "Maria Garcia", "level": 2, "type": "folder", "size": 0}',
  '{"name": "ProjectBase_Folder1_Doc1.pdf", "owner": "Maria Garcia", "level": 3, "type": "file", "size": 400}',
  '{"name": "ProjectBase_Folder1_Doc2.pdf", "owner": "Maria Garcia", "level": 3, "type": "file", "size": 180}',
  '{"name": "ProjectBase_Folder1_Folder1", "owner": "James Lee", "level": 3, "type": "folder", "size": 0}',
  '{"name": "ProjectBase_Folder1_Folder1_Doc1.pdf", "owner": "James Lee", "level": 4, "type": "file", "size": 830}',
  '{"name": "ProjectBase_Folder1_Folder1_Doc2.pdf", "owner": "James Lee", "level": 4, "type": "file", "size": 230}',
  '{"name": "ProjectBase_Folder1_Folder1_Folder1", "owner": "Emma Wilson", "level": 4, "type": "folder", "size": 0}',
  '{"name": "ProjectBase_Folder1_Folder1_Folder1_Doc1.pdf", "owner": "Emma Wilson", "level": 5, "type": "file", "size": 570}',
  '{"name": "ProjectBase_Folder1_Folder1_Folder1_Doc2.pdf", "owner": "Emma Wilson", "level": 5, "type": "file", "size": 610}',
  '{"name": "ProjectBase_Folder1_Folder1_Folder2", "owner": "Emma Wilson", "level": 4, "type": "folder", "size": 0}',
  '{"name": "ProjectBase_Folder1_Folder1_Folder2_Doc1.pdf", "owner": "Emma Wilson", "level": 5, "type": "file", "size": 720}',
  '{"name": "ProjectBase_Folder1_Folder1_Folder2_Doc2.pdf", "owner": "Emma Wilson", "level": 5, "type": "file", "size": 190}',
  '{"name": "ProjectBase_Folder1_Folder2", "owner": "Alex Johnson", "level": 3, "type": "folder", "size": 0}',
  '{"name": "ProjectBase_Folder1_Folder2_Doc1.pdf", "owner": "Alex Johnson", "level": 4, "type": "file", "size": 160}',
  '{"name": "ProjectBase_Folder1_Folder2_Doc2.pdf", "owner": "Alex Johnson", "level": 4, "type": "file", "size": 870}',
  '{"name": "ProjectBase_Folder1_Folder2_Folder1", "owner": "Michael Brown", "level": 4, "type": "folder", "size": 0}',
  '{"name": "ProjectBase_Folder1_Folder2_Folder1_Doc1.pdf", "owner": "Michael Brown", "level": 5, "type": "file", "size": 290}',
  '{"name": "ProjectBase_Folder1_Folder2_Folder1_Doc2.pdf", "owner": "Michael Brown", "level": 5, "type": "file", "size": 780}',
  '{"name": "ProjectBase_Folder1_Folder2_Folder2", "owner": "Michael Brown", "level": 4, "type": "folder", "size": 0}',
  '{"name": "ProjectBase_Folder1_Folder2_Folder2_Doc1.pdf", "owner": "Michael Brown", "level": 5, "type": "file", "size": 650}',
]
    `.trim(),
  functions: `
import { evalExpression, registerModule } from "default_functions";

const apply_function_to_dataset = ({ dataset, functionInMarkdown}) => {
  const funcStr = functionInMarkdown.startsWith("\`\`\`") ? functionInMarkdown.split("\\n").slice(1, -1).join("\\n") : functionInMarkdown;
  return {
    message: evalExpression(\`(\${funcStr})(dataset)\`, { dataset }),
  }
}

// register functions
registerModule("custom_functions", {
  apply_function_to_dataset,
});
    `.trim(),
};
