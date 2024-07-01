import swaggerJsdoc from "swagger-jsdoc";

const swaggerOptions: swaggerJsdoc.Options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Your API Name",
            version: "1.0.0",
            description: "Your API Description",
        },
    },
    servers: [
        {
            url: "http://localhost:5002/",
        },
    ],
    apis: ["**/*.ts"], // Replace with the path to your API routes
};
const swaggerSpecs = swaggerJsdoc(swaggerOptions);
export default swaggerSpecs;
