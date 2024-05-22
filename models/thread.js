import { getConnection } from "../db.js";

export const createThread = async (userId, serviceId, thread) => {
  const connection = getConnection();
  return new Promise((resolve, reject) => {
    connection.query(
      `INSERT INTO thread (userId, serviceId, thread) VALUES (${userId}, ${serviceId}, '${thread}')`,
      (err, results, fields) => {
        if (err) reject(err);
        resolve(results);
      }
    );
  });
};

export const findThread = async (userId, serviceId) => {
  const connection = getConnection();
  return new Promise((resolve, reject) => {
    connection.query(`SELECT * FROM thread WHERE userId = ${userId} AND serviceId = ${serviceId}`, (err, rows, fields) => {
      if (err) reject(err);
      resolve(rows);
    });
  });
}

export const updateThread = (userId, serviceId, newThread) => {
  const connection = getConnection();
  return new Promise((resolve, reject) => {
    connection.query(`UPDATE thread SET thread = '${newThread}' WHERE userId = ${userId} AND serviceId = ${serviceId}`, (err, results, fields) => {
      if (err) reject(err);
      resolve(results);
    })
  })
}

export const updateThreadShouldUpdate = (userId, serviceId, newStatus) => {
  const connection = getConnection();
  return new Promise((resolve, reject) => {
    connection.query(`UPDATE thread SET shouldUpdateThread = '${newStatus}' WHERE userId = ${userId} AND serviceId = ${serviceId}`, (err, results, fields) => {
      if (err) reject(err);
      resolve(results);
    })
  })
}

export const updateUserQuery = (userId, serviceId, query) => {
  const connection = getConnection();
  return new Promise((resolve, reject) => {
    connection.query(`UPDATE thread SET query = '${query}' WHERE userId = ${userId} AND serviceId = ${serviceId}`, (err, results, fields) => {
      if (err) reject(err);
      resolve(results);
    })
  })
}