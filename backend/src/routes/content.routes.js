import { Router } from "express";
import { createFeedback, listRows } from "../repositories/content.repository.js";

const router = Router();

function asyncRoute(handler) {
  return async (req, res, next) => {
    try {
      await handler(req, res, next);
    } catch (error) {
      next(error);
    }
  };
}

router.get("/schools", asyncRoute(async (_req, res) => {
  res.json({ data: await listRows("schools") });
}));

router.get("/materials", asyncRoute(async (req, res) => {
  res.json({ data: await listRows("materials", req.query) });
}));

router.get("/videos", asyncRoute(async (req, res) => {
  res.json({ data: await listRows("videos", req.query) });
}));

router.get("/events", asyncRoute(async (req, res) => {
  res.json({ data: await listRows("events", req.query) });
}));

router.get("/notifications", asyncRoute(async (req, res) => {
  res.json({ data: await listRows("notifications", req.query) });
}));

router.post("/feedback", asyncRoute(async (req, res) => {
  const { student_id, category = "general", message, district } = req.body ?? {};

  if (!message || typeof message !== "string") {
    return res.status(400).json({ error: "message is required" });
  }

  const feedback = await createFeedback({
    student_id: student_id || null,
    category,
    message,
    district: district || null,
  });

  res.status(201).json({ data: feedback });
}));

export default router;
