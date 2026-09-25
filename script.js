/* =========================================
   APPLY SENSE AI
   Application Analysis Engine
========================================= */


/* =========================================
   ELEMENTS
========================================= */

const applicationForm =
    document.getElementById("applicationForm");

const cvText =
    document.getElementById("cvText");

const statementText =
    document.getElementById("statementText");

const cvCount =
    document.getElementById("cvCount");

const statementCount =
    document.getElementById("statementCount");

const resultsSection =
    document.getElementById("results");

const workspace =
    document.getElementById("workspace");

const newAnalysisButton =
    document.getElementById("newAnalysisButton");



/* =========================================
   CHARACTER COUNTERS
========================================= */

function updateCharacterCount(textarea, counter) {

    if (!textarea || !counter) {
        return;
    }

    const length =
        textarea.value.length;

    counter.textContent =
        `${length.toLocaleString()} characters`;
}


if (cvText) {

    cvText.addEventListener(
        "input",
        function () {

            updateCharacterCount(
                cvText,
                cvCount
            );

        }
    );

}


if (statementText) {

    statementText.addEventListener(
        "input",
        function () {

            updateCharacterCount(
                statementText,
                statementCount
            );

        }
    );

}



/* =========================================
   START ANALYSIS BUTTON
========================================= */

const startButton =
    document.getElementById("startButton");

if (startButton) {

    startButton.addEventListener(
        "click",
        function () {

            const workspace =
                document.getElementById("workspace");

            if (workspace) {

                workspace.scrollIntoView({
                    behavior: "smooth"
                });

            }

        }
    );

}



/* =========================================
   TEXT NORMALIZATION
========================================= */

function normalizeText(text) {

    return text
        .toLowerCase()
        .replace(/[^\w\s+#.-]/g, " ")
        .replace(/\s+/g, " ")
        .trim();

}



/* =========================================
   WORD COUNT
========================================= */

function countWords(text) {

    const cleanText =
        text.trim();

    if (!cleanText) {
        return 0;
    }

    return cleanText
        .split(/\s+/)
        .length;

}



/* =========================================
   FIND KEYWORDS
========================================= */

function findKeywords(text, keywords) {

    const normalized =
        normalizeText(text);

    const found = [];

    keywords.forEach(function (keyword) {

        const normalizedKeyword =
            normalizeText(keyword);

        if (
            normalized.includes(
                normalizedKeyword
            )
        ) {

            found.push(keyword);

        }

    });

    return found;

}



/* =========================================
   CV ANALYSIS
========================================= */

function analyzeCV(cv) {

    const skillsDictionary = [

        "html",
        "css",
        "javascript",
        "python",
        "java",
        "c++",
        "c",
        "sql",
        "react",
        "node",
        "git",
        "github",
        "machine learning",
        "artificial intelligence",
        "data analysis",
        "data science",
        "figma",
        "excel",
        "matlab",
        "research",
        "communication",
        "leadership",
        "problem solving"

    ];


    const projectWords = [

        "project",
        "projects",
        "developed",
        "built",
        "created",
        "application",
        "app",
        "website",
        "prototype",
        "portfolio"

    ];


    const achievementWords = [

        "award",
        "awards",
        "achievement",
        "achievements",
        "competition",
        "winner",
        "finalist",
        "certificate",
        "certification",
        "scholarship",
        "olympiad",
        "rank",
        "medal"

    ];


    const educationWords = [

        "education",
        "school",
        "college",
        "university",
        "degree",
        "bachelor",
        "master",
        "class 10",
        "class 12",
        "cbse",
        "icse",
        "gpa",
        "percentage"

    ];


    const experienceWords = [

        "experience",
        "internship",
        "intern",
        "work experience",
        "volunteer",
        "volunteering",
        "worked",
        "role",
        "position"

    ];


    const skills =
        findKeywords(
            cv,
            skillsDictionary
        );


    const projectMatches =
        findKeywords(
            cv,
            projectWords
        );


    const achievementMatches =
        findKeywords(
            cv,
            achievementWords
        );


    const educationMatches =
        findKeywords(
            cv,
            educationWords
        );


    const experienceMatches =
        findKeywords(
            cv,
            experienceWords
        );


    return {

        skills: skills,

        projectSignals:
            projectMatches,

        achievementSignals:
            achievementMatches,

        educationSignals:
            educationMatches,

        experienceSignals:
            experienceMatches

    };

}



/* =========================================
   PERSONAL STATEMENT ANALYSIS
========================================= */

function analyzeStatement(statement) {

    const normalized =
        normalizeText(statement);


    const words =
        countWords(statement);


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

        "developed",
        "built",
        "created",
        "designed",
        "researched",
        "analysed",
        "analyzed",
        "participated",
        "completed",
        "organized",
        "led",
        "won",
        "achieved",
        "learned",
        "implemented",
        "worked"

    ];


    const experienceWords = [

        "project",
        "competition",
        "internship",
        "course",
        "research",
        "experiment",
        "workshop",
        "hackathon",
        "club",
        "volunteering",
        "experience"

    ];


    const genericMatches =
        findKeywords(
            normalized,
            genericPhrases
        );


    const evidenceMatches =
        findKeywords(
            normalized,
            evidenceWords
        );


    const experienceMatches =
        findKeywords(
            normalized,
            experienceWords
        );


    let specificity =
        "Needs more evidence";


    if (
        experienceMatches.length >= 3 ||
        evidenceMatches.length >= 4
    ) {

        specificity =
            "Strong";

    }
    else if (
        experienceMatches.length >= 1 ||
        evidenceMatches.length >= 2
    ) {

        specificity =
            "Developing";

    }


    let evidence =
        "Limited";


    if (
        evidenceMatches.length >= 5
    ) {

        evidence =
            "Strong";

    }
    else if (
        evidenceMatches.length >= 2
    ) {

        evidence =
            "Developing";

    }


    return {

        wordCount:
            words,

        genericMatches:
            genericMatches,

        evidenceMatches:
            evidenceMatches,

        experienceMatches:
            experienceMatches,

        specificity:
            specificity,

        evidence:
            evidence

    };

}



/* =========================================
   COURSE ALIGNMENT
========================================= */

function analyzeAlignment(
    field,
    cv,
    statement
) {

    const combinedText =
        `${cv} ${statement}`;


    const fieldKeywords = {

        "Computer Science": [

            "programming",
            "software",
            "coding",
            "algorithm",
            "computer",
            "javascript",
            "python",
            "java",
            "data",
            "project",
            "technology",
            "mathematics"

        ],

        "Artificial Intelligence": [

            "artificial intelligence",
            "machine learning",
            "data",
            "python",
            "algorithm",
            "programming",
            "neural",
            "model",
            "research",
            "mathematics"

        ],

        "Data Science": [

            "data",
            "statistics",
            "analysis",
            "python",
            "sql",
            "machine learning",
            "research",
            "mathematics"

        ],

        "Engineering": [

            "engineering",
            "mathematics",
            "physics",
            "design",
            "project",
            "research",
            "technology"

        ],

        "Mathematics": [

            "mathematics",
            "mathematical",
            "statistics",
            "calculus",
            "algebra",
            "research",
            "problem solving",
            "competition"

        ],

        "Business": [

            "business",
            "management",
            "leadership",
            "marketing",
            "finance",
            "entrepreneurship",
            "project"

        ],

        "Economics": [

            "economics",
            "economy",
            "finance",
            "statistics",
            "mathematics",
            "research",
            "data"

        ],

        "Medicine": [

            "medicine",
            "biology",
            "chemistry",
            "research",
            "health",
            "volunteering",
            "clinical"

        ]

    };


    const keywords =
        fieldKeywords[field] || [];


    const matches =
        findKeywords(
            combinedText,
            keywords
        );


    const uniqueMatches =
        [...new Set(matches)];


    let percentage = 0;


    if (keywords.length > 0) {

        percentage =
            Math.round(
                (
                    uniqueMatches.length /
                    keywords.length
                ) * 100
            );

    }


    /*
        We intentionally cap the displayed
        alignment at 100.
    */

    percentage =
        Math.min(
            percentage,
            100
        );


    return {

        keywords:
            uniqueMatches,

        percentage:
            percentage

    };

}



/* =========================================
   CONSISTENCY ANALYSIS
========================================= */

function analyzeConsistency(
    cv,
    statement
) {

    const cvNormalized =
        normalizeText(cv);

    const statementNormalized =
        normalizeText(statement);


    const consistencyKeywords = [

        "programming",
        "javascript",
        "python",
        "java",
        "machine learning",
        "artificial intelligence",
        "research",
        "project",
        "mathematics",
        "data",
        "leadership",
        "competition",
        "internship",
        "volunteering"

    ];


    const sharedKeywords = [];


    consistencyKeywords.forEach(
        function (keyword) {

            const normalizedKeyword =
                normalizeText(keyword);


            const appearsInCV =
                cvNormalized.includes(
                    normalizedKeyword
                );


            const appearsInStatement =
                statementNormalized.includes(
                    normalizedKeyword
                );


            if (
                appearsInCV &&
                appearsInStatement
            ) {

                sharedKeywords.push(
                    keyword
                );

            }

        }
    );


    const cvOnly = [];

    const statementOnly = [];


    consistencyKeywords.forEach(
        function (keyword) {

            const normalizedKeyword =
                normalizeText(keyword);


            const inCV =
                cvNormalized.includes(
                    normalizedKeyword
                );


            const inStatement =
                statementNormalized.includes(
                    normalizedKeyword
                );


            if (
                inCV &&
                !inStatement
            ) {

                cvOnly.push(
                    keyword
                );

            }


            if (
                !inCV &&
                inStatement
            ) {

                statementOnly.push(
                    keyword
                );

            }

        }
    );


    let percentage = 50;


    if (
        sharedKeywords.length > 0
    ) {

        percentage =
            Math.min(
                100,
                50 +
                (
                    sharedKeywords.length * 8
                )
            );

    }


    return {

        shared:
            sharedKeywords,

        cvOnly:
            cvOnly,

        statementOnly:
            statementOnly,

        percentage:
            percentage

    };

}



/* =========================================
   CALCULATE SIGNALS
========================================= */

function calculateCVSignal(
    cvAnalysis
) {

    let score = 0;


    if (
        cvAnalysis.skills.length >= 3
    ) {

        score += 30;

    }
    else if (
        cvAnalysis.skills.length >= 1
    ) {

        score += 15;

    }


    if (
        cvAnalysis.projectSignals.length >= 2
    ) {

        score += 25;

    }
    else if (
        cvAnalysis.projectSignals.length >= 1
    ) {

        score += 12;

    }


    if (
        cvAnalysis.achievementSignals.length >= 1
    ) {

        score += 15;

    }


    if (
        cvAnalysis.educationSignals.length >= 1
    ) {

        score += 20;

    }


    if (
        cvAnalysis.experienceSignals.length >= 1
    ) {

        score += 10;

    }


    return Math.min(
        score,
        100
    );

}



function calculateStatementSignal(
    statementAnalysis
) {

    let score = 20;


    if (
        statementAnalysis.wordCount >= 250
    ) {

        score += 15;

    }


    if (
        statementAnalysis.wordCount >= 500
    ) {

        score += 10;

    }


    if (
        statementAnalysis.specificity ===
        "Strong"
    ) {

        score += 25;

    }
    else if (
        statementAnalysis.specificity ===
        "Developing"
    ) {

        score += 15;

    }


    if (
        statementAnalysis.evidence ===
        "Strong"
    ) {

        score += 25;

    }
    else if (
        statementAnalysis.evidence ===
        "Developing"
    ) {

        score += 15;

    }


    if (
        statementAnalysis.genericMatches.length === 0
    ) {

        score += 5;

    }


    return Math.min(
        score,
        100
    );

}



/* =========================================
   SIGNAL LABEL
========================================= */

function getSignalLabel(score) {

    if (score >= 75) {
        return "Strong";
    }

    if (score >= 50) {
        return "Developing";
    }

    return "Needs attention";

}



/* =========================================
   UPDATE SIGNAL CARD
========================================= */

function updateSignal(
    valueElement,
    textElement,
    barElement,
    score,
    description
) {

    valueElement.textContent =
        getSignalLabel(score);


    textElement.textContent =
        description;


    barElement.style.width =
        `${score}%`;

}



/* =========================================
   GENERATE CONSISTENCY INSIGHTS
========================================= */

function generateConsistencyInsights(
    consistency
) {

    const container =
        document.getElementById(
            "consistencyContent"
        );


    container.innerHTML = "";


    if (
        consistency.shared.length > 0
    ) {

        const item =
            document.createElement("div");

        item.className =
            "insight-item";


        item.innerHTML = `

            <div class="insight-icon">
                ✓
            </div>

            <div>

                <strong>
                    Shared evidence detected
                </strong>

                <p>
                    Your CV and personal statement
                    both mention:
                    ${consistency.shared.join(", ")}.
                </p>

            </div>

        `;


        container.appendChild(item);

    }
    else {

        const item =
            document.createElement("div");

        item.className =
            "insight-item";


        item.innerHTML = `

            <div class="insight-icon">
                !
            </div>

            <div>

                <strong>
                    Limited shared evidence
                </strong>

                <p>
                    Your CV and personal statement do not
                    currently share many of the tracked
                    academic or experience keywords.
                </p>

            </div>

        `;


        container.appendChild(item);

    }



    if (
        consistency.cvOnly.length > 0
    ) {

        const item =
            document.createElement("div");

        item.className =
            "insight-item";


        item.innerHTML = `

            <div class="insight-icon">
                CV
            </div>

            <div>

                <strong>
                    Experiences appearing mainly in your CV
                </strong>

                <p>
                    Consider whether relevant items such as
                    ${consistency.cvOnly.join(", ")}
                    deserve explanation in your statement.
                </p>

            </div>

        `;


        container.appendChild(item);

    }



    if (
        consistency.statementOnly.length > 0
    ) {

        const item =
            document.createElement("div");

        item.className =
            "insight-item";


        item.innerHTML = `

            <div class="insight-icon">
                PS
            </div>

            <div>

                <strong>
                    Topics appearing mainly in your statement
                </strong>

                <p>
                    Your statement mentions
                    ${consistency.statementOnly.join(", ")}
                    without those terms being detected
                    in your CV.
                </p>

            </div>

        `;


        container.appendChild(item);

    }

}



/* =========================================
   GENERATE ALIGNMENT
========================================= */

function generateAlignmentInsights(
    alignment,
    field
) {

    const container =
        document.getElementById(
            "alignmentContent"
        );


    container.innerHTML = "";


    if (
        alignment.keywords.length > 0
    ) {

        alignment.keywords
            .slice(0, 6)
            .forEach(
                function (keyword) {

                    const item =
                        document.createElement("div");

                    item.className =
                        "alignment-item";


                    item.innerHTML = `

                        <strong>
                            ${keyword}
                        </strong>

                        <p>
                            Evidence related to
                            ${field} was detected
                            in your submitted material.
                        </p>

                    `;


                    container.appendChild(item);

                }
            );

    }
    else {

        const item =
            document.createElement("div");

        item.className =
            "alignment-item";


        item.innerHTML = `

            <strong>
                More field-specific evidence
            </strong>

            <p>
                The current documents do not contain
                many tracked terms associated with
                ${field}.
            </p>

        `;


        container.appendChild(item);

    }

}



/* =========================================
   GENERATE RECOMMENDATIONS
========================================= */

function generateRecommendations(
    cvAnalysis,
    statementAnalysis,
    consistency,
    alignment
) {

    const container =
        document.getElementById(
            "recommendationContent"
        );


    container.innerHTML = "";


    const recommendations = [];


    if (
        cvAnalysis.skills.length < 3
    ) {

        recommendations.push({

            title:
                "Make your skills easier to identify",

            text:
                "Consider clearly listing relevant technical, academic or transferable skills instead of relying only on descriptions inside other sections."

        });

    }


    if (
        cvAnalysis.projectSignals.length < 2
    ) {

        recommendations.push({

            title:
                "Add stronger project evidence",

            text:
                "Projects can demonstrate how you apply what you have learned. Include the project, what you built or investigated, and your contribution."

        });

    }


    if (
        statementAnalysis.genericMatches.length > 0
    ) {

        recommendations.push({

            title:
                "Replace generic claims with evidence",

            text:
                "Your statement contains phrases that can sound broad. Consider replacing them with specific experiences, actions and outcomes."

        });

    }


    if (
        statementAnalysis.evidence ===
        "Limited"
    ) {

        recommendations.push({

            title:
                "Support your claims with examples",

            text:
                "Whenever you say that you are interested, capable or motivated, consider showing the experience that led you to that conclusion."

        });

    }


    if (
        consistency.shared.length === 0
    ) {

        recommendations.push({

            title:
                "Connect your documents",

            text:
                "Look for opportunities to develop important CV experiences in your personal statement rather than treating the two documents as completely separate."

        });

    }


    if (
        alignment.percentage < 30
    ) {

        recommendations.push({

            title:
                "Strengthen field-specific evidence",

            text:
                "Your submitted material contains limited evidence related to the selected field. Consider highlighting relevant coursework, projects, research or experiences."

        });

    }


    if (
        recommendations.length === 0
    ) {

        recommendations.push({

            title:
                "Add more specific evidence",

            text:
                "Your current application contains several relevant signals. The next improvement would be making your strongest experiences even more specific and measurable."

        });

    }


    recommendations
        .slice(0, 3)
        .forEach(
            function (recommendation, index) {

                const card =
                    document.createElement("div");

                card.className =
                    "recommendation-card";


                card.innerHTML = `

                    <div class="recommendation-number">
                        0${index + 1}
                    </div>

                    <h3>
                        ${recommendation.title}
                    </h3>

                    <p>
                        ${recommendation.text}
                    </p>

                `;


                container.appendChild(card);

            }
        );

}



/* =========================================
   RUN COMPLETE ANALYSIS
========================================= */

function runAnalysis() {

    const field =
        document.getElementById("field").value;

    const level =
        document.getElementById("level").value;

    const country =
        document.getElementById("country").value;

    const university =
        document.getElementById("university").value.trim();

    const cv =
        cvText.value.trim();

    const statement =
        statementText.value.trim();



    /* =====================
       ANALYZE
    ====================== */

    const cvAnalysis =
        analyzeCV(cv);


    const statementAnalysis =
        analyzeStatement(statement);


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


    const cvScore =
        calculateCVSignal(
            cvAnalysis
        );


    const statementScore =
        calculateStatementSignal(
            statementAnalysis
        );


    const consistencyScore =
        consistency.percentage;


    const alignmentScore =
        alignment.percentage;



    /* =====================
       CONTEXT
    ====================== */

    document.getElementById(
        "resultField"
    ).textContent =
        field;


    document.getElementById(
        "resultLevel"
    ).textContent =
        level;


    document.getElementById(
        "resultCountry"
    ).textContent =
        country;


    document.getElementById(
        "resultUniversity"
    ).textContent =
        university ||
        "Not specified";



    /* =====================
       SIGNALS
    ====================== */

    updateSignal(

        document.getElementById(
            "cvSignal"
        ),

        document.getElementById(
            "cvSignalText"
        ),

        document.getElementById(
            "cvBar"
        ),

        cvScore,

        `${cvAnalysis.skills.length} skill signal(s), ${cvAnalysis.projectSignals.length} project signal(s) and ${cvAnalysis.achievementSignals.length} achievement signal(s) detected.`

    );


    updateSignal(

        document.getElementById(
            "statementSignal"
        ),

        document.getElementById(
            "statementSignalText"
        ),

        document.getElementById(
            "statementBar"
        ),

        statementScore,

        `${statementAnalysis.wordCount} words detected with ${statementAnalysis.evidenceMatches.length} evidence signal(s).`

    );


    updateSignal(

        document.getElementById(
            "consistencySignal"
        ),

        document.getElementById(
            "consistencySignalText"
        ),

        document.getElementById(
            "consistencyBar"
        ),

        consistencyScore,

        `${consistency.shared.length} shared application signal(s) detected across the two documents.`

    );


    updateSignal(

        document.getElementById(
            "alignmentSignal"
        ),

        document.getElementById(
            "alignmentSignalText"
        ),

        document.getElementById(
            "alignmentBar"
        ),

        alignmentScore,

        `${alignment.keywords.length} tracked ${field.toLowerCase()} signal(s) detected.`

    );



    /* =====================
       CV METRICS
    ====================== */

    document.getElementById(
        "skillsCount"
    ).textContent =
        cvAnalysis.skills.length;


    document.getElementById(
        "projectsCount"
    ).textContent =
        cvAnalysis.projectSignals.length;


    document.getElementById(
        "achievementsCount"
    ).textContent =
        cvAnalysis.achievementSignals.length;


    document.getElementById(
        "educationStatus"
    ).textContent =
        cvAnalysis.educationSignals.length > 0
            ? "Detected"
            : "Not detected";



    /* =====================
       STATEMENT METRICS
    ====================== */

    document.getElementById(
        "wordCount"
    ).textContent =
        statementAnalysis.wordCount;


    document.getElementById(
        "specificityStatus"
    ).textContent =
        statementAnalysis.specificity;


    document.getElementById(
        "evidenceStatus"
    ).textContent =
        statementAnalysis.evidence;


    document.getElementById(
        "genericCount"
    ).textContent =
        statementAnalysis.genericMatches.length;



    /* =====================
       DETAILED SECTIONS
    ====================== */

    generateConsistencyInsights(
        consistency
    );


    generateAlignmentInsights(
        alignment,
        field
    );


    generateRecommendations(
        cvAnalysis,
        statementAnalysis,
        consistency,
        alignment
    );



    /* =====================
       SUMMARY
    ====================== */

    const averageSignal =
        Math.round(
            (
                cvScore +
                statementScore +
                consistencyScore +
                alignmentScore
            ) / 4
        );


    let summaryText =
        "Your application has been analyzed across four areas.";


    if (
        averageSignal >= 70
    ) {

        summaryText =
            "Your documents contain several strong signals. Review the detailed sections below to identify where additional evidence could make your application clearer.";

    }
    else if (
        averageSignal >= 45
    ) {

        summaryText =
            "Your application contains useful evidence, but several areas could be strengthened. Review the recommendations below for specific opportunities.";

    }
    else {

        summaryText =
            "The analysis found some useful information, but your application currently has several areas that could benefit from clearer evidence and stronger connections.";

    }


    document.getElementById(
        "resultsSummary"
    ).textContent =
        summaryText;



    /* =====================
       SHOW RESULTS
    ====================== */

    workspace.classList.add(
        "hidden"
    );


    resultsSection.classList.remove(
        "hidden"
    );


    resultsSection.scrollIntoView({
        behavior: "smooth"
    });

}



/* =========================================
   FORM SUBMISSION
========================================= */

if (applicationForm) {

    applicationForm.addEventListener(
        "submit",
        function (event) {

            event.preventDefault();


            const field =
                document.getElementById(
                    "field"
                ).value;

            const level =
                document.getElementById(
                    "level"
                ).value;

            const country =
                document.getElementById(
                    "country"
                ).value;


            const cv =
                cvText.value.trim();

            const statement =
                statementText.value.trim();


            if (
                !field ||
                !level ||
                !country ||
                !cv ||
                !statement
            ) {

                alert(
                    "Please complete all required fields before analyzing your application."
                );

                return;
            }


            runAnalysis();

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

            resultsSection.classList.add(
                "hidden"
            );


            workspace.classList.remove(
                "hidden"
            );


            workspace.scrollIntoView({
                behavior: "smooth"
            });

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