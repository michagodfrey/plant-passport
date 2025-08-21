# Project TODO - PlantPassport.ai

---

## 1) App (Frontend & API)

* [ ] **User flow**: single page with form + results

  * [ ] Inputs: **commodity**, **origin (state/area)**, **destination (state)**
  * [ ] Output: plain‑English decision, key steps, contact hand‑off
  * [ ] Display **supporting clause** + **source link**
  * [ ] Prominent **disclaimer** + 'contact your local office' CTA
* [ ] **Accessibility**: keyboard navigation, labels, focus states
* [ ] **States & errors**: loading, no match, ambiguous input, timeouts
* [ ] **Telemetry (basic)**: capture anonymised query counts for demo
* [ ] **API surface**: `POST /api/ask { commodity, origin, destination }`
* [ ] **Config**: environment variables template in `.env.example`

**Definition of Done (App):** given a common query (e.g. *potted citrus, NSW → QLD*), the app returns a decision with a citation link in < 5s.

---

## 2) AI Integration (runtime & tools)

* [ ] **Agent scope**: start with **one agent** that can:

  * [ ] retrieve relevant passages from the knowledge base
  * [ ] call minimal tools (URL fetcher for public pages, simple calculator/date parser if needed)
  * [ ] cite sources used for the answer
* [ ] **Prompting**: system rules (be factual; show clause; ask for missing inputs)
* [ ] **Guardrails**: refuse to invent rules; prefer 'contact office' if uncertain
* [ ] **Observability**: capture prompts/responses and which documents were cited (local logs are fine)

**Definition of Done (AI):** for a fixed test set of queries, the agent produces stable, reproducible answers with citations and does not hallucinate requirements.

---

## 3) Knowledge Base Development (rules & references)

* [ ] **Ingest** official state/territory references (manuals, guidance pages)

  * [ ] Track **source, date, state, document type, version** per file
  * [ ] Keep raw files under `resources/<STATE>/`
* [ ] **Extract** plain‑text with page anchors for citation
* [ ] **Chunk**: split by headings/clauses; preserve source URL + page range
* [ ] **Metadata**: state, commodity categories, pest names/aliases, clause IDs
* [ ] **State‑specific structures**:

  * [ ] Capture **pre‑movement notifications / permits / approvals** where required (e.g. Tasmania Notice of Intent to import)
  * [ ] Record how each state classifies material (e.g., permitted/restricted/prohibited organisms, or equivalent terminology)
  * [ ] Note any **zonal controls** (quarantine areas, movement control areas)

**Definition of Done (KB):** each state has at least one high‑quality source set with chunked text, metadata, and a manifest (`resources/index.csv`).

---

## 4) Plant Pests & Disease Database

* [ ] **Aliases & taxonomy** fields (scientific, common, synonyms)
* [ ] **Status fields** per state: present / absent / zoned / unknown
* [ ] **Evidence field**: link to authoritative statements or maps
* [ ] **Update cadence**: note where status is volatile and needs checks

**Definition of Done (Pest DB):** one table with unique pest IDs, aliases, and per‑state status; rows link to sources.

---

## 5) Host-Pest Mapping (Commodity Knowledge)

* [ ] **Commodity Categories**: Quarantine rules separate plant hosts from from fruit hosts (e.g. a potted blueberry plant is a potential fire ant host while the blueberry fruit is a fruit fly and blueberry rust host)
* [ ] **Host mapping**: link commodities (plants, fruit/veg categories) to pests of concern
* [ ] **Granularity**: allow both species‑level (e.g., *Citrus sinensis*) and category (e.g., 'potted citrus')
* [ ] **Treatment notes**: store references to recognised treatments/conditions (by clause ID only; narrative text kept in KB chunks)

**Definition of Done (Host Mapping):** given a commodity, we can list likely pests of concern with links to rule clauses.

---

## 6) Geographic Data (Presence & Area Freedom)

* [ ] **Presence mapping**: record where pests are known to occur within Australia (state‑level minimum; zonal if public data exists)
* [ ] **Area freedom**: capture formal statements/claims and their scope (statewide vs defined zones)
* [ ] **Geometry** (optional for MVP): if available, keep simple shapes or textual zone keys (LGA/postcode descriptors) for future mapping

**Definition of Done (Geo):** a table that answers 'Is pest X present in origin Y?' with a source citation.

---

## 7) Infrastructure & Storage (minimal viable)

* [ ] **Document store** for raw and processed texts (folder + manifest acceptable for MVP)
* [ ] **Search index** for retrieval (keep API behind a small abstraction so backends can change later)
* [ ] **Secrets management**: local `.env` for dev; placeholder for hosted secrets later
* [ ] **Backups**: version documents in Git; large files via Git LFS if needed
* [ ] **Update job**: script or task to refresh ingested pages and flag diffs

**Definition of Done (Infra):** one command/script rebuilds the knowledge base and re‑indexes documents locally.

---

## 8) Resources to Place in `resources/`

*(Populate with authoritative, publicly available material. Keep filenames stable and add to `resources/index.csv`.)*

* [ ] Queensland: biosecurity Act/regulations/manuals; area freedom statements
* [ ] New South Wales: plant movement guidance; relevant orders/standards
* [ ] Tasmania: plant quarantine manual and associated guidance
* [ ] South Australia: plant health legislation and quarantine standards
* [ ] Northern Territory, Victoria, Western Australia, ACT: equivalent sources

**For each file:**

* [ ] Record `state, title, version/date, source_url, retrieved_on`
* [ ] Verify text extract quality (check tables/headings)
* [ ] Note any publication update channels (RSS, 'last updated' stamps)

---

## 9) Demo Script & Test Set

* [ ] Prepare a small **golden set** of queries (e.g., *azalea in pot VIC → QLD*, *cut flowers NSW → QLD*) with expected outcomes
* [ ] Rehearse 90‑second demo: input → answer → clause → contact hand‑off
* [ ] Capture screen recording as fallback

---

## 10) Open Questions (to decide with the team)

* [ ] How to model commodity taxonomy (free‑text with alias table vs fixed list)?
* [ ] Minimal set of tools the agent may call (URL fetcher, date parser, etc.)
* [ ] How to represent zonal controls in MVP (text descriptors vs shapes)?
* [ ] What is the cadence for refreshing state documents?

---
