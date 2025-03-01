export function bytesToSize(bytes: number) {
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  if (bytes === 0) return '0 Byte'
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return Math.round(bytes / Math.pow(1024, i)) + ' ' + sizes[i]
}

export function getRelativeExpoFsPathParts(path: string, root: string) {
  const decodedPath = decodeURI(path)
  const decodedRoot = decodeURI(root)

  if (!decodedPath.startsWith(decodedRoot)) {
    return []
  }

  const relativePath = decodedPath.replace(decodedRoot, '')
  return relativePath.split('/').filter((p) => p !== '')
}

export function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

export function formatTimestamp(timestamp: number) {
  const date = new Date(timestamp * 1000)
  return date.toLocaleString()
}

export function convertFileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve((reader.result as string).split(',')[1])
    reader.onerror = (error) => reject(error)
  })
}

export function base64ToByteArray(base64: string) {
  const byteCharacters = atob(base64)
  const byteArray = new Uint8Array(byteCharacters.length)
  for (let i = 0; i < byteCharacters.length; i++) {
    byteArray[i] = byteCharacters.charCodeAt(i)
  }
  return byteArray
}
