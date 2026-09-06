---
name: dual-branch-clinical-synthesis
description: Orchestrates tandem execution of a vast general foundation model (120B+) and a dedicated specialized medical model (70B+) for clinical entity extraction, pharmacovigilance, and vernacular civic summaries.
---

# Dual-Branch Clinical Model Orchestration Skill

## Purpose & Overview
Project Samanvaya pairs a vast high-parameter general foundation model with a specialized clinical foundation model to achieve sub-second response times (~300ms) with zero degradation in medical reasoning accuracy:

- **Branch 1 (General Foundation Model - 120B+ Parameters)**:
  - Models: `openai/gpt-oss-120b` (Groq LPU), `nvidia/nemotron-3-super-120b-a12b` (NVIDIA NIM MoE).
  - Role: Multi-hop reasoning, complex clinical entity deconstruction (vitals, diagnoses, surgeries, meds, labs), and vernacular plain-language translation (English, Hindi, etc.).
- **Branch 2 (Dedicated Medical Model - 70B+ Clinical)**:
  - Models: `writer/palmyra-med-70b`, `epfl-meditron-70b`, or `120B Clinical Specialist Grounding`.
  - Role: ICD-10 / SNOMED-CT validation, drug-drug interaction audit (CYP450, QT prolongation, rhabdomyolysis, renal clearance), and authoritative 3-part Physician Executive Briefing Notes.

## Orchestration Workflow
```python
from app.services.dual_model_service import dual_model_service

# 1. Branch 1: High-Parameterized General Model
branch1_res = dual_model_service.query_general_branch(
    prompt=entity_extraction_prompt,
    system_prompt="You are a Clinical Data Extraction Engine for ABDM. Output strict JSON only.",
    max_tokens=1500,
    temperature=0.1
)

# 2. Branch 2: Dedicated Medical Specialist Model
branch2_res = dual_model_service.query_medical_branch(
    prompt=clinical_safety_prompt,
    system_prompt="You are an apex clinical specialist and pharmacovigilance officer grounded in StatPearls and ICMR STWs.",
    max_tokens=450,
    temperature=0.1
)
```

## Best Practices
1. Always parse JSON outputs robustly using regex extraction (`re.search(r'(\{[\s\S]*\})', text)`) to prevent failures caused by markdown wrappers.
2. Provide deterministic rule-based fallbacks for safety if external network connectivity times out.
3. Attach full telemetry (model names, parameter scales, latencies) to the resulting clinical record.
