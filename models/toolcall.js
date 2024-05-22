import { getConnection } from "../db.js";

export const createAssistantFunctions = async (
  toolcall,
  userId,
  serviceId,
  thread
) => {
  const connection = getConnection();
  let escapedToolcall = toolcall.replace(/'/g, "''");

  return new Promise((resolve, reject) => {
    connection.query(
      `INSERT INTO assistant_functions (toolcall, userId, serviceId, thread) VALUES ('${escapedToolcall}', ${userId}, ${serviceId}, '${thread}')`,
      (err, results, fields) => {
        if (err) reject(err);
        resolve(results);
      }
    );
  });
};
