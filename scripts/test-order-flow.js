async function testOrder() {
  // 1. Fetch menu to get a real food item ID
  const menuRes = await fetch('http://localhost:3000/api/menu');
  const menuData = await menuRes.json();
  const firstItem = menuData.items[0];
  console.log('Selected food item:', firstItem.name, 'Price: ₹' + firstItem.price);

  // 2. Submit order
  const orderPayload = {
    customerName: 'Test Diner',
    customerPhone: '9876543210',
    customerEmail: 'diner@example.com',
    orderType: 'PICKUP',
    paymentMethod: 'CASH',
    specialInstructions: 'Extra crispy please',
    items: [
      {
        foodItemId: firstItem.id,
        quantity: 2,
        selectedPortion: firstItem.portionSize || 'Regular',
      },
    ],
  };

  const orderRes = await fetch('http://localhost:3000/api/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(orderPayload),
  });

  const orderResult = await orderRes.json();
  console.log('Order creation status:', orderRes.status);
  console.log('Order created:', orderResult);

  if (orderResult.order) {
    // 3. Track order
    const trackRes = await fetch(`http://localhost:3000/api/orders/${orderResult.order.orderNumber}`);
    const trackData = await trackRes.json();
    console.log('Order tracking verified! Status:', trackData.order?.orderStatus, 'Total: ₹' + trackData.order?.totalAmount);
  }
}

testOrder().catch(console.error);
