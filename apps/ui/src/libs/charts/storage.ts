
const CACHE_KEY_CHARTS = "llm-web-charts";

/**
 * 
 * @param topic 
 */
export const saveChart = async (chartName: string, content: any) => {
  await caches.open(CACHE_KEY_CHARTS).then(function (cache) {
    const response = new Response(JSON.stringify(content), {
      headers: { "Content-Type": "application/json" },
    });

    return cache.put(chartName, response).then(function () {
      console.log("JSON data saved to cache.");
    });
  });
};

export const getChart = async (chartName: string): Promise<any> => {
  const cache = await caches.open(CACHE_KEY_CHARTS);
  const response = await cache.match(chartName);

  if (!response) {
    throw new Error('No data found in cache for this chartName');
  }

  const jsonData = await response.json();
  console.log("JSON data retrieved from cache:", jsonData);
  return jsonData;
};

export const getAllCharts = async (): Promise<{[key: string]: any}> => {
  const cache = await caches.open(CACHE_KEY_CHARTS);
  const requests = await cache.keys();
  const charts: {[key: string]: any} = {};

  for (const request of requests) {
    const response = await cache.match(request);
    if (response) {
      const jsonData = await response.json();
      charts[request.url] = jsonData;
    }
  }

  console.log("All charts retrieved from cache:", charts);
  return charts;
};