def grade_battery(soh: float) -> str:
    if soh >= 80:
        return "A"
    if soh >= 60:
        return "B"
    return "C"


def recommendation_for_grade(grade: str) -> str:
    recommendations = {
        "A": "Reuse",
        "B": "Refurbish",
        "C": "Recycle",
    }
    return recommendations[grade]


def estimate_rul(soh: float) -> float:
    """
    Remaining Useful Life estimate in years.
    Simple hackathon-friendly approximation.
    """

    if soh >= 90:
        return 8.0

    if soh >= 80:
        return 6.0

    if soh >= 70:
        return 4.0

    if soh >= 60:
        return 2.0

    return 1.0


def estimate_residual_value(soh: float) -> float:
    """
    Estimated residual battery value in INR.
    """

    max_value = 200000

    value = (soh / 100) * max_value

    return round(value, 0)


def estimate_co2_saved(grade: str) -> float:
    """
    Estimated CO₂ savings in kg.
    """

    savings = {
        "A": 48.0,
        "B": 25.0,
        "C": 0.0,
    }

    return savings.get(grade, 0.0)


def get_risk_alert(
    voltage: float,
    current: float,
    temperature: float,
    cycle_count: int,
    soh: float,
):
    alerts = []

    if temperature > 40:
        alerts.append(
            "Thermal degradation pattern detected"
        )

    if cycle_count > 1200:
        alerts.append(
            "Battery approaching end-of-life cycle range"
        )

    if current > 60:
        alerts.append(
            "High discharge stress observed"
        )

    if soh < 70:
        alerts.append(
            "Second-life deployment not recommended. Route to recycling."
        )

    elif soh < 80:
        alerts.append(
            "Suitable for refurbishment before reuse."
        )

    return alerts


def get_risk_level(
    temperature: float,
    cycle_count: int,
    soh: float,
) -> str:

    if soh >= 80:
        return "LOW"

    elif soh >= 60:
        return "MEDIUM"

    return "HIGH" 


def explain_prediction(
    voltage: float,
    current: float,
    temperature: float,
    cycle_count: int,
    capacity: float,
):
    reasons = []

    if capacity < 1.2:
        reasons.append(
            "Battery capacity is significantly reduced, lowering overall State of Health."
        )

    if cycle_count > 1000:
        reasons.append(
            "High cycle count indicates long-term degradation from repeated charging cycles."
        )

    if temperature > 35:
        reasons.append(
            "Elevated operating temperature accelerates battery aging."
        )

    if voltage < 3.2:
        reasons.append(
            "Lower voltage suggests reduced energy retention capability."
        )

    if current > 2.0:
        reasons.append(
            "Higher current draw increases stress on battery cells."
        )

    if not reasons:
        reasons.append(
            "Battery parameters are within normal operating range."
        )

    return reasons