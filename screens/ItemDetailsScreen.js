import { useState, useEffect } from "react";
import { getDoc, doc } from "firebase/firestore";
import { db } from "../db/firebase";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function ItemDetailsScreen({ route, navigation }) {
  const { itemId } = route.params;
  const [productDetails, setProductDetails] = useState({
    name: "",
    image: "",
    nutrition: {},
  });

  if (itemId === null) {
    return <Text>Item not found</Text>;
  }

  // Fetch item from Firebase and then fetch product details from OpenFoodFacts
  useEffect(() => {
    const fetchItem = async () => {
      try {
        const fetchedItem = await getDoc(doc(db, "foodItems", itemId));
        const itemData = fetchedItem.data();

        const barcode = itemData.barcode;

        const response = await fetch(
          `https://world.openfoodfacts.org/api/v3/product/${barcode}.json`,
          {
            headers: {
              "Accept-Language": "en",
            },
          }
        );
        const data = await response.json();

        // Extract nutrition data
        const nutrition = {
          calories: data.product.nutriments?.energy_value || "N/A",
          fat: data.product.nutriments?.fat_value || "N/A",
          carbs: data.product.nutriments?.carbohydrates_value || "N/A",
          protein: data.product.nutriments?.proteins_value || "N/A",
          fiber: data.product.nutriments?.fiber_value || "N/A",
        };

        // Create the new product details object
        const newProductDetails = {
          name: `${
            data.product.brands?.split(",")[0]?.trim()?.split(" ")[0] || ""
          } ${data.product.product_name || ""}`.trim(),
          image: data.product.image_url || itemData.imageUrl,
          nutrition: nutrition,
          expiryDate: itemData.expiryDate,
          category: itemData.category,
          barcode: itemData.barcode,
          daysLeft: itemData.daysLeft,
        };

        // Log the object you're about to set
        console.log("New product details:", newProductDetails);

        // Then set the state
        setProductDetails(newProductDetails);
      } catch (error) {
        console.error("Error fetching item:", error);
      }
    };
    fetchItem();
  }, [itemId]);

  const formatDate = (date) => {
    if (!date) return "Unknown";
    const timestamp = date.seconds * 1000;
    return new Date(timestamp).toLocaleDateString();
  };

  const getDaysLeftColor = () => {
    if (productDetails.daysLeft <= 0) return styles.expiredDays;
    if (productDetails.daysLeft <= 1) return styles.redDays;
    if (productDetails.daysLeft <= 3) return styles.orangeDays;
    return styles.greenDays;
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
        <Text style={styles.headerTitle}>Product Details</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.imageContainer}>
          {productDetails.image ? (
            <Image
              source={{ uri: productDetails.image }}
              style={styles.productImage}
              resizeMode="contain"
            />
          ) : (
            <View style={styles.noImageContainer}>
              <Ionicons name="image-outline" size={50} color="#94a3b8" />
              <Text style={styles.noImageText}>No image available</Text>
            </View>
          )}
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.productName}>{productDetails.name}</Text>

          <View style={styles.expiryContainer}>
            <View style={styles.expiryBadge}>
              <Ionicons name="time-outline" size={16} color="#4b5563" />
              <Text style={styles.expiryText}>
                Expires: {formatDate(productDetails.expiryDate)}
              </Text>
            </View>

            <View style={[styles.daysLeftBadge, getDaysLeftColor()]}>
              <Text style={styles.daysLeftText}>
                {productDetails.daysLeft <= 0
                  ? "Expired"
                  : `${productDetails.daysLeft} ${
                      productDetails.daysLeft === 1 ? "day" : "days"
                    } left`}
              </Text>
            </View>
          </View>

          <View style={styles.categoryBadge}>
            <Ionicons name="pricetag-outline" size={16} color="#4b5563" />
            <Text style={styles.categoryText}>
              {productDetails.category?.charAt(0).toUpperCase() +
                productDetails.category?.slice(1) || "Uncategorized"}
            </Text>
          </View>

          <View style={styles.barcodeBadge}>
            <Ionicons name="barcode-outline" size={16} color="#4b5563" />
            <Text style={styles.barcodeText}>{productDetails.barcode}</Text>
          </View>
        </View>

        <View style={styles.nutritionCard}>
          <View style={styles.sectionHeader}>
            <Ionicons name="nutrition-outline" size={22} color="#3b82f6" />
            <Text style={styles.sectionTitle}>Nutrition Facts</Text>
          </View>

          <View style={styles.nutritionGrid}>
            <View style={styles.nutritionItem}>
              <Text style={styles.nutritionLabel}>Calories</Text>
              <Text style={styles.nutritionValue}>
                {productDetails.nutrition.calories}
              </Text>
            </View>

            <View style={styles.nutritionItem}>
              <Text style={styles.nutritionLabel}>Protein</Text>
              <Text style={styles.nutritionValue}>
                {productDetails.nutrition.protein}g
              </Text>
            </View>

            <View style={styles.nutritionItem}>
              <Text style={styles.nutritionLabel}>Carbs</Text>
              <Text style={styles.nutritionValue}>
                {productDetails.nutrition.carbs}g
              </Text>
            </View>

            <View style={styles.nutritionItem}>
              <Text style={styles.nutritionLabel}>Fat</Text>
              <Text style={styles.nutritionValue}>
                {productDetails.nutrition.fat}g
              </Text>
            </View>

            <View style={styles.nutritionItem}>
              <Text style={styles.nutritionLabel}>Fiber</Text>
              <Text style={styles.nutritionValue}>
                {productDetails.nutrition.fiber}g
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
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
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1a202c",
    letterSpacing: 0.5,
  },
  scrollView: {
    flex: 1,
    padding: 20,
  },
  imageContainer: {
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 20,
    backgroundColor: "#FFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    height: 250,
    justifyContent: "center",
    alignItems: "center",
  },
  productImage: {
    width: "90%",
    height: "90%",
  },
  noImageContainer: {
    alignItems: "center",
    justifyContent: "center",
    height: 200,
    backgroundColor: "#f1f5f9",
  },
  noImageText: {
    color: "#64748b",
    fontSize: 16,
    marginTop: 8,
  },
  infoCard: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  productName: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1a202c",
    marginBottom: 16,
  },
  expiryContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  expiryBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f1f5f9",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  expiryText: {
    marginLeft: 8,
    fontSize: 14,
    color: "#4b5563",
    fontWeight: "500",
  },
  daysLeftBadge: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "#f1f5f9",
  },
  daysLeftText: {
    fontSize: 14,
    fontWeight: "600",
  },
  greenDays: {
    backgroundColor: "#dcfce7",
  },
  orangeDays: {
    backgroundColor: "#ffedd5",
  },
  redDays: {
    backgroundColor: "#fee2e2",
  },
  expiredDays: {
    backgroundColor: "#fecaca",
  },
  categoryBadge: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  categoryText: {
    marginLeft: 8,
    fontSize: 16,
    color: "#4b5563",
    fontWeight: "500",
  },
  barcodeBadge: {
    flexDirection: "row",
    alignItems: "center",
  },
  barcodeText: {
    marginLeft: 8,
    fontSize: 16,
    color: "#4b5563",
    fontWeight: "500",
  },
  nutritionCard: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1a202c",
    marginLeft: 8,
  },
  nutritionGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  nutritionItem: {
    width: "48%",
    backgroundColor: "#f1f5f9",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  nutritionLabel: {
    fontSize: 14,
    color: "#64748b",
    marginBottom: 8,
  },
  nutritionValue: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1a202c",
  },
});
