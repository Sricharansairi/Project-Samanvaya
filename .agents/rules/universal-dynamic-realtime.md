# Rule: Universal Dynamic & Real-Time Execution (Zero Hardcoding)

## Scope
Universal across all models, workflows, clinical decision support rules, pharmacovigilance checks, pricing calculations, and user interfaces in Project Samanvaya.

## Rule Invariant
All clinical logic, triage routing, pharmacovigilance screening, pricing savings, and vernacular translations MUST be executed dynamically in real time against live APIs, active health records, or vast foundation models:
1. **Zero Hardcoded Data Dictionaries or Delay Timers**: Never use fake `setTimeout` simulations or static mock responses when processing patient documents or consultations.
2. **Dual-Branch Model Execution**: High-parameter general models (`openai/gpt-oss-120b`, `nvidia/nemotron-3-super-120b-a12b`) and dedicated medical models (`writer/palmyra-med-70b`, `epfl-meditron-70b`) must be queried dynamically for clinical reasoning.
3. **Live Pharmacovigilance & Drug Pricing**: Always compute actual molecule combinations and market price differentials in real time.
4. **Civic Inclusivity**: All outputs must provide instant, accessible plain-language explanations in vernacular languages (Hindi, Tamil, Telugu, Kannada, Bengali, Marathi, English) with spoken voice audio readiness.
