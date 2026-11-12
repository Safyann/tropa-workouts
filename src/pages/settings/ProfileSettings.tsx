import type { WorkoutPreferences } from '../../entities/program';
import { BodyWeightForm } from '../../features/workout/BodyWeightForm';
import { themeOptions, type ThemePreference } from '../../shared/lib/theme';
import { Select } from '../../shared/ui/Controls';
import ui from '../../shared/ui/Common.module.css';
import formStyles from '../../shared/ui/SettingsForm.module.css';

const themeLabels: Record<ThemePreference, string> = {
  system: 'Системная',
  light: 'Светлая',
  dark: 'Тёмная',
};

export function ProfileSettings({
  theme,
  changeTheme,
  preferences,
  change,
}: {
  theme: ThemePreference;
  changeTheme: (theme: ThemePreference) => void;
  preferences: WorkoutPreferences;
  change: (preferences: WorkoutPreferences) => void;
}) {
  return (
    <div className={ui.panel}>
      <div className={formStyles.fields}>
        <label className={formStyles.wide}>
          Тема оформления
          <Select
            value={theme}
            onChange={(event) => {
              const selected = themeOptions.find((option) => option === event.target.value);
              if (selected) changeTheme(selected);
            }}
          >
            {themeOptions.map((option) => (
              <option key={option} value={option}>
                {themeLabels[option]}
              </option>
            ))}
          </Select>
        </label>
      </div>
      <BodyWeightForm
        key={preferences.bodyWeightKg}
        value={preferences.bodyWeightKg}
        save={(bodyWeightKg) => change({ ...preferences, bodyWeightKg })}
      />
    </div>
  );
}
