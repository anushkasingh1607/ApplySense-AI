# ApplySense AI

**AI-powered application reviewer for students applying to university.**

ApplySense AI analyzes a student's **CV and personal statement** against their target academic field and application context, then provides evidence-based feedback on strengths, weaknesses, consistency, alignment, and concrete improvements.

### Live Demo

**https://apply-sense-ai-eight.vercel.app**

### Repository

**https://github.com/anushkasingh1607/ApplySense-AI**

---

## Why I Built It

University applications often contain strong experiences that are not presented clearly enough. Students may also use generic statements, make unsupported claims, or fail to connect their experiences to the course they want to study.

I built ApplySense AI to provide a structured second review before an application is submitted.

The goal is not to tell a student that their application is "good." The goal is to identify what the application actually demonstrates, what is unclear, and what evidence could be strengthened.

---

## What It Does

A student provides:

- Target field of study
- Academic level
- Country or region
- Optional university
- CV
- Personal statement

ApplySense then produces a structured review covering:

- **Overall assessment**
- **Key strengths**
- **Key weaknesses**
- **CV evidence**
- **Personal statement quality**
- **Generic or unsupported language**
- **CV–statement consistency**
- **Course alignment**
- **Missing or unclear evidence**
- **Prioritized recommendations**

---

## AI Review Principles

The reviewer is designed to be critical and evidence-based.

It is instructed to:

- Avoid automatic praise.
- Never invent achievements, skills, experiences, or qualifications.
- Distinguish explicit evidence from reasonable interpretation.
- Identify missing or unclear evidence without assuming that it does not exist.
- Flag generic statements when they are not supported by specific evidence.
- Explain why a weakness matters.
- Give actionable improvements.
- Avoid fabricating university requirements.
- Avoid predicting admission chances or acceptance probabilities.

This makes the application review more useful than a simple keyword or checklist-based score.

---

## How It Works

```text
User
  │
  ├── Academic goal
  ├── CV
  └── Personal statement
          │
          ▼
     ApplySense frontend
          │
          ▼
      /api/analyze
          │
          ▼
   Vercel serverless function
          │
          ▼
       OpenAI API
          │
          ▼
   Structured AI analysis
          │
          ▼
   ApplySense results dashboard
```

The API key is kept server-side as a Vercel environment variable rather than being exposed in the browser.

---

## Tech Stack

### Frontend
- HTML
- CSS
- JavaScript
- Responsive web interface

### Backend
- JavaScript
- Vercel serverless function
- HTTP API endpoint

### AI
- OpenAI API
- Structured JSON output
- Prompt-based application review

### Deployment
- GitHub
- Vercel

---

## Project Structure

```text
ApplySense-AI/
│
├── api/
│   └── analyze.js
│
├── index.html
├── script.js
├── style.css
└── README.md
```

---

## Key Engineering Decisions

### 1. Server-side AI requests

The browser does not directly contain the OpenAI API key.

Instead:

```text
Browser → /api/analyze → OpenAI
```

This keeps the secret out of the frontend source code.

### 2. Structured AI output

The AI response is requested in a predictable JSON structure containing sections for:

- Overall review
- CV analysis
- Personal statement analysis
- Consistency
- Alignment
- Recommendations

The frontend then renders those sections into the dashboard.

### 3. Evidence-first feedback

The reviewer is explicitly told not to treat missing keywords as proof that a student lacks a skill.

For example, instead of:

> "You have no leadership experience."

it should prefer:

> "Leadership evidence was not detected in the submitted material."

This reduces unsupported conclusions.

### 4. Local application signals

The frontend also calculates deterministic signals such as document metrics and displays them alongside the AI review.

This keeps some feedback independent of the language model while using AI for the deeper qualitative review.

---

## What I Learned

Building ApplySense AI helped me work with concepts beyond basic frontend development:

- Designing an AI-powered user workflow
- Connecting a frontend to a serverless backend
- Calling an external AI API securely
- Managing environment variables
- Working with structured JSON responses
- Designing prompts for evidence-based analysis
- Handling API failures in the UI
- Deploying a full application with Vercel
- Testing the same application across desktop and mobile

---

## Limitations

ApplySense AI is a student-built application review tool, not an admissions decision system.

Its feedback depends on:

- The quality and completeness of the submitted material
- The AI model's interpretation
- The application context provided by the user

It does **not** determine whether a student will be admitted and does not provide an admission probability.

---

## Future Improvements

Possible future extensions include:

- PDF/DOCX CV upload
- More detailed course-specific analysis
- Version comparison between application drafts
- Saved analysis history
- Better accessibility support
- Additional language support
- More granular evidence tracing from feedback back to submitted text

---

## Author

**Anushka Singh**

Student developer interested in **Computer Science, Artificial Intelligence, and technology-driven education tools**.

---

## License

This project is currently presented as a personal portfolio project.
