import { YOUTUBE_CHANNEL_ID } from '../consts';

export interface Video {
	id: string;
	title: string;
	publishedAt: Date;
	thumbnail: string;
	url: string;
}

interface Thumbnail {
	url: string;
}

interface PlaylistItem {
	snippet?: {
		title?: string;
		publishedAt?: string;
		resourceId?: { videoId?: string };
		thumbnails?: Partial<
			Record<'maxres' | 'standard' | 'high' | 'medium' | 'default', Thumbnail>
		>;
	};
}

const API_BASE = 'https://www.googleapis.com/youtube/v3';

/**
 * Fetches the channel's most recent uploads at build time via the
 * uploads playlist (2 quota units total, vs 100 for search.list).
 * Returns null when the API key / channel ID are missing or any request
 * fails — the build must never break because of this.
 */
export async function getRecentVideos(limit = 12): Promise<Video[] | null> {
	const apiKey = import.meta.env.YOUTUBE_API_KEY;
	if (!apiKey || !YOUTUBE_CHANNEL_ID) {
		console.warn(
			'[youtube] Skipping video fetch — set YOUTUBE_API_KEY in .env and YOUTUBE_CHANNEL_ID in src/consts.ts.',
		);
		return null;
	}

	try {
		const channelRes = await fetch(
			`${API_BASE}/channels?part=contentDetails&id=${YOUTUBE_CHANNEL_ID}&key=${apiKey}`,
		);
		if (!channelRes.ok) {
			throw new Error(`channels.list failed (${channelRes.status}): ${await channelRes.text()}`);
		}
		const channelData = await channelRes.json();
		const uploadsPlaylistId: string | undefined =
			channelData.items?.[0]?.contentDetails?.relatedPlaylists?.uploads;
		if (!uploadsPlaylistId) {
			throw new Error(`No uploads playlist found for channel ${YOUTUBE_CHANNEL_ID}`);
		}

		const itemsRes = await fetch(
			`${API_BASE}/playlistItems?part=snippet&playlistId=${uploadsPlaylistId}&maxResults=${limit}&key=${apiKey}`,
		);
		if (!itemsRes.ok) {
			throw new Error(`playlistItems.list failed (${itemsRes.status}): ${await itemsRes.text()}`);
		}
		const itemsData: { items?: PlaylistItem[] } = await itemsRes.json();

		return (itemsData.items ?? [])
			.filter(
				(item) =>
					item.snippet?.resourceId?.videoId &&
					item.snippet.title !== 'Private video' &&
					item.snippet.title !== 'Deleted video',
			)
			.map((item) => {
				const snippet = item.snippet!;
				const videoId = snippet.resourceId!.videoId!;
				const thumbnails = snippet.thumbnails ?? {};
				const thumbnail =
					thumbnails.maxres ?? thumbnails.standard ?? thumbnails.high ?? thumbnails.medium ?? thumbnails.default;
				return {
					id: videoId,
					title: snippet.title ?? '',
					publishedAt: new Date(snippet.publishedAt ?? 0),
					thumbnail: thumbnail?.url ?? '',
					url: `https://www.youtube.com/watch?v=${videoId}`,
				};
			});
	} catch (error) {
		console.warn('[youtube] Failed to fetch videos:', error);
		return null;
	}
}
