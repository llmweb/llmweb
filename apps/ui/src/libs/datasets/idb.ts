// solution that using indexedDB and chatgpt
import { VectorStorage } from "vector-storage";
import { Pipeline, pipeline } from "@xenova/transformers";

const VSTORE_NAME = "VectorStorageDatabase";

async function getExtractor() {
  const extractor = await pipeline(
    "feature-extraction",
    "Xenova/all-MiniLM-L6-v2"
  );
  return extractor as Pipeline;
}

async function extract(extractor: Pipeline, text: string) {
  const result = await extractor(text, { pooling: "mean", normalize: true });
  return result.data;
}

const _ctx = {
  vStore: null as VectorStorage<{ category: string }>,
};

function deleteIndexedDB(dbName) {
  return new Promise((resolve, reject) => {
    const deleteRequest = indexedDB.deleteDatabase(dbName);

    deleteRequest.onsuccess = function () {
      console.log("Database deleted successfully");
      resolve(null);
    };

    deleteRequest.onerror = function () {
      console.log("Error deleting database");
      reject();
    };

    deleteRequest.onblocked = function () {
      console.log("Database delete operation blocked");
      // no need to reject since it will retry
      // reject();
    };
  });
}

function checkIfIndexedDBExists(dbName): Promise<boolean> {
  return new Promise((resolve, reject) => {
    let dbExists = true;
    const request = indexedDB.open(dbName);
    request.onupgradeneeded = function () {
      // This event is only triggered if the database didn't exist and is being created
      console.log("Database being created. It didn't exist before.");
      dbExists = false;
    };

    request.onsuccess = function (event) {
      // Don't forget to close the database connection
      (event.target as any).result.close();

      if (!dbExists) {
        resolve(deleteIndexedDB(dbName).then(() => dbExists));
      } else {
        console.log("Database already exists.");
        resolve(dbExists);
      }
    };

    request.onerror = function (event) {
      console.error("Error opening database:", (event.target as any).error);
      reject();
    };
  });
}

export const queryVectorStore = async (query, { category, count }) => {
  return (
    await _ctx.vStore.similaritySearch({
      query,
      k: count || 3,
      filterOptions: {
        include: {
          metadata: {
            category,
          },
        },
      },
    })
  ).similarItems;
};

const createVectorStore = async () => {
  // Get extractor
  const extractor = await getExtractor();
  return new VectorStorage<{ category: string }>({
    embedTextsFn: (texts) =>
      Promise.all(texts.map((t) => extract(extractor, t))),
  });
};

export const resetVectorStore = async () => {
  (_ctx.vStore as any).db.close();
  // _ctx.vStore = null;
  await deleteIndexedDB(VSTORE_NAME);
  _ctx.vStore = await createVectorStore();
}

export const initVectorStore = async () => {
  const dbExists = await checkIfIndexedDBExists(VSTORE_NAME);

  // Create vector store
  _ctx.vStore = await createVectorStore();
  return { cached: dbExists };
};

export const addDocumentsToVectorStore = async (
  texts: string[],
  { category }
) => {
  for (let idx in texts) {
    await _ctx.vStore.addText(texts[idx], {
      category,
    });
    console.log(`embedding ${category} ${idx}/${texts.length - 1}`);
  }
};

export const cacheVectorStore = async () => {
  // no need for idb since it is using indexedDB
};
