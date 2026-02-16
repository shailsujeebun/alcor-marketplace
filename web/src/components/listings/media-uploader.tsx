'use client';

import { useState, useCallback } from 'react';
import { Upload, X, Loader2 } from 'lucide-react';
import { useUploadImages } from '@/lib/queries';

export interface MediaItem {
    id?: string;
    url: string;
    key?: string;
    isExisting?: boolean;
    file?: File;
    type?: 'PHOTO' | 'VIDEO' | 'PDF' | 'GALLERY' | 'COVER' | 'LOGO';
}

interface MediaUploaderProps {
    media: MediaItem[];
    onChange: (media: MediaItem[]) => void;
    maxFiles?: number;
}

export function MediaUploader({ media, onChange, maxFiles = 10 }: MediaUploaderProps) {
    const [uploading, setUploading] = useState(false);
    // Switch to server-side upload to avoid CORS/S3 configuration issues on client
    const { mutateAsync: uploadImages } = useUploadImages();

    const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;

        const remaining = maxFiles - media.length;
        const filesToUpload = files.slice(0, remaining);

        setUploading(true);
        try {
            const { urls } = await uploadImages(filesToUpload);

            const newMediaItems: MediaItem[] = urls.map((url, index) => ({
                url,
                file: filesToUpload[index],
                type: 'PHOTO',
            }));

            onChange([...media, ...newMediaItems]);
        } catch (error) {
            console.error('Upload failed:', error);
            alert('Помилка завантаження файлів. Будь ласка, спробуйте ще раз.');
        } finally {
            setUploading(false);
            e.target.value = ''; // Reset input
        }
    }, [media, maxFiles, onChange, uploadImages]);

    const handleRemove = useCallback((index: number) => {
        onChange(media.filter((_, i) => i !== index));
    }, [media, onChange]);

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {media.map((item, index) => (
                    <div key={item.id || index} className="relative group aspect-square rounded-lg overflow-hidden bg-[var(--bg-secondary)] border border-[var(--border-color)]">
                        <img
                            src={item.url}
                            alt={`Фото ${index + 1}`}
                            className="w-full h-full object-cover"
                        />
                        <button
                            type="button"
                            onClick={() => handleRemove(index)}
                            className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80"
                        >
                            <X size={16} />
                        </button>
                    </div>
                ))}

                {media.length < maxFiles && (
                    <label className="aspect-square rounded-lg border-2 border-dashed border-[var(--border-color)] hover:border-blue-bright cursor-pointer transition-colors flex flex-col items-center justify-center gap-2 bg-[var(--bg-secondary)]/30">
                        <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleFileSelect}
                            disabled={uploading}
                            className="hidden"
                        />
                        {uploading ? (
                            <Loader2 size={24} className="animate-spin text-blue-bright" />
                        ) : (
                            <>
                                <Upload size={24} className="text-[var(--text-secondary)]" />
                                <span className="text-xs text-[var(--text-secondary)] text-center px-2">
                                    Завантажити фото
                                </span>
                            </>
                        )}
                    </label>
                )}
            </div>

            <p className="text-xs text-[var(--text-secondary)]">
                Завантажено {media.length} з {maxFiles} фото
            </p>
        </div>
    );
}
