/**
 * Generates a thumbnail for a video file at a specific time.
 * @param file The video file.
 * @param seekTime The time in seconds to capture the frame.
 * @returns A promise that resolves to a data URL of the thumbnail.
 */
export const generateVideoThumbnail = (file: File, seekTime: number = 1.0): Promise<string> => {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.playsInline = true;
    video.muted = true;
    
    const videoUrl = URL.createObjectURL(file);
    video.src = videoUrl;

    video.onloadedmetadata = () => {
      // If video duration is shorter than seekTime, seek to 0
      if (video.duration < seekTime) {
        video.currentTime = 0;
      } else {
        video.currentTime = seekTime;
      }
    };

    video.onseeked = () => {
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        try {
          const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
          URL.revokeObjectURL(videoUrl);
          resolve(dataUrl);
        } catch (err) {
          URL.revokeObjectURL(videoUrl);
          reject(err);
        }
      } else {
        URL.revokeObjectURL(videoUrl);
        reject(new Error("Failed to get canvas context"));
      }
    };

    video.onerror = (e) => {
      URL.revokeObjectURL(videoUrl);
      reject(e);
    };
  });
};
