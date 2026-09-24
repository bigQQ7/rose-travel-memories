import React, { useState } from 'react';
import './memory-puzzle.css';

const memories = [
  { color: '#F9DCF7', lines: ['那些一起走过的路，', '慢慢拼成了我们的故事。'], note: '一路有你', x: -100, y: -70, angle: -7 },
  { color: '#FCCAFB', lines: ['从第一次旅行开始，', '有了越来越多的目的地。'], note: '从杭州出发', x: -10, y: -100, angle: -4 },
  { color: '#DECAFE', lines: ['一起看过的雪，', '一直记得。'], note: '两次来到冬天', x: 120, y: -90, angle: 8 },
  { color: '#FFEEB2', lines: ['一张小小的创口贴，', '也藏着我们的快乐。'], note: '心电图的回忆', x: -140, y: 100, angle: 0 },
  { color: '#FEC7E0', lines: ['每次跨年，', '都想和你一起。'], note: '又是一年', x: 0, y: 100, angle: -6 },
  { color: '#FFD3D3', lines: ['把这些小小的瞬间，', '一片一片，收藏起来。'], note: '属于我们的回忆', x: 135, y: 100, angle: 8 },
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
  const [placed, setPlaced] = useState<number[]>([]);
  const place = (index: number) => setPlaced(previous => previous.includes(index) ? previous : [...previous, index]);
  return <section className="memory-puzzle" aria-label="六片拼图，拼起我们的回忆">
    <svg className="memory-puzzle-art" viewBox="-165 -140 1230 800" role="group" aria-label="点击每块拼图，把回忆拼在一起">
      <g className="memory-puzzle-outline" aria-hidden="true">{memories.map((_, i) => <path key={i} d={piece(i)} />)}</g>
      {memories.map((memory, i) => <g key={i} className={`memory-puzzle-piece${placed.includes(i) ? ' is-placed' : ''}`} role="button" tabIndex={0} aria-label={`拼合第${i + 1}块：${memory.note}`} aria-pressed={placed.includes(i)} onClick={() => place(i)} onKeyDown={event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); place(i); } }} style={{ '--px': `${memory.x}px`, '--py': `${memory.y}px`, '--angle': `${memory.angle}deg`, '--delay': '0s', transformOrigin: `${i % 3 * 300 + 150}px ${Math.floor(i / 3) * 250 + 125}px` } as React.CSSProperties}>
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
    <button type="button" className="memory-puzzle-replay" onClick={() => setPlaced([])} aria-label="散开拼图，重新拼合">{placed.length ? '再拼一次' : '点击拼图，拼起回忆'} <span aria-hidden="true">↻</span></button>
  </section>;
}
