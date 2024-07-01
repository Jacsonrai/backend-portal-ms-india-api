import app from "./app";
import config from "../config/index";

const port = config.PORT; // Use environment variable for port or default to 3000

// Start the servers
app.listen(port, () => {
    console.log(`Server listening on http://${process.env.HOST}:${port}`);
});
