import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import request from "supertest";
import app from "../app.js";
import User from "../models/User.js";
let mongo;
process.env.JWT_SECRET = "test-only-secret-that-is-at-least-32-characters";
const mutate = (agent, method, path, body) =>
  agent[method](path).set("X-Requested-With", "SmartBlog").send(body);
before(async () => {
  mongo = await MongoMemoryServer.create();
  await mongoose.connect(mongo.getUri());
  await User.init();
});
after(async () => {
  await mongoose.disconnect();
  if (mongo) await mongo.stop();
});
test("registration, login, ownership, CRUD, and session revocation", async () => {
  const author = request.agent(app),
    other = request.agent(app);
  const account = {
    name: "Asha",
    email: "asha@example.com",
    password: "college-demo-123",
  };
  await mutate(author, "post", "/api/auth/register", {
    ...account,
    password: "short",
  }).expect(400);
  const registration = await mutate(
    author,
    "post",
    "/api/auth/register",
    account,
  ).expect(201);
  assert.equal(registration.body.user.name, "Asha");
  assert.equal(registration.body.user.passwordHash, undefined);
  const cookie = registration.headers["set-cookie"][0].split(";")[0];
  assert.match(registration.headers["set-cookie"][0], /HttpOnly/);
  await mutate(other, "post", "/api/auth/register", account).expect(409);
  await mutate(other, "post", "/api/auth/login", {
    email: account.email,
    password: "wrong",
  }).expect(401);
  await author.get("/api/auth/me").expect(200);
  await mutate(request(app), "post", "/api/blogs", {
    title: "No",
    content: "No",
  }).expect(401);
  await author
    .post("/api/blogs")
    .send({ title: "No", content: "No" })
    .expect(403);
  await mutate(author, "post", "/api/blogs", {
    title: " ",
    content: "Body",
  }).expect(400);
  const created = await mutate(author, "post", "/api/blogs", {
    title: "First story",
    content: "Hello, readers.",
  }).expect(201);
  const id = created.body.blog._id;
  assert.equal(
    (await request(app).get("/api/blogs").expect(200)).body.blogs.length,
    1,
  );
  await request(app).get(`/api/blogs/${id}`).expect(200);
  await request(app).get("/api/blogs/bad-id").expect(400);
  await request(app).get("/api/blogs/000000000000000000000000").expect(404);
  await mutate(other, "post", "/api/auth/register", {
    ...account,
    email: "other@example.com",
  }).expect(201);
  await mutate(other, "put", `/api/blogs/${id}`, {
    title: "Stolen",
    content: "Changed",
  }).expect(403);
  await mutate(other, "delete", `/api/blogs/${id}`).expect(403);
  assert.equal((await other.get("/api/blogs/mine")).body.blogs.length, 0);
  const updated = await mutate(author, "put", `/api/blogs/${id}`, {
    title: "Edited",
    content: "Updated story",
  }).expect(200);
  assert.equal(updated.body.blog.title, "Edited");
  await mutate(author, "post", "/api/auth/logout").expect(200);
  await request(app).get("/api/auth/me").set("Cookie", cookie).expect(401);
  await author.get("/api/auth/me").expect(401);
  await mutate(author, "post", "/api/auth/login", account).expect(200);
  await mutate(author, "delete", `/api/blogs/${id}`).expect(204);
  await request(app).get(`/api/blogs/${id}`).expect(404);
});
