const formatCurrency = (amount) =>
  amount.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

const state = {
  currentRun: null
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
  const response = await fetch(`/api/run-demo?requestId=${requestId}&applyLearning=${applyLearning}`);
  if (!response.ok) throw new Error("Could not run workflow");
  renderRun(await response.json());
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
