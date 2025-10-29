import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import ishikawaRouter from "./api/ishikawaIA.js";

dotenv.config({ path: "C:/1OdraugSmartLogistics/a3mentor/backend/.env" });


const app = express();
app.use(cors());
app.use(bodyParser.json());

app.use("/api/ishikawaIA", ishikawaRouter);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Servidor backend escuchando en http://localhost:${PORT}`));

