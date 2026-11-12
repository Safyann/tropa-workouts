import { defaultEquipment, type WorkoutPreferences } from '../../entities/program';
import type { Progress } from '../../entities/progress';
import type { ThemePreference } from '../../shared/lib/theme';
import { BackLink, ButtonLink } from '../../shared/ui/NavigationLinks';
import { Button } from '../../shared/ui/Controls';
import { PageTitle } from '../../shared/ui/PageTitle';
import { BackupSettings } from './BackupSettings';
import { EquipmentPicker } from './EquipmentPicker';
import { ProfileSettings } from './ProfileSettings';
import { RouteSettings } from './RouteSettings';
import { WorkoutSettings } from './WorkoutSettings';
import { settingsSectionTitles, type SettingsSection } from './sections';
import ui from '../../shared/ui/Common.module.css';
import styles from './Settings.module.css';

export function SettingsPage({
  section,
  theme,
  changeTheme,
  preferences,
  change,
  progress,
  restore,
  openOnboarding,
}: {
  section?: SettingsSection;
  theme: ThemePreference;
  changeTheme: (theme: ThemePreference) => void;
  preferences: WorkoutPreferences;
  change: (preferences: WorkoutPreferences) => void;
  progress: Progress;
  restore: (contents: string) => string;
  openOnboarding: () => void;
}) {
  function renderSection() {
    switch (section) {
      case 'workout':
        return <WorkoutSettings preferences={preferences} change={change} />;
      case 'schedule':
        return <RouteSettings preferences={preferences} change={change} />;
      case 'equipment':
        return (
          <EquipmentPicker
            selected={preferences.equipment ?? defaultEquipment}
            change={(equipment) => change({ ...preferences, equipment })}
          />
        );
      case 'profile':
        return (
          <ProfileSettings
            theme={theme}
            changeTheme={changeTheme}
            preferences={preferences}
            change={change}
          />
        );
      case 'data':
        return <BackupSettings progress={progress} restore={restore} />;
      default:
        return (
          <nav aria-label="Разделы настроек">
            <ul className={styles.settingsMenu}>
              {Object.entries(settingsSectionTitles).map(([id, title]) => (
                <li key={id}>
                  <ButtonLink className={styles.settingsLink} href={`#settings/${id}`}>
                    {title}
                  </ButtonLink>
                </li>
              ))}
              <li>
                <Button className={styles.settingsLink} onClick={openOnboarding}>
                  Знакомство с «Тропой»
                </Button>
              </li>
            </ul>
          </nav>
        );
    }
  }

  return (
    <section className={ui.narrow}>
      <BackLink href={section ? '#settings' : '#map'}>
        {section ? 'К настройкам' : 'К карте'}
      </BackLink>
      <PageTitle>{section ? settingsSectionTitles[section] : 'Настройки'}</PageTitle>
      {renderSection()}
    </section>
  );
}
