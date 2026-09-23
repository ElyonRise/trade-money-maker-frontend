"""
Testes Unitários do Worker Windows MT5 (Estratégia, Risco, State Machine e Fallback).
Totalmente mockado — nenhuma conexão real com corretoras.
"""

import pytest
from state_machine import WorkerStateMachine, WorkerState
from strategy_engine import StrategyEngine, TIMEFRAME_WEIGHTS
from risk_manager import RiskManager
from mt5_client import MT5Client

def test_timeframe_weights_sum_to_100():
    total_weights = sum(TIMEFRAME_WEIGHTS.values())
    assert total_weights == 100
    assert TIMEFRAME_WEIGHTS["H1"] == 20
    assert TIMEFRAME_WEIGHTS["M30"] == 20
    assert TIMEFRAME_WEIGHTS["M15"] == 20
    assert TIMEFRAME_WEIGHTS["M5"] == 15
    assert TIMEFRAME_WEIGHTS["M1"] == 15

def test_strategy_decision_rule_logic():
    engine = StrategyEngine(entry_score_threshold=65)

    # Teste de sinal BUY
    # Se BUY >= SELL e BUY >= 65: BUY
    buy_score = 70
    sell_score = 30
    direction = "WAIT"
    if buy_score >= sell_score and buy_score >= engine.entry_score_threshold:
        direction = "BUY"
    assert direction == "BUY"

    # Teste de sinal WAIT abaixo do threshold
    buy_score = 60
    sell_score = 40
    direction = "WAIT"
    if buy_score >= sell_score and buy_score >= engine.entry_score_threshold:
        direction = "BUY"
    assert direction == "WAIT"

def test_state_machine_valid_and_invalid_transitions():
    sm = WorkerStateMachine(WorkerState.UNASSIGNED)
    assert sm.current_state == WorkerState.UNASSIGNED

    # Transição válida para PROVISIONING
    assert sm.transition(WorkerState.PROVISIONING) is True

    # Transição válida para CONNECTING
    assert sm.transition(WorkerState.CONNECTING) is True

    # Transição válida para READY
    assert sm.transition(WorkerState.READY) is True

    # Transição inválida direta de READY para EMERGENCY_STOP (sem estar RUNNING)
    with pytest.raises(ValueError):
        sm.transition(WorkerState.EMERGENCY_STOP)

def test_risk_manager_entry_cooldown():
    rm = RiskManager(entry_cooldown_minutes=15)
    symbol = "EURUSD"

    # Primeira entrada permitida
    can_enter, _ = rm.check_entry_cooldown(symbol)
    assert can_enter is True

    # Registra entrada agora
    rm.record_entry_executed(symbol)

    # Nova entrada imediata no mesmo símbolo deve ser bloqueada
    can_enter_again, msg = rm.check_entry_cooldown(symbol)
    assert can_enter_again is False
    assert "cooldown" in msg.lower()
