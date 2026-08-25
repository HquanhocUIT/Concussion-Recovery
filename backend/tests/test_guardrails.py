from app.schemas.safety import SafetyInput
from app.safety.guardrails import enforce_safety
from app.safety.red_flags import evaluate_safety


def test_blocked_red_flag_remains_blocked():
    result = evaluate_safety(
        SafetyInput(worsening_headache=True)
    )

    guarded = enforce_safety(result)

    assert guarded.safety_state == "BLOCKED_RED_FLAG"
    assert guarded.triggered_rule_ids == ["RF-001"]
    assert guarded.downstream_allowed is False


def test_multiple_red_flags_remain_blocked():
    result = evaluate_safety(
        SafetyInput(
            worsening_headache=True,
            repeated_vomiting=True,
            neurological_danger_sign=True,
        )
    )

    guarded = enforce_safety(result)

    assert guarded.safety_state == "BLOCKED_RED_FLAG"
    assert guarded.triggered_rule_ids == [
        "RF-001",
        "RF-002",
        "RF-003",
    ]
    assert guarded.downstream_allowed is False


def test_safe_result_remains_safe():
    result = evaluate_safety(SafetyInput())

    guarded = enforce_safety(result)

    assert guarded.safety_state == "SAFE"
    assert guarded.triggered_rule_ids == []
    assert guarded.downstream_allowed is True