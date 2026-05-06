const express = require("express");
const { exec } = require("child_process");

const app = express();
app.use(express.json());

// Health check
app.get("/", (req, res) => {
  res.send("OK");
});

// Webhook endpoint
app.post("/run-tests", (req, res) => {
  const { run_id, case_ids } = req.body;

  console.log("📥 Incoming:", req.body);

  if (!run_id || !case_ids?.length) {
    return res.status(400).send("Missing run_id or case_ids");
  }

  const caseTags = case_ids.map(id => `C${id}`).join(",");

  const command = `
    TESTRAIL_RUN_ID=${run_id} \
    TESTRAIL_CASE_IDS=${case_ids.join(",")} \
    testim --token "${process.env.TESTIM_TOKEN}" \
    --project "${process.env.TESTIM_PROJECT_ID}" \
    --grid "${process.env.TESTIM_GRID}" \
    --name "${caseTags}"
  `;

  console.log("🚀 Running:", command);

  exec(command, (err, stdout, stderr) => {
    if (err) {
      console.error("❌ Error:", err);
      return res.status(500).send("Execution failed");
    }

    console.log("✅ Done");
    console.log(stdout);

    res.send("Triggered");
  });
});

app.listen(process.env.PORT || 3000, () => {
  console.log("🚀 Server started");
});