import { useEffect, useRef } from "react";
import { debounce, wait } from "../libs/utils";
import { eventBus } from "../libs/EventBus";
import { EVENT_COPILOT_QUERY, EVENT_COPILOT_UPDATE } from "../const";

import "monaco-editor/esm/vs/editor/editor.all.js";

// import 'monaco-editor/esm/vs/editor/standalone/browser/iPadShowKeyboard/iPadShowKeyboard.js';
// import 'monaco-editor/esm/vs/editor/standalone/browser/inspectTokens/inspectTokens.js';
// import 'monaco-editor/esm/vs/editor/standalone/browser/quickAccess/standaloneHelpQuickAccess.js';
// import 'monaco-editor/esm/vs/editor/standalone/browser/quickAccess/standaloneGotoLineQuickAccess.js';
// import 'monaco-editor/esm/vs/editor/standalone/browser/quickAccess/standaloneGotoSymbolQuickAccess.js';
// import 'monaco-editor/esm/vs/editor/standalone/browser/quickAccess/standaloneCommandsQuickAccess.js';
// import 'monaco-editor/esm/vs/editor/standalone/browser/referenceSearch/standaloneReferenceSearch.js';

// import 'monaco-editor/esm/vs/basic-languages/monaco.contribution';
import "monaco-editor/esm/vs/basic-languages/javascript/javascript.contribution";
import "monaco-editor/esm/vs/language/typescript/monaco.contribution";
import "monaco-editor/esm/vs/language/json/monaco.contribution";
import "monaco-editor/esm/vs/language/css/monaco.contribution";
import "monaco-editor/esm/vs/language/html/monaco.contribution";
import "monaco-editor/esm/vs/basic-languages/yaml/yaml.contribution";

import * as monaco from "monaco-editor/esm/vs/editor/editor.api";
import { useCopilot } from ".";

interface MonacoEditorProps {
  /* language type */
  lang: string;
  /* text input to initialize the editor */
  text: string;
  /* category for copilot */
  category: string;
  /* callback for text change */
  onChange?: (text: string) => void;
}

const queryCompletion = async (category, query) => {
  // TODO: need to handle timeout and reject here
  return new Promise((resolve) => {
    const sub = eventBus.subscribe(EVENT_COPILOT_UPDATE, ({ response }) => {
      eventBus.unsubscribe(EVENT_COPILOT_UPDATE, sub);
      // TODO: need to be refactor
      response =
        response?.outputs?.message ||
        (response?.outputs ? JSON.stringify(response.outputs, null, 2) : "") ||
        "";

      if (response) {
        const lastLine = query.split("\n").pop() || "";
        const lastWord = lastLine.split(/\b/).pop() || "";
        if (response.startsWith("```")) {
          const responseInLines = response.split("\n");
          response = responseInLines
            .slice(1, responseInLines.length - 1)
            .join("\n");
        } else if (response.startsWith(query)) {
          response = response.slice(query.length);
          response = lastWord + response;
        } else if (response.startsWith(lastLine)) {
          response = response.slice(lastLine.length);
          response = lastWord + response;
        } else if (response.startsWith(lastLine)) {
          // do nothing
        } else if (!response.startsWith(lastWord)) {
          response = lastWord + response;
        }
      }
      resolve(response);
    });

    eventBus.publish(EVENT_COPILOT_QUERY, {
      category,
      query,
    });
  });
};

export const MonacoEditor = ({
  lang,
  text,
  category,
  onChange,
}: MonacoEditorProps) => {
  const domRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const prevValueRef = useRef(text);
  const suggestionPromise = useRef(
    Promise.resolve({
      items: [{ insertText: "" }],
    })
  );

  const { setCategory } = useCopilot();

  useEffect(() => {
    setCategory(category);
  }, []);

  useEffect(() => {
    if (editorRef.current && editorRef.current.getValue() !== text) {
      editorRef.current.setValue(text);
    }
    prevValueRef.current = text;
  }, [text]);

  useEffect(() => {
    let resizeObserver: ResizeObserver;
    if (domRef.current && editorRef.current === null) {
      editorRef.current = monaco.editor.create(domRef.current, {
        value: text,
        language: lang,
        inlineSuggest: {
          enabled: true,
          showToolbar: "always",
          mode: "prefix",
          keepOnBlur: true,
        },
        minimap: {
          enabled: false,
        },
        suggest: {
          snippetsPreventQuickSuggestions: false,
        },
      });

      // Start observing the editor container for size changes
      resizeObserver = new ResizeObserver(() => {
        if (editorRef.current) {
          editorRef.current.layout();
        }
      });
      resizeObserver.observe(domRef.current);

      // Note: debounce needs to be here otherwise all editors will share the same debounce
      const queryCompletionDebounced = debounce(queryCompletion, 2000);

      editorRef.current.onDidChangeModelContent((e) => {
        const code = editorRef.current.getValue();

        // NOTE: if the text is passed from parent, we should not update it
        // we have 2 side effects here:
        // 1. The paste is not handled properly here
        if (prevValueRef.current !== code) {
          // update to parent
          onChange && onChange(code);

          // update the ref
          prevValueRef.current = code;

          // Call your AI API with the code to get the suggestion
          suggestionPromise.current = queryCompletionDebounced(
            category,
            code
          ).then((suggestion: string) => {
            // console.log(suggestion);
            // NOTE: suggest widget will block the inline suggestions, hide it for now as workaround
            editorRef.current.trigger("keyboard", "hideSuggestWidget", {});
            return {
              items: [
                {
                  insertText: suggestion,
                },
              ],
            };
          });
        }
      });

      // NOTE: put it here for now
      monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
        validate: true,
        allowComments: true,
      });

      monaco.languages.registerInlineCompletionsProvider(lang, {
        provideInlineCompletions: function () {
          return suggestionPromise.current;
        },
        freeInlineCompletions: function () {},
      });
    }

    // NOTE: this will cause strange behavior in dev mode
    return () => {
      if (editorRef.current) {
        if (domRef.current) {
          resizeObserver.unobserve(domRef.current);
        }
        editorRef.current.dispose();
        editorRef.current = null;
      }
    };
  }, []);

  return <div ref={domRef} style={{ height: "100%", width: "100%" }}></div>;
};
