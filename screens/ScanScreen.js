import BarcodeScanner from "../components/BarcodeScanner";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useState } from "react";
import Toast from "react-native-toast-message";
import { db } from "../db/firebase";
import {
  addDoc,
  collection,
  serverTimestamp,
  doc,
  updateDoc,
} from "firebase/firestore";
import BarcodeModal from "../components/BarcodeModal";
import { scheduleExpirationNotification } from "../lib/notifications";

export default function ScanScreen({ navigation }) {
  const [modalVisible, setModalVisible] = useState(false);
  const [expiryDate, setExpiryDate] = useState(new Date());
  const [foodName, setFoodName] = useState("");
  const [productImageUrl, setProductImageUrl] = useState("");
  const [category, setCategory] = useState("other");
  const [barcodeData, setBarcodeData] = useState("");
  const [loading, setLoading] = useState(false);
  const [scannerKey, setScannerKey] = useState(0);

  const fetchProductDetails = async (barcode) => {
    try {
      setLoading(true);
      const response = await fetch(
        `https://world.openfoodfacts.org/api/v3/product/${barcode}.json`
      );
      const data = await response.json();

      if (data) {
        // Product found
        const productData = data.product;

        // Extract product name
        const productName =
          `${productData.brands.split(",")[0].trim().split(" ")[0]} ${
            productData.product_name
          }` || "";
        console.log("Product name:", productName);

        // Extract product image URL
        const productImageUrl = productData.image_url || "";

        console.log("Product image URL:", productImageUrl);

        // Extract category
        let categoryTag = "";
        if (
          productData.categories_tags &&
          productData.categories_tags.length > 0
        ) {
          categoryTag = productData.categories_tags[0] || "";
        }

        // Map Open Food Facts category to my app categories
        let productCategory = "other";
        if (categoryTag.includes("dairy")) productCategory = "dairy";
        else if (categoryTag.includes("meat")) productCategory = "meat";
        else if (categoryTag.includes("vegetables"))
          productCategory = "vegetables";
        else if (categoryTag.includes("fruits")) productCategory = "fruits";
        else if (
          categoryTag.includes("snack") ||
          categoryTag.includes("bar") ||
          productName.toLowerCase().includes("bar")
        ) {
          productCategory = "snacks";
        }

        setFoodName(productName);
        setProductImageUrl(productImageUrl);
        setCategory(productCategory);
        setModalVisible(true);
      } else {
        // Product not found
        console.log("Product not found, status:", data.status);
        setFoodName("");
        setCategory("other");
        setModalVisible(true);
      }
    } catch (error) {
      console.error("Error fetching product details:", error);
      setFoodName("");
      setCategory("other");
      setModalVisible(true);
    } finally {
      setLoading(false);
    }
  };

  const handleBarcodeScanned = (data) => {
    setBarcodeData(data);
    fetchProductDetails(data);
  };

  const resetScanner = () => {
    setScannerKey((prevKey) => prevKey + 1);
  };

  const handleModalClose = () => {
    setModalVisible(false);
    resetScanner();
  };

  const addFoodItem = async () => {
    try {
      // Validate inputs
      if (!foodName.trim()) {
        alert("Please enter a food name");
        return;
      }

      // Calculate days left
      const today = new Date();
      const expiry = new Date(expiryDate);
      const diffTime = expiry - today;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      // Add a new document to the "foodItems" collection
      const docRef = await addDoc(collection(db, "foodItems"), {
        name: foodName,
        imageUrl: productImageUrl,
        barcode: barcodeData,
        expiryDate: expiryDate,
        daysLeft: diffDays,
        category: category,
        createdAt: serverTimestamp(),
      });

      console.log("Document written with ID: ", docRef.id);

      // Schedule expiration notification
      const newItem = {
        id: docRef.id,
        name: foodName,
        expiryDate: expiryDate,
      };

      const notificationId = await scheduleExpirationNotification(newItem);

      // If notification was scheduled, save the ID to Firestore
      if (notificationId) {
        await updateDoc(doc(db, "foodItems", docRef.id), {
          notificationId: notificationId,
        });
      }

      Toast.show({
        text1: "Food item added successfully!",
        type: "success",
      });

      // Reset form
      setFoodName("");
      setExpiryDate(new Date());
      setCategory("other");
      setBarcodeData("");
      setModalVisible(false);
      resetScanner();
    } catch (error) {
      console.error("Error adding food item: ", error);
      alert("Error adding food item: " + error.message);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#1a202c" />
        </TouchableOpacity>
        <Text style={styles.title}>Scan Barcode</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.content}>
        <View style={styles.instructionsCard}>
          <LinearGradient
            colors={["rgba(59, 130, 246, 0.8)", "rgba(37, 99, 235, 0.9)"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.gradientHeader}
          >
            <View style={styles.gradientContent}>
              <Ionicons
                name="information-circle-outline"
                size={22}
                color="white"
              />
              <Text style={styles.instructionsTitle}>How to Scan</Text>
            </View>
          </LinearGradient>
          <View style={styles.instructionsContent}>
            <Text style={styles.instructionText}>
              1. Position the barcode within the scanner frame
            </Text>
            <Text style={styles.instructionText}>
              2. Hold steady until the barcode is detected
            </Text>
            <Text style={styles.instructionText}>
              3. Add expiry date when prompted
            </Text>
          </View>
        </View>

        <BarcodeScanner
          key={scannerKey}
          onBarcodeScanned={handleBarcodeScanned}
        />

        {modalVisible && (
          <BarcodeModal
            modalVisible={modalVisible}
            setModalVisible={handleModalClose}
            addFoodItem={addFoodItem}
            foodName={foodName}
            setFoodName={setFoodName}
            productImageUrl={productImageUrl}
            expiryDate={expiryDate}
            setExpiryDate={setExpiryDate}
            category={category}
            setCategory={setCategory}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F8FA",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "ios" ? 10 : 30,
    paddingBottom: 20,
    backgroundColor: "#FFF",
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    marginTop: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 20,
    backgroundColor: "#f1f5f9",
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1a202c",
    letterSpacing: 0.5,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  instructionsCard: {
    borderRadius: 16,
    backgroundColor: "#FFF",
    overflow: "hidden",
    marginBottom: 20,
    shadowColor: "#3b82f6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  gradientHeader: {
    padding: 0,
  },
  gradientContent: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  instructionsTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "white",
    marginLeft: 8,
  },
  instructionsContent: {
    padding: 16,
  },
  instructionText: {
    fontSize: 15,
    color: "#4b5563",
    marginBottom: 10,
    lineHeight: 22,
  },
});
