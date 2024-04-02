import {
  initVectorStore,
  resetVectorStore,
  addDocumentsToVectorStore,
  queryVectorStore,
} from "./idb";

//// worker side
self.onmessage = async (e) => {
  const data = e.data;
  const task_id = data.task_id;
  if (data._web_flow_retrieval) {
    let resp = null;
    try {
      if (data.type === "initVectorStore") {
        resp = await initVectorStore();
      } else if (data.type === "resetVectorStore") {
        resp = await resetVectorStore();
      } else if (data.type === "addDocumentsToVectorStore") {
        resp = await addDocumentsToVectorStore(data.inputs.inputs, data.inputs.context, msg => {
          self.postMessage({
            outputs: msg,
            status: "progress",
            task_id,
        });
      });
      } else if (data.type === "queryVectorStore") {
        resp = await queryVectorStore(data.inputs.query, data.inputs.context);
      }
      self.postMessage({
        outputs: resp,
        status: "success",
        task_id,
      });
    } catch (e) {
      self.postMessage({
        outputs: e,
        status: "failure",
        task_id,
      });
    }
  }
};
