import React, { useState } from 'react';
import './memory-puzzle.css';

const memories = [
  { color: '#F9DCF7', prompt: '我们最常吃的东西', caption: '火锅肯定是第一名', sticker: './assets/puzzle-food-1.png', x: -100, y: -70, angle: -7 },
  { color: '#FCCAFB', prompt: '一见钟情的东西', caption: '螺丝粉永远的神', sticker: './assets/puzzle-food-2.png', x: -10, y: -100, angle: -4 },
  { color: '#DECAFE', prompt: '新疆人骨子里的基因', caption: '炒米粉我要中辣', sticker: './assets/puzzle-food-3.png', x: 120, y: -90, angle: 8 },
  { color: '#FFEEB2', prompt: '新晋宠妃', caption: '麻油鱼还想吃', sticker: './assets/puzzle-food-4.png', x: -140, y: 100, angle: 0 },
  { color: '#FEC7E0', prompt: '百搭伴侣', caption: '茶百道永远的神', sticker: './assets/puzzle-food-5.png', x: 0, y: 100, angle: -6 },
  { color: '#FFD3D3', prompt: '超难吃的东西', caption: '油茶好难喝', sticker: './assets/puzzle-food-6.png', x: 135, y: 100, angle: 8 },
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
      {memories.map((memory, i) => <g key={i} className={`memory-puzzle-piece${placed.includes(i) ? ' is-placed' : ''}`} role="button" tabIndex={0} aria-label={`拼合第${i + 1}块：${memory.prompt}`} aria-pressed={placed.includes(i)} onClick={() => place(i)} onKeyDown={event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); place(i); } }} style={{ '--px': `${memory.x}px`, '--py': `${memory.y}px`, '--angle': `${memory.angle}deg`, '--delay': '0s', transformOrigin: `${i % 3 * 300 + 150}px ${Math.floor(i / 3) * 250 + 125}px` } as React.CSSProperties}>
        <path className="memory-puzzle-depth" d={piece(i)} fill={memory.color} transform="translate(0 7)" />
        <path d={piece(i)} fill={memory.color} />
        <g transform={`translate(${i % 3 * 300} ${Math.floor(i / 3) * 250})`} pointerEvents="none">
          <text className="memory-puzzle-prompt" x="150" y="130" textAnchor="middle">{memory.prompt}</text>
          <g className="memory-puzzle-reveal">
            <image className="memory-puzzle-sticker" href={memory.sticker} x="52" y="24" width="196" height="165" preserveAspectRatio="xMidYMid meet" />
            <text className="memory-puzzle-caption" x="150" y="218" textAnchor="middle">{memory.caption}</text>
          </g>
        </g>
      </g>)}
    </svg>
    <button type="button" className="memory-puzzle-replay" onClick={() => setPlaced([])} aria-label="散开拼图，重新拼合">{placed.length ? '再拼一次' : '点击拼图，拼起回忆'} <span aria-hidden="true">↻</span></button>
  </section>;
}
