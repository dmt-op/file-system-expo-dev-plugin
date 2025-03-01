import { Stack } from 'expo-router'
import { useFsTools } from 'file-system-expo-dev-plugin'

export default function RootLayout() {
  useFsTools()
  return <Stack screenOptions={{ headerTitle: 'File System Tools Example' }} />
}
