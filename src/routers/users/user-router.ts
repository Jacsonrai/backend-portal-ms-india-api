import { Router } from "express";
import { addUser, getUserList } from "../../controllers/users/user-controller";
const router = Router();

router.post("/add", addUser);
router.get("/list", getUserList);

export default router;
