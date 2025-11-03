import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import iaRouter from "./api/ia.js";

dotenv.config({ path: "C:/1OdraugSmartLogistics/a3mentor/backend/.env" });

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.use("/api/ia", iaRouter);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`✅ Backend escuchando en http://localhost:${PORT}`)
);
