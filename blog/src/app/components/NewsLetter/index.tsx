import {
  Box,
  VStack,
  Heading,
  Text,
  Flex,
  FormControl,
  Input,
  Button,
} from "@chakra-ui/react";
import { useState } from "react";
import { useColorModeValue } from "@chakra-ui/react";
import { LuSend } from "react-icons/lu";

export const Newsletter = ({ title }: { title?: string }) => {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("");
  const formWrapBgColor = useColorModeValue("white", "black");
  const textColor = useColorModeValue("gray.400", "gray.300");
  const headingColor = useColorModeValue("inherit", "white");
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("success");
    // TODO: #1 Handle newsletter subscription logic here
  };

  return (
    <Box>
      <VStack maxW="2xl" mx="auto" spacing={4}>
        <Heading size="lg" color={headingColor}>
          {title || "Subscribe to Our Newsletter"}
        </Heading>
        <Text color={textColor}>
          Get the latest articles and insights delivered directly to your inbox.
          No spam, unsubscribe at any time.
        </Text>
        <Box
          w={"full"}

          // mb={8}
        >
          <form onSubmit={handleSubmit} style={{ width: "100%" }}>
            <Flex
              direction={{ base: "column", md: "row" }}
              gap={{ base: 4, md: 0 }}
              maxW="lg"
              mx="auto"
            >
              <FormControl flex={1}>
                <Input
                  type="email"
                  rounded={"full"}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                />
              </FormControl>
              <Button
                ml={{ md: -10 }}
                type="submit"
                zIndex={2}
                colorScheme="blue"
                rounded={"full"}
                rightIcon={<LuSend size={16} />}
              >
                Subscribe
              </Button>
            </Flex>
          </form>
        </Box>
        {status === "success" && (
          <Text color="green.500">Thanks for subscribing!</Text>
        )}
      </VStack>
    </Box>
  );
};
