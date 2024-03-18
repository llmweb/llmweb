import {
  Card,
  CardBody,
  Heading,
  Textarea,
  Grid,
  GridItem,
  IconButton,
  Box,
  Avatar,
  Flex,
} from "@chakra-ui/react";
import { ArrowUpIcon } from "@chakra-ui/icons";
import {
  CATEGORY_SANDBOX,
  EVENT_COPILOT_QUERY,
  EVENT_COPILOT_UPDATE,
} from "../const";
import { useCopilot } from "../components";
import { useCallback, useEffect, useRef, useState } from "react";
import { eventBus } from "../libs/EventBus";
import { marked } from "marked";
import "github-markdown-css/github-markdown-light.css";
import { useHotkeys } from "react-hotkeys-hook";

const CATEGORY = CATEGORY_SANDBOX;
const MAX_MESSAGE_HEIGHT = 250;

function smoothScrollToBottom(element, duration) {
  const start = element.scrollTop;
  // Calculate the maximum scrollable position for the element
  const target = element.scrollHeight - element.clientHeight;
  const change = target - start;
  const startTime = performance.now();

  function animateScroll(timestamp) {
    var timeElapsed = timestamp - startTime;
    var progress = timeElapsed / duration;
    progress = Math.min(progress, 1); // Ensure progress doesn't exceed 1

    element.scrollTop = start + change * progress;

    if (timeElapsed < duration) {
      requestAnimationFrame(animateScroll);
    }
  }

  requestAnimationFrame(animateScroll);
}

export const ChatView = () => {
  const { setCategory } = useCopilot();
  const [conversations, setConversations] = useState([
    {
      role: "Assistant",
      message:
        "This is a test chat so assuming you know the scope, ask your need to proceed.",
    },
  ]);
  const [loading, setLoading] = useState(false);
  const conversationDomRef = useRef(null);
  const [message, setMessage] = useState("");
  const [messageStyle, setMessageStyle] = useState({
    height: "60px",
    overflow: "hidden",
  });

  const sendMessage = useCallback((message) => {
    setMessage("");
    setLoading(true);
    setConversations((prev) => [
      ...prev,
      {
        role: "User",
        message,
      },
    ]);
    eventBus.publish(EVENT_COPILOT_QUERY, {
      category: CATEGORY,
      query: message,
    });
    setTimeout(() => {
      if (conversationDomRef.current) {
        smoothScrollToBottom(conversationDomRef.current, 300);
      }
    }, 50);
  }, []);

  const autoGrowth = (event) => {
    let textAreaElement = event.target;
    textAreaElement.style.minHeight = "unset";
    textAreaElement.style.height = "auto"; // Reset height - allows it to shrink if text is deleted

    const scrollHeight = Math.min(
      textAreaElement.scrollHeight,
      MAX_MESSAGE_HEIGHT
    );
    setMessageStyle({
      overflow: "hidden",
      height: `${scrollHeight}px`,
    });
  };

  useHotkeys("mod+enter,ctrl+enter", () => sendMessage(message), {
    enableOnFormTags: ["TEXTAREA"],
  });

  useEffect(() => {
    setCategory(CATEGORY);
    const subs = eventBus.subscribe(
      EVENT_COPILOT_UPDATE,
      ({ category, response }) => {
        if (category === CATEGORY) {
          setLoading(false);
          setConversations((prev) => [
            ...prev,
            {
              role: "Assistant",
              message:
                response.outputs?.message ||
                `
- No message attribute in output, will just stringify the output.
\`\`\`json
${JSON.stringify(response.outputs, null, 2)}
\`\`\`
                `,
            },
          ]);

          setTimeout(() => {
            if (conversationDomRef.current) {
              smoothScrollToBottom(conversationDomRef.current, 300);
            }
          }, 50);
        }
      }
    );

    return () => {
      eventBus.unsubscribe(EVENT_COPILOT_UPDATE, subs);
      setCategory("");
    };
  }, []);

  return (
    <Grid
      style={{ height: "100%" }}
      templateAreas={`"main" "footer"`}
      gridTemplateRows={`auto ${messageStyle.height}`}
      fontWeight={"normal"}
      gap="1"
    >
      <GridItem
        pl="2"
        area={"main"}
        style={{
          overflowY: "scroll",
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
        ref={conversationDomRef}
      >
        {conversations.map((conversation, index) => {
          return (
            <Card
              key={index}
              style={{
                marginLeft: 20,
                marginRight: 20,
                marginBottom: 10,
              }}
              variant={conversation.role === "User" ? "outline" : "filled"}
            >
              <CardBody width="100%">
                <Flex
                  flex="2"
                  gap="2"
                  paddingBottom={2}
                  alignItems="center"
                  flexWrap="wrap"
                >
                  <Avatar
                    name={conversation.role}
                    size={"sm"}
                    /*src="https://bit.ly/sage-adebayo"*/
                  />
                  <Heading size="md">{conversation.role}</Heading>
                </Flex>
                <div
                  className="markdown-body"
                  dangerouslySetInnerHTML={{
                    __html: marked.parse(conversation.message),
                  }}
                />
              </CardBody>
              {/** 
            <CardFooter
              justify="space-between"
              flexWrap="wrap"
              sx={{
                "& > button": {
                  minW: "136px",
                },
              }}
            >
              <Button flex="1" variant="ghost">
                Like
              </Button>
            </CardFooter>
            */}
            </Card>
          );
        })}
      </GridItem>
      <GridItem pl="2" area={"footer"} paddingLeft={0}>
        <Box
          style={{
            width: "100%",
            position: "absolute",
            paddingLeft: "25px",
            paddingRight: "20px",
            bottom: "10px",
            height: messageStyle.height,
          }}
        >
          <Textarea
            style={{
              resize: "none",
              paddingRight: "55px",
              minHeight: messageStyle.height,
              ...messageStyle,
            }}
            isReadOnly={loading}
            value={message}
            placeholder="Type input here, press Ctrl+Enter or click the button to send."
            onChange={(e) => {
              setMessage(e.target.value);
              autoGrowth(e);
            }}
            zIndex={100}
          />
          <IconButton
            style={{
              position: "absolute",
              right: "30px",
              bottom: "10px",
              zIndex: 200,
              cursor: "pointer",
            }}
            size={"md"}
            aria-label="Send"
            isLoading={loading}
            onClick={() => sendMessage(message)}
            icon={<ArrowUpIcon />}
          />
        </Box>
      </GridItem>
    </Grid>
  );
};
