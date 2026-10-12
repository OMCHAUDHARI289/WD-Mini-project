import React, { useEffect, useState } from "react";
import {
  Link,
  NavLink,
  Navigate,
  Route,
  Routes,
  useNavigate,
  useParams,
} from "react-router-dom";
import { api } from "./api";

const date = (value) =>
  new Date(value).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

function ErrorMessage({ message }) {
  return message ? (
    <p className="error" role="alert">
      {message}
    </p>
  ) : null;
}

function Loading() {
  return (
    <p className="status" role="status">
      Loading…
    </p>
  );
}

export default function App() {
  const [user, setUser] = useState(null),
    [loading, setLoading] = useState(true),
    [error, setError] = useState("");
  const navigate = useNavigate();
  async function restore() {
    setLoading(true);
    setError("");
    try {
      setUser((await api("/auth/me")).user);
    } catch (e) {
      if (e.status !== 401)
        setError("Unable to connect to the server. Please try again.");
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    restore();
  }, []);
  async function logout() {
    try {
      await api("/auth/logout", { method: "POST" });
      setUser(null);
      navigate("/");
    } catch (e) {
      if (e.status === 401) {
        setUser(null);
        navigate("/login");
      } else setError(e.message);
    }
  }
  const protectedPage = (page) =>
    user ? page : <Navigate to="/login" replace />;
  return (
    <>
      <header>
        <Link className="brand" to="/">
          <span className="brand-icon">s.</span> smart<span>blog</span>
        </Link>
        <nav aria-label="Main navigation">
          <NavLink to="/" end>
            Discover
          </NavLink>
          {user ? (
            <>
              <NavLink to="/my-blogs">My blogs</NavLink>
              <Link className="button small" to="/create">
                + Write a blog
              </Link>
              <button className="text-button" onClick={logout}>
                Log out
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login">Log in</NavLink>
              <Link className="button small" to="/register">
                Get started ↗
              </Link>
            </>
          )}
        </nav>
      </header>
      <main>
        {error ? (
          <div className="empty">
            <ErrorMessage message={error} />
            <button onClick={restore}>Retry connection</button>
          </div>
        ) : loading ? (
          <Loading />
        ) : (
          <Routes>
            <Route path="/" element={<BlogList />} />
            <Route
              path="/my-blogs"
              element={protectedPage(<BlogList mine user={user} />)}
            />
            <Route
              path="/login"
              element={user ? <Navigate to="/" /> : <Auth setUser={setUser} />}
            />
            <Route
              path="/register"
              element={
                user ? <Navigate to="/" /> : <Auth register setUser={setUser} />
              }
            />
            <Route path="/create" element={protectedPage(<Editor />)} />
            <Route path="/blogs/:id" element={<Details user={user} />} />
            <Route
              path="/blogs/:id/edit"
              element={protectedPage(<Editor user={user} />)}
            />
            <Route
              path="*"
              element={
                <div className="empty">
                  <h1>Page not found</h1>
                  <Link to="/">Back to home</Link>
                </div>
              }
            />
          </Routes>
        )}
      </main>
      <footer>
        <span className="brand">smartblog</span>
        <span>A little space for big ideas.</span>
        <span>Read. Write. Connect.</span>
      </footer>
    </>
  );
}

function BlogList({ mine = false, user }) {
  const [blogs, setBlogs] = useState(null),
    [error, setError] = useState(""),
    [retry, setRetry] = useState(0);
  useEffect(() => {
    let active = true;
    setBlogs(null);
    setError("");
    api(mine ? "/blogs/mine" : "/blogs")
      .then((data) => {
        if (active) setBlogs(data.blogs);
      })
      .catch((e) => {
        if (active) setError(e.message);
      });
    return () => {
      active = false;
    };
  }, [mine, retry]);
  return (
    <>
      <section className="hero">
        <div className="eyebrow">
          {mine ? "YOUR PERSONAL CORNER" : "A COMMUNITY OF CURIOUS MINDS"}
        </div>
        <h1>
          {mine ? (
            <>
              Your words.
              <br />
              <em>Your space.</em>
            </>
          ) : (
            <>
              Good ideas deserve
              <br />
              <em>to be shared.</em>
            </>
          )}
        </h1>
        <p>
          {mine
            ? `Hello, ${user.name}. Every story starts with a thought.`
            : "Stories, perspectives, and everyday discoveries.\nA simple place to read something new and share what’s on your mind."}
        </p>
        <Link className="button" to="/create">
          Write your story <span>↗</span>
        </Link>
        <span className="hero-note">No noise. Just words that matter.</span>
      </section>
      <section className="feed">
        <div className="section-heading">
          <h2>
            {mine ? "My blogs" : "Fresh perspectives"}
            <span className="dot" />
          </h2>
          <span>
            {blogs
              ? `${blogs.length} ${blogs.length === 1 ? "story" : "stories"}`
              : "The latest from our community"}
          </span>
        </div>
        {error ? (
          <div className="empty">
            <ErrorMessage message={error} />
            <button onClick={() => setRetry(retry + 1)}>Try again</button>
          </div>
        ) : !blogs ? (
          <Loading />
        ) : !blogs.length ? (
          <div className="empty">
            <span className="empty-icon">✎</span>
            <h2>
              {mine
                ? "Your first story starts here"
                : "A blank page. Endless possibilities."}
            </h2>
            <p>
              {mine
                ? "Share a thought, a lesson, or a little inspiration."
                : "Be the first to share a story with the community."}
            </p>
            <Link to="/create" className="button">
              Write a blog ↗
            </Link>
          </div>
        ) : (
          <div className="grid">
            {blogs.map((blog, i) => (
              <article className="card" key={blog._id}>
                <div className={`card-art tone-${i % 3}`} aria-hidden="true">
                  <span>{String(i + 1).padStart(2, "0")}</span>
                  <div className="art-lines">✳</div>
                  <small>IDEAS WORTH SHARING</small>
                </div>
                <div className="card-body">
                  <p className="metadata">
                    {date(blog.createdAt)} ·{" "}
                    {Math.max(
                      1,
                      Math.ceil(blog.content.split(/\s+/).length / 200),
                    )}{" "}
                    min read
                  </p>
                  <h3>
                    <Link to={`/blogs/${blog._id}`}>{blog.title}</Link>
                  </h3>
                  <p className="excerpt">{blog.content}</p>
                  <div className="card-bottom">
                    <span>
                      <b className="avatar">{blog.author?.name?.[0] || "?"}</b>
                      {blog.author?.name || "Former author"}
                    </span>
                    <Link
                      aria-label={`Read ${blog.title}`}
                      to={`/blogs/${blog._id}`}
                    >
                      ↗
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </>
  );
}

function Auth({ register = false, setUser }) {
  const navigate = useNavigate(),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  useEffect(() => setError(""), [register]);
  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const fields = Object.fromEntries(new FormData(event.currentTarget));
    try {
      const data = await api(`/auth/${register ? "register" : "login"}`, {
        method: "POST",
        body: JSON.stringify(fields),
      });
      setUser(data.user);
      navigate("/");
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="form-panel" key={String(register)}>
      <div className="eyebrow">YOUR NEXT CHAPTER</div>
      <h1>{register ? "Make yourself at home." : "Welcome back."}</h1>
      <p>
        {register
          ? "Create an account and let your ideas find their people."
          : "Your stories and fresh perspectives are waiting."}
      </p>
      <form onSubmit={submit}>
        <ErrorMessage message={error} />
        {register && (
          <label>
            Name
            <input name="name" autoComplete="name" maxLength={60} required />
          </label>
        )}
        <label>
          Email address
          <input
            type="email"
            name="email"
            autoComplete="email"
            maxLength={254}
            required
          />
        </label>
        <label>
          Password
          <input
            type="password"
            name="password"
            autoComplete={register ? "new-password" : "current-password"}
            minLength={register ? 8 : undefined}
            maxLength={72}
            required
          />
        </label>
        {register && <small>At least 8 characters, maximum 72 bytes.</small>}
        <button disabled={busy}>
          {busy ? "Please wait…" : register ? "Create account ↗" : "Log in ↗"}
        </button>
      </form>
      <p>
        {register ? "Already have an account?" : "New around here?"}{" "}
        <Link to={register ? "/login" : "/register"}>
          {register ? "Log in" : "Create an account"}
        </Link>
      </p>
    </section>
  );
}

function Editor({ user }) {
  const { id } = useParams(),
    navigate = useNavigate();
  const [title, setTitle] = useState(""),
    [content, setContent] = useState(""),
    [loading, setLoading] = useState(Boolean(id)),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [allowed, setAllowed] = useState(!id);
  useEffect(() => {
    let active = true;
    setTitle("");
    setContent("");
    setError("");
    setAllowed(!id);
    setLoading(Boolean(id));
    if (id)
      api(`/blogs/${id}`)
        .then(({ blog }) => {
          if (!active) return;
          if (blog.author?._id !== user?.id) {
            setError("You can only edit your own blogs.");
            return;
          }
          setTitle(blog.title);
          setContent(blog.content);
          setAllowed(true);
        })
        .catch((e) => {
          if (active) setError(e.message);
        })
        .finally(() => {
          if (active) setLoading(false);
        });
    return () => {
      active = false;
    };
  }, [id, user?.id]);
  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const { blog } = await api(id ? `/blogs/${id}` : "/blogs", {
        method: id ? "PUT" : "POST",
        body: JSON.stringify({ title, content }),
      });
      navigate(`/blogs/${blog._id}`);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  if (loading) return <Loading />;
  return (
    <section className="editor">
      <Link className="back" to="/my-blogs">
        ← My blogs
      </Link>
      <div className="eyebrow">LET YOUR IDEAS TAKE SHAPE</div>
      <h1>{id ? "Refine your story." : "Start with a thought."}</h1>
      <ErrorMessage message={error} />
      {allowed && (
        <form onSubmit={submit}>
          <label>
            Blog title
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Give your story a title"
              required
              maxLength={160}
            />
          </label>
          <label>
            Your story
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What’s on your mind?"
              required
              maxLength={20000}
              rows={14}
            />
          </label>
          <div className="editor-actions">
            <small>{content.length.toLocaleString()} / 20,000 characters</small>
            <button disabled={busy}>
              {busy ? "Saving…" : id ? "Save changes ↗" : "Publish blog ↗"}
            </button>
          </div>
        </form>
      )}
    </section>
  );
}

function Details({ user }) {
  const { id } = useParams(),
    navigate = useNavigate();
  const [blog, setBlog] = useState(null),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [confirm, setConfirm] = useState(false);
  useEffect(() => {
    let active = true;
    setBlog(null);
    setError("");
    api(`/blogs/${id}`)
      .then((data) => {
        if (active) setBlog(data.blog);
      })
      .catch((e) => {
        if (active) setError(e.message);
      });
    return () => {
      active = false;
    };
  }, [id]);
  async function remove() {
    setBusy(true);
    try {
      await api(`/blogs/${id}`, { method: "DELETE" });
      navigate("/my-blogs");
    } catch (e) {
      setError(e.message);
      setBusy(false);
    }
  }
  if (!blog) return error ? <ErrorMessage message={error} /> : <Loading />;
  return (
    <article className="reader">
      <Link className="back" to="/">
        ← All stories
      </Link>
      <p className="eyebrow">A PERSPECTIVE WORTH SHARING</p>
      <h1>{blog.title}</h1>
      <div className="reader-meta">
        <b className="avatar">{blog.author?.name?.[0] || "?"}</b>
        <span>
          {blog.author?.name || "Former author"}
          <small>{date(blog.createdAt)}</small>
        </span>
      </div>
      <div className="story">{blog.content}</div>
      <ErrorMessage message={error} />
      {user?.id === blog.author?._id && (
        <div className="owner-actions">
          <Link className="button" to={`/blogs/${id}/edit`}>
            Edit blog
          </Link>
          <button className="secondary" onClick={() => setConfirm(true)}>
            Delete blog
          </button>
          {confirm && (
            <div className="delete-confirm" role="alert">
              <p>Delete this blog permanently? This cannot be undone.</p>
              <button disabled={busy} onClick={remove}>
                {busy ? "Deleting…" : "Yes, delete blog"}
              </button>{" "}
              <button
                className="secondary"
                disabled={busy}
                onClick={() => setConfirm(false)}
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      )}
    </article>
  );
}
