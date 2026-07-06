const formatCurrency = (amount) =>
  amount.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

const state = {
  currentRun: null
};

function qs(id) {
  return document.getElementById(id);
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
  qs("modeLabel").textContent = run.mode;
  qs("requestId").textContent = run.request.id;
  qs("requestSubject").textContent = run.request.subject;
  qs("requestBody").textContent = run.request.body;
  qs("agentCount").textContent = `${run.agents.length} agents`;
  qs("riskScore").textContent = run.risk.score;
  qs("approvalStatus").textContent = run.approval.status.replaceAll("_", " ");
  qs("riskGate").textContent = run.risk.approvalRequired ? "approval required" : "approved";
  qs("learningStatus").textContent = run.learning.status;
  qs("editCount").textContent = run.approval.humanEdit ? "1" : "0";

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

runDemo("req_001", false).catch((error) => {
  qs("requestBody").textContent = error.message;
});
