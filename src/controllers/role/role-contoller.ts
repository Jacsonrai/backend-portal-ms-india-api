import { Request, Response } from "express";
import { poolPromise } from "../../../db/db.config";

async function getRoleList(req: Request, res: Response): Promise<void> {
    try {
        const pool = await poolPromise;
        const roles: any = await pool.request().execute("GetRoleList");
        res.status(200).json({
            message: "role succesfully fetch",
            data: roles.recordset,
        });
    } catch (err: any) {
        res.status(500).send(err.message);
    }
}
export { getRoleList };
