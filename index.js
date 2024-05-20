import express from "express";
import { nanoid } from "nanoid";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const PORT = 8080;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, "public")));

const urlMapPath = path.join(__dirname, "urlmap.json");

// Ensure the URL mapping file exists
if (!fs.existsSync(urlMapPath)) {
  fs.writeFileSync(urlMapPath, JSON.stringify({}));
}

// app.get("/", (req, res) => {
//   res.sendFile(path.join(__dirname, "urlForm.html"));
// });

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "urlForm.html"));
});

// Endpoint to create a short URL
app.post("/url-shortener", (req, res) => {
  const { url } = req.body;
  if (!url) {
    return res.status(400).json({ error: "URL is required" });
  }

  const id = nanoid(6); // Generate a unique short ID
  const data = JSON.parse(fs.readFileSync(urlMapPath, "utf-8"));
  data[id] = url;
  fs.writeFileSync(urlMapPath, JSON.stringify(data, null, 2));

  res.json({ shortUrl: `http://localhost:${PORT}/${id}` });
});

// Redirect endpoint
app.get("/:id", (req, res) => {
  const data = JSON.parse(fs.readFileSync(urlMapPath, "utf-8"));
  const url = data[req.params.id];
  if (url) {
    res.redirect(url);
  } else {
    res.status(404).json({ error: "URL not found" });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
