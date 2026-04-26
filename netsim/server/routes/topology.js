import express from "express";
import { prisma } from "../prisma.ts";
import { authMiddleware } from "../middleware/auth.js";


const router = express.Router();

router.use(authMiddleware);

router.get("/", async (req, res) => {
  const data = await prisma.topology.findMany({
    where: { userId: req.user.id },
  });
  res.json(data);
});

router.get("/:id", async (req, res) => {
  const topo = await prisma.topology.findUnique({
    where: { id: Number(req.params.id) },
  });

  if (!topo || topo.userId !== req.user.id)
    return res.status(403).json({ message: "Forbidden" });

  res.json(topo);
});

router.post("/", async (req, res) => {
  const { name, nodesJson, edgesJson } = req.body;

  const topo = await prisma.topology.create({
    data: {
      name,
      nodesJson,
      edgesJson,
      userId: req.user.id,
    },
  });

  res.json(topo);
});

router.delete("/:id", async (req, res) => {
  await prisma.topology.delete({
    where: { id: Number(req.params.id) },
  });

  res.json({ message: "Deleted" });
});

export default router;