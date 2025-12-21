---
applyTo: '**'
---

# EES-RN-AI Copilot Instructions

## Project Overview

**EES-RN-AI** is a React Native + Expo bare workflow application supporting iOS, Android, and web platforms. It has migrated from managed workflow to bare workflow to gain full native code access.

- **Framework**: Expo 54.0.25 (bare workflow) + React Native 0.81.5
- **Key Features**: File-based routing (Expo Router), NativeWind styling, Gluestack UI components, TypeScript strict mode
- **Architecture**: New React Native Architecture enabled (`newArchEnabled: true`), Hermes engine, React Compiler

## Development Setup & Commands

```bash
yarn install         # Install dependencies
yarn start           # Start dev client (expo start --dev-client)
yarn android         # Build and run on Android device/emulator
yarn ios             # Build and run on iOS device/simulator
yarn web             # Run on web (expo start --web)
yarn lint            # Run ESLint (expo lint)
yarn format          # Format code with Prettier
yarn type-check      # TypeScript type checking (tsc --noEmit)
```

**Key Distinction**: Use `yarn start` (dev client) not `expo start` (Expo Go). Dev client required for native module development.

## Codebase Architecture

### Routing Structure (`app/` directory)

- **File-based routing** via Expo Router with typed routes enabled
- Root layout: `app/_layout.tsx` — sets up `GluestackUIProvider`, theme provider, and `Stack` navigator
- Tabs layout: `app/(tabs)/_layout.tsx` — defines two screens via bottom tab navigation
- `app/(tabs)/index.tsx` — Home screen with parallax scroll
- `app/(tabs)/explore.tsx` — Example screen with collapsible components
- `app/modal.tsx` — Modal example with `presentation: 'modal'`

### Core Dependencies & Patterns

**UI Layer**:

- **NativeWind** (v4.2.1): Tailwind CSS for React Native via `@tailwind` directives in `global.css`
- **Gluestack UI**: Provides overlay and toast providers; theme variables in `components/ui/gluestack-ui-provider/config.ts`
- **Custom themed components**: `ThemedText`, `ThemedView` — accept `lightColor`/`darkColor` props and use `useThemeColor` hook

**Styling Philosophy**:

- Tailwind utility classes via NativeWind for layout/spacing
- Platform-specific CSS variables in Gluestack config (light/dark modes)
- `constants/theme.ts` defines color palettes and platform-specific fonts
- No StyleSheet overrides preferred; use inline styles for theme-dependent values

**Animation**:

- `react-native-reanimated` v4.1.1 for animations (`ParallaxScrollView`, `HelloWave`)
- Avoid inline animations; create reusable Animated components

**Icons**:

- iOS: SF Symbols via `expo-symbols`
- Android/Web: Material Icons via `@expo/vector-icons`
- Mapping in `components/ui/icon-symbol.tsx` and `icon-symbol.ios.tsx`

### Theme System

**Hooks**:

- `useColorScheme()` — returns `'light' | 'dark' | null` from React Native
- `useThemeColor(props, colorName)` — accepts `{ light?: string, dark?: string }` and color name
- Web-specific: `use-color-scheme.web.ts` handles hydration to prevent mismatches

**Color Constants**:

- Defined in `constants/theme.ts`: `Colors.light`, `Colors.dark`, `Fonts`
- Gluestack config in `components/ui/gluestack-ui-provider/config.ts` provides CSS variables for all semantic colors
- **New colors must be added to both places** to work across components

**Dark Mode Behavior**:

- Global setting: `GluestackUIProvider mode="dark"` (hardcoded in root layout)
- Component-level: use `useColorScheme()` to detect user preference and apply conditional styles

## Code Patterns & Conventions

### TypeScript Configuration

- **Strict mode enabled**: `noImplicitAny`, `strictNullChecks`, `noUnusedLocals`, `noUnusedParameters`
- **Path aliases**: `@/*` maps to root, `tailwind.config` maps to config file
- Enforce explicit return types on all functions

### Styling Rules

1. **Prefer NativeWind utilities** for layout (flexbox, spacing, sizing)
2. **Use Gluestack colors** for semantic colors (primary, error, success, etc.)
3. **Avoid hardcoded colors** — always use theme system
4. **No inline StyleSheet.create()** for theme-dependent styles; use hooks
5. **Web platforms**: Test tailwind classes carefully; not all React Native properties map to CSS

### Component Structure

```tsx
// Correct pattern
import { useThemeColor } from '@/hooks/use-theme-color';
import { useColorScheme } from '@/hooks/use-color-scheme';

export function MyComponent() {
  const colorScheme = useColorScheme();
  const textColor = useThemeColor({}, 'text');

  return <View style={{ color: textColor }} />;
}
```

### File Naming & Organization

- TSX files for React components; TS for utilities/hooks
- Platform-specific suffixes: `.ios.tsx`, `.android.tsx`, `.web.tsx`, `.next15.tsx` (for Next.js compat)
- Example: `use-color-scheme.ts` (default) and `use-color-scheme.web.ts` (web override)
- Group related files: `components/ui/` for reusable UI, `hooks/` for custom hooks

## Git & Commit Standards

**Conventional Commits** enforced by `commitlint` via Husky:

```
<type>(<scope>): <description>
```

**Types**: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`

**Examples**:

- `feat(tabs): add new explore screen`
- `fix(theme): fix color scheme toggle in dark mode`
- `style(format): run prettier on components`

**Pre-commit hooks** validate messages; `pre-commit` hook is disabled (no tests yet).

## Common Development Tasks

### Adding a New Screen

1. Create file in `app/(tabs)/screen-name.tsx`
2. Add to `app/(tabs)/_layout.tsx` with `Tabs.Screen` and icon
3. Use `ParallaxScrollView` for standard layout or custom scroll structure
4. Import themed components: `ThemedText`, `ThemedView`

### Adding New Colors

1. Add RGB values to `constants/theme.ts` in both `Colors.light` and `Colors.dark`
2. Add corresponding CSS variables to Gluestack config in `components/ui/gluestack-ui-provider/config.ts`
3. Reference via `useThemeColor()` hook
4. Update Tailwind safelist in `tailwind.config.js` if adding dynamic classes

### Updating Dependencies

- Check `renovate.json` for stability requirements
- Core packages (expo, react, react-native) require 3-day stabilization
- Rebuild native code after updates: `yarn android` / `yarn ios`

### Debugging

- **TypeScript**: Run `yarn type-check` before commits
- **Linting**: `yarn lint` (ESLint + Expo lint)
- **Dev Client**: Device must have Dev Client app installed; rebuild via `expo run:platform`
- **Native Code**: Access `ios/` and `android/` directories for native debugging

## Performance Considerations

- **Hermes Engine**: Enabled for JavaScript performance; verify native modules support it
- **React Compiler**: Enabled in experiments; automatically memoizes components
- **Reanimated**: Use for animations; avoid expensive re-renders in scroll listeners
- **List Rendering**: Use `FlashList` or optimize with `React.memo` for long lists

## File Structure Quick Reference

- `app/` — Expo Router screens and layouts
- `components/` — Reusable React components; `ui/` subdirectory for base components
- `hooks/` — Custom React hooks (theme, color scheme)
- `constants/` — Theme colors, fonts, constants
- `config/` — Configuration files (currently empty)
- `modules/` — Custom native modules
- `plugins/` — Expo plugins
- `android/`, `ios/` — Native source code (bare workflow)
- `docs/` — Project documentation (workflow migration guide, git conventions)

## Known Limitations & Workarounds

1. **Web platform gaps**: Not all React Native properties work on web; test carefully
2. **Tailwind with NativeWind**: Dynamic class names not supported; use static utility classes or `tailwind-variants`
3. **Color scheme persistence**: `useColorScheme()` reflects system preference; no user override saved locally (by design)
4. **Gluestack + NativeWind integration**: Color variables must stay in sync between config files

## Resources

- [Expo Documentation](https://docs.expo.dev)
- [React Native Docs](https://reactnative.dev)
- [Expo Router Guide](https://docs.expo.dev/router/introduction)
- [NativeWind Docs](https://www.nativewind.dev)
- [Conventional Commits](https://www.conventionalcommits.org)
- Project docs: `docs/workflow-migration-guide.md`, `docs/git/commit.md`
