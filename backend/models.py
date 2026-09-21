from typing import Literal

from pydantic import BaseModel, Field


class TriageResult(BaseModel):
    summary: str = Field(
        description="A short ticket title under 12 words that says what is wrong."
    )
    category: Literal["hardware", "software", "network", "access", "security", "other"] = Field(
        description="The kind of problem this ticket is about."
    )
    priority: Literal["critical", "high", "medium", "low"] = Field(
        description="How urgent the ticket is."
    )
    assigned_group: Literal[
        "service_desk", "desktop_support", "network", "identity_access", "security"
    ] = Field(description="The team that should work this ticket.")
    confidence: Literal["high", "medium", "low"] = Field(
        description="How sure you are about the category, priority, and group."
    )
    likely_cause: str = Field(
        description="One sentence naming the most probable cause, written as a theory rather than a diagnosis."
    )
    next_steps: list[str] = Field(
        description="Three to five concrete actions for the technician, in the order they should be done."
    )
    questions_for_user: list[str] = Field(
        description="Only missing information that would change the next steps. Empty list if nothing is missing."
    )


class TriageOutcome(BaseModel):
    result: TriageResult
    model: str
    latency_ms: int
    input_tokens: int
    output_tokens: int


class TriageResponse(BaseModel):
    id: str
    result: TriageResult
    model: str
    latency_ms: int


class ErrorResponse(BaseModel):
    error: str
    message: str
