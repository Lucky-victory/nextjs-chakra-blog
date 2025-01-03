import { useFeaturedPost } from "@/src/hooks/useFeaturedPost";
import {
  formatPostPermalink,
  nativeFormatDate,
  objectToQueryParams,
  stripHtml,
} from "@/src/utils";
import {
  Avatar,
  Box,
  Grid,
  Heading,
  HStack,
  Image,
  LinkBox,
  LinkOverlay,
  Stack,
  Tag,
  Text,
  useColorModeValue,
  VStack,
  Skeleton,
} from "@chakra-ui/react";
import { decode } from "html-entities";

export default function FeaturedPostCard() {
  const { featuredPost, loading } = useFeaturedPost();
  const cardBgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.300", "gray.700");
  const textColor = useColorModeValue("white", "white");

  return (
    <Box
      mt={2}
      bg={cardBgColor}
      rounded="3xl"
      overflow={"hidden"}
      borderWidth={2}
      borderColor={borderColor}
      transition="all 0.2s"
      pos={"relative"}
      h={{ base: "auto", md: 500, lg: 630 }}
      minH={450}
    >
      {loading ? (
        <Stack
          h={"full"}
          minH={450}
          spacing={4}
          px={{ base: 3, sm: 6, lg: 8 }}
          py={{ base: 3, sm: 6 }}
        >
          <Skeleton height="350px" rounded={"xl"} />
          <Skeleton height="20px" width="100px" rounded={"xl"} />
          <Skeleton height="35px" rounded={"xl"} />
          <Skeleton height="80px" rounded={"xl"} />
        </Stack>
      ) : (
        featuredPost && (
          <>
            <Box position="absolute" h={"full"} w={"full"}>
              <Image
                w={"full"}
                h={"full"}
                objectFit={"cover"}
                src={
                  featuredPost?.featured_image?.url ||
                  `/api/og?${objectToQueryParams({
                    title: featuredPost.title,
                    date: featuredPost?.published_at
                      ? featuredPost?.published_at
                      : featuredPost?.created_at,

                    category: featuredPost?.category?.name,
                  })}`
                }
                alt={featuredPost?.featured_image?.alt_text || ""}
              />
            </Box>
            <Stack
              justify={"flex-end"}
              pos={"relative"}
              h={"full"}
              minH={450}
              backgroundImage={
                featuredPost?.featured_image?.url
                  ? "linear-gradient(130deg, transparent, rgba(0, 0, 0, 1))"
                  : ""
              }
            >
              <VStack
                align="start"
                spacing={4}
                px={{ base: 3, sm: 6, lg: 8 }}
                py={{ base: 3, sm: 6, lg: 8 }}
                justify="space-between"
              >
                <VStack align="start" maxW={900}>
                  <Box>
                    <Text color={textColor} fontWeight={500} fontSize={"large"}>
                      Featured
                    </Text>
                  </Box>
                  <LinkOverlay href={formatPostPermalink(featuredPost)}>
                    <Heading color={"white"} size="2xl" mb={4}>
                      {featuredPost.title}
                    </Heading>
                  </LinkOverlay>
                  <Text color={textColor} fontSize="lg" noOfLines={3}>
                    {featuredPost.summary ||
                      stripHtml(decode(featuredPost.content))}
                  </Text>
                </VStack>
              </VStack>
            </Stack>
          </>
        )
      )}
    </Box>
  );
}
