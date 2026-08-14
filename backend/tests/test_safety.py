from app.safety.red_flags import evaluate_safety


def test_safety_without_configured_rules_requires_review():
    result = evaluate_safety()

    assert result.safety_state == "REVIEW_REQUIRED"
    assert result.triggered_rule_ids == []
    assert result.escalation_action is None
    assert result.downstream_allowed is False


def test_safety_result_is_auditable():
    result = evaluate_safety()

    assert result.auditable_reason