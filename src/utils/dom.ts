export function handleDownload(url: string): void {
  // Replace 'your-file-url' with the actual URL of the file you want to download
  const fileUrl = url;

  // Create an invisible anchor element
  const link = document.createElement("a");
  link.href = fileUrl;

  // Set the download attribute to specify the filename
  link.download = "downloaded-file.txt";

  // Append the anchor to the body and trigger a click event
  document.body.appendChild(link);
  link.click();

  // Remove the anchor from the body
  document.body.removeChild(link);
}
