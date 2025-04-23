import { MaterialCommunityIcons } from "@expo/vector-icons";

// Helper function to format date
export function formatDate(dateString) {
  const options = { month: "short", day: "numeric", year: "numeric" };
  return new Date(dateString).toLocaleDateString(undefined, options);
}

// Helper function to get hex color based on food category
export function getCategoryColorHex(category) {
  switch (category.toLowerCase()) {
    case "dairy":
      return "#3b82f6"; // Blue
    case "meat":
      return "#ef4444"; // Red
    case "vegetables":
      return "#22c55e"; // Green
    case "fruits":
      return "#f97316"; // Orange
    default:
      return "#6b7280"; // Gray
  }
}

// Get category icon
export const getCategoryIcon = (category, size = 24, color = "#FFF") => {
  switch (category.toLowerCase()) {
    case "dairy":
      return (
        <MaterialCommunityIcons name="cup-water" size={size} color={color} />
      );
    case "meat":
      return (
        <MaterialCommunityIcons name="food-steak" size={size} color={color} />
      );
    case "vegetables":
      return (
        <MaterialCommunityIcons
          name="food-apple-outline"
          size={size}
          color={color}
        />
      );
    case "fruits":
      return (
        <MaterialCommunityIcons
          name="fruit-cherries"
          size={size}
          color={color}
        />
      );
    default:
      return <MaterialCommunityIcons name="food" size={size} color={color} />;
  }
};

// Calculate days left for each item
export const calculateDaysLeft = (expiryDate) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const expiry = new Date(expiryDate);
  expiry.setHours(0, 0, 0, 0);

  const diffTime = expiry - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays;
};
