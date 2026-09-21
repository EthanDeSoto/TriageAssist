import {
  ACCEPTED_FILE_TYPES,
  MAX_FILE_BYTES,
} from "./ticketOptions";

export function checkFile(file) {
  if (!ACCEPTED_FILE_TYPES.includes(file.type)) {
    return "That file type isn't supported. Use a PNG, JPG, WEBP, or PDF.";
  }
  if (file.size > MAX_FILE_BYTES) {
    return `That file is ${formatFileSize(file.size)}. The limit is 5 MB.`;
  }
  return null;
}

export function formatFileSize(bytes) {
  if (bytes < 1024) {
    return `${bytes} B`;
  }
  if (bytes < 1024 * 1024) {
    return `${Math.round(bytes / 1024)} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function isImageFile(file) {
  return file.type.startsWith("image/");
}
