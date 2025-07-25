// services/cloudinary.service.ts
export interface CloudinaryUploadResponse {
  public_id: string;
  secure_url: string;
  url: string;
  width: number;
  height: number;
  format: string;
  resource_type: string;
  created_at: string;
}

export class CloudinaryService {
  private static readonly CLOUDINARY_URL = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_URL || '';
  private static readonly UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || '';

  /**
   * Upload une seule image vers Cloudinary
   */
  static async uploadImage(file: File): Promise<CloudinaryUploadResponse> {
    if (!this.CLOUDINARY_URL || !this.UPLOAD_PRESET) {
      throw new Error('Cloudinary configuration is missing');
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', this.UPLOAD_PRESET);
    formData.append('folder', 'products'); // Organiser les images dans un dossier

    try {
      const response = await fetch(this.CLOUDINARY_URL, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const data: CloudinaryUploadResponse = await response.json();
      return data;
    } catch (error) {
      console.error('Error uploading to Cloudinary:', error);
      throw new Error('Failed to upload image');
    }
  }

  /**
   * Upload plusieurs images vers Cloudinary
   */
  static async uploadMultipleImages(files: File[]): Promise<CloudinaryUploadResponse[]> {
    const uploadPromises = files.map(file => this.uploadImage(file));
    
    try {
      const results = await Promise.all(uploadPromises);
      return results;
    } catch (error) {
      console.error('Error uploading multiple images:', error);
      throw new Error('Failed to upload one or more images');
    }
  }

  /**
   * Upload avec progress tracking pour une meilleure UX
   */
  static async uploadImageWithProgress(
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<CloudinaryUploadResponse> {
    if (!this.CLOUDINARY_URL || !this.UPLOAD_PRESET) {
      throw new Error('Cloudinary configuration is missing');
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', this.UPLOAD_PRESET);
    formData.append('folder', 'products');

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      // Track upload progress
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable && onProgress) {
          const progress = (event.loaded / event.total) * 100;
          onProgress(Math.round(progress));
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status === 200) {
          try {
            const response: CloudinaryUploadResponse = JSON.parse(xhr.responseText);
            resolve(response);
          } catch (error) {
            reject(new Error('Invalid response format'));
          }
        } else {
          reject(new Error(`Upload failed: ${xhr.statusText}`));
        }
      });

      xhr.addEventListener('error', () => {
        reject(new Error('Network error during upload'));
      });

      xhr.open('POST', this.CLOUDINARY_URL);
      xhr.send(formData);
    });
  }

  /**
   * Supprimer une image de Cloudinary (nécessite une API route côté serveur)
   */
  static async deleteImage(publicId: string): Promise<boolean> {
    try {
      const response = await fetch('/api/cloudinary/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ publicId }),
      });

      return response.ok;
    } catch (error) {
      console.error('Error deleting image:', error);
      return false;
    }
  }
}