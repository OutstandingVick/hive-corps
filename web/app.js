const formatCurrency = (amount) =>
  amount.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

const state = {
  currentRun: null,
  health: null
};

const fallbackRuns = {
  req_001: {
    mode: "static-file-demo",
    request: {
      id: "req_001",
      subject: "Need laptops for new Lagos office",
      body: "Hi, we need around 25 laptops for a new Lagos office. Prefer something reliable, probably with support, and we would love delivery next week if possible. Can you send pricing and options?"
    },
    agents: [
      { name: "Intake Agent", summary: "Extracted customer, product category, quantity, urgency, location, and missing fields." },
      { name: "Planner Agent", summary: "Created a quote-to-response task graph with memory, catalog, risk, approval, and learning steps." },
      { name: "Memory Agent", summary: "Retrieved customer preferences and approved policies from persistent memory." },
      { name: "Catalog Agent", summary: "Selected an in-stock Dell laptop and attached 3-year onsite support based on customer memory." },
      { name: "Risk Agent", summary: "Flagged quote for human approval before execution." },
      { name: "Quote Writer Agent", summary: "Generated a customer-ready quote and internal rationale." },
      { name: "Learning Agent", summary: "Prepared reusable memory and policy recommendations from the approval edits." }
    ],
    quote: {
      lineItems: [
        { name: "Dell Latitude 5440", quantity: 25, unitPrice: 1180, total: 29500 },
        { name: "3-year onsite support", quantity: 25, unitPrice: 160, total: 4000 }
      ],
      total: 30820
    },
    risk: {
      score: 72,
      approvalRequired: true,
      flags: ["Discount exceeds 10% approval policy.", "Large rollout needs conservative delivery promise."]
    },
    approval: {
      status: "human_edit_required",
      humanEdit: true
    },
    learning: {
      status: "proposed",
      proposals: [
        "For AdeptWorks Lagos, cap default laptop rollout discounts at 8% unless a manager approves more.",
        "For orders above 20 devices, quote delivery as at least 6 business days.",
        "Continue recommending Dell Latitude with 3-year onsite support for office rollouts."
      ]
    }
  },
  req_002: {
    mode: "static-file-demo",
    request: {
      id: "req_002",
      subject: "Second office batch",
      body: "We may need 12 more laptops for the same rollout. Please use the same kind of option if it worked for the first batch, and include support."
    },
    agents: [
      { name: "Intake Agent", summary: "Extracted customer, product category, quantity, urgency, location, and missing fields." },
      { name: "Planner Agent", summary: "Created a quote-to-response task graph with memory, catalog, risk, approval, and learning steps." },
      { name: "Memory Agent", summary: "Retrieved customer preferences and approved policies from persistent memory." },
      { name: "Catalog Agent", summary: "Selected an in-stock Dell laptop and attached 3-year onsite support based on customer memory." },
      { name: "Risk Agent", summary: "No high-risk pricing or delivery issues found." },
      { name: "Quote Writer Agent", summary: "Generated a customer-ready quote and internal rationale." },
      { name: "Learning Agent", summary: "Applied approved memory and policy updates from the first workflow." }
    ],
    quote: {
      lineItems: [
        { name: "Dell Latitude 5440", quantity: 12, unitPrice: 1180, total: 14160 },
        { name: "3-year onsite support", quantity: 12, unitPrice: 160, total: 1920 }
      ],
      total: 14794
    },
    risk: {
      score: 24,
      approvalRequired: false,
      flags: []
    },
    approval: {
      status: "approved",
      humanEdit: null
    },
    learning: {
      status: "applied",
      proposals: [
        "Applied learned 8% discount cap.",
        "Applied customer preference for Dell Latitude plus 3-year support."
      ]
    }
  }
};

function qs(id) {
  return document.getElementById(id);
}

function setText(id, value) {
  const element = qs(id);
  if (element) element.textContent = value;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function titleCaseStatus(status) {
  return status
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function renderTimeline(agents) {
  qs("timeline").innerHTML = agents
    .map(
      (agent) => `
        <li>
          <strong>${escapeHtml(agent.name)}</strong>
          <span>${escapeHtml(agent.summary)}</span>
        </li>
      `
    )
    .join("");
}

function renderQuote(quote) {
  qs("quoteItems").innerHTML = quote.lineItems
    .map(
      (item) => `
        <div class="quote-row">
          <div>
            <strong>${escapeHtml(item.name)}</strong>
            <span>${escapeHtml(item.quantity)} × ${formatCurrency(item.unitPrice)}</span>
          </div>
          <strong>${formatCurrency(item.total)}</strong>
        </div>
      `
    )
    .join("");

  qs("quoteTotal").textContent = formatCurrency(quote.total);
  qs("quoteTotalLarge").textContent = formatCurrency(quote.total);
  setText("heroQuoteTotal", formatCurrency(quote.total));
}

function renderRun(run) {
  state.currentRun = run;
  const approvalStatus = titleCaseStatus(run.approval.status);
  const learningStatus = titleCaseStatus(run.learning.status);
  const editCount = run.approval.humanEdit ? "1" : "0";

  setText("modeLabel", run.mode);
  setText("requestId", run.request.id);
  setText("requestSubject", run.request.subject);
  setText("requestBody", run.request.body);
  setText("agentCount", `${run.agents.length} agents`);
  setText("riskScore", run.risk.score);
  setText("approvalStatus", approvalStatus);
  setText("riskGate", run.risk.approvalRequired ? "Review Required" : "Approved");
  setText("learningStatus", learningStatus);
  setText("editCount", editCount);
  setText("proofQuoteTotal", formatCurrency(run.quote.total));
  setText("proofRiskScore", run.risk.score);
  setText("proofEditCount", editCount);
  setText("proofApprovalStatus", run.risk.approvalRequired ? "Review" : "Approved");
  setText("proofLearningStatus", learningStatus);
  const isStaticPreview = window.location.protocol === "file:" && !run.qwen;
  setText("qwenStatus", isStaticPreview ? "Static preview" : run.qwen?.enabled ? "Qwen live" : "Qwen fallback");
  setText("qwenCalls", `${run.qwen?.successfulCalls || 0}/${run.qwen?.calls?.length || 0} calls`);

  renderTimeline(run.agents);
  renderQuote(run.quote);

  const riskList = qs("riskFlags");
  riskList.classList.toggle("is-clear", run.risk.flags.length === 0);
  riskList.innerHTML = (run.risk.flags.length ? run.risk.flags : ["No high-risk issues found."])
    .map((flag) => `<li>${escapeHtml(flag)}</li>`)
    .join("");

  qs("learningList").innerHTML = run.learning.proposals
    .map((proposal) => `<li>${escapeHtml(proposal)}</li>`)
    .join("");
}

async function loadHealth() {
  if (window.location.protocol === "file:") {
    setText("qwenStatus", "Static preview");
    setText("qwenCalls", "0 calls");
    setText("workflowNotice", "Open through npm start to execute backend agents and export proof artifacts.");
    return;
  }

  try {
    const response = await fetch("/api/health");
    if (!response.ok) throw new Error("Health check failed");
    state.health = await response.json();
    setText("qwenStatus", state.health.qwen.enabled ? "Qwen live" : "Qwen fallback");
    setText("workflowNotice", state.health.qwen.enabled
      ? `Backend ready. Live Qwen model: ${state.health.qwen.model}.`
      : "Backend ready in deterministic fallback. Set DEMO_MODE=false and QWEN_API_KEY for live Qwen calls.");
  } catch {
    setText("qwenStatus", "Backend offline");
    setText("workflowNotice", "Backend is not reachable. Static preview data will be used.");
  }
}

async function runDemo(requestId = "req_001", applyLearning = false) {
  if (window.location.protocol === "file:") {
    renderRun(fallbackRuns[requestId]);
    return;
  }

  try {
    const response = await fetch(`/api/run-demo?requestId=${requestId}&applyLearning=${applyLearning}`);
    if (!response.ok) throw new Error("Could not run workflow");
    renderRun(await response.json());
  } catch {
    renderRun(fallbackRuns[requestId]);
  }
}

async function runCustomWorkflow() {
  const button = qs("runCustom");
  const request = qs("customRequest").value.trim();

  if (request.length < 24) {
    setText("workflowNotice", "Add a customer request with enough detail to run the workflow.");
    return;
  }

  if (window.location.protocol === "file:") {
    renderRun(fallbackRuns.req_001);
    setText("workflowNotice", "Static preview loaded. Run npm start and open localhost to execute this custom request.");
    return;
  }

  button.disabled = true;
  button.textContent = "Running agents...";
  setText("workflowNotice", "Backend agents are processing the request and returning auditable proof.");

  try {
    const response = await fetch("/api/workflows", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        request,
        company: "Dashboard submitted account",
        subject: "Dashboard quote request",
        persist: true
      })
    });
    const run = await response.json();
    if (!response.ok) throw new Error(run.error || "Could not run custom workflow");
    renderRun(run);
    const service = state.health?.cloud?.service || "";
    setText("workflowNotice", service === "vercel-serverless"
      ? "Workflow complete. Vercel returned auditable proof for this run; persistent proof export is available in local or Alibaba deployment mode."
      : "Workflow complete. Latest quote, audit log, and agent run proof were exported.");
  } catch (error) {
    setText("workflowNotice", error.message);
  } finally {
    button.disabled = false;
    button.textContent = "Run with backend agents";
  }
}

qs("runPrimary").addEventListener("click", () => runDemo("req_001", false));
qs("runLearned").addEventListener("click", () => runDemo("req_002", true));
qs("runCustom").addEventListener("click", runCustomWorkflow);
qs("navDemo").addEventListener("click", () => {
  document.querySelector(".workflow-runner")?.scrollIntoView({ behavior: "smooth", block: "center" });
});
document.querySelectorAll("[data-run-primary]").forEach((button) => {
  button.addEventListener("click", () => {
    runDemo("req_001", false);
    document.querySelector(".dashboard-shell")?.scrollIntoView({ behavior: "smooth", block: "center" });
  });
});

loadHealth();
runDemo("req_001", false).catch((error) => {
  qs("requestBody").textContent = error.message;
});
