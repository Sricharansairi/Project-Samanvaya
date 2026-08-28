from datetime import datetime, timedelta

def flag_stalled_cases(active_cases: list, threshold_hours: int = 2) -> list:
    """
    (Feature 69: Self-Scoped 'Stalled Case' Flag)
    Scans internal submitted histories and flags cases that have been sitting un-consulted
    beyond the threshold time. Does not rely on cross-department data (as per scope guardrails).
    
    Args:
        active_cases: list of dicts with 'id', 'submitted_at', 'status', 'patient_name'
        threshold_hours: hours before flagging
        
    Returns:
        List of flagged cases with alert messages.
    """
    stalled = []
    now = datetime.now()
    threshold_time = timedelta(hours=threshold_hours)
    
    for case in active_cases:
        if case.get('status') == 'waiting':
            try:
                # Mock parsing, assuming ISO format for the demo
                submitted = datetime.fromisoformat(case.get('submitted_at', now.isoformat()))
                waiting_duration = now - submitted
                
                if waiting_duration > threshold_time:
                    case['stalled_flag'] = True
                    case['alert'] = f"Stalled Case: Patient waiting for {waiting_duration.seconds // 3600} hours without consultation."
                    stalled.append(case)
            except Exception as e:
                print(f"Error parsing date for case {case.get('id')}: {e}")
                
    return stalled
