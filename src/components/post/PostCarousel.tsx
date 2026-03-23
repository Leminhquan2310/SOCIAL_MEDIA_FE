import React, { useState } from "react";
import { ChevronLeft, ChevronRight, Maximize2 } from "lucide-react";
import { PostImageDto } from "../../../types";

interface PostCarouselProps {
  images: PostImageDto[];
  onImageClick?: (url: string) => void;
}

const PostCarousel: React.FC<PostCarouselProps> = ({ images, onImageClick }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (images.length === 0) return null;

  const nextSlide = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
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
        {images.map((img) => (
          <div
            key={img.id}
            className="w-full h-full flex-shrink-0 cursor-pointer relative flex items-center justify-center bg-gray-50"
            onClick={() => onImageClick?.(img.imageUrl)}
          >
            <img
              src={img.imageUrl}
              alt=""
              className="max-w-full max-h-[600px] object-contain shadow-sm"
            />
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      {images.length > 1 && (
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
      {images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
          {images.map((_, idx) => (
            <button
              key={idx}
              onClick={(e) => goToSlide(e, idx)}
              className={`w-1.5 h-1.5 rounded-full transition-all ${idx === currentIndex ? "bg-white w-4" : "bg-white/50"
                }`}
            />
          ))}
        </div>
      )}

      {/* Zoom Icon */}
      <div className="absolute top-3 right-3 bg-black/20 backdrop-blur-md p-1.5 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        <Maximize2 size={16} />
      </div>

      {/* Count Badge */}
      {images.length > 1 && (
        <div className="absolute top-3 left-3 bg-black/40 backdrop-blur-md px-2 py-1 rounded text-white text-[11px] font-bold">
          {currentIndex + 1} / {images.length}
        </div>
      )}
    </div>
  );
};

export default PostCarousel;
