import { useState } from 'react';
import type { Exercise } from '../../entities/program';

export function Demonstration({ exercise }: { exercise: Exercise }) {
  const [playing, setPlaying] = useState(false);
  const [from, to] = exercise.poses;
  const paths = [[1, 2, 3, 4], [1, 5, 6, 7]];
  const lines = (pose: typeof from, points: number[]) => points.map(index => pose[index].join(',')).join(' ');
  const animate = (attribute: string, start: string | number, end: string | number) =>
    playing && start !== end && <animate attributeName={attribute} dur="3s" values={`${start};${end};${start}`} repeatCount="indefinite"/>;
  const circle = (index: number, radius: number) =>
    <circle cx={from[index][0]} cy={from[index][1]} r={radius} fill="#f5b75f">
      {animate('cx', from[index][0], to[index][0])}{animate('cy', from[index][1], to[index][1])}
    </circle>;
  return <div className="demo">
    <svg viewBox="0 0 240 155" role="img" aria-label="Схема движения">
      <g fill="none" stroke="#849885" strokeWidth="4" strokeLinecap="round">
        <path d="M28 140h184" opacity=".5"/>
        <path d={exercise.equipment}/>
      </g>
      <g fill="none" stroke="#e6efd8" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round">
        {paths.map(points => <polyline key={points.join('-')} points={lines(from, points)}>
          {animate('points', lines(from, points), lines(to, points))}
        </polyline>)}
        {exercise.support && <path d={exercise.support} opacity=".45"/>}
      </g>
      {circle(0, 10)}{exercise.title !== 'Присед к скамье' && circle(7, 6)}
    </svg>
    <button className="demo-button" aria-pressed={playing} onClick={() => setPlaying(!playing)}>
      {playing ? 'Остановить показ' : '▶ Показать движение'}
    </button>
  </div>;
}
