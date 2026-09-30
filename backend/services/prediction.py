from typing import Dict, Any, Optional


def predict_bin_collection(capacity_percent: int, hourly_fill_rate: float) -> Dict[str, Any]:
    """
    Computes deterministic predictive collection metrics based on
    current smart-bin fill telemetry and fill velocity.
    """
    safe_rate = max(0.5, hourly_fill_rate)

    if capacity_percent >= 90:
        return {
            "estimated_hours_to_90": 0.0,
            "estimated_minutes_to_90": 0,
            "collection_recommendation": "URGENT: Bin has reached or exceeded critical 90% threshold! Dispatch collection crew immediately.",
            "priority": "CRITICAL",
            "status": "COLLECTION_REQUIRED",
        }
    elif capacity_percent >= 85:
        minutes = int(round(((90 - capacity_percent) / safe_rate) * 60))
        return {
            "estimated_hours_to_90": round((90 - capacity_percent) / safe_rate, 1),
            "estimated_minutes_to_90": max(5, minutes),
            "collection_recommendation": f"HIGH ALERT: Bin at {capacity_percent}%. Critical 90% fill expected in ~{minutes} mins. Dispatch collector.",
            "priority": "HIGH",
            "status": "COLLECTION_REQUIRED",
        }
    elif capacity_percent >= 70:
        hours = round((90 - capacity_percent) / safe_rate, 1)
        minutes = int(round(hours * 60))
        return {
            "estimated_hours_to_90": hours,
            "estimated_minutes_to_90": minutes,
            "collection_recommendation": f"PREDICTIVE NOTICE: Approaching capacity ({capacity_percent}%). Will hit critical mark in ~{hours} hrs.",
            "priority": "MEDIUM",
            "status": "NEAR_CAPACITY",
        }
    else:
        hours = round((90 - capacity_percent) / safe_rate, 1)
        return {
            "estimated_hours_to_90": hours,
            "estimated_minutes_to_90": int(hours * 60),
            "collection_recommendation": f"NORMAL: Bin capacity optimal ({capacity_percent}%). Estimated {hours} hrs until collection required.",
            "priority": "LOW",
            "status": "NORMAL",
        }
