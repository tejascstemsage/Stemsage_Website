import { useState } from 'react';
import { useController, Controller } from 'react-hook-form';
import { Upload, X } from 'lucide-react';
import api from '../../services/api';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

function ImageUploaderInner({ name, control, error, multiple = false, maxFiles = 5, accept = ALLOWED_TYPES.join(',') }) {
  const [previews, setPreviews] = useState([]);
  const { field, fieldState } = useController({ name, control });

  const handleFiles = async (files) => {
    const validFiles = [];
    const newPreviews = [];

    for (const file of files) {
      if (!accept.split(',').includes(file.type)) {
        alert(`${file.name}: Invalid file type. Allowed: JPG, PNG, WebP, GIF`);
        continue;
      }
      if (file.size > MAX_FILE_SIZE) {
        alert(`${file.name}: File size exceeds 5MB limit`);
        continue;
      }
      validFiles.push(file);
      newPreviews.push(URL.createObjectURL(file));
    }

    if (multiple) {
      const current = field.value || [];
      if (current.length + validFiles.length > maxFiles) {
        alert(`Maximum ${maxFiles} files allowed`);
        validFiles.forEach((_, i) => URL.revokeObjectURL(newPreviews[i]));
        return;
      }
      // Upload each file to Cloudinary and get URLs
      const uploadedFiles = await Promise.all(validFiles.map(async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        try {
          const res = await api.post('/admin/upload-image', formData);
          // Response shape: { success: true, data: { url: secure_url, publicId: public_id } }
          const data = res.data;
          if (res.status === 200 && data?.data?.url) return data.data;
        } catch (e) {
          // Handle error response from backend
          if (e.response && e.response?.data?.message) {
            console.error('Upload error:', e.response.data.message);
          } else {
            console.error('Upload error:', e);
          }
        }
        // Fallback: return object URL if upload fails
        return { url: URL.createObjectURL(file), publicId: null };
      }));
      // uploadedFiles is already an array of {url, publicId} objects
      field.onChange(uploadedFiles);
      setPreviews((prev) => [...prev, ...newPreviews]);
    } else {
      // Upload single file to Cloudinary
      const file = validFiles[0];
      if (!file) return;

      const formData = new FormData();
      formData.append('file', file);
      try {
        const res = await api.post('/admin/upload-image', formData);
        // Response shape: { success: true, data: { url: secure_url, publicId: public_id } }
        const data = res.data;
        if (res.status === 200 && data?.data?.url) {
          field.onChange(data.data);
          setPreviews([newPreviews[0]]);
          return;
        }
      } catch (e) {
        // Handle error response from backend
        if (e.response && e.response?.data?.message) {
          console.error('Upload error:', e.response.data.message);
        } else {
          console.error('Upload error:', e);
        }
      }
      // Fallback: return object URL if upload fails
      field.onChange({ url: URL.createObjectURL(file), publicId: null });
      setPreviews([newPreviews[0]]);
    }
  };

  const handleChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      handleFiles(files);
    }
  };

  const removeFile = (index) => {
    URL.revokeObjectURL(previews[index]);
    setPreviews((prev) => prev.filter((_, i) => i !== index));
    // Always set the field value to null when removing an image
    if (multiple) {
      field.onChange([]);
    } else {
      field.onChange(null);
    }
  };

  return (
    <div className="space-y-3">
      <label className="flex flex-col items-start justify-center w-full min-h-[120px] border-2 border-dashed rounded-xl p-6 text-center transition-colors hover:border-red-400 hover:bg-red-50 cursor-pointer group relative" htmlFor={`${name}-input`}>
        <input
          id={`${name}-input`}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleChange}
          className="absolute inset-0 opacity-0 cursor-pointer"
        />
        <div className="flex flex-col items-center gap-2 relative z-10">
          <Upload className="h-8 w-8 text-slate-400 group-hover:text-red-500 transition-colors" />
          <p className="text-sm font-medium text-slate-600 group-hover:text-red-600">
            {multiple ? 'Click or drag to upload images' : 'Click or drag to upload image'}
          </p>
          <p className="text-xs text-slate-400">Max 5MB per file. {multiple ? `Max ${maxFiles} files.` : ''}</p>
        </div>
      </label>

      {previews.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {previews.map((preview, index) => (
            <div key={index} className="relative aspect-square rounded-lg overflow-hidden border border-slate-200 bg-slate-50 group">
              <img src={preview} alt={`Preview ${index + 1}`} className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => removeFile(index)}
                className="absolute top-1 right-1 p-1 rounded-full bg-white/90 backdrop-blur-sm text-slate-500 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="Remove image"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {error && <p className="text-sm text-red-500">{error.message}</p>}
    </div>
  );
}

export default function ImageUploader(props) {
  return <Controller name={props.name} control={props.control} render={({ field, fieldState }) => <ImageUploaderInner {...props} field={field} fieldState={fieldState} />} />;
}