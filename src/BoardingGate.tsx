import React, { useEffect, useRef, useState } from 'react';
import './boarding-gate.css';
import BoardingReader from './BoardingReader';

type Status = 'ready' | 'reading' | 'error' | 'accepted';
export default function BoardingGate({ onBoard }: { onBoard: () => void }) {
  const ticket = useRef<HTMLButtonElement>(null);
  const reader = useRef<HTMLDivElement>(null);
  const timer = useRef<number | undefined>(undefined);
  const gesture = useRef<{ id: number; x: number; y: number; left: number; top: number; width: number; height: number; lastX: number; travel: number; touched: boolean } | null>(null);
  const [position, setPosition] = useState({ x: 0, y: 0, tilt: -4 });
  const [dragging, setDragging] = useState(false);
  const [status, setStatus] = useState<Status>('ready');
  useEffect(() => () => window.clearTimeout(timer.current), []);
  const accept = () => {
    if (status === 'accepted') return;
    setStatus('accepted'); setDragging(false); gesture.current = null;
    timer.current = window.setTimeout(onBoard, 950);
  };
  const down = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (status === 'accepted' || e.button !== 0) return;
    const bounds = e.currentTarget.getBoundingClientRect();
    gesture.current = { id: e.pointerId, x: e.clientX - position.x, y: e.clientY - position.y, left: bounds.left - position.x, top: bounds.top - position.y, width: bounds.width, height: bounds.height, lastX: e.clientX, travel: 0, touched: status === 'reading' };
    setDragging(true); if (status !== 'reading') setStatus('ready');
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const move = (e: React.PointerEvent<HTMLButtonElement>) => {
    const drag = gesture.current, slot = reader.current?.getBoundingClientRect();
    if (!drag || drag.id !== e.pointerId || !slot) return;
    const x = e.clientX - drag.x, y = e.clientY - drag.y;
    const dx = e.clientX - drag.lastX;
    setPosition({ x, y, tilt: Math.max(-9, Math.min(9, dx * .35)) });
    const barcodeY = drag.top + y + drag.height * .91;
    const overlapX = drag.left + x + drag.width > slot.left + 12 && drag.left + x < slot.right - 12;
    const alignedY = Math.abs(barcodeY - slot.top) < Math.max(25, drag.height * .2);
    const aligned = overlapX && alignedY;
    if (aligned) {
      drag.touched = true; drag.travel += Math.abs(dx);
      setStatus('reading');
    } else if (drag.touched) {
      const fullyCleared = drag.left + x >= slot.right + 4 || drag.left + x + drag.width <= slot.left - 4;
      if (alignedY && fullyCleared) accept();
      else if (!alignedY) { drag.touched = false; setStatus('error'); }
    }
    drag.lastX = e.clientX;
  };
  const up = (e: React.PointerEvent<HTMLButtonElement>) => {
    const drag = gesture.current;
    if (!drag || drag.id !== e.pointerId) return;
    gesture.current = null; setDragging(false);
    if (!drag.touched || e.type === 'pointercancel') {
      setPosition({ x: 0, y: 0, tilt: -4 });
      if (drag.travel > 4 || e.type === 'pointercancel') setStatus('error');
    }
    if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId);
  };
  return <div className={`boarding-gate gate-${status}${dragging ? ' gate-dragging' : ''}`}>
    <div className="boarding-workspace">
      <button ref={ticket} className="boarding-pass" type="button" aria-label="拖动登机牌，将底部条码横向划过读卡器；也可按回车登机" style={{ '--ticket-x': `${position.x}px`, '--ticket-y': `${position.y}px`, '--ticket-tilt': `${position.tilt}deg` } as React.CSSProperties} onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up} onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); accept(); } }}>
        <div className="boarding-pass-main">
          <div className="boarding-brand"><b>✈</b><span>OUR JOURNEY AIR</span><em>BOARDING PASS</em></div>
          <div className="boarding-passenger"><small>PASSENGERS / 乘客</small><strong>我们俩</strong><span>TOGETHER, EVERYWHERE.</span></div>
          <div className="boarding-route"><div><small>FROM</small><strong>回忆</strong><span>EVERY YESTERDAY</span></div><i>✈</i><div><small>TO</small><strong>未来</strong><span>OUR NEXT CHAPTER</span></div></div>
          <div className="boarding-details"><div><small>GATE</small><b>02</b></div><div><small>BOARDING</small><b>NOW</b></div><div><small>SEAT</small><b>01A</b></div><div><small>CLASS</small><b>LOVE</b></div></div>
          <div className="boarding-message">每一程，都想和你一起。</div>
          <div className="boarding-barcode" />
        </div>
        <div className="boarding-stub"><span>✈ OUR JOURNEY</span><small>FLIGHT</small><strong>LOVE 02</strong><small>PASSENGERS</small><b>我们俩</b><small>SEAT</small><strong>01A / 01B</strong><div>ONE WAY</div></div>
      </button>
      <div className="boarding-reader" ref={reader}>
        <BoardingReader status={status}/>
      </div>
    </div>
    <p className="boarding-instruction">{status === 'accepted' ? '登机成功，欢迎来到我们的旅程' : status === 'error' ? '把底部条码对准卡槽，再横向划过一次' : '拖动登机牌，将底部条码横向划过读卡器'}</p>
    <button className="boarding-skip" type="button" onClick={accept} disabled={status === 'accepted'}>直接登机 →</button>
  </div>;
}
