export default async function handler(req, res) {
    // =========================================
    // METHOD CHECK
    // =========================================

    if (req.method !== "POST") {
        return res.status(405).json({
            success: false,
            error: "Method not allowed."
        });
    }

    // =========================================
    // API KEY CHECK
    // =========================================

    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
        return res.status(500).json({
            success: false,
            error: "AI service is not configured."
        });
    }

    try {
        // =========================================
        // READ REQUEST DATA
        // =========================================

        const {
            field,
            level,
            country,
            university,
            cv,
            personalStatement
        } = req.body || {};

        // =========================================
        // VALIDATION
        // =========================================

        if (!field || !level || !country) {
            return res.status(400).json({
                success: false,
                error: "Field, academic level, and country are required."
            });
        }

        if (!cv || !String(cv).trim()) {
            return res.status(400).json({
                success: false,
                error: "CV content is required."
            });
        }

        if (
            !personalStatement ||
            !String(personalStatement).trim()
        ) {
            return res.status(400).json({
                success: false,
                error: "Personal statement is required."
            });
        }

        // =========================================
        // REVIEWER INSTRUCTIONS
        // =========================================

        const systemPrompt = `
You are ApplySense AI, a rigorous application reviewer for students applying to university.

Your job is to critically analyze the student's CV and personal statement.

You must be accurate, evidence-based, direct, and constructive.

IMPORTANT RULES:

1. Do NOT automatically praise the student.
2. Do NOT make the application sound stronger than the evidence supports.
3. Do NOT invent achievements, skills, projects, experiences, qualifications, motivations, or interests.
4. Only say that an achievement, skill, experience, or qualification exists when the submitted material provides evidence for it.
5. Distinguish between:
   - evidence explicitly present
   - reasonable interpretation
   - missing evidence
   - potential weakness
6. If something is not found, use wording such as "NOT DETECTED" or "not demonstrated in the submitted material" rather than claiming the student definitely lacks it.
7. Identify generic statements when they are unsupported by specific evidence.
8. Explain why important weaknesses matter.
9. Give practical actions for improving weaknesses.
10. Do not fabricate university requirements.
11. Do not predict admission chances or admission probability.
12. Do not claim that the student will or will not be admitted.
13. Do not treat the absence of a keyword as proof that the student lacks a skill.
14. Analyze only the material actually submitted.
15. Do not rewrite the entire CV or personal statement unless specifically requested.
16. Be especially attentive to evidence, specificity, coherence, and alignment with the target field.
17. If something is genuinely weak, say so clearly.
18. If something is genuinely strong, explain what evidence makes it strong.
19. Consider the student's academic level and target field.
20. Never invent requirements for the target country or university.

Target field:
${String(field)}

Academic level:
${String(level)}

Country/region:
${String(country)}

University:
${university ? String(university) : "Not specified"}

Return ONLY valid JSON using exactly this structure:

{
  "overall": {
    "summary": "",
    "criticality": "",
    "keyStrengths": [],
    "keyWeaknesses": []
  },
  "cv": {
    "strengths": [],
    "weaknesses": [],
    "evidenceFound": [],
    "missingOrUnclear": []
  },
  "statement": {
    "strengths": [],
    "weaknesses": [],
    "genericLanguage": [],
    "evidenceQuality": "",
    "missingOrUnclear": []
  },
  "consistency": {
    "supportedThemes": [],
    "gaps": [],
    "potentialContradictions": []
  },
  "alignment": {
    "relevantEvidence": [],
    "weaklySupportedAreas": [],
    "missingEvidence": []
  },
  "recommendations": [
    {
      "priority": "",
      "issue": "",
      "whyItMatters": "",
      "action": ""
    }
  ]
}

The recommendations should be specific and actionable.

Use priorities such as:
"High"
"Medium"
"Low"

Do not include markdown fences around the JSON.
`;

        // =========================================
        // USER MATERIAL
        // =========================================

        const userPrompt = `
Analyze this university application.

TARGET:
Field: ${String(field)}
Academic level: ${String(level)}
Country/Region: ${String(country)}
University: ${university ? String(university) : "Not specified"}

===== CV =====

${String(cv)}

===== PERSONAL STATEMENT =====

${String(personalStatement)}

===== END MATERIAL =====

Return the requested JSON analysis.
`;

        // =========================================
        // OPENAI REQUEST
        // =========================================

        const response = await fetch(
            "https://api.openai.com/v1/responses",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${apiKey}`
                },

                body: JSON.stringify({
                    model: "gpt-5.6-luna",

                    input: [
                        {
                            role: "system",
                            content: systemPrompt
                        },
                        {
                            role: "user",
                            content: userPrompt
                        }
                    ],

                    text: {
                        format: {
                            type: "json_object"
                        }
                    }
                })
            }
        );

        // =========================================
        // HANDLE OPENAI HTTP ERRORS
        // =========================================

        if (!response.ok) {
            let errorDetails = null;

            try {
                errorDetails = await response.json();
            } catch {
                errorDetails = null;
            }

            const message =
                errorDetails?.error?.message ||
                errorDetails?.message ||
                "Unknown OpenAI API error.";

            console.error(
                "OpenAI API error:",
                response.status,
                message
            );

            return res.status(500).json({
                success: false,
                error: `AI service error (HTTP ${response.status}): ${message}`
            });
        }

        // =========================================
        // READ OPENAI RESPONSE
        // =========================================

        const data = await response.json();

        let outputText = data.output_text;

        // Fallback extraction in case output_text is unavailable.
        if (!outputText && Array.isArray(data.output)) {
            for (const item of data.output) {
                if (!Array.isArray(item.content)) {
                    continue;
                }

                for (const content of item.content) {
                    if (
                        content.type === "output_text" &&
                        typeof content.text === "string"
                    ) {
                        outputText = content.text;
                        break;
                    }
                }

                if (outputText) {
                    break;
                }
            }
        }

        if (!outputText) {
            console.error(
                "OpenAI response did not contain output text:",
                JSON.stringify(data)
            );

            return res.status(500).json({
                success: false,
                error: "The AI returned an empty response."
            });
        }

        // =========================================
        // PARSE AI JSON
        // =========================================

        let analysis;

        try {
            analysis = JSON.parse(outputText);
        } catch (parseError) {
            console.error(
                "Could not parse AI JSON:",
                parseError
            );

            console.error(
                "Raw AI output:",
                outputText
            );

            return res.status(500).json({
                success: false,
                error: "The AI returned an unreadable analysis."
            });
        }

        // =========================================
        // SUCCESS
        // =========================================

        return res.status(200).json({
            success: true,
            analysis
        });

    } catch (error) {
        // =========================================
        // UNEXPECTED SERVER ERROR
        // =========================================

        console.error(
            "ApplySense AI backend error:",
            error
        );

        return res.status(500).json({
            success: false,
            error:
                error?.message ||
                "An unexpected server error occurred."
        });
    }
}
