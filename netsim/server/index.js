import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import authRoutes from "./routes/auth.js";
import topoRoutes from "./routes/topology.js";

dotenv.config();

const app = express();

app.use(cors({
  origin: "http://localhost:5173"
}));

app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/topologies", topoRoutes);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong." });
});

app.listen(5000, () => console.log("Server running on 5000"));