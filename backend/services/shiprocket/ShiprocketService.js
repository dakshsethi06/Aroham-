const ApiClient = require('./lib/api-client');
const { validateOrderData } = require('./lib/validator');

/**
 * Shiprocket Fulfillment Automation Sequence
 * Based on API Workflow & Integration Specification Document
 */
class ShiprocketService {
  /**
   * Initialize the Shiprocket service with API credentials
   * @param {string} email 
   * @param {string} password 
   */
  constructor(email, password) {
    this.api = new ApiClient(email, password);
  }

  /**
   * Pre-fetches token manually if needed, though ApiClient handles this automatically.
   */
  async initialize() {
    await this.api.login();
  }

  /**
   * Step 2: Custom Ad-Hoc Order Creation
   * 
   * @param {Object} orderData Raw order data to be processed and formatted
   * @returns {number} shipment_id
   */
  async createAdhocOrder(orderData) {
    // 1. Strict Input Validation (Throws error if fails)
    validateOrderData(orderData);

    // 2. Dynamic Validation Extraction: Split name inputs
    const fullName = (orderData.customer_name || '').trim();
    const nameParts = fullName.split(' ');
    const firstName = nameParts[0] || 'Customer';
    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : 'Name'; // Prevent null rejection

    // 3. Static Reference Fallback for pickup_location
    const pickupLocation = orderData.pickup_location || 'warehouse';

    // 4. Payload mapping based on schema requirements
    const payload = {
      order_id: orderData.order_id,
      order_date: orderData.order_date || new Date().toISOString().split('T')[0],
      pickup_location: pickupLocation,
      
      billing_customer_name: firstName,
      billing_last_name: lastName,
      billing_address: orderData.address,
      billing_city: orderData.city,
      billing_pincode: orderData.pincode,
      billing_state: orderData.state,
      billing_country: orderData.country || "India",
      billing_email: orderData.email,
      billing_phone: orderData.phone,
      
      // Shipping-to-Billing Mirroring
      shipping_is_billing: 1,
      
      order_items: orderData.items, 
      
      payment_method: orderData.payment_method || "Prepaid",
      sub_total: orderData.sub_total,
      
      // Data Integrity Constraints: ensure structural constraints (float/int)
      length: parseFloat(orderData.length) || 10,
      breadth: parseFloat(orderData.breadth) || 10,
      height: parseFloat(orderData.height) || 10,
      weight: parseFloat(orderData.weight) || 0.5
    };

    const data = await this.api.request('/orders/create/adhoc', 'POST', payload);
    return data.shipment_id; 
  }

  /**
   * Step 3: Dynamic Courier Allocation & Air Waybill (AWB) Binding
   * 
   * @param {number} shipmentId 
   * @returns {Object} AWB response data
   */
  async assignCourierAndAWB(shipmentId) {
    if (!shipmentId) throw new Error("shipmentId is required to assign a courier");

    const data = await this.api.request('/courier/assign/awb', 'POST', {
      shipment_id: shipmentId
    });

    return data;
  }

  /**
   * Step 4: Printable Shipping Label Asset Generation
   * 
   * @param {number} shipmentId 
   * @returns {string} label_url for the downloadable packing label
   */
  async generateLabel(shipmentId) {
    if (!shipmentId) throw new Error("shipmentId is required to generate a label");

    const data = await this.api.request('/courier/generate/label', 'POST', {
      shipment_id: [shipmentId]
    });

    return data.label_url;
  }

  /**
   * Complete Fulfillment Sequence: Executes steps 2 through 4 sequentially.
   * 
   * @param {Object} orderData 
   * @returns {Object} { success, shipmentId, awbData, labelUrl, error }
   */
  async processFulfillment(orderData) {
    try {
      console.log(`[ShiprocketService] Creating order for ${orderData?.order_id}...`);
      const shipmentId = await this.createAdhocOrder(orderData);
      console.log(`[ShiprocketService] Order created. Shipment ID: ${shipmentId}`);
      
      console.log(`[ShiprocketService] Assigning courier & AWB...`);
      const awbData = await this.assignCourierAndAWB(shipmentId);
      console.log(`[ShiprocketService] AWB Assigned successfully.`);
      
      console.log(`[ShiprocketService] Generating shipping label...`);
      const labelUrl = await this.generateLabel(shipmentId);
      console.log(`[ShiprocketService] Label generated: ${labelUrl}`);
      
      return {
        success: true,
        shipmentId,
        awbData,
        labelUrl
      };
    } catch (error) {
      console.error(`[ShiprocketService] Fulfillment sequence failed: ${error.message}`);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Cancel a Shiprocket order by its order ID(s)
   * @param {string[]} orderIds - Array of Shiprocket order IDs to cancel
   * @returns {Object} cancellation response
   */
  async cancelOrder(orderIds) {
    if (!orderIds || !orderIds.length) throw new Error("orderIds required to cancel");
    const data = await this.api.request('/orders/cancel', 'POST', { ids: orderIds });
    console.log(`[ShiprocketService] Order(s) cancelled: ${orderIds.join(', ')}`);
    return data;
  }
}

module.exports = ShiprocketService;
