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

// https://astro.build/config
export default defineConfig({
	// TODO: replace with the real production domain
	site: 'https://ankerd.org',
	...(isCloudflarePages && { adapter: cloudflare() }),
	integrations: [mdx(), sitemap(), react(), keystatic(), icon()],
	image: {
		remotePatterns: [{ hostname: 'i.ytimg.com' }],
	},
	fonts: [
		{
			provider: fontProviders.local(),
			name: 'Atkinson',
			cssVariable: '--font-atkinson',
			fallbacks: ['sans-serif'],
			options: {
				variants: [
					{
						src: ['./src/assets/fonts/atkinson-regular.woff'],
						weight: 400,
						style: 'normal',
						display: 'swap',
					},
					{
						src: ['./src/assets/fonts/atkinson-bold.woff'],
						weight: 700,
						style: 'normal',
						display: 'swap',
					},
				],
			},
		},
	],
});
