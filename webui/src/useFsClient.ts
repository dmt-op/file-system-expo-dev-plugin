import { useDevToolsPluginClient, type EventSubscription } from 'expo/devtools'
import { useEffect, useCallback, useState } from 'react'
import { AppFile, RootDirectory } from '@/types'
import { message } from 'antd'
import { base64ToByteArray, convertFileToBase64 } from './utils'
import mime from 'mime'

const methods = {
  ping: 'ping',
  getFiles: 'get-files',
  getFileContent: 'get-file-content',
  deleteFile: 'delete-file',
  getRootDirectories: 'get-root-directories',
  uploadFile: 'upload-file',
  newFolder: 'new-folder',
}

type UseClientProps = {
  activePath: string
  setActivePath: (activePath: string) => void
  rootDirectoryType: RootDirectory
}

export function useFsClient({
  activePath,
  setActivePath,
  rootDirectoryType,
}: UseClientProps) {
  const client = useDevToolsPluginClient('file-explorer-expo-dev-plugin')
  const [rootDirectories, setRootDirectories] = useState<Record<
    RootDirectory,
    string
  > | null>(null)
  const [files, setFiles] = useState<AppFile[]>([])

  const fetchFiles = useCallback(() => {
    if (activePath === '') return

    client?.sendMessage(methods.getFiles, { path: activePath })
  }, [client, activePath])

  const getFileContent = useCallback(
    (path: string) => {
      client?.sendMessage(methods.getFileContent, { path })
    },
    [client]
  )

  const deleteFile = useCallback(
    (path: string) => {
      client?.sendMessage(methods.deleteFile, { path })
    },
    [client]
  )

  const uploadFile = useCallback(
    async (file: File) => {
      const base64String = await convertFileToBase64(file)

      client?.sendMessage(methods.uploadFile, {
        path: activePath,
        name: encodeURI(file.name),
        base64String,
      })
    },
    [client, activePath]
  )

  const createNewFolder = useCallback(
    (folderName: string) => {
      client?.sendMessage(methods.newFolder, {
        path: activePath,
        name: encodeURI(folderName),
      })
    },
    [client, activePath]
  )

  useEffect(() => {
    const subscriptions: EventSubscription[] = []

    subscriptions.push(
      client?.addMessageListener(methods.ping, (data) => {
        message.success(`Connected`)
        client?.sendMessage(methods.ping, { from: 'web' })
      })
    )

    subscriptions.push(
      client?.addMessageListener(methods.getFiles, (data) => {
        processResponse(data)
        setFiles(data.files ?? [])
      })
    )

    subscriptions.push(
      client?.addMessageListener(methods.getRootDirectories, (data) => {
        setRootDirectories(data.rootDirectories)
        setActivePath(data.rootDirectories?.[rootDirectoryType])
      })
    )

    subscriptions.push(
      client?.addMessageListener(methods.getFileContent, (data) => {
        const blob = new Blob([base64ToByteArray(data.content)], {
          type: mime.getType(data.path) || '',
        })
        const url = URL.createObjectURL(blob)

        const a = document.createElement('a')
        a.href = url
        a.download = decodeURI(data.path).split('/').pop() || 'file'
        a.click()

        setTimeout(() => URL.revokeObjectURL(url), 100)
      })
    )

    client?.sendMessage(methods.getRootDirectories, {})

    return () => {
      for (const subscription of subscriptions) {
        subscription?.remove()
      }
    }
  }, [client])

  useEffect(() => {
    const dynamicSubscriptions: EventSubscription[] = []

    dynamicSubscriptions.push(
      client?.addMessageListener(
        methods.deleteFile,
        (data: { result: boolean; error: string }) => {
          if (processResponse(data)) {
            message.success(`Deleted`)
            fetchFiles()
          }
        }
      )
    )

    dynamicSubscriptions.push(
      client?.addMessageListener(methods.uploadFile, (data) => {
        if (processResponse(data)) {
          message.success(`File uploaded`)
          fetchFiles()
        }
      })
    )

    dynamicSubscriptions.push(
      client?.addMessageListener(methods.newFolder, (data) => {
        if (processResponse(data)) {
          message.success(`Folder created`)
          fetchFiles()
        }
      })
    )
    return () => {
      for (const subscription of dynamicSubscriptions) {
        subscription?.remove()
      }
    }
  }, [client, fetchFiles])

  return {
    files,
    rootDirectories,
    fetchFiles,
    getFileContent,
    deleteFile,
    uploadFile,
    createNewFolder,
  }
}

const processResponse = (data: any): boolean => {
  if (data.error) {
    message.error(`Failed to ${data.error}`, 3)
    return false
  } else if (data.errors) {
    message.error(`Failed to get files: ${data.errors.join('\n')}`, 3)
    return false
  }
  return true
}
