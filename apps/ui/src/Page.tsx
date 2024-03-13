import { useEffect, useState } from "react";
import {
  Button,
  ChakraProvider,
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
import { CopilotProvider, CopilotWidget } from "./components";
import { ChatView, FlowChartView } from "./views";
import { eventBus } from "./libs/EventBus";
import {
  CATEGORY_JS_COMPLETION,
  CATEGORY_SANDBOX,
  EVENT_COPILOT_DEBUG,
  EVENT_COPILOT_UPDATE_SANDBOX_FLOW,
} from "./const";
import { Allotment } from "allotment";
import "allotment/dist/style.css";

import {
  initVectorStore,
  addDocumentsToVectorStore,
  resetVectorStore,
} from "./libs/vectordb";

import { getChart, getCharts } from "./libs/charts";

import { registerPrompt } from "./libs/prompts";

import { MaterialIcon, MonacoEditor } from "./components";
import {
  evalJsBlock,
  downloadYaml,
  uploadYaml,
} from "./libs/utils";
import { getFunctions } from "./libs/functions";
import { LogView } from "./views/LogView";
import "./samples";

/*
      console.log(yaml.dump(contexts, {
        lineWidth: -1,
        noRefs: true,
        noCompatMode: true,
      }));
      */

// TODO: needs to load from Retrieval tab too
initVectorStore();

const CHARTS = getCharts();

const DEFAULT_CHART = CHARTS[0];

export default function Page({ flowChartUri }: { flowChartUri: string }) {
  // set to default chart if no value is given
  flowChartUri = flowChartUri || DEFAULT_CHART.name;

  // log print
  const [info, setInfo] = useState("");

  // chart
  const [charts, setCharts] = useState(CHARTS);
  const [chart, setChart] = useState(DEFAULT_CHART);
  const [flow, setFlow] = useState([]);

  // url hook
  useEffect(() => {
    const chart = getChart(flowChartUri) || DEFAULT_CHART;
    setChart({ ...chart });
  }, [flowChartUri]);

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
    <ChakraProvider>
      <CopilotProvider>
        <Grid
          templateAreas={`"header"
                  "main"
                  "footer"`}
          gridTemplateRows={"50px 1fr 30px"}
          gridTemplateColumns={"1fr"}
          h="100%"
          gap="0"
          color="blackAlpha.700"
          /*fontWeight="bold"*/
        >
          <GridItem /*pl="2" bg='orange.300'*/ area={"header"}>
            <Flex>
              <Heading as="h1" pl="2" size="lg" paddingTop={1}>
                LLM Web
              </Heading>
              <Spacer />
              <div style={{ paddingRight: "20px", paddingTop: "5px" }}>
                <CopilotWidget />
              </div>
            </Flex>
          </GridItem>
          <GridItem
            /* pl="2" bg='green.300'*/
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
              <Allotment defaultSizes={[30, 200, 70]}>
                {/* Navigation Bar */}
                <Allotment.Pane>
                  <List spacing={1}>
                    {charts.map((chart, idx) => {
                      return (
                        <ListItem
                          key={idx}
                          style={{
                            paddingLeft: "7px",
                            paddingTop: "5px",
                            paddingBottom: "5px",
                            backgroundColor:
                              chart.name === flowChartUri
                                ? "#E2E8F0" /*#EEF2F6*/
                                : "white",
                          }}
                        >
                          <Link
                            key={chart.name}
                            href={`#/${chart.name}`}
                            style={{
                              wordWrap: "initial",
                              fontWeight: "normal",
                            }}
                          >
                            {chart.name}
                          </Link>
                        </ListItem>
                      );
                    })}
                  </List>
                </Allotment.Pane>
                {/* Main */}
                <Allotment.Pane>
                  <Allotment vertical defaultSizes={[100, 100]}>
                    {/* Editor */}
                    <Allotment.Pane>
                      <Tabs
                        variant="enclosed"
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          height: "100%",
                        }}
                      >
                        <Flex top={1} right={2} position={"absolute"}>
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
                              setCharts((charts) => [...charts, chart]);
                            }}
                          />
                          <IconButton
                            size={"sm"}
                            title="Save to File"
                            aria-label="Save to File"
                            variant={"outline"}
                            color="#6c6c6c"
                            icon={<MaterialIcon icon="save" />}
                            marginLeft={2}
                            onClick={() => {
                              downloadYaml(chart.name, chart);
                            }}
                          />
                        </Flex>
                        <TabList>
                          <Tab>Flows</Tab>
                          <Tab>Prompts</Tab>
                          <Tab>Contexts</Tab>
                          <Tab>Functions</Tab>
                        </TabList>
                        <TabPanels
                          style={{
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
                              text={chart.Contexts}
                              category={CATEGORY_JS_COMPLETION}
                              onChange={(text) => {
                                setChart((chart) => ({
                                  ...chart,
                                  Contexts: text,
                                }));
                              }}
                            />
                            <Button
                              style={{
                                position: "absolute",
                                bottom: "35px",
                                right: "25px",
                              }}
                              onClick={async () => {
                                let contexts = {};
                                try {
                                  contexts =
                                    yaml.load(chart.Contexts) || {};
                                } catch (e) {
                                  console.error(e);
                                }
                                await resetVectorStore();
                                await Promise.all(
                                  Object.entries(contexts).map(
                                    ([category, content]) =>
                                      addDocumentsToVectorStore(content as string, {
                                        category,
                                      })
                                  )
                                );
                              }}
                            >
                              Save to VectorDB
                            </Button>
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
                      </Tabs>
                    </Allotment.Pane>
                    {/* Playground */}
                    <Allotment.Pane>
                      {/*}
                      {mode === MODE.CHAT && <ChatView />}
                      {mode === MODE.CODE && (
                        <MonacoEditor
                          lang="javascript"
                          text={"// write something"}
                          category={CATEGORY_JS_COMPLETION}
                        />
                      )}
                      */}
                      <Tabs
                        variant="enclosed"
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          height: "100%",
                        }}
                      >
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
                  </Allotment>
                </Allotment.Pane>
                {/* Diagram Preview */}
                <Allotment.Pane>
                  <FlowChartView flow={flow} />
                </Allotment.Pane>
              </Allotment>
            </div>
          </GridItem>
          <GridItem
            pl="2"
            /*bg="blue.300"*/ area={"footer"}
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
      </CopilotProvider>
    </ChakraProvider>
  );
}
