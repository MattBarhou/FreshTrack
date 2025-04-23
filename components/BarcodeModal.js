import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { StyleSheet } from "react-native";
import { useEffect } from "react";

export default function BarcodeModal({
  modalVisible,
  setModalVisible,
  addFoodItem,
  foodName,
  setFoodName,
  expiryDate,
  setExpiryDate,
  category,
  setCategory,
  productImageUrl,
}) {
  console.log("BarcodeModal rendering with:", {
    modalVisible,
    foodName,
    category,
    hasProductImage: !!productImageUrl,
    productImageUrl: productImageUrl?.slice(0, 50), // Show just first 50 chars
  });

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={modalVisible}
      onRequestClose={() => {
        setModalVisible(!modalVisible);
      }}
      onShow={() => {
        console.log("Modal shown with:", {
          foodName,
          category,
          productImageUrl: productImageUrl?.slice(0, 50),
        });
      }}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Add Food Item</Text>

          {productImageUrl ? (
            <View style={styles.imageContainer}>
              <Image
                source={{ uri: productImageUrl }}
                style={styles.productImage}
                resizeMode="contain"
                onError={(e) =>
                  console.log("Image loading error:", e.nativeEvent.error)
                }
              />
            </View>
          ) : (
            <View style={styles.noImageContainer}>
              <Text style={styles.noImageText}>No image available</Text>
            </View>
          )}

          <Text style={styles.inputLabel}>Food Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter food name"
            value={foodName}
            onChangeText={setFoodName}
          />

          <Text style={styles.inputLabel}>Expiry Date</Text>
          <DateTimePicker
            value={expiryDate || new Date()}
            mode="date"
            display="default"
            onChange={(event, selectedDate) => {
              const currentDate = selectedDate || expiryDate;
              setExpiryDate(currentDate);
            }}
          />

          <Text style={styles.inputLabel}>Category</Text>
          <View style={styles.categoryContainer}>
            {["dairy", "meat", "vegetables", "fruits", "snacks", "other"].map(
              (cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.categoryButton,
                    category === cat && styles.categoryButtonSelected,
                  ]}
                  onPress={() => setCategory(cat)}
                >
                  <Text
                    style={[
                      styles.categoryButtonText,
                      category === cat && styles.categoryButtonTextSelected,
                    ]}
                  >
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </Text>
                </TouchableOpacity>
              )
            )}
          </View>

          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton]}
              onPress={() => {
                setModalVisible(!modalVisible);
              }}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.modalButton, styles.addButton]}
              onPress={addFoodItem}
            >
              <Text style={styles.addButtonText}>Add Item</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: "90%",
    backgroundColor: "white",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1a202c",
    marginBottom: 20,
    textAlign: "center",
  },
  imageContainer: {
    alignItems: "center",
    marginBottom: 15,
    borderRadius: 8,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  productImage: {
    width: "100%",
    height: 150,
    borderRadius: 8,
  },
  inputLabel: {
    fontSize: 14,
    marginTop: 10,
    padding: 10,
    fontWeight: "600",
    color: "#4b5563",
    marginBottom: 6,
  },
  input: {
    backgroundColor: "#f1f5f9",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  categoryContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 20,
    gap: 8,
  },
  categoryButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: "#f1f5f9",
    marginRight: 8,
    marginBottom: 8,
  },
  categoryButtonSelected: {
    backgroundColor: "#3b82f6",
  },
  categoryButtonText: {
    color: "#4b5563",
    fontSize: 14,
    fontWeight: "500",
  },
  categoryButtonTextSelected: {
    color: "white",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#f1f5f9",
    marginRight: 8,
  },
  addButton: {
    backgroundColor: "#22c55e",
    marginLeft: 8,
  },
  cancelButtonText: {
    color: "#4b5563",
    fontSize: 16,
    fontWeight: "600",
  },
  addButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  noImageContainer: {
    alignItems: "center",
    justifyContent: "center",
    height: 120,
    backgroundColor: "#f1f5f9",
    borderRadius: 8,
    marginBottom: 15,
  },
  noImageText: {
    color: "#64748b",
    fontSize: 14,
  },
});
