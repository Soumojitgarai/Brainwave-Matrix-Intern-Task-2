import { useState } from "react";
import { cn } from "@/lib/utils";

type ProductGalleryProps = {
  images: string[];
  name: string;
};

export default function ProductGallery({ images, name }: ProductGalleryProps) {
  const [mainImage, setMainImage] = useState(images[0]);
  
  // Use the first image if no images are provided
  const displayImages = images.length > 0 ? images : ['/placeholder.jpg'];

  return (
    <div>
      <div className="mb-4 overflow-hidden rounded-lg">
        <img 
          src={mainImage} 
          alt={`${name} - Main Image`} 
          className="w-full h-96 object-cover rounded-lg"
        />
      </div>
      <div className="grid grid-cols-4 gap-4">
        {displayImages.map((image, index) => (
          <button
            key={index}
            onClick={() => setMainImage(image)}
            className={cn(
              "border rounded-md overflow-hidden transition-all",
              mainImage === image 
                ? "border-2 border-primary" 
                : "border-gray-200 hover:border-primary"
            )}
          >
            <img 
              src={image} 
              alt={`${name} thumbnail ${index + 1}`} 
              className="w-full h-24 object-cover" 
            />
          </button>
        ))}
      </div>
    </div>
  );
}
