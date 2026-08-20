/* =========================================================
   AURA PRO v3.0
   Ammar's Universal Responsive Assistant

   FRONTEND COMMAND + INTENT ENGINE
   ---------------------------------------------------------
   HTML: unchanged
   CSS : unchanged
   JS  : complete upgraded version

   Features:
   - Natural language commands
   - Voice recognition
   - Text-to-speech
   - Tasks
   - Notes
   - Memory
   - Timers
   - Web search
   - Website launching
   - YouTube / music
   - Calculator
   - Focus mode
   - Themes
   - Navigation
   - Activity
   - History
   - Productivity reports
========================================================= */

"use strict";

/* =========================================================
   STORAGE
========================================================= */

const STORAGE_KEYS = {
    tasks: "aura_tasks",
    notes: "aura_notes",
    activity: "aura_activity",
    stats: "aura_stats",
    settings: "aura_settings",
    history: "aura_history",
    memory: "aura_memory"
};

const DEFAULT_STATS = {
    commands: 0,
    completed: 0,
    voice: 0
};

const DEFAULT_SETTINGS = {
    voice: true,
    animations: true,
    notifications: true,
    focus: false,
    theme: "dark"
};

let tasks = loadData(STORAGE_KEYS.tasks, []);
let notes = loadData(STORAGE_KEYS.notes, []);
let activity = loadData(STORAGE_KEYS.activity, []);
let history = loadData(STORAGE_KEYS.history, []);
let memory = loadData(STORAGE_KEYS.memory, []);

let stats = {
    ...DEFAULT_STATS,
    ...loadData(STORAGE_KEYS.stats, DEFAULT_STATS)
};

let settings = {
    ...DEFAULT_SETTINGS,
    ...loadData(STORAGE_KEYS.settings, DEFAULT_SETTINGS)
};

let recognition = null;
let isListening = false;

let timerInterval = null;
let timerSeconds = 0;
let timerRunning = false;

/* =========================================================
   DOM HELPERS
========================================================= */

const $ = selector =>
    document.querySelector(selector);

const $$ = selector =>
    document.querySelectorAll(selector);

function safeElement(selector) {
    return $(selector);
}

/* =========================================================
   STORAGE HELPERS
========================================================= */

function loadData(key, fallback) {
    try {
        const saved = localStorage.getItem(key);

        if (!saved) {
            return Array.isArray(fallback)
                ? [...fallback]
                : { ...fallback };
        }

        return JSON.parse(saved);

    } catch (error) {

        console.warn(
            "AURA storage error:",
            error
        );

        return Array.isArray(fallback)
            ? [...fallback]
            : { ...fallback };
    }
}

function saveData(key, value) {
    try {

        localStorage.setItem(
            key,
            JSON.stringify(value)
        );

    } catch (error) {

        console.warn(
            "AURA storage failed:",
            error
        );
    }
}

/* =========================================================
   INITIALIZATION
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    initializeAURA
);

function initializeAURA() {

    initializeNavigation();
    initializeClock();
    initializeQuickCommands();
    initializeChat();
    initializeCommandConsole();
    initializeTasks();
    initializeNotes();
    initializeSettings();
    initializeVoiceRecognition();
    initializeTimerControls();
    initializeFullscreen();
    initializeMobileMenu();
    initializeSearch();
    initializeNotifications();
    initializeKeyboardShortcuts();
    initializeMemoryControls();
    initializeGlobalControls();
    initializeModals();

    renderTasks();
    renderNotes();
    renderActivity();

    updateStats();
    updateMemory();
    applySettings();

    setAURAState(
        "READY",
        "Awaiting your next command"
    );

    showToast(
        "AURA Pro is online."
    );
}

/* =========================================================
   NAVIGATION
========================================================= */

function initializeNavigation() {

    $$(".nav-item").forEach(button => {

        button.addEventListener(
            "click",
            () => {

                const page =
                    button.dataset.page;

                if (page) {
                    navigateTo(page);
                }
            }
        );
    });

    $$("[data-page]").forEach(button => {

        if (
            button.classList.contains(
                "nav-item"
            )
        ) {
            return;
        }

        button.addEventListener(
            "click",
            () => {

                const page =
                    button.dataset.page;

                if (page) {
                    navigateTo(page);
                }
            }
        );
    });
}

function navigateTo(pageName) {

    const target =
        document.getElementById(
            pageName
        );

    if (!target) {

        showToast(
            `I couldn't find the ${pageName} section.`
        );

        return;
    }

    $$(".page").forEach(page => {

        page.classList.remove(
            "active"
        );
    });

    target.classList.add(
        "active"
    );

    $$(".nav-item").forEach(item => {

        item.classList.toggle(
            "active",
            item.dataset.page === pageName
        );
    });

    const labels = {

        dashboard:
            "COMMAND CENTER",

        chat:
            "AURA CONVERSATION",

        commands:
            "COMMAND ENGINE",

        tasks:
            "PRODUCTIVITY",

        notes:
            "AURA MEMORY",

        activity:
            "ANALYTICS",

        memory:
            "INTELLIGENCE",

        settings:
            "CONFIGURATION"
    };

    const section =
        safeElement(
            "#currentSection"
        );

    if (section) {

        section.textContent =
            labels[pageName] ||
            "AURA";
    }

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

    document.body.classList.remove(
        "sidebar-open"
    );
}

/* =========================================================
   CLOCK
========================================================= */

function initializeClock() {

    updateClock();

    setInterval(
        updateClock,
        1000
    );
}

function updateClock() {

    const now =
        new Date();

    const time =
        now.toLocaleTimeString(
            [],
            {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit"
            }
        );

    const date =
        now.toLocaleDateString(
            [],
            {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric"
            }
        );

    const clock =
        safeElement("#clock");

    const currentDate =
        safeElement("#currentDate");

    const timezone =
        safeElement("#timezone");

    if (clock)
        clock.textContent = time;

    if (currentDate)
        currentDate.textContent = date;

    if (timezone) {

        timezone.textContent =
            Intl.DateTimeFormat()
                .resolvedOptions()
                .timeZone;
    }
}

/* =========================================================
   QUICK COMMANDS
========================================================= */

function initializeQuickCommands() {

    $$("[data-command]").forEach(button => {

        button.addEventListener(
            "click",
            () => {

                executeCommand(
                    button.dataset.command
                );
            }
        );
    });
}

/* =========================================================
   CHAT
========================================================= */

function initializeChat() {

    const sendButton =
        safeElement("#sendButton");

    const chatInput =
        safeElement("#chatInput");

    if (sendButton) {

        sendButton.addEventListener(
            "click",
            sendChatMessage
        );
    }

    if (chatInput) {

        chatInput.addEventListener(
            "keydown",
            event => {

                if (
                    event.key === "Enter" &&
                    !event.shiftKey
                ) {

                    event.preventDefault();

                    sendChatMessage();
                }
            }
        );
    }

    $$("[data-chat]").forEach(button => {

        button.addEventListener(
            "click",
            () => {

                if (!chatInput)
                    return;

                chatInput.value =
                    button.dataset.chat;

                sendChatMessage();
            }
        );
    });
}

async function sendChatMessage() {

    const input = safeElement("#chatInput");

    if (!input) return;

    const message = input.value.trim();

    if (!message) return;

    /* Show user's message */
    addMessage("user", message);

    input.value = "";

    /* AURA thinking state */
    setAURAState(
        "THINKING",
        "Connecting to AURA intelligence..."
    );

    addToHistory(message);

    try {

        /* Send command to Node.js backend */
        const response = await sendToAURABackend(message);

        /* Show backend response */
        addMessage(
            "assistant",
            response
        );

        /* Return AURA to ready state */
        setAURAState(
            "READY",
            "Awaiting your next command"
        );

        /* Voice response */
        speak(response);

    } catch (error) {

        console.error(
            "AURA Chat Error:",
            error
        );

        const errorMessage =
            "I couldn't connect to my backend system.";

        addMessage(
            "assistant",
            errorMessage
        );

        setAURAState(
            "READY",
            "Backend connection error"
        );
    }
}
function addMessage(
    type,
    text
) {

    const container =
        safeElement("#messages");

    if (!container)
        return;

    const message =
        document.createElement("div");

    message.className =
        `message ${type}`;

    const avatar =
        type === "assistant"
            ? "A"
            : "AA";

    message.innerHTML = `
        <div class="message-avatar">
            ${avatar}
        </div>

        <div class="message-content">

            <span class="message-name">
                ${
                    type === "assistant"
                        ? "AURA"
                        : "AMMAR"
                }
            </span>

            <div class="bubble"></div>

            <time>
                ${getTime()}
            </time>

        </div>
    `;

    const bubble =
        message.querySelector(
            ".bubble"
        );

    if (bubble) {
        bubble.textContent = text;
    }

    container.appendChild(
        message
    );

    container.scrollTop =
        container.scrollHeight;
}

/* =========================================================
   MAIN COMMAND ENGINE
========================================================= */

function processCommand(input) {

    const original =
        String(input || "").trim();

    const command =
        normalizeCommand(original);

    if (!command) {

        return "I'm ready. Tell me what you need.";
    }

    stats.commands++;

    saveData(
        STORAGE_KEYS.stats,
        stats
    );

    updateStats();

    addToHistory(
        original
    );

    addActivity(
        "Command",
        original,
        "fa-bolt"
    );

    /* ---------------------------------------------
       GREETINGS
    --------------------------------------------- */

    if (
        hasAny(command, [
            "hello",
            "hi",
            "hey",
            "hello aura",
            "hi aura",
            "hey aura",
            "good morning",
            "good afternoon",
            "good evening"
        ])
    ) {

        return randomResponse([
            "Hello Ammar. AURA is online and ready.",
            "Welcome back, Ammar. All systems are ready.",
            "Hello Ammar. What would you like me to do?",
            "AURA is ready. Give me your next command."
        ]);
    }

    /* ---------------------------------------------
       HOW ARE YOU
    --------------------------------------------- */

    if (
        hasAny(command, [
            "how are you",
            "how are things",
            "are you okay",
            "are you working"
        ])
    ) {

        return "All AURA systems are operational. I'm ready for your next command.";
    }

    /* ---------------------------------------------
       IDENTITY
    --------------------------------------------- */

    if (
        hasAny(command, [
            "your name",
            "who are you",
            "what are you"
        ])
    ) {

        return "I'm AURA — Ammar's Universal Responsive Assistant.";
    }

    /* ---------------------------------------------
       CREATOR
    --------------------------------------------- */

    if (
        hasAny(command, [
            "who made you",
            "who created you",
            "who built you",
            "who designed you",
            "your creator"
        ])
    ) {

        return "I was designed as Ammar Akram's personal digital assistant and command center.";
    }

    /* ---------------------------------------------
       THANKS
    --------------------------------------------- */

    if (
        hasAny(command, [
            "thank you",
            "thanks",
            "thank"
        ])
    ) {

        return "You're welcome, Ammar.";
    }

    /* ---------------------------------------------
       TIME
    --------------------------------------------- */

    if (
        isTimeCommand(command)
    ) {

        return `The current time is ${new Date().toLocaleTimeString()}.`;
    }

    /* ---------------------------------------------
       DATE
    --------------------------------------------- */

    if (
        isDateCommand(command)
    ) {

        return `Today is ${new Date().toLocaleDateString(
            [],
            {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric"
            }
        )}.`;
    }

    /* ---------------------------------------------
       HELP
    --------------------------------------------- */

    if (
        command === "help" ||
        hasAny(command, [
            "what can you do",
            "what do you do",
            "show commands",
            "available commands",
            "your abilities"
        ])
    ) {

        return generateHelpResponse();
    }

    /* ---------------------------------------------
       SYSTEM STATUS
    --------------------------------------------- */

    if (
        hasAny(command, [
            "system status",
            "status report",
            "system report",
            "system information",
            "how is the system"
        ])
    ) {

        return generateSystemReport();
    }

    /* ---------------------------------------------
       PRODUCTIVITY
    --------------------------------------------- */

    if (
        hasAny(command, [
            "productivity",
            "productivity report",
            "how productive am i",
            "show productivity"
        ])
    ) {

        return generateProductivityReport();
    }

    /* ---------------------------------------------
       NAVIGATION
    --------------------------------------------- */

    const page =
        detectPage(command);

    if (page) {

        navigateTo(page.id);

        return `Opening ${page.name}.`;
    }

    /* ---------------------------------------------
       MUSIC
    --------------------------------------------- */

    if (
        isMusicCommand(command)
    ) {

        const query =
            extractMediaQuery(
                original
            );

        if (query) {

            openWebsite(
                `https://www.youtube.com/results?search_query=${encodeURIComponent(
                    query
                )}`
            );

            addActivity(
                "Music",
                query,
                "fa-music"
            );

            return `Opening YouTube results for "${query}".`;
        }

        openWebsite(
            "https://www.youtube.com"
        );

        addActivity(
            "Music",
            "YouTube",
            "fa-music"
        );

        return "Opening YouTube so you can play music.";
    }

    /* ---------------------------------------------
       YOUTUBE
    --------------------------------------------- */

    if (
        command.includes("youtube")
    ) {

        const query =
            extractYouTubeQuery(
                original
            );

        if (query) {

            openWebsite(
                `https://www.youtube.com/results?search_query=${encodeURIComponent(
                    query
                )}`
            );

            return `Searching YouTube for "${query}".`;
        }

        openWebsite(
            "https://www.youtube.com"
        );

        return "Opening YouTube.";
    }

    /* ---------------------------------------------
       WEBSITE DETECTION
    --------------------------------------------- */

    const website =
        detectWebsite(command);

    if (website) {

        openWebsite(
            website.url
        );

        addActivity(
            "Website",
            website.name,
            "fa-globe"
        );

        return `Opening ${website.name}.`;
    }

    /* ---------------------------------------------
       SEARCH
    --------------------------------------------- */

    if (
        isSearchCommand(command)
    ) {

        const query =
            extractSearchQuery(
                original
            );

        if (query) {

            searchWeb(query);

            return `Searching the web for "${query}".`;
        }
    }

    /* ---------------------------------------------
       CALCULATOR
    --------------------------------------------- */

    if (
        isCalculationCommand(command)
    ) {

        const result =
            calculateFromText(
                original
            );

        if (result !== null) {

            return `The answer is ${result}.`;
        }
    }

    /* ---------------------------------------------
       CREATE TASK
    --------------------------------------------- */

    if (
        isCreateTaskCommand(command)
    ) {

        const title =
            extractTaskTitle(
                original
            );

        if (title) {

            createTask(title);

            return `Task created successfully: ${title}`;
        }

        openModal(
            "taskModal"
        );

        return "I've opened the task creator.";
    }

    /* ---------------------------------------------
       SHOW TASKS
    --------------------------------------------- */

    if (
        hasAny(command, [
            "show tasks",
            "my tasks",
            "list tasks",
            "pending tasks",
            "what are my tasks",
            "what tasks do i have",
            "show my todo",
            "show my to do list",
            "my todo list"
        ])
    ) {

        return getTaskSummary();
    }

    /* ---------------------------------------------
       COMPLETE TASK
    --------------------------------------------- */

    if (
        isCompleteTaskCommand(command)
    ) {

        const title =
            extractAfterPhrase(
                original,
                [
                    "complete task",
                    "finish task",
                    "done with task",
                    "mark task complete",
                    "complete",
                    "finish"
                ]
            );

        if (title) {

            return completeTaskByTitle(
                title
            );
        }

        return "Tell me the name of the task you want me to complete.";
    }

    /* ---------------------------------------------
       DELETE TASK
    --------------------------------------------- */

    if (
        isDeleteTaskCommand(command)
    ) {

        const title =
            extractAfterPhrase(
                original,
                [
                    "delete task",
                    "remove task",
                    "delete",
                    "remove"
                ]
            );

        if (title) {

            return deleteTaskByTitle(
                title
            );
        }

        return "Tell me which task you want me to delete.";
    }

    /* ---------------------------------------------
       NOTES
    --------------------------------------------- */

    if (
        isNoteCommand(command)
    ) {

        const noteText =
            extractAfterPhrase(
                original,
                [
                    "create note",
                    "make a note",
                    "write a note",
                    "save a note",
                    "note",
                    "remember in notes"
                ]
            );

        if (noteText) {

            createQuickNote(
                noteText
            );

            return "I've saved that as a note in AURA memory.";
        }

        openModal(
            "noteModal"
        );

        return "I've opened the note creator.";
    }

    /* ---------------------------------------------
       MEMORY
    --------------------------------------------- */

    if (
        isRememberCommand(command)
    ) {

        const memoryText =
            extractMemoryText(
                original
            );

        if (memoryText) {

            saveMemory(
                memoryText
            );

            return "I've stored that in AURA's local memory.";
        }

        return "Tell me what you want me to remember.";
    }

    /* ---------------------------------------------
       RECALL MEMORY
    --------------------------------------------- */

    if (
        hasAny(command, [
            "what do you remember",
            "show memory",
            "my memories",
            "recall memory",
            "what have you remembered",
            "remember anything about me"
        ])
    ) {

        return getMemorySummary();
    }

    /* ---------------------------------------------
       FOCUS MODE
    --------------------------------------------- */

    if (
        hasAny(command, [
            "focus mode",
            "turn on focus",
            "enable focus",
            "start focus",
            "focus"
        ])
    ) {

        toggleFocusMode(
            true
        );

        return "Focus mode is now active. Distractions are minimized.";
    }

    if (
        hasAny(command, [
            "exit focus",
            "disable focus",
            "turn off focus",
            "stop focus"
        ])
    ) {

        toggleFocusMode(
            false
        );

        return "Focus mode has been disabled.";
    }

    /* ---------------------------------------------
       DARK THEME
    --------------------------------------------- */

    if (
        hasAny(command, [
            "dark mode",
            "dark theme",
            "turn on dark mode",
            "enable dark mode"
        ])
    ) {

        setTheme("dark");

        return "Dark theme activated.";
    }

    /* ---------------------------------------------
       LIGHT THEME
    --------------------------------------------- */

    if (
        hasAny(command, [
            "light mode",
            "light theme",
            "turn on light mode",
            "enable light mode"
        ])
    ) {

        setTheme("light");

        return "Light theme activated.";
    }

    /* ---------------------------------------------
       ANIMATIONS
    --------------------------------------------- */

    if (
        hasAny(command, [
            "disable animations",
            "turn off animations",
            "reduce animations",
            "stop animations"
        ])
    ) {

        settings.animations = false;

        saveData(
            STORAGE_KEYS.settings,
            settings
        );

        applySettings();

        return "Animations have been reduced.";
    }

    if (
        hasAny(command, [
            "enable animations",
            "turn on animations",
            "restore animations"
        ])
    ) {

        settings.animations = true;

        saveData(
            STORAGE_KEYS.settings,
            settings
        );

        applySettings();

        return "Animations are enabled again.";
    }

    /* ---------------------------------------------
       VOICE
    --------------------------------------------- */

    if (
        hasAny(command, [
            "turn off voice",
            "disable voice",
            "stop speaking",
            "mute aura"
        ])
    ) {

        settings.voice = false;

        saveData(
            STORAGE_KEYS.settings,
            settings
        );

        return "AURA voice responses are now disabled.";
    }

    if (
        hasAny(command, [
            "turn on voice",
            "enable voice",
            "unmute aura",
            "speak again"
        ])
    ) {

        settings.voice = true;

        saveData(
            STORAGE_KEYS.settings,
            settings
        );

        return "AURA voice responses are enabled.";
    }

    /* ---------------------------------------------
       TIMER
    --------------------------------------------- */

    if (
        isTimerCommand(command)
    ) {

        if (
            hasAny(command, [
                "stop timer",
                "cancel timer",
                "reset timer"
            ])
        ) {

            resetTimer();

            return "The timer has been stopped.";
        }

        const minutes =
            extractMinutes(command) ||
            25;

        startTimer(
            minutes
        );

        return `Starting a ${minutes} minute timer.`;
    }

    /* ---------------------------------------------
       CLEAR CHAT
    --------------------------------------------- */

    if (
        hasAny(command, [
            "clear chat",
            "clear conversation",
            "delete conversation",
            "start fresh chat"
        ])
    ) {

        clearChat();

        return "Conversation cleared.";
    }

    /* ---------------------------------------------
       CLEAR HISTORY
    --------------------------------------------- */

    if (
        hasAny(command, [
            "clear command history",
            "clear history",
            "delete command history"
        ])
    ) {

        history = [];

        saveData(
            STORAGE_KEYS.history,
            history
        );

        return "Command history has been cleared.";
    }

    /* ---------------------------------------------
       CLEAR ACTIVITY
    --------------------------------------------- */

    if (
        hasAny(command, [
            "clear activity",
            "clear activity history"
        ])
    ) {

        activity = [];

        saveData(
            STORAGE_KEYS.activity,
            activity
        );

        renderActivity();
        updateMemory();

        return "Activity history has been cleared.";
    }

    /* ---------------------------------------------
       OPEN SETTINGS
    --------------------------------------------- */

    if (
        hasAny(command, [
            "open settings",
            "show settings",
            "go to settings",
            "configuration"
        ])
    ) {

        navigateTo(
            "settings"
        );

        return "Opening AURA settings.";
    }

    /* ---------------------------------------------
       OPEN DASHBOARD
    --------------------------------------------- */

    if (
        hasAny(command, [
            "open dashboard",
            "show dashboard",
            "go home",
            "home"
        ])
    ) {

        navigateTo(
            "dashboard"
        );

        return "Opening the AURA command center.";
    }

    /* ---------------------------------------------
       FALLBACK
    --------------------------------------------- */

    return generateFallbackResponse(
        original
    );
}

/* =========================================================
   NORMALIZATION
========================================================= */

function normalizeCommand(input) {

    return String(input || "")
        .toLowerCase()
        .trim()
        .replace(/[!?.,]+$/g, "")
        .replace(/\s+/g, " ");
}

function hasAny(
    command,
    phrases
) {

    return phrases.some(
        phrase =>
            command === phrase ||
            command.includes(
                phrase
            )
    );
}

function matches(
    command,
    phrases
) {

    return hasAny(
        command,
        phrases
    );
}

/* =========================================================
   COMMAND DETECTORS
========================================================= */

function isTimeCommand(command) {

    return (
        command === "time" ||
        command.includes("what time") ||
        command.includes("current time") ||
        command.includes("tell me the time")
    );
}

function isDateCommand(command) {

    return (
        command === "date" ||
        command.includes("what date") ||
        command.includes("today's date") ||
        command.includes("todays date") ||
        command.includes("what day is it") ||
        command.includes("what day")
    );
}

function isSearchCommand(command) {

    return (
        command.startsWith("search ") ||
        command.startsWith("search for ") ||
        command.startsWith("look up ") ||
        command.startsWith("find information about ") ||
        command.startsWith("find info about ") ||
        command.startsWith("google ")
    );
}

function isCalculationCommand(command) {

    return (
        command.startsWith("calculate") ||
        command.startsWith("what is ") ||
        command.startsWith("what's ") ||
        command.startsWith("compute ") ||
        command.startsWith("solve ")
    );
}

function isCreateTaskCommand(command) {

    return hasAny(command, [
        "create task",
        "add task",
        "new task",
        "make a task",
        "add to my tasks",
        "add to my todo",
        "add to my to do list",
        "remind me to",
        "i need to",
        "i have to"
    ]);
}

function isCompleteTaskCommand(command) {

    return hasAny(command, [
        "complete task",
        "finish task",
        "done with task",
        "mark task complete",
        "mark task as complete",
        "complete",
        "finish"
    ]);
}

function isDeleteTaskCommand(command) {

    return hasAny(command, [
        "delete task",
        "remove task",
        "delete my task",
        "remove my task"
    ]);
}

function isNoteCommand(command) {

    return (
        command.startsWith("note") ||
        hasAny(command, [
            "create note",
            "make a note",
            "write a note",
            "save a note",
            "remember in notes"
        ])
    );
}

function isRememberCommand(command) {

    return (
        command.startsWith("remember ") ||
        command.startsWith("remember that ") ||
        command.includes("remember this")
    );
}

function isTimerCommand(command) {

    return (
        command.includes("timer") ||
        command.includes("countdown")
    );
}

function isMusicCommand(command) {

    return hasAny(command, [
        "play music",
        "play some music",
        "play a song",
        "play song",
        "play songs",
        "listen to music",
        "put on music",
        "start music",
        "music",
        "i want music",
        "i want to listen to music"
    ]);
}

/* =========================================================
   PAGE DETECTOR
========================================================= */

function detectPage(command) {

    const pages = [

        {
            keys: [
                "dashboard",
                "command center",
                "home"
            ],
            id: "dashboard",
            name: "Dashboard"
        },

        {
            keys: [
                "chat",
                "conversation",
                "talk to aura"
            ],
            id: "chat",
            name: "AURA Conversation"
        },

        {
            keys: [
                "commands",
                "command engine",
                "command console"
            ],
            id: "commands",
            name: "Command Engine"
        },

        {
            keys: [
                "tasks",
                "task page",
                "productivity"
            ],
            id: "tasks",
            name: "Tasks"
        },

        {
            keys: [
                "notes",
                "notes page"
            ],
            id: "notes",
            name: "Notes"
        },

        {
            keys: [
                "activity",
                "analytics"
            ],
            id: "activity",
            name: "Activity"
        },

        {
            keys: [
                "memory",
                "aura memory",
                "intelligence"
            ],
            id: "memory",
            name: "Memory"
        },

        {
            keys: [
                "settings",
                "configuration"
            ],
            id: "settings",
            name: "Settings"
        }
    ];

    for (const page of pages) {

        if (
            page.keys.some(
                key =>
                    command.includes(key)
            )
        ) {
            return page;
        }
    }

    return null;
}

/* =========================================================
   WEBSITE DETECTOR
========================================================= */

function detectWebsite(command) {

    const websites = [

        {
            keys: [
                "youtube"
            ],
            name: "YouTube",
            url:
                "https://www.youtube.com"
        },

        {
            keys: [
                "google"
            ],
            name: "Google",
            url:
                "https://www.google.com"
        },

        {
            keys: [
                "github"
            ],
            name: "GitHub",
            url:
                "https://github.com"
        },

        {
            keys: [
                "linkedin"
            ],
            name: "LinkedIn",
            url:
                "https://www.linkedin.com"
        },

        {
            keys: [
                "gmail",
                "email"
            ],
            name: "Gmail",
            url:
                "https://mail.google.com"
        },

        {
            keys: [
                "stackoverflow",
                "stack overflow"
            ],
            name: "Stack Overflow",
            url:
                "https://stackoverflow.com"
        },

        {
            keys: [
                "facebook"
            ],
            name: "Facebook",
            url:
                "https://www.facebook.com"
        },

        {
            keys: [
                "instagram"
            ],
            name: "Instagram",
            url:
                "https://www.instagram.com"
        },

        {
            keys: [
                "chatgpt"
            ],
            name: "ChatGPT",
            url:
                "https://chatgpt.com"
        },

        {
            keys: [
                "reddit"
            ],
            name: "Reddit",
            url:
                "https://www.reddit.com"
        },

        {
            keys: [
                "wikipedia"
            ],
            name: "Wikipedia",
            url:
                "https://www.wikipedia.org"
        },

        {
            keys: [
                "spotify"
            ],
            name: "Spotify",
            url:
                "https://open.spotify.com"
        },

        {
            keys: [
                "discord"
            ],
            name: "Discord",
            url:
                "https://discord.com"
        },

        {
            keys: [
                "canva"
            ],
            name: "Canva",
            url:
                "https://www.canva.com"
        },

        {
            keys: [
                "figma"
            ],
            name: "Figma",
            url:
                "https://www.figma.com"
        }
    ];

    for (
        const site of websites
    ) {

        if (
            site.keys.some(
                key =>
                    command.includes(key)
            )
        ) {

            return site;
        }
    }

    return null;
}

/* =========================================================
   SEARCH
========================================================= */

function extractSearchQuery(
    input
) {

    return String(input)
        .replace(
            /^(search|search for|look up|google)\s*/i,
            ""
        )
        .replace(
            /^find information about\s*/i,
            ""
        )
        .replace(
            /^find info about\s*/i,
            ""
        )
        .trim();
}

function searchWeb(query) {

    const url =
        `https://www.google.com/search?q=${encodeURIComponent(
            query
        )}`;

    openWebsite(
        url
    );

    addActivity(
        "Web search",
        query,
        "fa-magnifying-glass"
    );
}

function openWebsite(url) {

    window.open(
        url,
        "_blank",
        "noopener,noreferrer"
    );
}

/* =========================================================
   YOUTUBE
========================================================= */

function extractYouTubeQuery(
    input
) {

    let query =
        String(input);

    query =
        query
            .replace(
                /open youtube/gi,
                ""
            )
            .replace(
                /go to youtube/gi,
                ""
            )
            .replace(
                /search youtube for/gi,
                ""
            )
            .replace(
                /youtube search/gi,
                ""
            )
            .trim();

    return query;
}

function extractMediaQuery(
    input
) {

    return String(input)
        .replace(
            /play/gi,
            ""
        )
        .replace(
            /some/gi,
            ""
        )
        .replace(
            /music/gi,
            ""
        )
        .replace(
            /a song/gi,
            ""
        )
        .replace(
            /songs/gi,
            ""
        )
        .replace(
            /listen to/gi,
            ""
        )
        .replace(
            /put on/gi,
            ""
        )
        .replace(
            /start/gi,
            ""
        )
        .trim();
}

/* =========================================================
   CALCULATOR
========================================================= */

function calculateFromText(
    text
) {

    let expression =
        String(text)
            .replace(
                /calculate/gi,
                ""
            )
            .replace(
                /what is/gi,
                ""
            )
            .replace(
                /what's/gi,
                ""
            )
            .replace(
                /compute/gi,
                ""
            )
            .replace(
                /solve/gi,
                ""
            )
            .replace(
                /equals/gi,
                ""
            )
            .replace(
                /answer/gi,
                ""
            )
            .trim();

    expression =
        expression
            .replace(
                /×/g,
                "*"
            )
            .replace(
                /÷/g,
                "/"
            )
            .replace(
                /plus/gi,
                "+"
            )
            .replace(
                /minus/gi,
                "-"
            )
            .replace(
                /times/gi,
                "*"
            )
            .replace(
                /multiplied by/gi,
                "*"
            )
            .replace(
                /divided by/gi,
                "/"
            )
            .replace(
                /[^0-9+\-*/().%\s]/g,
                ""
            );

    if (!expression)
        return null;

    if (
        !/^[0-9+\-*/().%\s]+$/.test(
            expression
        )
    ) {
        return null;
    }

    try {

        const result =
            Function(
                `"use strict"; return (${expression})`
            )();

        if (
            typeof result !== "number" ||
            !Number.isFinite(result)
        ) {
            return null;
        }

        return Number.isInteger(result)
            ? result
            : Number(
                result.toFixed(8)
            );

    } catch {

        return null;
    }
}

/* =========================================================
   TASK ENGINE
========================================================= */

function extractTaskTitle(
    input
) {

    let title =
        String(input);

    const patterns = [
        /create task/i,
        /add task/i,
        /new task/i,
        /make a task/i,
        /add to my tasks/i,
        /add to my todo/i,
        /add to my to do list/i,
        /remind me to/i,
        /i need to/i,
        /i have to/i,
        /^task/i
    ];

    patterns.forEach(
        pattern => {

            title =
                title.replace(
                    pattern,
                    ""
                );
        }
    );

    return title
        .replace(
            /please/gi,
            ""
        )
        .replace(
            /^[:\s-]+/,
            ""
        )
        .trim();
}

function createTask(title) {

    if (!title)
        return;

    const task = {

        id:
            Date.now(),

        title,

        completed:
            false,

        createdAt:
            new Date().toISOString()
    };

    tasks.unshift(
        task
    );

    saveData(
        STORAGE_KEYS.tasks,
        tasks
    );

    renderTasks();
    updateStats();
    updateMemory();

    addActivity(
        "Task created",
        title,
        "fa-list-check"
    );

    showToast(
        "Task created successfully."
    );
}

function getTaskSummary() {

    const pending =
        tasks.filter(
            task =>
                !task.completed
        );

    const completed =
        tasks.filter(
            task =>
                task.completed
        );

    if (!tasks.length) {

        return "Your AURA task list is currently empty.";
    }

    if (!pending.length) {

        return `You have ${completed.length} completed task${completed.length === 1 ? "" : "s"} and no pending tasks.`;
    }

    const titles =
        pending
            .slice(0, 5)
            .map(
                (task, index) =>
                    `${index + 1}. ${task.title}`
            )
            .join("; ");

    return `You have ${pending.length} pending task${pending.length === 1 ? "" : "s"}. ${titles}`;
}

function completeTaskByTitle(
    title
) {

    const normalized =
        title.toLowerCase().trim();

    const task =
        tasks.find(
            item =>
                !item.completed &&
                item.title
                    .toLowerCase()
                    .includes(normalized)
        );

    if (!task) {

        return `I couldn't find a pending task matching "${title}".`;
    }

    task.completed =
        true;

    stats.completed++;

    saveData(
        STORAGE_KEYS.tasks,
        tasks
    );

    saveData(
        STORAGE_KEYS.stats,
        stats
    );

    renderTasks();
    updateStats();
    updateMemory();

    addActivity(
        "Task completed",
        task.title,
        "fa-check"
    );

    return `Completed task: ${task.title}`;
}

function deleteTaskByTitle(
    title
) {

    const normalized =
        title.toLowerCase().trim();

    const index =
        tasks.findIndex(
            item =>
                item.title
                    .toLowerCase()
                    .includes(normalized)
        );

    if (index === -1) {

        return `I couldn't find a task matching "${title}".`;
    }

    const removed =
        tasks[index];

    tasks.splice(
        index,
        1
    );

    saveData(
        STORAGE_KEYS.tasks,
        tasks
    );

    renderTasks();
    updateStats();
    updateMemory();

    addActivity(
        "Task deleted",
        removed.title,
        "fa-trash"
    );

    return `Deleted task: ${removed.title}`;
}

function initializeTasks() {

    const addButton =
        safeElement(
            "#addTaskButton"
        );

    const saveButton =
        safeElement(
            "#saveTask"
        );

    if (addButton) {

        addButton.addEventListener(
            "click",
            () =>
                openModal(
                    "taskModal"
                )
        );
    }

    if (saveButton) {

        saveButton.addEventListener(
            "click",
            saveTaskFromModal
        );
    }
}

function saveTaskFromModal() {

    const input =
        safeElement(
            "#taskTitle"
        );

    if (!input)
        return;

    const title =
        input.value.trim();

    if (!title) {

        showToast(
            "Please enter a task."
        );

        return;
    }

    createTask(
        title
    );

    input.value = "";

    closeModal(
        "taskModal"
    );
}

function renderTasks() {

    const container =
        safeElement(
            "#tasksList"
        );

    if (!container)
        return;

    const pending =
        tasks.filter(
            task =>
                !task.completed
        );

    const summary =
        safeElement(
            "#taskSummary"
        );

    if (summary) {

        summary.textContent =
            pending.length;
    }

    if (!tasks.length) {

        container.innerHTML = `
            <div class="empty-state">
                <i class="fa-solid fa-list-check"></i>
                <p>Your task list is empty</p>
                <small>
                    Add your first task to get started.
                </small>
            </div>
        `;

        return;
    }

    container.innerHTML = "";

    tasks.forEach(task => {

        const item =
            document.createElement(
                "div"
            );

        item.className =
            `task-item ${
                task.completed
                    ? "completed"
                    : ""
            }`;

        item.innerHTML = `
            <button
                class="task-check ${
                    task.completed
                        ? "completed"
                        : ""
                }"
                data-task-check="${task.id}"
            >
                <i class="fa-solid fa-check"></i>
            </button>

            <div>
                <strong></strong>
                <small>
                    ${formatDate(
                        task.createdAt
                    )}
                </small>
            </div>

            <button
                class="delete-task"
                data-task-delete="${task.id}"
                title="Delete task"
            >
                <i class="fa-solid fa-trash"></i>
            </button>
        `;

        item
            .querySelector("strong")
            .textContent =
            task.title;

        container.appendChild(
            item
        );
    });

    $$("[data-task-check]")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    toggleTask(
                        Number(
                            button.dataset
                                .taskCheck
                        )
                    );
                }
            );
        });

    $$("[data-task-delete]")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    deleteTask(
                        Number(
                            button.dataset
                                .taskDelete
                        )
                    );
                }
            );
        });
}

function toggleTask(id) {

    const task =
        tasks.find(
            item =>
                item.id === id
        );

    if (!task)
        return;

    task.completed =
        !task.completed;

    if (task.completed) {

        stats.completed++;

        addActivity(
            "Task completed",
            task.title,
            "fa-check"
        );

        showToast(
            "Task completed."
        );
    }

    saveData(
        STORAGE_KEYS.tasks,
        tasks
    );

    saveData(
        STORAGE_KEYS.stats,
        stats
    );

    renderTasks();
    updateStats();
    updateMemory();
}

function deleteTask(id) {

    const task =
        tasks.find(
            item =>
                item.id === id
        );

    tasks =
        tasks.filter(
            item =>
                item.id !== id
        );

    saveData(
        STORAGE_KEYS.tasks,
        tasks
    );

    renderTasks();
    updateStats();
    updateMemory();

    if (task) {

        addActivity(
            "Task deleted",
            task.title,
            "fa-trash"
        );
    }

    showToast(
        "Task removed."
    );
}

/* =========================================================
   NOTES
========================================================= */

function initializeNotes() {

    const addButton =
        safeElement(
            "#addNoteButton"
        );

    const saveButton =
        safeElement(
            "#saveNote"
        );

    if (addButton) {

        addButton.addEventListener(
            "click",
            () =>
                openModal(
                    "noteModal"
                )
        );
    }

    if (saveButton) {

        saveButton.addEventListener(
            "click",
            saveNoteFromModal
        );
    }
}

function saveNoteFromModal() {

    const title =
        safeElement(
            "#noteTitle"
        );

    const content =
        safeElement(
            "#noteContent"
        );

    if (!title || !content)
        return;

    const titleValue =
        title.value.trim();

    const contentValue =
        content.value.trim();

    if (
        !titleValue ||
        !contentValue
    ) {

        showToast(
            "Please complete the note."
        );

        return;
    }

    createNote(
        titleValue,
        contentValue
    );

    title.value = "";
    content.value = "";

    closeModal(
        "noteModal"
    );
}

function createNote(
    title,
    content
) {

    const note = {

        id:
            Date.now(),

        title,

        content,

        createdAt:
            new Date().toISOString()
    };

    notes.unshift(
        note
    );

    saveData(
        STORAGE_KEYS.notes,
        notes
    );

    renderNotes();
    updateMemory();

    addActivity(
        "Note created",
        title,
        "fa-note-sticky"
    );

    showToast(
        "Note saved."
    );
}

function createQuickNote(
    content
) {

    createNote(
        "AURA Quick Note",
        content
    );
}

function renderNotes() {

    const container =
        safeElement(
            "#notesGrid"
        );

    if (!container)
        return;

    if (!notes.length) {

        container.innerHTML = `
            <div class="empty-state glass-card">
                <i class="fa-solid fa-note-sticky"></i>
                <p>No notes yet</p>
                <small>
                    Create a note and AURA will remember it.
                </small>
            </div>
        `;

        return;
    }

    container.innerHTML = "";

    notes.forEach(note => {

        const card =
            document.createElement(
                "article"
            );

        card.className =
            "note-card";

        card.innerHTML = `
            <button
                class="delete-note"
                data-note-delete="${note.id}"
            >
                <i class="fa-solid fa-trash"></i>
            </button>

            <span class="card-label">
                NOTE
            </span>

            <h3></h3>

            <p></p>

            <span class="note-date">
                ${formatDate(
                    note.createdAt
                )}
            </span>
        `;

        card
            .querySelector("h3")
            .textContent =
            note.title;

        card
            .querySelector("p")
            .textContent =
            note.content;

        container.appendChild(
            card
        );
    });

    $$("[data-note-delete]")
        .forEach(button => {

            button.addEventListener(
                "click",
                () =>
                    deleteNote(
                        Number(
                            button.dataset
                                .noteDelete
                        )
                    )
            );
        });
}

function deleteNote(id) {

    notes =
        notes.filter(
            note =>
                note.id !== id
        );

    saveData(
        STORAGE_KEYS.notes,
        notes
    );

    renderNotes();
    updateMemory();

    showToast(
        "Note deleted."
    );
}

/* =========================================================
   MEMORY ENGINE
========================================================= */

function saveMemory(
    text
) {

    const item = {

        id:
            Date.now(),

        text,

        createdAt:
            new Date().toISOString()
    };

    memory.unshift(
        item
    );

    if (memory.length > 100) {

        memory =
            memory.slice(
                0,
                100
            );
    }

    saveData(
        STORAGE_KEYS.memory,
        memory
    );

    updateMemory();

    addActivity(
        "Memory stored",
        text,
        "fa-brain"
    );

    showToast(
        "Memory stored."
    );
}

function getMemorySummary() {

    if (!memory.length) {

        return "AURA's personal memory is currently empty.";
    }

    const latest =
        memory
            .slice(0, 5)
            .map(
                (item, index) =>
                    `${index + 1}. ${item.text}`
            )
            .join("; ");

    return `I currently remember ${memory.length} item${memory.length === 1 ? "" : "s"}. Recent memory: ${latest}`;
}

function extractMemoryText(
    input
) {

    return String(input)
        .replace(
            /remember this/i,
            ""
        )
        .replace(
            /remember that/i,
            ""
        )
        .replace(
            /remember/i,
            ""
        )
        .replace(
            /^that/i,
            ""
        )
        .replace(
            /^[:\s-]+/,
            ""
        )
        .trim();
}

function updateMemory() {

    const total =
        tasks.length +
        notes.length +
        activity.length +
        memory.length;

    const memoryItems =
        safeElement(
            "#memoryItems"
        );

    const memoryPercent =
        safeElement(
            "#memoryPercent"
        );

    const memoryBar =
        safeElement(
            "#memoryBar"
        );

    if (memoryItems) {

        memoryItems.textContent =
            total;
    }

    const percent =
        Math.min(
            100,
            Math.round(
                (total / 150) *
                100
            )
        );

    if (memoryPercent) {

        memoryPercent.textContent =
            `${Math.max(
                1,
                percent
            )}%`;
    }

    if (memoryBar) {

        memoryBar.style.width =
            `${Math.max(
                1,
                percent
            )}%`;
    }
}

function initializeMemoryControls() {

    const reset =
        safeElement(
            "#resetMemory"
        );

    if (!reset)
        return;

    reset.addEventListener(
        "click",
        resetMemory
    );
}

function resetMemory() {

    const confirmed =
        confirm(
            "Reset all locally stored AURA memory?"
        );

    if (!confirmed)
        return;

    Object.values(
        STORAGE_KEYS
    ).forEach(
        key =>
            localStorage.removeItem(
                key
            )
    );

    tasks = [];
    notes = [];
    activity = [];
    history = [];
    memory = [];

    stats = {
        ...DEFAULT_STATS
    };

    settings = {
        ...DEFAULT_SETTINGS
    };

    renderTasks();
    renderNotes();
    renderActivity();

    updateStats();
    updateMemory();
    applySettings();

    showToast(
        "AURA memory has been reset."
    );
}

/* =========================================================
   ACTIVITY
========================================================= */

function addActivity(
    type,
    description,
    icon
) {

    const item = {

        id:
            Date.now(),

        type,

        description,

        icon,

        createdAt:
            new Date().toISOString()
    };

    activity.unshift(
        item
    );

    if (activity.length > 50) {

        activity =
            activity.slice(
                0,
                50
            );
    }

    saveData(
        STORAGE_KEYS.activity,
        activity
    );

    renderActivity();
    updateMemory();
}

function renderActivity() {

    const dashboard =
        safeElement(
            "#dashboardActivity"
        );

    const full =
        safeElement(
            "#fullActivityList"
        );

    if (!dashboard && !full)
        return;

    if (!activity.length) {

        const empty = `
            <div class="empty-state">
                <i class="fa-solid fa-satellite-dish"></i>
                <p>No activity yet</p>
                <small>
                    Give AURA your first command.
                </small>
            </div>
        `;

        if (dashboard)
            dashboard.innerHTML =
                empty;

        if (full)
            full.innerHTML =
                empty;

        return;
    }

    if (dashboard) {

        dashboard.innerHTML =
            activity
                .slice(0, 5)
                .map(
                    activityHTML
                )
                .join("");
    }

    if (full) {

        full.innerHTML =
            activity
                .map(
                    activityHTML
                )
                .join("");
    }
}

function activityHTML(
    item
) {

    return `
        <div class="activity-item">

            <div class="activity-icon">
                <i class="fa-solid ${
                    escapeHTML(
                        item.icon
                    )
                }"></i>
            </div>

            <div>

                <strong>
                    ${escapeHTML(
                        item.type
                    )}
                </strong>

                <span>
                    ${escapeHTML(
                        item.description
                    )}
                </span>

            </div>

            <time>
                ${relativeTime(
                    item.createdAt
                )}
            </time>

        </div>
    `;
}

function initializeGlobalControls() {

    const clear =
        safeElement(
            "#clearActivity"
        );

    if (!clear)
        return;

    clear.addEventListener(
        "click",
        () => {

            activity = [];

            saveData(
                STORAGE_KEYS.activity,
                activity
            );

            renderActivity();
            updateMemory();

            showToast(
                "Activity history cleared."
            );
        }
    );
}

/* =========================================================
   HISTORY
========================================================= */

function addToHistory(
    command
) {

    history.unshift({

        id:
            Date.now(),

        command,

        createdAt:
            new Date().toISOString()
    });

    if (history.length > 100) {

        history =
            history.slice(
                0,
                100
            );
    }

    saveData(
        STORAGE_KEYS.history,
        history
    );
}

/* =========================================================
   COMMAND CONSOLE
========================================================= */

function initializeCommandConsole() {

    const execute =
        safeElement(
            "#executeCommand"
        );

    const input =
        safeElement(
            "#commandInput"
        );

    if (execute) {

        execute.addEventListener(
            "click",
            executeConsoleCommand
        );
    }

    if (input) {

        input.addEventListener(
            "keydown",
            event => {

                if (
                    event.key === "Enter"
                ) {

                    event.preventDefault();

                    executeConsoleCommand();
                }
            }
        );
    }
}

function executeConsoleCommand() {

    const input =
        safeElement(
            "#commandInput"
        );

    if (!input)
        return;

    const command =
        input.value.trim();

    if (!command)
        return;

    addConsoleLine(
        "USER",
        command,
        "user-line"
    );

    input.value = "";

    executeCommand(
        command
    );
}

function addConsoleLine(
    label,
    text,
    className = ""
) {

    const output =
        safeElement(
            "#consoleOutput"
        );

    if (!output)
        return;

    const line =
        document.createElement(
            "div"
        );

    line.className =
        `console-line ${className}`;

    line.innerHTML = `
        <span>
            ${escapeHTML(
                label
            )}://
        </span>

        <p></p>
    `;

    line
        .querySelector("p")
        .textContent =
        text;

    output.appendChild(
        line
    );

    output.scrollTop =
        output.scrollHeight;
}

async function executeCommand(command) {

    if (!command || !command.trim()) {
        return;
    }

    command = command.trim();

    addToHistory(command);

    setAURAState(
        "PROCESSING",
        "AURA is thinking..."
    );

    addConsoleLine(
        "CMD",
        command,
        "user-line"
    );

    try {

        const response = await fetch(
            "http://localhost:5000/api/command",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    command: command
                })
            }
        );

        if (!response.ok) {
            throw new Error(
                `Server returned ${response.status}`
            );
        }

        const data =
            await response.json();

        const answer =
            data.response ||
            "AURA received the command but returned no response.";

        addConsoleLine(
            "AURA",
            answer,
            "result-line"
        );

        setAURAState(
            "READY",
            answer
        );

        speak(answer);

    } catch (error) {

        console.error(
            "AURA backend error:",
            error
        );

        const message =
            "I can't connect to the AURA backend. Make sure the server is running at localhost:5000.";

        addConsoleLine(
            "AURA",
            message,
            "result-line"
        );

        setAURAState(
            "READY",
            "Backend connection failed"
        );

        showToast(
            "AURA backend connection failed."
        );
    }
}

/* =========================================================
   VOICE RECOGNITION
========================================================= */

function initializeVoiceRecognition() {

    const SpeechRecognition =
        window.SpeechRecognition ||
        window.webkitSpeechRecognition;

    const voiceButton =
        safeElement(
            "#voiceButton"
        );

    const chatVoiceButton =
        safeElement(
            "#chatVoiceButton"
        );

    if (!SpeechRecognition) {

        console.warn(
            "Speech Recognition is not supported."
        );

        if (voiceButton) {

            voiceButton.disabled =
                true;

            voiceButton.title =
                "Voice recognition is not supported by this browser.";
        }

        if (chatVoiceButton) {

            chatVoiceButton.disabled =
                true;

            chatVoiceButton.title =
                "Voice recognition is not supported by this browser.";
        }

        return;
    }

    recognition =
        new SpeechRecognition();

    recognition.continuous =
        false;

    recognition.interimResults =
        false;

    recognition.lang =
        "en-US";

    recognition.maxAlternatives =
        1;

    recognition.onstart =
        () => {

            isListening =
                true;

            stats.voice++;

            saveData(
                STORAGE_KEYS.stats,
                stats
            );

            updateStats();

            setAURAState(
                "LISTENING",
                "I'm listening..."
            );

            if (voiceButton) {

                voiceButton.classList.add(
                    "listening"
                );

                const text =
                    voiceButton.querySelector(
                        "span"
                    );

                if (text) {

                    text.textContent =
                        "Listening...";
                }
            }
        };

    recognition.onresult =
        event => {

            const transcript =
                event
                    .results[0][0]
                    .transcript
                    .trim();

            if (!transcript) {

                showToast(
                    "I didn't hear anything."
                );

                return;
            }

            const input =
                safeElement(
                    "#chatInput"
                );

            if (input) {

                input.value =
                    transcript;
            }

            addMessage(
                "user",
                transcript
            );

            setAURAState(
                "THINKING",
                "Processing your voice command..."
            );

            const response =
                processCommand(
                    transcript
                );

            setTimeout(
                () => {

                    addMessage(
                        "assistant",
                        response
                    );

                    setAURAState(
                        "READY",
                        "Awaiting your next command"
                    );

                    speak(
                        response
                    );

                },
                400
            );
        };

    recognition.onerror =
        event => {

            console.error(
                "AURA Voice Error:",
                event.error
            );

            let message =
                "Voice recognition failed.";

            switch (
                event.error
            ) {

                case "not-allowed":

                    message =
                        "Microphone permission was denied. Please allow microphone access for AURA.";

                    break;

                case "audio-capture":

                    message =
                        "No microphone was detected.";

                    break;

                case "no-speech":

                    message =
                        "I didn't hear anything. Please try again.";

                    break;

                case "network":

                    message =
                        "Voice recognition needs a network connection in this browser.";

                    break;

                case "aborted":

                    message =
                        "Voice recognition was stopped.";

                    break;
            }

            showToast(
                message
            );

            setAURAState(
                "READY",
                "Voice system ready"
            );
        };

    recognition.onend =
        () => {

            isListening =
                false;

            setAURAState(
                "READY",
                "Awaiting your next command"
            );

            if (voiceButton) {

                voiceButton.classList.remove(
                    "listening"
                );

                const text =
                    voiceButton.querySelector(
                        "span"
                    );

                if (text) {

                    text.textContent =
                        "Talk to AURA";
                }
            }
        };

    if (voiceButton) {

        voiceButton.addEventListener(
            "click",
            toggleVoice
        );
    }

    if (chatVoiceButton) {

        chatVoiceButton.addEventListener(
            "click",
            toggleVoice
        );
    }
}

function toggleVoice() {

    if (!recognition) {

        showToast(
            "Voice recognition is not available in this browser."
        );

        return;
    }

    if (isListening) {

        recognition.stop();

        return;
    }

    try {

        recognition.start();

    } catch (error) {

        console.warn(
            "AURA voice start error:",
            error
        );

        showToast(
            "Voice is already starting. Please try again."
        );
    }
}

/* =========================================================
   TEXT TO SPEECH
========================================================= */

function speak(
    text
) {

    if (!settings.voice)
        return;

    if (
        !("speechSynthesis" in window)
    ) {
        return;
    }

    window.speechSynthesis.cancel();

    const utterance =
        new SpeechSynthesisUtterance(
            String(text)
        );

    utterance.rate =
        1;

    utterance.pitch =
        1;

    utterance.volume =
        0.9;

    window.speechSynthesis.speak(
        utterance
    );
}

/* =========================================================
   AURA STATE
========================================================= */

function setAURAState(
    state,
    message
) {

    const coreState =
        safeElement(
            "#coreState"
        );

    const coreMessage =
        safeElement(
            "#coreMessage"
        );

    const core =
        $(".core");

    if (coreState) {

        coreState.textContent =
            state;
    }

    if (coreMessage) {

        coreMessage.textContent =
            message;
    }

    if (!core)
        return;

    core.classList.remove(
        "state-listening",
        "state-thinking"
    );

    if (
        state === "LISTENING"
    ) {

        core.classList.add(
            "state-listening"
        );
    }

    if (
        state === "THINKING" ||
        state === "PROCESSING"
    ) {

        core.classList.add(
            "state-thinking"
        );
    }
}

/* =========================================================
   TIMER
========================================================= */

function extractMinutes(
    text
) {

    const match =
        String(text).match(
            /(\d+(?:\.\d+)?)\s*(minute|minutes|min|mins)/i
        );

    if (!match)
        return null;

    return Math.max(
        1,
        Math.round(
            Number(
                match[1]
            )
        )
    );
}

function startTimer(
    minutes = 25
) {

    clearInterval(
        timerInterval
    );

    timerSeconds =
        minutes * 60;

    timerRunning =
        true;

    const widget =
        safeElement(
            "#timerWidget"
        );

    if (widget) {

        widget.classList.add(
            "show"
        );
    }

    updateTimerDisplay();

    timerInterval =
        setInterval(
            () => {

                if (!timerRunning)
                    return;

                timerSeconds--;

                updateTimerDisplay();

                if (
                    timerSeconds <= 0
                ) {

                    clearInterval(
                        timerInterval
                    );

                    timerRunning =
                        false;

                    showToast(
                        "AURA timer completed."
                    );

                    speak(
                        "Your timer is complete."
                    );

                    const display =
                        safeElement(
                            "#timerDisplay"
                        );

                    if (display) {

                        display.textContent =
                            "00:00";
                    }
                }

            },
            1000
        );
}

function updateTimerDisplay() {

    const display =
        safeElement(
            "#timerDisplay"
        );

    if (!display)
        return;

    const minutes =
        Math.floor(
            timerSeconds / 60
        );

    const seconds =
        timerSeconds % 60;

    display.textContent =
        `${String(
            minutes
        ).padStart(
            2,
            "0"
        )}:${String(
            seconds
        ).padStart(
            2,
            "0"
        )}`;
}

function resetTimer() {

    clearInterval(
        timerInterval
    );

    timerRunning =
        false;

    timerSeconds =
        0;

    updateTimerDisplay();

    const widget =
        safeElement(
            "#timerWidget"
        );

    if (widget) {

        widget.classList.remove(
            "show"
        );
    }
}

function initializeTimerControls() {

    const pause =
        safeElement(
            "#pauseTimer"
        );

    const reset =
        safeElement(
            "#resetTimer"
        );

    const close =
        safeElement(
            "#closeTimer"
        );

    if (pause) {

        pause.addEventListener(
            "click",
            () => {

                timerRunning =
                    !timerRunning;

                pause.innerHTML =
                    timerRunning
                        ? `<i class="fa-solid fa-pause"></i>`
                        : `<i class="fa-solid fa-play"></i>`;
            }
        );
    }

    if (reset) {

        reset.addEventListener(
            "click",
            resetTimer
        );
    }

    if (close) {

        close.addEventListener(
            "click",
            () => {

                clearInterval(
                    timerInterval
                );

                timerRunning =
                    false;

                const widget =
                    safeElement(
                        "#timerWidget"
                    );

                if (widget) {

                    widget.classList.remove(
                        "show"
                    );
                }
            }
        );
    }
}

/* =========================================================
   SETTINGS
========================================================= */

function initializeSettings() {

    const voice =
        safeElement(
            "#voiceSetting"
        );

    const animation =
        safeElement(
            "#animationSetting"
        );

    const notification =
        safeElement(
            "#notificationSetting"
        );

    const focus =
        safeElement(
            "#focusSetting"
        );

    if (voice)
        voice.checked =
            settings.voice;

    if (animation)
        animation.checked =
            settings.animations;

    if (notification)
        notification.checked =
            settings.notifications;

    if (focus)
        focus.checked =
            settings.focus;

    [
        voice,
        animation,
        notification,
        focus
    ].forEach(element => {

        if (element) {

            element.addEventListener(
                "change",
                saveSettings
            );
        }
    });

    applySettings();
}

function saveSettings() {

    const voice =
        safeElement(
            "#voiceSetting"
        );

    const animation =
        safeElement(
            "#animationSetting"
        );

    const notification =
        safeElement(
            "#notificationSetting"
        );

    const focus =
        safeElement(
            "#focusSetting"
        );

    settings = {

        voice:
            voice
                ? voice.checked
                : settings.voice,

        animations:
            animation
                ? animation.checked
                : settings.animations,

        notifications:
            notification
                ? notification.checked
                : settings.notifications,

        focus:
            focus
                ? focus.checked
                : settings.focus,

        theme:
            settings.theme ||
            "dark"
    };

    saveData(
        STORAGE_KEYS.settings,
        settings
    );

    applySettings();

    showToast(
        "Settings updated."
    );
}

function applySettings() {

    document.body.classList.toggle(
        "focus-mode",
        settings.focus
    );

    document.body.classList.toggle(
        "reduced-motion",
        !settings.animations
    );

    document.body.classList.toggle(
        "light-theme",
        settings.theme === "light"
    );
}

function toggleFocusMode(
    enabled
) {

    settings.focus =
        enabled;

    const focus =
        safeElement(
            "#focusSetting"
        );

    if (focus) {

        focus.checked =
            enabled;
    }

    saveData(
        STORAGE_KEYS.settings,
        settings
    );

    applySettings();
}

function setTheme(
    theme
) {

    settings.theme =
        theme;

    saveData(
        STORAGE_KEYS.settings,
        settings
    );

    applySettings();
}

/* =========================================================
   STATS
========================================================= */

function updateStats() {

    const pending =
        tasks.filter(
            task =>
                !task.completed
        ).length;

    const commandCount =
        safeElement(
            "#commandCount"
        );

    const taskCount =
        safeElement(
            "#taskCount"
        );

    const completedCount =
        safeElement(
            "#completedCount"
        );

    const voiceCount =
        safeElement(
            "#voiceCount"
        );

    const taskBadge =
        safeElement(
            "#taskBadge"
        );

    const progressPercent =
        safeElement(
            "#progressPercent"
        );

    if (commandCount)
        commandCount.textContent =
            stats.commands;

    if (taskCount)
        taskCount.textContent =
            pending;

    if (completedCount)
        completedCount.textContent =
            stats.completed;

    if (voiceCount)
        voiceCount.textContent =
            stats.voice;

    if (taskBadge)
        taskBadge.textContent =
            pending;

    const total =
        tasks.length;

    const percent =
        total === 0
            ? 0
            : Math.round(
                ((total - pending) /
                    total) *
                100
            );

    if (progressPercent) {

        progressPercent.textContent =
            `${percent}%`;
    }

    const circle =
        $(".progress-circle");

    if (circle) {

        circle.style.background = `
            radial-gradient(
                circle,
                var(--panel-solid) 57%,
                transparent 58%
            ),
            conic-gradient(
                var(--primary)
                ${percent * 3.6}deg,
                rgba(255,255,255,.05)
                ${percent * 3.6}deg
            )
        `;
    }
}

/* =========================================================
   REPORTS
========================================================= */

function generateSystemReport() {

    const pending =
        tasks.filter(
            task =>
                !task.completed
        ).length;

    return [
        "AURA SYSTEM REPORT",
        "Status: ONLINE",
        `Commands processed: ${stats.commands}`,
        `Voice commands: ${stats.voice}`,
        `Pending tasks: ${pending}`,
        `Completed tasks: ${stats.completed}`,
        `Notes stored: ${notes.length}`,
        `Memory records: ${memory.length}`,
        `Activity records: ${activity.length}`,
        `Theme: ${settings.theme}`,
        `Voice: ${
            settings.voice
                ? "enabled"
                : "disabled"
        }`,
        `Animations: ${
            settings.animations
                ? "enabled"
                : "reduced"
        }`,
        `Focus mode: ${
            settings.focus
                ? "active"
                : "inactive"
        }`
    ].join(" • ");
}

function generateProductivityReport() {

    const total =
        tasks.length;

    const completed =
        tasks.filter(
            task =>
                task.completed
        ).length;

    const pending =
        total -
        completed;

    const percentage =
        total
            ? Math.round(
                (completed /
                    total) *
                100
            )
            : 0;

    return `Productivity report: ${completed} completed, ${pending} pending, with a ${percentage}% completion rate. You have ${notes.length} stored notes and ${memory.length} memory records.`;
}

function generateHelpResponse() {

    return [
        "AURA can handle:",
        "natural language commands",
        "time and date",
        "web searches",
        "Google searches",
        "website launching",
        "YouTube",
        "music searches",
        "calculations",
        "tasks",
        "task completion",
        "task deletion",
        "notes",
        "memory",
        "timers",
        "focus mode",
        "dark and light themes",
        "system reports",
        "productivity reports",
        "voice commands",
        "conversation management",
        "dashboard navigation",
        "settings navigation"
    ].join(" • ");
}

/* =========================================================
   FALLBACK
========================================================= */

function generateFallbackResponse(
    input
) {

    const responses = [

        `I understood your request as "${input}", but I don't yet have a tool connected for that action. I can currently handle web searches, websites, music searches, calculations, tasks, notes, memory, timers and system commands.`,

        `I received "${input}". I'm ready to handle it, but that capability requires another tool or backend connection. Try asking me to search, play music on YouTube, create a task, make a note, remember something, calculate something, or open a website.`,

        `Command recognized, Ammar. I need a more specific action to perform that request.`

    ];

    return randomResponse(
        responses
    );
}

/* =========================================================
   CLEAR CHAT
========================================================= */

function clearChat() {

    const messages =
        safeElement(
            "#messages"
        );

    if (!messages)
        return;

    messages.innerHTML = "";

    addMessage(
        "assistant",
        "Conversation cleared. AURA is ready."
    );
}

/* =========================================================
   MODALS
========================================================= */

function openModal(
    id
) {

    const modal =
        document.getElementById(
            id
        );

    if (!modal)
        return;

    modal.classList.add(
        "show"
    );
}

function closeModal(
    id
) {

    const modal =
        document.getElementById(
            id
        );

    if (!modal)
        return;

    modal.classList.remove(
        "show"
    );
}

function initializeModals() {

    $$("[data-close-modal]")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    closeModal(
                        button.dataset
                            .closeModal
                    );
                }
            );
        });

    $$(".modal-overlay")
        .forEach(overlay => {

            overlay.addEventListener(
                "click",
                event => {

                    if (
                        event.target ===
                        overlay
                    ) {

                        overlay.classList.remove(
                            "show"
                        );
                    }
                }
            );
        });
}

/* =========================================================
   FULLSCREEN
========================================================= */

function initializeFullscreen() {

    const button =
        safeElement(
            "#fullscreenButton"
        );

    if (!button)
        return;

    button.addEventListener(
        "click",
        async () => {

            try {

                if (
                    !document.fullscreenElement
                ) {

                    await document
                        .documentElement
                        .requestFullscreen();

                    button.innerHTML =
                        `<i class="fa-solid fa-compress"></i>`;

                } else {

                    await document
                        .exitFullscreen();

                    button.innerHTML =
                        `<i class="fa-solid fa-expand"></i>`;
                }

            } catch {

                showToast(
                    "Fullscreen permission was unavailable."
                );
            }
        }
    );
}

/* =========================================================
   MOBILE MENU
========================================================= */

function initializeMobileMenu() {

    const button =
        safeElement(
            "#mobileMenu"
        );

    if (!button)
        return;

    button.addEventListener(
        "click",
        () => {

            document.body.classList.toggle(
                "sidebar-open"
            );
        }
    );
}

/* =========================================================
   SEARCH BUTTON
========================================================= */

function initializeSearch() {

    const button =
        safeElement(
            "#searchButton"
        );

    if (!button)
        return;

    button.addEventListener(
        "click",
        () => {

            const query =
                prompt(
                    "What would you like to search for?"
                );

            if (
                !query ||
                !query.trim()
            ) {
                return;
            }

            searchWeb(
                query.trim()
            );

            showToast(
                `Searching for "${query.trim()}"`
            );
        }
    );
}

/* =========================================================
   NOTIFICATIONS
========================================================= */

function initializeNotifications() {

    const button =
        safeElement(
            "#notificationButton"
        );

    if (!button)
        return;

    button.addEventListener(
        "click",
        () => {

            showToast(
                activity.length
                    ? `AURA has ${activity.length} recorded activities.`
                    : "AURA has no new notifications."
            );
        }
    );
}

/* =========================================================
   KEYBOARD SHORTCUTS
========================================================= */

function initializeKeyboardShortcuts() {

    document.addEventListener(
        "keydown",
        event => {

            if (
                (event.ctrlKey ||
                    event.metaKey) &&
                event.key.toLowerCase() ===
                    "k"
            ) {

                event.preventDefault();

                navigateTo(
                    "commands"
                );

                setTimeout(
                    () => {

                        const input =
                            safeElement(
                                "#commandInput"
                            );

                        if (input) {
                            input.focus();
                        }

                    },
                    100
                );
            }

            if (
                event.key ===
                "Escape"
            ) {

                $$(".modal-overlay.show")
                    .forEach(
                        modal =>
                            modal.classList.remove(
                                "show"
                            )
                    );
            }
        }
    );
}

/* =========================================================
   UTILITIES
========================================================= */

function extractAfterPhrase(
    input,
    phrases
) {

    const lower =
        String(input)
            .toLowerCase();

    for (
        const phrase of phrases
    ) {

        const index =
            lower.indexOf(
                phrase
            );

        if (index !== -1) {

            return String(input)
                .slice(
                    index +
                    phrase.length
                )
                .replace(
                    /^[:\s-]+/,
                    ""
                )
                .trim();
        }
    }

    return "";
}

function showToast(
    message
) {

    if (
        settings &&
        settings.notifications === false
    ) {
        return;
    }

    const container =
        safeElement(
            "#toastContainer"
        );

    if (!container)
        return;

    const toast =
        document.createElement(
            "div"
        );

    toast.className =
        "toast";

    toast.innerHTML = `
        <i class="fa-solid fa-sparkles"></i>
        <span></span>
    `;

    toast
        .querySelector("span")
        .textContent =
        message;

    container.appendChild(
        toast
    );

    setTimeout(
        () =>
            toast.remove(),
        3600
    );
}

function getTime() {

    return new Date()
        .toLocaleTimeString(
            [],
            {
                hour: "2-digit",
                minute: "2-digit"
            }
        );
}

function formatDate(
    date
) {

    return new Date(
        date
    ).toLocaleDateString(
        [],
        {
            day: "numeric",
            month: "short",
            year: "numeric"
        }
    );
}

function relativeTime(
    date
) {

    const difference =
        Date.now() -
        new Date(date).getTime();

    const seconds =
        Math.floor(
            difference / 1000
        );

    if (
        seconds < 10
    ) {
        return "now";
    }

    if (
        seconds < 60
    ) {
        return `${seconds}s`;
    }

    const minutes =
        Math.floor(
            seconds / 60
        );

    if (
        minutes < 60
    ) {
        return `${minutes}m`;
    }

    const hours =
        Math.floor(
            minutes / 60
        );

    if (
        hours < 24
    ) {
        return `${hours}h`;
    }

    const days =
        Math.floor(
            hours / 24
        );

    return `${days}d`;
}

function randomResponse(
    responses
) {

    return responses[
        Math.floor(
            Math.random() *
            responses.length
        )
    ];
}

function escapeHTML(
    value
) {

    return String(value)
        .replaceAll(
            "&",
            "&amp;"
        )
        .replaceAll(
            "<",
            "&lt;"
        )
        .replaceAll(
            ">",
            "&gt;"
        )
        .replaceAll(
            '"',
            "&quot;"
        )
        .replaceAll(
            "'",
            "&#039;"
        );
}

/* =========================================================
   GLOBAL ERROR PROTECTION
========================================================= */

window.addEventListener(
    "error",
    event => {

        console.error(
            "AURA runtime error:",
            event.error ||
            event.message
        );
    }
);

window.addEventListener(
    "unhandledrejection",
    event => {

        console.error(
            "AURA promise error:",
            event.reason
        );
    }
);

/* =========================================================
   READY
========================================================= */

console.log(
    "%c AURA PRO v3 ONLINE ",
    "background:#00e5ff;color:#05070a;font-weight:bold;padding:6px 12px;border-radius:6px;"
);

console.log(
    "%c Ammar's Universal Responsive Assistant ",
    "color:#00e5ff;font-weight:bold;"
);

console.log(
    "%c Natural-language command engine initialized.",
    "color:#00e5ff;"
);
/* =========================================================
   AURA BACKEND CONNECTION
========================================================= */
async function sendToAURABackend(command) {
    try {
        const response = await fetch(
            "http://localhost:5000/api/command",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    command: command
                })
            }
        );

        const text = await response.text();

        console.log("AURA BACKEND STATUS:", response.status);
        console.log("AURA BACKEND RESPONSE:", text);

        let data;

        try {
            data = JSON.parse(text);
        } catch (error) {
            throw new Error(
                "Backend returned invalid JSON: " + text
            );
        }

        if (!response.ok) {
            throw new Error(
                data.error ||
                data.message ||
                "Backend returned HTTP " + response.status
            );
        }

        if (data.success === true) {
            return data.response || "AURA received your command.";
        }

        throw new Error(
            data.message || "AURA command failed."
        );

    } catch (error) {

        console.error(
            "AURA BACKEND CONNECTION ERROR:",
            error
        );

        return "AURA backend error: " + error.message;
    }
}