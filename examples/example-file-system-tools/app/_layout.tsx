import { Stack } from 'expo-router'
import { useFileExplorer } from 'file-explorer-expo-dev-plugin'

export default function RootLayout() {
  useFileExplorer()
  return <Stack screenOptions={{ headerTitle: 'File Explorer Example' }} />
}
