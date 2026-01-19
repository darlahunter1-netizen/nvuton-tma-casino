import { useTonConnectUI } from '@tonconnect/ui-react';
import { beginCell, toNano } from '@ton/core';
import { useState, useEffect } from 'react';
import './NvuTONHigherLower.css';

export default function NvuTONHigherLower() {
  const [tonConnectUI] = useTonConnectUI();
  const [bet, setBet] = useState(0.5);
  const [currentNumber, setCurrentNumber] = useState(500000); // стартовое случайное
  const [streak, setStreak] = useState(0);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);

  const play = async (isHigher) => {
    if (!tonConnectUI.connected) {
      tonConnectUI.openModal();
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      // Подготавливаем сообщение для контракта: isHigher (1/0), bet
      const message = beginCell()
        .storeUint(isHigher ? 1 : 0, 1)
        .endCell();

      await tonConnectUI.sendTransaction({
        validUntil: Math.floor(Date.now() / 1000) + 300,
        messages: [{
          address: 'EQ...твой_контракт_адрес_здесь...', // ← замени на реальный
          amount: toNano(bet).toString(),
          payload: message.toBoc().toString('base64')
        }]
      });

      setResult('Ожидаем новое число...');
      
      // Имитация результата (в реальности — polling или websocket от бэкенда/контракта)
      setTimeout(() => {
        const newNum = Math.floor(Math.random() * 999999) + 1;
        const won = (isHigher && newNum > currentNumber) || (!isHigher && newNum < currentNumber);
        
        if (won) {
          setStreak(prev => prev + 1);
          setResult(`Победа! +${(bet * 1.98).toFixed(3)} TON (x${(streak + 1).toFixed(1)})`);
        } else {
          setStreak(0);
          setResult(`Проигрыш —${bet} TON`);
        }

        setCurrentNumber(newNum);
        setHistory(prev => [{ num: newNum, won, time: new Date().toLocaleTimeString() }, ...prev.slice(0, 5)]);
        setLoading(false);
      }, 1800);
    } catch (err) {
      setResult('Ошибка: ' + (err?.message || 'неизвестно'));
      setLoading(false);
    }
  };

  return (
    <div className="nvuton-hl">
      <header className="top-bar">
        <div className="balance">
          Баланс: <span>12.45 TON</span>
        </div>
        {tonConnectUI.connected ? (
          <div className="wallet-mini">
            {tonConnectUI.account?.address?.slice(0,4)}...{tonConnectUI.account?.address?.slice(-4)}
          </div>
        ) : (
          <button className="connect-btn" onClick={() => tonConnectUI.openModal()}>
            Подключить TON
          </button>
        )}
      </header>

      <main className="game-screen">
        <div className="current-number">
          {currentNumber.toLocaleString()}
        </div>

        <div className="streak-info">
          Серия: <strong>{streak}</strong> подряд
        </div>

        {result && (
          <div className={`result ${result.includes('Победа') ? 'win' : 'lose'}`}>
            {result}
          </div>
        )}
      </main>

      <div className="bet-controls">
        <div className="bet-input">
          <label>Ставка TON</label>
          <input
            type="number"
            min="0.01"
            step="0.1"
            value={bet}
            onChange={e => setBet(Number(e.target.value))}
          />
          <div className="quick-bets">
            <button onClick={() => setBet(0.1)}>0.1</button>
            <button onClick={() => setBet(0.5)}>0.5</button>
            <button onClick={() => setBet(1)}>1</button>
          </div>
        </div>

        <div className="action-buttons">
          <button 
            className="higher-btn"
            onClick={() => play(true)}
            disabled={loading || !tonConnectUI.connected}
          >
            БОЛЬШЕ
          </button>
          <button 
            className="lower-btn"
            onClick={() => play(false)}
            disabled={loading || !tonConnectUI.connected}
          >
            МЕНЬШЕ
          </button>
        </div>
      </div>

      <section className="history-panel">
        <h3>Последние раунды</h3>
        {history.length === 0 ? (
          <p>Начни игру!</p>
        ) : (
          <ul>
            {history.map((item, i) => (
              <li key={i} className={item.won ? 'win' : 'lose'}>
                {item.num.toLocaleString()} — {item.won ? 'WIN' : 'LOSE'}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}