import OpenAI from "openai";
import fs from "fs";

const delay = async (time) => {
  await new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, time);
  });
};

export const openai = new OpenAI({
  apiKey: "your_key",
});

export const createAssistant = async () => {
  try {
    const myAssistant = await openai.beta.assistants.create({
      name: "Storage Bot",
      instructions: `Saluer et demander : "Dans quelle ville cherchez-vous un box de stockage ? Quelle surface en m² ?"
        Rechercher : Après avoir reçu les réponses, dire "Veuillez patienter pendant que je recherche", puis lancer getStorage.
        Afficher les résultats : Montrer 3 boxs en priorisant les plus proche distances, plus proches surfaces demandées et promotions éventuelles. Pour un centre, afficher "Centre de stockage : [nom]", pour un particulier, "Chez [nom]".
        Proposer plus d'options : Demander si l'utilisateur veut voir d'autres boxs.
        Collecter les infos : Si intéressé, demander nom et email pour envoyer plus d'infos, puis lancer saveData.
        Clôturer : Si la conversation se termine, exécuter sendEmail pour envoyer un récapitulatif.
      `,
      tools: [
        {
          type: "function",
          function: {
            name: "getStorage",
            description:
              "Renvois les espaces de stockage en fonction de la ville et de la surface minimum demandé",
            parameters: {
              type: "object",
              properties: {
                location: {
                  type: "string",
                  description:
                    "La ville où l'utilisateur recherche un box de stockage",
                },
                surface: {
                  type: "number",
                  description: "La surface de stockage demandée",
                },
              },
              required: ["location", "surface"],
            },
          },
        },
        {
          type: "function",
          function: {
            name: "saveData",
            description: "save personal user information - name and email",
            parameters: {
              type: "object",
              properties: {
                email: { type: "string", description: "User email" },
                name: { type: "string", description: "User name" },
              },
              required: ["email", "name"],
            },
          },
        },
        {
          type: "function",
          function: {
            name: "sendEmail",
            description: "send email to the bot owner with lead information",
            parameters: {
              type: "object",
              properties: {
                email: { type: "string", description: "User email" },
              },
              required: ["email"],
            },
          },
        },
        {
          type: "retrieval",
        },
      ],
      file_ids: ["file_id"],
      model: "gpt-4-1106-preview",
    });

    return myAssistant;
  } catch (err) {
    console.error("Error in creating assistant: ", err);
  }
};

export const createFile = async (filePath) => {
  const file = await openai.files.create({
    file: fs.createReadStream(filePath),
    purpose: "assistants",
  });

  return file;
};

export const createThread = async () => {
  const thread = await openai.beta.threads.create();
  return thread;
};

export const sendMessage = async (message, threadId) => {
  await openai.beta.threads.messages.create(threadId, {
    role: "user",
    content: message,
  });
};

export const startRun = async (threadId, assistantId) => {
  const run = await openai.beta.threads.runs.create(threadId, {
    assistant_id: assistantId,
  });

  return run;
};

export const checkRunStatus = async (threadId, runId) => {
  const runStatus = await openai.beta.threads.runs.retrieve(threadId, runId);

  return runStatus;
};

export const getMessages = async (threadId) => {
  const messages = await openai.beta.threads.messages.list(threadId);

  return messages;
};

export const waitForStatusUpdate = async (threadId, runId) => {
  while (true) {
    const status = await checkRunStatus(threadId, runId);
    if (status.status !== "in_progress" && status.status !== "queued") {
      return status;
    }
    await delay(3000);
  }
};

export const submitAnswer = async (threadId, runId, data) => {
  const toolOutputs = data.map((ele) => ({
    tool_call_id: ele.id,
    output: ele.value,
  }));

  const run = await openai.beta.threads.runs.submitToolOutputs(
    threadId,
    runId,
    {
      tool_outputs: toolOutputs,
    }
  );

  return run;
};

export const generateResponse = async (threadId, runId) => {
  const messages = await getMessages(threadId);
  let res = "";

  for (let i = 0; i < messages.data.length; i++) {
    if (messages.data[i].run_id === runId) {
      for (let j = 0; j < messages.data[i].content.length; j++) {
        res += messages.data[i].content[j].text.value + "\n";
      }
    }
  }
  return res;
};
