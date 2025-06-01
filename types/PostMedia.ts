// PostMedia represents the media attached to a post.
export interface PostMedia {
    mediaId: number;      // Unique media ID
    postId: number;       // Associated post (Foreign Key)
    mediaType: string;    // Media type (e.g., image, video, audio)
    mediaUrl: string;     // Media file link
    thumbnailUrl?: string; // Thumbnail (if video)
    orderIndex?: number;  // Order index
    tags?: string[];      // Tags as an array of strings
    altText?: string;     // Alternative text
    width?: number;       // Width
    height?: number;      // Height
    duration?: number;    // Duration (for video/audio, in seconds)
}


