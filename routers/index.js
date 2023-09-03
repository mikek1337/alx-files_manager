import { Router } from "express";
import AppController from "../controllers/AppController";
import UserController from "../controllers/UserController";
import AuthController from "../controllers/AuthController";
import FileController from "../controllers/FilesController";

const router = Router();

router.get("/status", AppController.getStatus);
router.get("/stats", AppController.getStats);
router.post("/users", UserController.postNew);
router.get("/connect", AuthController.getConnect);
router.get("/disconnect", AuthController.getDisconnect);
router.get("/users/me", UserController.getMe);
router.post("/files", FileController.postUpload);
module.exports = router;
