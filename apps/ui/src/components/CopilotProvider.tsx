import { createContext, useContext, useEffect, useRef, useState } from "react";

import {
  CATEGORY_SANDBOX,
  EVENT_COPILOT_DEBUG,
  EVENT_COPILOT_QUERY,
  EVENT_COPILOT_UPDATE,
  EVENT_COPILOT_UPDATE_SANDBOX_FLOW,
} from "../const";

import { eventBus, Subscription } from "../libs/EventBus";
import { wait } from "../libs/utils";
import { createPlan, executePlan } from "../libs/flows";

const CopilotContext = createContext(null);

export const CopilotProvider = ({ children }) => {
  const [category, setCategory] = useState("");
  const [autoSave, setAutoSave] = useState(false);
  const flowRef = useRef([]);

  const copilotSubs = useRef([] as Subscription[]);

  // TODO: vector store needs api key for now
  useEffect(() => {
    const init = async () => {
      await wait(1000);
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
            eventBus.publish(EVENT_COPILOT_UPDATE, {
              category,
              response: {
                /*
                outputs: {
                  message: `No handler for category: ${category} and query: ${query}`,
                },
                */
              },
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
  }, [category]);

  return (
    <CopilotContext.Provider
      value={{
        category,
        setCategory,
        autoSave,
        setAutoSave,
      }}
    >
      {children}
    </CopilotContext.Provider>
  );
};

export const useCopilot = () => {
  return useContext(CopilotContext);
};
