from app.planner.alternatives import generate_alternatives
from app.schemas.simulation import ActivityInput, ModeledDemand


def test_reduce_duration_removes_long_block_penalty():
    activities = [
        ActivityInput(
            activity_id="coding",
            duration_minutes=120,
        )
    ]

    original_demand = ModeledDemand(
        cognitive_demand_level="high",
        physical_demand_level="low",
        screen_exposure_level="high",
        recovery_opportunity_level="low",
    )

    alternatives = generate_alternatives(
        activities,
        original_demand,
    )

    reduce_option = next(
        option
        for option in alternatives
        if option.strategy == "reduce_duration"
    )

    assert reduce_option.activities[0].duration_minutes == 60

    assert reduce_option.improvement_score > 0


def test_reduce_duration_keeps_activity_id():
    activities = [
        ActivityInput(
            activity_id="coding",
            duration_minutes=120,
        )
    ]

    original_demand = ModeledDemand(
        cognitive_demand_level="high",
        physical_demand_level="low",
        screen_exposure_level="high",
        recovery_opportunity_level="low",
    )

    alternatives = generate_alternatives(
        activities,
        original_demand,
    )

    reduce_option = next(
        option
        for option in alternatives
        if option.strategy == "reduce_duration"
    )

    assert reduce_option.activities[0].activity_id == "coding"
    assert reduce_option.activities[0].duration_minutes == 60


def test_coding_60_is_not_long_continuous_block():
    from app.scenario_engine.scenario_engine import _find_long_blocks

    activities = [
        ActivityInput(
            activity_id="coding",
            duration_minutes=60,
        )
    ]

    assert _find_long_blocks(activities) == []


def test_coding_120_is_long_continuous_block():
    from app.scenario_engine.scenario_engine import _find_long_blocks

    activities = [
        ActivityInput(
            activity_id="coding",
            duration_minutes=120,
        )
    ]

    blocks = _find_long_blocks(activities)

    assert len(blocks) == 1
    assert blocks[0].duration_minutes == 120