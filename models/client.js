import { getConnection } from "../db.js";

export const addClient = async (clientName, clientDescription) => {
  const connection = getConnection();
  return new Promise((resolve, reject) => {
    connection.query(
      `INSERT INTO client (name, description) VALUES ('${clientName}', '${clientDescription}')`,
      (err, results, fields) => {
        if (err) reject(err);
        resolve(results);
      }
    );
  });
};
