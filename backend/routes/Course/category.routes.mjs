import express from "express";
import { addCategory, getCategory, getUserById } from "../../controller/Course/category.controller.mjs";
const router = express.Router();

router.get('/getcategory',getCategory)
router.post('/addcategory',addCategory)
router.get("/user/:id", getUserById);

export default router