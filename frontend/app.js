// FastAPI backend URL
const API_URL = "http://127.0.0.1:8000";


// =====================================================
// EVALUATE USER SITUATION
// =====================================================

async function evaluateSituation() {

    const attendance =
        document.getElementById("attendance").value;

    const medicalCertificate =
        document.getElementById("medical").checked;

    const approval =
        document.getElementById("approval").checked;

    const resultBox =
        document.getElementById("decisionResult");

    // -------------------------------------------------
    // Validate attendance
    // -------------------------------------------------

    if (attendance === "") {

        alert("Please enter your attendance.");

        return;
    }

    // -------------------------------------------------
    // Show loading
    // -------------------------------------------------

    resultBox.innerHTML = `
        <div class="result-empty">

            <h3>
                Evaluating...
            </h3>

            <p>
                RuleLens is checking the applicable regulations.
            </p>

        </div>
    `;

    // -------------------------------------------------
    // Backend request
    // -------------------------------------------------

    try {

        const response = await fetch(
            `${API_URL}/evaluate`,
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({

                    attendance:
                        parseFloat(attendance),

                    medical_certificate:
                        medicalCertificate,

                    approval:
                        approval

                })
            }
        );

        if (!response.ok) {

            throw new Error(
                `Request failed with status ${response.status}`
            );

        }

        const result =
            await response.json();

        console.log(
            "Situation result:",
            result
        );

        // -------------------------------------------------
        // Display decision
        // -------------------------------------------------

        displayResult(result);

        // -------------------------------------------------
        // Display evidence
        // -------------------------------------------------

        displayEvidence(result.sources);

    }

    catch (error) {

        console.error(
            "Evaluation error:",
            error
        );

        resultBox.innerHTML = `

            <div class="answer-box">

                <span class="status danger">
                    ERROR
                </span>

                <h3>
                    Unable to contact RuleLens.
                </h3>

                <p>
                    Make sure the FastAPI backend is running.
                </p>

            </div>

        `;
    }
}


// =====================================================
// DISPLAY SITUATION RESULT
// =====================================================

function displayResult(result) {

    const resultBox =
        document.getElementById("decisionResult");

    let statusClass = "success";

    if (result.decision === "NOT_ELIGIBLE") {

        statusClass = "danger";

    }

    if (result.decision === "POSSIBLE") {

        statusClass = "warning";

    }

    if (result.decision === "UNKNOWN") {

        statusClass = "warning";

    }

    resultBox.innerHTML = `

        <div class="answer-box">

            <span class="status ${statusClass}">
                ${result.decision}
            </span>

            <h3>
                ${result.explanation}
            </h3>

            <p>
                Status:
                ${result.status}
            </p>

        </div>

    `;
}


// =====================================================
// DISPLAY EVIDENCE
// =====================================================

function displayEvidence(sources) {

    const evidenceBox =
        document.getElementById("evidence");

    if (!evidenceBox) {

        return;
    }

    if (
        !sources ||
        sources.length === 0
    ) {

        evidenceBox.innerHTML = `
            <p>
                No supporting regulations found.
            </p>
        `;

        return;
    }

    evidenceBox.innerHTML =
        sources
            .map(
                source => `

                <div class="question-source">

                    <strong>
                        Section
                        ${source.section}
                        —
                        ${source.title}
                    </strong>

                    <p>
                        ${source.text}
                    </p>

                    <small>
                        Relevance:
                        ${
                            (
                                source.similarity * 100
                            ).toFixed(1)
                        }%
                    </small>

                </div>

                `
            )
            .join("");
}


// =====================================================
// ASK THE RULEBOOK
// =====================================================

async function askRulebook() {

    const question =
        document
            .getElementById("ruleQuestion")
            .value
            .trim();

    const resultBox =
        document.getElementById("questionResult");

    // -------------------------------------------------
    // Empty question
    // -------------------------------------------------

    if (question === "") {

        alert("Please enter a question.");

        return;
    }

    // -------------------------------------------------
    // Loading
    // -------------------------------------------------

    resultBox.innerHTML = `

        <div class="answer-box">

            <p>
                Searching the rulebook...
            </p>

        </div>

    `;

    // -------------------------------------------------
    // Backend request
    // -------------------------------------------------

    try {

        const response = await fetch(
            `${API_URL}/ask`,
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    question: question
                })
            }
        );

        // -------------------------------------------------
        // Check HTTP response
        // -------------------------------------------------

        if (!response.ok) {

            throw new Error(
                `Request failed with status ${response.status}`
            );

        }

        // -------------------------------------------------
        // Get JSON
        // -------------------------------------------------

        const result =
            await response.json();

        console.log(
            "RuleLens response:",
            result
        );

        // -------------------------------------------------
        // Determine status style
        // -------------------------------------------------

        let resultClass = "success";

        if (result.status === "CONFLICT") {

            resultClass = "danger";

        }

        if (result.status === "NOT_COVERED") {

            resultClass = "warning";

        }

        // =================================================
        // CONFLICT RESULT
        // =================================================

        if (
            result.status === "CONFLICT" &&
            result.sources &&
            result.sources.length >= 2
        ) {

            const rule1 =
                result.sources[0];

            const rule2 =
                result.sources[1];

            resultBox.innerHTML = `

                <div class="answer-box conflict-box">

                    <span class="status danger">
                        ⚠ CONFLICT DETECTED
                    </span>

                    <h3>
                        Conflicting regulations were found.
                    </h3>

                    <p>
                        RuleLens found two provisions that
                        specify different attendance requirements.
                    </p>


                    <!-- =================================
                         CONFLICTING RULES
                         ================================= -->

                    <div class="conflict-rules">


                        <!-- RULE 1 -->

                        <div class="conflict-rule">

                            <span class="conflict-label">
                                RULE 1
                            </span>

                            <h4>
                                Section ${rule1.section}
                            </h4>

                            <strong>
                                ${rule1.title}
                            </strong>

                            <p>
                                ${rule1.text}
                            </p>

                            <small>
                                Relevance:
                                ${
                                    (
                                        rule1.similarity * 100
                                    ).toFixed(1)
                                }%
                            </small>

                        </div>


                        <!-- VS -->

                        <div class="conflict-vs">
                            VS
                        </div>


                        <!-- RULE 2 -->

                        <div class="conflict-rule">

                            <span class="conflict-label">
                                RULE 2
                            </span>

                            <h4>
                                Section ${rule2.section}
                            </h4>

                            <strong>
                                ${rule2.title}
                            </strong>

                            <p>
                                ${rule2.text}
                            </p>

                            <small>
                                Relevance:
                                ${
                                    (
                                        rule2.similarity * 100
                                    ).toFixed(1)
                                }%
                            </small>

                        </div>

                    </div>


                    <!-- =================================
                         CONFLICT REASON
                         ================================= -->

                    <div class="conflict-reason">

                        <strong>
                            Why is this a conflict?
                        </strong>

                        <p>
                            ${result.reasoning || ""}
                        </p>

                    </div>

                </div>

            `;

            return;
        }


        // =================================================
        // NORMAL SOURCES
        // =================================================

        let sourcesHTML = "";

        if (
            result.sources &&
            result.sources.length > 0
        ) {

            sourcesHTML =
                result.sources
                    .map(
                        source => `

                        <div class="question-source">

                            <strong>
                                Section
                                ${source.section}
                                —
                                ${source.title}
                            </strong>

                            <p>
                                ${source.text}
                            </p>

                            <small>
                                Relevance:
                                ${
                                    (
                                        source.similarity * 100
                                    ).toFixed(1)
                                }%
                            </small>

                        </div>

                        `
                    )
                    .join("");

        }


        // =================================================
        // NORMAL RESULT
        // =================================================

        resultBox.innerHTML = `

            <div class="answer-box">

                <span class="status ${resultClass}">
                    ${result.status}
                </span>

                <h3>
                    ${result.answer}
                </h3>

                <p>
                    ${result.reasoning || ""}
                </p>

                ${sourcesHTML}

            </div>

        `;

    }

    catch (error) {

        console.error(
            "RuleLens error:",
            error
        );

        resultBox.innerHTML = `

            <div class="answer-box">

                <span class="status danger">
                    ERROR
                </span>

                <h3>
                    Unable to contact RuleLens.
                </h3>

                <p>
                    Make sure the FastAPI backend is running
                    at ${API_URL}.
                </p>

            </div>

        `;

    }
}
// =====================================================
// WHAT-IF SIMULATOR
// =====================================================

async function runWhatIf() {

    const attendanceInput =
        document.getElementById(
            "whatIfAttendance"
        );

    const medicalInput =
        document.getElementById(
            "whatIfMedical"
        );

    const approvalInput =
        document.getElementById(
            "whatIfApproval"
        );

    const resultContainer =
        document.getElementById(
            "whatIfResult"
        );


    // -------------------------------------------------
    // CHECK ELEMENTS
    // -------------------------------------------------

    if (
        !attendanceInput ||
        !medicalInput ||
        !approvalInput ||
        !resultContainer
    ) {

        console.error(
            "What-If elements not found."
        );

        return;
    }


    // -------------------------------------------------
    // GET VALUES
    // -------------------------------------------------

    const attendance =
        Number(
            attendanceInput.value
        );

    const medicalCertificate =
        medicalInput.value === "true";

    const approval =
        approvalInput.value === "true";


    // -------------------------------------------------
    // VALIDATE ATTENDANCE
    // -------------------------------------------------

    if (
        attendanceInput.value === "" ||
        Number.isNaN(attendance)
    ) {

        alert(
            "Please enter attendance."
        );

        return;
    }


    // -------------------------------------------------
    // SHOW LOADING
    // -------------------------------------------------

    resultContainer.innerHTML = `

        <div class="what-if-loading">

            Recalculating decision...

        </div>

    `;


    // -------------------------------------------------
    // SEND REQUEST
    // -------------------------------------------------

    try {

        const response = await fetch(
            `${API_URL}/evaluate`,
            {
                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body: JSON.stringify({

                    attendance:
                        attendance,

                    medical_certificate:
                        medicalCertificate,

                    approval:
                        approval

                })
            }
        );


        // -------------------------------------------------
        // CHECK RESPONSE
        // -------------------------------------------------

        if (!response.ok) {

            throw new Error(
                `HTTP ${response.status}`
            );

        }


        // -------------------------------------------------
        // GET RESULT
        // -------------------------------------------------

        const result =
            await response.json();


        console.log(
            "What-If result:",
            result
        );


        // -------------------------------------------------
        // DECISION STYLE
        // -------------------------------------------------

        let decisionClass =
            "decision-unknown";


        if (
            result.decision ===
            "ELIGIBLE"
        ) {

            decisionClass =
                "decision-eligible";

        }

        else if (
            result.decision ===
            "POSSIBLE"
        ) {

            decisionClass =
                "decision-possible";

        }

        else if (
            result.decision ===
            "NOT_ELIGIBLE"
        ) {

            decisionClass =
                "decision-not-eligible";

        }


        // -------------------------------------------------
        // DISPLAY RESULT
        // -------------------------------------------------
        

        let attendanceMessage = "";
        if (attendance >= 75) {
            attendanceMessage = `
            <div class="what-if-condition">
            <strong>Attendance</strong>
            <span class="condition-good">
                ${attendance}% ✓ Meets the 75% requirement
            </span>
        </div>
    `;}
        else {
            attendanceMessage = `
            <div class="what-if-condition">
            <strong>Attendance</strong>
            <span class="condition-bad">
                ${attendance}% ✕ Below the 75% requirement
            </span>
        </div>
    `;

}


const medicalMessage = `
    <div class="what-if-condition">
        <strong>Medical Certificate</strong>
        <span class="${
            medicalCertificate
                ? "condition-good"
                : "condition-bad"
        }">
            ${
                medicalCertificate
                    ? "Yes ✓"
                    : "No ✕"
            }
        </span>
    </div>
`;


const approvalMessage = `
    <div class="what-if-condition">
        <strong>Approval</strong>
        <span class="${
            approval
                ? "condition-good"
                : "condition-bad"
        }">
            ${
                approval
                    ? "Yes ✓"
                    : "No ✕"
            }
        </span>
    </div>
`;


resultContainer.innerHTML = `

    <div class="what-if-decision">

        <span class="what-if-status">

            ${result.status}

        </span>


        <h3 class="${decisionClass}">

            ${result.decision}

        </h3>


        <div class="what-if-conditions">

            ${attendanceMessage}

            ${medicalMessage}

            ${approvalMessage}

        </div>


        <div class="what-if-explanation">

            <strong>
                Why?
            </strong>

            <p>
                ${result.explanation}
            </p>

        </div>

    </div>

`;

    } catch (error) {

        // -------------------------------------------------
        // ERROR
        // -------------------------------------------------

        console.error(
            "What-If error:",
            error
        );


        resultContainer.innerHTML = `

            <div class="what-if-error">

                Unable to calculate the decision.

                <br><br>

                Please make sure the
                RuleLens API is running.

            </div>

        `;

    }

}
// =====================================================
// RULE DEPENDENCY GRAPH
// =====================================================

async function loadRuleGraph() {

    const container = document.getElementById(
        "ruleGraphContainer"
    );

    if (!container) {
        return;
    }

    try {

        const response = await fetch(
            `${API_URL}/rule-graph/`
        );

        if (!response.ok) {
            throw new Error(
                `HTTP ${response.status}`
            );
        }

        const result = await response.json();

        console.log(
            "Rule Graph response:",
            result
        );

        displayRuleGraph(
            result.graph
        );

    } catch (error) {

        console.error(
            "Rule Graph error:",
            error
        );

        container.innerHTML = `
            <div class="graph-error">
                Unable to load the Rule Graph.
                Please make sure the RuleLens API is running.
            </div>
        `;
    }
}


// =====================================================
// DISPLAY RULE GRAPH
// =====================================================

function displayRuleGraph(graph) {

    const container = document.getElementById(
        "ruleGraphContainer"
    );

    if (!container) {
        return;
    }

    if (
        !graph ||
        !graph.nodes ||
        !graph.edges
    ) {
        container.innerHTML = `
            <div class="graph-error">
                No rule graph data available.
            </div>
        `;
        return;
    }


    // =================================================
    // CREATE NODE MAP
    // =================================================

    const nodeMap = {};

    graph.nodes.forEach(node => {
        nodeMap[node.section] = node;
    });


    // =================================================
    // BUILD GRAPH
    // =================================================

    let html = `
        <div class="visual-graph">
    `;


    graph.edges.forEach((edge, index) => {

        const sourceNode =
            nodeMap[edge.source];

        const targetNode =
            nodeMap[edge.target];


        if (!sourceNode || !targetNode) {
            return;
        }


        let relationshipClass = "";

        if (edge.relationship === "exception-of") {
            relationshipClass = "relationship-exception";
        }

        if (edge.relationship === "requires") {
            relationshipClass = "relationship-requires";
        }

        if (edge.relationship === "contradicts") {
            relationshipClass = "relationship-conflict";
        }


        html += `

            <div class="graph-flow">

                <div class="visual-node">

                    <span class="visual-section">
                        SECTION ${sourceNode.section}
                    </span>

                    <strong>
                        ${sourceNode.title}
                    </strong>

                </div>


                <div class="visual-arrow">

                    <button
                        class="
                            relationship-label
                            ${relationshipClass}
                        "
                        data-edge-index="${index}"
                    >
                        ${edge.relationship}
                    </button>

                    <span class="arrow-line">
                        ↓
                    </span>

                </div>


                <div class="visual-node">

                    <span class="visual-section">
                        SECTION ${targetNode.section}
                    </span>

                    <strong>
                        ${targetNode.title}
                    </strong>

                </div>

            </div>

        `;
    });


    html += `
        </div>

        <div
            id="relationshipExplanation"
            class="relationship-explanation"
        >

            <strong>
                Rule Relationship
            </strong>

            <p>
                Click a relationship above to see
                how the two rules are connected.
            </p>

        </div>
    `;


    container.innerHTML = html;


    // =================================================
    // ADD CLICK EVENTS
    // =================================================

    const relationshipLabels =
        container.querySelectorAll(
            ".relationship-label"
        );


    relationshipLabels.forEach(label => {

        label.addEventListener(
            "click",
            function () {

                const edgeIndex =
                    Number(
                        this.dataset.edgeIndex
                    );

                const edge =
                    graph.edges[edgeIndex];

                if (!edge) {
                    return;
                }


                const sourceNode =
                    nodeMap[edge.source];

                const targetNode =
                    nodeMap[edge.target];


                const explanation =
                    document.getElementById(
                        "relationshipExplanation"
                    );


                if (!explanation) {
                    return;
                }


                explanation.innerHTML = `

                    <strong>
                        ${edge.relationship.toUpperCase()}
                    </strong>

                    <p>
                        Section ${sourceNode.section}
                        (${sourceNode.title})
                        is connected to Section
                        ${targetNode.section}
                        (${targetNode.title})
                        through the
                        <strong>
                            ${edge.relationship}
                        </strong>
                        relationship.
                    </p>

                `;
            }
        );

    });

}
// =====================================================
// LOAD RULE GRAPH WHEN PAGE LOADS
// =====================================================

document.addEventListener(
    "DOMContentLoaded",
    loadRuleGraph
);
// =====================================================
// RULELENS CHALLENGE MODE
// =====================================================

const challengeCases = [

    {
        scenario:
            "A student has 68% attendance and does not have a medical certificate or academic approval. What should happen?",

        attendance: 68,
        medical: false,
        approval: false
    },

    {
        scenario:
            "A student has 72% attendance, has a valid medical certificate, but does not have academic approval. What should happen?",

        attendance: 72,
        medical: true,
        approval: false
    },

    {
        scenario:
            "A student has 76% attendance and has no medical certificate. What should happen?",

        attendance: 76,
        medical: false,
        approval: false
    },

    {
        scenario:
            "A student has 70% attendance, has a medical certificate and has academic approval. What should happen?",

        attendance: 70,
        medical: true,
        approval: true
    },

    {
        scenario:
            "A student has 85% attendance but does not have medical documentation or special approval. What should happen?",

        attendance: 85,
        medical: false,
        approval: false
    }

];


let challengeCurrentCase = 0;

let challengeSelectedAnswer = null;

let challengeScore = 0;


// =====================================================
// START CHALLENGE
// =====================================================

function startChallenge() {

    challengeCurrentCase = 0;

    challengeSelectedAnswer = null;

    challengeScore = 0;


    document.getElementById(
        "challengeStart"
    ).style.display = "none";


    document.getElementById(
        "challengeFinal"
    ).style.display = "none";


    document.getElementById(
        "challengeResult"
    ).style.display = "none";


    document.getElementById(
        "challengeQuestion"
    ).style.display = "block";


    showChallengeCase();

}


// =====================================================
// SHOW CHALLENGE CASE
// =====================================================

function showChallengeCase() {

    const currentCase =
        challengeCases[
            challengeCurrentCase
        ];


    challengeSelectedAnswer = null;


    document.getElementById(
        "challengeProgress"
    ).textContent =
        `CASE ${challengeCurrentCase + 1} / ${challengeCases.length}`;


    document.getElementById(
        "challengeCaseNumber"
    ).textContent =
        challengeCurrentCase + 1;


    document.getElementById(
        "challengeScenario"
    ).textContent =
        currentCase.scenario;


    const optionsContainer =
        document.getElementById(
            "challengeOptions"
        );


    optionsContainer.innerHTML = `

        <button
            type="button"
            class="challenge-option"
            onclick="selectChallengeAnswer('ELIGIBLE', this)"
        >
            🟢 Eligible
        </button>

        <button
            type="button"
            class="challenge-option"
            onclick="selectChallengeAnswer('POSSIBLE', this)"
        >
            🟡 Possible
        </button>

        <button
            type="button"
            class="challenge-option"
            onclick="selectChallengeAnswer('NOT_ELIGIBLE', this)"
        >
            🔴 Not Eligible
        </button>

    `;


    document.getElementById(
        "challengeSubmit"
    ).disabled = true;

}


// =====================================================
// SELECT ANSWER
// =====================================================

function selectChallengeAnswer(
    answer,
    clickedButton
) {

    challengeSelectedAnswer = answer;


    const buttons =
        document.querySelectorAll(
            ".challenge-option"
        );


    buttons.forEach(function(button) {

        button.classList.remove(
            "selected"
        );

    });


    clickedButton.classList.add(
        "selected"
    );


    document.getElementById(
        "challengeSubmit"
    ).disabled = false;

}


// =====================================================
// SUBMIT CHALLENGE ANSWER
// =====================================================

async function submitChallengeAnswer() {

    if (!challengeSelectedAnswer) {

        return;

    }


    const currentCase =
        challengeCases[
            challengeCurrentCase
        ];


    const resultBox =
        document.getElementById(
            "challengeResult"
        );


    resultBox.style.display = "block";


    resultBox.innerHTML = `

        <div class="challenge-loading">

            ⚡ RuleLens is checking the rulebook...

        </div>

    `;


    try {

        const response = await fetch(

            `${API_URL}/evaluate`,

            {

                method: "POST",

                headers: {

                    "Content-Type":
                        "application/json"

                },

                body: JSON.stringify({

                    attendance:
                        currentCase.attendance,

                    medical_certificate:
                        currentCase.medical,

                    approval:
                        currentCase.approval

                })

            }

        );


        if (!response.ok) {

            throw new Error(
                `HTTP ${response.status}`
            );

        }


        const result =
            await response.json();


        const actualDecision =
            result.decision;


        const isCorrect =
            challengeSelectedAnswer ===
            actualDecision;


        if (isCorrect) {

            challengeScore++;

        }


        displayChallengeResult(
            result,
            isCorrect
        );


    }

    catch (error) {

        console.error(
            "Challenge error:",
            error
        );


        resultBox.innerHTML = `

            <div class="challenge-error">

                <strong>
                    Unable to check this challenge.
                </strong>

                <p>
                    Please make sure the RuleLens API
                    is running.
                </p>

            </div>

        `;

    }

}


// =====================================================
// DISPLAY CHALLENGE RESULT
// =====================================================

function displayChallengeResult(
    result,
    isCorrect
) {

    const resultBox =
        document.getElementById(
            "challengeResult"
        );


    const resultClass =
        isCorrect
            ? "challenge-correct"
            : "challenge-wrong";


    const resultTitle =
        isCorrect
            ? "✓ Correct!"
            : "✕ Not Quite";


    resultBox.innerHTML = `

        <div class="${resultClass}">

            <div class="challenge-result-title">

                ${resultTitle}

            </div>


            <div class="challenge-comparison">

                <div>

                    <span>
                        YOUR DECISION
                    </span>

                    <strong>
                        ${challengeSelectedAnswer}
                    </strong>

                </div>


                <div class="challenge-vs">
                    VS
                </div>


                <div>

                    <span>
                        RULELENS DECISION
                    </span>

                    <strong>
                        ${result.decision}
                    </strong>

                </div>

            </div>


            <div class="challenge-explanation">

                <strong>
                    🔍 Why?
                </strong>

                <p>
                    ${result.explanation || result.reasoning || "RuleLens evaluated the conditions using the decision engine."}
                </p>

            </div>


            <button
                type="button"
                class="challenge-next-button"
                onclick="nextChallengeCase()"
            >

                ${
                    challengeCurrentCase
                    <
                    challengeCases.length - 1
                        ? "Next Case →"
                        : "See Final Score →"
                }

            </button>

        </div>

    `;


    document.getElementById(
        "challengeQuestion"
    ).style.display = "none";

}


// =====================================================
// NEXT CHALLENGE CASE
// =====================================================

function nextChallengeCase() {

    challengeCurrentCase++;


    if (
        challengeCurrentCase
        >=
        challengeCases.length
    ) {

        showChallengeFinal();

        return;

    }


    document.getElementById(
        "challengeResult"
    ).style.display = "none";


    document.getElementById(
        "challengeQuestion"
    ).style.display = "block";


    showChallengeCase();

}


// =====================================================
// FINAL SCORE
// =====================================================

function showChallengeFinal() {

    document.getElementById(
        "challengeResult"
    ).style.display = "none";


    document.getElementById(
        "challengeQuestion"
    ).style.display = "none";


    document.getElementById(
        "challengeFinal"
    ).style.display = "block";


    document.getElementById(
        "challengeScore"
    ).textContent =
        challengeScore;


    let message;


    if (challengeScore === 5) {

        message =
            "🏆 Perfect! You mastered the rules.";

    }

    else if (challengeScore >= 3) {

        message =
            "🔥 Great job! You understand most of the rules.";

    }

    else {

        message =
            "💡 Good attempt! Review the rule explanations and try again.";

    }


    document.getElementById(
        "challengeScoreMessage"
    ).textContent =
        message;

}
