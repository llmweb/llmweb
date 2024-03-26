const PROMPT_NAME = 'custom_prompts';

// prompt template modules
const _prompts = {} as Record<string, Record<string, string>>;

/**
 * register prompts
 * 
 * @param moduleName name of the module
 * @param content prompt template as map
 */
export const registerPrompt = (key: string, content: Record<string, string>) => {
    _prompts[PROMPT_NAME] = content;
};


/**
 * get prompt template 
 * 
 * @param moduleName name of the module
 * @param promptName name of the function
 */
const getPrompt = (source: string) => {
    return _prompts[PROMPT_NAME][source] || '' as string;
};

export const getPromptAsStringTemplate = (source: string) => {
    return getPrompt(source).trim().replace(/{{/g,'${').replace(/}}/g,'}');
}
