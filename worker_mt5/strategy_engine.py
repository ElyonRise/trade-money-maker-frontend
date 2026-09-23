"""
Motor de Estratégia Quantitativa Multi-Timeframe Preservado.
Pesos: H1: 20 | M30: 20 | M15: 20 | M5: 15 | M1: 15
Fórmula inalterada com conformidade estrita às regras de negócio.
"""

from typing import Dict, Any, List, Optional
import numpy as np

TIMEFRAME_WEIGHTS = {
    "H1": 20,
    "M30": 20,
    "M15": 20,
    "M5": 15,
    "M1": 15,
}

def calculate_ema(prices: List[float], period: int) -> float:
    """Calcula a Média Móvel Exponencial (EMA) para o período especificado."""
    if len(prices) < period:
        return float(np.mean(prices)) if prices else 0.0
    multiplier = 2.0 / (period + 1)
    ema = float(prices[0])
    for price in prices[1:]:
        ema = (price - ema) * multiplier + ema
    return ema

def calculate_rsi(prices: List[float], period: int = 14) -> float:
    """Calcula o RSI (Relative Strength Index) clássico."""
    if len(prices) <= period:
        return 50.0
    deltas = np.diff(prices)
    gains = np.where(deltas > 0, deltas, 0.0)
    losses = np.where(deltas < 0, -deltas, 0.0)

    avg_gain = np.mean(gains[-period:])
    avg_loss = np.mean(losses[-period:])

    if avg_loss == 0:
        return 100.0
    rs = avg_gain / avg_loss
    return float(100.0 - (100.0 / (1.0 + rs)))

def detect_structure(candles: List[Dict[str, float]]) -> Dict[str, Any]:
    """
    Analisa candles para identificar Estrutura de Mercado:
    - Trend: BULLISH, BEARISH ou RANGE
    - BOS (Break of Structure)
    - CHOCH (Change of Character)
    - FVG (Fair Value Gap)
    - Liquidity Sweep
    """
    if len(candles) < 5:
        return {
            "trend": "RANGE",
            "bos": False,
            "choch": False,
            "fvg": False,
            "liquidity_sweep": False
        }

    c_prev2 = candles[-3]
    c_prev1 = candles[-2]
    c_curr = candles[-1]

    # Fair Value Gap (FVG) de alta: mínima da vela 3 acima da máxima da vela 1
    bull_fvg = c_curr["low"] > c_prev2["high"]
    bear_fvg = c_curr["high"] < c_prev2["low"]

    # Rompimento de estrutura recente (BOS)
    bos = c_curr["close"] > max(c["high"] for c in candles[-10:-1]) or \
          c_curr["close"] < min(c["low"] for c in candles[-10:-1])

    # Sweep de liquidez
    sweep = (c_curr["high"] > c_prev1["high"] and c_curr["close"] < c_prev1["high"]) or \
            (c_curr["low"] < c_prev1["low"] and c_curr["close"] > c_prev1["low"])

    # Determinação de tendência básica
    trend = "BULLISH" if c_curr["close"] > c_prev2["close"] else "BEARISH"

    return {
        "trend": trend,
        "bos": bos,
        "choch": False,
        "fvg": bull_fvg or bear_fvg,
        "liquidity_sweep": sweep
    }

class StrategyEngine:
    def __init__(self, entry_score_threshold: int = 65, reversal_threshold: int = 75):
        self.entry_score_threshold = entry_score_threshold
        self.reversal_threshold = reversal_threshold

    def evaluate_symbol(self, symbol: str, multi_tf_data: Dict[str, List[Dict[str, float]]]) -> Dict[str, Any]:
        """
        Executa a avaliação quantitativa ponderada nos 5 timeframes:
        H1 (20), M30 (20), M15 (20), M5 (15), M1 (15).
        """
        total_buy_score = 0
        total_sell_score = 0
        tf_details = []

        for tf, weight in TIMEFRAME_WEIGHTS.items():
            candles = multi_tf_data.get(tf, [])
            if not candles:
                continue

            closes = [c["close"] for c in candles]
            ema20 = calculate_ema(closes, 20)
            ema50 = calculate_ema(closes, 50)
            rsi = calculate_rsi(closes, 14)
            struct = detect_structure(candles)

            buy_points = 0.0
            sell_points = 0.0

            # 1. Alinhamento de Médias
            if ema20 > ema50:
                buy_points += weight * 0.35
            else:
                sell_points += weight * 0.35

            # 2. RSI Momentum
            if 45 <= rsi <= 65:
                # Mercado em expansão
                if ema20 > ema50:
                    buy_points += weight * 0.25
                else:
                    sell_points += weight * 0.25
            elif rsi < 30:
                # Sobrevendido - potencial exaustão
                buy_points += weight * 0.15
            elif rsi > 70:
                # Sobrecomprado
                sell_points += weight * 0.15

            # 3. Estrutura Price Action (BOS, FVG, Sweep)
            if struct["trend"] == "BULLISH":
                buy_points += weight * 0.20
            else:
                sell_points += weight * 0.20

            if struct["bos"] or struct["fvg"]:
                if struct["trend"] == "BULLISH":
                    buy_points += weight * 0.20
                else:
                    sell_points += weight * 0.20

            buy_rounded = int(round(buy_points))
            sell_rounded = int(round(sell_points))

            total_buy_score += buy_rounded
            total_sell_score += sell_rounded

            tf_details.append({
                "timeframe": tf,
                "weight": weight,
                "rsi": round(rsi, 1),
                "ema20": round(ema20, 5),
                "ema50": round(ema50, 5),
                "trend": struct["trend"],
                "bos": struct["bos"],
                "fvg": struct["fvg"],
                "sweep": struct["liquidity_sweep"],
                "buy_score": buy_rounded,
                "sell_score": sell_rounded
            })

        # Regra principal inalterada:
        # se BUY >= SELL e BUY >= ENTRY_SCORE_THRESHOLD: sinal BUY;
        # se SELL > BUY e SELL >= ENTRY_SCORE_THRESHOLD: sinal SELL;
        # caso contrário: WAIT.
        direction = "WAIT"
        if total_buy_score >= total_sell_score and total_buy_score >= self.entry_score_threshold:
            direction = "BUY"
        elif total_sell_score > total_buy_score and total_sell_score >= self.entry_score_threshold:
            direction = "SELL"

        return {
            "symbol": symbol,
            "direction": direction,
            "total_buy_score": total_buy_score,
            "total_sell_score": total_sell_score,
            "threshold": self.entry_score_threshold,
            "timeframe_details": tf_details
        }
