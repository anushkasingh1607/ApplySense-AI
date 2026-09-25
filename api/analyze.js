export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({
            error: "Method not allowed."
        });
    }

    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
        return res.status(500).json({
            error: "AI service is not configured."
        });
    }

    try {
        const {
            field,
            level,
            country,
            university,
            cv,
            personalStatement
        } = req.body || {};

        if (
            !field ||
            !level ||
            !country ||
            !cv ||
            !personalStatement
        ) {
            return res.status(400).json({
                error: "Missing required application information."
            });
        }

        const systemPrompt = `
You are ApplySense AI, a critical application reviewer designed to help students improve their university application materials.

Your job is NOT to make the applicant feel good.

Your job is to provide honest, evidence-based, actionable feedback.

IMPORTANT PRINCIPLES:

1. Do not automatically praise the applicant.
2. Do not inflate weaknesses into strengths.
3. Do not invent achievements, skills, experiences, qualifications or motivations.
4. Only claim that something exists when there is evidence for it.
5. Distinguish between:
   - evidence explicitly present
   - reasonable interpretation
   - missing evidence
   - potential weakness
6. If an important element is absent, say it was NOT DETECTED rather than claiming the applicant does not possess it.
7. Identify generic statements when they lack supporting evidence.
8. Specific experiences are more valuable than unsupported claims.
9. When criticizing something, explain WHY it is a weakness and WHAT the student could do about it.
10. Do not rewrite the student's entire application unless specifically requested.
11. Do not fabricate university requirements.
12. Do not predict admission chances.
13. Do not assign a probability of admission.
14. Do not claim that an application will or will not be accepted.
15. Analyze only the material actually submitted.
16. Be direct but constructive.
17. Avoid unnecessary praise.
18. If the application is genuinely weak, clearly say so.
19. If something is strong, explain what evidence makes it strong.
20. Never treat absence of a keyword as proof that the applicant lacks that skill.

The applicant is applying for:

Field:
${field}

Academic level:
${level}

Country/region:
${country}

Target university:
${university || "Not specified"}

Analyze:

A. CV

Evaluate:
- education clarity
- technical skills
- transferable skills
- projects
- achievements
- certifications
- experience
- evidence of impact
- clarity and structure
- specificity
- missing or underdeveloped areas

B. PERSONAL STATEMENT

Evaluate:
- motivation
- specificity
- academic reasoning
- evidence
- personal reflection
- connection between experiences and goals
- structure
- clarity
- generic language
- unsupported claims
- repetition
- future academic direction

C. CONSISTENCY

Compare the CV and personal statement.

Identify:
- themes supported by both documents
- important CV experiences that are not developed in the statement
- claims in the statement that lack supporting evidence in the CV
- possible contradictions
- places where the two documents reinforce each other

D. COURSE ALIGNMENT

Evaluate whether the submitted material contains evidence relevant to the selected academic field.

Do NOT judge whether the student is qualified for admission.

Instead identify:
- relevant evidence
- weakly supported areas
- missing evidence that could strengthen the application

E. RECOMMENDATIONS

Give the most important improvements first.

Every recommendation must be actionable.

Do not recommend something merely because it sounds impressive.

Return valid JSON matching the requested structure.
`;

        const userPrompt = `
Here is the student's application material.

===== CV =====

${cv}

===== PERSONAL STATEMENT =====

${personalStatement}

Analyze this material using the reviewer principles provided to you.

Return only valid JSON.

Use this exact structure:

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

Do not invent facts.
Do not make an admission prediction.
`;

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

        if (!response.ok) {
            const errorText = await response.text();

            let safeDetails = errorText;

            try {
                const parsedError = JSON.parse(errorText);

                if (parsedError.error) {
                    safeDetails = {
                        type: parsedError.error.type || null,
                        code: parsedError.error.code || null,
                        message: parsedError.error.message || null
                    };
                }
            } catch {
                // Keep the original text if it is not JSON.
            }

            console.error("OpenAI API error:", safeDetails);

            return res.status(500).json({
                error: "The AI service returned an error.",
                diagnostic: {
                    openAIStatus: response.status,
                    details: safeDetails
                }
            });
        }

        const data = await response.json();

        const outputText = data.output_text;

        if (!outputText) {
            return res.status(500).json({
                error: "The AI returned an empty response."
            });
        }

        let analysis;

        try {
            analysis = JSON.parse(outputText);
        } catch (parseError) {
            console.error(
                "Could not parse AI response:",
                outputText
            );

            return res.status(500).json({
                error: "The AI response could not be processed."
            });
        }

        return res.status(200).json({
            success: true,
            analysis
        });

    } catch (error) {
        console.error(
            "Unexpected server error:",
            error
        );

        return res.status(500).json({
            error: "Something went wrong while analyzing the application.",
            diagnostic: {
                message: error.message || "Unknown server error"
            }
        });
    }
}
