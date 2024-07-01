import { sql, poolPromise } from "../../../db/db.config";
import { Request, Response } from "express";
interface AddUserDto {
    firstName: string;
    lastName: string;
    email: string;
}
async function addUser(req: Request, res: Response): Promise<void> {
    try {
        const { firstName, lastName, email }: AddUserDto = req.body;
        const pool = await poolPromise;

        const userData = pool
            .request()
            .input("FirstName", sql.NVarChar, firstName)
            .input("LastName", sql.NVarChar, lastName)
            .input("Email", sql.NVarChar, email)
            .execute("AddUser");

        res.status(200).send({
            message: "user added successfully",
            // data: userData,
        });
    } catch (error: any) {
        res.status(500).send(error.message);
    }
}
async function getUserList(req: Request, res: Response): Promise<void> {
    try {
        const pool = await poolPromise;
        const users: any = await pool.request().execute("GetUsersWithRoles");

        res.status(200).send({
            message: "user succesfully fetch",
            data: users.recordset,
        });
    } catch (error: any) {
        res.status(500).send(error.message);
    }
}
// async function getUserByEmail(req:Request,res:Response):Promise<void> {
//     try{
//         const pool=await poolPromise;
//         const email=req.body.
//         const users:any=await pool.request().execute("GetUserByEmail")
//     }

// }
export { addUser, getUserList };
