"use client";
import { usePathname, useSearchParams } from "next/navigation";
import { FormikContextType, FormikErrors, useFormik } from "formik";
import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { PostInsert, PostSelect, UserSelect } from "@/src/types";
import TurndownService from "turndown";
import { useMutation, useQuery } from "@tanstack/react-query";
import debounce from "lodash/debounce";
import { objectToQueryParams } from "../utils";
import axios from "axios";

export type SaveableValue = string | Record<string, any>;

export interface UseAutoSaveOptions<T extends SaveableValue> {
  initialValue: T;
  mutationFn: (value: T) => Promise<any>;
  debounceTime?: number;
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
}

export const useAutoSave = <T extends SaveableValue>({
  initialValue,
  mutationFn,
  debounceTime = 1000,
  onSuccess,
  onError,
}: UseAutoSaveOptions<T>) => {
  const [value, setValue] = useState<T>(initialValue);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  const mutation = useMutation({
    mutationFn,
    onSuccess: (data) => {
      setLastSaved(new Date());
      setValue((prevValue) => ({ ...(prevValue as object), ...data }));
      onSuccess?.(data);
    },
    onError: (error, variables) => {
      setValue(variables); // Revert to the last known good state
      onError?.(error);
    },
  });

  const debouncedSave = useCallback(
    debounce((newValue: T) => {
      mutation.mutate(newValue);
    }, debounceTime),
    [mutation, debounceTime]
  );

  useEffect(() => {
    if (isInitialized) {
      debouncedSave(value);
    } else {
      setIsInitialized(true);
    }
  }, [value, debouncedSave, isInitialized]);

  return {
    value,
    isSaving: mutation.isPending,
    error: mutation.error,
    lastSaved,
  };
};

export function useHTMLToMarkdownConverter() {
  const [html, setHtml] = useState("");
  const [markdown, setMarkdown] = useState("");
  const turndownService = useMemo(() => new TurndownService(), []);

  // Add rules to handle specific HTML elements or attributes
  useEffect(() => {
    turndownService.addRule("heading", {
      filter: ["h1", "h2", "h3", "h4", "h5", "h6"],
      replacement: function (content, node, options) {
        const hLevel = +node.nodeName.charAt(1);
        const hPrefix = "#".repeat(hLevel);
        return `\n${hPrefix} ${content}\n`;
      },
    });

    turndownService.addRule("paragraph", {
      filter: "p",
      replacement: function (content) {
        return `\n${content}\n`;
      },
    });
  }, [turndownService]);

  useEffect(() => {
    if (html) {
      setMarkdown(turndownService.turndown(html));
    }
  }, [html, turndownService]);

  const updateHtml = useCallback(
    (newHtml: string) => {
      setHtml(newHtml);
      return turndownService.turndown(newHtml);
    },
    [turndownService]
  );

  return { markdown, updateHtml };
}

interface UsePostsProps {
  status?: PostInsert["status"] | "all";
  limit?: number;
  page?: number;
  access?: "dashboard";
  sortBy?: "created_at" | "published_at" | "recent" | "popular";
  sortOrder?: "desc" | "asc";
  category?: string;
}
export function usePosts({
  status = "published",
  limit = 10,
  page = 1,
  sortBy,
  access,
  sortOrder,
  category,
}: UsePostsProps = {}) {
  const [params, setParams] = useState({
    status,
    limit,
    page,
    sortBy,
    access,
    sortOrder,
    category,
  });
  const {
    data: posts,
    isLoading: loading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["posts", params],
    queryFn: async () => {
      const { data } = await axios.get<{ data: PostSelect[] }>(
        `/api/posts?${objectToQueryParams(params)}`
      );
      return data.data;
    },
  });

  const refetchPosts = async () => {
    await refetch();
  };
  const updateParams = useCallback((prop: UsePostsProps) => {
    setParams((prev) => ({ ...prev, ...prop }));
  }, []);
  return { posts, loading, error, refetchPosts, updateParams };
}
export function useAuthor(username: string) {
  const {
    data: author,
    isLoading: loading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["AUTHOR", username],
    queryFn: async () => {
      const { data } = await axios.get<{ data: UserSelect }>(
        `/api/authors/${username}`
      );
      return data.data;
    },
    staleTime: 1000 * 60 * 30,
  });

  return { author, loading, isError, error, refetch };
}
export function useAuthorPosts({
  status = "published",
  username,
  limit = 10,
  page = 1,
}: {
  status?: PostInsert["status"] | "all";
  limit?: number;
  page?: number;
  username: string;
}) {
  const {
    data: posts,
    isLoading: loading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["POSTS", status, limit, page, username],
    queryFn: async () => {
      const { data } = await axios.get<{ data: PostSelect[] }>(
        `/api/authors/${username}/posts?${objectToQueryParams({
          status,
          limit,
          page,
        })}`
      );
      return data.data;
    },
    staleTime: 1000 * 60 * 30,
  });

  const refetchPosts = async () => {
    await refetch();
  };

  return { posts, loading, error, refetchPosts };
}

export function usePost(slug: string) {
  const {
    data: post,
    isLoading: loading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["POST", slug],
    queryFn: async () => {
      const { data } = await axios.get<{ data: PostSelect }>(
        `/api/posts/${slug}`
      );
      return data.data;
    },
    staleTime: 1000 * 60 * 30,
  });

  const refetchPost = async () => {
    await refetch();
  };

  return { post, loading, error, refetchPost };
}

type QueryParamValue = string | number | boolean | null;

interface QueryParams {
  [key: string]: QueryParamValue;
}

export function useQueryParams<T extends QueryParams>() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [queryParamsValues, setQueryParamsValues] = useState<T>({} as T);

  // Parse search params into an object
  useEffect(() => {
    const params: QueryParams = {};
    searchParams.forEach((value, key) => {
      params[key] = value;
    });
    setQueryParamsValues(params as T);
  }, [searchParams]);

  // Update a single query parameter
  const setQueryParam = useCallback(
    (key: keyof T, value: QueryParamValue) => {
      const updatedParams = new URLSearchParams(searchParams.toString());

      if (value === null || value === "") {
        updatedParams.delete(key as string);
      } else {
        updatedParams.set(key as string, value.toString());
      }

      router.push(`${pathname}?${updatedParams.toString()}`);
    },
    [pathname, router, searchParams]
  );

  // Update multiple query parameters at once
  const setQueryParams = useCallback(
    (newParams: Partial<T>) => {
      const updatedParams = new URLSearchParams(searchParams.toString());

      Object.entries(newParams).forEach(([key, value]) => {
        if (value === null || value === "") {
          updatedParams.delete(key);
        } else {
          updatedParams.set(key, value.toString());
        }
      });

      router.push(`${pathname}?${updatedParams.toString()}`);
    },
    [pathname, router, searchParams]
  );

  // Clear all query parameters
  const clearQueryParams = useCallback(() => {
    router.push(pathname);
  }, [pathname, router]);

  return {
    queryParams: queryParamsValues,
    setQueryParam,
    setQueryParams,
    clearQueryParams,
  };
}
