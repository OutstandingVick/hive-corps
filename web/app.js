const formatCurrency = (amount) =>
  amount.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

const state = {
  currentRun: null
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
          <strong>${agent.name}</strong>
          <span>${agent.summary}</span>
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
            <strong>${item.name}</strong>
            <span>${item.quantity} × ${formatCurrency(item.unitPrice)}</span>
          </div>
          <strong>${formatCurrency(item.total)}</strong>
        </div>
      `
    )
    .join("");

  qs("quoteTotal").textContent = formatCurrency(quote.total);
  qs("quoteTotalLarge").textContent = formatCurrency(quote.total);
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

  renderTimeline(run.agents);
  renderQuote(run.quote);

  const riskList = qs("riskFlags");
  riskList.classList.toggle("is-clear", run.risk.flags.length === 0);
  riskList.innerHTML = (run.risk.flags.length ? run.risk.flags : ["No high-risk issues found."])
    .map((flag) => `<li>${flag}</li>`)
    .join("");

  qs("learningList").innerHTML = run.learning.proposals
    .map((proposal) => `<li>${proposal}</li>`)
    .join("");
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

qs("runPrimary").addEventListener("click", () => runDemo("req_001", false));
qs("runLearned").addEventListener("click", () => runDemo("req_002", true));
document.querySelectorAll("[data-run-primary]").forEach((button) => {
  button.addEventListener("click", () => {
    runDemo("req_001", false);
    document.querySelector(".dashboard-shell")?.scrollIntoView({ behavior: "smooth", block: "center" });
  });
});

runDemo("req_001", false).catch((error) => {
  qs("requestBody").textContent = error.message;
});
