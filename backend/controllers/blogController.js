import Blog from "../models/Blog.js";

const authorFields = "name";

export async function getBlogs(req, res) {
  res.json({
    blogs: await Blog.find()
      .sort({ createdAt: -1 })
      .populate("author", authorFields),
  });
}

export async function getMyBlogs(req, res) {
  res.json({
    blogs: await Blog.find({ author: req.user.id })
      .sort({ createdAt: -1 })
      .populate("author", authorFields),
  });
}

export async function createBlog(req, res) {
  const blog = await Blog.create({
    title: req.body.title,
    content: req.body.content,
    author: req.user.id,
  });
  res.status(201).json({ blog: await blog.populate("author", authorFields) });
}

export async function getBlog(req, res) {
  const blog = await Blog.findById(req.params.id).populate(
    "author",
    authorFields,
  );
  if (!blog) return res.status(404).json({ message: "Blog not found." });
  res.json({ blog });
}

export async function updateBlog(req, res) {
  req.blog.title = req.body.title;
  req.blog.content = req.body.content;
  await req.blog.save();
  res.json({ blog: await req.blog.populate("author", authorFields) });
}

export async function deleteBlog(req, res) {
  await req.blog.deleteOne();
  res.status(204).end();
}
