const request = require("supertest");
const express = require("express");
import homeRouter from "./home.routers"; // replace with the path to your router

describe("Home Router", () => {
    test("should have a route", async () => {
        const app = express();
        app.use("/", homeRouter);

        const response = await request(app).get("/");

        expect(response.status).toBe(200);
        // Add more assertions based on the expected response
    });
});
