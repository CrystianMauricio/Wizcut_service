import { getConnection } from "../db.js";

export const getUsers = async () => {
  const connection = getConnection();
  return new Promise((resolve, reject) => {
    connection.query('SELECT * FROM user', (err, rows, fields) => {
      if (err) reject(err);
      resolve(rows);
    });
  });
}

export const findUserById = async (id) => {
  const connection = getConnection();
  return new Promise((resolve, reject) => {
    connection.query(`SELECT * FROM user WHERE id = ${id}`, (err, rows, fields) => {
      if (err) reject(err);
      resolve(rows);
    });
  });
}

export const updateUserNameAndEmail = (userId, name, email) => {
  const connection = getConnection();
  return new Promise((resolve, reject) => {
    connection.query(`UPDATE user SET name = '${name}', email = '${email}' WHERE id = ${userId}`, (err, results, fields) => {
      if (err) reject(err);
      resolve(results);
    })
  })
}

export const findUserByPhone = async (clientId, phone) => {
  const connection = getConnection();
  return new Promise((resolve, reject) => {
    connection.query(`SELECT * FROM user WHERE phone = '${phone}' AND clientId = ${clientId}`, (err, rows, fields) => {
      if (err) reject(err);
      resolve(rows);
    });
  });
}

export const createUser = async (clientId, phone) => {
  const connection = getConnection();
  return new Promise((resolve, reject) => {
    connection.query(`INSERT INTO user (clientId, phone) VALUES (${clientId}, '${phone}')`, (err, results, fields) => {
      if (err) reject(err);
      resolve(results);
    });
  });
}