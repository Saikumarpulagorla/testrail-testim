const express = require("express");
const axios = require("axios");

const app = express();
app.use(express.json());

app.get("/", (req, res) => {
  res.send("OK");
});

app.post("/run-tests", async (req, res) => {
  const { run_id, case_ids } = req.body;

  console.log("📥 Incoming:", req.body);

  if (!run_id || !case_ids?.length) {
    return res.status(400).send("Missing run_id or case_ids");
  }

  try {
    await axios.post(
      "https://api.github.com/repos/Saikumarpulagorla/testrail-testim/actions/workflows/run-testim.yml/dispatches",
      {
        ref: "main",
        inputs: {
          run_id: String(run_id),
          case_ids: case_ids.join(",")
        }
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
          Accept: "application/vnd.github+json"
        }
      }
    );

    console.log("✅ GitHub Action triggered");

    res.send("GitHub workflow triggered");
  } catch (error) {
    console.error("❌ Error:", error.response?.data || error.message);
    res.status(500).send("Failed to trigger GitHub Action");
  }
});

app.listen(process.env.PORT || 3000, () => {
  console.log("🚀 Server started");
});