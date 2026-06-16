import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const products = defineCollection({
  loader: glob({
    pattern: "**/*.md",
    base: "./src/content/products"
  }),
  schema: z.any()
});

const blog = defineCollection({
  loader: glob({
    pattern: "**/*.md",
    base: "./src/content/blog"
  }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    publishDate: z.coerce.date(),
    category: z.string(),
    featuredImage: z.string(),
    featured: z.boolean().optional()
  })
});


export const collections = {
  products,
  blog
};