import { Router } from "express";
import AppController from "../controllers/AppController";
import UserController from "../controllers/UserController";
import AuthController from "../controllers/AuthController";

const router = Router();

router.get("/status", AppController.getStatus);
router.get("/stats", AppController.getStats);
router.post("/users", UserController.postNew);
router.get("/connect", AuthController.getConnect);
router.get("/disconnect", AuthController.getDisconnect);

module.exports = router;
