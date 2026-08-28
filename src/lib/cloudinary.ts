/**
 * Cloudinary image upload utility
 * Provides fallback image storage if Firebase Storage is unavailable
 */

export interface CloudinaryUploadResponse {
  public_id: string;
  secure_url: string;
  url: string;
  width: number;
  height: number;
  format: string;
}

/**
 * Upload image to Cloudinary
 * @param file - File object to upload
 * @returns Promise with download URL
 */
export const uploadToCloudinary = async (file: File): Promise<string> => {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  if (!cloudName || !uploadPreset) {
    throw new Error('Cloudinary configuration missing. Check .env.local');
  }

  // STRICTLY for unsigned uploads: ONLY append file and upload_preset.
  // DO NOT append api_key, timestamp, or signature.
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', uploadPreset);

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error('[CLOUDINARY-ERROR-DETAILS]:', errorData);
      throw new Error(errorData.error?.message || 'Upload failed');
    }

    const data = await response.json();
    return data.secure_url;
  } catch (error: any) {
    console.error('Error in uploadToCloudinary:', error);
    throw new Error(`Cloudinary upload failed: ${error.message}`);
  }
};

/**
 * Batch upload multiple images to Cloudinary
 */
export async function uploadMultipleToCloudinary(
  files: File[],
  onProgress?: (current: number, total: number) => void
): Promise<string[]> {
  const urls: string[] = [];

  for (let i = 0; i < files.length; i++) {
    try {
      const url = await uploadToCloudinary(files[i]);
      urls.push(url);

      if (onProgress) {
        onProgress(i + 1, files.length);
      }
    } catch (error) {
      console.error(`[CLOUDINARY] Failed to upload file ${i + 1}:`, error);
      throw error;
    }
  }

  return urls;
}
