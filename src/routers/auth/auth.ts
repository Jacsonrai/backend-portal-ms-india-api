import { Router, query } from "express";
import { sql, poolPromise } from "../../../db/db.config";
import {
    REDIRECT_URI,
    POST_LOGOUT_REDIRECT_URI,
} from "../../../config/msal.config";
import config from "../../../config";
import axios from "axios";
import jwt from "jsonwebtoken";

const router = Router();

const authUrl = `https://login.microsoftonline.com/${config.TENANT_ID}/oauth2/v2.0/authorize`;
const tokenUrl = `https://login.microsoftonline.com/${config.TENANT_ID}/oauth2/v2.0/token`;
const generateAccessToken = (user: any) => {
    return jwt.sign(user, config.JWT_SECRET, { expiresIn: "15m" });
};

const generateRefreshToken = (user: any) => {
    return jwt.sign(user, config.JWT_SECRET, { expiresIn: "7d" });
};
async function getUserByEmail(email: string) {
    try {
        const pool = await poolPromise;
        const users: any = await pool
            .request()
            .input("Email", sql.NVarChar(), email)
            .execute("GetUserByEmailWithRoles");
        return users.recordset;
    } catch (err: any) {
        console.error("Error while querying database:", err.message);
    }
}
router.get("/sign-in", (req, res) => {
    const authParams = new URLSearchParams({
        client_id: config.CLIENT_ID,
        response_type: "code",
        redirect_uri: "http://localhost:5001/api/v1/auth/callback",
        response_mode: "query",
        scope: "openid profile email",
        // state:''
    }).toString();
    res.redirect(`${authUrl}?${authParams}`);
});
router.get("/callback", async (req, res) => {
    const { code } = req.query;
    if (typeof code !== "string") {
        return res.status(400).send("Invalid code parameter");
    }
    const tokenParams = new URLSearchParams({
        grant_type: "authorization_code",
        code: code,
        redirect_uri: "http://localhost:5001/api/v1/auth/callback",
        client_id: config.CLIENT_ID,
        client_secret: config.CLIENT_SECRET,
    }).toString();

    try {
        const response = await axios.post(tokenUrl, tokenParams, {
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
        });

        const { access_token, id_token } = response.data;
        const decodedToken: any = jwt.decode(id_token);
        const { preferred_username } = decodedToken;
        const getUser = await getUserByEmail(preferred_username);
        const accessToken = generateAccessToken({ getUser });
        const refreshToken = generateRefreshToken({ getUser });

        res.cookie("at_token", accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
        });
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
        });
        res.redirect("http://localhost:3000");
    } catch (error) {
        res.status(500).send("Error exchanging code for tokens");
    }
});
// router.get("/redirect", authProvider.handleRedirect());

export default router;
