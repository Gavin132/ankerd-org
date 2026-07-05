import { YOUTUBE_CHANNEL_ID } from '../consts';

export interface Video {
	id: string;
	title: string;
	publishedAt: Date;
	thumbnail: string;
	url: string;
	isShort: boolean;
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

function parseDurationSeconds(iso: string): number {
	const m = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
	if (!m) return 0;
	return (parseInt(m[1] ?? '0') * 3600) + (parseInt(m[2] ?? '0') * 60) + parseInt(m[3] ?? '0');
}

/**
 * Fetches ALL channel uploads, then enriches with duration data to identify
 * Shorts (≤60 s). Returns null when the API key / channel ID are missing or
 * any critical request fails — the build must never break because of this.
 */
export async function getRecentVideos(limit?: number): Promise<Video[] | null> {
	const apiKey = import.meta.env.YOUTUBE_API_KEY;
	if (!apiKey || !YOUTUBE_CHANNEL_ID) {
		console.warn(
			'[youtube] Skipping video fetch — set YOUTUBE_API_KEY in .env and YOUTUBE_CHANNEL_ID in src/consts.ts.',
		);
		return null;
	}

	try {
		// 1. Resolve uploads playlist ID
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

		// 2. Page through all playlist items (max 50 per page)
		const rawItems: PlaylistItem[] = [];
		let pageToken: string | undefined;
		do {
			const url = new URL(`${API_BASE}/playlistItems`);
			url.searchParams.set('part', 'snippet');
			url.searchParams.set('playlistId', uploadsPlaylistId);
			url.searchParams.set('maxResults', '50');
			url.searchParams.set('key', apiKey);
			if (pageToken) url.searchParams.set('pageToken', pageToken);

			const res = await fetch(url.toString());
			if (!res.ok) {
				throw new Error(`playlistItems.list failed (${res.status}): ${await res.text()}`);
			}
			const data: { items?: PlaylistItem[]; nextPageToken?: string } = await res.json();
			rawItems.push(...(data.items ?? []));
			pageToken = data.nextPageToken;
		} while (pageToken);

		// 3. Filter private/deleted, extract video IDs
		const validItems = rawItems.filter(
			(item) =>
				item.snippet?.resourceId?.videoId &&
				item.snippet.title !== 'Private video' &&
				item.snippet.title !== 'Deleted video',
		);

		// 4. Batch-fetch durations in chunks of 50 to identify Shorts
		const videoIds = validItems.map((item) => item.snippet!.resourceId!.videoId!);
		const durationMap = new Map<string, number>();
		for (let i = 0; i < videoIds.length; i += 50) {
			const chunk = videoIds.slice(i, i + 50);
			const url = new URL(`${API_BASE}/videos`);
			url.searchParams.set('part', 'contentDetails');
			url.searchParams.set('id', chunk.join(','));
			url.searchParams.set('key', apiKey);

			const res = await fetch(url.toString());
			if (!res.ok) {
				console.warn(`[youtube] videos.list failed for chunk ${i / 50}: ${res.status}`);
				continue;
			}
			const data: { items?: { id: string; contentDetails?: { duration?: string } }[] } =
				await res.json();
			for (const v of data.items ?? []) {
				durationMap.set(v.id, parseDurationSeconds(v.contentDetails?.duration ?? ''));
			}
		}

		// 5. Build Video objects
		let videos = validItems.map((item) => {
			const snippet = item.snippet!;
			const videoId = snippet.resourceId!.videoId!;
			const thumbnails = snippet.thumbnails ?? {};
			const thumbnail =
				thumbnails.maxres ??
				thumbnails.standard ??
				thumbnails.high ??
				thumbnails.medium ??
				thumbnails.default;
			const duration = durationMap.get(videoId) ?? 9999;
			return {
				id: videoId,
				title: snippet.title ?? '',
				publishedAt: new Date(snippet.publishedAt ?? 0),
				thumbnail: thumbnail?.url ?? '',
				url: `https://www.youtube.com/watch?v=${videoId}`,
				isShort: duration <= 60,
			};
		});

		if (limit != null) videos = videos.slice(0, limit);
		return videos;
	} catch (error) {
		console.warn('[youtube] Failed to fetch videos:', error);
		return null;
	}
}
