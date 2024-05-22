import { getConnection } from "../db.js";

export const setAnswered = async (messageId) => {
  const connection = getConnection();
  return new Promise((resolve, reject) => {
    connection.query(
      `INSERT INTO whatsapp_reply_pings (messageId) VALUES ('${messageId}')`,
      (err, results, fields) => {
        if (err) reject(err);
        resolve(results);
      }
    );
  });
};

export const checkAnswered = async (messageId) => {
  const connection = getConnection();
  return new Promise((resolve, reject) => {
    connection.query(
      `SELECT * FROM whatsapp_reply_pings WHERE messageId = '${messageId}'`,
      (err, rows, fields) => {
        if (err) reject(err);
        if (rows.length) resolve(true);
        else return resolve(false);
      }
    );
  });
};
