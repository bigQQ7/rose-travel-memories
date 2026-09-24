import React, { useEffect, useRef, useState } from 'react';
import './memory-puzzle.css';

const memories = [
  { color: '#f8d4df', lines: ['那些一起走过的路，', '慢慢拼成了我们的故事。'], note: '一路有你', x: -100, y: -70, angle: -7 },
  { color: '#e2d7f5', lines: ['从第一次旅行开始，', '有了越来越多的目的地。'], note: '从杭州出发', x: -10, y: -100, angle: -4 },
  { color: '#f5dbe9', lines: ['一起看过的雪，', '一直记得。'], note: '两次来到冬天', x: 120, y: -90, angle: 8 },
  { color: '#f5c9df', lines: ['一张小小的创口贴，', '也藏着我们的快乐。'], note: '心电图的回忆', x: -140, y: 100, angle: 0 },
  { color: '#d9cef2', lines: ['每次跨年，', '都想和你一起。'], note: '又是一年', x: 0, y: 100, angle: -6 },
  { color: '#ecd7ef', lines: ['把这些小小的瞬间，', '一片一片，收藏起来。'], note: '属于我们的回忆', x: 135, y: 100, angle: 8 },
];

// Opposite sides use the same curve in reverse, so the six pieces fit exactly.
function edge(x: number, y: number, dx: number, dy: number, tab: number) {
  const length = Math.hypot(dx, dy);
  const p = (t: number, depth = 0) => `${x + dx * t + dy / length * depth},${y + dy * t - dx / length * depth}`;
  if (!tab) return `L${p(1)}`;
  const d = 31 * tab;
  return `L${p(.32)} C${p(.42)},${p(.34, d)},${p(.42, d)} C${p(.46, d * 1.12)},${p(.54, d * 1.12)},${p(.58, d)} C${p(.66, d)},${p(.58)},${p(.68)} L${p(1)}`;
}
function piece(index: number) {
  const col = index % 3, row = Math.floor(index / 3);
  const x = col * 300, y = row * 250;
  const right = col === 2 ? 0 : row === 1 && col === 1 ? 1 : -1;
  const left = col === 0 ? 0 : row === 1 && col === 2 ? -1 : 1;
  return `M${x},${y}` + edge(x,y,300,0,row ? 1 : 0) + edge(x+300,y,0,250,right) + edge(x+300,y+250,-300,0,row ? 0 : -1) + edge(x,y+250,0,-250,left) + 'Z';
}

export default function MemoryPuzzle() {
  const section = useRef<HTMLElement>(null);
  const [playing, setPlaying] = useState(false);
  const [run, setRun] = useState(0);
  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) { setPlaying(true); observer.disconnect(); }
    }, { threshold: .35 });
    if (section.current) observer.observe(section.current);
    return () => observer.disconnect();
  }, []);
  return <section ref={section} className="memory-puzzle" aria-label="六片拼图，拼起我们的回忆">
    <svg key={run} className={playing ? 'memory-puzzle-art is-playing' : 'memory-puzzle-art'} viewBox="-165 -140 1230 800" role="img" aria-label="六块粉紫色拼图依次归位，拼成我们的回忆">
      <g className="memory-puzzle-outline" aria-hidden="true">{memories.map((_, i) => <path key={i} d={piece(i)} />)}</g>
      {memories.map((memory, i) => <g key={i} className="memory-puzzle-piece" style={{ '--px': `${memory.x}px`, '--py': `${memory.y}px`, '--angle': `${memory.angle}deg`, '--delay': `${i * 1.05 + .35}s`, transformOrigin: `${i % 3 * 300 + 150}px ${Math.floor(i / 3) * 250 + 125}px` } as React.CSSProperties}>
        <path className="memory-puzzle-depth" d={piece(i)} fill={memory.color} transform="translate(0 7)" />
        <path d={piece(i)} fill={memory.color} />
        <g className="memory-puzzle-words" transform={`translate(${i % 3 * 300 + 48} ${Math.floor(i / 3) * 250 + 65})`}>
          <text className="memory-puzzle-quote" y="0">“</text>
          <text className="memory-puzzle-copy" y="35">{memory.lines.map((line, n) => <tspan key={line} x="0" dy={n ? 28 : 0}>{line}</tspan>)}</text>
          <text className="memory-puzzle-note" y="130">{memory.note}</text>
          <text className="memory-puzzle-number" x="205" y="130" textAnchor="end">0{i + 1}</text>
        </g>
      </g>)}
    </svg>
    <button type="button" className="memory-puzzle-replay" onClick={() => { setPlaying(true); setRun(value => value + 1); }} aria-label="重新播放拼图动画">再拼一次 <span aria-hidden="true">↻</span></button>
  </section>;
}
