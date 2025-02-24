import { error, redirect } from '@sveltejs/kit';
import { ElevenLabsClient } from "elevenlabs";
import { PRIVATE_ELEVENLABS_API_KEY, PRIVATE_HF_TOKEN } from "$env/static/private";
import { Readable } from "stream";
import fs from "fs";
import { p } from 'framer-motion/client';
import ffmpeg from 'ffmpeg';
import { HfInference } from "@huggingface/inference";


const documentsRegex = /# (.+)(\n.+)+/g;

const client = new ElevenLabsClient({
  apiKey: PRIVATE_ELEVENLABS_API_KEY,
});
const inference = new HfInference(PRIVATE_HF_TOKEN);

export const load = async ({ locals: { safeGetSession } }) => {
  const { session } = await safeGetSession();
}

export const actions = {
  signup: async ({ request, locals: { supabase, safeGetSession } }) => {
    const formData = await request.formData()
    const email = formData.get('email')

    const { session } = await safeGetSession();
    if (!session) {
      redirect(303, '/')
    } else {
      const { data, error } = await supabase.auth.updateUser(session.user.id, { email })
      if (error) {
        console.error(error)
        redirect(303, '/auth/error')
      }

      console.log(data, email, error)
    }
  },
  login: async ({ request, locals: { supabase } }) => {
    const formData = await request.formData()
    const email = formData.get('email')
    const password = formData.get('password')

    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      console.error(error)
      redirect(303, '/auth/error')
    } else {
      redirect(303, '/app/main')
    }
  },
  createAgent: async ({ request, locals: { supabase, safeGetSession } }) => {
    const formData = await request.formData()
    const conversationId = formData.get('id')
    const audio = formData.get('audio')
    const images = JSON.parse(formData.get('images'))

    const { session } = await safeGetSession();

    // try 10 times, with 6 second delay
    let dataCollectionResults = null;
    for (let i = 0; i < 10; i++) {
      try {
        const conversation = await client.conversationalAi.getConversation(conversationId)
        if (!conversation) {
          throw new Error("Failed to get conversation");
        }

        dataCollectionResults = conversation?.analysis?.data_collection_results;
        if (!dataCollectionResults) {
          throw new Error("Failed to get data collection results");
        }

        console.log(dataCollectionResults)
        break;
      } catch (e) {
        await new Promise((resolve) => setTimeout(resolve, 6000));
      }
    }

    if (!dataCollectionResults) {
      throw new Error("Failed to get dataCollectionResults");
    }

    const name = dataCollectionResults.name.value;
    const heightFt = dataCollectionResults.height_ft.value;
    const heightIn = dataCollectionResults.height_in.value;
    const age = dataCollectionResults.age.value;
    const profession = dataCollectionResults.profession.value;
    const location = dataCollectionResults.location.value;

    const { data, error } = await supabase.from('profile').upsert({
      id: session.user.id,
      name,
      age,
      career: profession,
      pics: images,
      agent_id: null,
      location,
      height_ft: heightFt,
      height_in: heightIn,
    });

    if (error) {
      console.log(data, error)
      throw new Error("Failed to insert profile");
    }

    console.log(data)

    const privateProfileDocs = dataCollectionResults.private_profile_docs.value;

    // find all documents
    const matches = privateProfileDocs?.matchAll(documentsRegex) ?? [];
    const documents = Array.from(matches).map((match) => {
      return {
        title: match[1].trim(),
        body: match[2].trim()
      }
    });

    console.log(documents)

    const knowledgeBase = [];
    for (const document of documents) {
      const fileBlob = new File([document.body], document.title, { type: 'text/plain' });
  
      const knowledgePOST = await client.conversationalAi.addToKnowledgeBase({
        "file": fileBlob
      })
  
      if (!knowledgePOST.id) {
        throw new Error("Failed to upload to knowledge base");
      }

      knowledgeBase.push({
        type: "file",
        name: document.title,
        id: knowledgePOST.id
      })
    }

    console.log(audio)
    const response = await client.voices.add({
      files: [audio],
      name,
    })

    if (!response.voice_id) {
      throw new Error("Failed to create voice");
    }

    console.log(response)

    const convResponse = await client.conversationalAi.createAgent({
      conversation_config: {
        "agent": {
          "prompt": {
            "knowledge_base": knowledgeBase
          }
        },
        "tts":{
          "voice_id": response.voice_id
        }
      }
    })

    console.log(convResponse)
    
    const agentId = convResponse.agent_id;
    
    const { data: profileData, error: profileError } = await supabase.from('profile').update({
      agent_id: agentId
    }).eq('id', session.user.id);

    if (profileError) {
      console.log(profileData, profileError)
      throw new Error("Failed to update profile");
    }

    console.log(profileData)

    return agentId;
  }
}

