export const customerTable = `
CREATE TABLE IF NOT EXISTS 'customer' (
    'id' INTEGER PRIMARY KEY AUTOINCREMENT,
    'email' TEXT NOT NULL,
    'name' TEXT NOT NULL
);`;

export const orderTable = `
CREATE TABLE IF NOT EXISTS 'order' (
    'id' INTEGER PRIMARY KEY AUTOINCREMENT,
    'createdate' TEXT NOT NULL,
    'shippingcost' REAL,
    'customerid' INTEGER NOT NULL,
    'carrier' TEXT NOT NULL,
    'trackingid' TEXT NOT NULL,
    FOREIGN KEY ('customerid') REFERENCES customer('id')
);
`;
