import { getConnection } from "../db.js";

export const addMessage = async (userId, serviceId, message) => {
  const connection = getConnection();
  let escapedMessage = message.replace(/'/g, "''");
  return new Promise((resolve, reject) => {
    connection.query(
      `INSERT INTO message (userId, serviceId, prompt) VALUES (${userId}, ${serviceId}, '${escapedMessage}')`,
      (err, results, fields) => {
        if (err) reject(err);
        resolve(results);
      }
    );
  });
};

export const getRecentMessages = async (userId, serviceId) => {
  const connection = getConnection();
  return new Promise((resolve, reject) => {
    connection.query(
      `SELECT * from message WHERE userId = ${userId} AND serviceId = ${serviceId} ORDER BY id DESC LIMIT 10`,
      (err, results, fields) => {
        if (err) reject(err);
        let resMsg = "These are my previous messages:\n";
        for (let i = results.length - 1; i > 0; i--) {
          resMsg += results[i].prompt + "\n";
        }
        resMsg += "Please answer to this new message:\n" + results[0].prompt;

        resolve(resMsg);
      }
    );
  });
};

export const updateMessage = async (messageId, answer, thread) => {
  const connection = getConnection();
  let escapedAnswer = answer.replace(/'/g, "''");
  return new Promise((resolve, reject) => {
    connection.query(
      `UPDATE message SET answer = '${escapedAnswer}', thread = '${thread}' WHERE id = ${messageId}`,
      (err, results, fields) => {
        if (err) reject(err);
        resolve(results);
      }
    );
  });
};
