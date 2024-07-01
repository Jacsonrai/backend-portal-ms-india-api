import { Router } from "express";
import { getRoleList } from "../../controllers/role/role-contoller";
const router = Router();

router.get("/list", getRoleList);

export default router;
