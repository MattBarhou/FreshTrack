import { useState, useEffect } from "react";
import { CameraView, useCameraPermissions } from "expo-camera";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

export default function BarcodeScanner({ onBarcodeScanned }) {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [hasPermission, setHasPermission] = useState(null);
  const [scanning, setScanning] = useState(true);

  // request camera permission when component mounts
  useEffect(() => {
    (async () => {
      const { status } = await requestPermission();
      if (status === "granted") {
        setHasPermission(true);
      } else {
        setHasPermission(false);
      }
    })();
  }, []);

  // function runs when barcode is scanned
  const handleBarCodeScanned = ({ data }) => {
    try {
      setScanned(true);
      setScanning(false);
      if (onBarcodeScanned) {
        onBarcodeScanned(data);
      }
    } catch (error) {
      console.error("Error handling barcode scan:", error);
    }
  };

  // reset scanner to scan another barcode
  const handleScanAgain = () => {
    setScanned(false);
    setScanning(true);
  };

  // if permission is not granted, show loading indicator
  if (hasPermission === null) {
    return (
      <View style={styles.centerContent}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.permissionText}>
          Requesting camera permission...
        </Text>
      </View>
    );
  }

  // if permission is not granted, show error message
  if (hasPermission === false) {
    return (
      <View style={styles.centerContent}>
        <MaterialCommunityIcons name="camera-off" size={50} color="#94a3b8" />
        <Text style={styles.errorText}>
          Camera access is needed to scan barcodes
        </Text>
        <TouchableOpacity
          style={styles.permissionButton}
          onPress={requestPermission}
        >
          <Text style={styles.permissionButtonText}>Request Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // if permission is granted, show camera view
  return (
    <View style={styles.container}>
      <View style={styles.cameraContainer}>
        <CameraView
          style={styles.camera}
          onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
          barcodeScannerSettings={{
            barcodeTypes: ["ean13", "ean8", "upc_a", "upc_e"],
          }}
        >
          <View style={styles.scannerOverlay}>
            <View style={styles.scannerFrame}>
              {scanning && <View style={styles.scanLine} />}
            </View>
          </View>
        </CameraView>
      </View>

      {scanned && (
        <View style={styles.scannedContainer}>
          <View style={styles.successIcon}>
            <Ionicons name="checkmark-circle" size={60} color="#22c55e" />
          </View>
          <Text style={styles.successText}>Barcode Scanned Successfully!</Text>
          <TouchableOpacity
            style={styles.scanAgainButton}
            onPress={handleScanAgain}
          >
            <Ionicons name="scan-outline" size={20} color="white" />
            <Text style={styles.scanAgainText}>Scan Again</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  permissionText: {
    fontSize: 16,
    color: "#4b5563",
    marginTop: 20,
    textAlign: "center",
  },
  errorText: {
    fontSize: 16,
    color: "#4b5563",
    marginTop: 20,
    marginBottom: 20,
    textAlign: "center",
  },
  permissionButton: {
    backgroundColor: "#3b82f6",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  permissionButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  cameraContainer: {
    flex: 1,
    overflow: "hidden",
    borderRadius: 16,
  },
  camera: {
    flex: 1,
  },
  scannerOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  scannerFrame: {
    width: 250,
    height: 250,
    borderWidth: 2,
    borderColor: "white",
    backgroundColor: "transparent",
    position: "relative",
    overflow: "hidden",
  },
  scanLine: {
    height: 2,
    width: "100%",
    backgroundColor: "#22c55e",
    position: "absolute",
    top: 0,
    shadowColor: "#22c55e",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 4,
    transform: [{ translateY: 125 }],
  },
  scannedContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    borderRadius: 16,
  },
  successIcon: {
    marginBottom: 20,
  },
  successText: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1a202c",
    marginBottom: 30,
    textAlign: "center",
  },
  scanAgainButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#3b82f6",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    shadowColor: "#3b82f6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  scanAgainText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
});
