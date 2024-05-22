import mysql from "mysql";

var connection; 

export const connectDb = () => {
  setTimeout(() => {
    connection = mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });
    console.log("Database connected");
  }, 500);
}

export const getConnection = () => {
    return connection;
}