import { Router } from "express";
import swaggerRouter from "./swagger.routers";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "../../swagger/swagger";
import userRouter from "../routers/users/user-router";
import authRouter from "../routers/auth/auth";
import roleRouter from "../routers/role/role.router";

const router = Router();
router.use("/user", userRouter);
router.use("/auth", authRouter);
router.use("/role", roleRouter);

router.use(
    "/docs",
    swaggerRouter,
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec)
);

export default router;
