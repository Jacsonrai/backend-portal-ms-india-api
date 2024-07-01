import sql, { ConnectionPool } from "mssql";

const dbConfig = {
    server: "localhost",
    database: "DAP",
    user: "sa",
    password: "Spaceagent123@",
    options: {
        enableArithAbort: true,
        encrypt: false,
        trustServerCertificate: false,
    },
    // driver: "msnodesqlv8",
};
const poolPromise: Promise<ConnectionPool> = (async () => {
    try {
        const pool = await new sql.ConnectionPool(dbConfig).connect();
        console.log("Connected to MSSql database");
        return pool;
    } catch (err) {
        console.log("Database Connection Failed! Bad Config: ", err);
        throw err;
    }
})();
export { sql, poolPromise };
