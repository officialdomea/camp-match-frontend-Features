export const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
export const MAX_PROPERTY_IMAGES = 12;
export const MAX_VERIFICATION_FILE_BYTES = 15 * 1024 * 1024;

const IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

export function validateImageFile(file: File): string | null {
  if (!file.type || !IMAGE_TYPES.has(file.type)) {
    return `${file.name || "Selected file"} is not a supported image type. Use JPG, PNG, or WebP.`;
  }

  if (file.size <= 0) {
    return `${file.name || "Selected file"} is empty.`;
  }

  if (file.size > MAX_IMAGE_BYTES) {
    return `${file.name || "Selected file"} is larger than 10 MB.`;
  }

  return null;
}

export function validateImageFiles(files: File[], maxCount = MAX_PROPERTY_IMAGES): string | null {
  if (!files.length) return "Choose at least one image.";
  if (files.length > maxCount) return `Choose no more than ${maxCount} images.`;

  for (const file of files) {
    const error = validateImageFile(file);
    if (error) return error;
  }

  return null;
}

export function validateVerificationFile(file: File | undefined): string | null {
  if (!file || file.size <= 0) return "Choose a non-empty verification file.";
  if (!["application/pdf", "image/jpeg", "image/png"].includes(file.type)) {
    return "Use a PDF, JPG, or PNG verification file.";
  }
  if (file.size > MAX_VERIFICATION_FILE_BYTES)
    return "Verification files must be 15 MB or smaller.";
  return null;
}
