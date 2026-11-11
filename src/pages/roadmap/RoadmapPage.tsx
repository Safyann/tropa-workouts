import { Icon } from '../../shared/ui/Icon';
import ui from '../../shared/ui/Common.module.css';
import styles from './Roadmap.module.css';

const plannedFeatures = [
  {
    title: 'Аккаунт и перенос истории',
    description: 'Сохраняй историю тренировок и переноси её на другое устройство.',
  },
  {
    title: 'Режим тренера',
    description:
      'Тренер сможет собрать и назначить тренировку, а затем сверить план с выполненными подходами, весом и повторами.',
  },
  {
    title: 'Тренировка с другом',
    description:
      'Занимайтесь вдвоём с одного телефона. Один человек ведёт занятие, а результаты сохраняются в истории каждого.',
  },
  {
    title: 'Продолжение домашнего маршрута',
    description:
      'Четыре недели занятий под твой инвентарь, с короткими вариантами и подсказками по нагрузке.',
  },
  {
    title: 'Режим зала и конструктор',
    description: 'Собирай свои программы из каталога упражнений и делись ими по ссылке.',
  },
] as const;

export function RoadmapPage() {
  return (
    <div className={ui.narrow}>
      <h1 tabIndex={-1}>
        Дорожная карта<span>.</span>
      </h1>
      <section className={ui.panel}>
        <h2 className={styles.availableHeading}>
          <Icon name="check" />
          Уже доступно
        </h2>
        <p className={styles.description}>
          Домашний маршрут из четырёх тренировок, короткие занятия, подбор упражнений по инвентарю и
          мышечным группам, разминка, заминка и история в этом браузере.
        </p>
      </section>
      <section className={styles.planned}>
        <h2>В планах</h2>
        <ul className={styles.timeline}>
          {plannedFeatures.map(({ title, description }) => (
            <li key={title}>
              <h3>{title}</h3>
              <p className={styles.description}>{description}</p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
