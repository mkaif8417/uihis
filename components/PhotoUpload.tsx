import { View, Text, Image, Pressable, Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import { useEffect, useState } from "react";
import { StyleSheet } from "react-native";
import React, { forwardRef, useImperativeHandle } from "react";

const MAX_SIZE = 500 * 1024; // 500 KB

const PhotoUpload = forwardRef(function PhotoUpload({
    value,
    onChange,
    onNext,
    onBack,
}: {
    value?: any;
    onChange: (data: any, isValid: boolean) => void;
    onNext: () => void;
    onBack: () => void;
}, ref) {
    const [photo, setPhoto] = useState<any>(value || null);
    /* ---------------- PICK IMAGE ---------------- */
    const pickImage = async () => {
        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permission.granted) {
            Alert.alert("Permission required", "Please allow gallery access.");
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 1,
        });

        if (result.canceled) return;

        const asset = result.assets[0];

        if (
            !asset.mimeType?.includes("jpeg") &&
            !asset.mimeType?.includes("png")
        ) {
            Alert.alert("Invalid file", "Only JPG and PNG images are allowed.");
            return;
        }

        const info = await FileSystem.getInfoAsync(asset.uri);

        if (info.exists && info.size && info.size > MAX_SIZE) {
            Alert.alert("File too large", "Image size should not exceed 500 KB.");
            return;
        }

        setPhoto(asset);
    };
    useImperativeHandle(ref, () => ({
        commit() {
            onChange(photo, true);
        },
    }));

    return (
        <View style={styles.card}>
            <Text style={styles.stepTitle}>Upload Photo</Text>

            {/* Preview */}
            <View style={styles.photoContainer}>
                {photo ? (
                    <Image source={{ uri: photo.uri }} style={styles.photo} />
                ) : (
                    <View style={styles.noPhoto}>
                        <Text style={styles.icon}>🖼</Text>
                        <Text>No Image</Text>
                    </View>
                )}
            </View>

            {/* Upload controls */}
            <Pressable style={styles.uploadBtn} onPress={pickImage}>
                <Text style={styles.uploadText}>Upload Photo</Text>
            </Pressable>

            <Text style={styles.note}>
                Note: Only JPG and PNG Photo Files are allowed. File/Photo Size Should
                Not Exceed 500KB
            </Text>

            {/* Actions */}
            <View style={styles.actions}>
                <Pressable style={styles.backBtn} onPress={onBack}>
                    <Text>Back</Text>
                </Pressable>

                <Pressable style={styles.nextBtn} onPress={onNext}>
                    <Text style={{ color: "#fff" }}>Next</Text>
                </Pressable>
            </View>
        </View>
    );
})
export default PhotoUpload

const styles = StyleSheet.create({
    card: {
        backgroundColor: "#fff",
        padding: 14,
        borderRadius: 8,
        elevation: 2,
    },
    stepTitle: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#1b5e20",
        marginBottom: 12,
    },
    photoContainer: {
        height: 180,
        borderWidth: 1,
        borderColor: "#cfd8dc",
        borderRadius: 6,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 12,
        backgroundColor: "#f9f9f9",
    },
    photo: {
        width: "100%",
        height: "100%",
        borderRadius: 6,
    },
    noPhoto: {
        alignItems: "center",
    },
    icon: {
        fontSize: 32,
        marginBottom: 6,
    },
    uploadBtn: {
        backgroundColor: "#2e7d32",
        padding: 10,
        borderRadius: 6,
        alignItems: "center",
    },
    uploadText: {
        color: "#fff",
        fontWeight: "bold",
    },
    note: {
        fontSize: 12,
        color: "#555",
        marginTop: 8,
    },
    actions: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 16,
    },
    backBtn: {
        padding: 10,
        backgroundColor: "#e0e0e0",
        borderRadius: 6,
        width: "45%",
        alignItems: "center",
    },
    nextBtn: {
        padding: 10,
        backgroundColor: "#2e7d32",
        borderRadius: 6,
        width: "45%",
        alignItems: "center",
    },
});
