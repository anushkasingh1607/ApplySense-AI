/* =========================================
   APPLY SENSE AI
   AI-POWERED APPLICATION ANALYSIS ENGINE
   ========================================= */

/* =========================================
   ELEMENTS
   ========================================= */

const applicationForm = document.getElementById("applicationForm");
const cvText = document.getElementById("cvText");
const statementText = document.getElementById("statementText");
const cvCount = document.getElementById("cvCount");
const statementCount = document.getElementById("statementCount");
const resultsSection = document.getElementById("results");
const workspace = document.getElementById("workspace");
const newAnalysisButton = document.getElementById("newAnalysisButton");
const startButton = document.getElementById("startButton");

const AI_ENDPOINT = "/api/analyze";

/* =========================================
   SMALL UTILITIES
   ========================================= */

function updateCharacterCount(textarea, counter) {
    if (!textarea || !counter) return;

    counter.textContent =
        `${textarea.value.length.toLocaleString()} characters`;
}

function normalizeText(text) {
    return String(text || "")
        .toLowerCase()
        .replace(/[^\w\s+#.-]/g, " ")
        .replace(/\s+/g, " ")
        .trim();
}

function countWords(text) {
    const cleanText = String(text || "").trim();

    if (!cleanText) return 0;

    return cleanText.split(/\s+/).length;
}

function findKeywords(text, keywords) {
    const normalized = normalizeText(text);
    const found = [];

    keywords.forEach(function (keyword) {
        if (normalized.includes(normalizeText(keyword))) {
            found.push(keyword);
        }
    });

    return found;
}

function getElement(id) {
    return document.getElementById(id);
}

function safeArray(value) {
    return Array.isArray(value) ? value : [];
}

function safeText(value, fallback = "") {
    if (value === null || value === undefined) {
        return fallback;
    }

    return String(value);
}

function createElement(tag, className, text) {
    const element = document.createElement(tag);

    if (className) {
        element.className = className;
    }

    if (text !== undefined) {
        element.textContent = safeText(text);
    }

    return element;
}

function appendList(container, items, emptyMessage) {
    if (!container) return;

    const list = createElement("div", "ai-list");

    if (!items.length) {
        list.appendChild(
            createElement("p", "ai-empty", emptyMessage)
        );
        container.appendChild(list);
        return;
    }

    items.forEach(function (item) {
        const row = createElement("div", "ai-list-item");
        row.textContent = safeText(item);
        list.appendChild(row);
    });

    container.appendChild(list);
}

function createAISection(title, items, emptyMessage) {
    const section = createElement("div", "ai-feedback-section");

    section.appendChild(
        createElement("h3", "ai-feedback-title", title)
    );

    appendList(
        section,
        safeArray(items),
        emptyMessage
    );

    return section;
}

/* =========================================
   CHARACTER COUNTERS
   ========================================= */

if (cvText) {
    cvText.addEventListener("input", function () {
        updateCharacterCount(cvText, cvCount);
    });
}

if (statementText) {
    statementText.addEventListener("input", function () {
        updateCharacterCount(statementText, statementCount);
    });
}

/* =========================================
   START ANALYSIS BUTTON
   ========================================= */

if (startButton) {
    startButton.addEventListener("click", function () {
        if (workspace) {
            workspace.scrollIntoView({
                behavior: "smooth"
            });
        }
    });
}

/* =========================================
   LOCAL DOCUMENT SIGNAL ANALYSIS
   These metrics remain deterministic.
   They are NOT the AI's judgment.
   ========================================= */

function analyzeCV(cv) {
    const skillsDictionary = [
        "html", "css", "javascript", "python", "java", "c++", "c",
        "sql", "react", "node", "git", "github", "machine learning",
        "artificial intelligence", "data analysis", "data science",
        "figma", "excel", "matlab", "research", "communication",
        "leadership", "problem solving"
    ];

    const projectWords = [
        "project", "projects", "developed", "built", "created",
        "application", "app", "website", "prototype", "portfolio"
    ];

    const achievementWords = [
        "award", "awards", "achievement", "achievements", "competition",
        "winner", "finalist", "certificate", "certification",
        "scholarship", "olympiad", "rank", "medal"
    ];

    const educationWords = [
        "education", "school", "college", "university", "degree",
        "bachelor", "master", "class 10", "class 12", "cbse",
        "icse", "gpa", "percentage"
    ];

    const experienceWords = [
        "experience", "internship", "intern", "work experience",
        "volunteer", "volunteering", "worked", "role", "position"
    ];

    return {
        skills: findKeywords(cv, skillsDictionary),
        projectSignals: findKeywords(cv, projectWords),
        achievementSignals: findKeywords(cv, achievementWords),
        educationSignals: findKeywords(cv, educationWords),
        experienceSignals: findKeywords(cv, experienceWords)
    };
}

function analyzeStatement(statement) {
    const normalized = normalizeText(statement);
    const words = countWords(statement);

    const genericPhrases = [
        "i have always been passionate",
        "since childhood",
        "dream university",
        "dream college",
        "i am passionate about",
        "i have always wanted",
        "ever since i was young",
        "i believe i am",
        "i am a hardworking student",
        "i am very interested in",
        "my passion for",
        "i want to make a difference"
    ];

    const evidenceWords = [
        "developed", "built", "created", "designed", "researched",
        "analysed", "analyzed", "participated", "completed", "organized",
        "led", "won", "achieved", "learned", "implemented", "worked"
    ];

    const experienceWords = [
        "project", "competition", "internship", "course", "research",
        "experiment", "workshop", "hackathon", "club", "volunteering",
        "experience"
    ];

    const genericMatches = findKeywords(normalized, genericPhrases);
    const evidenceMatches = findKeywords(normalized, evidenceWords);
    const experienceMatches = findKeywords(normalized, experienceWords);

    let specificity = "Needs more evidence";

    if (
        experienceMatches.length >= 3 ||
        evidenceMatches.length >= 4
    ) {
        specificity = "Strong";
    } else if (
        experienceMatches.length >= 1 ||
        evidenceMatches.length >= 2
    ) {
        specificity = "Developing";
    }

    let evidence = "Limited";

    if (evidenceMatches.length >= 5) {
        evidence = "Strong";
    } else if (evidenceMatches.length >= 2) {
        evidence = "Developing";
    }

    return {
        wordCount: words,
        genericMatches,
        evidenceMatches,
        experienceMatches,
        specificity,
        evidence
    };
}

function analyzeAlignment(field, cv, statement) {
    const combinedText = `${cv} ${statement}`;

    const fieldKeywords = {
        "Computer Science": [
            "programming", "software", "coding", "algorithm",
            "computer", "javascript", "python", "java", "data",
            "project", "technology", "mathematics"
        ],

        "Artificial Intelligence": [
            "artificial intelligence", "machine learning", "data",
            "python", "algorithm", "programming", "neural", "model",
            "research", "mathematics"
        ],

        "Data Science": [
            "data", "statistics", "analysis", "python", "sql",
            "machine learning", "research", "mathematics"
        ],

        "Engineering": [
            "engineering", "mathematics", "physics", "design",
            "project", "research", "technology"
        ],

        "Mathematics": [
            "mathematics", "mathematical", "statistics", "calculus",
            "algebra", "research", "problem solving", "competition"
        ],

        "Business": [
            "business", "management", "leadership", "marketing",
            "finance", "entrepreneurship", "project"
        ],

        "Economics": [
            "economics", "economy", "finance", "statistics",
            "mathematics", "research", "data"
        ],

        "Medicine": [
            "medicine", "biology", "chemistry", "research",
            "health", "volunteering", "clinical"
        ]
    };

    const keywords = fieldKeywords[field] || [];
    const matches = findKeywords(combinedText, keywords);
    const uniqueMatches = [...new Set(matches)];

    let percentage = 0;

    if (keywords.length > 0) {
        percentage = Math.round(
            (uniqueMatches.length / keywords.length) * 100
        );
    }

    return {
        keywords: uniqueMatches,
        percentage: Math.min(percentage, 100)
    };
}

function analyzeConsistency(cv, statement) {
    const cvNormalized = normalizeText(cv);
    const statementNormalized = normalizeText(statement);

    const consistencyKeywords = [
        "programming", "javascript", "python", "java",
        "machine learning", "artificial intelligence", "research",
        "project", "mathematics", "data", "leadership",
        "competition", "internship", "volunteering"
    ];

    const sharedKeywords = [];
    const cvOnly = [];
    const statementOnly = [];

    consistencyKeywords.forEach(function (keyword) {
        const normalizedKeyword = normalizeText(keyword);

        const inCV = cvNormalized.includes(normalizedKeyword);
        const inStatement =
            statementNormalized.includes(normalizedKeyword);

        if (inCV && inStatement) {
            sharedKeywords.push(keyword);
        }

        if (inCV && !inStatement) {
            cvOnly.push(keyword);
        }

        if (!inCV && inStatement) {
            statementOnly.push(keyword);
        }
    });

    let percentage = 50;

    if (sharedKeywords.length > 0) {
        percentage = Math.min(
            100,
            50 + (sharedKeywords.length * 8)
        );
    }

    return {
        shared: sharedKeywords,
        cvOnly,
        statementOnly,
        percentage
    };
}

/* =========================================
   LOCAL SIGNALS
   ========================================= */

function calculateCVSignal(cvAnalysis) {
    let score = 0;

    if (cvAnalysis.skills.length >= 3) score += 30;
    else if (cvAnalysis.skills.length >= 1) score += 15;

    if (cvAnalysis.projectSignals.length >= 2) score += 25;
    else if (cvAnalysis.projectSignals.length >= 1) score += 12;

    if (cvAnalysis.achievementSignals.length >= 1) score += 15;
    if (cvAnalysis.educationSignals.length >= 1) score += 20;
    if (cvAnalysis.experienceSignals.length >= 1) score += 10;

    return Math.min(score, 100);
}

function calculateStatementSignal(statementAnalysis) {
    let score = 20;

    if (statementAnalysis.wordCount >= 250) score += 15;
    if (statementAnalysis.wordCount >= 500) score += 10;

    if (statementAnalysis.specificity === "Strong") score += 25;
    else if (statementAnalysis.specificity === "Developing") score += 15;

    if (statementAnalysis.evidence === "Strong") score += 25;
    else if (statementAnalysis.evidence === "Developing") score += 15;

    if (statementAnalysis.genericMatches.length === 0) score += 5;

    return Math.min(score, 100);
}

function getSignalLabel(score) {
    if (score >= 75) return "Strong";
    if (score >= 50) return "Developing";
    return "Needs attention";
}

function updateSignal(
    valueElement,
    textElement,
    barElement,
    score,
    description
) {
    if (valueElement) {
        valueElement.textContent = getSignalLabel(score);
    }

    if (textElement) {
        textElement.textContent = description;
    }

    if (barElement) {
        barElement.style.width = `${score}%`;
    }
}

/* =========================================
   AI REQUEST
   ========================================= */

async function requestAIAnalysis(applicationData) {
    const response = await fetch(AI_ENDPOINT, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(applicationData)
    });

    let data = null;

    try {
        data = await response.json();
    } catch (error) {
        throw new Error(
            "The server returned an unreadable response."
        );
    }

    if (!response.ok) {
        throw new Error(
            data && data.error
                ? data.error
                : "The AI service could not analyze the application."
        );
    }

    if (!data || !data.success || !data.analysis) {
        throw new Error(
            "The AI service returned an incomplete analysis."
        );
    }

    return data.analysis;
}

/* =========================================
   LOADING STATE
   ========================================= */

function getSubmitButton() {
    if (!applicationForm) return null;

    return (
        applicationForm.querySelector(
            'button[type="submit"]'
        ) ||
        applicationForm.querySelector(
            'input[type="submit"]'
        )
    );
}

function setLoadingState(isLoading) {
    const button = getSubmitButton();

    if (!button) return;

    if (isLoading) {
        button.dataset.originalText =
            button.textContent || button.value || "";

        if ("value" in button) {
            button.value = "Analyzing application...";
        } else {
            button.textContent = "Analyzing application...";
        }

        button.disabled = true;
        button.setAttribute("aria-busy", "true");
    } else {
        const original =
            button.dataset.originalText || "Analyze My Application";

        if ("value" in button) {
            button.value = original;
        } else {
            button.textContent = original;
        }

        button.disabled = false;
        button.removeAttribute("aria-busy");
    }
}

function showAnalysisError(message) {
    alert(
        `ApplySense AI could not complete the analysis.\n\n${message}`
    );
}

/* =========================================
   AI RESULTS
   ========================================= */

function renderOverallAIReview(analysis) {
    if (!resultsSection) return;

    const existing =
        document.getElementById("aiReviewPanel");

    if (existing) {
        existing.remove();
    }

    const panel = createElement(
        "div",
        "analysis-panel ai-review-panel"
    );

    panel.id = "aiReviewPanel";

    panel.appendChild(
        createElement(
            "div",
            "panel-eyebrow",
            "AI REVIEW"
        )
    );

    panel.appendChild(
        createElement(
            "h2",
            "ai-review-heading",
            "Critical Application Review"
        )
    );

    panel.appendChild(
        createElement(
            "p",
            "ai-review-summary",
            safeText(
                analysis?.overall?.summary,
                "The AI completed the application review."
            )
        )
    );

    if (analysis?.overall?.criticality) {
        panel.appendChild(
            createElement(
                "p",
                "ai-review-criticality",
                `Review assessment: ${analysis.overall.criticality}`
            )
        );
    }

    const columns = createElement(
        "div",
        "ai-review-columns"
    );

    const strengths = createElement(
        "div",
        "ai-review-column"
    );

    strengths.appendChild(
        createElement(
            "h3",
            null,
            "Evidence-supported strengths"
        )
    );

    appendList(
        strengths,
        safeArray(analysis?.overall?.keyStrengths),
        "No specific strengths were identified from the submitted material."
    );

    const weaknesses = createElement(
        "div",
        "ai-review-column"
    );

    weaknesses.appendChild(
        createElement(
            "h3",
            null,
            "Important weaknesses"
        )
    );

    appendList(
        weaknesses,
        safeArray(analysis?.overall?.keyWeaknesses),
        "No major weaknesses were identified by the AI."
    );

    columns.appendChild(strengths);
    columns.appendChild(weaknesses);
    panel.appendChild(columns);

    const anchor =
        document.querySelector("#results .results-context") ||
        resultsSection.firstElementChild;

    if (anchor) {
        resultsSection.insertBefore(panel, anchor);
    } else {
        resultsSection.prepend(panel);
    }
}

function renderCVAndStatementSignals(analysis) {
    const cvTextElement = getElement("cvSignalText");
    const statementTextElement =
        getElement("statementSignalText");

    const cvWeaknesses =
        safeArray(analysis?.cv?.weaknesses);

    const cvStrengths =
        safeArray(analysis?.cv?.strengths);

    const statementWeaknesses =
        safeArray(analysis?.statement?.weaknesses);

    const statementStrengths =
        safeArray(analysis?.statement?.strengths);

    if (cvTextElement) {
        const firstIssue =
            cvWeaknesses[0] ||
            "No major CV weakness was highlighted by the AI.";

        const firstStrength =
            cvStrengths[0] ||
            "No specific CV strength was strongly evidenced.";

        cvTextElement.textContent =
            `AI strength: ${firstStrength} AI concern: ${firstIssue}`;
    }

    if (statementTextElement) {
        const firstIssue =
            statementWeaknesses[0] ||
            "No major statement weakness was highlighted by the AI.";

        const firstStrength =
            statementStrengths[0] ||
            "No specific statement strength was strongly evidenced.";

        statementTextElement.textContent =
            `AI strength: ${firstStrength} AI concern: ${firstIssue}`;
    }
}

function renderConsistencyInsights(analysis) {
    const container =
        getElement("consistencyContent");

    if (!container) return;

    container.innerHTML = "";

    container.appendChild(
        createAISection(
            "Themes supported by both documents",
            safeArray(
                analysis?.consistency?.supportedThemes
            ),
            "No strongly supported shared themes were identified."
        )
    );

    container.appendChild(
        createAISection(
            "Gaps between the CV and statement",
            safeArray(
                analysis?.consistency?.gaps
            ),
            "No major document gaps were identified."
        )
    );

    container.appendChild(
        createAISection(
            "Potential contradictions",
            safeArray(
                analysis?.consistency?.potentialContradictions
            ),
            "No potential contradictions were identified from the submitted material."
        )
    );
}

function renderAlignmentInsights(analysis) {
    const container =
        getElement("alignmentContent");

    if (!container) return;

    container.innerHTML = "";

    container.appendChild(
        createAISection(
            "Relevant evidence",
            safeArray(
                analysis?.alignment?.relevantEvidence
            ),
            "The AI did not identify strong field-relevant evidence."
        )
    );

    container.appendChild(
        createAISection(
            "Weakly supported areas",
            safeArray(
                analysis?.alignment?.weaklySupportedAreas
            ),
            "No weakly supported areas were specifically identified."
        )
    );

    container.appendChild(
        createAISection(
            "Missing evidence that could strengthen the application",
            safeArray(
                analysis?.alignment?.missingEvidence
            ),
            "No additional missing evidence was specifically identified."
        )
    );
}

function renderRecommendations(analysis) {
    const container =
        getElement("recommendationContent");

    if (!container) return;

    container.innerHTML = "";

    const recommendations =
        safeArray(analysis?.recommendations);

    if (!recommendations.length) {
        container.appendChild(
            createElement(
                "p",
                "ai-empty",
                "The AI did not return any recommendations."
            )
        );

        return;
    }

    recommendations.slice(0, 6).forEach(
        function (recommendation, index) {
            const card =
                createElement(
                    "div",
                    "recommendation-card"
                );

            const number =
                createElement(
                    "div",
                    "recommendation-number",
                    String(index + 1).padStart(2, "0")
                );

            const title =
                createElement(
                    "h3",
                    null,
                    recommendation.issue ||
                    "Application improvement"
                );

            const priority =
                createElement(
                    "p",
                    "ai-priority",
                    `Priority: ${safeText(
                        recommendation.priority,
                        "Not specified"
                    )}`
                );

            const why =
                createElement(
                    "p",
                    null,
                    `Why it matters: ${safeText(
                        recommendation.whyItMatters,
                        "The AI did not provide additional explanation."
                    )}`
                );

            const action =
                createElement(
                    "p",
                    null,
                    `Action: ${safeText(
                        recommendation.action,
                        "No specific action was provided."
                    )}`
                );

            card.appendChild(number);
            card.appendChild(title);
            card.appendChild(priority);
            card.appendChild(why);
            card.appendChild(action);

            container.appendChild(card);
        }
    );
}

function renderAIAnalysis(analysis) {
    renderOverallAIReview(analysis);
    renderCVAndStatementSignals(analysis);
    renderConsistencyInsights(analysis);
    renderAlignmentInsights(analysis);
    renderRecommendations(analysis);
}

/* =========================================
   LOCAL RESULT METRICS
   ========================================= */

function updateLocalMetrics(
    field,
    cvAnalysis,
    statementAnalysis,
    consistency,
    alignment
) {
    const cvScore =
        calculateCVSignal(cvAnalysis);

    const statementScore =
        calculateStatementSignal(statementAnalysis);

    const consistencyScore =
        consistency.percentage;

    const alignmentScore =
        alignment.percentage;

    updateSignal(
        getElement("cvSignal"),
        getElement("cvSignalText"),
        getElement("cvBar"),
        cvScore,
        `${cvAnalysis.skills.length} skill signal(s), ` +
        `${cvAnalysis.projectSignals.length} project signal(s) ` +
        `and ${cvAnalysis.achievementSignals.length} achievement signal(s) ` +
        `were detected by the local document scanner.`
    );

    updateSignal(
        getElement("statementSignal"),
        getElement("statementSignalText"),
        getElement("statementBar"),
        statementScore,
        `${statementAnalysis.wordCount} words detected with ` +
        `${statementAnalysis.evidenceMatches.length} evidence signal(s) ` +
        `by the local document scanner.`
    );

    updateSignal(
        getElement("consistencySignal"),
        getElement("consistencySignalText"),
        getElement("consistencyBar"),
        consistencyScore,
        `${consistency.shared.length} shared application signal(s) ` +
        `were detected by the local scanner.`
    );

    updateSignal(
        getElement("alignmentSignal"),
        getElement("alignmentSignalText"),
        getElement("alignmentBar"),
        alignmentScore,
        `${alignment.keywords.length} tracked ` +
        `${field.toLowerCase()} signal(s) were detected by the local scanner.`
    );

    const skillsCount = getElement("skillsCount");
    const projectsCount = getElement("projectsCount");
    const achievementsCount = getElement("achievementsCount");
    const educationStatus = getElement("educationStatus");

    if (skillsCount) {
        skillsCount.textContent =
            cvAnalysis.skills.length;
    }

    if (projectsCount) {
        projectsCount.textContent =
            cvAnalysis.projectSignals.length;
    }

    if (achievementsCount) {
        achievementsCount.textContent =
            cvAnalysis.achievementSignals.length;
    }

    if (educationStatus) {
        educationStatus.textContent =
            cvAnalysis.educationSignals.length > 0
                ? "Detected"
                : "Not detected";
    }

    const wordCount = getElement("wordCount");
    const specificityStatus =
        getElement("specificityStatus");
    const evidenceStatus =
        getElement("evidenceStatus");
    const genericCount =
        getElement("genericCount");

    if (wordCount) {
        wordCount.textContent =
            statementAnalysis.wordCount;
    }

    if (specificityStatus) {
        specificityStatus.textContent =
            statementAnalysis.specificity;
    }

    if (evidenceStatus) {
        evidenceStatus.textContent =
            statementAnalysis.evidence;
    }

    if (genericCount) {
        genericCount.textContent =
            statementAnalysis.genericMatches.length;
    }
}

/* =========================================
   RUN COMPLETE AI ANALYSIS
   ========================================= */

async function runAnalysis() {
    const fieldElement = getElement("field");
    const levelElement = getElement("level");
    const countryElement = getElement("country");
    const universityElement = getElement("university");

    const field = fieldElement
        ? fieldElement.value
        : "";

    const level = levelElement
        ? levelElement.value
        : "";

    const country = countryElement
        ? countryElement.value
        : "";

    const university = universityElement
        ? universityElement.value.trim()
        : "";

    const cv = cvText
        ? cvText.value.trim()
        : "";

    const statement = statementText
        ? statementText.value.trim()
        : "";

    if (!field || !level || !country || !cv || !statement) {
        showAnalysisError(
            "Please complete the required fields before analyzing your application."
        );

        return;
    }

    const cvAnalysis = analyzeCV(cv);
    const statementAnalysis = analyzeStatement(statement);

    const alignment =
        analyzeAlignment(
            field,
            cv,
            statement
        );

    const consistency =
        analyzeConsistency(
            cv,
            statement
        );

    const resultField = getElement("resultField");
    const resultLevel = getElement("resultLevel");
    const resultCountry = getElement("resultCountry");
    const resultUniversity =
        getElement("resultUniversity");

    if (resultField) {
        resultField.textContent = field;
    }

    if (resultLevel) {
        resultLevel.textContent = level;
    }

    if (resultCountry) {
        resultCountry.textContent = country;
    }

    if (resultUniversity) {
        resultUniversity.textContent =
            university || "Not specified";
    }

    updateLocalMetrics(
        field,
        cvAnalysis,
        statementAnalysis,
        consistency,
        alignment
    );

    const summary =
        getElement("resultsSummary");

    if (summary) {
        summary.textContent =
            "Analyzing your CV and personal statement with the AI reviewer...";
    }

    if (workspace) {
        workspace.classList.add("hidden");
    }

    if (resultsSection) {
        resultsSection.classList.remove("hidden");

        resultsSection.scrollIntoView({
            behavior: "smooth"
        });
    }

    setLoadingState(true);

    try {
        const analysis =
            await requestAIAnalysis({
                field,
                level,
                country,
                university,
                cv,
                personalStatement: statement
            });

        renderAIAnalysis(analysis);

        if (summary) {
            summary.textContent =
                safeText(
                    analysis?.overall?.summary,
                    "The AI completed the application review."
                );
        }

    } catch (error) {
        console.error(
            "ApplySense AI analysis error:",
            error
        );

        if (workspace) {
            workspace.classList.remove("hidden");
        }

        if (resultsSection) {
            resultsSection.classList.add("hidden");
        }

        showAnalysisError(
            error.message ||
            "The AI analysis could not be completed."
        );

    } finally {
        setLoadingState(false);
    }
}

/* =========================================
   FORM SUBMISSION
   ========================================= */

if (applicationForm) {
    applicationForm.addEventListener(
        "submit",
        async function (event) {
            event.preventDefault();

            const field =
                getElement("field")?.value || "";

            const level =
                getElement("level")?.value || "";

            const country =
                getElement("country")?.value || "";

            const cv =
                cvText?.value.trim() || "";

            const statement =
                statementText?.value.trim() || "";

            if (
                !field ||
                !level ||
                !country ||
                !cv ||
                !statement
            ) {
                showAnalysisError(
                    "Please complete all required fields before analyzing your application."
                );

                return;
            }

            await runAnalysis();
        }
    );
}

/* =========================================
   NEW ANALYSIS
   ========================================= */

if (newAnalysisButton) {
    newAnalysisButton.addEventListener(
        "click",
        function () {
            const aiPanel =
                getElement("aiReviewPanel");

            if (aiPanel) {
                aiPanel.remove();
            }

            if (resultsSection) {
                resultsSection.classList.add("hidden");
            }

            if (workspace) {
                workspace.classList.remove("hidden");

                workspace.scrollIntoView({
                    behavior: "smooth"
                });
            }
        }
    );
}

/* =========================================
   INITIAL STATE
   ========================================= */

updateCharacterCount(
    cvText,
    cvCount
);

updateCharacterCount(
    statementText,
    statementCount
);
