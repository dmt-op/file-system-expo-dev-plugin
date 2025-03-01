import { Modal, Typography, Input } from 'antd'
import { useState, useCallback } from 'react'

export function NewFolderModal({
  isOpen,
  onCreate,
  onCancel,
}: {
  isOpen: boolean
  onCreate: (folderName: string) => void
  onCancel: () => void
}) {
  const [folderName, setFolderName] = useState('')

  const handleCreate = useCallback(() => {
    onCreate(folderName)
    setFolderName('')
  }, [onCreate, folderName])

  const handleCancel = useCallback(() => {
    onCancel()
    setFolderName('')
  }, [onCancel])

  return (
    <Modal open={isOpen} onOk={handleCreate} onCancel={handleCancel}>
      <Typography.Title level={5}>Create New Folder</Typography.Title>
      <Input
        placeholder="Type here..."
        value={folderName}
        onChange={(e) => setFolderName(e.target.value)}
      />
    </Modal>
  )
}
