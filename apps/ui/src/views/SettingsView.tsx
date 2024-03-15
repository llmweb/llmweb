import {
  Button,
  Select,
  FormLabel,
  Input,
  InputRightElement,
  InputGroup,
  FormControl,
  Box,
} from "@chakra-ui/react";
import { useState } from "react";
import {
  getApiKey,
  setApiKey,
  setLangModel,
  getModels
} from '../libs/llm';

const MODELS = getModels();

export const SettingsView = () => {
  const [showPass, setShowPass] = useState(false);
  const [key, setKey] = useState(getApiKey());
  const [mode, setMode] = useState(MODELS[0].key);

  return (
    <Box p={3}>
      <FormControl>
        <FormLabel paddingTop={4}>Default LLM</FormLabel>
        <Select
          aria-label="Mode"
          title="Mode"
          value={mode}
          onChange={(e) => {
            const mode = e.target.value;
            setMode(mode);
            setLangModel(mode);
          }}
        >
          {
            MODELS.map((m) => {
              return <option key={m.key} value={m.key}>{m.name}</option>
            })
          }
        </Select>
        <FormLabel paddingTop={4}>OpenAI API Key</FormLabel>
        <InputGroup size="md">
          <Input
            pr="4.5rem"
            type={showPass ? "text" : "password"}
            placeholder="Enter openai-api-key"
            value={key}
            onChange={(e) => {
              const apiKey = e.target.value;
              setKey(apiKey);
              setApiKey(apiKey);
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
      </FormControl>
    </Box>
  );
};
