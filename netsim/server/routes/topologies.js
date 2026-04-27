const express = require('express');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

/**
 * GET /api/topologies
 * Return only the logged-in user's saved topologies.
 */
router.get('/', async (req, res, next) => {
  try {
    const topologies = await prisma.topology.findMany({
      where: { userId: req.user.id },
      orderBy: { updatedAt: 'desc' },
    });

    // Parse the JSON strings back to objects for the frontend
    const result = topologies.map((t) => ({
      id: t.id,
      name: t.name,
      nodesJson: t.nodesJson,
      edgesJson: t.edgesJson,
      updatedAt: t.updatedAt,
    }));

    res.json(result);
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/topologies
 * Save current canvas state as a new topology.
 */
router.post('/', async (req, res, next) => {
  try {
    const { name, nodesJson, edgesJson } = req.body;

    if (!name || !nodesJson || !edgesJson) {
      return res.status(400).json({ message: 'Name, nodesJson, and edgesJson are required.' });
    }

    const topology = await prisma.topology.create({
      data: {
        userId: req.user.id,
        name,
        nodesJson,
        edgesJson,
      },
    });

    // Log activity
    await prisma.activityLog.create({
      data: { userId: req.user.id, action: 'TOPOLOGY_SAVED: ' + name },
    });
    console.log('[' + new Date().toISOString() + '] User ' + req.user.id + ' saved topology "' + name + '"');

    res.status(201).json({
      id: topology.id,
      name: topology.name,
      nodesJson: topology.nodesJson,
      edgesJson: topology.edgesJson,
      updatedAt: topology.updatedAt,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * PUT /api/topologies/:id
 * Update a topology. Ownership check: topology.userId === req.user.id.
 */
router.put('/:id', async (req, res, next) => {
  try {
    const topologyId = parseInt(req.params.id, 10);
    const { name, nodesJson, edgesJson } = req.body;

    // Find the topology
    const existing = await prisma.topology.findUnique({ where: { id: topologyId } });
    if (!existing) {
      return res.status(404).json({ message: 'Topology not found.' });
    }

    // Ownership check
    if (existing.userId !== req.user.id) {
      return res.status(403).json({ message: 'You do not have permission to edit this topology.' });
    }

    const updated = await prisma.topology.update({
      where: { id: topologyId },
      data: {
        name: name || existing.name,
        nodesJson: nodesJson || existing.nodesJson,
        edgesJson: edgesJson || existing.edgesJson,
      },
    });

    console.log('[' + new Date().toISOString() + '] User ' + req.user.id + ' updated topology ' + topologyId);

    res.json({
      id: updated.id,
      name: updated.name,
      nodesJson: updated.nodesJson,
      edgesJson: updated.edgesJson,
      updatedAt: updated.updatedAt,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * DELETE /api/topologies/:id
 * Delete a topology. Same ownership check.
 */
router.delete('/:id', async (req, res, next) => {
  try {
    const topologyId = parseInt(req.params.id, 10);

    // Find the topology
    const existing = await prisma.topology.findUnique({ where: { id: topologyId } });
    if (!existing) {
      return res.status(404).json({ message: 'Topology not found.' });
    }

    // Ownership check
    if (existing.userId !== req.user.id) {
      return res.status(403).json({ message: 'You do not have permission to delete this topology.' });
    }

    await prisma.topology.delete({ where: { id: topologyId } });

    console.log('[' + new Date().toISOString() + '] User ' + req.user.id + ' deleted topology ' + topologyId);

    res.json({ message: 'Topology deleted.' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
