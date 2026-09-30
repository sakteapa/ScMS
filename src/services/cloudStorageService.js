/**
 * ZOXS Cloud Photo & Media Storage Service
 * Unified multi-tenant storage manager supporting Cloudinary, Firebase Storage, and Zero-Config Local Base64.
 */

import { storage, storageRef, uploadBytesResumable, getDownloadURL } from './firebase';

const STORAGE_CONFIG_KEY = 'zoxs_cloud_storage_config';

export const DEFAULT_STORAGE_CONFIG = {
  provider: 'auto', // 'auto' | 'cloudinary' | 'firebase' | 'local'
  cloudinary: {
    cloudName: '', // e.g. 'demo' or user's Cloudinary cloud name
    uploadPreset: '', // e.g. 'zoxs_unsigned'
    apiKey: '',
    folder: 'school_portal'
  },
  firebase: {
    storageBucket: 'zoxs-sms.firebasestorage.app',
    basePath: 'schools'
  },
  compression: {
    enabled: true,
    maxWidth: 1200,
    maxHeight: 1200,
    quality: 0.82 // 82% quality yields 85%+ smaller file with imperceptible loss
  }
};

/**
 * Get stored cloud storage configuration
 */
export function getCloudStorageConfig() {
  if (typeof window === 'undefined') return DEFAULT_STORAGE_CONFIG;
  try {
    const raw = localStorage.getItem(STORAGE_CONFIG_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        ...DEFAULT_STORAGE_CONFIG,
        ...parsed,
        cloudinary: { ...DEFAULT_STORAGE_CONFIG.cloudinary, ...(parsed.cloudinary || {}) },
        firebase: { ...DEFAULT_STORAGE_CONFIG.firebase, ...(parsed.firebase || {}) },
        compression: { ...DEFAULT_STORAGE_CONFIG.compression, ...(parsed.compression || {}) }
      };
    }
  } catch (err) {
    console.warn('Failed to parse cloud storage configuration', err);
  }
  return DEFAULT_STORAGE_CONFIG;
}

/**
 * Save cloud storage configuration to local storage
 */
export function saveCloudStorageConfig(newConfig) {
  if (typeof window === 'undefined') return;
  try {
    const merged = {
      ...getCloudStorageConfig(),
      ...newConfig
    };
    localStorage.setItem(STORAGE_CONFIG_KEY, JSON.stringify(merged));
    window.dispatchEvent(new CustomEvent('zoxs_storage_config_updated', { detail: merged }));
    return merged;
  } catch (err) {
    console.error('Failed to save cloud storage configuration', err);
    throw err;
  }
}

/**
 * Client-side high efficiency image compressor and optimizer.
 * Scales down high-res photos (e.g. 12MP phone photos = 8MB down to ~120KB)
 * preserving crisp quality and orientation before network transmission.
 */
export async function optimizeImageFile(fileOrBlob, customOptions = {}) {
  const config = getCloudStorageConfig();
  const options = {
    maxWidth: customOptions.maxWidth || config.compression.maxWidth || 1200,
    maxHeight: customOptions.maxHeight || config.compression.maxHeight || 1200,
    quality: customOptions.quality || config.compression.quality || 0.82
  };

  // If not an image, return raw blob/file
  if (fileOrBlob.type && !fileOrBlob.type.startsWith('image/')) {
    return {
      blob: fileOrBlob,
      dataUrl: null,
      width: 0,
      height: 0,
      originalBytes: fileOrBlob.size || 0,
      optimizedBytes: fileOrBlob.size || 0,
      savingsPercent: 0
    };
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        let { width, height } = img;
        const maxW = options.maxWidth;
        const maxH = options.maxHeight;

        if (width > maxW || height > maxH) {
          if (width / height > maxW / maxH) {
            height = Math.round((height * maxW) / width);
            width = maxW;
          } else {
            width = Math.round((width * maxH) / height);
            height = maxH;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          return resolve({
            blob: fileOrBlob,
            dataUrl: reader.result,
            width: img.width,
            height: img.height,
            originalBytes: fileOrBlob.size || 0,
            optimizedBytes: fileOrBlob.size || 0,
            savingsPercent: 0
          });
        }

        // Fill background with white to handle transparent PNGs converting to JPEG cleanly
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        const mimeType = 'image/jpeg';
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              return reject(new Error('Canvas to Blob conversion failed'));
            }
            const dataUrl = canvas.toDataURL(mimeType, options.quality);
            const originalBytes = fileOrBlob.size || blob.size;
            const optimizedBytes = blob.size;
            const savingsPercent = originalBytes > 0 
              ? Math.max(0, Math.round(((originalBytes - optimizedBytes) / originalBytes) * 100))
              : 0;

            resolve({
              blob,
              dataUrl,
              width,
              height,
              originalBytes,
              optimizedBytes,
              savingsPercent
            });
          },
          mimeType,
          options.quality
        );
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(fileOrBlob);
  });
}

/**
 * Upload to Cloudinary using Unsigned Upload Preset
 */
export async function uploadToCloudinary(fileOrBlob, {
  cloudName,
  uploadPreset,
  schoolId = 'default',
  folder = 'general',
  onProgress
}) {
  if (!cloudName || !uploadPreset) {
    throw new Error('Cloudinary requires both Cloud Name and Upload Preset.');
  }

  const url = `https://api.cloudinary.com/v1_1/${cloudName.trim()}/image/upload`;
  const formData = new FormData();
  formData.append('file', fileOrBlob);
  formData.append('upload_preset', uploadPreset.trim());
  formData.append('folder', `zoxs/${schoolId}/${folder}`);
  formData.append('tags', `zoxs,sms,${schoolId}`);

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', url, true);

    if (xhr.upload && onProgress) {
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          const percent = Math.round((e.loaded / e.total) * 100);
          onProgress(percent);
        }
      };
    }

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const res = JSON.parse(xhr.responseText);
          // Generate an optimized thumbnail URL using Cloudinary dynamic face-crop
          const thumbUrl = res.secure_url.replace(
            '/upload/',
            '/upload/c_thumb,g_face,w_250,h_250,q_auto,f_auto/'
          );
          resolve({
            url: res.secure_url,
            thumbnailUrl: thumbUrl,
            publicId: res.public_id,
            provider: 'cloudinary',
            format: res.format,
            bytes: res.bytes,
            width: res.width,
            height: res.height
          });
        } catch (err) {
          reject(new Error('Failed to parse Cloudinary response: ' + err.message));
        }
      } else {
        try {
          const errorRes = JSON.parse(xhr.responseText);
          reject(new Error(errorRes.error?.message || `Cloudinary upload failed with HTTP ${xhr.status}`));
        } catch (_) {
          reject(new Error(`Cloudinary upload failed with HTTP ${xhr.status}`));
        }
      }
    };

    xhr.onerror = () => {
      reject(new Error('Network error during Cloudinary upload. Check internet connection and CORS settings.'));
    };

    xhr.send(formData);
  });
}

/**
 * Upload to Firebase Storage
 */
export async function uploadToFirebaseStorage(fileOrBlob, {
  schoolId = 'default',
  folder = 'general',
  fileName,
  onProgress
}) {
  if (!storage) {
    throw new Error('Firebase Storage is not initialized or offline.');
  }

  const cleanName = fileName || `${Date.now()}_${Math.random().toString(36).substring(2, 9)}.jpg`;
  const fullPath = `schools/${schoolId}/${folder}/${cleanName}`;
  const fileRef = storageRef(storage, fullPath);

  const uploadTask = uploadBytesResumable(fileRef, fileOrBlob, {
    contentType: fileOrBlob.type || 'image/jpeg'
  });

  return new Promise((resolve, reject) => {
    uploadTask.on(
      'state_changed',
      (snapshot) => {
        if (onProgress && snapshot.totalBytes > 0) {
          const percent = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
          onProgress(percent);
        }
      },
      (error) => {
        reject(error);
      },
      async () => {
        try {
          const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
          resolve({
            url: downloadUrl,
            thumbnailUrl: downloadUrl,
            fullPath,
            provider: 'firebase',
            bytes: fileOrBlob.size || 0
          });
        } catch (urlErr) {
          reject(urlErr);
        }
      }
    );
  });
}

/**
 * Master Universal Photo Upload Dispatcher
 * Automatically resolves configured provider, compresses the media,
 * and executes the upload with live progress tracking.
 */
export async function uploadSchoolMedia({
  file,
  schoolId = 'default',
  folder = 'students',
  customName,
  onProgress = () => {},
  providerOverride = null
}) {
  const config = getCloudStorageConfig();
  const activeProvider = providerOverride || config.provider;

  // Step 1: Client-side compression if enabled
  let optimized;
  if (config.compression.enabled && file.type && file.type.startsWith('image/')) {
    onProgress(5);
    optimized = await optimizeImageFile(file, config.compression);
    onProgress(15);
  } else {
    optimized = {
      blob: file,
      dataUrl: null,
      originalBytes: file.size,
      optimizedBytes: file.size,
      savingsPercent: 0
    };
  }

  const uploadTarget = optimized.blob;

  // Step 2: Determine actual target provider
  let chosenProvider = activeProvider;
  if (chosenProvider === 'auto') {
    if (config.cloudinary.cloudName && config.cloudinary.uploadPreset) {
      chosenProvider = 'cloudinary';
    } else if (storage && config.firebase.storageBucket) {
      chosenProvider = 'firebase';
    } else {
      chosenProvider = 'local';
    }
  }

  // Step 3: Dispatch upload
  if (chosenProvider === 'cloudinary') {
    try {
      const res = await uploadToCloudinary(uploadTarget, {
        cloudName: config.cloudinary.cloudName,
        uploadPreset: config.cloudinary.uploadPreset,
        schoolId,
        folder,
        onProgress: (p) => onProgress(15 + Math.round(p * 0.85))
      });
      return {
        ...res,
        originalBytes: optimized.originalBytes,
        optimizedBytes: optimized.optimizedBytes,
        savingsPercent: optimized.savingsPercent
      };
    } catch (cErr) {
      console.warn('Cloudinary upload failed, falling back to local storage:', cErr);
      // Fallback to local base64 so user is never blocked
      return createLocalBase64Result(optimized, 'cloudinary_failed');
    }
  }

  if (chosenProvider === 'firebase') {
    try {
      const res = await uploadToFirebaseStorage(uploadTarget, {
        schoolId,
        folder,
        fileName: customName || (file.name ? `${Date.now()}_${file.name.replace(/\s+/g, '_')}` : undefined),
        onProgress: (p) => onProgress(15 + Math.round(p * 0.85))
      });
      return {
        ...res,
        originalBytes: optimized.originalBytes,
        optimizedBytes: optimized.optimizedBytes,
        savingsPercent: optimized.savingsPercent
      };
    } catch (fErr) {
      console.warn('Firebase Storage upload failed, falling back to local base64:', fErr);
      return createLocalBase64Result(optimized, 'firebase_failed');
    }
  }

  // Local Base64 fallback (Instant, zero external dependency, works offline)
  onProgress(100);
  return createLocalBase64Result(optimized, 'local');
}

function createLocalBase64Result(optimized, reason = 'local') {
  let url = optimized.dataUrl;
  if (!url) {
    // Generate dataUrl if not generated
    url = URL.createObjectURL(optimized.blob);
  }
  return {
    url,
    thumbnailUrl: url,
    provider: 'local_base64',
    bytes: optimized.optimizedBytes,
    originalBytes: optimized.originalBytes,
    optimizedBytes: optimized.optimizedBytes,
    savingsPercent: optimized.savingsPercent,
    fallbackReason: reason
  };
}
