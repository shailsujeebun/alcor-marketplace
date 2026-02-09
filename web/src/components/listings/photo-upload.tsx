'use client';

import { useRef, useState, useCallback } from 'react';
import { ImagePlus, X, GripVertical } from 'lucide-react';

export interface PhotoItem {
  id: string;
  url: string;
  file?: File;
  isExisting: boolean;
}

interface PhotoUploadProps {
  photos: PhotoItem[];
  onChange: (photos: PhotoItem[]) => void;
  maxPhotos?: number;
}

let nextId = 0;
function genId() {
  return `photo-${Date.now()}-${nextId++}`;
}

function PhotoThumb({ photo, index, onRemove, onDragStart, onDragEnter, onDragEnd }: {
  photo: PhotoItem;
  index: number;
  onRemove: (id: string) => void;
  onDragStart: (index: number) => void;
  onDragEnter: (index: number) => void;
  onDragEnd: () => void;
}) {
  const [imgError, setImgError] = useState(false);

  return (
    <div
      draggable
      onDragStart={(e) => {
        e.dataTransfer.effectAllowed = 'move';
        onDragStart(index);
      }}
      onDragEnter={() => onDragEnter(index)}
      onDragEnd={onDragEnd}
      onDragOver={(e) => e.preventDefault()}
      className="relative group aspect-square rounded-lg overflow-hidden border border-[var(--border-color)] cursor-grab active:cursor-grabbing"
    >
      {imgError ? (
        <div className="w-full h-full flex items-center justify-center bg-[var(--bg-primary)] text-[var(--text-secondary)] text-xs">
          Помилка
        </div>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={photo.url}
          alt={`Фото ${index + 1}`}
          className="w-full h-full object-cover"
          onError={() => setImgError(true)}
        />
      )}

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
          <GripVertical size={20} className="text-white" />
        </div>
      </div>

      {/* Remove button */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onRemove(photo.id);
        }}
        className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-red-500/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
      >
        <X size={14} />
      </button>

      {/* Index badge */}
      {index === 0 && (
        <span className="absolute bottom-1.5 left-1.5 px-2 py-0.5 rounded text-xs bg-blue-500/80 text-white font-medium">
          Головне
        </span>
      )}
    </div>
  );
}

export function PhotoUpload({ photos, onChange, maxPhotos = 10 }: PhotoUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const dragItemRef = useRef<number | null>(null);
  const dragOverRef = useRef<number | null>(null);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    const remaining = maxPhotos - photos.length;
    const toAdd = files.slice(0, remaining);

    const newPhotos: PhotoItem[] = toAdd.map((file) => ({
      id: genId(),
      url: URL.createObjectURL(file),
      file,
      isExisting: false,
    }));

    onChange([...photos, ...newPhotos]);
    // Reset input value so the same file can be selected again
    e.target.value = '';
  }, [photos, onChange, maxPhotos]);

  const handleRemove = useCallback((id: string) => {
    const photo = photos.find((p) => p.id === id);
    if (photo && !photo.isExisting) {
      URL.revokeObjectURL(photo.url);
    }
    onChange(photos.filter((p) => p.id !== id));
  }, [photos, onChange]);

  const handleDragStart = useCallback((index: number) => {
    dragItemRef.current = index;
  }, []);

  const handleDragEnter = useCallback((index: number) => {
    dragOverRef.current = index;
  }, []);

  const handleDragEnd = useCallback(() => {
    if (dragItemRef.current === null || dragOverRef.current === null) return;
    if (dragItemRef.current === dragOverRef.current) {
      dragItemRef.current = null;
      dragOverRef.current = null;
      return;
    }

    const updated = [...photos];
    const [dragged] = updated.splice(dragItemRef.current, 1);
    updated.splice(dragOverRef.current, 0, dragged);
    onChange(updated);

    dragItemRef.current = null;
    dragOverRef.current = null;
  }, [photos, onChange]);

  return (
    <div>
      {/* Upload area */}
      {photos.length < maxPhotos && (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="w-full border-2 border-dashed border-[var(--border-color)] rounded-xl p-8 flex flex-col items-center gap-3 hover:border-blue-bright/50 transition-colors cursor-pointer mb-4"
        >
          <ImagePlus size={40} className="text-[var(--text-secondary)]" />
          <span className="text-sm text-[var(--text-secondary)]">
            Натисніть, щоб додати фото ({photos.length}/{maxPhotos})
          </span>
          <span className="text-xs text-[var(--text-secondary)]">
            JPG, PNG, WebP — до 10 МБ кожне
          </span>
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        className="hidden"
        onChange={handleFileSelect}
      />

      {/* Photo grid */}
      {photos.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {photos.map((photo, index) => (
            <PhotoThumb
              key={photo.id}
              photo={photo}
              index={index}
              onRemove={handleRemove}
              onDragStart={handleDragStart}
              onDragEnter={handleDragEnter}
              onDragEnd={handleDragEnd}
            />
          ))}
        </div>
      )}

      {photos.length > 1 && (
        <p className="text-xs text-[var(--text-secondary)] mt-2">
          Перетягніть фото, щоб змінити порядок. Перше фото буде головним.
        </p>
      )}
    </div>
  );
}
