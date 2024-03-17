import {
  Button,
  FormLabel,
  IconButton,
  Input,
  InputGroup,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverContent,
  PopoverHeader,
  PopoverTrigger,
} from "@chakra-ui/react";
import { useRef, useState } from "react";
import { MaterialIcon } from "../components";
import { useHotkeys } from "react-hotkeys-hook";
import { saveChart } from "../libs/charts/storage";

export const ChartCreationView = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [uri, setUri] = useState("");
  const [name, setName] = useState("");

  useHotkeys(
    "esc",
    () => {
      setUri("");
      setName("");
      setIsOpen(false);
    },
    { enableOnFormTags: ["INPUT"] }
  );

  return (
    <Popover returnFocusOnClose={false} isOpen={isOpen}>
      <PopoverTrigger>
        <IconButton
          size={"sm"}
          title="Create New Chart"
          aria-label="Create New Chart"
          variant={"outline"}
          color="#6c6c6c"
          icon={<MaterialIcon icon="note_add" />}
          marginLeft={2}
          onClick={async () => {
            setUri("");
            setName("");
            setIsOpen(!isOpen);
          }}
        />
      </PopoverTrigger>
      <PopoverContent>
        <PopoverArrow />
        <PopoverHeader fontWeight={600}>Create new chart</PopoverHeader>
        <PopoverBody>
          <>
            <FormLabel paddingTop={1}>Chart URI</FormLabel>
            <Input
              pr="4.5rem"
              type={"text"}
              placeholder="uri of the chart"
              value={uri}
              isRequired
              onChange={(e) => setUri(e.target.value)}
            />
            <FormLabel paddingTop={2}>Chart Name</FormLabel>
            <Input
              pr="4.5rem"
              type={"text"}
              placeholder="name of the chart"
              value={name}
              isRequired
              onChange={(e) => setName(e.target.value)}
            />
            <Button
              isDisabled={!uri || !name}
              marginTop={4}
              colorScheme="yellow"
              size="sm"
              onClick={async () => {
                setUri("");
                setName("");
                setIsOpen(false);
                await saveChart(uri, {
                  uri,
                  name,
                  flows: ``.trim(),
                  prompts: ``.trim(),
                  datasets: ``.trim(),
                  functions: ``.trim(),
                });
                window.location.hash = `#/${uri}`;
              }}
            >
              Create
            </Button>
          </>
        </PopoverBody>
      </PopoverContent>
    </Popover>
  );
};
