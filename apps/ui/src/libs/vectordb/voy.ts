// NOTE comment out since voy deserialization is not working
// https://github.com/tantaraio/voy/issues/56
/*
import { Voy as VoyClient } from "voy-search";
import { VoyVectorStore } from "@langchain/community/vectorstores/voy";
import { HuggingFaceTransformersEmbeddings } from "@langchain/community/embeddings/hf_transformers";

// https://github.com/jacoblee93/fully-local-pdf-chatbot/tree/ceb260ab7c7a9398f55397fe7f50cb65a5fa2557
// https://js.langchain.com/docs/modules/chains/popular/chat_vector_db
// https://github.com/tantaraio/voy/

const _ctx = {
  store: null as VoyVectorStore,
}

export const initVectorStore = async (topic = "sample") => {
  const {voy, cached} = await caches.open("voy-cache").then(function (cache) {
    return cache.match(topic).then(function (response) {
      if (!response) {
        // do nothing since it is initialized
        return { voy: new VoyClient(), cached: false };
      } else {
        // Data was found in the cache, proceed to use it
        return response.text().then(function (data) {
          return {
            voy: VoyClient.deserialize(data),
            cached: true,
          };
        });
      }
    });
  });

  _ctx.store = new VoyVectorStore(
    voy,
    new HuggingFaceTransformersEmbeddings({
      modelName: "Xenova/all-MiniLM-L6-v2",
    })
  );
  return { store: _ctx.store, cached };
};

export const queryVectorStore = async (query, { category }) => {
  _ctx.store.similaritySearchWithScore(query, 3, { category });
  return _ctx.store.similaritySearch(query, 3, { category });
};

export const addDocumentsToVectorStore = async (
  inputs: string[],
  { category }
) => {
  return _ctx.store.addDocuments(
    inputs.map((pageContent) => ({ pageContent, metadata: { category } }))
  );
};

export const cacheVectorStore = async (topic = "sample") => {
  await caches.open("voy-cache").then(function (cache) {
    const myString = (_ctx.store.client as any).serialize();
    const response = new Response(myString, {
      headers: { "Content-Type": "text/plain" },
    });

    return cache.put(topic, response).then(function () {
      console.log("JSON data saved to cache.");
    });
  });
};
*/