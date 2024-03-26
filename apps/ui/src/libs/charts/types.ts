/**
 * Chart definition
 * 
 * NOTE: It is fitting with UI now so all sub-objects are string
 */
export interface Chart {
    // URI of the chart which will be used as path of the URL
    uri: string;
    // Name of the chart
    name: string;
    // flows in the chart as yaml string
    flows: string;
    // prompts in the chart as yaml string
    prompts: string;
    // datasets in the chart as yaml string
    datasets: string;
    // functions in the chart as yaml string
    functions: string;
    // timestamp of the chart when it saved to storage
    timestamp?: number;
}

