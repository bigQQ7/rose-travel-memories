import React, { useEffect, useRef, useState } from 'react';
import './sky-windows.css';

type Story = {
  years: string; route: string; title: string; subtitle: string; cover: string;
  chapters: { image: string; caption: string; text: string }[];
};

const stories: Story[] = [
  {
    years: '2021 — 2023', route: 'HGH → CTU → KWL', title: '从杭州出发',
    subtitle: '第一次出发，后来有了更多目的地。', cover: './assets/gallery-3-3.jpg',
    chapters: [
      { image: './assets/hangzhou-3.png', caption: '杭州 · 2021.5', text: '第一次一起去旅行，镜头里的我们还带着一点新鲜和兴奋。那时不知道以后会去多少地方，只记得从这一站开始，旅途有了你。' },
      { image: './assets/gallery-2-3.png', caption: '成都 · 2021.9', text: '后来我们一起坐上车，在阳光里合照，看熊猫，也吃热辣的食物。每张照片都把那天的笑容留得很清楚。' },
      { image: './assets/gallery-3-5.jpg', caption: '广西 · 重庆 · 2023.6', text: '海边的风、夜里的笑，还有阳朔突如其来的雨，都成了这一程的记号。和你一起走过，连狼狈的瞬间也值得收藏。' },
    ],
  },
  {
    years: '2024 — 2025', route: 'BPL → BPL', title: '两次来到冬天',
    subtitle: '同一个地方，留下两次不一样的我们。', cover: './assets/gallery-4-2.png',
    chapters: [
      { image: './assets/gallery-4-2.png', caption: '赛里木湖 · 2024.1', text: '第一次走进赛里木湖的冬天，雪很亮，湖很蓝。我们在湖边张开手臂，像是想把眼前的风景都抱住。' },
      { image: './assets/gallery-4-4.png', caption: '路上的小事', text: '路边一起吃的饭、临时起意留下的照片，让远行不只是远处的风景，也是并肩度过的每一个片刻。' },
      { image: './assets/gallery-5-1.jpg', caption: '再见赛里木湖 · 2025.2', text: '一年后又回到这里。熟悉的雪山还在，我们也有了新的照片。真希望以后还能一起回到喜欢的地方，继续写下一页。' },
    ],
  },
];

function FlightWindow({ variant = 0, shade = 0 }: { variant?: number; shade?: number }) {
  const cloudId = React.useId().replace(/:/g, '');
  return <span className={`flight-window flight-window-${variant}`} style={{ '--shade-offset': `${-92 * (1 - shade)}%` } as React.CSSProperties} aria-hidden="true">
    <span className="flight-window-recess"><span className="flight-window-glass">
      <span className="flight-window-sky" />
      <svg className="flight-cloudscape" viewBox="0 0 200 280" preserveAspectRatio="none">
        <defs>
          <filter id={`${cloudId}-cloud`} x="-30%" y="-30%" width="160%" height="160%">
            <feTurbulence type="fractalNoise" baseFrequency=".012 .018" numOctaves="3" seed={8 + variant * 4} />
            <feDiffuseLighting lightingColor="#f5fbff" surfaceScale="7" diffuseConstant="1.1"><feDistantLight azimuth="220" elevation="48" /></feDiffuseLighting>
            <feComponentTransfer><feFuncR type="linear" slope=".4" intercept=".56" /><feFuncG type="linear" slope=".36" intercept=".62" /><feFuncB type="linear" slope=".3" intercept=".69" /></feComponentTransfer>
            <feGaussianBlur stdDeviation=".8" />
          </filter>
          <linearGradient id={`${cloudId}-fade`} x2="0" y2="1"><stop offset="0" stopColor="white" stopOpacity="0" /><stop offset=".18" stopColor="white" stopOpacity=".95" /><stop offset="1" stopColor="white" /></linearGradient>
          <mask id={`${cloudId}-mask`}><rect x="-50" y="112" width="300" height="190" fill={`url(#${cloudId}-fade)`} /></mask>
        </defs>
        <rect x="-50" y="112" width="300" height="190" filter={`url(#${cloudId}-cloud)`} mask={`url(#${cloudId}-mask)`} opacity=".8" />
      </svg>
      <span className="flight-window-shade"><span className="flight-window-handle" /></span>
    </span></span>
  </span>;
}

function WindowChoice({ item, index, shade, setShade, onOpen }: { item: Story; index: number; shade: number; setShade: (value: number) => void; onOpen: (target: HTMLElement) => void }) {
  const [dragging, setDragging] = useState(false);
  const drag = useRef<{ pointerId: number; startY: number; startShade: number; height: number; moved: boolean } | null>(null);
  const suppressClick = useRef(false);
  const onPointerDown = (event: React.PointerEvent<HTMLButtonElement>) => {
    const windowEl = (event.target as HTMLElement).closest('.flight-window') as HTMLElement | null;
    if (!windowEl || event.button !== 0) return;
    setDragging(true);
    drag.current = { pointerId: event.pointerId, startY: event.clientY, startShade: shade, height: windowEl.clientHeight, moved: false };
    event.currentTarget.setPointerCapture(event.pointerId);
  };
  const onPointerMove = (event: React.PointerEvent<HTMLButtonElement>) => {
    const current = drag.current;
    if (!current || current.pointerId !== event.pointerId) return;
    const distance = event.clientY - current.startY;
    if (Math.abs(distance) > 5) current.moved = true;
    if (current.moved) setShade(Math.max(0, Math.min(1, current.startShade + distance / (current.height * .75))));
  };
  const onPointerEnd = (event: React.PointerEvent<HTMLButtonElement>) => {
    const current = drag.current;
    if (!current || current.pointerId !== event.pointerId) return;
    if (current.moved) {
      suppressClick.current = true;
      window.setTimeout(() => { suppressClick.current = false; }, 0);
    }
    drag.current = null;
    setDragging(false);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
  };
  return <button type="button" className={`flight-window-choice${dragging ? ' is-dragging' : ''}`} aria-label={`打开故事：${item.title}`} onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerEnd} onPointerCancel={onPointerEnd} onClick={event => {
    if (suppressClick.current) { suppressClick.current = false; return; }
    onOpen(event.currentTarget);
  }}>
    <FlightWindow variant={index} shade={shade} />
    <span className="flight-window-info"><small>0{index + 1} / 02 · {item.years}</small><strong>{item.title}</strong><em>{item.route}</em><span>打开这段故事 ↗</span></span>
  </button>;
}

export default function SkyWindows() {
  const section = useRef<HTMLElement>(null);
  const modal = useRef<HTMLDialogElement>(null);
  const opener = useRef<HTMLElement | null>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const [shades, setShades] = useState([0, 0]);
  useEffect(() => {
    const root = section.current;
    const scrollBox = root?.closest('dialog.travel-dialog');
    if (!root || !scrollBox) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const bounds = root.getBoundingClientRect();
      const viewport = scrollBox.getBoundingClientRect();
      const travel = Math.max(1, bounds.height - viewport.height);
      const progress = Math.max(0, Math.min(1, (viewport.top - bounds.top) / travel));
      root.style.setProperty('--flight-progress', progress.toFixed(3));
      root.classList.toggle('flight-ready', progress > .36);
    };
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(update); };
    update();
    scrollBox.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => { scrollBox.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onScroll); if (frame) cancelAnimationFrame(frame); };
  }, []);
  useEffect(() => {
    if (selected === null) return;
    const el = modal.current;
    if (!el) return;
    el.showModal();
    const reset = () => setSelected(null);
    window.addEventListener('travel:reset', reset);
    return () => { window.removeEventListener('travel:reset', reset); if (el.open) el.close(); opener.current?.focus({ preventScroll: true }); };
  }, [selected]);
  const openStory = (index: number, target: HTMLElement) => { opener.current = target; setSelected(index); };
  const story = selected === null ? null : stories[selected];
  const storyNumber = selected === null ? 0 : selected + 1;
  return <section className="flight-journey" ref={section} style={{ '--cabin-dark': Math.pow(Math.min(...shades), 1.5) } as React.CSSProperties} aria-labelledby="flight-journey-title">
    <div className="flight-stage">
      <div className="flight-header"><span>OUR JOURNEY</span><span>2021 — 2025</span></div>
      <div className="flight-boarding" aria-hidden="true">
        <div className="flight-ticket">
          <div className="flight-ticket-main"><small>BOARDING PASS / 送给我们的下一程</small><div><strong>回忆</strong><span>✈</span><strong>未来</strong></div><p>乘客：我们俩　　航班：LOVE 02</p></div>
          <div className="flight-ticket-stub"><small>FLIGHT</small><strong>02</strong><span>ONE WAY</span></div>
        </div>
        <div className="flight-scanner"><div className="flight-slot" /><span>READY TO DEPART</span></div>
        <p>继续向下，走进我们的下一段故事</p>
      </div>
      <div className="flight-destinations">
        <p className="flight-kicker">THE VIEW FROM HERE</p>
        <h2 id="flight-journey-title">窗外，是我们一起走过的路。</h2>
        <div className="flight-route" aria-hidden="true"><i /><span>✈</span><i /></div>
        <div className="flight-window-list">
          {stories.map((item, i) => <WindowChoice item={item} index={i} key={item.title} shade={shades[i]} setShade={value => setShades(previous => previous.map((old, index) => index === i ? value : old))} onOpen={target => openStory(i, target)} />)}
        </div>
        <p className="flight-hint">拖动舷窗遮光板，点击进入故事</p>
      </div>
    </div>
    {story && <dialog className="flight-story" ref={modal} aria-labelledby="flight-story-title" onCancel={e => { e.preventDefault(); e.stopPropagation(); setSelected(null); }} onClose={e => e.stopPropagation()}>
      <header className="flight-story-top"><span>OUR JOURNEY <b>✈</b> {story.route}</span><button type="button" aria-label="关闭故事" onClick={() => setSelected(null)}>关闭 ×</button></header>
      <div className="flight-story-content">
        <div className="flight-story-hero"><p>STORY 0{storyNumber} / 02 · {story.years}</p><FlightWindow variant={selected ?? 0} /><h2 id="flight-story-title">{story.title}</h2><span>{story.subtitle}</span></div>
        <div className="flight-plan">
          <div className="flight-plan-heading"><span>FLIGHT PLAN</span><i>✈</i></div>
          {story.chapters.map((item, i) => <article className="flight-stop" key={item.caption}>
            <div className="flight-stop-index"><small>0{i + 1}</small><i /></div>
            <div className="flight-stop-body"><p className="flight-stop-date">{item.caption}</p><p className="flight-stop-text">{item.text}</p><figure><img src={item.image} alt={item.caption} loading={i === 0 ? 'eager' : 'lazy'} /><figcaption>{item.caption}</figcaption></figure></div>
          </article>)}
          <div className="flight-plan-ending"><i>↓</i><p>谢谢你，陪我走过这一程。</p><button type="button" onClick={() => setSelected(null)}>返回舷窗 ↑</button></div>
        </div>
      </div>
    </dialog>}
  </section>;
}
