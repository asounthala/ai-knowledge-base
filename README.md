# docKnowledge

An AI-powered document knowledge base that lets you upload documents and chat with them using Retrieval-Augmented Generation (RAG).

![Next.js](https://img.shields.io/badge/Next.js-16-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![LangChain](https://img.shields.io/badge/LangChain-JS-green)
![ChromaDB](https://img.shields.io/badge/ChromaDB-local-orange)
![Prisma](https://img.shields.io/badge/Prisma-7-teal)

---

## What It Does

1. **Upload** a PDF, DOCX, or TXT document
2. **Ingest** — the document is extracted, chunked, embedded, and stored in ChromaDB
3. **Chat** — ask questions about your documents and get AI-powered answers with source citations
4. **Persist** — all conversations are saved to a local SQLite database so you can come back to them

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16, TypeScript, Tailwind CSS |
| AI / LLM | Anthropic Claude (via LangChain) |
| Vector Database | ChromaDB (local via Docker) |
| Embeddings | `@chroma-core/default-embed` |
| PDF Parsing | `pdf2json` |
| DOCX Parsing | `mammoth` |
| Database | SQLite via Prisma ORM |
| Markdown Rendering | `react-markdown` + `remark-gfm` |

---

## Project Structure

```
app/
  page.tsx                        # Upload screen (/)
  not-found.tsx                   # 404 page
  layout.tsx                      # Root layout with sidebar
  chat/
    page.tsx                      # Chat interface (/chat)
  documents/
    page.tsx                      # Document library (/documents)
  api/
    upload/
      route.ts                    # POST /api/upload — ingest a document
    chat/
      route.ts                    # POST /api/chat — RAG query endpoint
    conversations/
      route.ts                    # GET/POST /api/conversations
      [id]/
        route.ts                  # GET/DELETE /api/conversations/:id
    documents/
      route.ts                    # GET/DELETE /api/documents
lib/
  extractText.ts                  # PDF, DOCX, TXT text extraction
  chunkText.ts                    # Split text into overlapping chunks
  query.ts                        # ChromaDB semantic search
  prisma.ts                       # Prisma client singleton
prisma/
  schema.prisma                   # Conversation + Message models
  dev.db                          # SQLite database (auto-generated)
components/
  Sidebar.tsx                     # Navigation sidebar
```

---

## Prerequisites

- Node.js 18+
- Docker (for ChromaDB)
- An [Anthropic API key](https://console.anthropic.com)

---

## Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/asounthala/docKnowledge.git
cd docKnowledge
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Create a `.env.local` file in the root:

```env
ANTHROPIC_API_KEY=your_api_key_here
```

Create a `.env` file for Prisma:

```env
DATABASE_URL="file:./prisma/dev.db"
```

### 4. Set up the database

```bash
npx prisma migrate dev --name init
npx prisma generate
```

### 5. Start ChromaDB

```bash
docker run -p 8000:8000 chromadb/chroma
```

### 6. Start the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## How It Works

### Document Ingestion Pipeline

```
User uploads file
      ↓
POST /api/upload
      ↓
extractText()    →   Raw text string
      ↓
chunkText()      →   ~500 word chunks with 50 word overlap
      ↓
ChromaDB         →   Vectors stored and indexed
```

### RAG Query Pipeline

```
User asks a question
      ↓
ChromaDB semantic search  →  Top 4 most relevant chunks
      ↓
Inject chunks into prompt  →  Augmented context
      ↓
Claude generates answer    →  Response with source citations
      ↓
Save to SQLite             →  Conversation persisted
```

---

## Features

- **Multi-format support** — Upload PDF, DOCX, and TXT files
- **Semantic search** — Questions are matched to relevant chunks by meaning, not keywords
- **Source citations** — Every answer shows which document it pulled from
- **Conversation history** — Full back-and-forth chat with persistent storage
- **Document library** — View and delete all ingested documents
- **Collapsible sidebar** — Clean navigation between Upload, Chat, and Documents

---

## API Reference

### `POST /api/upload`
Upload and ingest a document.

**Body:** `multipart/form-data` with a `file` field

**Response:**
```json
{ "chunks": 12 }
```

### `POST /api/chat`
Send a message and get a RAG-powered response.

**Body:**
```json
{
  "question": "What is machine learning?",
  "conversationId": "optional-existing-id"
}
```

**Response:**
```json
{
  "answer": "Machine learning is...",
  "sources": [{ "source": "textbook.pdf" }],
  "conversationId": "cmn..."
}
```

### `GET /api/documents`
List all ingested documents.

### `DELETE /api/documents`
Delete a document and all its chunks from ChromaDB.

**Body:**
```json
{ "name": "textbook.pdf" }
```

### `GET /api/conversations`
List all saved conversations.

### `DELETE /api/conversations/:id`
Delete a conversation and all its messages.

---

## Roadmap

- [ ] Pinecone integration for production vector storage
- [ ] Authentication / user accounts
- [ ] Document re-ingestion / update
- [ ] Streaming responses
- [ ] Settings page
- [ ] History page

---

## License

MIT