import { FileInfo } from 'expo-file-system'

export enum RootDirectory {
  Document = 'document',
  Cache = 'cache',
  Bundle = 'bundle',
}

export type AppFile = {
  name: string
  info: FileInfo
}
