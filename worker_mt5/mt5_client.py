"""
Cliente Wrapper MetaTrader 5 Nativo para Windows.
Implementa cascata de preenchimento inteligente: FOK -> IOC -> RETURN.
Resolve sufixos de corretoras e garante compatibilidade entre versões da lib MetaTrader5.
"""

import logging
from typing import Optional, Dict, Any, List

logger = logging.getLogger("MT5Client")

# Constantes oficiais de preenchimento MT5
ORDER_FILLING_FOK = 0
ORDER_FILLING_IOC = 1
ORDER_FILLING_RETURN = 2

TRADE_RETCODE_DONE = 10009
TRADE_RETCODE_INVALID_FILL = 10030

try:
    import MetaTrader5 as mt5
    MT5_AVAILABLE = True
except ImportError:
    mt5 = None
    MT5_AVAILABLE = False
    logger.warning("Biblioteca MetaTrader5 não instalada (Modo Mock ativo para testes).")

class MT5Client:
    def __init__(self, login: int, password: str, server: str, path: Optional[str] = None):
        self.login = login
        self.password = password
        self.server = server
        self.path = path
        self.is_connected = False

    def connect(self) -> bool:
        """Inicializa e autentica no terminal MT5 local do Windows."""
        if not MT5_AVAILABLE:
            logger.info("MT5 Mock: Conexão simulada com sucesso.")
            self.is_connected = True
            return True

        init_kwargs = {}
        if self.path:
            init_kwargs["path"] = self.path

        if not mt5.initialize(**init_kwargs):
            logger.error(f"Falha ao inicializar terminal MT5: {mt5.last_error()}")
            return False

        authorized = mt5.login(login=self.login, password=self.password, server=self.server)
        if not authorized:
            logger.error(f"Falha de autenticação no servidor MT5 '{self.server}': {mt5.last_error()}")
            mt5.shutdown()
            return False

        self.is_connected = True
        logger.info(f"Conectado com sucesso à conta {self.login} no servidor {self.server}.")
        return True

    def disconnect(self):
        """Desconecta e finaliza o terminal."""
        if MT5_AVAILABLE and self.is_connected:
            mt5.shutdown()
        self.is_connected = False

    def resolve_symbol_name(self, base_symbol: str) -> Optional[str]:
        """
        Resolve sufixos de corretora (ex: EURUSDm, EURUSD.r, EURUSD_i).
        Garante compatibilidade multiativos com qualquer corretora.
        """
        if not MT5_AVAILABLE:
            return base_symbol

        # Testa símbolo exato
        info = mt5.symbol_info(base_symbol)
        if info is not None:
            if not info.visible:
                mt5.symbol_select(base_symbol, True)
            return base_symbol

        # Busca por variações de sufixos conhecidos
        all_symbols = mt5.symbols_get()
        if all_symbols:
            for s in all_symbols:
                if s.name.startswith(base_symbol) and len(s.name) <= len(base_symbol) + 3:
                    if not s.visible:
                        mt5.symbol_select(s.name, True)
                    return s.name

        return None

    def send_order_with_filling_cascade(
        self,
        symbol: str,
        action_type: str,
        volume: float,
        sl_points: int,
        tp_points: int,
        magic: int = 882910
    ) -> Dict[str, Any]:
        """
        Envia ordem a mercado com cascata resiliente de modos de preenchimento:
        1. Tenta FOK (Fill or Kill)
        2. Se retcode for 10030 (TRADE_RETCODE_INVALID_FILL), tenta IOC (Immediate or Cancel)
        3. Se ainda rejeitado por fill, tenta RETURN
        """
        resolved_sym = self.resolve_symbol_name(symbol)
        if not resolved_sym:
            return {"success": False, "message": f"Símbolo {symbol} não encontrado na corretora."}

        if not MT5_AVAILABLE:
            # Simulação segura para ambiente sem MT5
            return {
                "success": True,
                "ticket": 9901234,
                "retcode": TRADE_RETCODE_DONE,
                "filling_mode_used": "FOK (Simulado)",
                "message": f"Ordem {action_type} {volume}L {resolved_sym} preenchida com sucesso."
            }

        symbol_info = mt5.symbol_info(resolved_sym)
        if symbol_info is None:
            return {"success": False, "message": f"Não foi possível obter dados do símbolo {resolved_sym}."}

        point = symbol_info.point
        digits = symbol_info.digits

        tick = mt5.symbol_info_tick(resolved_sym)
        if tick is None:
            return {"success": False, "message": f"Preço de mercado indisponível para {resolved_sym}."}

        is_buy = action_type.upper() == "BUY"
        price = tick.ask if is_buy else tick.bid
        order_type = 0 if is_buy else 1  # mt5.ORDER_TYPE_BUY = 0, mt5.ORDER_TYPE_SELL = 1

        sl = price - (sl_points * point) if is_buy else price + (sl_points * point)
        tp = price + (tp_points * point) if is_buy else price - (tp_points * point)

        # Ordem de tentativa: FOK -> IOC -> RETURN
        filling_candidates = [
            (ORDER_FILLING_FOK, "FOK"),
            (ORDER_FILLING_IOC, "IOC"),
            (ORDER_FILLING_RETURN, "RETURN")
        ]

        last_result = None
        for fill_mode, fill_name in filling_candidates:
            request = {
                "action": 1,  # mt5.TRADE_ACTION_DEAL
                "symbol": resolved_sym,
                "volume": float(volume),
                "type": order_type,
                "price": float(price),
                "sl": float(round(sl, digits)),
                "tp": float(round(tp, digits)),
                "deviation": 20,
                "magic": magic,
                "comment": f"TMM-{fill_name}",
                "type_time": 0,  # mt5.ORDER_TIME_GTC
                "type_filling": fill_mode,
            }

            result = mt5.order_send(request)
            last_result = result

            if result is None:
                continue

            if result.retcode == TRADE_RETCODE_DONE:
                return {
                    "success": True,
                    "ticket": result.order,
                    "retcode": result.retcode,
                    "filling_mode_used": fill_name,
                    "message": f"Ordem executada via {fill_name} (Ticket #{result.order})."
                }

            # Se o erro NÃO for de filling inválido (10030), aborta para evitar spam
            if result.retcode != TRADE_RETCODE_INVALID_FILL:
                return {
                    "success": False,
                    "ticket": 0,
                    "retcode": result.retcode,
                    "filling_mode_used": fill_name,
                    "message": f"Ordem rejeitada com retcode {result.retcode}: {result.comment}"
                }

        retcode = last_result.retcode if last_result else -1
        return {
            "success": False,
            "ticket": 0,
            "retcode": retcode,
            "message": f"Todos os modos de filling (FOK/IOC/RETURN) falharam com retcode {retcode}."
        }

    def close_all_positions(self) -> int:
        """Fecha todas as posições abertas a mercado imediatamente."""
        if not MT5_AVAILABLE:
            return 0

        positions = mt5.positions_get()
        if not positions:
            return 0

        closed_count = 0
        for pos in positions:
            tick = mt5.symbol_info_tick(pos.symbol)
            if not tick:
                continue

            is_buy = pos.type == 0
            price = tick.bid if is_buy else tick.ask
            close_type = 1 if is_buy else 0

            request = {
                "action": 1,  # TRADE_ACTION_DEAL
                "position": pos.ticket,
                "symbol": pos.symbol,
                "volume": pos.volume,
                "type": close_type,
                "price": price,
                "deviation": 30,
                "comment": "TMM-EMERGENCY-CLOSE",
                "type_filling": ORDER_FILLING_IOC,
            }
            res = mt5.order_send(request)
            if res and res.retcode == TRADE_RETCODE_DONE:
                closed_count += 1

        return closed_count
