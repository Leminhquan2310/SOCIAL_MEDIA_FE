import React, { useState, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight, Maximize2, Play, Pause, Volume2, VolumeX } from "lucide-react";
import { PostImageDto, MediaType, MediaStatus } from "../../../types";

interface PostCarouselProps {
  media: PostImageDto[];
  onMediaClick?: (url: string) => void;
}

const VideoPlayer: React.FC<{ url: string; isActive: boolean }> = ({ url, isActive }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [volume, setVolume] = useState(1);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const playerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFsChange);
    return () => document.removeEventListener("fullscreenchange", handleFsChange);
  }, []);

  useEffect(() => {
    if (isActive) {
      videoRef.current?.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
    } else {
      videoRef.current?.pause();
      setIsPlaying(false);
    }
  }, [isActive]);

  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (videoRef.current) {
      const newMuted = !isMuted;
      videoRef.current.muted = newMuted;
      setIsMuted(newMuted);
      if (!newMuted && volume === 0) {
        setVolume(1);
        videoRef.current.volume = 1;
      }
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (videoRef.current) {
      videoRef.current.volume = val;
      const newMuted = val === 0;
      videoRef.current.muted = newMuted;
      setIsMuted(newMuted);
    }
  };

  const toggleFullscreen = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (playerRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        playerRef.current.requestFullscreen().catch(err => {
          console.error(`Error attempting to enable full-screen mode: ${err.message}`);
        });
      }
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const current = videoRef.current.currentTime;
      const total = videoRef.current.duration;
      setProgress((current / total) * 100);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    if (videoRef.current) {
      const rect = e.currentTarget.getBoundingClientRect();
      const pos = (e.clientX - rect.left) / rect.width;
      videoRef.current.currentTime = pos * duration;
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div
      ref={playerRef}
      className="relative w-full h-full flex items-center justify-center group/video overflow-hidden bg-black"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      onClick={(e) => e.stopPropagation()}
    >
      <video
        ref={videoRef}
        src={url}
        className={`max-w-full object-contain transition-all duration-300 ${isFullscreen ? 'w-full h-full' : 'max-h-[600px]'}`}
        muted={isMuted}
        loop
        playsInline
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onClick={togglePlay}
      />

      {/* Central Play/Pause Overlay */}
      {!isPlaying && (
        <div
          className="absolute inset-0 flex items-center justify-center bg-black/5 cursor-pointer transition-all duration-300 group-hover/video:bg-black/10"
          onClick={togglePlay}
        >
          <div className="bg-white/20 backdrop-blur-md p-4 rounded-full scale-110 group-hover/video:scale-125 transition-all duration-300 border border-white/30">
            <Play className="text-white fill-white" size={24} />
          </div>
        </div>
      )}

      {/* Control Bar */}
      <div
        className={`absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 via-black/40 to-transparent transition-opacity duration-300 ${isHovering || !isPlaying ? 'opacity-100' : 'opacity-0'}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Progress Bar */}
        <div
          className="w-full h-1.5 bg-white/20 rounded-full mb-4 cursor-pointer relative group/progress"
          onClick={handleSeek}
        >
          <div
            className="absolute top-0 left-0 h-full bg-blue-500 rounded-full flex items-center justify-end"
            style={{ width: `${progress}%` }}
          >
            {/* Thumb */}
            <div className="w-3 h-3 bg-white rounded-full shadow-[0_0_10px_rgba(0,0,0,0.5)] transition-transform scale-0 group-hover/progress:scale-100" />
          </div>
          <div className="absolute top-0 left-0 w-full h-full opacity-0 hover:opacity-10 transition-opacity bg-white" />
        </div>

        <div className="flex items-center justify-between text-white">
          <div className="flex items-center gap-4">
            <button onClick={togglePlay} className="hover:scale-110 transition-transform">
              {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" />}
            </button>
            <div className="flex items-center gap-2 group/volume relative">
              <button onClick={toggleMute} className="hover:scale-110 transition-transform">
                {isMuted || volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
              </button>
              <div className="w-0 group-hover/volume:w-24 overflow-hidden transition-all duration-300 flex items-center h-full">
                <style>{`
                  .volume-slider {
                    -webkit-appearance: none;
                    appearance: none;
                    background: transparent;
                    outline: none;
                  }
                  .volume-slider::-webkit-slider-thumb {
                    -webkit-appearance: none;
                    appearance: none;
                    height: 12px;
                    width: 12px;
                    border-radius: 50%;
                    background: #ffffff;
                    cursor: pointer;
                    margin-top: -4px;
                    box-shadow: 0 0 6px rgba(0,0,0,0.5);
                    border: none;
                  }
                  .volume-slider::-moz-range-thumb {
                    height: 12px;
                    width: 12px;
                    border-radius: 50%;
                    background: #ffffff;
                    cursor: pointer;
                    box-shadow: 0 0 6px rgba(0,0,0,0.5);
                    border: none;
                  }
                  .volume-slider::-webkit-slider-runnable-track {
                    width: 100%;
                    height: 4px;
                    cursor: pointer;
                    border-radius: 2px;
                  }
                  .volume-slider::-moz-range-track {
                    width: 100%;
                    height: 4px;
                    cursor: pointer;
                    border-radius: 2px;
                  }
                `}</style>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  onClick={(e) => e.stopPropagation()}
                  className="volume-slider w-20 rounded-lg cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, #3b82f6 ${(isMuted ? 0 : volume) * 100}%, rgba(255,255,255,0.2) ${(isMuted ? 0 : volume) * 100}%)`,
                  }}
                />
              </div>
            </div>
            <span className="text-xs font-medium tabular-nums shadow-sm">
              {formatTime(videoRef.current?.currentTime || 0)} / {formatTime(duration)}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="px-2 py-0.5 rounded bg-white/10 border border-white/20 text-[10px] font-bold tracking-wider uppercase">
              HD
            </div>
            <button
              onClick={toggleFullscreen}
              className="hover:scale-110 transition-transform p-1 hover:bg-white/10 rounded-full"
            >
              <Maximize2 size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const PostCarousel: React.FC<PostCarouselProps> = ({ media, onMediaClick }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!media || media.length === 0) return null;

  const nextSlide = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === media.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === 0 ? media.length - 1 : prev - 1));
  };

  const goToSlide = (e: React.MouseEvent, index: number) => {
    e.stopPropagation();
    setCurrentIndex(index);
  };

  return (
    <div className="relative group overflow-hidden bg-gray-50 flex items-center justify-center min-h-[300px] max-h-[600px] w-full">
      <div
        className="flex transition-transform duration-500 ease-out h-full w-full"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {media.map((item, idx) => (
          <div
            key={item.id}
            className="w-full h-full flex-shrink-0 cursor-pointer relative flex items-center justify-center bg-gray-50"
            onClick={() => onMediaClick?.(item.mediaUrl)}
          >
            {item.mediaType === MediaType.VIDEO ? (
              <div className={`w-full h-full relative ${item.status === MediaStatus.REJECTED ? "opacity-40 grayscale" : ""}`}>
                <VideoPlayer url={item.mediaUrl} isActive={idx === currentIndex} />
              </div>
            ) : (
              <img
                src={item.mediaUrl}
                alt=""
                className={`max-w-full max-h-[600px] object-contain shadow-sm transition-all duration-300 ${item.status === MediaStatus.REJECTED ? "opacity-40 grayscale" : ""}`}
              />
            )}

            {/* Status Badge Overlay */}
            {item.status && item.status !== MediaStatus.ACTIVE && (
              <div className="absolute top-4 right-4 z-20">
                <div className={`px-2 py-1 rounded shadow-lg text-[10px] font-black uppercase tracking-widest text-white ${item.status === MediaStatus.REJECTED ? "bg-red-600" : "bg-amber-500"
                  }`}>
                  {item.status}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      {media.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm"
          >
            <ChevronLeft size={24} />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm"
          >
            <ChevronRight size={24} />
          </button>
        </>
      )}

      {/* Indicator Dots */}
      {media.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
          {media.map((_, idx) => (
            <button
              key={idx}
              onClick={(e) => goToSlide(e, idx)}
              className={`w-1.5 h-1.5 rounded-full transition-all ${idx === currentIndex ? "bg-white w-4" : "bg-white/50"
                }`}
            />
          ))}
        </div>
      )}


      {/* Count Badge */}
      {media.length > 1 && (
        <div className="absolute top-3 left-3 bg-black/40 backdrop-blur-md px-2 py-1 rounded text-white text-[11px] font-bold">
          {currentIndex + 1} / {media.length}
        </div>
      )}
    </div>
  );
};

export default PostCarousel;
