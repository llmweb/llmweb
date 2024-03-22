import { Chart } from "./types";

const CACHE_KEY_CHARTS = "llmweb/charts";

/**
 * Get a chart from the cache
 * 
 * @param chartUri URI of the chart
 * @returns chart object
 */
export const getChart = async (chartUri: string): Promise<Chart> => {
  const cache = await caches.open(CACHE_KEY_CHARTS);
  const response = await cache.match(chartUri);

  if (!response) {
    throw new Error('No data found in cache for this chartName');
  }

  const jsonData = await response.json();
  console.log("JSON data retrieved from cache:", jsonData);
  return jsonData;
};

/**
 * Get all charts from the cache
 * 
 * @returns all charts from the cache
 */
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

  return charts;
};

/**
 * Save a chart to the cache
 * 
 * @param chartUri URI of the chart 
 * @param chart chart object 
 */
export const saveChart = async ( chart: Chart) => {
  await caches.open(CACHE_KEY_CHARTS).then(function (cache) {
    const response = new Response(JSON.stringify(chart), {
      headers: { "Content-Type": "application/json" },
    });

    return cache.put(chart.uri, response).then(function () {
      console.log(`${chart.uri} saved to cache.`);
    });
  });
};

/**
 * Delete a chart from the cache
 * 
 * @param chartUri URI of the chart 
 */
export const deleteChart = async (chartUri: string) => {
  const cache = await caches.open(CACHE_KEY_CHARTS);
  await cache.delete(chartUri);
}

