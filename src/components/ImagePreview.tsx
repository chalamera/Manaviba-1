import React, { useState } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

interface ImagePreviewProps {
  images: string[];
  alt: string;
}

const ImagePreview = ({ images, alt }: ImagePreviewProps) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  if (!images || images.length === 0) {
    return (
      <div className="w-full h-48 sm:h-64 bg-gray-100 flex items-center justify-center">
        <span className="text-gray-400">プレビューなし</span>
      </div>
    );
  }

  const handlePrevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
  };

  const handleNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
  };

  return (
    <>
      {/* Main image display */}
      <div className="relative w-full h-48 sm:h-64 overflow-hidden bg-gray-100">
        <img
          src={images[currentImageIndex]}
          alt={alt}
          className="w-full h-full object-cover cursor-pointer"
          onClick={() => setSelectedImage(images[currentImageIndex])}
        />
        
        {/* Navigation arrows for multiple images */}
        {images.length > 1 && (
          <>
            <button
              onClick={handlePrevImage}
              className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-black/50 backdrop-blur-sm rounded-full text-white hover:bg-black/70 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={handleNextImage}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-black/50 backdrop-blur-sm rounded-full text-white hover:bg-black/70 transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
            
            {/* Image counter */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm">
              {currentImageIndex + 1} / {images.length}
            </div>
          </>
        )}
      </div>

      {/* Thumbnail strip */}
      {images.length > 1 && (
        <div className="flex gap-2 mt-2 px-2 overflow-x-auto pb-2 snap-x">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => setCurrentImageIndex(index)}
              className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden transition-all duration-200 snap-center ${
                index === currentImageIndex ? 'ring-2 ring-[#3366CC]' : 'ring-1 ring-gray-200'
              }`}
            >
              <img
                src={image}
                alt={`${alt} - ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* Fullscreen modal */}
      {selectedImage && (
        <div className="fixed inset-0 z-50 bg-black flex flex-col touch-none">
          {/* Modal header */}
          <div className="relative z-10 p-4 bg-gradient-to-b from-black/50 to-transparent">
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute right-4 top-4 text-white hover:text-gray-300 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Modal content */}
          <div
            className="flex-1 overflow-hidden relative"
            onClick={() => setSelectedImage(null)}
          >
            <div className="absolute inset-0 flex items-center justify-center">
              <img
                src={selectedImage}
                alt={alt}
                className="max-w-full max-h-full object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ImagePreview;