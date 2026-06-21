# VocabNex 📖

An AI-powered personal vocabulary builder that helps you learn, retain, and test new words every day.

🔗 **Live Demo:** [vocab-nex.vercel.app](https://vocab-nex.vercel.app)

---

## Features

- **AI Word Enrichment** — Add any word and instantly get an AI-generated definition, example sentence, and synonyms
- **Smart Caching** — Definitions are stored in a shared database so common words load instantly without any API call
- **Flashcard Review** — Flip cards to reveal definitions and track what you know vs. what you don't
- **AI Quiz Mode** — AI generates multiple choice questions to test your knowledge
- **Progress Dashboard** — Track total words learned, flashcard accuracy, and quiz scores over time
- **Authentication** — Secure login and signup with Supabase Auth
- **Dark Theme UI** — Clean, modern dark interface built with Tailwind CSS

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Frontend | React.js, Tailwind CSS |
| Backend | Next.js API Routes |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth |
| AI | Google Gemini API |
| Deployment | Vercel |

---

## Getting Started

### Prerequisites

- Node.js installed
- A [Supabase](https://supabase.com) account
- A [Google AI Studio](https://aistudio.google.com) account for the Gemini API key

### Installation

1. Clone the repository:
```bash
git clone https://github.com/rifahjahantamanna/VocabNex.git
cd VocabNex/vocabnex
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file in the root:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
GEMINI_API_KEY=your_gemini_api_key
```

4. Set up Supabase tables by running these SQL queries in your Supabase SQL Editor:

```sql
-- Words table
create table words (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc', now()),
  word text not null,
  definition text,
  example_sentence text,
  synonyms text[],
  user_id uuid references auth.users(id)
);
alter table words enable row level security;
create policy "Users can manage their own words" on words for all
using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Reviews table
create table reviews (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc', now()),
  word_id uuid references words(id) on delete cascade,
  user_id uuid references auth.users(id),
  knew_it boolean not null
);
alter table reviews enable row level security;
create policy "Users can manage their own reviews" on reviews for all
using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Quiz scores table
create table quiz_scores (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc', now()),
  user_id uuid references auth.users(id),
  score integer not null,
  total integer not null
);
alter table quiz_scores enable row level security;
create policy "Users can manage their own quiz scores" on quiz_scores for all
using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Shared definitions cache
create table definitions (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc', now()),
  word text unique not null,
  definition text,
  example_sentence text,
  synonyms text[]
);
alter table definitions enable row level security;
create policy "Anyone can read definitions" on definitions for select using (true);
create policy "Anyone can insert definitions" on definitions for insert with check (true);
```

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000)

---

## How It Works

### Smart Definition Caching

When a user adds a new word, VocabNex first checks a shared `definitions` table in Supabase. If the word already exists (added by any previous user), it returns instantly with no API call. If not, it calls the Gemini API, saves the result to the shared table, and returns it. This means the database grows smarter over time and AI is called less and less.

```
User adds word
     ↓
Check shared definitions table
     ↓
Found? → Return instantly (no AI call)
Not found? → Call Gemini API → Save to table → Return
```

### Flashcard System

Words are shown one at a time with a CSS 3D flip animation. After revealing the definition, users mark whether they knew it or not. Results are saved to Supabase for progress tracking.

### Quiz Mode

For each word, the Gemini API generates a multiple choice question with one correct answer and three AI-generated wrong options. Answers are shuffled randomly for each session.

---

## Project Structure

```
vocabnex/
├── app/
│   ├── api/
│   │   ├── enrich/route.js    # AI word enrichment with caching
│   │   └── quiz/route.js      # AI quiz question generation
│   ├── dashboard/page.js      # Stats and progress dashboard
│   ├── flashcards/page.js     # Flashcard review mode
│   ├── login/page.js          # Auth page
│   ├── quiz/page.js           # Quiz mode
│   ├── words/[id]/page.js     # Word detail page
│   └── page.js                # Homepage / word list
├── lib/
│   └── supabase.js            # Supabase client
└── .env.local                 # Environment variables
```

---

## Deployment

This app is deployed on Vercel. To deploy your own:

1. Push your code to GitHub
2. Import the project on [vercel.com](https://vercel.com)
3. Add your environment variables in Vercel's project settings
4. Deploy — every future `git push` auto-deploys

---

## Built By

**Rifah Jahan Tamanna**
