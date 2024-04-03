import {
  Button,
  Select,
  FormLabel,
  Input,
  InputRightElement,
  InputGroup,
  FormControl,
  Box,
  Checkbox,
} from "@chakra-ui/react";
import { useState, useRef } from "react";
import {
  getApiKey,
  setApiKey,
  setLangModel,
  getModels
} from '../libs/llm';
import { useCopilot } from "../components";

const MODELS = getModels();

export const SettingsView = () => {
  const timerId = useRef(0);
  const [showPass, setShowPass] = useState(false);
  const [key, setKey] = useState(getApiKey());
  const [mode, setMode] = useState( localStorage.getItem('model') || MODELS[0].key);
  const { autoSave, setAutoSave } = useCopilot();
  const saveApiKey = (apiKey)=>{
    localStorage.setItem('apiKey', apiKey);
  }
  const savePrefModel = (model)=>{
    localStorage.setItem('model', model)
  }
  const debounce = (func, delay)=>{
    return (e)=>{
      clearTimeout(timerId.current)
      let apiKey = e.target.value;
      timerId.current = setTimeout( 
        ()=>{
          func(apiKey)  
        }
        ,delay)
    }
  }
  const handleSaveApiKey = debounce(saveApiKey, 2000)

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
            setLangModel(mode)
            savePrefModel(mode);
          }}
        >
          {
            MODELS.map((m) => {
              return <option key={m.key} value={m.key}>{m.name}</option>
            })
          }
        </Select>
        <FormLabel paddingTop={4}>{mode.charAt(0).toUpperCase() + mode.slice(1)} key</FormLabel>
        <InputGroup size="md">
          <Input
            pr="4.5rem"
            type={showPass ? "text" : "password"}
            placeholder={`Enter ${mode} api-key`}
            value={key}
            onChange={(e) => {
              const apiKey = e.target.value;
              setKey(apiKey);
              setApiKey(apiKey);
              handleSaveApiKey(e);
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
        <Checkbox pt={3} colorScheme='yellow' isChecked={autoSave} onChange={() => setAutoSave(!autoSave)} >Auto Save</Checkbox>
      </FormControl>
    </Box>
  );
};
