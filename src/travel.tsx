import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import SkyWindows from './SkyWindows';
import ScratchStamps from './ScratchStamps';
import CabinetLetter from './CabinetLetter';
import HolographicCards from './HolographicCards';
import MemoryPuzzle from './MemoryPuzzle';
import './base-travel.css';
import './gallery-styles.css';

function Travel() {
  const [view, setView] = useState<'closed' | 'question' | 'timeline'>('closed');
  const [answer, setAnswer] = useState('');
  const [hint, setHint] = useState('');
  const dialog = useRef<HTMLDialogElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    const open = () => { setAnswer(''); setHint(''); setView('question'); };
    const reset = () => { setView('closed'); };
    window.addEventListener('travel:open', open);
    window.addEventListener('travel:reset', reset);
    return () => { window.removeEventListener('travel:open', open); window.removeEventListener('travel:reset', reset); };
  }, []);
  useEffect(() => {
    const el = dialog.current;
    if (view !== 'closed') {
      if (!el?.open) el?.showModal();
      if (el) el.scrollTop = 0;
      if (view === 'question') input.current?.focus(); else heading.current?.focus();
    } else el?.close();
  }, [view]);
  function submit(e: React.FormEvent) {
    e.preventDefault();
    const value = answer.normalize('NFKC').replace(/\s/g, '');
    if (!value) { setHint('先写下一个地方吧。'); input.current?.focus(); return; }
    if (value === '杭州' || value === '杭州市') { setHint(''); setView('timeline'); }
    else { setHint('提示：是在 2021 年哦，再想一想。'); input.current?.focus(); input.current?.select(); }
  }
  return <dialog ref={dialog} aria-labelledby={view === 'question' ? 'travel-question-title' : 'travel-timeline-title'} className={`travel-dialog ${view === 'timeline' ? 'travel-expanded' : ''}`} onCancel={() => setView('closed')} onClose={() => { document.querySelector<HTMLButtonElement>('#travelStart')?.focus(); }}>
    {view === 'question' && <div className="travel-question">
      <button type="button" className="travel-close" aria-label="关闭弹窗" onClick={() => setView('closed')}>×</button>
      <p className="travel-eyebrow">属于我们的回忆</p>
      <h2 id="travel-question-title">我们俩第一次去旅游的地方是哪里？</h2>
      <form onSubmit={submit}>
        <label htmlFor="travel-answer">写下那个地方</label>
        <input ref={input} id="travel-answer" value={answer} onChange={e => setAnswer(e.target.value)} autoComplete="off" maxLength={40} placeholder="输入城市名称" aria-describedby="travel-hint" />
        <p id="travel-hint" role="status">{hint}</p>
        <button className="travel-submit" type="submit">打开我们的回忆</button>
      </form>
    </div>}
    {view === 'timeline' && <section className="travel-timeline" aria-label="我们的旅行相册">
      <header className="travel-top"><span>我们的旅行手记</span><button onClick={() => setView('closed')}>回到蜡烛</button></header>
      <h2 id="travel-timeline-title" ref={heading} tabIndex={-1} className="album-accessible-title">我们的旅行相册</h2>
      <SkyWindows />
      <MemoryPuzzle />
      <ScratchStamps />
      <HolographicCards />
      <CabinetLetter />
    </section>}
  </dialog>;
}
const container = document.getElementById('travel-root');
if (container) createRoot(container).render(<Travel />);
