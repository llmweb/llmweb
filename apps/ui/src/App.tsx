import { useState, useEffect } from "react";
import Page from "./Page";
import { ChakraProvider } from "@chakra-ui/react";
import { CopilotProvider } from "./components";

export default function App() {
  const [currentPath, setCurrentPath] = useState(window.location.hash);

  useEffect(() => {
    const onHashChange = () => {
      setCurrentPath(window.location.hash);
    };

    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  return (
    <ChakraProvider>
      <CopilotProvider>
        <Page flowChartUri={currentPath.replace(/^#\/?/, "")} />
      </CopilotProvider>
    </ChakraProvider>
  );
}
