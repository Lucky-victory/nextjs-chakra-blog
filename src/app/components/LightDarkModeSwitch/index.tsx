import {
  Button,
  ButtonGroup,
  HStack,
  IconButton,
  LightMode,
  Text,
  useColorMode,
  useColorModeValue,
} from "@chakra-ui/react";
import { LuMoon, LuSun } from "react-icons/lu";

export const LightDarkModeSwitch = ({ showLabel }: { showLabel?: boolean }) => {
  const { colorMode, toggleColorMode, setColorMode } = useColorMode();

  const hoverBgColor = useColorModeValue("gray.100", "gray.700");
  return (
    <HStack ml={"2px"}>
      {!showLabel && (
        <IconButton
          aria-label="Toggle color mode"
          colorScheme="gray"
          icon={
            colorMode === "light" ? <LuMoon size={20} /> : <LuSun size={20} />
          }
          onClick={toggleColorMode}
          variant="ghost"
          _hover={{ bg: hoverBgColor }}
          rounded={"full"}
        />
      )}
      {showLabel && (
        <ButtonGroup size={"sm"} rounded={"full"}>
          <Button
            colorScheme={colorMode === "light" ? "blue" : "gray"}
            fontWeight={400}
            leftIcon={<LuSun size={16} />}
            onClick={() => setColorMode("light")}
            variant={colorMode === "light" ? "solid" : "ghost"}
            rounded={"full"}
          >
            {" "}
            <Text as="span">Light</Text>{" "}
          </Button>

          <Button
            colorScheme={colorMode === "dark" ? "blue" : "gray"}
            fontWeight={400}
            leftIcon={<LuMoon size={16} />}
            onClick={() => setColorMode("dark")}
            variant={colorMode === "dark" ? "solid" : "ghost"}
            rounded={"full"}
          >
            {" "}
            <Text as="span">Dark</Text>{" "}
          </Button>
        </ButtonGroup>
      )}
    </HStack>
  );
};