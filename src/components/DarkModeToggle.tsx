import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import { Switch } from '@radix-ui/react-switch' // optional, since radix-ui is installed

export default function DarkModeToggle() {
  const { theme, setTheme, systemTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Avoid hydration mismatch by rendering toggle only on client
  useEffect(() => setMounted(true), [])

  if (!mounted) return null

  // Determine current theme considering system
  const currentTheme = theme === 'system' ? systemTheme ?? 'light' : theme


  return (
    <Switch
      checked={currentTheme === 'dark' ? true : false}
      onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
      className="w-[42px] h-[25px] bg-gray-200 rounded-full relative data-[state=checked]:bg-indigo-600 transition-colors"
      aria-label="Toggle Dark Mode"
    >
      <span className="block w-[21px] h-[21px] bg-white rounded-full shadow-md transform data-[state=checked]:translate-x-[17px] transition-transform" />
    </Switch>
  )
}
