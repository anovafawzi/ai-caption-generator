import { useState, useEffect } from 'react';
import { Button } from './components/ui/button';
import { Select } from './components/ui/select';
import ImageUpload from './components/ImageUpload';
import { HolidaySelect } from './components/HolidaySelect';
import { Loader2, Sparkles } from 'lucide-react';

function App() {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [selectedHoliday, setSelectedHoliday] = useState<string>('');
  const [caption, setCaption] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [error, setError] = useState<string>('');

  const handleImageSelect = (file: File | null) => {
    // Clean up old preview URL
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    setSelectedImage(file);
    
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else {
      setPreviewUrl('');
    }
  };

  const handleHolidaySelect = (holiday: string) => {
    setSelectedHoliday(holiday);
  };

  const handleGenerateCaption = async () => {
    if (!selectedImage && !selectedHoliday) {
      setError('Please select an image or holiday');
      return;
    }

    setLoading(true);
    setError('');
    setCaption('');

    try {
      const formData = new FormData();
      if (selectedImage) {
        formData.append('image', selectedImage);
      }
      if (selectedHoliday) {
        formData.append('holiday', selectedHoliday);
      }

      const response = await fetch('http://localhost:3000/api/generate', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to generate caption');
      }

      const data = await response.json();
      setCaption(data.caption);
    } catch (error) {
      setError('Failed to generate caption. Please try again.');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCaption = () => {
    navigator.clipboard.writeText(caption);
  };

  const handleRemoveImage = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl('');
    setSelectedImage(null);
  };

  // Clean up preview URL when component unmounts
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  return (
    <div className="min-h-screen bg-[#020817] flex flex-col items-center justify-center w-full">
      <div className="container mx-auto px-4 py-8 w-full">
        <div className="max-w-7xl mx-auto w-full">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
              Church Corner Toy Library
            </h1>
            <p className="text-gray-400">
              Social media creative caption generator for social media posts using AI
            </p>
          </div>

          {/* Main Content */}
          <div className="bg-gray-800 rounded-lg shadow-xl p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Left Column: Image Upload */}
              <div className="space-y-6">
                <h2 className="text-xl font-semibold mb-4">Upload Image</h2>
                <ImageUpload onImageSelect={handleImageSelect} />
                {previewUrl && (
                  <div className="mt-4 relative rounded-lg overflow-hidden">
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="w-full h-48 object-cover rounded-lg"
                    />
                    <button
                      onClick={handleRemoveImage}
                      className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors"
                    >
                      ✕
                    </button>
                  </div>
                )}
              </div>

              {/* Right Column: Holiday Selection and Generation */}
              <div className="space-y-6">
                <h2 className="text-xl font-semibold mb-4">Select Holiday (Optional)</h2>
                <HolidaySelect onSelect={handleHolidaySelect} />

                {error && (
                  <div className="text-red-500 bg-red-100/10 p-3 rounded-md">
                    {error}
                  </div>
                )}

                <Button
                  onClick={handleGenerateCaption}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 transition-all duration-200"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Generate Caption
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Caption Result */}
            {caption && (
              <div className="mt-8 space-y-4">
                <div className="bg-gray-900 rounded-lg p-6 relative group">
                  <h3 className="text-lg font-semibold mb-2 text-purple-400">
                    Generated Caption
                  </h3>
                  <p className="text-gray-300 leading-relaxed">{caption}</p>
                  <Button
                    onClick={handleCopyCaption}
                    variant="outline"
                    className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    Copy
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="text-center mt-8 text-gray-400 text-sm">
            Generated for Church Corner Toy Library by Anova
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
