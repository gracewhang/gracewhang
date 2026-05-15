import type { MDXComponents } from "mdx/types";
import { Photo } from "@/components/gallery/Photo";
import { Section } from "@/components/gallery/Section";

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    Photo,
    Section,
    ...components,
  };
}
