import { error } from '@sveltejs/kit';

export async function load({ params, locals: { safeGetSession } }) {
  const { session } = await safeGetSession();

  if (!session) {
    return error(401, 'Unauthorized');
  }

  const { user: agentId } = params;

  return {
    agentId
  }
}
