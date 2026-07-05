import { config, collection, fields } from '@keystatic/core';

export default config({
	ui: {
		brand: { name: 'Ankerd' },
	},

	storage: import.meta.env.PROD
		? {
				kind: 'github',
				repo: {
					// TODO: replace with your GitHub username and repo name
					owner: 'YOUR_GITHUB_USERNAME',
					name: 'YOUR_REPO_NAME',
				},
			}
		: { kind: 'local' },

	collections: {
		blog: collection({
			label: 'Blog Posts',
			slugField: 'title',
			path: 'src/content/blog/*',
			format: { contentField: 'content' },
			schema: {
				title: fields.slug({ name: { label: 'Title' } }),
				description: fields.text({
					label: 'Description',
					multiline: true,
					validation: { isRequired: true },
				}),
				pubDate: fields.date({
					label: 'Publish Date',
					validation: { isRequired: true },
				}),
				updatedDate: fields.date({ label: 'Updated Date' }),
				heroImage: fields.image({
					label: 'Hero Image',
					directory: 'src/assets',
					publicPath: '../../assets/',
				}),
				content: fields.mdx({ label: 'Content' }),
			},
		}),

		gallery: collection({
			label: 'Gallery',
			slugField: 'title',
			path: 'src/content/gallery/*',
			format: { contentField: 'caption' },
			schema: {
				title: fields.slug({ name: { label: 'Title' } }),
				description: fields.text({ label: 'Description', multiline: true }),
				date: fields.date({
					label: 'Date',
					validation: { isRequired: true },
				}),
				photo: fields.image({
					label: 'Photo',
					directory: 'src/assets/gallery',
					publicPath: '../../assets/gallery/',
				}),
				alt: fields.text({ label: 'Alt Text' }),
				camera: fields.text({ label: 'Camera' }),
				lens: fields.text({ label: 'Lens' }),
				settings: fields.text({
					label: 'Exposure Settings',
					description: 'e.g. f/2.8 · 1/250s · ISO 400',
				}),
				caption: fields.markdoc({ label: 'Caption' }),
			},
		}),
	},
});
