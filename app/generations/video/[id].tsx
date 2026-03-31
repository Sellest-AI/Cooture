import { useRoute } from "@/hooks";
import { Id } from "@/lib/convex/client";

export default function Screen() {
  const { id } = useRoute.Params<{ id: Id<'generations'> }>();

  // Check if owned by user, redirect otherwise

  // Copy photoshoot generations UI
  // We should be able to accept or reject a video
  // We should be able to download the video
  // We should be able to generate the video again
  // Auto publish on exit

  return null;
}