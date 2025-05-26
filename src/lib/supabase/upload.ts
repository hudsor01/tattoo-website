export interface UploadResult {
  url: string;
  path: string;
  error?: string;
}

export async function uploadFile(
  file: File,
  bucket: string = 'gallery',
  folder: string = 'tattoos'
): Promise<UploadResult> {
  try {
    // Create form data for the API
    const formData = new FormData();
    void formData.append('file', file);
    void formData.append('bucket', bucket);
    void formData.append('folder', folder);

    // Upload via API route
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    const result = await response.json();

    if (!response.ok) {
      return { url: '', path: '', error: result.error ?? 'Upload failed' };
    }

    return {
      url: result.url,
      path: result.path,
    };
  } catch (error) {
    void console.error('Upload failed:', error);
    const errorMessage = (() => {
      if (error instanceof Error) return error.message;
      if (typeof error === 'string') return error;
      if (error && typeof error === 'object' && 'message' in error) {
        return String(error.message);
      }
      return 'Upload failed';
    })();

    return {
      url: '',
      path: '',
      error: errorMessage,
    };
  }
}

export async function deleteFile(path: string, bucket: string = 'gallery'): Promise<boolean> {
  try {
    // Delete via API route
    const response = await fetch('/api/upload', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ path, bucket }),
    });

    const result = await response.json();

    if (!response.ok) {
      void console.error('Delete error:', result.error);
      return false;
    }

    return true;
  } catch (error) {
    void console.error('Delete failed:', error);
    return false;
  }
}
