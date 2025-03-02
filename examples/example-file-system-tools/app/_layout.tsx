import { Stack } from 'expo-router'
import { useFileExplorerDevTools } from 'file-explorer-expo-dev-plugin'

export default function RootLayout() {
  useFileExplorerDevTools()
  return <Stack screenOptions={{ headerTitle: 'File Explorer Example' }} />
}
