import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { ImagePlus } from 'lucide-react';

interface ImageUploadProps {
  onImageSelect: (file: File | null) => void;
}

const ImageUpload = ({ onImageSelect }: ImageUploadProps) => {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      onImageSelect(acceptedFiles[0]);
    }
  }, [onImageSelect]);

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
    },
    maxFiles: 1,
    multiple: false,
    noClick: true // Disable click to open file dialog
  });

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-8
          transition-colors duration-200 ease-in-out
          flex flex-col items-center justify-center
          min-h-[200px]
          ${isDragActive 
            ? 'border-purple-500 bg-purple-500/10' 
            : 'border-gray-600 hover:border-purple-500/50 hover:bg-gray-700/50'
          }
        `}
      >
        <input {...getInputProps()} />
        <ImagePlus 
          className={`w-12 h-12 mb-4 ${isDragActive ? 'text-purple-500' : 'text-gray-400'}`}
        />
        {isDragActive ? (
          <p className="text-purple-500 text-center">Drop your image here...</p>
        ) : (
          <div className="text-center">
            <p className="text-gray-300 mb-2">Drag & drop an image here</p>
            <p className="text-gray-500 text-sm">or use the button below</p>
            <p className="text-gray-600 text-xs mt-2">
              Supports: JPG, PNG, GIF, WebP
            </p>
          </div>
        )}
      </div>
      <button
        onClick={open}
        className="w-full py-2 px-4 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
      >
        Select Image
      </button>
    </div>
  );
};

export default ImageUpload;
