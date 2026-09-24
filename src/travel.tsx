import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import type { Step } from '../components/ui/how-it-works';
import AccordionGallery from '../components/AccordionGallery';
import { tripDetails } from './trip-details';
import SkyWindows from './SkyWindows';
import ScratchStamps from './ScratchStamps';
import CabinetLetter from './CabinetLetter';
import './base-travel.css';
import './gallery-styles.css';

const trips: Step[] = [
  { date: '2021.5', title: '杭州', description: '我们第一次一起去旅行', image: './assets/trip-1.png', colorTheme: 'orange' },
  { date: '2021.9', title: '成都', description: '一起走过的第二站', image: './assets/trip-2.png', colorTheme: 'blue' },
  { date: '2023.6', title: '广西 · 重庆', description: '这一程，去了两个地方', image: './assets/trip-3.jpg', colorTheme: 'purple' },
  { date: '2024.1', title: '赛里木湖', description: '第一次一起到赛里木湖', image: './assets/trip-4.png', colorTheme: 'orange' },
  { date: '2025.2', title: '赛里木湖', description: '我们又一起回到这里', image: './assets/trip-5.png', colorTheme: 'blue' },
];
function Travel() {
  const [view, setView] = useState<'closed' | 'question' | 'timeline'>('closed');
  const [answer, setAnswer] = useState('');
  const [hint, setHint] = useState('');
  const [mobile, setMobile] = useState(()=>matchMedia('(max-width:520px)').matches);
  const dialog = useRef<HTMLDialogElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    const open = () => { setAnswer(''); setHint(''); setView('question'); };
    const reset = () => { setView('closed'); };
    const query=matchMedia('(max-width:520px)');const change=()=>setMobile(query.matches);query.addEventListener('change',change);
    window.addEventListener('travel:open', open);
    window.addEventListener('travel:reset', reset);
    return () => { query.removeEventListener('change',change);window.removeEventListener('travel:open', open); window.removeEventListener('travel:reset', reset); };
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
      <div className="travel-albums">{trips.map((trip,index)=><section className="travel-album" key={trip.date} aria-labelledby={`album-${index}`}>
        <div className="album-heading"><div><p>{trip.date}</p><h3 id={`album-${index}`}>{trip.title}</h3></div><span>{tripDetails[index].photos.length} 张照片</span></div>
        <p className="trip-gallery-help">{mobile?'轻触照片，展开回忆':'移动鼠标到照片上，展开回忆'}</p>
        <AccordionGallery key={`${index}-${mobile}`} items={tripDetails[index].photos} defaultIndex={2} expandRatio={0.52} trigger="hover" orientation={mobile?'vertical':'horizontal'} grayscale={false} height={420}/>
        <div className="trip-feeling album-feeling">{tripDetails[index].feeling.map((p,i)=><p key={i}>{p}</p>)}</div>
      </section>)}</div>
      <SkyWindows />
      <ScratchStamps />
      <p className="travel-ending">下一程，也想和你一起。</p>
      <CabinetLetter />
    </section>}
  </dialog>;
}
const container = document.getElementById('travel-root');
if (container) createRoot(container).render(<Travel />);
