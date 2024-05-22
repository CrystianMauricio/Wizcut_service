import express from "express";
import WizcutController from "../controllers/WizcutController.js";
import axios from "axios";
const router = express.Router();
var processing = false;
const serviceId = 2;
const clientId = 2;

router.post("/fortest", async (req, res) => {
  let payload = req.body;

  if (!payload["message"]) return;
  let resultMessage = await WizcutController(payload["message"]);
  if (!resultMessage)
    resultMessage = "Veuillez patienter pendant que je recherche.";

  console.log(resultMessage);
  console.log(req.body.message);
  res.send(resultMessage);
});

export default router;
