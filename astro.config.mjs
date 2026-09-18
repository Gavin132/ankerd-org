// @ts-check

import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import react from '@astrojs/react';
import keystatic from '@keystatic/astro';
import cloudflare from '@astrojs/cloudflare';
import icon from 'astro-icon';
import { defineConfig, fontProviders } from 'astro/config';

// Only use the Cloudflare adapter during production builds (CF_PAGES=1 is set by Cloudflare Pages).
// In dev, Astro handles SSR natively in Node.js, which is needed for Keystatic.
const isCloudflarePages = Boolean(process.env.CF_PAGES);

// Keystatic's admin UI needs a server, so it is left out of the static GitHub Pages build.
const isGitHubPages = Boolean(process.env.GITHUB_ACTIONS);

// https://astro.build/config
export default defineConfig({
	site: 'https://ankerd.nl',
	...(isCloudflarePages && { adapter: cloudflare() }),
	integrations: [mdx(), sitemap(), react(), ...(isGitHubPages ? [] : [keystatic()]), icon()],
	image: {
		remotePatterns: [{ hostname: 'i.ytimg.com' }],
	},
	fonts: [
		{
			provider: fontProviders.fontsource(),
			name: 'Poppins',
			cssVariable: '--font-poppins',
			weights: [400, 600, 700],
			styles: ['normal'],
			fallbacks: ['sans-serif'],
		},
	],
});
