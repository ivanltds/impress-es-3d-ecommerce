// Server Component — injects universe CSS vars via scoped CSS Module class
import styles from './UniverseThemeProvider.module.css'

interface Props {
  universeSlug: string
  children: React.ReactNode
}

export function UniverseThemeProvider({ universeSlug, children }: Props) {
  const key = ('universe_' + universeSlug.replace(/-/g, '_')) as keyof typeof styles
  const themeClass = styles[key] ?? ''
  return <div className={themeClass}>{children}</div>
}
