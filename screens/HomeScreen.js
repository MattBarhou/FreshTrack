import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  Image,
} from "react-native";
import { useEffect, useState } from "react";
import { Ionicons, AntDesign } from "@expo/vector-icons";
import {
  getCategoryIcon,
  calculateDaysLeft,
  formatDate,
  getCategoryColorHex,
} from "../lib/helpers";
import { useIsFocused } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { db } from "../db/firebase";
import { getDocs, collection, Timestamp } from "firebase/firestore";

export default function HomeScreen({ navigation }) {
  const [foodItems, setFoodItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const isFocused = useIsFocused();

  // Fetch food items from Firebase
  useEffect(() => {
    const fetchFoodItems = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "foodItems"));

        const items = [];
        querySnapshot.forEach((doc) => {
          const itemData = doc.data();

          // Ensure expiryDate is properly handled as Firestore Timestamp
          let daysLeft = 0;
          let validDate = true;
          let formattedDate = null;

          try {
            // Check if expiryDate is a Firestore Timestamp
            if (
              itemData.expiryDate &&
              typeof itemData.expiryDate.toDate === "function"
            ) {
              // Convert Firestore Timestamp to JavaScript Date
              const expiryDate = itemData.expiryDate.toDate();
              formattedDate = expiryDate;

              // Calculate days left
              const today = new Date();
              today.setHours(0, 0, 0, 0);

              expiryDate.setHours(0, 0, 0, 0);

              const diffTime = expiryDate - today;
              daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            } else if (itemData.expiryDate) {
              // If it's a string or other format, try to convert it
              console.log(
                `Non-timestamp format for item ${doc.id}:`,
                itemData.expiryDate
              );
              formattedDate = new Date(itemData.expiryDate);

              if (!isNaN(formattedDate.getTime())) {
                // Valid date string
                daysLeft = calculateDaysLeft(formattedDate);
              } else {
                console.warn(
                  `Invalid date format for item ${doc.id}:`,
                  itemData.expiryDate
                );
                validDate = false;
              }
            } else {
              console.warn(`Missing expiryDate for item ${doc.id}`);
              validDate = false;
            }
          } catch (error) {
            console.error(`Error processing date for item ${doc.id}:`, error);
            validDate = false;
          }

          items.push({
            id: doc.id,
            ...itemData,
            daysLeft: daysLeft,
            validDate: validDate,
            formattedDate: formattedDate,
          });
        });

        setFoodItems(items);
      } catch (error) {
        console.error("Error fetching food items:", error);
      } finally {
        setLoading(false);
      }
    };

    if (isFocused) {
      fetchFoodItems();
    }
  }, [isFocused]);

  // Get expiring soon items (3 days or less)
  const expiringSoon = foodItems.filter(
    (item) => item.validDate && item.daysLeft <= 3 && item.daysLeft >= 0
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.title}>Fresh Track</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => navigation.navigate("Scan")}
          >
            <Ionicons name="add" size={26} color="white" />
          </TouchableOpacity>
        </View>
        <Text style={styles.subtitle}>Keep track of your food freshness</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <Text>Loading food items...</Text>
          </View>
        ) : (
          <>
            {expiringSoon.length > 0 && (
              <View style={styles.expiringSoonCard}>
                <LinearGradient
                  colors={[
                    "rgba(255, 164, 84, 0.8)",
                    "rgba(255, 118, 56, 0.9)",
                  ]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.expiringSoonHeader}
                >
                  <View style={styles.expiringSoonHeaderContent}>
                    <Ionicons name="warning-outline" size={22} color="white" />
                    <Text style={styles.expiringSoonTitle}>Expiring Soon</Text>
                  </View>
                </LinearGradient>
                <View style={styles.expiringSoonContent}>
                  {expiringSoon.map((item) => (
                    <View key={item.id} style={styles.expiringSoonItem}>
                      <View style={styles.expiringSoonItemLeft}>
                        {item.imageUrl ? (
                          <Image
                            source={{ uri: item.imageUrl }}
                            style={styles.miniImage}
                          />
                        ) : (
                          <View
                            style={[
                              styles.miniAvatar,
                              {
                                backgroundColor: getCategoryColorHex(
                                  item.category
                                ),
                              },
                            ]}
                          >
                            {getCategoryIcon(item.category, 16)}
                          </View>
                        )}
                        <View style={styles.expiringSoonItemDetails}>
                          <Text
                            style={styles.expiringSoonItemName}
                            numberOfLines={1}
                            ellipsizeMode="tail"
                          >
                            {item.name}
                          </Text>
                          <View style={styles.daysContainer}>
                            <Ionicons
                              name="time-outline"
                              size={14}
                              color={item.daysLeft <= 1 ? "#f43f5e" : "#fb923c"}
                            />
                            <Text
                              style={[
                                styles.daysText,
                                item.daysLeft <= 1
                                  ? styles.redDays
                                  : styles.orangeDays,
                              ]}
                            >
                              {item.daysLeft}{" "}
                              {item.daysLeft === 1 ? "day" : "days"}
                            </Text>
                          </View>
                        </View>
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            )}

            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>All Items</Text>
                <Text style={styles.itemCount}>{foodItems.length} items</Text>
              </View>

              <View style={styles.allItemsCard}>
                <ScrollView
                  showsVerticalScrollIndicator={false}
                  nestedScrollEnabled={true}
                  contentContainerStyle={styles.allItemsScrollContent}
                >
                  {foodItems.map((item, index) => (
                    <View key={item.id} style={styles.itemRow}>
                      <View style={styles.itemInfo}>
                        {item.imageUrl ? (
                          <Image
                            source={{ uri: item.imageUrl }}
                            style={styles.itemImage}
                          />
                        ) : (
                          <View
                            style={[
                              styles.avatar,
                              {
                                backgroundColor: getCategoryColorHex(
                                  item.category
                                ),
                              },
                            ]}
                          >
                            {getCategoryIcon(item.category)}
                          </View>
                        )}
                        <View style={styles.itemDetails}>
                          <Text style={styles.itemName}>{item.name}</Text>
                          <Text style={styles.itemExpiry}>
                            {item.validDate
                              ? `Expires: ${
                                  item.formattedDate
                                    ? formatDate(item.formattedDate)
                                    : "Unknown"
                                }`
                              : "No expiry date available"}
                          </Text>
                        </View>
                      </View>
                      <View style={styles.itemActions}>
                        <View style={styles.daysRightContainer}>
                          <Text
                            style={[
                              styles.daysRightText,
                              !item.validDate
                                ? styles.unknownDays
                                : item.daysLeft <= 0
                                ? styles.expiredDays
                                : item.daysLeft <= 1
                                ? styles.redDays
                                : item.daysLeft <= 3
                                ? styles.orangeDays
                                : styles.greenDays,
                            ]}
                          >
                            {!item.validDate
                              ? "Unknown"
                              : item.daysLeft <= 0
                              ? "Expired"
                              : `${item.daysLeft} ${
                                  item.daysLeft === 1 ? "day" : "days"
                                }`}
                          </Text>
                        </View>
                        <TouchableOpacity
                          style={styles.viewDetailsButton}
                          onPress={() =>
                            navigation.navigate("ItemDetails", {
                              itemId: item.id,
                            })
                          }
                        >
                          <Text style={styles.viewDetailsText}>
                            View Details
                          </Text>
                        </TouchableOpacity>
                      </View>
                      {index < foodItems.length - 1 && (
                        <View style={styles.divider} />
                      )}
                    </View>
                  ))}
                </ScrollView>
              </View>
            </View>

            <View style={styles.quickAdd}>
              <TouchableOpacity
                style={styles.quickAddButton}
                onPress={() => navigation.navigate("Scan")}
              >
                <AntDesign name="scan1" size={20} color="white" />
                <Text style={styles.quickAddText}>Scan New Item</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
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
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "ios" ? 10 : 40,
    paddingBottom: 20,
    backgroundColor: "#FFF",
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    marginTop: 15,
    elevation: 3,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 5,
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    color: "#1a202c",
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 14,
    color: "#718096",
    marginTop: 2,
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#3b82f6",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#3b82f6",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  expiringSoonCard: {
    borderRadius: 16,
    backgroundColor: "#FFF",
    overflow: "hidden",
    marginBottom: 20,
    shadowColor: "#fb923c",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  expiringSoonHeader: {
    padding: 0,
  },
  expiringSoonHeaderContent: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  expiringSoonTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "white",
    marginLeft: 8,
  },
  expiringSoonContent: {
    padding: 16,
  },
  expiringSoonItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  expiringSoonItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  miniAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  miniImage: {
    width: 28,
    height: 28,
    borderRadius: 14,
    marginRight: 12,
  },
  expiringSoonItemDetails: {
    flex: 1,
    justifyContent: "center",
  },
  expiringSoonItemName: {
    fontSize: 13,
    fontWeight: "600",
    color: "#1a202c",
    marginBottom: 4,
    flexShrink: 1,
  },
  daysContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEF2F2",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: "flex-start",
  },
  daysText: {
    fontSize: 12,
    fontWeight: "600",
    marginLeft: 4,
  },
  redDays: {
    color: "#f43f5e",
  },
  orangeDays: {
    color: "#fb923c",
  },
  greenDays: {
    color: "#22c55e",
  },
  expiredDays: {
    color: "#dc2626",
    fontWeight: "700",
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1a202c",
  },
  itemCount: {
    fontSize: 14,
    color: "#718096",
    fontWeight: "500",
  },
  allItemsCard: {
    borderRadius: 16,
    backgroundColor: "#FFF",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  allItemsScrollContent: {
    paddingBottom: 8,
  },
  itemRow: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  itemInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  itemImage: {
    width: 42,
    height: 42,
    borderRadius: 8,
    marginRight: 16,
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: 12,
    fontWeight: "600",
    color: "#1a202c",
    marginBottom: 2,
  },
  itemExpiry: {
    fontSize: 13,
    color: "#718096",
  },
  itemActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  daysRightContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    marginRight: 12,
  },
  daysRightText: {
    fontSize: 14,
    fontWeight: "600",
  },
  viewDetailsButton: {
    backgroundColor: "#3b82f6",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    shadowColor: "#3b82f6",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  viewDetailsText: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
  },
  divider: {
    height: 1,
    backgroundColor: "#f1f5f9",
    marginTop: 12,
  },
  quickAdd: {
    marginBottom: 30,
  },
  quickAddButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#3b82f6",
    paddingVertical: 14,
    borderRadius: 12,
    shadowColor: "#3b82f6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  quickAddText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  unknownDays: {
    color: "#94a3b8",
    fontStyle: "italic",
  },
});
