import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverBody,
  PopoverArrow,
  Button,
  Textarea,
  Kbd,
  Spinner,
  Grid,
  Select,
  FormLabel,
  Input,
  InputRightElement,
  InputGroup,
} from "@chakra-ui/react";
import { useEffect, useRef, useState, useCallback } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { useCopilot } from ".";
import { eventBus } from "../libs/EventBus";
import { debounce } from "../libs/utils";
import { setApiKey as setApiKeyOpenAI } from "../libs/llm/openai";
import {
  EVENT_COPILOT_QUERY,
  EVENT_COPILOT_UPDATE,
  MODE_WEBLLM,
  MODE_MOCK,
  MODE_SERVER,
  MODE_OPENAI,
} from "../const";

export const CopilotWidget = () => {
  const { category, mode, setMode } = useCopilot();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const initialFocusRef = useRef();

  useHotkeys(
    "mod+p,ctrl+p,esc",
    () => {
      setIsOpen(!isOpen);
    },
    { enableOnFormTags: ["INPUT", "TEXTAREA", "SELECT"] }
  );

  useEffect(() => {
    const loadingSub = eventBus.subscribe(EVENT_COPILOT_QUERY, () => {
      setLoading(true);
    });

    const updateSub = eventBus.subscribe(EVENT_COPILOT_UPDATE, () => {
      setLoading(false);
      setQuery("");
      setValue("");
      setIsOpen(false);
    });

    return () => {
      eventBus.unsubscribe(EVENT_COPILOT_QUERY, loadingSub);
      eventBus.unsubscribe(EVENT_COPILOT_UPDATE, updateSub);
    };
  }, []);

  const setQueryDebounced = useCallback(
    debounce((value) => setQuery(value), 2000),
    []
  );

  useEffect(() => {
    if (query) {
      eventBus.publish(EVENT_COPILOT_QUERY, { category, query });
    }
  }, [query]);

  /*
  const { colorMode, toggleColorMode } = useColorMode();
  */

  return (
    <Grid templateColumns="repeat(2, 0.7fr)" gap={3}>
      {/*
      <Switch id='isChecked' isChecked={colorMode === 'light'} onChange={toggleColorMode} />
  */}
      <Select aria-label="Mode" title="Mode" value={mode} onChange={(e) => setMode(e.target.value)}>
        <option value={MODE_MOCK}>Mock</option>
        <option value={MODE_WEBLLM}>WebLLM (require 4GB cache)</option>
        <option value={MODE_OPENAI}>OpenAI (require api-key)</option>
        <option value={MODE_SERVER}>PyServer (localhost debug)</option>
      </Select>
      <Popover
        initialFocusRef={initialFocusRef}
        returnFocusOnClose={true}
        isOpen={isOpen}
      >
        <PopoverTrigger>
          <Button
            colorScheme={"yellow"}
            onClick={() => setIsOpen((prev) => !prev)}
          >
            Copilot{" "}
            <Kbd ml={2} mr={1}>
              Ctrl
            </Kbd>{" "}
            + <Kbd mr={1}>P</Kbd>
          </Button>
        </PopoverTrigger>
        <PopoverContent>
          <PopoverArrow />
          {/* 
          <PopoverHeader>Hints</PopoverHeader>
          */}
          <PopoverBody>
            {loading ? (
              <Spinner
                thickness="4px"
                speed="0.65s"
                emptyColor="gray.200"
                color="blue.500"
                size="xl"
              />
            ) : (
              <>
                <FormLabel paddingTop={4}>Prompt</FormLabel>
                <Textarea
                  ref={initialFocusRef}
                  value={value}
                  onChange={(e) => {
                    setValue(e.target.value);
                    setQueryDebounced(e.target.value);
                  }}
                  placeholder="Type whatever you need"
                />
                <FormLabel paddingTop={4}>OpenAI API Key</FormLabel>
                <InputGroup size="md">
                  <Input
                    pr="4.5rem"
                    type={showPass ? "text" : "password"}
                    placeholder="Enter openai-api-key"
                    value={apiKey}
                    onChange={(e) => {
                      const apiKey = e.target.value;
                      setApiKey(apiKey);
                      if (apiKey) {
                        setApiKeyOpenAI(apiKey);
                      }
                    }}
                  />
                  <InputRightElement width="4.5rem">
                    <Button
                      h="1.75rem"
                      size="sm"
                      onClick={() => setShowPass((prev) => !prev)}
                    >
                      {showPass ? "Hide" : "Show"}
                    </Button>
                  </InputRightElement>
                </InputGroup>
              </>
            )}
          </PopoverBody>
        </PopoverContent>
      </Popover>
    </Grid>
  );
};
