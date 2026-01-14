/**
 * Downloads a file from a URL (remote or blob) with a specified filename.
 */
export function downloadFile(url: string, filename: string): void {
  // Create invisible anchor element
  const link = document.createElement("a");
  link.href = url;

  // Set the download attribute to specify the filename
  link.download = filename;

  // Append the anchor to the body and trigger a click event
  document.body.appendChild(link);
  link.click();

  // Remove the anchor from the body
  document.body.removeChild(link);

  // Revoke blob URLs to free memory
  if (url.startsWith("blob:")) {
    URL.revokeObjectURL(url);
  }
}
