import { Router, ROUTES, useRoute } from "@/hooks";
import { useAccount } from "@/lib/convex/auth";
import { api, Id, useQuery } from "@/lib/convex/client";

export default function Screen() {
  const { userId } = useAccount();

  const { id } = useRoute.Params<{ id: Id<'generations'> }>();
  const { data: post, isPending } = useQuery(api.router.generations.getOne.anon, { id });

  // If loaded and post doesn't belong to user
  if (!isPending && userId && (post?.userId !== userId))
    return <Router.Redirect
      href={ROUTES.POST.PATH}
      pathParams={{ id: id }}
    />

  // Create the page it must include
  // Pending generation in loading state
  // Post swipe carousel -like with re-ordering (optional, second step)
  // If has pending generations put it as first items
  // Handle video and image types
  // Save / discard button
  // Header should be "settings" and include a back button to the post page
  // For each generations we should be able to hide/show it in the post page and download it
  // If everything is hidden we should hide the post in the feed and display a message "this will hide your post"
  return null;
}