export function parseProductImages(row: {
  image?: string | null;
  images?: string | null;
}): string[] {
  if (row.images) {
    try {
      const parsed = JSON.parse(row.images);
      if (Array.isArray(parsed) && parsed.every((u) => typeof u === "string")) {
        return parsed.filter(Boolean);
      }
    } catch {
      /* fall through */
    }
  }
  return row.image ? [row.image] : [];
}

export function serializeProductImages(images: string[]): {
  image: string | null;
  images: string | null;
} {
  const clean = images.filter(Boolean);
  return {
    image: clean[0] ?? null,
    images: clean.length ? JSON.stringify(clean) : null,
  };
}

export function formatProduct<T extends { image?: string | null; images?: string | null }>(
  row: T,
): T & { images: string[] } {
  const gallery = parseProductImages(row);
  return {
    ...row,
    image: gallery[0] ?? row.image ?? null,
    images: gallery,
  };
}
