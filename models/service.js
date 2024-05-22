import { getConnection } from "../db.js";

export const findServiceById = async (id) => {
  const connection = getConnection();
  return new Promise((resolve, reject) => {
    connection.query(
      `SELECT * FROM service WHERE id = ${id}`,
      (err, rows, fields) => {
        if (err) reject(err);
        if (rows.length) resolve(rows[0].assistantId);
        else reject("not found");
      }
    );
  });
};

export const findWhatsappInfoById = async (id) => {
  const connection = getConnection();
  return new Promise((resolve, reject) => {
    connection.query(
      `SELECT whatsappToken, whatsappTelNo FROM service WHERE id = ${id}`,
      (err, rows, fields) => {
        if (err) reject(err);
        if (rows.length) resolve(rows[0]);
        else reject("not found");
      }
    );
  });
};

export const createService = async (
  serviceName,
  assistantId,
  clientId,
  serviceType,
  description = "",
  whatsappToken = "",
  whatsappTelNo = "",
) => {
  const connection = getConnection();
  const escapedDescription = description.replace(/'/g, "''");
  return new Promise((resolve, reject) => {
    connection.query(
      `INSERT INTO service (serviceName, assistantId, clientId, serviceType, description, whatsappToken, whatsappTelNo) VALUES 
      ('${serviceName}', '${assistantId}', '${clientId}', '${serviceType}', '${escapedDescription}', '${whatsappToken}', '${whatsappTelNo}')`,
      (err, results, fields) => {
        if (err) reject(err);
        resolve(results);
      }
    );
  });
};
