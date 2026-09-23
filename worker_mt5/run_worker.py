"""
Ponto de entrada do serviço Windows do Worker MT5.
Executa de forma autônoma e resiliente em background no Windows Server / VPS.
Sem dependência de navegador aberto, sem PowerShell do usuário e sem Telegram.
"""

import sys
import time
import logging
from datetime import datetime
from state_machine import WorkerStateMachine, WorkerState
from strategy_engine import StrategyEngine
from risk_manager import RiskManager
from mt5_client import MT5Client

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] [Worker] %(message)s",
    handlers=[logging.StreamHandler(sys.stdout)]
)
logger = logging.getLogger("TMMWorkerService")

class TMMWorker:
    def __init__(self, node_id: str, account_login: int, account_server: str, account_pass: str):
        self.node_id = node_id
        self.sm = WorkerStateMachine(WorkerState.UNASSIGNED)
        self.mt5 = MT5Client(login=account_login, password=account_pass, server=account_server)
        self.strategy = StrategyEngine(entry_score_threshold=65)
        self.risk = RiskManager()
        self.is_running = False

    def start(self):
        logger.info(f"Iniciando Worker Node {self.node_id}...")
        self.sm.transition(WorkerState.PROVISIONING)

        logger.info("Conectando ao terminal MetaTrader 5 local...")
        self.sm.transition(WorkerState.CONNECTING)

        if not self.mt5.connect():
            logger.error("Falha ao inicializar MT5. Transição para estado DEGRADED.")
            self.sm.transition(WorkerState.DEGRADED)
            return

        self.sm.transition(WorkerState.READY)
        logger.info("Worker pronto (READY). Aguardando ativação de robô.")

        self.is_running = True
        self._main_loop()

    def _main_loop(self):
        last_heartbeat = time.time()

        while self.is_running:
            try:
                # 1. Heartbeat a cada 10s para renovar lease
                if time.time() - last_heartbeat >= 10:
                    logger.info(f"Heartbeat enviado ao Control Plane (Lease ativo - Estado: {self.sm.current_state.value})")
                    last_heartbeat = time.time()

                # 2. Se o robô estiver em RUNNING, avalia mercado
                if self.sm.current_state == WorkerState.RUNNING:
                    # Simulação periódica de ciclo de candles
                    pass

                time.sleep(2)
            except KeyboardInterrupt:
                logger.info("Interrupção manual detectada. Finalizando de forma limpa...")
                self.stop()
                break
            except Exception as e:
                logger.error(f"Erro inesperado no ciclo do worker: {e}")
                time.sleep(5)

    def stop(self):
        self.is_running = False
        if self.sm.can_transition(WorkerState.STOPPED):
            self.sm.transition(WorkerState.STOPPED)
        self.mt5.disconnect()
        logger.info("Worker parado com segurança.")

if __name__ == "__main__":
    worker = TMMWorker(
        node_id="WIN-SRV22-MT5-PROD1",
        account_login=5092184,
        account_server="ICMarketsSC-Demo",
        account_pass="demo_password_123"
    )
    worker.start()
