"use client";

import React, { useRef, useState } from "react";
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  Input,
  InputGroup,
  InputRightElement,
  IconButton,
  SimpleGrid,
  Select,
  useColorModeValue,
  Skeleton,
  Spinner,
} from "@chakra-ui/react";
import { LuSearch } from "react-icons/lu";
import { useQueryParams } from "@/src/hooks";
import { useSearchResults } from "@/src/hooks/usePostsSearch";
import PostCard from "../../../../themes/smooth-land/PostCard";
import { useCallback } from "react";
import debounce from "lodash/debounce";
import { useCategories } from "@/src/hooks/useCategories";
import NewPostCard from "../../../../themes/raised-land/NewPostCard";
import { PostCardLoader } from "@/src/themes/smooth-land/PostCardLoader";

const SearchResults = () => {
  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const textColor = useColorModeValue("gray.700", "gray.200");
  const mutedColor = useColorModeValue("gray.600", "gray.400");
  const { data: categories } = useCategories({});
  const categoriesResults = categories?.results || [];

  const { queryParams, setQueryParam } = useQueryParams<{
    q: string;
    category?: string;
    sortBy?: "relevant" | "recent" | "popular";
    page?: number;
  }>();

  const filtersDebounce = useRef(
    debounce((queryParams: any) => {
      return queryParams;
    }, 400)
  ).current;

  const debouncedQueryParams = filtersDebounce(queryParams) as {
    q: string;
    category?: string;
    sortBy?: "relevant" | "recent" | "popular";
    page?: number;
  };
  const { data, isLoading } = useSearchResults({
    queryParams: debouncedQueryParams,
  });
  const searchResults = data?.results || [];
  const totalResult = data?.meta?.total;

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQueryParam("q", e.target.value);
  };

  const handleCategorySelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setQueryParam("category", e.target.value);
  };
  const handleSortSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setQueryParam("sortBy", e.target.value);
  };
  return (
    <Box
      // bg={useColorModeValue("gray.50", "gray.900")}
      minH="calc(100vh - 180px)"
    >
      <Container maxW="7xl" py={8}>
        {/* Search Header */}
        <VStack spacing={6} mb={8}>
          <Heading size="lg" color={textColor}>
            Search Results
          </Heading>
          <InputGroup size="lg" maxW="600px">
            <Input
              placeholder="Search articles..."
              rounded={"full"}
              bg={bgColor}
              borderColor={borderColor}
              onChange={handleSearch}
              value={queryParams?.q || ""}
              _hover={{
                borderColor: useColorModeValue("blue.500", "blue.300"),
              }}
            />
            <InputRightElement>
              <IconButton
                aria-label="Search"
                icon={isLoading ? <Spinner size="sm" /> : <LuSearch />}
                variant="ghost"
              />
            </InputRightElement>
          </InputGroup>
        </VStack>

        {/* Filters */}
        <HStack spacing={4} mb={8} wrap="wrap" justify={"center"} mx="auto">
          <Select
            placeholder="Category"
            rounded={"md"}
            maxW="200px"
            bg={bgColor}
            borderColor={borderColor}
            onChange={handleCategorySelect}
          >
            {categoriesResults?.length > 0 &&
              categoriesResults?.map((category) => (
                <option
                  key={category?.id}
                  value={category?.id}
                  data-slug={category?.slug}
                >
                  {category?.name}
                </option>
              ))}
          </Select>
          <Select
            onChange={handleSortSelect}
            placeholder="Sort by"
            rounded={"md"}
            maxW="200px"
            bg={bgColor}
            borderColor={borderColor}
          >
            <option value="relevant">Most Relevant</option>
            <option value="recent">Most Recent</option>
            <option value="popular">Most Popular</option>
          </Select>
        </HStack>

        {/* Results Count */}
        <Box>
          {searchResults?.length > 0 && (
            <Text color={mutedColor} mb={6}>
              Showing {totalResult} results for{" "}
              <Text as="span" fontWeight={500}>
                &quot;{queryParams?.q}
                &quot;
              </Text>
            </Text>
          )}
        </Box>

        {/* Results Grid */}
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
          {!isLoading &&
            searchResults?.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          {isLoading && [...Array(5)].map((_, i) => <PostCardLoader key={i} />)}
        </SimpleGrid>
      </Container>
    </Box>
  );
};

export default SearchResults;
