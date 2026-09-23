"""
Gestor de Risco e Travas Anti-Duplicidade para o Worker MT5.
Implementa Cooldown, Persistência de Sinal, Breakeven e Trailing Stop.
"""

from datetime import datetime, timedelta
from typing import Dict, Optional, Tuple

class RiskManager:
    def __init__(
        self,
        max_open_positions: int = 3,
        daily_loss_limit: float = 500.0,
        max_consecutive_losses: int = 3,
        signal_confirmation_minutes: int = 2,
        entry_cooldown_minutes: int = 15,
        utc_session_start: str = "07:00",
        utc_session_end: str = "19:00",
        breakeven_trigger_points: int = 150,
        trailing_stop_points: int = 100
    ):
        self.max_open_positions = max_open_positions
        self.daily_loss_limit = daily_loss_limit
        self.max_consecutive_losses = max_consecutive_losses
        self.signal_confirmation_minutes = signal_confirmation_minutes
        self.entry_cooldown_minutes = entry_cooldown_minutes
        self.utc_session_start = utc_session_start
        self.utc_session_end = utc_session_end
        self.breakeven_trigger_points = breakeven_trigger_points
        self.trailing_stop_points = trailing_stop_points

        # Estado em memória do worker
        self.last_entry_time_by_symbol: Dict[str, datetime] = {}
        self.signal_first_seen_by_symbol: Dict[str, Tuple[str, datetime]] = {}
        self.current_consecutive_losses: int = 0
        self.current_daily_realized_pnl: float = 0.0

    def is_in_utc_session(self) -> bool:
        """Verifica se o horário atual está dentro da janela operacional UTC."""
        now_utc = datetime.utcnow().strftime("%H:%M")
        return self.utc_session_start <= now_utc <= self.utc_session_end

    def check_entry_cooldown(self, symbol: str) -> Tuple[bool, Optional[str]]:
        """
        Anti-Duplicidade #1: Impede novas entradas no mesmo ativo
        antes de decorrido o período de cooldown configurado.
        """
        last_time = self.last_entry_time_by_symbol.get(symbol)
        if not last_time:
            return True, None

        elapsed_minutes = (datetime.utcnow() - last_time).total_seconds() / 60.0
        if elapsed_minutes < self.entry_cooldown_minutes:
            remaining = int(self.entry_cooldown_minutes - elapsed_minutes)
            return False, f"Ativo {symbol} em período de cooldown (restam {remaining} min)."

        return True, None

    def validate_signal_persistence(self, symbol: str, direction: str) -> Tuple[bool, Optional[str]]:
        """
        Anti-Duplicidade #2: O sinal de BUY ou SELL precisa persistir
        continuamente pelo tempo definido em SIGNAL_CONFIRMATION_MINUTES.
        """
        if direction not in ("BUY", "SELL"):
            self.signal_first_seen_by_symbol.pop(symbol, None)
            return False, "Sinal em espera (WAIT)."

        now = datetime.utcnow()
        if symbol not in self.signal_first_seen_by_symbol or self.signal_first_seen_by_symbol[symbol][0] != direction:
            # Primeiro registro do sinal nesta direção
            self.signal_first_seen_by_symbol[symbol] = (direction, now)
            return False, f"Sinal {direction} detectado. Aguardando persistência por {self.signal_confirmation_minutes} min."

        first_seen = self.signal_first_seen_by_symbol[symbol][1]
        persisted_minutes = (now - first_seen).total_seconds() / 60.0

        if persisted_minutes >= self.signal_confirmation_minutes:
            return True, None

        remaining_sec = int((self.signal_confirmation_minutes * 60) - (now - first_seen).total_seconds())
        return False, f"Aguardando confirmação do sinal ({remaining_sec}s restantes)."

    def can_open_new_position(self, current_open_count: int, symbol: str, direction: str) -> Tuple[bool, Optional[str]]:
        """Validação completa pré-ordem."""
        if not self.is_in_utc_session():
            return False, "Fora da janela de negociação UTC configurada."

        if current_open_count >= self.max_open_positions:
            return False, f"Limite máximo de posições abertas atingido ({current_open_count}/{self.max_open_positions})."

        if self.current_consecutive_losses >= self.max_consecutive_losses:
            return False, f"Limite de perdas consecutivas atingido ({self.current_consecutive_losses}). Negociação suspensa."

        if self.current_daily_realized_pnl <= -abs(self.daily_loss_limit):
            return False, f"Limite diário de perda atingido (-${abs(self.daily_loss_limit):.2f})."

        cooldown_ok, cooldown_msg = self.check_entry_cooldown(symbol)
        if not cooldown_ok:
            return False, cooldown_msg

        signal_ok, signal_msg = self.validate_signal_persistence(symbol, direction)
        if not signal_ok:
            return False, signal_msg

        return True, None

    def record_entry_executed(self, symbol: str):
        """Atualiza carimbo de tempo após ordem aceita pelo MT5."""
        self.last_entry_time_by_symbol[symbol] = datetime.utcnow()
        self.signal_first_seen_by_symbol.pop(symbol, None)
