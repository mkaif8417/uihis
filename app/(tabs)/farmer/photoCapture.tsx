import { CameraView, useCameraPermissions } from "expo-camera";
import * as Location from "expo-location";
import { useRef, useState } from "react";
import { Alert, Image, Pressable, ScrollView, Text, View } from "react-native";


type CapturedPhoto = {
    uri: string;
    latitude: number;
    longitude: number;
    capturedAt: string;
};

export default function FarmerPhotoCapture() {
    const cameraRef = useRef<CameraView | null>(null);

    const [permission, requestPermission] = useCameraPermissions();
    const [showCamera, setShowCamera] = useState(false);
    const [cameraReady, setCameraReady] = useState(false);
    // const [capturing, setCapturing] = useState(false);

    const [currentPhoto, setCurrentPhoto] = useState<CapturedPhoto | null>(null);
    const [uploadedPhotos, setUploadedPhotos] = useState<CapturedPhoto[]>([]);

    if (!permission?.granted) {
        return (
            <View style={{ padding: 16 }}>
                <Text>Camera permission is required</Text>
                <Pressable onPress={requestPermission}>
                    <Text style={{ color: "blue" }}>Grant Permission</Text>
                </Pressable>
            </View>
        );
    }

    const openCamera = async () => {
        // Request camera permission (SDK 50+ way)
        const camPerm = await requestPermission();

        // Request location permission
        const locPerm = await Location.requestForegroundPermissionsAsync();

        if (!camPerm.granted || !locPerm.granted) {
            Alert.alert(
                "Permissions Required",
                "Camera and location access are mandatory."
            );
            return;
        }

        setCameraReady(false);
        setShowCamera(true);
    };


    const capturePhoto = async () => {
        try {
            if (!cameraReady || !cameraRef.current) {
                Alert.alert("Camera not ready");
                return;
            }

            const location = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.High,
            });

            const photo = await cameraRef.current.takePictureAsync({
                quality: 0.6,
            });

            setCurrentPhoto({
                uri: photo.uri,
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
                capturedAt: new Date().toLocaleString("en-IN"),
            });

            setShowCamera(false);
        } catch (err) {
            console.error(err);
            Alert.alert("Error", "Failed to capture image");
        }
    };


    const uploadPhoto = () => {
        if (!currentPhoto) return;

        setUploadedPhotos((prev) => [...prev, currentPhoto]);
        setCurrentPhoto(null);
    };

    return (
        <ScrollView contentContainerStyle={{ padding: 16 }}>
            <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 12 }}>
                Field Photo Capture
            </Text>

            {/* Camera Launcher */}
            {!showCamera && !currentPhoto && (
                <Pressable
                    onPress={openCamera}
                    style={{
                        height: 160,
                        borderRadius: 8,
                        borderWidth: 2,
                        borderStyle: "dashed",
                        justifyContent: "center",
                        alignItems: "center",
                    }}
                >
                    <Text style={{ fontSize: 40 }}>📷</Text>
                    <Text>Tap to capture field photo</Text>
                </Pressable>
            )}

            {/* Camera */}
            {showCamera && (
                <>
                    <CameraView
                        ref={cameraRef}
                        style={{ height: 300 }}
                        facing="back"
                        onCameraReady={() => setCameraReady(true)}
                    />

                    <Pressable
                        onPress={capturePhoto}
                        disabled={!cameraReady}
                        style={{
                            backgroundColor: cameraReady ? "#2e7d32" : "#9e9e9e",
                            padding: 12,
                            marginTop: 10,
                            borderRadius: 6,
                        }}
                    >
                        <Text style={{ color: "#fff", textAlign: "center" }}>
                            Capture Photo
                        </Text>
                    </Pressable>
                </>
            )}


            {/* Preview */}
            {currentPhoto && (
                <View style={{ marginTop: 16 }}>
                    <Image source={{ uri: currentPhoto.uri }} style={{ height: 200, borderRadius: 8 }} />

                    <Text>Latitude : {currentPhoto.latitude}</Text>
                    <Text>Longitude: {currentPhoto.longitude}</Text>

                    <View style={{ flexDirection: "row", gap: 10, marginTop: 10 }}>
                        <Pressable
                            onPress={uploadPhoto}
                            style={{
                                backgroundColor: "#2e7d32",
                                padding: 10,
                                borderRadius: 6,
                                flex: 1,
                            }}
                        >
                            <Text style={{ color: "#fff", textAlign: "center" }}>
                                Upload Photo
                            </Text>
                        </Pressable>

                        <Pressable
                            onPress={() => {
                                setCurrentPhoto(null);
                                openCamera();
                            }}
                            style={{
                                backgroundColor: "#e0e0e0",
                                padding: 10,
                                borderRadius: 6,
                                flex: 1,
                            }}
                        >
                            <Text style={{ textAlign: "center" }}>Take Another</Text>
                        </Pressable>
                    </View>
                </View>
            )}

            {/* Uploaded Photos */}
            {uploadedPhotos.length > 0 && (
                <View style={{ marginTop: 20 }}>
                    <Text style={{ fontWeight: "bold", marginBottom: 6 }}>
                        Uploaded Photos
                    </Text>

                    {uploadedPhotos.map((item, index) => (
                        <View key={index} style={{ marginBottom: 10 }}>
                            <Image source={{ uri: item.uri }} style={{ height: 120, borderRadius: 6 }} />
                            <Text style={{ fontSize: 12 }}>
                                {item.latitude}, {item.longitude}
                            </Text>
                            <Text style={{ fontSize: 12 }}>{item.capturedAt}</Text>
                        </View>
                    ))}
                </View>
            )}
        </ScrollView>
    );
}
