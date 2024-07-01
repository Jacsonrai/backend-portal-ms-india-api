import { Router, Request, Response } from "express";
const sql = require("mssql/msnodesqlv8");
const router = Router();
import Joi, { Schema, ValidationResult } from "joi";

// create interface for a Categorys object
interface Users {
    ID: number;
    FirstName: string;
    LastName: string;
    Address: string;
    City: string;
    County: string;
    Email: string;
    PhoneNumber: string;
    Application_ID: number;
    Role_ID: number;
    Created_By: string;
    Created_On: string;
}

// Define Joi schama for validation purposes
const UsersSchema: Schema = Joi.object({
    // CategoryID: Joi.number().required(),
    // FromDate: Joi.date().required(),
    // ToDate: Joi.date(),
    // PercentageValue: Joi.number().precision(1).required(),
    // UpdatedBy: Joi.string().required(),

    ID: Joi.number().required(),
    FirstName: Joi.string().required(),
    LastName: Joi.string().required(),
    Address: Joi.string().required(),
    City: Joi.string().required(),
    County: Joi.string().required(),
    Email: Joi.string().required(),
    PhoneNumber: Joi.string().required(),
    Application_ID: Joi.number().precision(1).required(),
    Role_ID: Joi.number().precision(1).required(),
    Created_By: Joi.string().required(),
    Created_On: Joi.string().required(),
});

var sqlConfig = {
    server: `DESKTOP-A2VP9VB\\MSSQLSERVER2022`, // eg:: 'DESKTOP_mjsi\\MSSQLEXPRESS'
    databse: "DAP",
    // user: 'sa', // please read above note
    // password: 'your password', // please read above note
    options: {
        trustedConnection: true,
    },
    driver: "msnodesqlv8",
};

router.post("/insert-user", async (req: Request, res: Response) => {
    const {
        FirstName,
        LastName,
        Address,
        City,
        County,
        Email,
        PhoneNumber,
        Application_ID,
        Role_ID,
        Created_By,
    } = req.body;

    try {
        await sql.connect(sqlConfig);
        const request = new sql.Request();

        const { error }: ValidationResult<Users> = UsersSchema.validate(
            req.body
        );

        if (error) {
            return res.status(400).json({
                message: "Bad Request",
                errors: error.details[0].message,
            });
        }

        request.input("FirstName", FirstName);
        request.input("LastName", LastName);
        request.input("Address", Address);
        request.input("City", City);
        request.input("County", County);
        request.input("Email", Email);
        request.input("PhoneNumber", PhoneNumber);
        request.input("Application_ID", Application_ID);
        request.input("Role_ID", Role_ID);
        request.input("Created_By", Created_By);

        const result = await request.execute("DAP.dbo.usp_Users");
        console.log("Values inserted successfully.", result);
        res.status(200).send("User inserted successfully.");
    } catch (error) {
        console.error("Error inserting user: ", error);
        res.status(500).send("Error inserting user.");
    }
});
export default router;
