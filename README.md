# Candidate Name: Meenakshi Prabhakar
# Video Link: https://youtu.be/TL5p6rp3Z6s
## Scenario Chosen: Scenario 2: Skill-Bridge Career Navigator
## Estimated Time Spent: 5.5 hrs


### Quick Start:
## Prerequisites:

Node.js v18+
npm
An Anthropic API key (get one at console.anthropic.com — app works without it via rule-based fallback)


## Run Commands

```bash
# Clone and install
git clone 

# Terminal 1 — Server
cd server
npm install
cp .env.example .env        # add your ANTHROPIC_API_KEY
npm run dev                 # runs on http://localhost:3001

# Terminal 2 — Client
cd client
npm install
npm run dev                 # runs on http://localhost:5173
```

## Test Commands

```bash
cd server
npm test      
```

---



### AI Disclosure

**Did you use an AI assistant (Copilot, ChatGPT, etc.)?** Yes — Claude (Anthropic). I used it mainly for the UI components (automating aspects like cards), as well as to generate some edge cases. I also used it to help generate more synthetic data based on examples I gave, as well as debugging.

**How did you verify the suggestions?**
I ran the server and manually tested each route using the UI and by inspecting network responses in the browser and terminal. I read every code suggestion before accepting it and ran the full test suite after each major change to confirm nothing regressed. For the resume parser specifically, I uploaded a real PDF containing my actual resume, and verified the extracted skills matched what was actually in the document. For UI components I could visually verify if it matched up to what I intended and made edits accordingly. 

**One example of a suggestion I rejected or changed:**
One example of a suggestion I rejected or changed:
The initial UI for the GitHub import feature was a text parser — it asked users to paste their profile info in a specific format (Name, Languages, etc.) and extracted skills from that. I rejected it because it required users to manually reformat data they already had on GitHub, which defeated the purpose. I replaced it with a real GitHub API call that takes just a username, scans the user's public repositories, and automatically maps languages and repo topics to skills without needing manual formatting. I changed the UI to just be an input text entry where users put their GitHub username. 

---


### Tradeoffs & Prioritization

**What did you cut to stay within the 4–6 hour limit?**
- **Persistent storage** — profiles are stored in an in-memory Map and reset when the server restarts. A production version would use PostgreSQL or SQLite, essentially allowing for production level storage. 
- **Live job data** — job descriptions are 8 synthetic JSON entries. Integrating a real job board API (LinkedIn, Indeed) would require paid access and scraping agreements.
- **Resume OCR** — the PDF parser only works on text-based PDFs. Scanned/image-based resumes would need an another layer like using Tesseract which was out of scope for the time given.
- **Auth** — no user accounts or sessions. Profiles are short-lived by design for this prototype.

**What would you build next with more time?**
- Replace in-memory storage with a real database and add user authentication
- Integrate a live job board API to pull real postings and scale gap analysis to 100+ descriptions
- Add OCR support for image-based resumes
- Build a progress tracker so users can mark skills as learned and watch their readiness score update over time
- Add a saved roadmap feature so users can bookmark courses and track completion

**Known limitations:**
- Profiles are lost on server restart due to the in-memory storage
- GitHub import uses the unauthenticated API which is rate-limited to 60 requests/hour so I could add a `GITHUB_TOKEN` to `.env` to remove this limit
- PDF parsing fails on scanned or image-based resumes — the UI surfaces a clear error message
- The AI fallback for gap analysis uses weighted set intersection (70% required skills, 30% preferred), which is deterministic but less nuanced than the Claude-powered version
- Job descriptions are synthetic — gap scores reflect the 8 included roles only

### Tech Stack
| Layer | Technology | Reason |
|---|---|---|
| Frontend | React 18 + Vite | Fast HMR, component model |
| Backend | Node.js + Express | Lightweight REST API |
| AI | Anthropic Claude (claude-sonnet-4-20250514) | Gap analysis, roadmap, interview Qs |
| Data | Static JSON | Synthetic data only — no scraping |
| Tests | Jest + Supertest | Node-native, fast |

### Application Flow
```
User enters profile → POST /api/profile
       ↓
Gap Analysis        → POST /api/analyze/gap
       ↓
Learning Roadmap    → POST /api/roadmap/generate
       ↓
Interview Prep      → POST /api/interview/generate
```

### AI Integration + Fallback Strategy
Every AI call is wrapped in `aiHelper.js` which:
1. Checks for `ANTHROPIC_API_KEY` — if missing, skips AI immediately
2. Calls Claude with a structured JSON prompt
3. If the API call throws (rate limit, network error, etc.), catches the error and calls the rule-based fallback
4. Returns `{ data, source: 'ai' | 'fallback' }` so the UI can indicate the source

**Fallback implementations:**
- **Gap Analysis**: Set intersection of user skills vs. required skills; weighted score (70% required, 30% preferred)
- **Roadmap**: Filter course catalog by missing skill tags; organize by difficulty into phases
- **Interview**: Static question bank keyed by skill category

---

## Project Structure
```
skill-bridge/
├── server/
│   ├── index.js              # Express app entry
│   ├── aiHelper.js           # AI call wrapper + fallback logic
│   ├── routes/
│   │   ├── profile.js        # CRUD: Create, Read, Update profiles
│   │   ├── analyze.js        # Gap analysis endpoint
│   │   ├── roadmap.js        # Learning roadmap generation
│   │   ├── interview.js      # Mock interview question generation
│   │   ├── github.js         # GitHub API import — scans repos for skills
│   │   └── resume.js         # PDF resume upload + AI skill extraction
│   ├── data/
│   │   ├── job_descriptions.json   # 8 synthetic role definitions
│   │   └── courses.json            # 18 learning resources (free + paid)
│   ├── tests/
│   │   └── analyze.test.js   
│   ├── .env.example
│   └── package.json
├── client/
│   ├── index.html
│   ├── vite.config.js
│   └── src/
│       ├── main.jsx
│       ├── App.jsx            # Navigation + state
│       ├── index.css          # Global styles (dark editorial theme)
│       └── components/
│           ├── ProfileSetup.jsx     # Step 1: Resume upload / GitHub import / manual entry
│           ├── GapAnalysis.jsx      # Step 2: Skills gap dashboard + readiness score
│           ├── LearningRoadmap.jsx  # Step 3: Phased learning plan
│           └── MockInterview.jsx    # Step 4: Interview question bank
├── README.md
├── DESIGN.md
└── .gitignore

```

--- 
