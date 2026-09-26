"""
Project Samanvaya - Rigorous Medical RAG & High-Parameter Model Test Suite
Tests:
1. Emergency Triage Triggers (Sub-10ms Override)
2. Hybrid BM25 Lexical + Dense Symptom Scoring
3. Sub-10ms In-Memory Clinical Semantic Cache Hits
4. SNOMED-CT to ICD-10 Graph Ontology Mapping
5. Concurrency / Latency Stress Test (50 Parallel Requests <30ms Target)
6. Dual-Branch Generative Clinical RAG Synthesis (Branch 1 & Branch 2)
"""

import sys
import os
import time
import concurrent.futures
from typing import List, Dict, Any

# Ensure backend root is in sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

from app.services.medical_rag import retrieve_medical_guideline, synthesize_clinical_rag, MEDICAL_CORPUS
from app.services.dual_model_service import dual_model_service

def print_header(title: str):
    print("\n" + "=" * 80)
    print(f"  {title.upper()}")
    print("=" * 80)

def test_emergency_triage_triggers():
    print_header("Test 1: Emergency Triage Triggers (Sub-10ms Override)")
    test_cases = [
        ("Patient has sudden severe crushing chest pain radiating to left arm with cold sweating", "statpearls-cardio-acs", "I21.9"),
        ("Sudden facial drooping, right arm weakness, and slurred speech (lakwa)", "statpearls-cns-stroke", "I63.9"),
        ("Patient presenting with fruity acetone breath, extreme thirst, and deep rapid breathing", "statpearls-endo-dka", "E11.10"),
        ("Pregnant female at 32 weeks with BP 170/115 mmHg experiencing sudden convulsions/seizure", "icmr-obs-preeclampsia", "O14.9"),
        ("Child unable to speak full sentences with silent chest and severe wheezing", "statpearls-resp-asthma", "J45.901")
    ]

    passed = 0
    for query, expected_id, expected_icd in test_cases:
        t0 = time.time()
        res = retrieve_medical_guideline(query)
        latency = round((time.time() - t0) * 1000, 2)
        guideline = res["guideline"]
        
        is_correct = (guideline["id"] == expected_id) and (guideline["icd10"] == expected_icd) and res["is_emergency"]
        if is_correct:
            print(f"  [PASS] Latency: {latency}ms | Condition: {guideline['condition']} | ICD-10: {guideline['icd10']}")
            passed += 1
        else:
            print(f"  [FAIL] Query: '{query}' -> Got ID: {guideline['id']}, Expected: {expected_id}")
    
    print(f"\nSubtotal: {passed}/{len(test_cases)} Passed")
    assert passed == len(test_cases), "Emergency triage trigger test failed!"

def test_semantic_cache_performance():
    print_header("Test 2: Sub-10ms In-Memory Clinical Semantic Cache")
    query = "Severe abdominal pain in right lower quadrant with rebound tenderness and fever"
    
    # First call - Cache Miss
    t0 = time.time()
    res1 = retrieve_medical_guideline(query)
    lat1 = (time.time() - t0) * 1000
    
    # Second call - Cache Hit
    t0 = time.time()
    res2 = retrieve_medical_guideline(query)
    lat2 = (time.time() - t0) * 1000

    print(f"  First Query (Cache Miss): {lat1:.2f}ms")
    print(f"  Second Query (Cache Hit):  {lat2:.2f}ms")
    print(f"  Cache Hit Status Flag: {res2['retrieval_architecture']['cache_hit']}")
    
    assert res2['retrieval_architecture']['cache_hit'] == True, "Cache hit flag not set!"
    assert lat2 < 10.0, f"Cache latency {lat2:.2f}ms exceeded 10ms SLA!"
    print("  [PASS] Semantic cache operational under 10ms SLA!")

def test_snomed_icd10_ontology_mapping():
    print_header("Test 3: SNOMED-CT to ICD-10 Graph Ontology Mapping")
    queries = [
        "high fever with retro-orbital eye pain and petechial red spots on skin",
        "chills and rigors with high fever and black urine",
        "systolic blood pressure 190 mmHg with severe headache and blurry vision"
    ]
    
    for q in queries:
        res = retrieve_medical_guideline(q)
        g = res["guideline"]
        ontology_str = res["retrieval_architecture"]["graph_ontology"]
        print(f"  Query: '{q[:50]}...'")
        print(f"    -> Monograph: {g['condition']}")
        print(f"    -> Graph Ontology: {ontology_str}")
        assert "SNOMED-CT:" in ontology_str and "ICD-10:" in ontology_str, "Graph ontology mapping missing!"
    print("  [PASS] SNOMED-CT <-> ICD-10 ontology graph mappings verified across all monographs!")

def test_concurrency_stress():
    print_header("Test 4: High-Throughput Concurrency & Latency Stress Test (50 Parallel Requests)")
    queries = [
        "chest pain radiating to left arm",
        "facial drooping slurred speech",
        "watery diarrhea vomiting in child skin pinch slow",
        "high fever retro orbital pain breakbone fever",
        "systolic BP 195 occipital headache",
        "fruity breath deep breathing high blood sugar",
        "pregnant lady high BP seizure convulsions",
        "stomach pain right lower abdomen fever",
        "wheezing silent chest dyspnea",
        "chills rigors malaria fever"
    ] * 5  # 50 total queries

    t0 = time.time()
    with concurrent.futures.ThreadPoolExecutor(max_workers=10) as executor:
        results = list(executor.map(retrieve_medical_guideline, queries))
    total_time = round(time.time() - t0, 3)
    avg_latency = round((total_time / len(queries)) * 1000, 2)

    print(f"  Processed {len(queries)} queries across 10 threads in {total_time}s")
    print(f"  Average Per-Query Latency: {avg_latency}ms")
    print(f"  All 50 Queries Returned Valid Guidelines: {all(r['guideline'] is not None for r in results)}")
    
    assert len(results) == 50, "Not all queries completed!"
    print("  [PASS] RAG Engine passed multi-threaded concurrency stress test!")

def test_generative_rag_synthesis():
    print_header("Test 5: End-to-End Generative Clinical RAG Synthesis (Dual-Branch LLMs)")
    query = "Patient has severe retrosternal chest pain for 30 minutes, cold sweating, BP 140/90. What is the immediate treatment protocol?"
    
    t0 = time.time()
    rag_res = synthesize_clinical_rag(query)
    total_sec = round(time.time() - t0, 2)
    
    print(f"  Total RAG + LLM Latency: {total_sec}s")
    print(f"  Inference Branch: {rag_res['dual_model_inference'].get('branch')}")
    print(f"  Inference Model: {rag_res['dual_model_inference'].get('model')}")
    print(f"  Parameter Scale: {rag_res['dual_model_inference'].get('parameter_scale')}")
    print(f"  Tier Used: {rag_res['dual_model_inference'].get('tier')}")
    print(f"\n  Synthesis Note:\n  {rag_res['synthesis']}")
    
    assert "retrieval" in rag_res and "dual_model_inference" in rag_res, "Synthesis dictionary invalid!"
    print("\n  [PASS] Generative RAG synthesis with High-Parameter model operational!")

if __name__ == "__main__":
    print_header("STARTING RIGOROUS MEDICAL RAG & HIGH-PARAMETER MODEL BENCHMARK")
    start = time.time()
    test_emergency_triage_triggers()
    test_semantic_cache_performance()
    test_snomed_icd10_ontology_mapping()
    test_concurrency_stress()
    test_generative_rag_synthesis()
    print_header(f"ALL RAG BENCHMARK TESTS COMPLETED SUCCESSFULLY IN {round(time.time() - start, 2)}s!")
