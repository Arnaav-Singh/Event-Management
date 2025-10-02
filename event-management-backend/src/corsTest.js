// Utility to help debug CORS issues
import express from "express";
import cors from "cors";

const app = express();
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
}));

app.get("/test", (req, res) => {
  res.json({ message: "CORS test successful" });
});

app.listen(5050, () => {
  console.log("CORS test server running on port 5050");
});
