"use server";

import sqlite3 from "sqlite3";
import { customerTable, orderTable } from "./constants";

const db = new sqlite3.Database('":memory:"');

export async function seed() {
  db.serialize(() => {
    db.run(customerTable);
    db.run(orderTable);

    db.run(`
REPLACE INTO 'customer' ('id', 'email', 'name')  
VALUES  
    (1, 'lucas.bill@example.com', 'Lucas Bill'),  
    (2, 'mandy.jones@example.com', 'Mandy Jones'),  
    (3, 'salim.ali@example.com', 'Salim Ali'),  
    (4, 'jane.xiu@example.com', 'Jane Xiu'),  
    (5, 'john.doe@example.com', 'John Doe'),  
    (6, 'jane.smith@example.com', 'Jane Smith'),  
    (7, 'sandeep.bhushan@example.com', 'Sandeep Bhushan'),  
    (8, 'george.han@example.com', 'George Han'),  
    (9, 'asha.kumari@example.com', 'Asha Kumari'),  
    (10, 'salma.khan@example.com', 'Salma Khan');
    `);

    db.run(`
REPLACE INTO 'order' ('id', 'createdate', 'shippingcost', 'customerid', 'carrier', 'trackingid')
VALUES
    (1, '2024-08-05', 3, 4, '', ''),
    (2, '2024-08-02', 3, 6, '', ''),
    (3, '2024-08-04', 1, 10, '', ''),
    (4, '2024-08-03', 2, 8, '', ''),
    (5, '2024-08-10', 2, 10, '', ''),
    (6, '2024-08-01', 3, 3, '', ''),
    (7, '2024-08-02', 1, 4, '', ''),
    (8, '2024-08-04', 3, 2, '', ''),
    (9, '2024-08-07', 3, 8, '', ''),
    (10, '2024-08-09', 1, 9, '', ''),
    (11, '2024-08-07', 2, 7, '', ''),
    (12, '2024-08-03', 3, 9, '', ''),
    (13, '2024-08-06', 3, 5, '', ''),
    (14, '2024-08-01', 2, 2, '', ''),
    (15, '2024-08-05', 1, 3, '', ''),
    (16, '2024-08-02', 2, 5, '', ''),
    (17, '2024-08-03', 1, 7, '', ''),
    (18, '2024-08-06', 1, 6, '', ''),
    (19, '2024-08-04', 2, 1, '', ''),
    (20, '2024-08-01', 1, 1, '', '');    
    `);
  });
}

export async function execute(sql: string) {
  return await new Promise((resolve, reject) => {
    try {
      //   db.all("SELECT 'c'.'name', COUNT('o'.'id') FROM 'order' 'o' JOIN 'customer' 'c' ON 'o'.'customerid' = 'c'.'id' GROUP BY 'c'.'name' ORDER BY COUNT('o'.'id') DESC LIMIT 1", (error, result) => {
      db.all(sql, (error, result) => {
        if (error) {
          console.log({ error });
          resolve(JSON.stringify(error));
        }

        console.log({ result });
        resolve(result);
      });
    } catch (e) {
      console.log(e);
      reject(e);
    }
  });
}
