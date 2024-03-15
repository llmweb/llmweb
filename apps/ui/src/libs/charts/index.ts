/**
 * Chart definition
 * 
 * NOTE: It is fitting with UI now so all sub-objects are string
 */
export interface Chart {
    name: string;
    description: string;
    flows: string;
    prompts: string;
    datasets: string;
    functions: string;
}

const _charts = {} as Record<string, Chart>;

/**
 * Register charts
 * 
 * @param chartName chart name
 * @param chart  chart definition
 */
export const registerChart = (chart: Chart) => {
    _charts[chart.name] = chart;
}

/**
 * Get chart
 * 
 * @param chartName chart name
 * @returns chart object
 */
export const getChart = (chartName: string) => {
    return _charts[chartName];
}

export const getCharts = () => {
    return Object.values(_charts);
}