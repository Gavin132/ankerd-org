import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const blog = defineCollection({
	// Load Markdown and MDX files in the `src/content/blog/` directory.
	loader: glob({ base: './src/content/blog', pattern: '**/*.{md,mdx}' }),
	// Type-check frontmatter using a schema
	schema: ({ image }) =>
		z.object({
			title: z.string(),
			description: z.string(),
			// Transform string to Date object
			pubDate: z.coerce.date(),
			updatedDate: z.coerce.date().optional(),
			heroImage: z.optional(image()),
		}),
});

const gallery = defineCollection({
	// One markdown file per photo in `src/content/gallery/`;
	// put the image files in `src/assets/gallery/` and reference them relatively.
	loader: glob({ base: './src/content/gallery', pattern: '**/*.{md,mdx}' }),
	schema: ({ image }) =>
		z.object({
			title: z.string(),
			description: z.string().optional(),
			date: z.coerce.date(),
			photo: image(),
			alt: z.string().default(''),
			camera: z.string().optional(),
			lens: z.string().optional(),
			// Free-form exposure info, e.g. "f/2.8 · 1/250s · ISO 400"
			settings: z.string().optional(),
		}),
});

export const collections = { blog, gallery };
