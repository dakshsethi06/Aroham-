/**
 * Validates the raw order data before sending it to the Shiprocket API.
 * Throws an error if any required fields are missing or invalid.
 */
function validateOrderData(orderData) {
  if (!orderData) throw new Error("Order data is required");

  const requiredFields = [
    'order_id', 
    'address', 
    'city', 
    'pincode', 
    'state', 
    'phone', 
    'sub_total', 
    'items'
  ];

  for (const field of requiredFields) {
    if (orderData[field] === undefined || orderData[field] === null || orderData[field] === '') {
      throw new Error(`Missing required field: '${field}' in order data`);
    }
  }

  if (!Array.isArray(orderData.items) || orderData.items.length === 0) {
    throw new Error("Order 'items' must be a non-empty array");
  }

  for (const [index, item] of orderData.items.entries()) {
    if (!item.name || !item.sku || !item.units || !item.selling_price) {
      throw new Error(`Item at index ${index} is missing required fields (name, sku, units, selling_price)`);
    }
  }

  // Validate pincode is typically numeric (basic check)
  if (!/^\d+$/.test(orderData.pincode)) {
    throw new Error(`Invalid pincode format: '${orderData.pincode}'. Must be numeric.`);
  }

  // Basic phone length check for India (10 digits minimum)
  const phoneDigits = orderData.phone.replace(/\D/g, '');
  if (phoneDigits.length < 10) {
    throw new Error(`Invalid phone number: '${orderData.phone}'. Must contain at least 10 digits.`);
  }

  return true;
}

module.exports = {
  validateOrderData
};
