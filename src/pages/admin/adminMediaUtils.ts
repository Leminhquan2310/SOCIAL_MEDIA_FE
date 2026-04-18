/**
 * Admin-specific media utilities.
 */

import { MediaType } from "../../../types";

/**
 * Generates a static thumbnail URL for a Cloudinary video.
 * If the URL is not a Cloudinary URL, it returns the original URL.
 */
export const getAdminMediaThumbnail = (url: string, type: MediaType): string => {
  if (type === MediaType.IMAGE) return url;
  
  if (url && url.includes("res.cloudinary.com")) {
    // Transform .mp4/m3u8 to .jpg at start offset 0
    // Example: .../upload/v123/video.mp4 -> .../upload/so_0/v123/video.jpg
    return url
      .replace("/upload/", "/upload/so_0,w_400,c_limit/")
      .replace(/\.(mp4|m3u8|webm|mov)$/, ".jpg");
  }
  
  return url;
};
