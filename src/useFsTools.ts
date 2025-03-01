import {
  DevToolsPluginClient,
  useDevToolsPluginClient,
  type EventSubscription,
} from 'expo/devtools'
import * as FileSystem from 'expo-file-system'
import { useEffect } from 'react'

const methods = {
  ping: 'ping',
  getFiles: 'get-files',
  getFileContent: 'get-file-content',
  deleteFile: 'delete-file',
  getRootDirectories: 'get-root-directories',
  uploadFile: 'upload-file',
  newFolder: 'new-folder',
}

type ErrorResponse = {
  error: string
}

export function useFsTools() {
  const client = useDevToolsPluginClient('file-system-expo-dev-plugin')

  useEffect(() => {
    const subscriptions: EventSubscription[] = []

    client?.sendMessage(methods.ping, { from: 'app' })

    subscriptions.push(
      client?.addMessageListener(methods.getFiles, (data: { path: string }) =>
        getFilesListener(client, data)
      )
    )

    subscriptions.push(
      client?.addMessageListener(methods.getRootDirectories, () =>
        getRootDirectoriesListener(client)
      )
    )

    subscriptions.push(
      client?.addMessageListener(
        methods.getFileContent,
        (data: { path: string }) => getFileContentListener(client, data)
      )
    )

    subscriptions.push(
      client?.addMessageListener(methods.deleteFile, (data: { path: string }) =>
        deleteFileListener(client, data)
      )
    )

    subscriptions.push(
      client?.addMessageListener(
        methods.uploadFile,
        (data: { path: string; name: string; base64String: string }) =>
          uploadFileListener(client, data)
      )
    )

    subscriptions.push(
      client?.addMessageListener(
        methods.newFolder,
        (data: { path: string; name: string }) =>
          newFolderListener(client, data)
      )
    )

    return () => {
      for (const subscription of subscriptions) {
        subscription?.remove()
      }
    }
  }, [client])
}

async function getRootDirectoriesListener(client: DevToolsPluginClient) {
  const rootDirectories = {
    document: FileSystem.documentDirectory,
    cache: FileSystem.cacheDirectory,
    bundle: `file://${FileSystem.bundleDirectory}`,
  }
  client?.sendMessage(methods.getRootDirectories, { rootDirectories })
}

async function getFilesListener(
  client: DevToolsPluginClient,
  data: { path: string }
) {
  let files: string[] = []
  try {
    files = await FileSystem.readDirectoryAsync(data.path)
  } catch (error) {
    client?.sendMessage(methods.getFiles, {
      error: error.message,
    } as ErrorResponse)
    return
  }

  const filePromises = files.map(async (file) => {
    try {
      return {
        name: file,
        info: await FileSystem.getInfoAsync(`${data.path}/${file}`),
      }
    } catch (error) {
      return { error: error.message }
    }
  })

  const filesWithMetadata = await Promise.all(filePromises)

  const validFiles = filesWithMetadata.filter((file) => !('error' in file))
  const errors = filesWithMetadata
    .filter((file) => 'error' in file)
    .map((file) => (file as { error: string }).error)

  client?.sendMessage(methods.getFiles, {
    files: validFiles,
    errors: errors.length > 0 ? errors : undefined,
  })
}

async function getFileContentListener(
  client: DevToolsPluginClient,
  data: { path: string }
) {
  const content = await FileSystem.readAsStringAsync(data.path, {
    encoding: FileSystem.EncodingType.Base64,
  })
  client?.sendMessage(methods.getFileContent, { content, path: data.path })
}

async function deleteFileListener(
  client: DevToolsPluginClient,
  data: { path: string }
) {
  try {
    await FileSystem.deleteAsync(data.path)
    client?.sendMessage(methods.deleteFile, {})
  } catch (error) {
    client?.sendMessage(methods.deleteFile, {
      error: error.message,
    } as ErrorResponse)
  }
}

async function uploadFileListener(
  client: DevToolsPluginClient,
  data: { path: string; name: string; base64String: string }
) {
  try {
    await FileSystem.writeAsStringAsync(
      `${data.path}/${data.name}`,
      data.base64String,
      {
        encoding: FileSystem.EncodingType.Base64,
      }
    )
    client?.sendMessage(methods.uploadFile, {})
  } catch (error) {
    client?.sendMessage(methods.uploadFile, {
      error: error.message,
    } as ErrorResponse)
  }
}

async function newFolderListener(
  client: DevToolsPluginClient,
  data: { path: string; name: string }
) {
  try {
    await FileSystem.makeDirectoryAsync(`${data.path}/${data.name}`, {
      intermediates: true,
    })
    client?.sendMessage(methods.newFolder, {})
  } catch (error) {
    client?.sendMessage(methods.newFolder, {
      error: error.message,
    } as ErrorResponse)
  }
}
