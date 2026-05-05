export const convertTagsToString = (tags: string[]): string => {
  return tags.map((tag) => sanitizeTag(tag))
    .filter((t, i, arr) => t.length > 0 && arr.indexOf(t) === i) // remove empty and duplicate tags
    .join(", ");
}

type Options = {
  capitalize?: boolean;
}

export const convertStringToTags = (str: string, options?: Options): string[] => {
  let tags = str.split(",").map((tag) => tag.trim().toLowerCase()).filter((tag) => tag.length > 0);
  if (options?.capitalize)
    tags = tags.map((tag) => tag.charAt(0).toUpperCase() + tag.slice(1));
  return tags;
}

export const sanitizeTag = (tag: string): string => {
  return tag.toLowerCase().trim().replaceAll('_', ' ');
}