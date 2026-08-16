from app.schemas.safety import SafetyInput
from app.safety.red_flags import evaluate_safety


def test_safety_with_no_red_flags_is_safe():
    result = evaluate_safety(SafetyInput())

    assert result.safety_state == "SAFE"
    assert result.triggered_rule_ids == []
    assert result.escalation_action is None
    assert result.downstream_allowed is True


def test_rf_001_worsening_headache():
    result = evaluate_safety(
        SafetyInput(worsening_headache=True)
    )

    assert result.safety_state == "BLOCKED_RED_FLAG"
    assert result.triggered_rule_ids == ["RF-001"]
    assert result.escalation_action == "SEEK_IMMEDIATE_MEDICAL_EVALUATION"
    assert result.downstream_allowed is False


def test_rf_002_repeated_vomiting():
    result = evaluate_safety(
        SafetyInput(repeated_vomiting=True)
    )

    assert result.safety_state == "BLOCKED_RED_FLAG"
    assert result.triggered_rule_ids == ["RF-002"]
    assert result.escalation_action == "SEEK_IMMEDIATE_MEDICAL_EVALUATION"
    assert result.downstream_allowed is False


def test_rf_003_neurological_danger_sign():
    result = evaluate_safety(
        SafetyInput(neurological_danger_sign=True)
    )

    assert result.safety_state == "BLOCKED_RED_FLAG"
    assert result.triggered_rule_ids == ["RF-003"]
    assert result.escalation_action == "SEEK_IMMEDIATE_MEDICAL_EVALUATION"
    assert result.downstream_allowed is False


def test_multiple_red_flags_are_all_returned():
    result = evaluate_safety(
        SafetyInput(
            worsening_headache=True,
            repeated_vomiting=True,
            neurological_danger_sign=True,
        )
    )

    assert result.safety_state == "BLOCKED_RED_FLAG"
    assert result.triggered_rule_ids == [
        "RF-001",
        "RF-002",
        "RF-003",
    ]
    assert result.downstream_allowed is False


def test_safety_result_is_auditable():
    result = evaluate_safety(
        SafetyInput(worsening_headache=True)
    )

    assert result.auditable_reason
    assert "RF-001" in result.triggered_rule_ids
    assert result.escalation_action is not None