export const MIN_DESCRIPTION_LENGTH = 10;
export const MAX_DESCRIPTION_LENGTH = 5000;
export const MAX_FILE_BYTES = 5 * 1024 * 1024;

export const ACCEPTED_FILE_TYPES = [
  "image/png",
  "image/jpeg",
  "image/webp",
  "application/pdf",
];

export const ACCEPTED_FILE_LABEL = "PNG, JPG, WEBP, or PDF up to 5 MB";

export const CATEGORIES = [
  { value: "hardware", label: "Hardware" },
  { value: "software", label: "Software" },
  { value: "network", label: "Network" },
  { value: "access", label: "Access" },
  { value: "security", label: "Security" },
  { value: "other", label: "Other" },
];

export const PRIORITIES = [
  { value: "critical", label: "Critical" },
  { value: "high", label: "High" },
  { value: "medium", label: "Medium" },
  { value: "low", label: "Low" },
];

export const ASSIGNED_GROUPS = [
  { value: "service_desk", label: "Service Desk" },
  { value: "desktop_support", label: "Desktop Support" },
  { value: "network", label: "Network" },
  { value: "identity_access", label: "Identity & Access" },
  { value: "security", label: "Security" },
];

export const CONFIDENCE_LEVELS = [
  { value: "high", label: "High" },
  { value: "medium", label: "Medium" },
  { value: "low", label: "Low" },
];

export function labelFor(options, value) {
  const match = options.find((option) => option.value === value);
  return match ? match.label : value;
}
