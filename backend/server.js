import mongoose from "mongoose";
import app from "./app.js";
if (
  !process.env.JWT_SECRET ||
  process.env.JWT_SECRET.length < 32 ||
  process.env.JWT_SECRET.startsWith("replace-")
)
  throw new Error(
    "Set JWT_SECRET to a random secret of at least 32 characters.",
  );
await mongoose.connect(
  process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/smart_blog",
);
const server = app.listen(process.env.PORT || 5000, () =>
  console.log("Smart Blog backend is ready."),
);
for (const signal of ["SIGTERM", "SIGINT"])
  process.on(signal, () =>
    server.close(async () => {
      await mongoose.disconnect();
      process.exit(0);
    }),
  );
