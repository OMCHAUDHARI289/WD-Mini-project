import mongoose from "mongoose";
import Blog from "../models/Blog.js";

export function validBlog(req, res, next) {
  const { title, content } = req.body;
  if (
    typeof title !== "string" ||
    !title.trim() ||
    title.trim().length > 160 ||
    typeof content !== "string" ||
    !content.trim() ||
    content.trim().length > 20000
  )
    return res.status(400).json({
      message:
        "A title (1–160 characters) and content (1–20,000 characters) are required.",
    });
  next();
}

export function validBlogId(req, res, next, id) {
  if (!mongoose.isObjectIdOrHexString(id))
    return res.status(400).json({ message: "Invalid blog ID." });
  next();
}

export async function ownBlog(req, res, next) {
  const blog = await Blog.findById(req.params.id);
  if (!blog) return res.status(404).json({ message: "Blog not found." });
  if (blog.author.toString() !== req.user.id)
    return res
      .status(403)
      .json({ message: "You can only change your own blogs." });
  req.blog = blog;
  next();
}
