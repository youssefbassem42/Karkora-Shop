import { useState, useRef, useCallback } from 'react';
import { uploadAPI, resolveImageUrl } from '../services/api';
import './ImageUploader.css';

/**
 * ImageUploader — drag-and-drop + click to upload multiple images.
 *
 * Props:
 *   value: string[]        — current image URL array (from server)
 *   onChange: (urls) => void  — called when the list changes
 *   maxImages?: number     — default 10
 */
export default function ImageUploader({ value = [], onChange, maxImages = 10 }) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef(null);

  const handleFiles = useCallback(
    async (files) => {
      setError('');
      const remaining = maxImages - value.length;
      if (remaining <= 0) {
        setError(`Maximum ${maxImages} images allowed.`);
        return;
      }

      const clipped = Array.from(files).slice(0, remaining);
      if (clipped.length === 0) return;

      setUploading(true);
      setProgress(0);

      try {
        const res = await uploadAPI.uploadImages(clipped, setProgress);
        const newUrls = res.data.urls || [];
        onChange([...value, ...newUrls]);
      } catch (err) {
        setError(err.response?.data?.message || 'Upload failed. Please try again.');
      } finally {
        setUploading(false);
        setProgress(0);
        // Reset input so same files can be re-selected
        if (inputRef.current) inputRef.current.value = '';
      }
    },
    [value, onChange, maxImages]
  );

  const handleInputChange = (e) => handleFiles(e.target.files);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleRemove = (idx) => {
    const next = value.filter((_, i) => i !== idx);
    onChange(next);
  };

  const handleMoveLeft = (idx) => {
    if (idx === 0) return;
    const next = [...value];
    [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
    onChange(next);
  };

  const handleMoveRight = (idx) => {
    if (idx === value.length - 1) return;
    const next = [...value];
    [next[idx], next[idx + 1]] = [next[idx + 1], next[idx]];
    onChange(next);
  };

  const canUploadMore = value.length < maxImages;

  return (
    <div className="img-uploader">
      {/* Preview Grid */}
      {value.length > 0 && (
        <div className="img-uploader-grid">
          {value.map((url, idx) => (
            <div key={url + idx} className={`img-uploader-item ${idx === 0 ? 'is-primary' : ''}`}>
              <img
                src={resolveImageUrl(url)}
                alt={`Product image ${idx + 1}`}
                onError={(e) => { e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect fill="%23f5d5dc" width="100" height="100"/><text y="50" x="50" text-anchor="middle" dy=".3em" fill="%23d4808f" font-size="24">?</text></svg>'; }}
              />

              {idx === 0 && <span className="img-uploader-primary-badge">Primary</span>}

              {/* Controls */}
              <div className="img-uploader-controls">
                <button
                  type="button"
                  className="img-ctrl-btn"
                  onClick={() => handleMoveLeft(idx)}
                  disabled={idx === 0}
                  title="Move left (set as primary)"
                  aria-label="Move left"
                >
                  ‹
                </button>
                <button
                  type="button"
                  className="img-ctrl-btn img-ctrl-remove"
                  onClick={() => handleRemove(idx)}
                  title="Remove image"
                  aria-label="Remove"
                >
                  ✕
                </button>
                <button
                  type="button"
                  className="img-ctrl-btn"
                  onClick={() => handleMoveRight(idx)}
                  disabled={idx === value.length - 1}
                  title="Move right"
                  aria-label="Move right"
                >
                  ›
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Drop Zone */}
      {canUploadMore && (
        <div
          className={`img-uploader-dropzone ${dragOver ? 'drag-over' : ''} ${uploading ? 'is-uploading' : ''}`}
          onClick={() => !uploading && inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
          aria-label="Upload images"
        >
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
            multiple
            onChange={handleInputChange}
            style={{ display: 'none' }}
            aria-hidden="true"
          />

          {uploading ? (
            <div className="img-uploader-progress">
              <div className="img-uploader-progress-bar" style={{ width: `${progress}%` }} />
              <span className="img-uploader-progress-label">Uploading… {progress}%</span>
            </div>
          ) : (
            <>
              <div className="img-uploader-icon">📸</div>
              <p className="img-uploader-text">
                <strong>Drop images here</strong> or click to browse
              </p>
              <p className="img-uploader-hint">
                JPEG, PNG, WebP, GIF, AVIF · Max 20 MB each · Compressed to WebP automatically
              </p>
              <p className="img-uploader-count">
                {value.length}/{maxImages} images uploaded
              </p>
            </>
          )}
        </div>
      )}

      {/* Error */}
      {error && <p className="img-uploader-error">{error}</p>}

      {/* Helper text */}
      {value.length > 0 && (
        <p className="img-uploader-tip">
          💡 Drag to reorder · First image is shown as the <strong>primary</strong> product photo
        </p>
      )}
    </div>
  );
}
