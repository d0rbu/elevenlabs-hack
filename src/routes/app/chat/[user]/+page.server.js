import { error } from '@sveltejs/kit';

export async function load({ params, locals: { safeGetSession } }) {
  const { session } = await safeGetSession();

  if (!session) {
    return error(401, 'Unauthorized');
  }

  const { user: otherUserId } = params;
  const orderedUserIds = [session.user.id, otherUserId].sort();

  const { data, error: fetchError } = await supabase
    .from("chats")
    .select("*")
    .eq("user_0", orderedUserIds[0])
    .eq("user_1", orderedUserIds[1])
    .single();

  if (fetchError) {
    console.error("Error fetching chats:", fetchError);
  } else {
    chats = data;
  }

  return {
    user,
    otherUserId,
    chats
  }
}