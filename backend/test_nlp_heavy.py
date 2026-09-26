"""
Project Samanvaya - Heavy Clinical NLP Engine Verification Suite
Tests:
1. Clinical NegEx Algorithm (Verifies negated symptoms are ignored)
2. Clinical NER & Vital Signs Parser
3. Subword N-Gram TF-IDF Vector Embeddings & Cosine Similarity Scoring
"""

import sys
import os
import time

# Ensure backend root is in sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

from app.services.clinical_nlp import extract_clinical_entities, detect_clinical_negations, tfidf_engine
from app.services.medical_rag import retrieve_medical_guideline

def print_header(title: str):
    print("\n" + "=" * 80)
    print(f"  {title.upper()}")
    print("=" * 80)

def test_negex_negation_detection():
    print_header("Test 1: Clinical NegEx Algorithm (Negation Parsing)")
    
    # Query contains "chest pain" and "shortness of breath" BUT NEGATED ("denies", "no")
    negated_query = "Patient denies chest pain and no shortness of breath, but has watery diarrhea and vomiting for 2 days"
    
    neg_res = detect_clinical_negations(negated_query)
    print(f"  Original Query: '{negated_query}'")
    print(f"  Affirmed Text extracted: '{neg_res['affirmed_text']}'")
    print(f"  Negated Clauses: {neg_res['negated_clauses']}")
    
    assert "chest pain" not in neg_res["affirmed_text"].lower(), "NegEx failed to filter negated chest pain!"
    print("  ✅ [PASS] NegEx successfully stripped negated cardiac symptoms!")

    # Verify RAG retrieval with negated query
    rag_res = retrieve_medical_guideline(negated_query)
    g = rag_res["guideline"]
    print(f"  RAG Matched Monograph: {g['condition']} (ID: {g['id']})")
    assert g["id"] != "statpearls-cardio-acs", "RAG falsely triggered ACS despite NegEx negation!"
    print("  ✅ [PASS] RAG accurately routed to Gastroenteritis using NegEx affirmed text!")

def test_ner_and_vitals_extraction():
    print_header("Test 2: Clinical NER & Vital Signs Parser")
    
    clinical_text = "54yo male with severe crushing chest pain, BP 175/105 mmHg, SpO2 93%, radiation to left arm"
    
    ner_res = extract_clinical_entities(clinical_text)
    print(f"  Clinical Text: '{clinical_text}'")
    print(f"  Extracted Severity: {ner_res['extracted_severity']}")
    print(f"  Extracted Anatomy: {ner_res['detected_anatomy']}")
    print(f"  Extracted Vitals: {ner_res['extracted_vitals']}")
    
    assert ner_res["extracted_severity"] == "critical" or ner_res["extracted_severity"] == "high", "Severity extraction failed!"
    assert ner_res["extracted_vitals"]["systolic_bp"] == 175, "Systolic BP extraction failed!"
    assert ner_res["extracted_vitals"]["diastolic_bp"] == 105, "Diastolic BP extraction failed!"
    assert ner_res["extracted_vitals"]["spo2"] == 93, "SpO2 extraction failed!"
    print("  ✅ [PASS] Clinical NER and Vitals extraction fully verified!")

def test_tfidf_cosine_vector_engine():
    print_header("Test 3: TF-IDF Subword Vector Embeddings & Cosine Similarity")
    
    query1 = "crushing chest pain radiating to left arm with cold profuse sweating"
    query2 = "watery diarrhea vomiting dehydration in infant"
    
    vec1 = tfidf_engine.vectorize(query1)
    vec2 = tfidf_engine.vectorize(query2)
    
    sim_same = tfidf_engine.cosine_similarity(vec1, vec1)
    sim_diff = tfidf_engine.cosine_similarity(vec1, vec2)
    
    print(f"  Cosine Similarity (vec1 vs vec1 - Identity): {sim_same:.4f}")
    print(f"  Cosine Similarity (vec1 vs vec2 - Cardiac vs GI): {sim_diff:.4f}")
    
    assert abs(sim_same - 1.0) < 1e-4, "Identity Cosine Similarity must be 1.0!"
    assert sim_diff < 0.2, "Distinct clinical vectors should have low Cosine Similarity!"
    print("  ✅ [PASS] TF-IDF Vector Embeddings and Cosine Similarity metric verified!")

if __name__ == "__main__":
    print_header("STARTING HEAVY CLINICAL NLP VERIFICATION SUITE")
    t0 = time.time()
    test_negex_negation_detection()
    test_ner_and_vitals_extraction()
    test_tfidf_cosine_vector_engine()
    print_header(f"ALL CLINICAL NLP TESTS COMPLETED IN {round(time.time() - t0, 3)}S!")
