'use client';
// components/dashboard/ImageUploader.tsx
import { useState, useRef, useCallback } from 'react';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';

interface UploadedFile {
  name: string;
  url: string;
  original_name: string;
  size: number;
  mime_type: string;
  is_image: boolean;
  image_width: number | null;
  image_height: number | null;
  uploaded_at: string;
  thumbnails: unknown;
}

interface Props {
  files: UploadedFile[];
  onChange: (files: UploadedFile[]) => void;
  max?: number;
}

export default function ImageUploader({ files, onChange, max = 5 }: Props) {
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleUpload = useCallback(
    async (fileList: FileList | File[]) => {
      const newFiles = Array.from(fileList);
      setError('');

      if (files.length + newFiles.length > max) {
        setError(`Máximo ${max} imágenes`);
        return;
      }

      setUploading(true);
      const uploaded: UploadedFile[] = [];

      for (const file of newFiles) {
        try {
          const formData = new FormData();
          formData.append('file', file);

          const res = await fetch('/api/upload', {
            method: 'POST',
            body: formData,
          });

          if (!res.ok) {
            const data = await res.json();
            throw new Error(data.error ?? 'Error al subir');
          }

          const data = await res.json();
          uploaded.push(data);
        } catch (err: any) {
          setError(err.message ?? 'Error al subir archivo');
          break;
        }
      }

      if (uploaded.length > 0) {
        onChange([...files, ...uploaded]);
      }
      setUploading(false);
    },
    [files, onChange, max]
  );

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer.files.length) {
      handleUpload(e.dataTransfer.files);
    }
  }

  function removeFile(index: number) {
    onChange(files.filter((_, i) => i !== index));
  }

  function formatSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  return (
    <div className="space-y-3">
      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
          dragging
            ? 'border-green-500 bg-green-500/5'
            : 'border-white/10 hover:border-white/20 hover:bg-white/[0.02]'
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => e.target.files && handleUpload(e.target.files)}
          className="hidden"
        />

        {uploading ? (
          <div className="flex flex-col items-center gap-2">
            <Loader2 size={28} className="text-green-400 animate-spin" />
            <p className="text-sm text-gray-400">Subiendo...</p>
          </div>
        ) : (
          <>
            <Upload
              size={28}
              className={`mx-auto mb-3 ${dragging ? 'text-green-400' : 'text-gray-500'}`}
            />
            <p className="text-sm text-gray-300 font-medium">
              {dragging ? 'Soltó para subir' : 'Arrastrá las imágenes aquí'}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              o hacé clic para seleccionar · Máx {max} imágenes · JPG, PNG, WEBP · 10 MB
            </p>
          </>
        )}
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-2 text-red-400 text-xs">
          {error}
        </div>
      )}

      {/* Preview grid */}
      {files.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {files.map((file, i) => (
            <div
              key={file.name + i}
              className="relative group rounded-lg overflow-hidden bg-[#111111] border border-white/10"
            >
              {file.is_image ? (
                <img
                  src={file.url}
                  alt={file.original_name}
                  className="w-full h-28 object-cover"
                />
              ) : (
                <div className="w-full h-28 flex items-center justify-center">
                  <ImageIcon size={32} className="text-gray-600" />
                </div>
              )}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); removeFile(i); }}
                  className="opacity-0 group-hover:opacity-100 p-1.5 bg-red-500 rounded-full text-white transition-all hover:bg-red-600"
                >
                  <X size={14} />
                </button>
              </div>
              <div className="absolute bottom-0 left-0 right-0 bg-black/60 px-2 py-1">
                <p className="text-[10px] text-gray-300 truncate">{file.original_name}</p>
                <p className="text-[9px] text-gray-500">{formatSize(file.size)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
