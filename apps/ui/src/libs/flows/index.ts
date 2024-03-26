import { getFunction } from "../functions";
import { Value, Data, Flow, Action, Plan } from "../types";
import { cloneJson, getValue, parseExpr } from "../utils";

const STEP_USER_INPUT = {
  step: "user_input",
  name: "Question from User",
  type: "input",
};

/**
 * Evaluate data definition to store in mutable way
 *
 * @param input data definition as input
 * @param scope store object
 * @param level current level in the recursive evaluation
 * @returns void
 */
const evalDataDefinitionInternal = (
  input: Value,
  scope: Data,
  level: number
): void => {
  if (Array.isArray(input)) {
    for (const key in input) {
      const value = input[key];
      if (typeof value === "string") {
        const template = parseExpr(value);
        if (template) {
          input[key] = getValue(scope, template);
        }
      } else {
        evalDataDefinitionInternal(value, scope, level + 1);
      }
    }
  } else if (typeof input === "object") {
    for (const key in input) {
      const value = input[key];
      if (typeof value === "string") {
        const template = parseExpr(value);
        if (template) {
          input[key] = getValue(scope, template);
        }
      } else {
        evalDataDefinitionInternal(value, scope, level + 1);
      }
    }
  }
};

/**
 * Evaluate from data definition like:
 * {
 *   attr1: {{data.curVal}}
 * }
 * to actual value in scope like:
 * {
 *   attr1: 3
 * }
 *
 * @param input data definition
 * @param scope scope for evaluation
 * @param level used for recursive call internally
 * @returns evaluated input object
 */
export const evalDataDefinition = (input: Data, scope: Data): Data => {
  // Make the method to be immutable at top level
  const store = cloneJson(input);

  evalDataDefinitionInternal(store, scope, 0);

  return store;
};

/**
 * evaluate output data definition
 *
 * @param outputData output data definition
 * @param result function result
 * @returns evaluated output data values
 */
export const evalOutputData = (
  outputData: Record<string, string>,
  result: Value
): Data => {
  return Object.entries(outputData).reduce((prev, [path, resultPath]) => {
    return {
      ...prev,
      [path]:
        resultPath?.length > 0 ? getValue(result as Data, resultPath) : result,
    };
  }, {} as Data);
};

const applyStep = async (step, scope) => {
  let inputs = {};
  let source = '', context = {};

  if (step.type === "llm") {
    source = "queryByPromptTemplate";

    inputs = evalDataDefinition(step.inputs, scope);
    context = {
      source: step.source,
      toJSON: step.toJSON,
    };
  } else {
    const contextTemp = step.type === "retrieval" ? {
      ...step.context,
      source: "retrieveContents",
    } :step.context;
    context = contextTemp;
    source = contextTemp.source;

    inputs = evalDataDefinition(step.inputs, scope);
  }

  const actionFn = getFunction(source);

  const outputs = await actionFn(inputs, context);

  return { [step.step]: { inputs, outputs } };
};

export const createPlan = (flow: Flow): Plan => {
  const result = flow.reduce(
    (acc, step, idx) => {
      let { batch, curr } = acc;
      const deps = (step.deps || []).filter((n) => curr[n]);
      if (deps.length > 0) {
        batch.push(Object.values(curr));
        curr = {
          [step.step]: step,
        };
      } else {
        curr[step.step] = step;
      }

      // wrap up the last one
      if (idx === flow.length - 1) {
        // curr[step.name] = step;
        batch.push(Object.values(curr));
        curr = {};
      }

      return {
        batch,
        curr,
      };
    },
    {
      batch: [],
      curr: {},
    }
  );

  return result.batch;
};

export const executePlan = async (plan: Plan, inputs: Data): Promise<Data> => {
  const result = await plan.reduce(
    async (contextPromise, batch) => {
      const { scope } = await contextPromise;

      const resArr = await Promise.all(
        batch.map((step) => applyStep(step, scope))
      );

      return {
        scope: resArr.reduce((prev, curr) => {
          return {
            ...prev,
            ...curr,
          };
        }, scope),
        lastStep: batch[batch.length - 1].step,
      };
    },
    // init value
    Promise.resolve({
      scope: {
        inputs,
      },
      lastStep: "",
    })
  );


  return {
    inputs,
    outputs: result.scope[result.lastStep].outputs,
    ...result.scope,
  };
};

export const createFlowAction = (flow: Flow): Action => {
  const plan = createPlan(flow);

  // run steps
  return async (inputs: Data): Promise<Data> => {
    return executePlan(plan, inputs);
  };
};

export const createMermaidContent = (flow: Flow): string => {
  const stepMap = flow.reduce((prev, step) => {
    return {
      ...prev,
      [step.step]: step,
    };
  }, {});

  const diagramContent = flow.map((step) => {
    const prevSteps = step.deps
      ? step.deps.map((dep) => stepMap[dep])
      : [STEP_USER_INPUT];
    return prevSteps
      .filter(Boolean)
      .map(
        (prevStep) =>
          `${prevStep.step}(${prevStep.name || prevStep.step}):::${
            prevStep.type
          } --> ${step.step}(${step.name || step.step}):::${
            step.type
          }`
      )
      .join("\n");
  });
  return diagramContent.length > 0
    ? `
flowchart TD
  ${diagramContent.join("\n")}
  classDef llm       fill:#0CA789,color:#fff,stroke:#000,stroke-width:2px;
  classDef input     fill:#ffffff,color:#000,stroke:#000,stroke-width:2px;
  classDef function  fill:#FEF445,color:#000,stroke:#000,stroke-width:2px;
  classDef retrieval fill:#434BAC,color:#fff,stroke:#000,stroke-width:2px;
  `
    : "";
};
