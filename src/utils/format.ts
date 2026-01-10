export function formatBytes(bytes: number): string {
  const fileSizeInGB = bytes / (1024 * 1024 * 1024);
  const fileSizeInMB = bytes / (1024 * 1024);

  if (fileSizeInGB >= 1) {
    return fileSizeInGB.toFixed(2) + " GB";
  } else {
    return fileSizeInMB.toFixed(2) + " MB";
  }
}
