import { IVSSimilaritySearchItem } from "vector-storage";
import { EVENT_COPILOT_DEBUG } from "../../const";
import { eventBus } from "../EventBus";

const _ctx = {
  worker: null as Worker,
  pendingPromises: new Map(),
};

export const initVectorStore = async () => {
  if (!_ctx.worker) {
    _ctx.worker = new Worker(new URL("./worker.ts", import.meta.url), {
      type: "module",
    });

    _ctx.worker.onmessage = (e) => {
      const { task_id, status, outputs } = e.data;

      if (status === "progress") {
        eventBus.publish(EVENT_COPILOT_DEBUG, outputs);
      } else {
        const { resolve, reject } = _ctx.pendingPromises.get(task_id);

        // Clean up after resolving or rejecting the promise
        _ctx.pendingPromises.delete(task_id);

        if (status === "success") {
          resolve(outputs);
        } else if (status === "failure") {
          reject(outputs);
        }
      }
    };

    _ctx.worker.onerror = (err) => {
      // Handle global worker errors here
      console.error(err.message);
    };

    return new Promise((resolve, reject) => {
      const task_id = Math.random().toString(36).substring(2);
      _ctx.pendingPromises.set(task_id, { resolve, reject });
      _ctx.worker.postMessage({
        _web_flow_retrieval: true,
        type: "initVectorStore",
        task_id,
      });
    });
  }
  // return _ctx.worker;
};

export const queryVectorStore = async (
  query,
  context
): Promise<
  IVSSimilaritySearchItem<{
    category: string;
  }>[]
> => {
  return new Promise((resolve, reject) => {
    const task_id = Math.random().toString(36).substring(2);
    _ctx.pendingPromises.set(task_id, { resolve, reject });
    _ctx.worker.postMessage({
      _web_flow_retrieval: true,
      type: "queryVectorStore",
      task_id,
      inputs: {
        query,
        context,
      },
    });
  });
};

export const resetVectorStore = async () => {
  return new Promise((resolve, reject) => {
    const task_id = Math.random().toString(36).substring(2);
    _ctx.pendingPromises.set(task_id, { resolve, reject });

    _ctx.worker.postMessage({
      _web_flow_retrieval: true,
      type: "resetVectorStore",
      task_id,
    });
  });
};

export const addDocumentsToVectorStore = async (inputs: string, context) => {
  return new Promise((resolve, reject) => {
    const task_id = Math.random().toString(36).substring(2);
    _ctx.pendingPromises.set(task_id, { resolve, reject });

    _ctx.worker.postMessage({
      _web_flow_retrieval: true,
      type: "addDocumentsToVectorStore",
      task_id,
      inputs: {
        inputs,
        context,
      },
    });
  });
};

initVectorStore();
