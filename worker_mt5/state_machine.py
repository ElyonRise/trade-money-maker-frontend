"""
State Machine para o Worker Windows MetaTrader 5.
Garante transições previsíveis e seguras em conformidade com as regras de execução do SaaS.
"""

from enum import Enum
from typing import Set, Dict

class WorkerState(str, Enum):
    UNASSIGNED = "UNASSIGNED"
    PROVISIONING = "PROVISIONING"
    CONNECTING = "CONNECTING"
    READY = "READY"
    RUNNING = "RUNNING"
    PAUSED = "PAUSED"
    STOPPING = "STOPPING"
    STOPPED = "STOPPED"
    DEGRADED = "DEGRADED"
    ERROR = "ERROR"
    EMERGENCY_STOP = "EMERGENCY_STOP"

class WorkerStateMachine:
    def __init__(self, initial_state: WorkerState = WorkerState.UNASSIGNED):
        self._current_state = initial_state
        self._valid_transitions: Dict[WorkerState, Set[WorkerState]] = {
            WorkerState.UNASSIGNED: {WorkerState.PROVISIONING, WorkerState.ERROR},
            WorkerState.PROVISIONING: {WorkerState.CONNECTING, WorkerState.ERROR, WorkerState.UNASSIGNED},
            WorkerState.CONNECTING: {WorkerState.READY, WorkerState.DEGRADED, WorkerState.ERROR},
            WorkerState.READY: {WorkerState.RUNNING, WorkerState.STOPPED, WorkerState.DEGRADED, WorkerState.ERROR},
            WorkerState.RUNNING: {WorkerState.PAUSED, WorkerState.STOPPING, WorkerState.DEGRADED, WorkerState.ERROR, WorkerState.EMERGENCY_STOP},
            WorkerState.PAUSED: {WorkerState.RUNNING, WorkerState.STOPPING, WorkerState.DEGRADED, WorkerState.ERROR, WorkerState.EMERGENCY_STOP},
            WorkerState.STOPPING: {WorkerState.STOPPED, WorkerState.ERROR},
            WorkerState.STOPPED: {WorkerState.READY, WorkerState.PROVISIONING, WorkerState.UNASSIGNED, WorkerState.ERROR},
            WorkerState.DEGRADED: {WorkerState.CONNECTING, WorkerState.READY, WorkerState.ERROR, WorkerState.EMERGENCY_STOP},
            WorkerState.ERROR: {WorkerState.UNASSIGNED, WorkerState.CONNECTING, WorkerState.STOPPED},
            WorkerState.EMERGENCY_STOP: {WorkerState.STOPPED, WorkerState.ERROR},
        }

    @property
    def current_state(self) -> WorkerState:
        return self._current_state

    def can_transition(self, target_state: WorkerState) -> bool:
        return target_state in self._valid_transitions.get(self._current_state, set())

    def transition(self, target_state: WorkerState) -> bool:
        if self.can_transition(target_state):
            self._current_state = target_state
            return True
        raise ValueError(
            f"Transição inválida da State Machine: de '{self._current_state}' para '{target_state}'."
        )
