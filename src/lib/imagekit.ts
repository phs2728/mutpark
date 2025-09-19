const PUBLIC_ENDPOINT = process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT ?? "";

export function resolveImageUrl(path?: string | null, options?: { width?: number; height?: number; quality?: number }) {
  if (!path) return null;
  if (/^https?:\/\//i.test(path)) {
    return path;
  }
  if (!PUBLIC_ENDPOINT) {
    return path.startsWith("/") ? path : `/${path}`;
  }

  const normalized = path.startsWith("/") ? path.slice(1) : path;
  const url = new URL(normalized, PUBLIC_ENDPOINT.endsWith("/") ? PUBLIC_ENDPOINT : `${PUBLIC_ENDPOINT}/`);

  if (options) {
    const { width, height, quality } = options;
    const params = [] as string[];
    if (width) params.push(`w-${width}`);
    if (height) params.push(`h-${height}`);
    if (quality) params.push(`q-${quality}`);
    if (params.length > 0) {
      url.searchParams.set("tr", params.join(","));
    }
  }

  return url.toString();
}
