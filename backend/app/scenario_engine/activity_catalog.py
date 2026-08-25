"""Static Activity Catalog for the Track A Scenario Engine (MVP).

IMPORTANT — non-clinical:
All weights in this catalog are ENGINEERING HEURISTICS FOR MVP.
They are NOT clinical exertion measurements, NOT medically validated
scores, and NOT recovery/risk probabilities. They exist only to let
the Scenario Engine compare relative demand between activities and
plans for the same user (docs/contracts/track_a_contract.md §4.3).

`reading` explicitly assumes non-screen / print reading. If screen-based
reading (e-reader/tablet) is intended instead, `screen_exposure_weight`
should be revisited — this is a documented interpretation choice, not
a settled clinical or product fact.

This catalog is static for this implementation pass — no database
table, no dynamic loading, per the approved design (Decision: Activity
Catalog, round covering the final design proposal).
"""
from __future__ import annotations

from app.schemas.activity import ActivityCatalogItem


class UnknownActivityError(Exception):
    """Raised when a submitted activity_id is not present in the catalog.

    Carries enough information for the API layer to build the frozen
    422 validation-error shape (docs/contracts/track_a_contract.md §6).
    """

    def __init__(self, activity_id: str, index: int):
        self.activity_id = activity_id
        self.index = index
        super().__init__(f"Unknown activity_id: '{activity_id}' at activities[{index}]")


ACTIVITY_CATALOG: dict[str, ActivityCatalogItem] = {
    item.activity_id: item
    for item in [
        # cognitive: 50, physical: 10, screen: 20, recovery: 15
        # Mostly passive/receptive attention, seated, occasional
        # note-taking (light screen/paper use). Low recovery value —
        # structured obligation, not rest.
        ActivityCatalogItem(
            activity_id="class_lecture",
            activity_type="academic",
            cognitive_demand_weight=50,
            physical_demand_weight=10,
            screen_exposure_weight=20,
            recovery_opportunity=15,
        ),
        # Active, self-directed cognitive effort — higher than passive
        # lecture attendance. Typically involves a laptop/notes
        # (moderate screen). Low recovery value — sustained focus work.
        ActivityCatalogItem(
            activity_id="studying",
            activity_type="academic",
            cognitive_demand_weight=70,
            physical_demand_weight=10,
            screen_exposure_weight=50,
            recovery_opportunity=10,
        ),
        # Sustained, near-continuous screen-based high-focus work,
        # minimal physical demand, low recovery value. Values reused
        # unchanged from the existing precedent in
        # tests/test_schemas.py::test_valid_activity_catalog_item.
        ActivityCatalogItem(
            activity_id="coding",
            activity_type="cognitive",
            cognitive_demand_weight=80,
            physical_demand_weight=10,
            screen_exposure_weight=90,
            recovery_opportunity=10,
        ),
        # Sustained cognitive engagement, self-paced, lower intensity
        # than active studying/coding. ASSUMES NON-SCREEN / PRINT
        # reading (see module docstring). Moderate recovery value
        # relative to active work tasks.
        ActivityCatalogItem(
            activity_id="reading",
            activity_type="cognitive",
            cognitive_demand_weight=45,
            physical_demand_weight=5,
            screen_exposure_weight=15,
            recovery_opportunity=25,
        ),
        # Low sustained cognitive effort (fragmented attention),
        # negligible physical demand, high screen exposure by
        # definition. Recovery value kept modest — still screen-based,
        # not treated as high-recovery despite being "downtime".
        ActivityCatalogItem(
            activity_id="phone_social_media",
            activity_type="screen",
            cognitive_demand_weight=20,
            physical_demand_weight=5,
            screen_exposure_weight=70,
            recovery_opportunity=20,
        ),
        # Light physical exertion, minimal cognitive/screen load.
        # Meaningfully restorative relative to seated cognitive work —
        # commonly used as an active-recovery activity.
        ActivityCatalogItem(
            activity_id="walking",
            activity_type="physical",
            cognitive_demand_weight=10,
            physical_demand_weight=35,
            screen_exposure_weight=0,
            recovery_opportunity=55,
        ),
        # Higher physical exertion than walking, still low
        # cognitive/screen demand. Recovery value lower than walking
        # since it is more exertional, but still positive relative to
        # cognitive-heavy activities.
        ActivityCatalogItem(
            activity_id="light_exercise",
            activity_type="physical",
            cognitive_demand_weight=15,
            physical_demand_weight=55,
            screen_exposure_weight=0,
            recovery_opportunity=35,
        ),
        # Canonical zero-demand, maximal-recovery reference point. Used
        # by the Scenario Engine to determine whether a plan includes a
        # declared recovery activity (main_concerns:
        # no_declared_recovery_activity_in_plan).
        ActivityCatalogItem(
            activity_id="rest",
            activity_type="rest",
            cognitive_demand_weight=0,
            physical_demand_weight=0,
            screen_exposure_weight=0,
            recovery_opportunity=100,
        ),
    ]
}


def get_activity(activity_id: str, index: int) -> ActivityCatalogItem:
    """Look up a catalog entry, raising UnknownActivityError if absent."""
    item = ACTIVITY_CATALOG.get(activity_id)
    if item is None:
        raise UnknownActivityError(activity_id=activity_id, index=index)
    return item
