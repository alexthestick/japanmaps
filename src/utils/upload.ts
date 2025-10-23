import { supabase } from '../lib/supabase';

export async function uploadStorePhoto(file: File): Promise<string | null> {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('storage-photos')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from('storage-photos')
      .getPublicUrl(filePath);

    return data.publicUrl;
  } catch (error) {
    console.error('Error uploading file:', error);
    return null;
  }
}

export async function deleteStorePhoto(url: string): Promise<boolean> {
  try {
    const path = url.split('/').pop();
    if (!path) return false;

    const { error } = await supabase.storage
      .from('storage-photos')
      .remove([path]);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting file:', error);
    return false;
  }
}


