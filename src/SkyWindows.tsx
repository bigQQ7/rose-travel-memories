import React, { useEffect, useRef, useState } from 'react';
import './sky-windows.css';
import BoardingGate from './BoardingGate';
import AccordionGallery from '../components/AccordionGallery';
import { tripDetails } from './trip-details';

type Story = {
  years: string; route: string; title: string; subtitle: string; cover: string;
  chapters: { image: string; caption: string; text: string; album?: number }[];
};

const stories: Story[] = [
  {
    years: '2021 — 2023', route: 'HGH → CTU → KWL', title: '从杭州出发',
    subtitle: '第一次出发，后来有了更多目的地。', cover: './assets/gallery-3-3.jpg',
    chapters: [
      { image: './assets/hangzhou-3.png', caption: '杭州 · 2021.5', text: '这是你第一次来到我的城市，我好开心！本来是要南京行的几人重聚的，但是因为那两个只想玩剧本杀，不想和我们玩，所以我们就把他们残忍抛弃了。在西湖的苏堤走了好久好久，两个人累得不行，但是又拍出了很多好看的照片。以及去乌镇听着听不懂的一些戏曲，突然感觉好像还是在昨天呢。' },
      { image: './assets/gallery-2-3.png', caption: '成都 · 2021.9', text: '成都也如约而至啦，我们在成都玩了很多的地方，又去看了你的学校，还吃了芋儿鸡，一起讨论大熊猫的便便好绿啊。' },
      { image: './assets/gallery-3-5.jpg', caption: '广西 · 重庆 · 2023.6', text: '这是我们一起的毕业旅行。说实话，那时候是天气最热的时候，我们在涠洲岛每天都被晒个半死，但是，嗯，涠洲岛真的很漂亮。并且在桂林的时候，因为下大雨，所以两个人被淋成落汤鸡呜呜呜呜。感觉毕业旅行它是一种特别的记忆，现在箱子里都还有毕业旅行的味道。' },
    ],
  },
  {
    years: '2024 — 2025', route: 'BPL → BPL', title: '两次来到冬天',
    subtitle: '同一个地方，留下两次不一样的我们。', cover: './assets/gallery-4-2.png',
    chapters: [
      { image: './assets/gallery-4-2.png', caption: '赛里木湖 · 2024.1', text: '就是一个说走就走的旅行，两个像风一般的女子才不会理会其他人的啰里巴嗦。' },
      { image: './assets/gallery-5-1.jpg', caption: '再见赛里木湖 · 2025.2', text: '一年后又回到这里。熟悉的雪山还在，我们也有了新的照片。真希望以后还能一起回到喜欢的地方，继续写下一页。' },
    ],
  },
];

function SkyScene({ variant = 0 }: { variant?: number }) {
  const cloudId = React.useId().replace(/:/g, '');
  return <><span className="flight-window-sky" />
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
  </>;
}

function FlightWindow({ variant = 0, shade = 0 }: { variant?: number; shade?: number }) {
  return <span className={`flight-window flight-window-${variant}`} style={{ '--shade-offset': `${-92 * (1 - shade)}%` } as React.CSSProperties} aria-hidden="true">
    <span className="flight-window-recess"><span className="flight-window-glass">
      <video className="flight-window-video" src={`./assets/window-view-${variant + 1}.mp4`} autoPlay muted loop playsInline preload="auto" aria-hidden="true" />
      <span className="flight-window-shade"><span className="flight-window-handle" /></span>
    </span></span>
  </span>;
}

function WindowChoice({ item, index, shade, setShade, onOpen }: { item: Story; index: number; shade: number; setShade: (value: number) => void; onOpen: (target: HTMLElement) => void }) {
  const [dragging, setDragging] = useState(false);
  const drag = useRef<{ pointerId: number; startY: number; startShade: number; height: number; moved: boolean } | null>(null);
  const suppressClick = useRef(false);
  const pressedWindow = useRef(false);
  const onPointerDown = (event: React.PointerEvent<HTMLButtonElement>) => {
    const windowEl = (event.target as HTMLElement).closest('.flight-window') as HTMLElement | null;
    pressedWindow.current = Boolean(windowEl);
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
    const finalShade = Math.max(0, Math.min(1, current.startShade + (event.clientY - current.startY) / (current.height * .75)));
    if (current.moved) {
      setShade(finalShade);
      suppressClick.current = true;
      window.setTimeout(() => { suppressClick.current = false; }, 0);
      if (event.type !== 'pointercancel' && current.startShade > .5 && finalShade < .28) onOpen(event.currentTarget);
    }
    drag.current = null;
    setDragging(false);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
  };
  return <button type="button" className={`flight-window-choice${dragging ? ' is-dragging' : ''}`} aria-label={`打开故事：${item.title}`} onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerEnd} onPointerCancel={onPointerEnd} onClick={event => {
    if (suppressClick.current) { suppressClick.current = false; return; }
    if (pressedWindow.current && shade > .5) { pressedWindow.current = false; return; }
    pressedWindow.current = false;
    onOpen(event.currentTarget);
  }}>
    <FlightWindow variant={index} shade={shade} />
  </button>;
}

export default function SkyWindows() {
  const [mobile,setMobile]=useState(()=>matchMedia('(max-width:520px)').matches);
  useEffect(()=>{const query=matchMedia('(max-width:520px)');const change=()=>setMobile(query.matches);query.addEventListener('change',change);return()=>query.removeEventListener('change',change);},[]);
  const section = useRef<HTMLElement>(null);
  const modal = useRef<HTMLDialogElement>(null);
  const opener = useRef<HTMLElement | null>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const [zoomOrigin, setZoomOrigin] = useState({ top: 0, right: 0, bottom: 0, left: 0 });
  const [shades, setShades] = useState([1, 1]);
  const [boarded, setBoarded] = useState(false);
  useEffect(() => {
    if (selected === null) return;
    const el = modal.current;
    if (!el) return;
    el.showModal();
    const reset = () => setSelected(null);
    window.addEventListener('travel:reset', reset);
    return () => { window.removeEventListener('travel:reset', reset); if (el.open) el.close(); opener.current?.focus({ preventScroll: true }); };
  }, [selected]);
  const openStory = (index: number, target: HTMLElement) => {
    const glass = target.querySelector('.flight-window-glass') ?? target;
    const bounds = glass.getBoundingClientRect();
    setZoomOrigin({ top: bounds.top, right: window.innerWidth - bounds.right, bottom: window.innerHeight - bounds.bottom, left: bounds.left });
    opener.current = target;
    setSelected(index);
  };
  const story = selected === null ? null : stories[selected];
  const storyNumber = selected === null ? 0 : selected + 1;
  return <section className={`flight-journey${boarded ? ' is-boarded' : ''}`} ref={section} style={{ '--cabin-dark': boarded ? Math.pow(Math.min(...shades), 1.5) : 0 } as React.CSSProperties} aria-labelledby="flight-journey-title">
    <div className="flight-stage">
      <div className="flight-header"><span>OUR JOURNEY</span><span>2021 — 2025</span></div>
      {!boarded && <BoardingGate onBoard={() => setBoarded(true)} />}
      <div className="flight-destinations">
        <p className="flight-kicker">THE VIEW FROM HERE</p>
        <h2 id="flight-journey-title">窗外，是我们一起走过的路。</h2>
        <div className="flight-route" aria-hidden="true"><i /><span>✈</span><i /></div>
        <div className="flight-window-list">
          {stories.map((item, i) => <WindowChoice item={item} index={i} key={item.title} shade={shades[i]} setShade={value => setShades(previous => previous.map((old, index) => index === i ? value : old))} onOpen={target => openStory(i, target)} />)}
        </div>
        <p className="flight-hint">向上拉开一扇舷窗，进入对应的故事</p>
      </div>
    </div>
    {story && <dialog className="flight-story" ref={modal} style={{ '--portal-top': `${zoomOrigin.top}px`, '--portal-right': `${zoomOrigin.right}px`, '--portal-bottom': `${zoomOrigin.bottom}px`, '--portal-left': `${zoomOrigin.left}px` } as React.CSSProperties} aria-labelledby="flight-story-title" onCancel={e => { e.preventDefault(); e.stopPropagation(); setSelected(null); }} onClose={e => e.stopPropagation()}>
      <div className="flight-story-portal" aria-hidden="true"><SkyScene variant={selected ?? 0} /></div>
      <header className="flight-story-top"><span>OUR JOURNEY <b>✈</b> {story.route}</span><button type="button" aria-label="关闭故事" onClick={() => setSelected(null)}>关闭 ×</button></header>
      <div className="flight-story-content">
        <div className="flight-story-hero"><SkyScene variant={selected ?? 0} /><div className="flight-story-hero-copy"><p>STORY 0{storyNumber} / 02 · {story.years}</p><h2 id="flight-story-title">{story.title}</h2><span>{story.subtitle}</span><small>向下滚动，继续这段旅程 ↓</small></div></div>
        <div className="flight-plan">
          <div className="flight-plan-heading"><span>FLIGHT PLAN</span><i>✈</i></div>
          {story.chapters.map((item, i) => <article className="flight-stop" key={item.caption}>
            <div className="flight-stop-index"><small>0{i + 1}</small><i /></div>
            <div className="flight-stop-body"><p className="flight-stop-date">{item.caption}</p><p className="flight-stop-text">{item.text}</p><p className="trip-gallery-help">{mobile?'轻触照片，展开回忆':'移动鼠标到照片上，展开回忆'}</p><AccordionGallery key={`${selected}-${i}-${mobile}`} items={tripDetails[(selected===0?0:3)+i].photos} defaultIndex={2} expandRatio={0.52} trigger="hover" orientation={mobile?'vertical':'horizontal'} grayscale={false} height={420}/></div>
          </article>)}
          <div className="flight-plan-ending"><i>↓</i><p>谢谢你，陪我走过这一程。</p><button type="button" onClick={() => setSelected(null)}>返回舷窗 ↑</button></div>
        </div>
      </div>
    </dialog>}
  </section>;
}
