import nodemailer from "nodemailer";
import {
  createThread,
  sendMessage,
  startRun,
  waitForStatusUpdate,
  submitAnswer,
  generateResponse,
} from "../service/openai.js";
import { getAssistant } from "./ServiceController.js";
import { findUserById, updateUserNameAndEmail } from "../models/user.js";
import {
  addMessage,
  updateMessage,
  getRecentMessages,
} from "../models/message.js";
import {
  createThread as createUserThread,
  updateUserQuery,
  updateThreadShouldUpdate,
  updateThread,
  findThread,
} from "../models/thread.js";
import { getStorage } from "../service/storage.js";
import { createAssistantFunctions } from "../models/toolcall.js";

const transporter = nodemailer.createTransport({
  host: "email-smtp.eu-west-1.amazonaws.com",
  port: 25,
  auth: {
    user: "AKIAXTSNMAOF3H6FTXZY",
    pass: "BANprwjVKUPl0HkgiBYmWrhmXiBJ9AxyDG/YojAAUrN4",
  },
});

const serviceId = 1;

const cotockageController = async (userId, msg) => {
  const assistant = await getAssistant(1);

  let threadId;
  const user = await findUserById(userId);
  const thread = await findThread(userId, serviceId);

  if (thread.length) {
    if (!thread[0].thread) {
      const nTread = await createThread();
      await updateThread(userId, serviceId, nTread.id);
      threadId = nTread.id;
    } else {
      threadId = thread[0].thread;
    }
  } else {
    const nTread = await createThread();
    await createUserThread(userId, serviceId, nTread.id);
    threadId = nTread.id;
  }

  const res = await ask(userId, msg, threadId, assistant);
  return res;
};

const ask = async (
  userId,
  message,
  threadId,
  assistantId,
  newThread = false,
  messageId = -1
) => {
  try {
    await sendMessage(message, threadId);
    const run = await startRun(threadId, assistantId);
    if (!newThread) {
      const nMessage = await addMessage(userId, serviceId, message);
      messageId = nMessage.insertId;
    }

    const status = await waitForStatusUpdate(threadId, run.id);

    if (status.status === "completed") {
      const res = await generateResponse(threadId, run.id);
      await updateMessage(messageId, res, threadId);
      return res;
    } else if (status.status === "requires_action") 
    {
      const toolCalls = status.required_action.submit_tool_outputs.tool_calls;
      await createAssistantFunctions(JSON.stringify(toolCalls), userId, serviceId, threadId);

      let data = [];

      for (let i = 0; i < toolCalls.length; i++) {
        const functionName = toolCalls[i].function.name;
        const args = JSON.parse(toolCalls[i].function.arguments);

        if (functionName === "getStorage") {
          const currentThread = await findThread(userId, serviceId);
          if (currentThread[0].shouldUpdateThread) {
            const newThread = await createThread();
            const newThreadId = newThread.id;
            await updateThreadShouldUpdate(userId, serviceId, 0);
            const recentMessages = await getRecentMessages(userId, serviceId);
            const askRes = await ask(
              userId,
              recentMessages,
              newThreadId,
              assistantId,
              true,
              messageId
            );
            await updateThread(userId, serviceId, newThreadId);
            return askRes;
          }

          const location = args.location;
          const square = args.surface;
          if (currentThread[0].thread !== threadId) {
            await updateUserQuery(userId, serviceId, `${location}-${square}`);
          }
          let result = await getStorage(location.toLowerCase(), square);
          data.push({
            id: toolCalls[i].id,
            value: JSON.stringify(result),
          });
        } else if (functionName === "saveData") {
          const email = args.email;
          const name = args.name;
          await updateUserNameAndEmail(userId, name, email);

          data.push({
            id: toolCalls[i].id,
            value: "saved",
          });
        } else if (functionName === "sendEmail") {
          let flag = false;
          const currentUser = await findUserById(userId);
          const currentThread = await findThread(userId, serviceId);
          await transporter
            .sendMail({
              from: "contact@virtualtry.com",
              to: "webanim@gmail.com",
              subject: "New lead information",
              html: `<!DOCTYPE html>
              <html lang="en">
              <head>
                <meta charset="UTF-8">
                <meta http-equiv="X-UA-Compatible" content="IE=edge">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>New Lead Arrival</title>
              </head>
              <body>
                <h1>New lead information</h1>
                <p>Name: ${currentUser[0].name}</p>
                <p>Email: ${currentUser[0].email}</p>
                <p>Asked cities: ${currentThread[0].query}</p>
              </body>
              </html>
              `,
            })
            .catch((err) => {
              console.log("error in sending email: \n", err);
              data.push({
                id: toolCalls[i].id,
                value: "Sending email to my owner failed.",
              });
              flag = true;
            });
          if (!flag) {
            data.push({
              id: toolCalls[i].id,
              value: "Sent your information successfully to my owner.",
            });
          }
        }
      }
      const submitRun = await submitAnswer(threadId, run.id, data);

      const submitStatus = await waitForStatusUpdate(threadId, submitRun.id);
      if (submitStatus.status === "completed") {
        const res = await generateResponse(threadId, submitRun.id);
        await updateThreadShouldUpdate(userId, serviceId, 1);
        await updateMessage(messageId, res, threadId);
        return res;
      } else {
        const newThread = await createThread();
        const newThreadId = newThread.id;
        await updateThreadShouldUpdate(userId, serviceId, 0);
        const recentMessages = await getRecentMessages(userId, serviceId);
        const askRes = await ask(
          userId,
          recentMessages,
          newThreadId,
          assistantId,
          true,
          messageId
        );
        await updateThread(userId, serviceId, newThreadId);
        return askRes;
      }
    } else if (status.status === "failed") {
      return status.last_error.message;
    } else {
      console.log("returning null because of unknown status: ", status);
      return null;
    }
  } catch (err) {
    console.log("error in ask service: ", err);
    const newThread = await createThread();
    const newThreadId = newThread.id;
    await updateThreadShouldUpdate(userId, serviceId, 0);

    const recentMessages = await getRecentMessages(userId, serviceId);
    const askRes = await ask(
      userId,
      recentMessages,
      newThreadId,
      assistantId,
      true,
      messageId
    );
    await updateThread(userId, serviceId, newThreadId);
    return askRes;
  }
};

export default cotockageController;
