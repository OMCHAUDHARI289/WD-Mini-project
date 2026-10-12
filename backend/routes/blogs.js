import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { validBlog, validBlogId, ownBlog } from "../middleware/blogs.js";
import {
  getBlogs,
  getMyBlogs,
  createBlog,
  getBlog,
  updateBlog,
  deleteBlog,
} from "../controllers/blogController.js";

const router = Router();

router.get("/", getBlogs);
router.get("/mine", requireAuth, getMyBlogs);
router.post("/", requireAuth, validBlog, createBlog);

router.param("id", validBlogId);
router.get("/:id", getBlog);
router.put("/:id", requireAuth, ownBlog, validBlog, updateBlog);
router.delete("/:id", requireAuth, ownBlog, deleteBlog);

export default router;
