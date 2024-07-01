const sql = require('mssql');

// async function main() {
//   try {
//     // connection string
//     const connStr =
//       'Data Source=sql-devesh-test.database.windows.net;Initial Catalog=devesh-test;User ID=bagwanlinkaap@outlook.com;Connect Timeout=30;Encrypt=True;Trust Server Certificate=False;Authentication=ActiveDirectoryInteractive;Application Intent=ReadWrite;Multi Subnet Failover=False';
//     // Data Source=sql-devesh-test.database.windows.net;Initial Catalog=devesh-test;User ID=bagwanlinkaap@outlook.com;Connect Timeout=30;Encrypt=True;Trust Server Certificate=False;Authentication=ActiveDirectoryInteractive;Application Intent=ReadWrite;Multi Subnet Failover=False
//     // connect to database
//     const pool = await sql.connect(connStr);

//     // query database
//     const result = await pool
//       .request()
//       .query(
//         'SELECT TOP 1000 [CustomerID] ,[Name] ,[Email] FROM [dbo].[Customers]'
//       );

//     console.log(result);
//   } catch (error) {
//     console.log(error);
//   }
// }

//working code
// const config = {
//   user: 'user', // better stored in an app setting such as process.env.DB_USER
//   password: 'admin@123', // better stored in an app setting such as process.env.DB_PASSWORD
//   server: 'mysqlserverdemo1.database.windows.net', // better stored in an app setting such as process.env.DB_SERVER
//   port: 1433, // optional, defaults to 1433, better stored in an app setting such as process.env.DB_PORT
//   database: 'my-sqldb', // better stored in an app setting such as process.env.DB_NAME
//   authentication: {
//     type: 'default',
//   },
//   options: {
//     encrypt: true,
//   },
// };

// main();

const config: any = {
  server: 'DESKTOP-A2VP9VBMSSQLSERVER2022',
  database: 'DAP',
  options: {
    trustedConnection: true,
  },
};
