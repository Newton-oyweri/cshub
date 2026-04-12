import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

const WORKER_URL = 'https://posts-api.unscriptedusa.workers.dev';

export default function CreatePost() {
  const router = useRouter();

  const [image, setImage] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.5,
    });

    if (!result.canceled && result.assets?.[0]) {
      setImage(result.assets[0].uri);
    }
  };

  const handleSubmit = async () => {
    if (!image || !title) {
      Alert.alert('Missing fields', 'Add image and title');
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('file', {
        uri: image,
        name: `post_${Date.now()}.jpg`,
        type: 'image/jpeg',
      });

      formData.append('title', title);
      formData.append('description', description);

      const res = await fetch(WORKER_URL, {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        router.back();
      } else {
        throw new Error('Upload failed');
      }

    } catch (err) {
      Alert.alert('Error', 'Failed to post');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#1C3150" />
        </TouchableOpacity>

        <Text style={styles.headerText}>Create Post</Text>

        <View style={{ width: 24 }} />
      </View>

      {/* Image Picker */}
      <TouchableOpacity style={styles.imageBox} onPress={pickImage}>
        {image ? (
          <Image source={{ uri: image }} style={styles.image} />
        ) : (
          <Text style={styles.placeholder}>Tap to select image</Text>
        )}
      </TouchableOpacity>

      {/* Title */}
      <TextInput
        placeholder="Title..."
        placeholderTextColor="#8A94A6"
        style={styles.input}
        value={title}
        onChangeText={setTitle}
      />

      {/* Description */}
      <TextInput
        placeholder="Description..."
        placeholderTextColor="#8A94A6"
        style={[styles.input, { height: 100 }]}
        multiline
        value={description}
        onChangeText={setDescription}
      />

      {/* Submit */}
      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        {loading
          ? <ActivityIndicator color="#fff" />
          : <Text style={styles.buttonText}>Post</Text>}
      </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF', // pure white
    padding: 16
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },

  headerText: {
    color: '#1C3150', // brand dark blue for contrast
    fontSize: 18,
    fontWeight: '700',
  },

  imageBox: {
    height: 200,
    backgroundColor: '#F6F8FC', // soft white-grey
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E6EAF0',
  },

  image: {
    width: '100%',
    height: '100%',
    borderRadius: 12
  },

  placeholder: {
    color: '#8A94A6'
  },

  input: {
    backgroundColor: '#FFFFFF',
    color: '#1C3150',
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E6EAF0',
  },

  button: {
    backgroundColor: '#1C3150', // dark blue primary action
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },

  buttonText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});