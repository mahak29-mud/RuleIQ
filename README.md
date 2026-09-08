# RuleIQ — AI-Powered Regulation Intelligence

RuleIQ is an AI-powered regulation intelligence platform that helps users understand complex university regulations, identify which rules apply to their situation, detect conflicting provisions, and explore how changing conditions can affect a decision.

Unlike a traditional rulebook chatbot that simply retrieves text, RuleIQ connects related regulations and provides explainable, evidence-grounded decisions.

🚀 Key Features

1. Rulebook Question Answering

Ask natural-language questions about university regulations and retrieve the most relevant provisions from the indexed rulebook.

**Example:**

> What attendance percentage is required to appear for the semester examination?

RuleIQ returns an answer along with the relevant section and supporting evidence.

2. NOT COVERED Detection

If the rulebook does not contain enough information to answer a question, RuleIQ returns:

**NOT COVERED**

This prevents the system from inventing unsupported information.

3. Conflict Detection

RuleIQ can identify contradictory regulations within the rulebook.

For example, if one section requires 75% attendance while another section specifies 60%, the system identifies the conflict and shows the relevant provisions.

**Result:**
**CONFLICT**

4. My Situation — Decision Engine

Users can enter their individual circumstances, such as:

* Attendance percentage
* Medical certificate
* Academic approval

RuleIQ evaluates these conditions and determines the applicable decision path.

Possible outcomes include:

* **ELIGIBLE**
* **POSSIBLE**
* **NOT_ELIGIBLE**
* **NOT COVERED**

5. What-If Simulator

The What-If Simulator allows users to change one or more conditions and immediately see how the decision changes.

**Example:**

`68% attendance + Medical Certificate + Approval → POSSIBLE`

Changing approval to:

`68% attendance + Medical Certificate + No Approval → NOT_ELIGIBLE`

This demonstrates how changing a condition can change the applicable rule path.

6. Rule Dependency Graph

RuleIQ represents relationships between regulations as a rule graph.

Example:

```text
4.2 Attendance Requirement
          │
     exception-of
          ↓
7.3 Medical Exception
          │
       requires
          ↓
7.4 Approval Requirement
```

It can also represent conflicts:

```text
8.1 Alternative Attendance
          │
      contradicts
          ↓
4.2 Attendance Requirement
```

## 🧠 How RuleIQ Works

```text
University Rulebook
        ↓
PDF/Text Extraction
        ↓
Rule Extraction
        ↓
Structured Rules
        ↓
Semantic Embeddings
        ↓
Rule Retrieval
        ↓
Decision Engine
        ↓
ANSWERED / NOT COVERED / CONFLICT
        ↓
Evidence + Explanation
        ↓
What-If Simulator + Rule Graph
```

 🛠️ Technology Stack

### Backend

* Python
* FastAPI
* Pydantic
* PyMuPDF
* Sentence Transformers
* NumPy

### Frontend

* HTML
* CSS
* JavaScript

### AI / NLP

* Semantic embeddings
* Natural-language rule retrieval
* Rule-based decision reasoning

## 📂 Project Structure

```text
RuleIQ/
│
├── backend/
│   ├── data/
│   │   └── rulebook/
│   ├── models/
│   ├── services/
│   ├── main.py
│   └── config.py
│
├── frontend/
│   ├── index.html
│   ├── app.js
│   ├── style.css
│   └── thankyou.html
│
├── tests/
├── requirements.txt
└── README.md
```

## ▶️ How to Run

### 1. Install dependencies

```bash
pip install -r requirements.txt
```

### 2. Start the FastAPI backend

```bash
python -m uvicorn backend.main:app --reload
```

The backend runs at:

```text
http://127.0.0.1:8000
```

### 3. Open the frontend

Open:

```text
frontend/index.html
```

using VS Code Live Server.

## 🧪 Example Demonstration

### Question Answering

**Question:**

> What attendance percentage is required to appear for the semester examination?

**Result:**
`ANSWERED`

### Unsupported Question

**Question:**

> What is the hostel fee?

**Result:**
`NOT COVERED`

### Conflict

**Question:**

> Show me the conflict between the attendance requirements.

**Result:**
`CONFLICT`

### Situation Evaluation

```text
Attendance: 68%
Medical Certificate: Yes
Academic Approval: Yes
```

**Result:**
`POSSIBLE`

## 🎯 What Makes RuleIQ Different?

Most rulebook systems focus on retrieving information.

RuleIQ focuses on **understanding how regulations interact and how they affect a decision**.

| Traditional Rule Chatbot         | RuleIQ                                |
| -------------------------------- | ------------------------------------- |
| Retrieves text                   | Connects related rules                |
| Gives a direct answer            | Explains the applicable decision path |
| May answer unsupported questions | Detects NOT COVERED                   |
| Usually ignores contradictions   | Detects CONFLICT                      |
| Static answers                   | What-If simulation                    |
| Text-based results               | Rule dependency graph                 |

🔮 Future Scope

* Automatic rule relationship extraction
* Rulebook version comparison
* Automatic rule testing
* Ambiguity detection
* Multi-university support
* Advanced policy auditing
* Improved rule conflict resolution
* Larger-scale document indexing

⚠️ Disclaimer

The demonstration rulebook used in this project is intended for testing and demonstration purposes. It should not be treated as an official university policy document.

 👩‍💻 Project

**Project Name:** RuleIQ
**Domain:** AI / Data Science / Regulation Intelligence
**Purpose:** Explain, connect, and evaluate complex regulations.
