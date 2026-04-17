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
 * @param folder - Cloudinary folder path (e.g., 'cars')
 * @returns Promise with download URL
 */
export async function uploadToCloudinary(
  file: File,
  folder: string = 'driveease'
): Promise<string> {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  if (!cloudName || !uploadPreset) {
    throw new Error(
      'Cloudinary configuration missing. Please set NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME and NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET in .env.local'
    );
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', uploadPreset);
  formData.append('folder', folder);

  console.log(`[CLOUDINARY] Uploading ${file.name} to folder: ${folder}`);

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!response.ok) {
      const error = await response.json();
      console.error('[CLOUDINARY] Upload failed:', error);
      throw new Error(
        `Cloudinary upload failed: ${error.error?.message || 'Unknown error'}`
      );
    }

    const data = (await response.json()) as CloudinaryUploadResponse;
    console.log(`[CLOUDINARY] Upload successful: ${data.secure_url}`);

    return data.secure_url;
  } catch (error) {
    console.error('[CLOUDINARY] Error uploading image:', error);
    throw error;
  }
}

/**
 * Batch upload multiple images to Cloudinary
 */
export async function uploadMultipleToCloudinary(
  files: File[],
  folder: string = 'driveease',
  onProgress?: (current: number, total: number) => void
): Promise<string[]> {
  const urls: string[] = [];

  for (let i = 0; i < files.length; i++) {
    try {
      const url = await uploadToCloudinary(files[i], folder);
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
