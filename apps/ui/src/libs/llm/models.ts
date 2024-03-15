export interface LangModel {
  key: string;
  name: string;
  description?: string;
  initModel: (
    progressCallback: (message: string, step?: number) => void
  ) => Promise<void>;
  queryModel: (query: string) => Promise<string>;
}

const _models = {} as { [key: string]: LangModel };

export const registerModel = (model: LangModel) => {
  _models[model.key] = model;
};

export const getModel = (key: string) => {
  return _models[key];
};

export const getModels = () => {
  return Object.values(_models);
};
