from __future__ import annotations

from enum import Enum


class Audience(str, Enum):
    GENERAL = "general"
    ADULT = "adult"
    PEDIATRIC = "pediatric"
    SPORT = "sport"


AUDIENCE_TERMS = {
    Audience.GENERAL: (),
    Audience.ADULT: ("adult", "18 years and older"),
    Audience.PEDIATRIC: ("children", "adolescent", "pediatric"),
    Audience.SPORT: ("sport", "athlete"),
}

CHROMA_AUDIENCE_VALUES = {
    Audience.ADULT: "adults 18 years and older",
    Audience.PEDIATRIC: "children and adolescents",
    Audience.SPORT: "sport-related concussion",
}


def audience_matches(requested: Audience | None, candidate: str) -> bool | None:
    if requested is None or requested is Audience.GENERAL:
        return None
    candidate = candidate.lower()
    return any(term in candidate for term in AUDIENCE_TERMS[requested])
