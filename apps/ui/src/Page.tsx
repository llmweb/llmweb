import { useEffect, useState } from "react";
import {
  List,
  ListItem,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Grid,
  GridItem,
  Heading,
  Link,
  Spacer,
  Flex,
  IconButton,
} from "@chakra-ui/react";
import yaml from "js-yaml";
import { useCopilot } from "./components";
import { ChatView, FlowChartView, SettingsView } from "./views";
import { eventBus } from "./libs/EventBus";
import {
  CATEGORY_JS_COMPLETION,
  CATEGORY_SANDBOX,
  EVENT_COPILOT_DEBUG,
  EVENT_COPILOT_UPDATE_SANDBOX_FLOW,
  PANEL_NONE,
  PANEL_PREVIEW,
  PANEL_SETTINGS,
} from "./const";
import { Allotment } from "allotment";
import "allotment/dist/style.css";

import { addDocumentsToVectorStore, resetVectorStore } from "./libs/vectordb";

import { EXAMPLE_CHARTS } from "./libs/charts";

import { registerPrompt } from "./libs/prompts";

import { MaterialIcon, MonacoEditor } from "./components";
import { evalJsBlock, downloadYaml, uploadYaml, debounce } from "./libs/utils";
import { getFunctions } from "./libs/functions";
import { LogView } from "./views/LogView";
import { deleteChart, getAllCharts, saveChart } from "./libs/charts/storage";
import { ChartCreationView } from "./views/ChartCreationView";
import NavigationPane from "./views/NavigationPane";

// TODO: needs to load from Retrieval tab too

const DEFAULT_CHART = EXAMPLE_CHARTS[0];

const saveChartDebounced = debounce(saveChart, 2000);

export default function Page({ flowChartUri }: { flowChartUri: string }) {
  // set to default chart if no value is given
  flowChartUri = flowChartUri || DEFAULT_CHART.uri;

  // log print
  const [info, setInfo] = useState("");

  // chart
  const [charts, setCharts] = useState([]);

  // flow
  const [chart, setChart] = useState({
    uri: flowChartUri,
    name: '',
    flows: '',
    prompts: '',
    datasets: '',
    functions: '',
  });

  const [flow, setFlow] = useState([]);

  const [panelType, setPanelType] = useState(PANEL_NONE);

  const [playgroundCollapsed, setPlaygroundCollapsed] = useState(false);

  const { autoSave } = useCopilot();

  // url hook
  useEffect(() => {
    const loadCharts = async () => {
      // load charts
      const charts = await getAllCharts();
      setCharts(charts);

      // load chart
      const chart =
        EXAMPLE_CHARTS.filter((c) => c.uri === flowChartUri)[0] ||
        charts.filter((c) => c.uri === flowChartUri)[0];
      if (!chart) {
        window.location.hash = `#/${DEFAULT_CHART.uri}`;
      } else {
        setChart({ ...chart });
      }
    };
    loadCharts();
  }, [flowChartUri]);

  useEffect(() => {
    if (autoSave) {
      const isExample =
        EXAMPLE_CHARTS.filter((c) => c.uri === chart.uri).length > 0;
      if (!isExample) {
        saveChartDebounced(chart.uri, chart);
      }
    }
  }, [chart]);

  useEffect(() => {
    const debugSub = eventBus.subscribe(EVENT_COPILOT_DEBUG, (msg) => {
      if (msg.length < 60) {
        msg = msg.trim();
      } else if (msg.length < 200) {
        msg = (msg.trim().split(/\n|(\. )/) || [])[0];
      } else {
        // get very last line
        msg = (msg.trim().split(/\n|(\. )/) || []).pop();
      }
      setInfo(msg);
    });

    return () => {
      eventBus.unsubscribe(EVENT_COPILOT_DEBUG, debugSub);
    };
  }, []);

  useEffect(() => {
    try {
      const flowDef = yaml.load(chart.flows) || {};
      const flow = Object.entries(flowDef).map(([name, value]) => ({
        name,
        ...(value as Record<string, unknown>),
      }));
      if (flow.length > 0) {
        setFlow(flow);
        eventBus.publish(EVENT_COPILOT_UPDATE_SANDBOX_FLOW, flow);
      }
    } catch (e) {
      console.error(e);
    }
  }, [chart.flows]);

  useEffect(() => {
    const transpiledFunctionContent = chart.functions.replace(
      /import {([^}]+)} from "(.*?)";/g,
      `const { $1 } = getFunctions("$2");`
    );

    evalJsBlock(transpiledFunctionContent, { getFunctions }, true) || [];
  }, [chart.functions]);

  useEffect(() => {
    try {
      const res = (yaml.load(chart.prompts) as Record<string, string>) || {};
      if (res != null) {
        registerPrompt("custom_prompts", res);
      }
    } catch (e) {
      console.error(e);
    }
  }, [chart.prompts]);

  return (
    <Allotment defaultSizes={[12, 88]}>
      {/* Navigation Bar */}
      <NavigationPane/>
      {/* Content Area */}
      <Allotment.Pane>
        <Grid
          templateAreas={`"main" "footer"`}
          gridTemplateRows={"1fr 30px"}
          gridTemplateColumns={"1fr"}
          h="100%"
          gap="0"
          color="blackAlpha.700"
        >
          <GridItem
            area={"main"}
            display="flex"
            borderTop="1px"
            borderColor={"#E2E8F0"}
          >
            <div
              style={{
                width: "100%",
                height: "100%",
                overflow: "hidden",
              }}
            >
              <Tabs
                variant="enclosed"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  height: "100%",
                }}
              >
                <TabList>
                  <Tab>Flows</Tab>
                  <Tab>Prompts</Tab>
                  <Tab>Datasets</Tab>
                  <Tab>Functions</Tab>
                  <Spacer />
                  <div
                    style={{
                      paddingRight: "5px",
                      paddingTop: "5px",
                    }}
                  >
                    <Flex>
                      <ChartCreationView />
                      <IconButton
                        size={"sm"}
                        title="Open..."
                        aria-label="Open..."
                        variant={"outline"}
                        color="#6c6c6c"
                        icon={<MaterialIcon icon="folder_open" />}
                        marginLeft={2}
                        onClick={async () => {
                          const chart = (await uploadYaml()) as any;
                          await saveChart(chart.uri, chart);
                          setCharts((charts) => [...charts, chart]);
                          // TODO: temporary solution, need to find a way to update the url
                          window.location.hash = `#/${chart.uri}`;
                        }}
                      />
                      <IconButton
                        size={"sm"}
                        title="Save"
                        aria-label="Save"
                        variant={"outline"}
                        color="#6c6c6c"
                        icon={<MaterialIcon icon="save" />}
                        marginLeft={2}
                        onClick={() => {
                          saveChart(chart.uri, chart);
                        }}
                      />
                      <IconButton
                        size={"sm"}
                        title="Export to File"
                        aria-label=""
                        variant={"outline"}
                        color="#6c6c6c"
                        icon={<MaterialIcon icon="ios_share" />}
                        marginLeft={2}
                        onClick={() => {
                          downloadYaml(chart.uri, chart);
                        }}
                      />
                      <IconButton
                        size={"sm"}
                        title="Clear Storage and Model"
                        aria-label="Clear Storage and Model"
                        variant={"outline"}
                        color="#6c6c6c"
                        icon={<MaterialIcon icon="mop" />}
                        marginLeft={2}
                        onClick={async () => {
                          // clear vector store
                          await resetVectorStore();
                          // clear model and extraction
                          if ("caches" in window) {
                            caches.delete("transformers-cache");
                            caches.delete("webllm/config");
                            caches.delete("webllm/wasm");
                            caches.delete("webllm/model");
                          }
                        }}
                      />
                      <IconButton
                        size={"sm"}
                        title="Flow Chart Preview"
                        aria-label="Flow Chart Preview"
                        variant={
                          panelType === PANEL_PREVIEW ? "solid" : "outline"
                        }
                        color="#6c6c6c"
                        icon={<MaterialIcon icon="schema" />}
                        marginLeft={2}
                        onClick={() => {
                          setPanelType(
                            panelType === PANEL_PREVIEW
                              ? PANEL_NONE
                              : PANEL_PREVIEW
                          );
                        }}
                      />
                      <IconButton
                        size={"sm"}
                        title="Settings"
                        aria-label="Settings"
                        variant={
                          panelType === PANEL_SETTINGS ? "solid" : "outline"
                        }
                        color="#6c6c6c"
                        icon={<MaterialIcon icon="settings" />}
                        marginLeft={2}
                        onClick={() => {
                          setPanelType(
                            panelType === PANEL_SETTINGS
                              ? PANEL_NONE
                              : PANEL_SETTINGS
                          );
                        }}
                      />
                    </Flex>
                  </div>
                </TabList>
                {/* allotment starts here since top bar needs to be global */}
                <Allotment>
                  <Allotment.Pane>
                    <Allotment vertical>
                      <Allotment.Pane>
                        <TabPanels
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            height: "100%",
                          }}
                        >
                          <TabPanel
                            style={{
                              height: "100%",
                              paddingLeft: 0,
                              paddingRight: 0,
                            }}
                          >
                            <MonacoEditor
                              lang="yaml"
                              text={chart.flows}
                              category={CATEGORY_JS_COMPLETION}
                              onChange={(text) => {
                                setChart((chart) => ({
                                  ...chart,
                                  flows: text,
                                }));
                              }}
                            />
                          </TabPanel>
                          <TabPanel
                            style={{
                              height: "100%",
                              paddingLeft: 0,
                              paddingRight: 0,
                            }}
                          >
                            <MonacoEditor
                              lang="yaml"
                              text={chart.prompts}
                              category={CATEGORY_JS_COMPLETION}
                              onChange={(text) => {
                                setChart((chart) => ({
                                  ...chart,
                                  prompts: text,
                                }));
                              }}
                            />
                          </TabPanel>
                          <TabPanel
                            style={{
                              height: "100%",
                              paddingLeft: 0,
                              paddingRight: 0,
                            }}
                          >
                            <MonacoEditor
                              lang="yaml"
                              text={chart.datasets}
                              category={CATEGORY_JS_COMPLETION}
                              onChange={(text) => {
                                setChart((chart) => ({
                                  ...chart,
                                  datasets: text,
                                }));
                              }}
                            />
                            <IconButton
                              size={"md"}
                              title="Save to Vector DB"
                              aria-label="Save to Vector DB"
                              variant={"solid"}
                              color="#6c6c6c"
                              icon={<MaterialIcon icon="database" />}
                              style={{
                                position: "absolute",
                                bottom: "25px",
                                right: "25px",
                              }}
                              onClick={async () => {
                                let datasets = {};
                                try {
                                  datasets = yaml.load(chart.datasets) || {};
                                } catch (e) {
                                  console.error(e);
                                }
                                await resetVectorStore();
                                await Promise.all(
                                  Object.entries(datasets).map(
                                    ([category, content]) =>
                                      addDocumentsToVectorStore(
                                        content as string,
                                        {
                                          category,
                                        }
                                      )
                                  )
                                );
                              }}
                            />
                          </TabPanel>
                          <TabPanel
                            style={{
                              height: "100%",
                              paddingLeft: 0,
                              paddingRight: 0,
                            }}
                          >
                            <MonacoEditor
                              lang="javascript"
                              text={chart.functions}
                              category={CATEGORY_JS_COMPLETION}
                              onChange={(text) => {
                                setChart((chart) => ({
                                  ...chart,
                                  functions: text,
                                }));
                              }}
                            />
                          </TabPanel>
                        </TabPanels>
                      </Allotment.Pane>
                      {/* Playground */}
                      {playgroundCollapsed && (
                        <Allotment.Pane
                          maxSize={41}
                          visible={playgroundCollapsed}
                        >
                          <Tabs
                            variant="enclosed"
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              height: "100%",
                            }}
                          >
                            <IconButton
                              size={"sm"}
                              title="Save to Vector DB"
                              aria-label="Save to Vector DB"
                              variant={"outline"}
                              color="#6c6c6c"
                              icon={
                                <MaterialIcon
                                  icon={
                                    playgroundCollapsed
                                      ? "keyboard_double_arrow_up"
                                      : "keyboard_double_arrow_down"
                                  }
                                />
                              }
                              style={{
                                position: "absolute",
                                top: "5px",
                                right: "5px",
                              }}
                              onClick={async () => {
                                setPlaygroundCollapsed(!playgroundCollapsed);
                              }}
                            />
                            <TabList>
                              <Tab isDisabled>Chat</Tab>
                              <Tab isDisabled>Completion</Tab>
                              <Tab isDisabled>Logs</Tab>
                            </TabList>
                          </Tabs>
                        </Allotment.Pane>
                      )}
                      {!playgroundCollapsed && (
                        <Allotment.Pane
                          preferredSize={350}
                          minSize={250}
                          // snap
                          visible={!playgroundCollapsed}
                        >
                          <Tabs
                            variant="enclosed"
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              height: "100%",
                            }}
                          >
                            <IconButton
                              size={"sm"}
                              title="Save to Vector DB"
                              aria-label="Save to Vector DB"
                              variant={"outline"}
                              color="#6c6c6c"
                              icon={
                                <MaterialIcon
                                  icon={
                                    playgroundCollapsed
                                      ? "keyboard_double_arrow_up"
                                      : "keyboard_double_arrow_down"
                                  }
                                />
                              }
                              style={{
                                position: "absolute",
                                top: "5px",
                                right: "5px",
                              }}
                              onClick={async () => {
                                setPlaygroundCollapsed(!playgroundCollapsed);
                              }}
                            />
                            <TabList>
                              <Tab>Chat</Tab>
                              <Tab>Completion</Tab>
                              <Tab>Logs</Tab>
                            </TabList>
                            <TabPanels
                              style={{
                                height: "calc(100% - 40px)",
                              }}
                            >
                              <TabPanel
                                style={{
                                  height: "100%",
                                  paddingLeft: 0,
                                  paddingRight: 0,
                                }}
                              >
                                <ChatView />
                              </TabPanel>
                              <TabPanel
                                style={{
                                  height: "100%",
                                  paddingLeft: 0,
                                  paddingRight: 0,
                                }}
                              >
                                <MonacoEditor
                                  lang="javascript"
                                  text={"// write something"}
                                  category={CATEGORY_SANDBOX}
                                />
                              </TabPanel>
                              <TabPanel
                                style={{
                                  height: "100%",
                                  paddingLeft: 0,
                                  paddingRight: 0,
                                }}
                              >
                                <LogView />
                              </TabPanel>
                            </TabPanels>
                          </Tabs>
                        </Allotment.Pane>
                      )}
                    </Allotment>
                  </Allotment.Pane>
                  {/* Side Panel */}
                  {panelType !== PANEL_NONE && (
                    <Allotment.Pane snap preferredSize={350}>
                      {panelType === PANEL_PREVIEW && (
                        <FlowChartView flow={flow} />
                      )}
                      {panelType === PANEL_SETTINGS && <SettingsView />}
                    </Allotment.Pane>
                  )}
                </Allotment>
              </Tabs>
            </div>
          </GridItem>
          <GridItem
            pl="2"
            area={"footer"}
            borderTop="1px"
            borderColor={"#E2E8F0"}
          >
            <div
              style={{
                color: "gray",
                fontSize: "12px",
                fontStyle: "italic",
                fontWeight: 700,
                display: "inline",
                position: "absolute",
                textOverflow: "ellipsis",
                textWrap: "nowrap",
                paddingTop: "5px",
                maxWidth: "500px",
                width: "500px",
              }}
            >
              {info}
            </div>
          </GridItem>
        </Grid>
      </Allotment.Pane>
    </Allotment>
  );
}
