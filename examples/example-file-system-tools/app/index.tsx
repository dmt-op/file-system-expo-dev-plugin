import { Button, Text, View, StyleSheet, Alert } from 'react-native'
import * as FileSystem from 'expo-file-system'
import * as ImagePicker from 'expo-image-picker'
import * as DocumentPicker from 'expo-document-picker'
import { useCallback } from 'react'

export default function Index() {
  const createRandomFiles = useCallback(async () => {
    try {
      const rootFolder = `${FileSystem.documentDirectory}/folder${Math.random()}`
      const nestedFolders = `${FileSystem.documentDirectory}/folder1/folder2/folder 3`
      await FileSystem.makeDirectoryAsync(rootFolder, { intermediates: true })
      await FileSystem.makeDirectoryAsync(nestedFolders, {
        intermediates: true,
      })

      const rootFile = `${rootFolder}/${Date.now()}.txt`
      const nestedFile = `${nestedFolders}/${Date.now() + 1}.txt`

      await FileSystem.writeAsStringAsync(rootFile, 'Hello, world!')
      await FileSystem.writeAsStringAsync(nestedFile, 'Hello, world!')
    } catch (error) {
      console.error(error)
    }
  }, [])

  const clearDocumentDirectory = useCallback(async () => {
    try {
      const files = await FileSystem.readDirectoryAsync(
        FileSystem.documentDirectory!
      )
      for (const file of files) {
        await FileSystem.deleteAsync(`${FileSystem.documentDirectory!}/${file}`)
      }
    } catch (error) {
      console.error(error)
    }
  }, [])

  const pickImageAsync = useCallback(async () => {
    try {
      let result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: false,
        quality: 1,
      })

      if (result.assets?.[0]) {
        const asset = result.assets[0]
        const filePath = `${FileSystem.documentDirectory}/${asset.fileName}`
        await FileSystem.moveAsync({
          from: asset.uri,
          to: filePath,
        })
      }
    } catch (error) {
      console.error(error)
    }
  }, [])

  const pickDocumentAsync = useCallback(async () => {
    try {
      let result = await DocumentPicker.getDocumentAsync()

      if (result.assets?.[0]) {
        const asset = result.assets[0]
        const filePath = `${FileSystem.documentDirectory}/${asset.name}`
        await FileSystem.moveAsync({
          from: asset.uri,
          to: filePath,
        })
      }
    } catch (error) {
      console.error(error)
    }
  }, [])

  return (
    <View style={styles.container}>
      <Text style={styles.header}>File System Tools</Text>

      <View style={styles.buttonContainer}>
        <View style={styles.buttonWrapper}>
          <Button title="Pick Image" onPress={pickImageAsync} />
        </View>

        <View style={styles.buttonWrapper}>
          <Button title="Pick Document" onPress={pickDocumentAsync} />
        </View>

        <View style={styles.buttonWrapper}>
          <Button title="Create Random Files" onPress={createRandomFiles} />
        </View>

        <View style={styles.buttonWrapper}>
          <Button
            title="Clear Document Directory"
            onPress={clearDocumentDirectory}
          />
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
  },
  buttonContainer: {
    width: '100%',
    maxWidth: 300,
  },
  buttonWrapper: {
    marginVertical: 8,
    width: '100%',
  },
})
