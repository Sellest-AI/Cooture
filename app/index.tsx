import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Image placeholder */}
        <View style={styles.imagePlaceholder} />

        <View style={styles.textContainer}>
          <Text style={styles.appName}>Cooture</Text>

          <Text style={styles.title}>
            The Future of{`\n`}Digital Influencers
          </Text>

          <Text style={styles.subtitle}>
            Create your outfits and turn{`\n`}yourself into a professional model.
          </Text>
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.button,
            pressed && styles.buttonPressed
          ]}
          onPress={() => router.push('/modal')}
        >
          <Text style={styles.buttonText}>Discover the future</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  imagePlaceholder: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  appName: {
    fontSize: 48,
    color: '#CFFF00',
    marginBottom: 40,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  title: {
    fontSize: 36,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 44,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
    opacity: 0.9,
    lineHeight: 24,
  },
  button: {
    backgroundColor: '#CFFF00',
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonPressed: {
    opacity: 0.8,
  },
  buttonText: {
    fontSize: 18,
    color: '#000000',
    fontWeight: '600',
  },
});
