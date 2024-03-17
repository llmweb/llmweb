import { Chart } from "./types";

const CACHE_KEY_CHARTS = "llmweb/charts";

/**
 * 
 * @param topic 
 */
export const saveChart = async (uri: string, content: Chart) => {
  await caches.open(CACHE_KEY_CHARTS).then(function (cache) {
    const response = new Response(JSON.stringify(content), {
      headers: { "Content-Type": "application/json" },
    });

    return cache.put(uri, response).then(function () {
      console.log(`${uri} saved to cache.`);
    });
  });
};

export const getChart = async (chartName: string): Promise<Chart> => {
  const cache = await caches.open(CACHE_KEY_CHARTS);
  const response = await cache.match(chartName);

  if (!response) {
    throw new Error('No data found in cache for this chartName');
  }

  const jsonData = await response.json();
  console.log("JSON data retrieved from cache:", jsonData);
  return jsonData;
};

export const deleteChart = async (chartName: string) => {
  const cache = await caches.open(CACHE_KEY_CHARTS);
  await cache.delete(chartName);
}

export const getAllCharts = async (): Promise<Chart[]> => {
  const cache = await caches.open(CACHE_KEY_CHARTS);
  const requests = await cache.keys();
  const charts = [] as Chart[];

  for (const request of requests) {
    const response = await cache.match(request);
    if (response) {
      const jsonData = await response.json();
      charts.push(jsonData);
    }
  }

  // console.log("All charts retrieved from cache:", charts);
  return charts;
};