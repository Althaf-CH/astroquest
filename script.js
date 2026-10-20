"use strict";

/*
 * ASTROQUEST
 * Educational astronaut mission simulator.
 *
 * All resource values, rates, scores, and consequences are
 * simplified game mechanics, not real spacecraft specifications.
 */

const $ = (id) => document.getElementById(id);

const elements = {
    landing: $("landingPage"),
    setup: $("missionSetup"),
    dashboard: $("gameDashboard"),
    report: $("missionReport"),

    start: $("startMission"),
    destinationTitle: $("destinationTitle"),
    missionSubtitle: $("missionSubtitle"),
    missionDay: $("missionDay"),
    missionProgress: $("missionProgress"),

    eventIcon: $("eventIcon"),
    eventTitle: $("eventTitle"),
    eventDescription: $("eventDescription"),
    eventScience: $("eventScience"),

    optionA: $("optionA"),
    optionB: $("optionB"),
    decisionButtons: $("decisionButtons"),
    feedback: $("decisionFeedback"),
    continueButton: $("continueButton"),

    log: $("missionLog"),
    score: $("missionScore"),
    abandon: $("abandonMission"),

    reportTitle: $("reportTitle"),
    reportSummary: $("reportSummary"),
    finalScore: $("finalScore"),
    reportStats: $("reportStats"),
    learningSummary: $("learningSummary"),
    restart: $("restartMission")
};

const RESOURCE_NAMES = {
    oxygen: "Oxygen",
    water: "Water",
    food: "Food",
    energy: "Energy",
    health: "Crew health"
};

const RESOURCE_IDS = {
    oxygen: ["oxygenValue", "oxygenBar"],
    water: ["waterValue", "waterBar"],
    food: ["foodValue", "foodBar"],
    energy: ["energyValue", "energyBar"],
    health: ["healthValue", "healthBar"]
};

const MAX_DAYS = 7;
const STARTING_RESOURCES = 100;

// Difficulty settings are simplified gameplay rules,
// not real mission data.
const DIFFICULTIES = {
    easy: {
        label: "EASY",
        icon: "🟢",
        description:
            "Lower daily drain, gentler emergencies, and stronger recovery.",
        dailyMultiplier: 0.75,
        negativeMultiplier: 0.75,
        positiveMultiplier: 1.15
    },

    normal: {
        label: "NORMAL",
        icon: "🟡",
        description:
            "A balanced challenge that rewards careful planning.",
        dailyMultiplier: 1,
        negativeMultiplier: 1,
        positiveMultiplier: 1
    },

    hard: {
        label: "HARD",
        icon: "🔴",
        description:
            "Higher daily drain, tougher setbacks, and smaller recovery gains.",
        dailyMultiplier: 1.25,
        negativeMultiplier: 1.25,
        positiveMultiplier: 0.8
    }
};

const DESTINATIONS = {
    moon: {
        title: "MISSION LUNA",
        subtitle: "Lunar research outpost",
        icon: "🌙",

        dailyRates: {
            oxygen: 8,
            water: 7,
            food: 6,
            energy: 8
        }
    },

    mars: {
        title: "MISSION ARES",
        subtitle: "Martian research outpost",
        icon: "🔴",

        dailyRates: {
            oxygen: 8,
            water: 7,
            food: 6,
            energy: 9
        }
    }
};

const EVENTS = {
    oxygen: {
        icon: "🫁",
        title: "OXYGEN SYSTEM WARNING",

        description:
            "A fault has been detected in the habitat's oxygen delivery " +
            "system. Mission control recommends immediate action.",

        science:
            "Crewed habitats need reliable life-support systems. " +
            "Oxygen delivery and atmospheric composition must be monitored. " +
            "This scenario simplifies a potentially complex engineering problem.",

        choices: [
            {
                label: "A — Isolate the faulty unit",

                effects: {
                    energy: -8,
                    oxygen: -3
                },

                score: 10,

                explanation:
                    "You isolated the suspected fault. The repair used energy " +
                    "and a small amount of reserve oxygen, but may help prevent " +
                    "further disruption."
            },

            {
                label: "B — Reduce habitat activity",

                effects: {
                    food: -2,
                    health: -4
                },

                score: 4,

                explanation:
                    "You reduced nonessential operations while the fault " +
                    "remained unresolved. This bought time, but the crew " +
                    "experienced additional strain."
            }
        ]
    },

    water: {
        icon: "💧",
        title: "WATER RECYCLING ALERT",

        description:
            "The water-recovery unit is performing below its expected level. " +
            "Available supplies are becoming a concern.",

        science:
            "Water recovery can reduce the amount of water that must be " +
            "transported to a habitat. Real systems require monitoring, " +
            "treatment, and checks for contamination.",

        choices: [
            {
                label: "A — Inspect and service the unit",

                effects: {
                    energy: -7,
                    water: 5
                },

                score: 10,

                explanation:
                    "The inspection restored some usable water in this " +
                    "simplified simulation, but servicing the equipment " +
                    "consumed energy."
            },

            {
                label: "B — Introduce strict water rationing",

                effects: {
                    water: 8,
                    health: -3
                },

                score: 6,

                explanation:
                    "Rationing preserved the water reserve for essential " +
                    "needs, but restrictive conditions placed additional " +
                    "stress on the crew."
            }
        ]
    },

    power: {
        icon: "⚡",
        title: "POWER GENERATION DISRUPTION",

        description:
            "The outpost has less available power than expected. Essential " +
            "equipment needs a reliable supply of energy.",

        science:
            "Space habitats need power for equipment, communications, " +
            "thermal control, and life support. Solar generation can vary " +
            "with lighting, weather, location, and system condition.",

        choices: [
            {
                label: "A — Conserve nonessential power",

                effects: {
                    energy: 12,
                    health: -1
                },

                score: 8,

                explanation:
                    "You reduced discretionary power use. This preserved " +
                    "energy, although some crew activities were curtailed."
            },

            {
                label: "B — Diagnose the power system",

                effects: {
                    energy: -8,
                    health: 2
                },

                score: 10,

                explanation:
                    "You used stored energy to investigate the fault. " +
                    "In this game scenario, the repair restored some crew " +
                    "comfort and improved the system's condition."
            }
        ]
    },

    food: {
        icon: "🍎",
        title: "FOOD STORAGE CONTAMINATION",

        description:
            "A food storage compartment has been flagged for inspection. " +
            "The crew must decide how to protect its remaining food supply.",

        science:
            "Food safety matters in isolated habitats because replacement " +
            "supplies may be difficult to obtain. Real crews use controlled " +
            "storage, inventory procedures, and food-safety protocols.",

        choices: [
            {
                label: "A — Isolate the suspect supplies",

                effects: {
                    food: -12,
                    health: 3
                },

                score: 10,

                explanation:
                    "You removed more supplies from use to reduce the " +
                    "potential risk to the crew. The food reserve fell, " +
                    "but caution helped protect crew health."
            },

            {
                label: "B — Inspect and inventory supplies",

                effects: {
                    energy: -5,
                    food: -4
                },

                score: 7,

                explanation:
                    "You spent energy on inspection and lost some usable " +
                    "food in the process. Careful inspection can help " +
                    "distinguish safe supplies from suspect ones."
            }
        ]
    },

    environment: {
        icon: "🌪️",
        title: "ENVIRONMENTAL HAZARD",

        description:
            "Conditions outside the outpost have deteriorated. Equipment " +
            "and crew activities may need additional protection.",

        science:
            "The Moon and Mars have very different environments. Lunar " +
            "dust can be abrasive, while Martian dust storms can reduce " +
            "solar power and create equipment challenges. The specific " +
            "hazard in this event is a simplified gameplay scenario.",

        choices: [
            {
                label: "A — Secure external equipment",

                effects: {
                    energy: -6,
                    health: 2
                },

                score: 10,

                explanation:
                    "You prioritized equipment protection and reduced " +
                    "the need for risky external activity. The preparation " +
                    "used energy."
            },

            {
                label: "B — Suspend outdoor operations",

                effects: {
                    food: -2,
                    energy: 5
                },

                score: 7,

                explanation:
                    "You postponed outdoor work and conserved energy. " +
                    "Some scheduled activities were delayed."
            }
        ]
    },

    fatigue: {
        icon: "❤️",
        title: "CREW FATIGUE DETECTED",

        description:
            "Crew members are showing signs of fatigue. Mission control " +
            "must balance the schedule against crew well-being.",

        science:
            "Sleep, workload, stress, and circadian disruption can affect " +
            "astronaut performance. Crew scheduling and adequate rest are " +
            "important parts of human spaceflight operations.",

        choices: [
            {
                label: "A — Schedule additional rest",

                effects: {
                    food: -3,
                    health: 12
                },

                score: 10,

                explanation:
                    "You prioritized crew recovery. The mission schedule " +
                    "slowed, but crew condition improved in the simulation."
            },

            {
                label: "B — Continue essential operations",

                effects: {
                    energy: -2,
                    health: -7
                },

                score: 3,

                explanation:
                    "You maintained the schedule, but fatigue worsened. " +
                    "Continuing work without sufficient recovery can " +
                    "undermine crew performance."
            }
        ]
    }
};

const state = {
    destination: null,
    difficulty: "normal",
    day: 1,
    resources: {},
    score: 100,
    decisions: 0,
    history: [],
    currentEvent: null,
    eventQueue: [],
    ended: false,
    answered: false
};

/*
 * Create the difficulty selector automatically.
 * This means you do not need to edit index.html
 * to add the three difficulty cards.
 */

function installDifficultySelector() {
    if (!elements.setup || $("difficultySelector")) {
        return;
    }

    const section = document.createElement("section");

    section.id = "difficultySelector";
    section.className = "difficulty-selector";

    section.innerHTML = `
        <div class="difficulty-heading">
            <p class="eyebrow">MISSION PARAMETERS</p>
            <h2>Choose your difficulty</h2>
            <p class="difficulty-help">
                Select a challenge, then choose Moon or Mars.
            </p>
        </div>

        <div
            class="difficulty-options"
            role="group"
            aria-label="Mission difficulty"
        >
            ${Object.entries(DIFFICULTIES).map(([key, item]) => `
                <button
                    type="button"
                    class="difficulty-card${key === "normal" ? " selected" : ""}"
                    data-difficulty="${key}"
                    aria-pressed="${key === "normal" ? "true" : "false"}"
                >
                    <span class="difficulty-icon">${item.icon}</span>
                    <strong>${item.label}</strong>
                    <span class="difficulty-description">
                        ${item.description}
                    </span>
                </button>
            `).join("")}
        </div>
    `;

    const style = document.createElement("style");

    style.id = "difficultySelectorStyles";

    style.textContent = `
        .difficulty-selector {
            margin: 0 0 28px;
        }

        .difficulty-heading {
            margin-bottom: 14px;
        }

        .difficulty-heading h2 {
            margin: 4px 0 8px;
        }

        .difficulty-help {
            opacity: .78;
            margin: 0;
        }

        .difficulty-options {
            display: grid;
            grid-template-columns: repeat(3, minmax(0, 1fr));
            gap: 12px;
        }

        .difficulty-card {
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            gap: 8px;
            min-height: 140px;
            padding: 16px;
            text-align: left;
            cursor: pointer;
            color: inherit;
            background: rgba(12, 24, 45, .72);
            border: 1px solid rgba(145, 174, 220, .24);
            border-radius: 14px;
            transition:
                border-color .18s ease,
                transform .18s ease,
                background .18s ease;
        }

        .difficulty-card:hover {
            transform: translateY(-2px);
            border-color: rgba(112, 178, 255, .8);
        }

        .difficulty-card.selected {
            border: 2px solid #70b2ff;
            background: rgba(45, 100, 165, .2);
        }

        .difficulty-icon {
            font-size: 20px;
        }

        .difficulty-card strong {
            letter-spacing: .08em;
        }

        .difficulty-description {
            font-size: 12px;
            line-height: 1.45;
            opacity: .78;
        }

        @media (max-width: 640px) {
            .difficulty-options {
                grid-template-columns: 1fr;
            }

            .difficulty-card {
                min-height: auto;
            }
        }
    `;

    document.head.append(style);
    elements.setup.prepend(section);

    section.querySelectorAll("[data-difficulty]").forEach((button) => {
        button.addEventListener("click", () => {
            state.difficulty = button.dataset.difficulty;

            section.querySelectorAll("[data-difficulty]").forEach((card) => {
                const selected = card === button;

                card.classList.toggle("selected", selected);

                card.setAttribute(
                    "aria-pressed",
                    String(selected)
                );
            });
        });
    });
}


// --------------------------------------------------
// ASTROQUEST EXTRAS: SOUND, BADGES, AND LOCAL RECORDS
// --------------------------------------------------

const STORAGE_KEYS = {
    scores: "astroquest_high_scores_v1",
    badges: "astroquest_achievements_v1",
    missions: "astroquest_missions_played_v1",
    sound: "astroquest_sound_enabled_v1"
};

const BADGES = [
    { id: "first-flight", icon: "🚀", title: "FIRST FLIGHT", text: "Finish your first mission." },
    { id: "life-support", icon: "🫁", title: "LIFE SUPPORT HERO", text: "Complete a mission with oxygen at 50% or higher." },
    { id: "water-guardian", icon: "💧", title: "WATER GUARDIAN", text: "Complete a mission with water at 50% or higher." },
    { id: "crew-protector", icon: "❤️", title: "CREW PROTECTOR", text: "Complete a mission with crew health at 70% or higher." },
    { id: "hard-mode", icon: "🔥", title: "SURVIVAL EXPERT", text: "Complete a Hard mission." },
    { id: "perfect-mission", icon: "🏆", title: "PERFECT MISSION", text: "Complete a mission with every reserve above 80%." }
];

let audioContext = null;
let soundEnabled = readStorage(STORAGE_KEYS.sound, "true") !== "false";

function readStorage(key, fallback) {
    try {
        const value = localStorage.getItem(key);
        return value === null ? fallback : value;
    } catch (error) {
        return fallback;
    }
}

function readJSON(key, fallback) {
    try {
        const value = localStorage.getItem(key);
        return value ? JSON.parse(value) : fallback;
    } catch (error) {
        return fallback;
    }
}

function writeStorage(key, value) {
    try { localStorage.setItem(key, value); } catch (error) {
        // The game still works if browser storage is unavailable.
    }
}

function playTone(kind = "click") {
    if (!soundEnabled) return;
    try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (!AudioCtx) return;
        audioContext = audioContext || new AudioCtx();
        if (audioContext.state === "suspended") audioContext.resume();
        const now = audioContext.currentTime;
        const notes = kind === "success" ? [523.25, 659.25, 783.99] :
            kind === "alert" ? [660, 440] : kind === "launch" ? [220, 330, 440] : [660];
        notes.forEach((frequency, index) => {
            const oscillator = audioContext.createOscillator();
            const gain = audioContext.createGain();
            oscillator.type = kind === "alert" ? "sawtooth" : "sine";
            oscillator.frequency.setValueAtTime(frequency, now + index * 0.11);
            gain.gain.setValueAtTime(0.0001, now + index * 0.11);
            gain.gain.exponentialRampToValueAtTime(0.055, now + index * 0.11 + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + index * 0.11 + 0.16);
            oscillator.connect(gain);
            gain.connect(audioContext.destination);
            oscillator.start(now + index * 0.11);
            oscillator.stop(now + index * 0.11 + 0.18);
        });
    } catch (error) {
        // Audio is a progressive enhancement; gameplay must never depend on it.
    }
}

function updateSoundToggle() {
    const button = $("soundToggle");
    if (!button) return;
    button.textContent = soundEnabled ? "🔊 SOUND ON" : "🔇 SOUND OFF";
    button.setAttribute("aria-pressed", String(soundEnabled));
    button.setAttribute("aria-label", soundEnabled ? "Turn sound off" : "Turn sound on");
}

function getUnlockedBadges() {
    return readJSON(STORAGE_KEYS.badges, []);
}

function renderFlightRecord() {
    const scores = readJSON(STORAGE_KEYS.scores, []);
    const badges = getUnlockedBadges();
    const missions = Number(readStorage(STORAGE_KEYS.missions, "0")) || 0;
    const played = $("missionsPlayed");
    const best = $("bestScore");
    const badgeCount = $("badgesUnlocked");
    const grid = $("achievementGrid");
    const list = $("highScoreList");
    if (!played || !best || !badgeCount || !grid || !list) return;

    played.textContent = String(missions);
    best.textContent = scores.length ? String(scores[0].score) : "—";
    badgeCount.textContent = `${badges.length} / ${BADGES.length}`;
    grid.replaceChildren();
    BADGES.forEach((badge) => {
        const unlocked = badges.includes(badge.id);
        const card = document.createElement("article");
        card.className = `achievement-card${unlocked ? " unlocked" : " locked"}`;
        const icon = document.createElement("span");
        icon.className = "achievement-icon";
        icon.textContent = unlocked ? badge.icon : "🔒";
        const title = document.createElement("strong");
        title.textContent = badge.title;
        const text = document.createElement("p");
        text.textContent = badge.text;
        const status = document.createElement("span");
        status.className = "badge-status";
        status.textContent = unlocked ? "UNLOCKED" : "LOCKED";
        card.append(icon, title, text, status);
        grid.append(card);
    });

    list.replaceChildren();
    if (!scores.length) {
        const empty = document.createElement("li");
        empty.textContent = "Complete a mission to set your first score.";
        list.append(empty);
    } else {
        scores.slice(0, 5).forEach((item) => {
            const li = document.createElement("li");
            const name = document.createElement("span");
            name.textContent = `${item.destination} · ${item.difficulty}`;
            const score = document.createElement("strong");
            score.textContent = String(item.score);
            li.append(name, score);
            list.append(li);
        });
    }
}

function saveMissionRecord(success, finalScore) {
    const missions = (Number(readStorage(STORAGE_KEYS.missions, "0")) || 0) + 1;
    writeStorage(STORAGE_KEYS.missions, String(missions));

    const scores = readJSON(STORAGE_KEYS.scores, []);
    scores.push({
        score: finalScore,
        destination: DESTINATIONS[state.destination].title.replace("MISSION ", ""),
        difficulty: DIFFICULTIES[state.difficulty].label,
        date: new Date().toISOString(),
        success
    });
    scores.sort((a, b) => b.score - a.score);
    writeStorage(STORAGE_KEYS.scores, JSON.stringify(scores.slice(0, 10)));

    const badges = new Set(getUnlockedBadges());
    const values = state.resources;
    if (missions >= 1) badges.add("first-flight");
    if (success && values.oxygen >= 50) badges.add("life-support");
    if (success && values.water >= 50) badges.add("water-guardian");
    if (success && values.health >= 70) badges.add("crew-protector");
    if (success && state.difficulty === "hard") badges.add("hard-mode");
    if (success && Object.values(values).every((value) => value > 80)) badges.add("perfect-mission");
    const oldBadges = getUnlockedBadges();
    const newBadges = [...badges].filter((id) => !oldBadges.includes(id));
    writeStorage(STORAGE_KEYS.badges, JSON.stringify([...badges]));
    renderFlightRecord();
    return newBadges.map((id) => BADGES.find((badge) => badge.id === id)).filter(Boolean);
}

function showLaunchSequence() {
    const overlay = document.createElement("div");
    overlay.className = "launch-overlay";
    overlay.innerHTML = '<div class="launch-orbit"><span>🚀</span></div><p>INITIALIZING MISSION SYSTEMS</p><strong>3 · 2 · 1 · IGNITION</strong>';
    document.body.append(overlay);
    playTone("launch");
    window.setTimeout(() => overlay.classList.add("launch-overlay-out"), 1250);
    window.setTimeout(() => overlay.remove(), 1750);
}

function showBadgeToast(badges) {
    if (!badges.length) return;
    const toast = document.createElement("div");
    toast.className = "badge-toast";
    const title = document.createElement("strong");
    title.textContent = badges.length === 1 ? "BADGE UNLOCKED" : `${badges.length} BADGES UNLOCKED`;
    const text = document.createElement("p");
    text.textContent = badges.map((badge) => `${badge.icon} ${badge.title}`).join(" · ");
    toast.append(title, text);
    document.body.append(toast);
    window.setTimeout(() => toast.classList.add("badge-toast-out"), 3600);
    window.setTimeout(() => toast.remove(), 4100);
}


function clamp(value, min = 0, max = 100) {
    return Math.max(min, Math.min(max, value));
}

function randomItem(items) {
    return items[Math.floor(Math.random() * items.length)];
}

function addLog(message) {
    state.history.push(message);

    const entry = document.createElement("p");
    entry.className = "log-entry";

    const number = document.createElement("span");

    number.textContent = String(state.history.length).padStart(2, "0");

    const text = document.createElement("span");

    text.style.color = "var(--muted)";
    text.style.fontFamily = "Inter, sans-serif";
    text.style.fontSize = "11px";
    text.textContent = message;

    entry.replaceChildren(number, text);

    elements.log.prepend(entry);

    while (elements.log.children.length > 8) {
        elements.log.lastElementChild.remove();
    }
}

function changeScreen(screen) {
    elements.landing.classList.add("hidden");
    elements.setup.classList.add("hidden");
    elements.dashboard.classList.add("hidden");
    elements.report.classList.add("hidden");

    screen.classList.remove("hidden");
    renderFlightRecord();

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}

function updateResources() {
    for (const [key, ids] of Object.entries(RESOURCE_IDS)) {
        const value = Math.round(state.resources[key]);

        $(ids[0]).textContent = `${value}%`;
        $(ids[1]).style.width = `${value}%`;

        const card = $(ids[0]).closest(".resource-card");

        if (card) {
            card.setAttribute(
                "aria-label",
                `${RESOURCE_NAMES[key]}: ${value}%`
            );
        }

        if (value <= 25) {
            $(ids[0]).style.color = "#ff7298";
        } else {
            $(ids[0]).style.color = "";
        }
    }

    elements.score.textContent = state.score;

    elements.missionDay.textContent =
        `${String(state.day).padStart(2, "0")} / ${MAX_DAYS}`;

    elements.missionProgress.style.width =
        `${((state.day - 1) / MAX_DAYS) * 100}%`;
}

function checkMissionStatus() {
    const resources = state.resources;

    if (resources.health <= 0) {
        endMission(
            false,
            "Crew health reached a critical failure level."
        );

        return true;
    }

    for (const key of ["oxygen", "water", "food", "energy"]) {
        if (resources[key] <= 0) {
            endMission(
                false,
                `${RESOURCE_NAMES[key]} reserves were depleted.`
            );

            return true;
        }
    }

    return false;
}

function applyDailyConsumption() {
    const rates = DESTINATIONS[state.destination].dailyRates;
    const difficulty = DIFFICULTIES[state.difficulty];

    for (const [resource, amount] of Object.entries(rates)) {
        const adjustedAmount = Math.max(
            1,
            Math.round(amount * difficulty.dailyMultiplier)
        );

        state.resources[resource] = clamp(
            state.resources[resource] - adjustedAmount
        );
    }

    /*
     * These additional effects are deliberately simplified.
     * They are gameplay rules, not a real physiological model.
     */

    if (
        state.resources.oxygen < 25 ||
        state.resources.water < 25 ||
        state.resources.food < 25
    ) {
        state.resources.health = clamp(
            state.resources.health - 5
        );
    }

    if (state.resources.energy < 20) {
        state.resources.health = clamp(
            state.resources.health - 3
        );
    }
}

function createEventQueue() {
    const events = Object.keys(EVENTS);

    // Shuffle the six different event types.
    for (let i = events.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));

        [events[i], events[j]] = [events[j], events[i]];
    }

    return events;
}

function showNextEvent() {
    if (state.ended) {
        return;
    }

    if (checkMissionStatus()) {
        return;
    }

    if (state.day > MAX_DAYS) {
        endMission(
            true,
            "The seven-day mission period has ended."
        );

        return;
    }

    state.answered = false;

    /*
     * Apply daily consumption at the start of each mission day.
     * If a reserve is depleted, the mission ends before the next event.
     */

    applyDailyConsumption();
    updateResources();

    if (checkMissionStatus()) {
        return;
    }

    let eventKey;

    if (state.eventQueue.length > 0) {
        eventKey = state.eventQueue.shift();
    } else {
        eventKey = randomItem(Object.keys(EVENTS));
    }

    const event = EVENTS[eventKey];

    state.currentEvent = event;
    playTone("alert");
    const eventPanel = document.querySelector(".event-panel");
    if (eventPanel) {
        eventPanel.classList.remove("event-arrival");
        void eventPanel.offsetWidth;
        eventPanel.classList.add("event-arrival");
    }

    elements.eventIcon.textContent = event.icon;
    elements.eventTitle.textContent = event.title;
    elements.eventDescription.textContent = event.description;

    const scienceHeading = document.createElement("strong");
    scienceHeading.textContent = "MISSION SCIENCE";

    const scienceText = document.createElement("p");
    scienceText.textContent = event.science;

    elements.eventScience.replaceChildren(
        scienceHeading,
        scienceText
    );

    elements.optionA.textContent = event.choices[0].label;
    elements.optionB.textContent = event.choices[1].label;

    elements.optionA.disabled = false;
    elements.optionB.disabled = false;

    elements.decisionButtons.classList.remove("hidden");
    elements.feedback.classList.add("hidden");
    elements.continueButton.classList.add("hidden");

    addLog(`Day ${state.day}: ${event.title}`);

    updateResources();
}

function applyChoice(choiceIndex) {
    if (state.ended || state.answered) {
        return;
    }

    const event = state.currentEvent;

    if (!event) {
        return;
    }

    state.answered = true;
    playTone("click");

    const choice = event.choices[choiceIndex];
    const difficulty = DIFFICULTIES[state.difficulty];
    const appliedEffects = {};

    for (const [resource, change] of Object.entries(choice.effects)) {
        if (!(resource in state.resources)) {
            continue;
        }

        const multiplier = change < 0
            ? difficulty.negativeMultiplier
            : difficulty.positiveMultiplier;

        const adjustedChange = change === 0
            ? 0
            : Math.sign(change) * Math.max(
                1,
                Math.round(Math.abs(change) * multiplier)
            );

        appliedEffects[resource] = adjustedChange;

        state.resources[resource] = clamp(
            state.resources[resource] + adjustedChange
        );
    }

    const difficultyScoreMultiplier =
        state.difficulty === "hard"
            ? 1.15
            : state.difficulty === "easy"
                ? 0.9
                : 1;

    state.score = clamp(
        state.score + Math.round(
            choice.score * difficultyScoreMultiplier
        ),
        0,
        200
    );

    state.decisions++;

    elements.optionA.disabled = true;
    elements.optionB.disabled = true;

    elements.decisionButtons.classList.add("hidden");

    const changes = Object.entries(appliedEffects)
        .map(([resource, change]) => {
            const sign = change > 0 ? "+" : "";

            return `${RESOURCE_NAMES[resource]}: ${sign}${change}`;
        })
        .join("\n");

    elements.feedback.textContent =
        `${choice.explanation}\n\nRESOURCE CHANGES\n${changes}`;

    elements.feedback.classList.remove("hidden");
    elements.continueButton.classList.remove("hidden");

    addLog(
        `Day ${state.day}: Decision ${choiceIndex === 0 ? "A" : "B"} — ` +
        `${event.title}`
    );

    updateResources();

    if (checkMissionStatus()) {
        return;
    }

    elements.continueButton.focus();
}

function endMission(success, reason) {
    if (state.ended) {
        return;
    }

    state.ended = true;

    elements.decisionButtons.classList.add("hidden");
    elements.continueButton.classList.add("hidden");
    elements.feedback.classList.add("hidden");

    const averageResources =
        Object.values(state.resources).reduce(
            (sum, value) => sum + value,
            0
        ) / Object.keys(state.resources).length;

    /*
     * Final score combines decision points with remaining resources.
     * The score is a game metric, not a scientific assessment.
     */

    const finalScore = Math.round(
        clamp(
            state.score * 0.55 + averageResources * 0.9,
            0,
            200
        )
    );

    const newlyUnlockedBadges = saveMissionRecord(success, finalScore);
    showBadgeToast(newlyUnlockedBadges);
    playTone(success ? "success" : "alert");

    const resourceValues = Object.values(state.resources);

    const minimumResource = Math.min(...resourceValues);

    const excellent = success && minimumResource >= 50;
    const critical = success && minimumResource < 20;

    const outcomeTitle = !success
        ? "MISSION FAILED"
        : excellent
            ? "EXCELLENT MISSION"
            : critical
                ? "MISSION COMPLETED — CRITICAL"
                : "MISSION SUCCESS";

    elements.reportTitle.textContent = outcomeTitle;

    elements.reportSummary.textContent =
        `${reason} ` +
        (!success
            ? "Review your decisions and resource management before your next attempt."
            : excellent
                ? "Outstanding resource management: every reserve and crew health finished at 50% or higher."
                : critical
                    ? "The crew survived, but at least one reserve finished below 20%. The next mission needs stronger resource planning."
                    : "Your crew completed the planned mission period. Review the final reserves to improve your next attempt.");

    elements.finalScore.textContent = finalScore;
    const badgeNote = newlyUnlockedBadges.length
        ? ` New badge unlocked: ${newlyUnlockedBadges.map((badge) => badge.title).join(", ")}.`
        : " Your flight record and high scores have been saved on this device.";
    elements.reportSummary.textContent += badgeNote;

    const stats = [
        ["DESTINATION", DESTINATIONS[state.destination].title],
        ["DIFFICULTY", DIFFICULTIES[state.difficulty].label],
        ["DAYS SURVIVED", Math.min(state.day, MAX_DAYS)],
        ["DECISIONS MADE", state.decisions],
        ["OXYGEN", `${Math.round(state.resources.oxygen)}%`],
        ["WATER", `${Math.round(state.resources.water)}%`],
        ["FOOD", `${Math.round(state.resources.food)}%`],
        ["ENERGY", `${Math.round(state.resources.energy)}%`],
        ["CREW HEALTH", `${Math.round(state.resources.health)}%`],
        ["BASE DECISION SCORE", state.score]
    ];

    elements.reportStats.replaceChildren();

    for (const [label, value] of stats) {
        const card = document.createElement("div");
        card.className = "report-stat";

        const heading = document.createElement("span");
        heading.textContent = label;

        const result = document.createElement("strong");
        result.textContent = value;

        card.append(heading, result);

        elements.reportStats.append(card);
    }

    const lessons = [
        {
            title: "Resource planning",
            text:
                "Track consumption as well as current supplies. A reserve " +
                "that looks healthy today may become insufficient later."
        },

        {
            title: "Life support and energy",
            text:
                "Habitat systems depend on reliable power and maintenance. " +
                "Conserving energy can involve trade-offs with other operations."
        },

        {
            title: "Crew well-being",
            text:
                "Rest, safe working practices, and reliable life support " +
                "help astronauts perform their duties."
        },

        {
            title: "Learning through decisions",
            text:
                "This simulator simplifies real engineering. Its scores, " +
                "resource units, and consequences are educational game rules, " +
                "not real mission predictions."
        }
    ];

    elements.learningSummary.replaceChildren();

    for (const lesson of lessons) {
        const item = document.createElement("article");
        item.className = "learning-item";

        const heading = document.createElement("h4");
        heading.textContent = lesson.title;

        const text = document.createElement("p");
        text.textContent = lesson.text;

        item.append(heading, text);

        elements.learningSummary.append(item);
    }

    addLog(
        success
            ? "Mission completed."
            : "Mission ended."
    );

    changeScreen(elements.report);
}

function startGame(destination) {
    if (!DESTINATIONS[destination]) {
        return;
    }

    state.destination = destination;
    state.day = 1;
    showLaunchSequence();

    state.resources = {
        oxygen: STARTING_RESOURCES,
        water: STARTING_RESOURCES,
        food: STARTING_RESOURCES,
        energy: STARTING_RESOURCES,
        health: STARTING_RESOURCES
    };

    state.score = 100;
    state.decisions = 0;
    state.history = [];
    state.currentEvent = null;
    state.eventQueue = createEventQueue();
    state.ended = false;
    state.answered = false;

    elements.log.replaceChildren();

    elements.destinationTitle.textContent =
        DESTINATIONS[destination].title;

    elements.missionSubtitle.textContent =
        DESTINATIONS[destination].subtitle;

    addLog(
        `${DESTINATIONS[destination].title} initialized.`
    );

    addLog(
        `Difficulty selected: ${DIFFICULTIES[state.difficulty].label}.`
    );

    changeScreen(elements.dashboard);

    updateResources();
    showNextEvent();
}

// --------------------------------------------------
// LANDING PAGE
// --------------------------------------------------

elements.start.addEventListener("click", () => {
    changeScreen(elements.setup);
});

// --------------------------------------------------
// DESTINATION SELECTION
// --------------------------------------------------

document.querySelectorAll(".destination-card").forEach((card) => {
    card.addEventListener("click", () => {
        const destination = card.dataset.destination;

        startGame(destination);
    });
});

// --------------------------------------------------
// DECISION BUTTONS
// --------------------------------------------------

elements.optionA.addEventListener("click", () => {
    applyChoice(0);
});

elements.optionB.addEventListener("click", () => {
    applyChoice(1);
});

// --------------------------------------------------
// CONTINUE TO THE NEXT MISSION DAY
// --------------------------------------------------

elements.continueButton.addEventListener("click", () => {
    if (state.ended || !state.answered) {
        return;
    }

    state.day++;

    showNextEvent();
});

// --------------------------------------------------
// END THE CURRENT MISSION
// --------------------------------------------------

elements.abandon.addEventListener("click", () => {
    if (state.ended) {
        return;
    }

    const confirmed = window.confirm(
        "End this mission and view your report?"
    );

    if (confirmed) {
        endMission(
            false,
            "The mission was ended by the player."
        );
    }
});

// --------------------------------------------------
// RESTART
// --------------------------------------------------

elements.restart.addEventListener("click", () => {
    changeScreen(elements.setup);
});

// --------------------------------------------------
// INITIAL STATE
// --------------------------------------------------

installDifficultySelector();
const soundToggle = $("soundToggle");
if (soundToggle) {
    soundToggle.addEventListener("click", () => {
        soundEnabled = !soundEnabled;
        writeStorage(STORAGE_KEYS.sound, String(soundEnabled));
        updateSoundToggle();
        if (soundEnabled) playTone("click");
    });
}
updateSoundToggle();
renderFlightRecord();
changeScreen(elements.landing);