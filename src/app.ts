import express, { type Express, type Response, type Request } from "express";
import cors from "cors";
import router from "./routers";
import session from "express-session";
import { authProvider } from "./authprovider/authprovider";
import multer from "multer";
import {
    BlobServiceClient,
    StorageSharedKeyCredential,
} from "@azure/storage-blob";
import { Readable } from "stream";

const app: Express = express();
const upload = multer({ storage: multer.memoryStorage() });

const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME ?? "";
const accountKey = process.env.AZURE_STORAGE_ACCOUNT_KEY ?? "";
const containerName = process.env.AZURE_CONTAINER_NAME ?? "";
const sasToken = process.env.SAS_TOKEN ?? "";

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
// const containerClient =
//     blobServiceClient.getContainerClient(containerName);
// const blockBlobClient = containerClient.getBlockBlobClient(fileName);
// await blockBlobClient.uploadData(req.file.buffer, {
//     blobHTTPHeaders: { blobContentType: fileType },
// });

authProvider.syncUsers();

const sharedKeyCredential = new StorageSharedKeyCredential(
    accountName,
    accountKey
);
const blobServiceClient = new BlobServiceClient(
    `https://${accountName}.blob.core.windows.net`,
    sharedKeyCredential
);
const containerClient = blobServiceClient.getContainerClient(containerName);

async function extractMetaData(reqFile: any) {
    const fileType = reqFile.mimetype.split("/")[1];
    const fileName =
        `${reqFile.originalname}-${Date.now()}` ||
        `image-${Date.now()}.${fileType}`;

    return { fileName, fileType };
}
async function uploadImageStream(blobName: string, dataStream: Readable) {
    const blobClient = containerClient.getBlockBlobClient(blobName);
    await blobClient.uploadStream(dataStream);
    return blobClient.url;
}
app.post("/upload", upload.single("file"), async (req: any, res: any) => {
    let fileName: string;
    let fileType: string;
    try {
        const metaData = await extractMetaData(req.file);
        fileName = metaData.fileName;
        fileType = metaData.fileType;
        const dataStream = new Readable();
        dataStream.push(req.file.buffer);
        dataStream.push(null);
        const imageUrl = await uploadImageStream(fileName, dataStream);
        console.log(imageUrl, "url");

        res.status(200).send("File uploaded successfully");
    } catch (error: any) {
        res.status(500).send(`Error uploading file: ${error.message}`);
    }
});

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
