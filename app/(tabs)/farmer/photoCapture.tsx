// FarmerPhotoCapture.tsx

import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Location from 'expo-location';
import { useEffect, useRef, useState } from 'react';

import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  Image,
  Modal,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const SHEET_TOP = 0;
const CAM_HEIGHT = SCREEN_HEIGHT * 0.5;

type CapturedPhoto = {
  uri: string;
  lat: string;
  lng: string;
  capturedAt: string;
};

type CameraFacing = 'back' | 'front';

const COLORS = {
  primary: '#1A4D2E',
  primaryLight: '#2E7D32',
  background: '#F4F7F4',
  card: '#FFFFFF',
  text: '#1F2937',
  subText: '#6B7280',
  border: '#DDE5DD',
  dark: '#111111',
};

function LiveClock() {
  const [time, setTime] = useState('');

  useEffect(() => {
    const update = () => {
      setTime(
        new Date().toLocaleString('en-IN', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
      );
    };

    update();

    const id = setInterval(update, 1000);

    return () => clearInterval(id);
  }, []);

  return <Text style={styles.timeText}>{time}</Text>;
}

function CameraToggle({
  facing,
  onChange,
}: {
  facing: CameraFacing;
  onChange: (f: CameraFacing) => void;
}) {
  return (
    <View style={styles.toggleWrapper}>
      <Text style={styles.toggleHeading}>
        SELECT CAMERA
      </Text>

      <View style={styles.toggleRow}>
        {(['back', 'front'] as CameraFacing[]).map(
          (item) => {
            const selected = facing === item;

            return (
              <TouchableOpacity
                key={item}
                style={[
                  styles.toggleOption,
                  selected &&
                    styles.toggleOptionSelected,
                ]}
                onPress={() => onChange(item)}
                activeOpacity={0.85}
              >
                <View
                  style={[
                    styles.radioOuter,
                    selected &&
                      styles.radioOuterSelected,
                  ]}
                >
                  {selected && (
                    <View style={styles.radioInner} />
                  )}
                </View>

                <Ionicons
                  name={
                    item === 'back'
                      ? 'camera-outline'
                      : 'person-outline'
                  }
                  size={16}
                  color={selected ? '#fff' : '#888'}
                />

                <Text
                  style={[
                    styles.toggleLabel,
                    selected &&
                      styles.toggleLabelSelected,
                  ]}
                >
                  {item === 'back'
                    ? 'Back Camera'
                    : 'Front Camera'}
                </Text>
              </TouchableOpacity>
            );
          }
        )}
      </View>
    </View>
  );
}

export default function FarmerPhotoCapture() {
  const [permission, requestPermission] =
    useCameraPermissions();

  const [facing, setFacing] =
    useState<CameraFacing>('back');

  const [liveCoords, setLiveCoords] = useState<{
    lat: string;
    lng: string;
  } | null>(null);

  const [currentPhoto, setCurrentPhoto] =
    useState<CapturedPhoto | null>(null);

  const [uploadedPhotos, setUploadedPhotos] =
    useState<CapturedPhoto[]>([]);

  const [sheetVisible, setSheetVisible] =
    useState(false);

  const [previewVisible, setPreviewVisible] =
    useState(false);

  const [isTaking, setIsTaking] = useState(false);

  const slideAnim = useRef(
    new Animated.Value(SCREEN_HEIGHT)
  ).current;

  const cameraRef = useRef<CameraView | null>(null);

  const locationWatch =
    useRef<Location.LocationSubscription | null>(
      null
    );

  useEffect(() => {
    if (sheetVisible) {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        bounciness: 3,
      }).start();

      startGPS();
    } else {
      Animated.timing(slideAnim, {
        toValue: SCREEN_HEIGHT,
        duration: 250,
        useNativeDriver: true,
      }).start();

      stopGPS();
    }
  }, [sheetVisible]);

  const startGPS = async () => {
    const permission =
      await Location.requestForegroundPermissionsAsync();

    if (!permission.granted) return;

    locationWatch.current =
      await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 2000,
          distanceInterval: 0,
        },
        (location) => {
          setLiveCoords({
            lat: location.coords.latitude.toFixed(6),
            lng: location.coords.longitude.toFixed(6),
          });
        }
      );
  };

  const stopGPS = () => {
    locationWatch.current?.remove();
    locationWatch.current = null;
  };

  useEffect(() => {
    Location.requestForegroundPermissionsAsync();

    return stopGPS;
  }, []);

  if (!permission) {
    return (
      <View style={styles.center}>
        <ActivityIndicator
          size="large"
          color={COLORS.primary}
        />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.center}>
        <View style={styles.permissionCard}>
          <Ionicons
            name="camera-outline"
            size={52}
            color={COLORS.primary}
          />

          <Text style={styles.permissionTitle}>
            Camera Access Required
          </Text>

          <Text style={styles.permissionSub}>
            Needed to capture geo-tagged field photos
          </Text>

          <TouchableOpacity
            style={styles.permissionButton}
            onPress={requestPermission}
          >
            <Text
              style={styles.permissionButtonText}
            >
              Grant Permission
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const openCamera = async () => {
    const permission =
      await Location.requestForegroundPermissionsAsync();

    if (!permission.granted) {
      Alert.alert(
        'Location Required',
        'Enable location permission to continue.'
      );

      return;
    }

    setCurrentPhoto(null);
    setLiveCoords(null);
    setSheetVisible(true);
  };

  const takePicture = async () => {
    if (!cameraRef.current || isTaking) return;

    setIsTaking(true);

    try {
      const [photo, location] = await Promise.all([
        cameraRef.current.takePictureAsync({
          quality: 0.9,
          skipProcessing: false,
        }),

        Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        }),
      ]);

      const captured: CapturedPhoto = {
        uri: photo.uri,
        lat: location.coords.latitude.toFixed(6),
        lng: location.coords.longitude.toFixed(6),
        capturedAt: new Date().toLocaleString(
          'en-IN',
          {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          }
        ),
      };

      setCurrentPhoto(captured);

      setSheetVisible(false);

      setTimeout(() => {
        setPreviewVisible(true);
      }, 250);
    } catch {
      Alert.alert(
        'Capture Failed',
        'Could not capture photo.'
      );
    } finally {
      setIsTaking(false);
    }
  };

  const retakePhoto = () => {
    setPreviewVisible(false);

    setTimeout(() => {
      setCurrentPhoto(null);
      setSheetVisible(true);
    }, 250);
  };

  const uploadPhoto = () => {
    if (!currentPhoto) return;

    setUploadedPhotos((prev) => [
      currentPhoto,
      ...prev,
    ]);

    Alert.alert(
      'Success',
      'Photo uploaded successfully'
    );

    setCurrentPhoto(null);
    setPreviewVisible(false);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={
          styles.scrollContent
        }
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>
              Field Capture
            </Text>

            <Text style={styles.headerSub}>
              Geo-tagged field photography
            </Text>
          </View>

          <View style={styles.countBadge}>
            <Ionicons
              name="leaf"
              size={14}
              color={COLORS.primary}
            />

            <Text style={styles.countText}>
              {uploadedPhotos.length} uploaded
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.launcher}
          onPress={openCamera}
          activeOpacity={0.85}
        >
          <View style={styles.launchIcon}>
            <Ionicons
              name="camera"
              size={34}
              color={COLORS.primary}
            />
          </View>

          <View style={{ flex: 1 }}>
            <Text style={styles.launchTitle}>
              Capture Field Photo
            </Text>

            <Text style={styles.launchHint}>
              GPS coordinates stamped automatically
            </Text>
          </View>

          <Ionicons
            name="chevron-forward"
            size={22}
            color={COLORS.primary}
          />
        </TouchableOpacity>
      </ScrollView>

      {/* CAMERA MODAL */}

      <Modal
        visible={sheetVisible}
        transparent
        animationType="none"
        statusBarTranslucent
      >
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={() =>
            setSheetVisible(false)
          }
        />

        <Animated.View
          style={[
            styles.sheet,
            {
              transform: [
                {
                  translateY: slideAnim,
                },
              ],
            },
          ]}
        >
          <View style={styles.cameraSection}>
            <CameraView
              ref={cameraRef}
              style={StyleSheet.absoluteFill}
              facing={facing}
            />

            <View style={styles.overlayRow}>
              <View style={styles.gpsBox}>
                <View style={styles.gpsDot} />

                <Ionicons
                  name="locate"
                  size={11}
                  color="#80CBC4"
                />

                <Text
                  style={styles.gpsText}
                  numberOfLines={1}
                >
                  {liveCoords
                    ? `${liveCoords.lat}, ${liveCoords.lng}`
                    : 'Acquiring GPS...'}
                </Text>
              </View>

              <View style={styles.clockBox}>
                <Ionicons
                  name="time-outline"
                  size={11}
                  color="#fff"
                />

                <LiveClock />
              </View>
            </View>

            <TouchableOpacity
              style={styles.closeButton}
              onPress={() =>
                setSheetVisible(false)
              }
            >
              <View style={styles.closeCircle}>
                <Ionicons
                  name="close"
                  size={18}
                  color="#fff"
                />
              </View>
            </TouchableOpacity>
          </View>

          <View style={styles.controls}>
            <CameraToggle
              facing={facing}
              onChange={setFacing}
            />

            <View style={styles.captureSection}>
              <TouchableOpacity
                style={[
                  styles.shutter,
                  isTaking &&
                    styles.shutterDisabled,
                ]}
                onPress={takePicture}
                disabled={isTaking}
                activeOpacity={0.85}
              >
                {isTaking ? (
                  <ActivityIndicator
                    color={COLORS.primary}
                  />
                ) : (
                  <View
                    style={styles.shutterInner}
                  />
                )}
              </TouchableOpacity>

              <Text style={styles.captureText}>
                Tap to capture
              </Text>
            </View>
          </View>
        </Animated.View>
      </Modal>

      {/* PREVIEW MODAL */}

      <Modal
        visible={previewVisible}
        animationType="slide"
        transparent={false}
        statusBarTranslucent
      >
        <SafeAreaView
          style={styles.previewContainer}
        >
          <View style={styles.previewHeader}>
            <Text style={styles.previewTitle}>
              Photo Preview
            </Text>

            <TouchableOpacity
              onPress={() =>
                setPreviewVisible(false)
              }
            >
              <Ionicons
                name="close"
                size={28}
                color="#fff"
              />
            </TouchableOpacity>
          </View>

          <View
            style={styles.previewImageWrapper}
          >
            {currentPhoto && (
              <Image
                source={{
                  uri: currentPhoto.uri,
                }}
                style={styles.previewImage}
                resizeMode="cover"
              />
            )}
          </View>

          {currentPhoto && (
            <View style={styles.infoCard}>
              <View style={styles.infoRow}>
                <Ionicons
                  name="location"
                  size={16}
                  color="#4CAF50"
                />

                <Text style={styles.infoText}>
                  {currentPhoto.lat},{' '}
                  {currentPhoto.lng}
                </Text>
              </View>

              <View style={styles.infoRow}>
                <Ionicons
                  name="time"
                  size={16}
                  color="#2196F3"
                />

                <Text style={styles.infoText}>
                  {currentPhoto.capturedAt}
                </Text>
              </View>
            </View>
          )}

          <View
            style={styles.previewButtonRow}
          >
            <TouchableOpacity
              style={styles.retakeButton}
              onPress={retakePhoto}
              activeOpacity={0.85}
            >
              <Ionicons
                name="refresh"
                size={20}
                color="#fff"
              />

              <Text
                style={
                  styles.previewButtonText
                }
              >
                Retake
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.uploadButton}
              onPress={uploadPhoto}
              activeOpacity={0.85}
            >
              <Ionicons
                name="cloud-upload"
                size={20}
                color="#fff"
              />

              <Text
                style={
                  styles.previewButtonText
                }
              >
                Upload
              </Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },

  scroll: {
    flex: 1,
  },

  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },

  headerTitle: {
    fontSize: 30,
    fontWeight: '800',
    color: COLORS.primary,
  },

  headerSub: {
    fontSize: 14,
    color: COLORS.subText,
    marginTop: 4,
  },

  countBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
  },

  countText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: '700',
  },

  launcher: {
    backgroundColor: COLORS.card,
    borderRadius: 24,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    elevation: 5,
  },

  launchIcon: {
    width: 62,
    height: 62,
    borderRadius: 18,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
  },

  launchTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.primary,
  },

  launchHint: {
    fontSize: 13,
    color: COLORS.subText,
    marginTop: 4,
  },

  permissionCard: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    gap: 14,
  },

  permissionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.primary,
  },

  permissionSub: {
    fontSize: 14,
    color: COLORS.subText,
    textAlign: 'center',
  },

  permissionButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 14,
  },

  permissionButtonText: {
    color: '#fff',
    fontWeight: '700',
  },

  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.65)',
  },

  sheet: {
    position: 'absolute',
    top: SHEET_TOP,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.dark,
    overflow: 'hidden',
  },

  cameraSection: {
    height: CAM_HEIGHT,
    overflow: 'hidden',
    marginTop:
      Platform.OS === 'android' ? 35 : 55,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
  },

  overlayRow: {
  position: 'absolute',
  top: Platform.OS === 'android' ? 18 : 24,
  left: 14,
  right: 70, // leave space for close button

  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
},

  gpsBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(0,0,0,0.65)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
    maxWidth: '62%',
  },

  gpsDot: {
    width: 7,
    height: 7,
    borderRadius: 999,
    backgroundColor: '#4CAF50',
  },

  gpsText: {
    color: '#80CBC4',
    fontSize: 10,
    fontWeight: '700',
    flexShrink: 1,
  },

  clockBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
  },

  timeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
closeButton: {
  position: 'absolute',
  top: Platform.OS === 'android' ? 18 : 24,
  right: 14,
  zIndex: 20,
},

  closeCircle: {
    width: 34,
    height: 34,
    borderRadius: 999,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.55)',
  },

  controls: {
    flex: 1,
    backgroundColor: '#121212',
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom:
      Platform.OS === 'ios' ? 36 : 24,
  },

  captureSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  shutter: {
    width: 82,
    height: 82,
    borderRadius: 41,
    backgroundColor:
      'rgba(255,255,255,0.08)',
    borderWidth: 4,
    borderColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },

  shutterDisabled: {
    opacity: 0.4,
  },

  shutterInner: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: '#fff',
  },

  captureText: {
    marginTop: 14,
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
  },

  toggleWrapper: {
    gap: 12,
  },

  toggleHeading: {
    color: '#666',
    fontSize: 11,
    fontWeight: '700',
  },

  toggleRow: {
    flexDirection: 'row',
    gap: 12,
  },

  toggleOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor:
      'rgba(255,255,255,0.05)',
    borderWidth: 1.5,
    borderColor:
      'rgba(255,255,255,0.1)',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 14,
  },

  toggleOptionSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primaryLight,
  },

  radioOuter: {
    width: 18,
    height: 18,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: '#555',
    justifyContent: 'center',
    alignItems: 'center',
  },

  radioOuterSelected: {
    borderColor: '#fff',
  },

  radioInner: {
    width: 8,
    height: 8,
    borderRadius: 999,
    backgroundColor: '#fff',
  },

  toggleLabel: {
    color: '#888',
    fontSize: 13,
    fontWeight: '600',
  },

  toggleLabelSelected: {
    color: '#fff',
    fontWeight: '700',
  },

  previewContainer: {
    flex: 1,
    backgroundColor: '#000',
  },

  previewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop:
      Platform.OS === 'android' ? 20 : 10,
    paddingBottom: 16,
  },

  previewTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '700',
  },

  previewImageWrapper: {
    flex: 1,
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },

  previewImage: {
    width: '100%',
    height: '100%',
    borderRadius: 24,
  },

  infoCard: {
    backgroundColor:
      'rgba(255,255,255,0.08)',
    marginHorizontal: 18,
    marginTop: 18,
    borderRadius: 18,
    padding: 16,
    gap: 12,
  },

  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  infoText: {
    color: '#fff',
    fontSize: 13,
    flex: 1,
  },

  previewButtonRow: {
    flexDirection: 'row',
    paddingHorizontal: 18,
    paddingVertical: 24,
    gap: 14,
  },

  retakeButton: {
    flex: 1,
    height: 58,
    borderRadius: 18,
    backgroundColor: '#EF5350',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },

  uploadButton: {
    flex: 1,
    height: 58,
    borderRadius: 18,
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },

  previewButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});