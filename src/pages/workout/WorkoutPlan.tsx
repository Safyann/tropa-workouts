import { exerciseAlternatives, exercises } from '../../entities/program';
import { isPending, replaceExercise, toggleSkip, type StrengthWorkout } from '../../features/workout';

export function WorkoutPlan({ workout, update, choose }: {
  workout: StrengthWorkout;
  update: (workout: StrengthWorkout) => void;
  choose: (index: number) => void;
}) {
  return <section className="day-plan" aria-label="План занятия">
    <h2>План на сегодня</h2>
    <p className="hint">Выбери любое упражнение из списка. Порядок можно менять между подходами.</p>
    <ul className="plan-list">{workout.plan.map((item, index) => {
      const exercise = exercises[item.exercise];
      const pending = isPending(item);
      const selected = workout.selected === index && !workout.timer;
      const status = item.skipped ? 'Пропуск' : item.completed === item.target ? 'Готово' : selected ? 'Сейчас' : '';
      return <li className={`plan-item${selected ? ' selected' : ''}`} key={index}>
        <div className="plan-line">
          {pending
            ? <button className="plan-pick" aria-pressed={selected} onClick={() => choose(index)}>{exercise.title}</button>
            : <strong>{exercise.title}</strong>}
          <span>{status ? `${status} · ` : ''}{item.completed}/{item.target}</span>
        </div>
        <small>{exercise.group} · {exercise.gear}</small>
        {pending && <details className="plan-options">
          <summary>Замена или пропуск</summary>
          <p className="hint">Если снаряд занят, выбери вариант для оставшихся подходов.</p>
          <div className="plan-alternatives">{exerciseAlternatives(item.exercise).map(id =>
            <button key={id} className="secondary" onClick={() => update(replaceExercise(workout, index, id))}>
              {exercises[id].title}<small>{exercises[id].gear}</small>
            </button>)}</div>
          <button className="secondary" onClick={() => update(toggleSkip(workout, index))}>Больно · пропустить</button>
        </details>}
        {item.skipped && <button className="plan-pick" onClick={() => update(toggleSkip(workout, index))}>Вернуть в план</button>}
      </li>;
    })}</ul>
  </section>;
}
