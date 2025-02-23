import { PRIVATE_FAL_AI_KEY } from "$env/static/private";
import { IMAGE_CAPTIONING_MODEL } from "$lib/constants";
import { fal } from "@fal-ai/client";
import { json } from '@sveltejs/kit';


fal.config({
  credentials: PRIVATE_FAL_AI_KEY,
});

export async function POST({ request }) {
  const formData = await request.formData()
  const imageUrl = formData.get('image')

  if (!imageUrl || imageUrl == "null") {
    return json(
      {
        error: "No image provided",
      },
      { status: 400 }
    );
  }

  const result = await fal.subscribe(IMAGE_CAPTIONING_MODEL, {
    input: {
      image_url: imageUrl,
    },
    logs: true,
    onQueueUpdate: (update) => {
      if (update.status === "IN_PROGRESS") {
        update.logs.map((log) => log.message).forEach(console.log);
      }
    },
  });

  return json(result);
}