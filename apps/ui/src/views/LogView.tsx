import { useEffect, useState } from "react";
import { marked } from "marked";
import { eventBus } from "../libs/EventBus";
import { CATEGORY_SANDBOX, EVENT_COPILOT_UPDATE } from "../const";

const CATEGORY = CATEGORY_SANDBOX;
// const CATEGORY = CATEGORY_CHAT;

export function LogView() {
  const [content, setContent] = useState("");

  // TODO: this should go with focus/active later
  useEffect(() => {
    const subs = eventBus.subscribe(
      EVENT_COPILOT_UPDATE,
      ({ category, response }) => {
        if (category === CATEGORY) {
          setContent(
            `
\`\`\`json
${JSON.stringify(response, null, 2)}
\`\`\`
          `.trim()
          );
        }
      }
    );
    return () => {
      eventBus.unsubscribe(EVENT_COPILOT_UPDATE, subs);
    };
  }, []);

  return (
      <div
        className="markdown-body"
        dangerouslySetInnerHTML={{
          __html: marked.parse(content),
        }}
        style={{
          height: "100%",
          overflowY: "auto",
        }}
      />
  );
}
