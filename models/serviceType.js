import { getConnection } from "../db.js";

export const addServiceType = async (serviceName) => {
  const connection = getConnection();

  return new Promise((resolve, reject) => {
    connection.query(
      `INSERT INTO service_type (serviceName) VALUES ('${serviceName}')`,
      (err, results, fields) => {
        if (err) reject(err);
        resolve(results);
      }
    );
  });
};