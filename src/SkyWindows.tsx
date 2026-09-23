import React, { useEffect, useRef, useState } from 'react';
import './sky-windows.css';

type Story = {
  years: string;
  title: string;
  subtitle: string;
  cover: string;
  chapters: { image: string; caption: string; text: string }[];
};

const stories: Story[] = [
  {
    years: '2021 — 2023',
    title: '从杭州出发',
    subtitle: '第一次出发，后来有了更多目的地。',
    cover: './assets/gallery-3-3.jpg',
    chapters: [
      { image: './assets/hangzhou-3.png', caption: '杭州 · 2021.5', text: '第一次一起去旅行，镜头里的我们还带着一点新鲜和兴奋。那时不知道以后会去多少地方，只记得从这一站开始，旅途有了你。' },
      { image: './assets/gallery-2-3.png', caption: '成都 · 2021.9', text: '后来我们一起坐上车，在阳光里合照，看熊猫，也吃热辣的食物。每张照片都把那天的笑容留得很清楚。' },
      { image: './assets/gallery-3-5.jpg', caption: '广西 · 重庆 · 2023.6', text: '海边的风、夜里的笑，还有阳朔突如其来的雨，都成了这一程的记号。和你一起走过，连狼狈的瞬间也值得收藏。' },
    ],
  },
  {
    years: '2024 — 2025',
    title: '两次来到冬天',
    subtitle: '同一个地方，留下两次不一样的我们。',
    cover: './assets/gallery-4-2.png',
    chapters: [
      { image: './assets/gallery-4-2.png', caption: '赛里木湖 · 2024.1', text: '第一次走进赛里木湖的冬天，雪很亮，湖很蓝。我们在湖边张开手臂，像是想把眼前的风景都抱住。' },
      { image: './assets/gallery-4-4.png', caption: '路上的小事', text: '路边一起吃的饭、临时起意留下的照片，让远行不只是远处的风景，也是并肩度过的每一个片刻。' },
      { image: './assets/gallery-5-1.jpg', caption: '再见赛里木湖 · 2025.2', text: '一年后又回到这里。熟悉的雪山还在，我们也有了新的照片。真希望以后还能一起回到喜欢的地方，继续写下一页。' },
    ],
  },
];

function PlaneOutline() {
  return <svg className="sky-plane" viewBox="0 0 220 470" fill="none" aria-hidden="true">
    <path d="M110 12C93 34 92 59 92 88v108L15 278v26l77-27v119l-31 28v16l49-12 49 12v-16l-31-28V277l77 27v-26l-77-82V88c0-29-1-54-18-76Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
    <path d="M110 22v395M93 87h34M92 196h36M91 278h38M77 428h66" stroke="currentColor" strokeWidth="1" opacity=".58" />
    <path d="M98 65h24v30H98zM98 107h24v40H98zM98 157h24v40H98zM99 210h22v35H99zM100 259h20v36h-20zM100 312h20v36h-20z" stroke="currentColor" strokeWidth="1" opacity=".45" />
  </svg>;
}

export default function SkyWindows() {
  const section = useRef<HTMLElement>(null);
  const modal = useRef<HTMLDialogElement>(null);
  const opener = useRef<HTMLElement | null>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const [chapter, setChapter] = useState(0);

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
      root.style.setProperty('--sky-progress', progress.toFixed(3));
      root.classList.toggle('sky-reached', progress > .3);
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

  const openStory = (index: number, target: HTMLElement) => { opener.current = target; setChapter(0); setSelected(index); };
  const story = selected === null ? null : stories[selected];
  const storyNumber = selected === null ? 0 : selected + 1;
  return <section className="sky-journey" ref={section} aria-labelledby="sky-journey-title">
    <div className="sky-stage">
      <div className="sky-gradient" aria-hidden="true" />
      <div className="sky-blueprint" aria-hidden="true"><PlaneOutline /><span>OUR JOURNEY</span><i /></div>
      <div className="sky-cabin">
        <div className="sky-cabin-copy"><p>下一站 · 回忆深处</p><h2 id="sky-journey-title">透过两扇窗，<br />再看我们的故事。</h2><span>向下滑动，轻触舷窗</span></div>
        <div className="sky-window-row">
          {stories.map((item, i) => <button className="sky-window-choice" type="button" key={item.title} aria-label={`打开故事：${item.title}`} onClick={e => openStory(i, e.currentTarget)}>
            <span className="sky-window-frame"><span className="sky-window-inner"><img src={item.cover} alt="" loading="lazy" /><span className="sky-window-glow" /></span></span>
            <span className="sky-window-meta"><span>{item.years}</span><strong>{item.title}</strong><small>进入故事 ↗</small></span>
          </button>)}
        </div>
      </div>
      <div className="sky-cloud-veil" aria-hidden="true" />
    </div>
    {story && <dialog className="sky-story" ref={modal} aria-labelledby="sky-story-title" onCancel={e => { e.preventDefault(); e.stopPropagation(); setSelected(null); }} onClose={e => e.stopPropagation()}>
      <div className="sky-story-shell">
        <header className="sky-story-top"><span>OUR JOURNEY · {story.years}</span><button type="button" onClick={() => setSelected(null)} aria-label="关闭故事">关闭 ×</button></header>
        <div className="sky-story-cover" style={{ backgroundImage: `url("${story.cover}")` }} aria-hidden="true" />
        <div className="sky-story-body">
          <p className="sky-story-overline">{String(storyNumber).padStart(2, '0')} / 02 · 一段关于我们的旅程</p>
          <h2 id="sky-story-title">{story.title}</h2>
          <p className="sky-story-subtitle">{story.subtitle}</p>
          <div className="sky-story-chapter">
            <figure><img src={story.chapters[chapter].image} alt={story.chapters[chapter].caption} /><figcaption>{story.chapters[chapter].caption}</figcaption></figure>
            <div className="sky-story-words"><span>0{chapter + 1} / 0{story.chapters.length}</span><p>{story.chapters[chapter].text}</p></div>
          </div>
          <nav className="sky-story-nav" aria-label="切换故事片段">
            <button type="button" onClick={() => setChapter(c => Math.max(0, c - 1))} disabled={chapter === 0}>← 上一页</button>
            <div className="sky-story-dots">{story.chapters.map((item, i) => <button type="button" key={item.caption} className={i === chapter ? 'is-current' : ''} aria-label={`查看第 ${i + 1} 页：${item.caption}`} aria-current={i === chapter ? 'step' : undefined} onClick={() => setChapter(i)} />)}</div>
            <button type="button" onClick={() => setChapter(c => Math.min(story.chapters.length - 1, c + 1))} disabled={chapter === story.chapters.length - 1}>下一页 →</button>
          </nav>
        </div>
      </div>
    </dialog>}
  </section>;
}
