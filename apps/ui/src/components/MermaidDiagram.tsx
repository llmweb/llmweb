import mermaid from "mermaid";
import { useEffect, useRef } from "react";

export const MermaidDiagram = ({ content }) => {
  const loading = useRef(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: true,
      flowchart: { useMaxWidth: true},
      theme: "default",
      securityLevel: "loose",
      themeCSS: `
    g.classGroup rect {
      fill: #282a36;
      stroke: #6272a4;
    } 
    g.classGroup text {
      fill: #f8f8f2;
    }
    g.classGroup line {
      stroke: #f8f8f2;
      stroke-width: 0.5;
    }
    .classLabel .box {
      stroke: #21222c;
      stroke-width: 3;
      fill: #21222c;
      opacity: 1;
    }
    .classLabel .label {
      fill: #f1fa8c;
    }
    .relation {
      stroke: #ff79c6;
      stroke-width: 1;
    }
    #compositionStart, #compositionEnd {
      fill: #bd93f9;
      stroke: #bd93f9;
      stroke-width: 1;
    }
    #aggregationEnd, #aggregationStart {
      fill: #21222c;
      stroke: #50fa7b;
      stroke-width: 1;
    }
    #dependencyStart, #dependencyEnd {
      fill: #00bcd4;
      stroke: #00bcd4;
      stroke-width: 1;
    } 
    #extensionStart, #extensionEnd {
      fill: #f8f8f2;
      stroke: #f8f8f2;
      stroke-width: 1;
    }`,
      fontFamily: "Fira Code",
    });
  }, []);

  useEffect(() => {
    if (ref.current && content !== "") {
      if (loading.current) {
        return;
      }
      loading.current = true;

      // NOTE: both 3rd param and the then() callback are required, otherwise the diagram will disappear in react debug mode or the word will be truncated
      mermaid.renderAsync("preview", content, () => {}, ref.current).then((svg) => {
        ref.current.innerHTML = svg;
        loading.current = false;
      });
    }
  }, [content]);

  return <div style={{
    padding: 10,
    fontWeight: 700,
  }} ref={ref} />;
};
