import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  CATEGORY_SANDBOX,
  EVENT_COPILOT_DEBUG,
  EVENT_COPILOT_QUERY,
  EVENT_COPILOT_UPDATE,
  EVENT_COPILOT_UPDATE_SANDBOX_FLOW,
  MODE_MOCK,
} from "../const";

import { eventBus, Subscription } from "../libs/EventBus";
import { initLLM, queryOne } from "../libs/llm";
import { wait } from "../libs/utils";
import { createPlan, executePlan } from "../libs/flows";

const CopilotContext = createContext(null);

export const CopilotProvider = ({ children }) => {
  const [category, setCategory] = useState("");
  const [mode, setMode] = useState(MODE_MOCK);
  const flowRef = useRef([]);

  const updateMode = useCallback(
    (mode) => {
      initLLM(mode, (msg) => eventBus.publish(EVENT_COPILOT_DEBUG, msg));
      setMode(mode);
    },
    [setMode]
  );

  const copilotSubs = useRef([] as Subscription[]);

  // TODO: vector store needs api key for now
  useEffect(() => {
    const init = async () => {
      await wait(4000);
      eventBus.publish(
        EVENT_COPILOT_DEBUG,
        "NOTE: webLLM requires 2GB in browser cache storage, it could be purged from devTools."
      );
    };
    init();
  }, []);

  // subscribe to copilot query
  useEffect(() => {
    copilotSubs.current.push({
      topic: EVENT_COPILOT_QUERY,
      handler: eventBus.subscribe(
        EVENT_COPILOT_QUERY,
        async ({ category, query }) => {
          // TODO: remove inline
          if (category === CATEGORY_SANDBOX) {
            const plan = createPlan(flowRef.current);
            const response = await executePlan(plan, { message: query });
            eventBus.publish(EVENT_COPILOT_UPDATE, {
              category,
              response,
            });
          } else {
            // TODO: old flow, needs to be updated
            const response = await queryOne(query, {
              category,
              mode: mode,
            });
            eventBus.publish(EVENT_COPILOT_UPDATE, {
              category,
              response,
            });
          }
        }
      ),
    });

    copilotSubs.current.push({
      topic: EVENT_COPILOT_UPDATE_SANDBOX_FLOW,
      handler: eventBus.subscribe(
        EVENT_COPILOT_UPDATE_SANDBOX_FLOW,
        async (flow) => {
          flowRef.current = flow;
        }
      ),
    });

    return () => {
      copilotSubs.current.forEach((sub) => {
        eventBus.unsubscribe(sub.topic, sub.handler);
      });
    };
  }, [mode, category]);

  return (
    <CopilotContext.Provider
      value={{
        mode,
        setMode: updateMode,
        category,
        setCategory,
      }}
    >
      {children}
    </CopilotContext.Provider>
  );
};

export const useCopilot = () => {
  return useContext(CopilotContext);
};
