// Automated End-to-End Verification Test Suite for UPAHAR 5-Panel Architecture
const BASE_URL = "http://localhost:3000";

async function runTests() {
  console.log("==================================================================");
  console.log("🚀 STARTING UPAHAR 5-PANEL FULL END-TO-END VERIFICATION TEST");
  console.log("==================================================================\n");

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${message}`);
      failed++;
    }
  }

  try {
    // 1. Check Restaurant API & Paytm Business QR Settings
    console.log("📍 [STEP 1] Testing Restaurant Settings, Geofencing & Paytm Business QR...");
    const restRes = await fetch(`${BASE_URL}/api/restaurant`);
    const restData = await restRes.json();
    assert(restRes.ok, "Restaurant settings API responded 200 OK");
    assert(restData.settings?.deliveryRadiusKm === 5, "Delivery radius is set to Tagarapuvalasa 5km");
    assert(restData.settings?.upiId === "paytm.s2fno8y@pty", "Official Paytm UPI ID paytm.s2fno8y@pty configured");
    assert(restData.settings?.paymentQrUrl === "/images/payment-qr.jpg", "Official Paytm QR image configured");
    assert(restData.settings?.enforceStoreHours === true, "Store Session Hours enforcement is ON");
    assert(restData.settings?.minDeliveryOrderAmount === 60, "Minimum delivery order is set to ₹60");
    assert(restData.settings?.packagingFee === 10, "Packaging fee is set to ₹10");
    assert(restData.settings?.isEmergencyWebsiteStopped === false, "Emergency Website Stop is initially OFF");

    // 1b. Verify Session Hours Locking & Minimum Order ₹60 Enforcement
    if (restData.storeStatus && !restData.storeStatus.isOpen) {
      const closedOrderRes = await fetch(`${BASE_URL}/api/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: "Afternoon Test",
          customerPhone: "9999999999",
          orderType: "DELIVERY",
          locality: "ANITS Campus & Hostels",
          deliveryAddress: "Hostel 1",
          distanceKm: 0.5,
          paymentMethod: "COD",
          items: [{ name: "Idly (4)", price: 30, quantity: 3 }],
        }),
      });
      assert(closedOrderRes.status === 403, `Customer order locked (403) during closed session: ${restData.storeStatus.statusText}`);
    }

    const lowOrderRes = await fetch(`${BASE_URL}/api/orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customerName: "Low Amount Test",
        customerPhone: "9999999999",
        orderType: "DELIVERY",
        locality: "ANITS Campus & Hostels",
        deliveryAddress: "Hostel 1",
        distanceKm: 0.5,
        paymentMethod: "COD",
        simulatorBypassHours: true,
        items: [{ name: "Idly (4)", price: 30, quantity: 1 }], // ₹30 < ₹60 minimum
      }),
    });
    assert(lowOrderRes.status === 400, "Delivery order below ₹60 minimum rejected (400)");

    // 2. Test Emergency Website Stop Kill-Switch
    console.log("\n🚨 [STEP 2] Testing Emergency Website Stop Kill-Switch...");
    const stopRes = await fetch(`${BASE_URL}/api/restaurant`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isEmergencyWebsiteStopped: true }),
    });
    assert(stopRes.ok, "PUT /api/restaurant enabled Emergency Stop");

    const blockedOrderRes = await fetch(`${BASE_URL}/api/orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customerName: "Blocked User",
        customerPhone: "9999999999",
        orderType: "DELIVERY",
        locality: "ANITS Campus & Hostels",
        deliveryAddress: "Hostel 1",
        distanceKm: 0.5,
        paymentMethod: "COD",
        items: [{ name: "Idly (4)", price: 30, quantity: 1 }],
      }),
    });
    assert(blockedOrderRes.status === 403, "Order placement blocked (403) while Emergency Stop is active");

    const resumeRes = await fetch(`${BASE_URL}/api/restaurant`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isEmergencyWebsiteStopped: false }),
    });
    assert(resumeRes.ok, "PUT /api/restaurant resumed online orders");

    // 3. Test Customer Mobile OTP Signup/Login & Saved Addresses
    console.log("\n📱 [STEP 3] Testing Customer Mobile OTP Verification & Saved Addresses...");
    const testCustPhone = "9848" + Math.floor(100000 + Math.random() * 900000);
    const sendOtpRes = await fetch(`${BASE_URL}/api/customer/otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "send", phone: testCustPhone }),
    });
    const sendOtpData = await sendOtpRes.json();
    assert(sendOtpRes.ok && sendOtpData.sandboxOtp?.length === 4, `4-digit login OTP generated: ${sendOtpData.sandboxOtp}`);

    const verifyOtpRes = await fetch(`${BASE_URL}/api/customer/otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "verify",
        phone: testCustPhone,
        code: sendOtpData.sandboxOtp,
        name: "Ananya Rao",
        address: "Girls Hostel Room 204, ANITS",
        locality: "ANITS Campus & Hostels",
      }),
    });
    const verifyOtpData = await verifyOtpRes.json();
    assert(verifyOtpRes.ok && verifyOtpData.success && verifyOtpData.customer?.id, "Customer OTP verified & account created");
    const customerId = verifyOtpData.customer.id;

    // Add a second saved address
    const addAddrRes = await fetch(`${BASE_URL}/api/customer/addresses`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customerId,
        label: "Home",
        address: "Flat 302, Sai Nilayam, Tagarapuvalasa Junction",
        locality: "Tagarapuvalasa RTC Bus Stand & Main Junction",
        isDefault: true,
      }),
    });
    const addAddrData = await addAddrRes.json();
    assert(addAddrRes.ok && addAddrData.addresses?.length >= 2, `Saved ${addAddrData.addresses?.length} customer addresses`);

    // 4. Test Promo Coupon Validation (ANITS10)
    console.log("\n🎟️ [STEP 4] Testing Promo Coupon Validation...");
    const couponRes = await fetch(`${BASE_URL}/api/coupons`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "validate", code: "ANITS10", subtotal: 220 }),
    });
    const couponData = await couponRes.json();
    assert(couponRes.ok && couponData.discountAmount === 22, `Coupon ANITS10 applied cleanly (-₹${couponData.discountAmount})`);

    // 5. Test Delivery Boy Self-Apply -> Pending Block -> Admin Approve -> Auth
    console.log("\n🚴 [STEP 5] Testing Rider Self-Signup, Admin Approval & Auth...");
    const testRiderPhone = "9885" + Math.floor(100000 + Math.random() * 900000);
    const testRiderPin = "4321";

    const applyRes = await fetch(`${BASE_URL}/api/delivery/agents`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "apply",
        name: "Suresh Kumar",
        phone: testRiderPhone,
        vehicleNumber: "AP 39 CN 8899",
        pin: testRiderPin,
      }),
    });
    const applyData = await applyRes.json();
    assert(applyRes.ok && applyData.agent?.approvalStatus === "PENDING_APPROVAL", "Rider application created in PENDING_APPROVAL");
    const riderId = applyData.agent.id;

    // Pending rider login must be blocked (403)
    const pendingLoginRes = await fetch(`${BASE_URL}/api/delivery/auth`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone: testRiderPhone, pin: testRiderPin }),
    });
    assert(pendingLoginRes.status === 403, "Pending rider blocked until Admin approves");

    // Admin approves rider
    const approveRes = await fetch(`${BASE_URL}/api/delivery/agents`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: riderId, approvalStatus: "APPROVED" }),
    });
    assert(approveRes.ok, "Admin approved rider application");

    const riderLoginRes = await fetch(`${BASE_URL}/api/delivery/auth`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone: testRiderPhone, pin: testRiderPin }),
    });
    const riderLoginData = await riderLoginRes.json();
    assert(riderLoginRes.ok && riderLoginData.success, "Approved rider authenticated successfully with PIN");

    // 6. Test Customer Self-Cancel Flow (when PENDING)
    console.log("\n❌ [STEP 6] Testing Customer Self-Cancel while PENDING...");
    const tempOrderRes = await fetch(`${BASE_URL}/api/orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customerId,
        customerName: "Ananya Rao",
        customerPhone: testCustPhone,
        orderType: "DELIVERY",
        locality: "ANITS Campus & Hostels",
        deliveryAddress: "Girls Hostel Room 204",
        distanceKm: 0.6,
        paymentMethod: "COD",
        simulatorBypassHours: true,
        items: [{ name: "Bonda (4)", price: 30, quantity: 2 }],
      }),
    });
    const tempOrder = (await tempOrderRes.json()).order;
    const cancelRes = await fetch(`${BASE_URL}/api/orders/${tempOrder.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "CUSTOMER_CANCEL" }),
    });
    const cancelData = await cancelRes.json();
    assert(cancelRes.ok && cancelData.order.status === "CANCELLED", "Customer cancelled PENDING order cleanly");

    // 7. Test Full Order Flow with Coupon + QR-on-Delivery + Rider GPS + OTP Verification + Rating
    console.log("\n🛍️ [STEP 7] Testing Full Order Lifecycle with QR-on-Delivery & Coupon...");
    const orderRes = await fetch(`${BASE_URL}/api/orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customerId,
        customerName: "Ananya Rao",
        customerPhone: testCustPhone,
        orderType: "DELIVERY",
        locality: "Tagarapuvalasa RTC Bus Stand & Main Junction",
        deliveryAddress: "Flat 302, Sai Nilayam, Tagarapuvalasa Main Road",
        landmark: "Beside Old Bus Stand",
        distanceKm: 2.2,
        paymentMethod: "QR_ON_DELIVERY",
        couponCode: "ANITS10",
        simulatorBypassHours: true,
        items: [
          { name: "Upahar Special Masala Dosa", price: 80, quantity: 2 },
          { name: "Ghee Podi Idly (3)", price: 35, quantity: 2 },
        ],
      }),
    });
    const orderData = await orderRes.json();
    const order = orderData.order;
    assert(orderRes.ok && orderData.success, `Order #${order?.orderNumber} placed with QR_ON_DELIVERY & ANITS10`);
    assert(order.discountAmount === 23, `10% ANITS10 coupon discount applied (-₹${order.discountAmount})`);
    assert(order.packagingFee === 10, `Parcel packaging fee added: ₹${order.packagingFee}`);
    assert(order.totalAmount === 217, `Total billed accurately (₹230 + ₹10 pack - ₹23 discount = ₹${order.totalAmount})`);
    assert(order.deliveryOtp?.length === 4, `4-digit Delivery OTP generated: ${order.deliveryOtp}`);

    // Kitchen cooks & marks ready
    await fetch(`${BASE_URL}/api/orders/${order.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "PREPARING", estimatedTime: "15 mins" }),
    });
    const readyRes = await fetch(`${BASE_URL}/api/orders/${order.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "FOOD_READY" }),
    });
    assert((await readyRes.json()).order.status === "FOOD_READY", "Kitchen marked FOOD_READY");

    // Rider picks up & pings GPS
    await fetch(`${BASE_URL}/api/orders/${order.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "OUT_FOR_DELIVERY", deliveryAgentId: riderId }),
    });
    const gpsRes = await fetch(`${BASE_URL}/api/orders/${order.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "UPDATE_RIDER_LOCATION", riderLat: 17.931, riderLng: 83.421 }),
    });
    assert(gpsRes.ok, "Rider streamed live GPS coordinates");

    // Wrong OTP check
    const wrongOtpRes = await fetch(`${BASE_URL}/api/orders/${order.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "DELIVERED", enteredOtp: "0000", deliveryAgentId: riderId }),
    });
    assert(wrongOtpRes.status === 400, "Wrong OTP rejected (400 Bad Request)");

    // Doorstep Paytm QR scanned + Correct OTP entered
    const deliverQrRes = await fetch(`${BASE_URL}/api/orders/${order.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status: "DELIVERED",
        enteredOtp: order.deliveryOtp,
        deliveryAgentId: riderId,
        paymentMethod: "UPI",
        paymentStatus: "PAID",
        upiTransactionId: "431592817264",
        paymentConfirmedBy: "RIDER_QR",
      }),
    });
    const deliverQrData = await deliverQrRes.json();
    assert(deliverQrRes.ok && deliverQrData.order.status === "DELIVERED", "Paytm QR payment + OTP verified! Marked DELIVERED");
    assert(deliverQrData.order.paymentMethod === "UPI" && deliverQrData.order.paymentStatus === "PAID", "Order recorded as UPI PAID");

    // Verify cashInHand stayed ₹0 (since paid via Paytm QR!) while totalEarnings increased!
    const agentsCheck = await (await fetch(`${BASE_URL}/api/delivery/agents`)).json();
    const checkedRider = agentsCheck.agents.find((a) => a.id === riderId);
    assert(checkedRider?.cashInHand === 0, `Paytm QR delivery kept Rider COD cashInHand at ₹${checkedRider?.cashInHand}`);
    assert((checkedRider?.totalEarnings || 0) > 0, `Rider earnings credited: ₹${checkedRider?.totalEarnings}`);

    // 8. Customer Post-Delivery Rating & Admin Aggregate Revenue
    console.log("\n⭐ [STEP 8] Testing Post-Delivery Rating & Full Admin Stats...");
    const reviewRes = await fetch(`${BASE_URL}/api/orders/${order.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "SUBMIT_REVIEW",
        rating: 5,
        deliveryRating: 5,
        reviewComment: "Hot crispy dosas and easy Paytm QR scan!",
      }),
    });
    const reviewData = await reviewRes.json();
    assert(reviewRes.ok && reviewData.order.rating === 5, "Customer 5-star food & rider rating recorded");

    const statsRes = await fetch(`${BASE_URL}/api/orders?limit=5&stats=true`);
    const statsData = await statsRes.json();
    assert(statsRes.ok && statsData.stats?.totalRevenue > 0 && statsData.stats?.upiRevenue > 0, `Admin full DB stats active (Total: ₹${statsData.stats?.totalRevenue}, UPI: ₹${statsData.stats?.upiRevenue})`);

    console.log("\n==================================================================");
    console.log(`🏁 VERIFICATION COMPLETE: ${passed} PASSED, ${failed} FAILED`);
    console.log("==================================================================");

    if (failed > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error("Test runner encountered an unexpected error:", err);
    process.exit(1);
  }
}

runTests();
