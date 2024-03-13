import { MermaidDiagram } from "../components/MermaidDiagram";
import { createMermaidContent } from "../libs/flows";
import { Flow } from "../libs/types";

export function FlowChartView({flow}: {flow: Flow}) {
  {/* needed otherwise diagram will disappear in react debug mode */}
  return flow.length > 0 && <MermaidDiagram content={createMermaidContent(flow)} />;
}
