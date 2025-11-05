export const getYouTubeVideoId = (url: string): string | null => {
  // Regex for various YouTube URL formats
  const regExp =
    /^.*(?:youtu.be\/|v\/|e\/|u\/\w+\/|embed\/|v=)([^#&?]*).*/;
  const match = url.match(regExp);

  if (match && match[1].length === 11) {
    return match[1];
  }

  // Handle short URLs like youtu.be/VIDEO_ID
  const shortUrlMatch = url.match(/(?:https?:\/\/)?(?:www\.)?youtu\.be\/([a-zA-Z0-9_-]{11})/);
  if (shortUrlMatch && shortUrlMatch[1].length === 11) {
    return shortUrlMatch[1];
  }

  return null;
};