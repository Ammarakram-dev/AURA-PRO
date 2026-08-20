"use strict";

const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { exec } = require("child_process");
const OpenAI = require("openai");

const app = express();
const PORT = process.env.PORT || 5000;

const client = process.env.OPENAI_API_KEY
    ? new OpenAI({
        apiKey: process.env.OPENAI_API_KEY.trim()
    })
    : null;

app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

/* =========================================================
   STATUS
========================================================= */

app.get("/", (req, res) => {
    res.json({
        success: true,
        assistant: "AURA",
        status: "online"
    });
});

app.get("/api/status", (req, res) => {
    res.json({
        success: true,
        assistant: "AURA",
        name: "Ammar's Universal Responsive Assistant",
        status: "online",
        server: "Node.js + Express",
        ai: client ? "configured" : "not configured",
        time: new Date().toISOString()
    });
});

app.get("/api/health", (req, res) => {
    res.json({
        success: true,
        message: "AURA backend is healthy.",
        uptime: process.uptime()
    });
});

/* =========================================================
   COMMAND API
========================================================= */

app.post("/api/command", async (req, res) => {

    const command =
        typeof req.body?.command === "string"
            ? req.body.command.trim()
            : "";

    if (!command) {
        return res.status(400).json({
            success: false,
            message: "Please provide a command."
        });
    }

    console.log("AURA COMMAND:", command);

    /* ---------------------------------------------------------
       LOCAL AURA COMMANDS
    --------------------------------------------------------- */
if (command.toLowerCase().trim() === "open youtube") {
    exec('start "" "https://www.youtube.com"');

    return res.json({
        success: true,
        command: command,
        response: "Opening YouTube.",
        source: "AURA-Action"
    });
}
    const local = localCommand(command);

    if (local) {
        return res.json({
            success: true,
            command: command,
            response: local,
            source: "AURA",
            timestamp: new Date().toISOString()
        });
    }

    /* ---------------------------------------------------------
       OPENAI
    --------------------------------------------------------- */

    if (client) {

        try {

            const completion =
                await client.chat.completions.create({
                    model: "gpt-4o-mini",
                    messages: [
                        {
                            role: "system",
                            content:
                                "You are AURA, Ammar's Universal Responsive Assistant. " +
                                "Be intelligent, friendly, practical and helpful. " +
                                "Answer naturally. Help with programming, software engineering, " +
                                "AI, web development, Android development, databases, study, " +
                                "projects, productivity and general questions. " +
                                "Never reveal API keys or private system information."
                        },
                        {
                            role: "user",
                            content: command
                        }
                    ],
                    temperature: 0.7,
                    max_tokens: 1200
                });

            const answer =
                completion.choices?.[0]?.message?.content;

            if (answer) {
                return res.json({
                    success: true,
                    command: command,
                    response: answer,
                    source: "OpenAI",
                    timestamp: new Date().toISOString()
                });
            }

        } catch (error) {

            console.error("OPENAI ERROR:", error.message);

            /*
             IMPORTANT:
             Do not destroy AURA if OpenAI is unavailable.
             Give the user a useful response instead.
            */

            return res.json({
                success: true,
                command: command,
                response:
                    "AURA received your command, but the AI service is temporarily unavailable. " +
                    "Your AURA backend is working correctly.",
                source: "AURA-Fallback",
                aiError: error.status || 500,
                timestamp: new Date().toISOString()
            });
        }
    }

    /* ---------------------------------------------------------
       GENERAL FALLBACK
    --------------------------------------------------------- */

    return res.json({
        success: true,
        command: command,
        response:
            `AURA received: "${command}". The backend is online and ready.`,
        source: "AURA-Fallback",
        timestamp: new Date().toISOString()
    });
});

/* =========================================================
   LOCAL COMMAND ENGINE
========================================================= */

function localCommand(command) {

    const text = command.toLowerCase().trim();

    // GREETINGS
    if (
        text === "hello" ||
        text === "hi" ||
        text === "hey" ||
        text === "hello aura" ||
        text === "hi aura" ||
        text === "hey aura"
    ) {
        return "Hello Ammar! AURA is online and ready. What would you like me to do?";
    }

    // STATUS
    if (
        text === "status" ||
        text.includes("are you online") ||
        text.includes("system status")
    ) {
        return "AURA is fully online. Frontend, Node.js backend and command service are connected.";
    }

    // TIME
    if (
        text === "time" ||
        text.includes("what time")
    ) {
        return `The current time is ${new Date().toLocaleTimeString()}.`;
    }

    // DATE
    if (
        text === "date" ||
        text.includes("what date")
    ) {
        return `Today is ${new Date().toLocaleDateString([], {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric"
        })}.`;
    }

    // OPEN YOUTUBE
    if (
        text === "open youtube" ||
        text === "youtube"
    ) {
        exec("start https://www.youtube.com");
        return "Opening YouTube.";
    }

    // OPEN GOOGLE
    if (
        text === "open google" ||
        text === "google"
    ) {
        exec("start https://www.google.com");
        return "Opening Google.";
    }

    // OPEN GITHUB
    if (
        text === "open github" ||
        text === "github"
    ) {
        exec("start https://github.com");
        return "Opening GitHub.";
    }

    // OPEN LINKEDIN
    if (
        text === "open linkedin" ||
        text === "linkedin"
    ) {
        exec("start https://www.linkedin.com");
        return "Opening LinkedIn.";
    }

    // OPEN PORTFOLIO
    if (
        text.includes("open my portfolio") ||
        text.includes("open portfolio")
    ) {
        exec("start https://ammarakram-dev.github.io/portfolio/");
        return "Opening your portfolio.";
    }

    // PLAY MUSIC / MUSIC
    if (
        text === "play music" ||
        text === "play some music" ||
        text === "music"
    ) {
        exec("start https://www.youtube.com/results?search_query=music");
        return "Opening music on YouTube.";
    }

    // SEARCH GOOGLE
    if (
        text.startsWith("search google for ")
    ) {
        const query = command
            .substring(18)
            .trim();

        if (query) {
            const url =
                "https://www.google.com/search?q=" +
                encodeURIComponent(query);

            exec(`start "" "${url}"`);

            return `Searching Google for "${query}".`;
        }
    }

    // SEARCH YOUTUBE
    if (
        text.startsWith("search youtube for ")
    ) {
        const query = command
            .substring(19)
            .trim();

        if (query) {
            const url =
                "https://www.youtube.com/results?search_query=" +
                encodeURIComponent(query);

            exec(`start "" "${url}"`);

            return `Searching YouTube for "${query}".`;
        }
    }

    // OPEN WEBSITE
    if (text.startsWith("open https://")) {

        const url = command
            .substring(5)
            .trim();

        exec(`start "" "${url}"`);

        return "Opening the requested website.";
    }

    // CALCULATOR
    if (
        text.startsWith("calculate ") ||
        text.startsWith("calc ")
    ) {

        const expression = command
            .replace(/^calculate\s+/i, "")
            .replace(/^calc\s+/i, "")
            .trim();

        try {

            if (!/^[0-9+\-*/().%\s]+$/.test(expression)) {
                return "I can only calculate basic mathematical expressions.";
            }

            const result = Function(
                `"use strict"; return (${expression})`
            )();

            return `${expression} = ${result}`;

        } catch (error) {
            return "I could not calculate that expression.";
        }
    }

    // HELP
    if (
        text === "help" ||
        text.includes("what can you do")
    ) {
        return "I can open YouTube, Google, GitHub, LinkedIn and your portfolio, search Google or YouTube, play music through YouTube, calculate expressions, tell the time and date, and answer general questions.";
    }

    // WHO ARE YOU
    if (text.includes("who are you")) {
        return "I am AURA — Ammar's Universal Responsive Assistant.";
    }

    return null;
}
/* =========================================================
   ERROR HANDLER
========================================================= */

app.use((err, req, res, next) => {

    console.error("AURA SERVER ERROR:", err);

    res.status(500).json({
        success: false,
        message: "AURA backend encountered an internal error."
    });
});

/* =========================================================
   START
========================================================= */

app.listen(PORT, () => {

    console.log("");
    console.log("==========================================");
    console.log("              AURA PRO");
    console.log("==========================================");
    console.log("Ammar's Universal Responsive Assistant");
    console.log("");
    console.log(`Backend: http://localhost:${PORT}`);
    console.log(`Status:  http://localhost:${PORT}/api/status`);
    console.log(`Health:  http://localhost:${PORT}/api/health`);
    console.log("");
    console.log("AURA backend is ONLINE.");
    console.log("==========================================");
    console.log("");

});