# Cardless Infrastructure & Databases  
For the **Python FastAPI backend**, use a free container host that allows Docker with no credit card. Top choices include **SnapDeploy** (10 free deploys/day, auto-sleep, no card required), **Render** (750 free compute-hours/mo, free Postgres 90-day trial, no card), and **Koyeb** (free 512 MB instances, no card usually needed). **Deta Space** (Deta.micro) is free with no card, but has limited RAM. **PythonAnywhere** offers a free tier (no card) but does **not** support Docker/ASGI (so FastAPI won’t run). In summary, containerized options are SnapDeploy, Render, Koyeb or Railway (Rails offers a $5 credit, no card to sign up). Avoid Google Cloud Run or AWS Free, as they require a card.  

For the **vector database**, a free Postgres with pgvector is ideal. **Supabase** still offers a generous free tier (1 GB DB, 500 MB storage) and does **not** require a credit card. Alternatives include **Neon.tech** (serverless Postgres, 10 GB free, no card) or **PlanetScale** (free MySQL, no card). You can enable the pgvector extension on any free Postgres (e.g. Neon or Supabase). **MongoDB Atlas** also has a free M0 cluster with no card needed, but it’s less suited for vector search. In practice, we recommend using Supabase/Neon Postgres with pgvector (both cardless) to store embeddings.

# Medical RAG Datasets (ICMR, AYUSH, etc.)  
We need authoritative Indian medical guidelines:

- **ICMR Standard Treatment Workflows (STWs):** Downloadable PDFs from the ICMR website. For example, the ICMR STW page lists “Hypertension in Adults” and full specialty volumes. You can scrape or download those PDFs directly from [ICMR STWs](https://www.icmr.gov.in/standard-treatment-workflows-stws). (ICMR’s “Standard Treatment Workflows” contain structured protocols for cardiology, ENT, etc..)

- **Ayurvedic Pharmacopoeia of India (API):** The official API volumes are public. For instance, *The Ayurvedic Pharmacopoeia of India, Part I Vol.1 (Monographs)* is freely available. (This is the government’s compendium of Ayurvedic drug standards.) You can download PDFs from sources like [dravyagunatvpm.wordpress.com](https://dravyagunatvpm.wordpress.com/e-ayupharmacopoeia-of-india/) or the Internet Archive. For example, [31] shows the title page of API Part I Vol.1. Similarly, volumes for formulations (Part II) and Appendices can be obtained via the same site.

- **AYUSH Guidelines:** The Ministry of AYUSH publishes guidelines (e.g. COVID-19 advisories) on [ayush.gov.in](https://www.ayush.gov.in). While few structured datasets exist, you can grab PDFs from AYUSH (e.g. *COVID-19 Management in Ayurveda*). No single “dataset” file exists, so use official AYUSH/Govt releases where applicable.

- **Drug Interaction / Brand–Generic Database:** Use free pharmacological resources. One option is the **NLM RxNorm API**, which includes generic/brand mappings and interaction info. For example, NLM’s [Interaction API](https://rxnav.nlm.nih.gov/) (RxNav) provides drug-drug interactions (drawn from DrugBank) in JSON. Another free source is **DrugBank’s free data** (requires registration but no credit card) or open datasets like the Kaggle “Drug-Drug Interactions” dataset. For brand-to-generic names, consider **OpenFDA** or **RxNorm** data which list proprietary and generic names. (There is no single Indian-specific database; international open data like RxNorm must suffice.)

- **Triage Protocols:** For clinical triage protocols, use established models. The WHO’s **Interagency Integrated Triage Tool (IITT)** is freely available. It provides adult and pediatric triage (color-coded red/yellow/green acuity) and can serve as a reference protocol. AIIMS in India has its “ATP” protocol (All India Institute of Medical Sciences Triage Protocol), but that’s not easily scraped. In practice, incorporate standard triage logic (e.g. WHO IITT or Emergency Severity Index) into your RAG knowledge base. (Citing [42] clarifies that IITT exists and is public.)

# RAG Architecture & LLM Selection  
**Models from NVIDIA NIM / FreeLLMAPI:** NVIDIA NIM provides hosted endpoints for many free models (40+ models via NVIDIA-hosted APIs). Notable examples (from user reports) include **DeepSeek**, **MiniMax**, **Kimi**, **GLM**, **GPT-OSS**, etc.. These are generally general-purpose LLMs, not specialized in medicine. Likewise, the FreeLLMAPI router gives access to hundreds of free endpoints; example models include **Qwen 3**, **DeepSeek V4**, and **GLM-5**. There aren’t well-known *medical-specific* models on these free lists, so we recommend using strong general LLMs (like GPT-OSS, GLM-4/5, Qwen, Llama variants) via their free endpoints for generation. For embeddings, use an open model (e.g. sentence-transformers or Cohere’s free API) to vectorize docs. 

**RAG pipeline:** Use a hybrid retrieval strategy to minimize hallucinations. A typical approach is to combine a lexical search (BM25) with semantic search. For example, use a Postgres full-text index or Whoosh/Elasticsearch (BM25) to filter documents, then re-rank with vector search (pgvector). LangChain or LlamaIndex can orchestrate this: ingest all guideline texts into a vector store (pgvector or an open FAISS), but when answering queries, first run a keyword filter to ensure factual hits, then refine with semantic similarity.

Research suggests **Graph-RAG** (knowledge-graph grounded retrieval) significantly reduces hallucination in domains like medicine. In practice, this means structuring your documents as a graph of entities/relations (or at least enforcing a strict schema) so that only logically connected facts are retrieved. For example, FalkorDB’s GraphRAG retrieves subgraphs of related concepts rather than loose chunks. If implementing fully structured graphs is complex, even a hybrid “multi-hop” approach helps. (A 2025 benchmark found GraphRAG had higher factual accuracy than pure vector RAG.)

**Implementation:** In Python, build a RAG chain with LangChain (RetrievalQA) or LlamaIndex. Use LangChain’s `graph_qa` or knowledge graph features for advanced setup. At minimum, use `RetrievalQA` with `VectorStoreRetriever` on pgvector and optionally add `BM25Retriever` or `TextLoader` filtering. Always return source citations. Feed the retrieved text + question to the chosen LLM endpoint (via NVIDIA NIM or FreeLLMAPI). This guards against hallucination by grounding answers in retrieved content.

# Tools for Core Features  

- **WASM Noise Cancellation:** For in-browser noise suppression, **RNNoise** is currently the most practical. It has existing WebAssembly builds (see [Jitsi’s rnnoise-wasm](https://github.com/jitsi/rnnoise-wasm)) and runs entirely client-side. RNNoise is very lightweight (~85KB) and adds only ~10 ms latency, making it ideal for real-time PWA use. (DeepFilterNet3 yields higher quality, but its model is larger (~2.3M parameters) and adds ~40 ms latency, which is a drawback for live calls.) In short, integrate RNNoise (via a WASM module) in the WebAudio processing pipeline. It’s open-source MIT and needs no cards or remote API.

- **Smart Document Scanner (OCR):** On the backend, use a mature OCR engine like **Tesseract OCR** (via `pytesseract`) or **PaddleOCR**. Tesseract (Apache-2.0) supports 100+ languages and is CPU-efficient, making it good for printed forms and free of charge. PaddleOCR (Apache-2.0) offers better accuracy on complex or multilingual layouts but may need GPU for high speed. For highly structured output (e.g. tables, fields), consider **Datalab’s Marker (Surya)** pipeline, which converts images to JSON/Markdown and handles tables/formulae. In many cases, a two-stage pipeline works: use OpenCV (Python) to detect/crop the document edges, then run Tesseract/EasyOCR or PaddleOCR on the cropped image. All these tools are open-source (no cards needed).

- **Nearest Hospital Finder:** Leverage **OpenStreetMap (OSM)** data and browser geolocation. In the PWA, use HTML5 Geolocation to get the user’s lat/long. Then query OSM’s free APIs:  
  - **Nominatim:** e.g. `https://nominatim.openstreetmap.org/search?format=json&amenity=hospital&lat={LAT}&lon={LON}&radius=5000` returns nearby hospitals in JSON.  
  - **Overpass API:** An Overpass Turbo query (amenity=hospital) around the point can list all hospitals within a radius. OSM’s data is public and requires no API key or card. For reviews, no free public API covers hospitals, so skip or display static info (address, phone) only.

All the above tools/APIs are free and cardless. No Google Maps/Places (which requires billing), no proprietary services.

# Step-by-Step Execution Workflow  

1. **Backend Setup:** Create a FastAPI project and containerize it with Docker. Use a production server (`uvicorn --workers` or Gunicorn) in the Dockerfile. Deploy on SnapDeploy or Render (both free with no credit card). Configure CORS for the PWA.

2. **Database/Vector Store:** Provision a free PostgreSQL (Supabase or Neon). Enable the `pgvector` extension. Create tables for patient records, medical documents, and embeddings. E.g. a “documents” table with an `embedding vector`. No card is required for these DBs.

3. **Data Ingestion:**  
   - Download ICMR STW PDFs and API volumes. Convert PDFs to text (via PDFMiner or OCR if needed). Ingest text into the `documents` table, generating embeddings using an open model (e.g. `sentence-transformers`).  
   - Similarly ingest Ayurvedic Pharmacopoeia text (from [31] etc).  
   - Insert relevant drug names/interactions (perhaps as JSON data in the DB) using free sources (RxNorm API data scraped or Kaggle).  
   - Create an index on text for BM25 (Postgres full-text or SQLite FTS) and build pgvector vectors for semantic search.

4. **RAG API Endpoint:** Implement a FastAPI endpoint (e.g. `/query`) that takes a question. The backend should:  
   a. Use BM25 full-text to narrow candidate documents (e.g. SQL `WHERE document_text @@ plainto_tsquery(query)`).  
   b. Then use pgvector to retrieve the top-k semantically similar chunks.  
   c. Call the chosen LLM via NVIDIA NIM or FreeLLMAPI. (E.g. send prompt+retrieved context to the model endpoint—GLM or DeepSeek via NIM API key.)  
   d. Return the LLM’s answer and the source text for display.  

5. **Voice/Capture Interface:** In the PWA (JavaScript/React or plain JS):  
   - Implement audio capture using `getUserMedia`.  
   - Apply the **RNNoise WASM** module to each audio frame for noise suppression.  
   - Send the cleaned audio to a Speech-to-Text service. (Since free STT is limited, you might use an on-device model like [whisper.cpp](https://github.com/ggerganov/whisper.cpp) compiled to WASM, or send to a free endpoint.)  
   - Transcribe spoken input to text.

6. **Case-Taking Logic:** As the user speaks, capture symptoms and fill the patient case form (structured JSON). Optionally use an intent classifier (keyword match or small LLM) to map speech to form fields.

7. **Smart Document Scanner:** Add a camera button in the UI. When a user snaps a photo of a prescription/form:  
   - Send the image to a FastAPI endpoint. On the server, run OCR (Tesseract/PaddleOCR).  
   - Return extracted text/fields to pre-fill parts of the case form.

8. **Geolocation & Hospital Search:** In the PWA, use `navigator.geolocation` to get coords. Call a backend endpoint `/search_hospitals` that queries OSM (Nominatim or Overpass) for nearby hospitals. Return a list (names, addresses, distances) for display. (No card needed for OSM.)

9. **Frontend UI:** Build the PWA interface with React/Vue (or plain JS). Key components:  
   - **Voice-first interface:** large mic button, text transcript area, question list.  
   - **Form-based case editor:** fields for symptoms, vitals, etc (auto-filled from speech/scan).  
   - **Chatbot view:** to display RAG answers with source links.  
   - **Map view:** showing nearest hospitals (using e.g. Leaflet + OSM tiles).  

10. **Testing & Iteration:** Test the full pipeline: speak a query (like “What’s the treatment for hypertension?”), see it transcribed, answer retrieved from ICMR STWs, displayed with citations. Scan a mock lab report, verify OCR. Check hospital finder shows local results.

Finally, **Deploy** the PWA on a free static host (e.g. Netlify or Vercel with no credit card for static sites) and point the frontend’s API calls to your backend. 

**Summary Table – Tools & Cardless Status:**  

| Component                 | Suggested Tool/Service           | Purpose                           | Free Tier / Cardless?               |
|---------------------------|----------------------------------|-----------------------------------|-------------------------------------|
| Container Hosting         | **SnapDeploy**    | Dockerized Python backend         | Free (10 deploys/day), no card      |
|                           | **Render**           | Docker & DB hosting               | Free, no card                       |
|                           | **Koyeb**          | Docker hosting                    | Free, no card (generally)           |
|                           | **Deta Space**    | Python microservice               | Free, no card                       |
| PostgreSQL + pgvector DB  | **Supabase**        | Vector DB (pgvector) + auth       | Free tier, no card                  |
|                           | **Neon.tech**       | Serverless Postgres + pgvector    | Free tier (10GB), no card           |
|                           | **MongoDB Atlas**    | Document DB (alternative)         | Free M0 tier, no card               |
| LLM API (generation)      | **NVIDIA NIM**      | Free hosted LLM endpoints (DeepSeek, MiniMax, etc.) | Free tier (developer account)      |
|                           | **FreeLLMAPI Router** | Aggregated free LLM endpoints (Qwen3, GLM-5, etc.) | Open source; no card               |
| Document Ingestion OCR    | **Tesseract OCR** | Scanned text extraction           | Free, no card                       |
|                           | **PaddleOCR**       | Advanced OCR (tables/forms)       | Free, no card                       |
|                           | **Datalab Marker (Surya)** | Structured OCR pipeline  | Free, no card           |
| Noise Cancellation        | **RNNoise (WASM)**| Real-time noise suppression       | Open-source, free                   |
|                           | **DeepFilterNet** | High-quality noise filter (post-processing) | Open-source, free          |
| Hospital Geo-Search       | **OpenStreetMap (Nominatim/Overpass)** | Find nearest hospitals            | Free, no card                       |
|                           | **Leaflet.js** (with OSM tiles)  | Map display in frontend          | Free, no card                       |
| RAG/Vector Tools          | **LangChain / LlamaIndex**       | RAG retrieval and chaining       | Open-source, no card                |
|                           | **pgvector (on Postgres)**       | Vector similarity search         | Open-source, no card                |
| QA/BM25 Search            | **Postgres full-text / Whoosh**  | Keyword/BM25 filtering           | Open-source, no card                |
| Frontend Hosting          | **Netlify / Vercel (static)**    | PWA deployment (static assets)   | Free tier, no card                  |

Each of the above recommendations has a free tier and does *not* require credit card details. By using these tools in sequence, you can implement **Project Samanvaya** fully free-of-charge and cardless. 

**Sources:** We consulted official docs and community analyses for hosting (SnapDeploy), databases (Neon, MongoDB), medical guidelines (ICMR, Ayurvedic API), RAG architectures (FalkorDB on GraphRAG), APIs (NLM RxNav), noise models, OCR tools, and mapping (OSM/Nominatim). These ensure up-to-date, free solutions consistent with the **cardless** requirement.