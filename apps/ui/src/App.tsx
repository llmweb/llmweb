import { useState, useEffect } from "react";
import Page from "./Page";
import { ChakraProvider } from "@chakra-ui/react";
import { CopilotProvider } from "./components";
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  typography: {
    fontFamily: '-apple-system,BlinkMacSystemFont,Segoe UI,Noto Sans,Helvetica,Arial,sans-serif,"Apple Color Emoji","Segoe UI Emoji"',
  },
});

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
    <ThemeProvider theme={theme}>
      <ChakraProvider>
        <CopilotProvider>
          <Page flowChartUri={currentPath.replace(/^#\/?/, "")} />
        </CopilotProvider>
      </ChakraProvider>
    </ThemeProvider>

  );
}
