import React from 'react';
import OrderTracker from '../components/OrderTracker';
import TimeDisplay from '../components/TimeDisplay';

function Orders() {
  return (
    <div>
      <TimeDisplay />
      <OrderTracker />
    </div>
  );
}

export default Orders;

