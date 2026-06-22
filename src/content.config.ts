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
    featured: z.boolean().optional(),
    

     // ✅ V2.5新增：Summary
    summary: z.array(
        z.union([
            z.string(), 
            z.object({
              text: z.string(),
              anchor: z.string().optional()
            })
          ])
        ).optional(),

    // ✅ V2.5新增：FAQ
    faq: z.array(
      z.object({
        question: z.string(),
        answer: z.string()
      })
     ).optional(),

    // ✅ V2.5新增：Related Resources
    relatedResources: z.array(
      z.object({
        title: z.string(),
        url: z.string()
      })
    ).optional(),
  })
});


export const collections = {
  products,
  blog
};