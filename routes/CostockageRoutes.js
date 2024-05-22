import express from "express";
import axios from "axios";
import CostockageController from '../controllers/CostockageController.js';
import {
  createUser,
  findUserByPhone,
} from "../models/user.js";
import { setAnswered, checkAnswered } from "../models/whatsappReplyPings.js";
import { findWhatsappInfoById } from "../models/service.js";

const router = express.Router();
var processing = false;
const clientId = 1;
const serviceId = 1;

router.post("/", async (req, res) => {
  let payload = req.body;

  if (!payload["entry"]) return;
  if (!payload["entry"][0]["changes"]["0"]["value"]["messages"]) return;
  const isAnswered = await checkAnswered(payload["entry"][0]["changes"]["0"]["value"]["messages"][0]["id"]);
  if (isAnswered || processing) return;

  const serviceData = await findWhatsappInfoById(serviceId);
  const { whatsappToken, whatsappTelNo } = serviceData;

  const apiVersion = "v17.0";
  const userMessages = payload["entry"][0]["changes"]["0"]["value"]["messages"];

  if (userMessages) {
    let userId;
    const userno = payload["entry"][0]["changes"]["0"]["value"]["messages"][0]["from"];
    const usermessage = payload["entry"][0]["changes"]["0"]["value"]["messages"][0]["text"]["body"];
    const user = await findUserByPhone(clientId, userno);

    if (!user.length) {
      const newUser = await createUser(clientId, userno);
      userId = newUser.insertId;
    } else {
      userId = user[0].id;
    }

    processing = true;
    let resultMessage = await CostockageController(userId, usermessage);
    if (!resultMessage)
      resultMessage = "Veuillez patienter pendant que je recherche.";

    console.log('Costockage result msg: ', resultMessage);

    const endpoint = `https://graph.facebook.com/${apiVersion}/${whatsappTelNo}/messages`;
    const data = {
      messaging_product: "whatsapp",
      to: userno,
      text: {
        body: resultMessage,
      },
    };

    const result = await axios
      .post(endpoint, data, {
        headers: {
          Authorization: `Bearer ${whatsappToken}`,
          "Content-Type": "application/json",
        },
      })
      .catch((err) => {
        console.log("error in sending result whatsapp message in costockage routes: ", err.message);
      });

    await setAnswered(
      payload["entry"][0]["changes"]["0"]["value"]["messages"][0]["id"]
    );
    processing = false;

    if (result && result.data) {
      return res.status(200).json(result.data);
    } else {
      return res.status(200).json("error");
    }
  }
});

router.get("/", async (req, res) => {
  const VERIFY_TOKEN = "Ben";

  let queryParams = req?.query;
  if (queryParams != null) {
    const mode = queryParams["hub.mode"];
    if (mode == "subscribe") {
      const verifyToken = queryParams["hub.verify_token"];
      if (verifyToken == VERIFY_TOKEN) {
        let challenge = queryParams["hub.challenge"];
        res.json(parseInt(challenge));
      } else {
        const responseBody = "Error, wrong validation token";
        res.status(403).json({ responseBody });
      }
    } else {
      const responseBody = "Error, wrong mode";
      res.status(403).json({ responseBody });
    }
  } else {
    const responseBody = "Error, no query parameters";
    res.status(403).json({ responseBody });
  }
});

export default router;