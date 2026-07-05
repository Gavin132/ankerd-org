import { config, collection, fields, component } from "@keystatic/core";
import React from "react";

export default config({
  ui: {
    brand: { name: "Ankerd" },
  },

  storage: import.meta.env.PROD
    ? {
        kind: "github",
        // TODO: replace with your GitHub username and repo name
        repo: "RazerGhost/ankerd-org",
      }
    : { kind: "local" },

  collections: {
    blog: collection({
      label: "Blog Posts",
      slugField: "title",
      path: "src/content/blog/*",
      format: { contentField: "content" },
      schema: {
        title: fields.slug({ name: { label: "Title" } }),
        description: fields.text({
          label: "Description",
          multiline: true,
          validation: { isRequired: true },
        }),
        pubDate: fields.date({
          label: "Publish Date",
          validation: { isRequired: true },
        }),
        updatedDate: fields.date({ label: "Updated Date" }),
        heroImage: fields.image({
          label: "Hero Image",
          directory: "src/assets",
          publicPath: "../../assets/",
        }),
        content: fields.mdx({
          label: "Content",
          components: {
            Callout: component({
              label: "Callout",
              description: "Highlighted info, tip, warning, or danger box",
              schema: {
                type: fields.select({
                  label: "Type",
                  options: [
                    { label: "Info", value: "info" },
                    { label: "Tip", value: "tip" },
                    { label: "Warning", value: "warning" },
                    { label: "Danger", value: "danger" },
                  ],
                  defaultValue: "info",
                }),
                title: fields.text({ label: "Title", description: "Optional custom title" }),
              },
              contentEditingConfig: { kind: "block", icon: "📢", label: "Callout" },
              preview: ({ fields, children }) =>
                React.createElement("div", {
                  style: {
                    borderLeft: "4px solid #3b82f6",
                    background: "#eff6ff",
                    padding: "0.75rem 1rem",
                    borderRadius: "0 6px 6px 0",
                    margin: "0.5rem 0",
                  },
                },
                  React.createElement("strong", null, fields.title.value || fields.type.value),
                  React.createElement("div", null, children),
                ),
            }),
            YouTube: component({
              label: "YouTube",
              description: "Embed a YouTube video",
              schema: {
                id: fields.text({ label: "Video ID", description: "The part after ?v= in the YouTube URL" }),
                title: fields.text({ label: "Title", description: "Accessible title for the embed" }),
              },
              preview: ({ fields }) =>
                React.createElement("div", {
                  style: {
                    background: "#000",
                    borderRadius: "8px",
                    padding: "2rem",
                    color: "#fff",
                    textAlign: "center",
                  },
                }, "▶ YouTube: " + (fields.id.value || "paste video ID")),
            }),
            ImageCaption: component({
              label: "Image with Caption",
              description: "An image with an optional caption below",
              schema: {
                src: fields.text({ label: "Image URL" }),
                alt: fields.text({ label: "Alt Text" }),
                caption: fields.text({ label: "Caption", description: "Optional caption text" }),
              },
              preview: ({ fields }) =>
                React.createElement("figure", { style: { textAlign: "center", margin: "0.5rem 0" } },
                  fields.src.value
                    ? React.createElement("img", { src: fields.src.value, alt: fields.alt.value, style: { maxWidth: "100%", borderRadius: "6px" } })
                    : React.createElement("div", { style: { background: "#e5e7eb", padding: "2rem", borderRadius: "6px" } }, "No image URL set"),
                  fields.caption.value
                    ? React.createElement("figcaption", { style: { color: "#6b7280", fontSize: "0.875rem", fontStyle: "italic", marginTop: "0.25rem" } }, fields.caption.value)
                    : null,
                ),
            }),
          },
        }),
      },
    }),

    gallery: collection({
      label: "Gallery",
      slugField: "title",
      path: "src/content/gallery/*",
      format: { contentField: "caption" },
      schema: {
        title: fields.slug({ name: { label: "Title" } }),
        description: fields.text({ label: "Description", multiline: true }),
        date: fields.date({
          label: "Date",
          validation: { isRequired: true },
        }),
        photo: fields.image({
          label: "Photo",
          directory: "src/assets/gallery",
          publicPath: "../../assets/gallery/",
        }),
        alt: fields.text({ label: "Alt Text" }),
        camera: fields.text({ label: "Camera" }),
        lens: fields.text({ label: "Lens" }),
        settings: fields.text({
          label: "Exposure Settings",
          description: "e.g. f/2.8 · 1/250s · ISO 400",
        }),
        caption: fields.mdx({ label: "Caption", extension: "md" }),
      },
    }),
  },
});
