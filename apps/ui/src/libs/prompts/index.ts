
// prompt template modules
const _prompts = {} as Record<string, Record<string, string>>;

/**
 * register prompts
 * 
 * @param moduleName name of the module
 * @param content prompt template as map
 */
export const registerPrompt = (moduleName: string, content: Record<string, string>) => {
    _prompts[moduleName] = content;
};


/**
 * get prompt template 
 * 
 * @param moduleName name of the module
 * @param promptName name of the function
 */
const getPrompt = (moduleName: string, promptName: string) => {
    return (_prompts[moduleName] || {})[promptName] || '' as string;
};

export const getPromptAsStringTemplate = (moduleName: string, promptName: string) => {
    return getPrompt(moduleName, promptName).trim().replace(/{{/g,'${').replace(/}}/g,'}');
}
