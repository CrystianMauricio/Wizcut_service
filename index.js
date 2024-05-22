import http from "http";
import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
import { connectDb } from "./db.js";
import route from "./router.js";

dotenv.config();
connectDb();

const app = express();
app.use(express.json());
app.use(bodyParser.json());
app.use(cors());
app.use(function (err, req, res, next) {
  console.error("error in index.js file: ", err.stack);
});
route(app);

process.on("uncaughtException", (err) => {
  console.log("uncaught exception occurred: ", err);
});

const PORT = 8080;
const server = http.createServer(app);

server.listen(PORT, () => {
  console.log(`HTTP Server is listening at port ${PORT}`);
});
