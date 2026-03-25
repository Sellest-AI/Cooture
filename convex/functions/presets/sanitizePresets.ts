import { Doc } from "../../_generated/dataModel";
import { QueryCtx } from "../../procedures";
import { getImage } from "../images";

export const sanitizePresets = async (ctx: QueryCtx, presets: Doc<'presets'>[]) => {
  // Sanitize presets by removing prompts
  const sanitizedPresets = await Promise.all(presets.map(async ({ prompts, ...rest }) => {
    const hasMultipleSubjects = prompts.some((p) => p.subjects.length > 1);

    const cover = await getImage(ctx, rest.imageIds[0]);
    if (!cover) return null;

    return {
      ...rest,
      expectedResults: prompts.length,
      hasMultipleSubjects,
      cover,
    }
  }));

  return sanitizedPresets;
}