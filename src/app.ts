import express, { type Express, type Response, type Request } from "express";
import cors from "cors";
import router from "./routers";
import session from "express-session";
import { authProvider } from "./authprovider/authprovider";

const app: Express = express();

//middleware
app.use(
    cors({
        origin: "http://localhost:3000", // React app's URL
        credentials: true, // Allow cookies
    })
);
app.use(express.json());
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.get("/", (req: Request, res: Response) => {
    const data = { message: "Hello from the API!" };
    res.json(data);
});
authProvider.syncUsers();
// app.post("/webhook-endpoint", (req, res) => {
//     console.log(req);
//     if (req.query.validationToken) {
//         // Respond to the validation request
//         res.status(200).send(req.query.validationToken);
//     } else {
//         // Handle regular webhook notifications
//         console.log("Webhook notification received:", req.body);
//         res.sendStatus(200);
//     }
// });

app.use(
    session({
        secret: process.env.EXPRESS_SESSION_SECRET as string,
        resave: false,
        saveUninitialized: false,
        cookie: {
            httpOnly: true,
            secure: false, // set this to true on production
        },
    })
);
app.use("/api/v1", router);

export default app;
