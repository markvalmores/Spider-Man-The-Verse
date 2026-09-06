import { useState } from 'react';
import { X, Download, Trash2, Calendar, CloudSun, Eye } from 'lucide-react';
import { SavedPhoto } from './CityTypes';

interface PhotoGalleryModalProps {
  photos: SavedPhoto[];
  onClose: () => void;
  onDeletePhoto: (id: string) => void;
}

export default function PhotoGalleryModal({
  photos,
  onClose,
  onDeletePhoto,
}: PhotoGalleryModalProps) {
  const [selectedPhoto, setSelectedPhoto] = useState<SavedPhoto | null>(
    photos.length > 0 ? photos[0] : null
  );

  const handleDownload = (photo: SavedPhoto) => {
    const link = document.createElement('a');
    link.download = `manhattan_spiderman_${photo.weather}_${photo.id}.png`;
    link.href = photo.dataUrl;
    link.click();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 select-none font-sans">
      <div className="bg-neutral-900 border border-neutral-700 rounded-3xl w-full max-w-5xl h-[85vh] flex flex-col overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-neutral-950/80">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-600 rounded-xl text-white">
              📸
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-white tracking-wide font-['Bangers']">
                SPIDER-MAN PHOTO ARCHIVE
              </h2>
              <p className="text-xs text-neutral-400">
                {photos.length} Captured Manhattan Shots
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content Area */}
        {photos.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-neutral-400">
            <div className="text-6xl mb-4">📷</div>
            <h3 className="text-2xl font-bold text-white font-['Bangers'] mb-1">
              NO PHOTOS TAKEN YET!
            </h3>
            <p className="text-sm max-w-sm mb-4">
              Enter Photo Mode in 'Explore the World' (press P or tap Camera) and take iconic shots of Spider-Man swinging through Manhattan!
            </p>
            <button
              onClick={onClose}
              className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition shadow-lg"
            >
              Start Exploring
            </button>
          </div>
        ) : (
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
            {/* Left: Thumbnail Strip / Grid */}
            <div className="w-full md:w-80 border-r border-neutral-800 overflow-y-auto p-4 space-y-3 bg-neutral-950/40">
              <div className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
                Photo Reel
              </div>
              <div className="grid grid-cols-2 md:grid-cols-1 gap-3">
                {photos.map((p) => {
                  const isSelected = selectedPhoto?.id === p.id;
                  return (
                    <button
                      key={p.id}
                      onClick={() => setSelectedPhoto(p)}
                      className={`relative group rounded-xl overflow-hidden border-2 text-left transition ${
                        isSelected
                          ? 'border-red-500 shadow-[0_0_12px_rgba(239,68,68,0.5)] scale-[1.02]'
                          : 'border-neutral-800 hover:border-neutral-600'
                      }`}
                    >
                      <img
                        src={p.dataUrl}
                        alt="Thumbnail"
                        className="w-full h-28 object-cover group-hover:scale-105 transition duration-300"
                      />
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-2">
                        <div className="flex items-center justify-between text-[11px] text-white font-medium">
                          <span className="capitalize flex items-center gap-1">
                            <CloudSun size={12} className="text-amber-400" />
                            {p.weather}
                          </span>
                          <span className="text-neutral-400 text-[10px]">{p.date}</span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right: Full Preview & Metadata */}
            {selectedPhoto && (
              <div className="flex-1 flex flex-col p-6 overflow-y-auto items-center justify-between">
                {/* Large Preview Image */}
                <div className="relative max-h-[55vh] flex items-center justify-center rounded-2xl overflow-hidden shadow-2xl border border-neutral-800 bg-black">
                  <img
                    src={selectedPhoto.dataUrl}
                    alt="Preview"
                    className="max-h-[55vh] w-auto object-contain rounded-xl"
                  />
                </div>

                {/* Metadata & Actions Card */}
                <div className="w-full mt-4 bg-neutral-950/90 border border-neutral-800 p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 text-sm text-neutral-300 font-bold">
                      <span className="text-red-400">{selectedPhoto.suitName}</span>
                      <span className="text-neutral-600">•</span>
                      <span className="capitalize text-amber-400">
                        {selectedPhoto.weather} Weather
                      </span>
                      <span className="text-neutral-600">•</span>
                      <span className="text-neutral-400">{selectedPhoto.date}</span>
                    </div>
                    <p className="text-xs text-neutral-400 mt-0.5">
                      {selectedPhoto.caption}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button
                      onClick={() => handleDownload(selectedPhoto)}
                      className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-red-600 to-amber-600 hover:brightness-110 text-white font-bold text-sm rounded-xl transition shadow-lg"
                    >
                      <Download size={16} />
                      <span>Save Image</span>
                    </button>

                    <button
                      onClick={() => {
                        onDeletePhoto(selectedPhoto.id);
                        const rem = photos.filter((p) => p.id !== selectedPhoto.id);
                        setSelectedPhoto(rem.length > 0 ? rem[0] : null);
                      }}
                      className="p-2.5 rounded-xl border border-neutral-800 text-neutral-400 hover:text-red-400 hover:border-red-900 transition"
                      title="Delete Photo"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
