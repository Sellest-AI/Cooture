export function isBase64(url: string) {
  if (typeof url !== "string") return false;

  try {
    // Remove the Base64 prefix if it exists
    const base64Pattern = /^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+)?;base64,/;
    const base64Content = url.replace(base64Pattern, "");

    // Regular expression to check Base64 content
    const base64Regex = /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/;

    return base64Regex.test(base64Content);
  } catch {
    // catch when the base64 is too long (4096x4096 images)
    const startsWith = url.startsWith("data:image;");
    const include = url.includes("base64,");
    return startsWith && include;
  }
}

