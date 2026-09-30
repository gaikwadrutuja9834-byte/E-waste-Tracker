from typing import Dict, Any


def calculate_environmental_impact(waste_type: str, weight_kg: float) -> Dict[str, float]:
    """
    Computes grounded SDG 11 environmental impact metrics based on tracked waste weight.
    """
    if waste_type == "E_WASTE":
        co2_factor = 1.45  # kg CO2e saved per kg recycled
        diversion_factor = 1.0  # 100% diverted from illegal dumping
        toxic_g_factor = 18.5  # grams of toxic heavy metals prevented
        energy_kwh_factor = 3.2  # kWh energy conserved
    elif waste_type == "DRY_RECYCLABLE":
        co2_factor = 0.95
        diversion_factor = 0.92
        toxic_g_factor = 0.0
        energy_kwh_factor = 1.8
    else:  # BIODEGRADABLE
        co2_factor = 0.52  # Methane avoidance
        diversion_factor = 0.85
        toxic_g_factor = 0.0
        energy_kwh_factor = 0.4

    diverted_kg = round(weight_kg * diversion_factor, 2)
    co2_saved_kg = round(weight_kg * co2_factor, 2)
    toxic_prevented_g = round(weight_kg * toxic_g_factor, 1)
    energy_kwh = round(weight_kg * energy_kwh_factor, 2)

    return {
        "landfill_diversion_kg": diverted_kg,
        "co2_saved_kg": co2_saved_kg,
        "toxic_prevented_g": toxic_prevented_g,
        "energy_conserved_kwh": energy_kwh,
    }
