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
    // GEMINI API KEY
    // =========================================

    const apiKey = process.env.GEMINI_API_KEY;

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

        if (!personalStatement || !String(personalStatement).trim()) {
            return res.status(400).json({
                success: false,
                error: "Personal statement is required."
            });
        }

        // =========================================
        // SYSTEM INSTRUCTIONS
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
6. If something is not found, say "NOT DETECTED" or "not demonstrated in the submitted material" rather than claiming the student definitely lacks it.
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

Recommendations should be specific and actionable.

Use priorities:
"High"
"Medium"
"Low"

Do not include markdown fences around the JSON.
`;

        // =========================================
        // USER APPLICATION
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
        // GEMINI API REQUEST
        // =========================================

        const response = await fetch(
            "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json",
                    "x-goog-api-key": apiKey
                },

                body: JSON.stringify({
                    systemInstruction: {
                        parts: [
                            {
                                text: systemPrompt
                            }
                        ]
                    },

                    contents: [
                        {
                            role: "user",
                            parts: [
                                {
                                    text: userPrompt
                                }
                            ]
                        }
                    ],

                    generationConfig: {
                        responseMimeType: "application/json",
                        temperature: 0.3
                    }
                })
            }
        );

        // =========================================
        // HANDLE GEMINI API ERROR
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
                "Unknown Gemini API error.";

            console.error(
                "Gemini API error:",
                response.status,
                message
            );

            return res.status(500).json({
                success: false,
                error: `AI service error (HTTP ${response.status}): ${message}`
            });
        }

        // =========================================
        // READ GEMINI RESPONSE
        // =========================================

        const data = await response.json();

        const outputText =
            data?.candidates?.[0]?.content?.parts
                ?.map(part => part.text || "")
                .join("")
                .trim();

        if (!outputText) {
            console.error(
                "Gemini returned no usable text:",
                JSON.stringify(data)
            );

            return res.status(500).json({
                success: false,
                error: "The AI returned an empty response."
            });
        }

        // =========================================
        // PARSE JSON
        // =========================================

        let analysis;

        try {
            analysis = JSON.parse(outputText);
        } catch (parseError) {
            console.error(
                "Could not parse Gemini JSON:",
                parseError
            );

            console.error(
                "Raw Gemini output:",
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
