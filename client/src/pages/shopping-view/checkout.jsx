import Address from "@/components/shopping-view/address";
import img from "../../assets/account.jpg";
import { useDispatch, useSelector } from "react-redux";
import UserCartItemsContent from "@/components/shopping-view/cart-items-content";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { createNewOrder } from "@/store/shop/order-slice";
import { Navigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";

function ShoppingCheckout() {
  const { cartItems } = useSelector((state) => state.shopCart);
  const { user } = useSelector((state) => state.auth);
  const { approvalURL } = useSelector((state) => state.shopOrder);
  const [currentSelectedAddress, setCurrentSelectedAddress] = useState(null);
  const [isPaymentStart, setIsPaymemntStart] = useState(false);
  const dispatch = useDispatch();
  const { toast } = useToast();

  const totalCartAmount =
    cartItems && cartItems.items && cartItems.items.length > 0
      ? cartItems.items.reduce(
          (sum, currentItem) =>
            sum +
            (currentItem?.salePrice > 0
              ? currentItem?.salePrice
              : currentItem?.price) * currentItem?.quantity,
          0
        )
      : 0;

  function handleInitiatePaypalPayment() {
    if (cartItems.length === 0) {
      toast({
        title: "Your cart is empty. Please add items to proceed",
        variant: "destructive",
      });
      return;
    }

    if (currentSelectedAddress === null) {
      toast({
        title: "Please select one address to proceed.",
        variant: "destructive",
      });
      return;
    }

    const orderData = {
      userId: user?.id,
      cartId: cartItems?._id,
      cartItems: cartItems.items.map((singleCartItem) => ({
        productId: singleCartItem?.productId,
        title: singleCartItem?.title,
        image: singleCartItem?.image,
        price:
          singleCartItem?.salePrice > 0
            ? singleCartItem?.salePrice
            : singleCartItem?.price,
        quantity: singleCartItem?.quantity,
      })),
      addressInfo: {
        addressId: currentSelectedAddress?._id,
        address: currentSelectedAddress?.address,
        city: currentSelectedAddress?.city,
        pincode: currentSelectedAddress?.pincode,
        phone: currentSelectedAddress?.phone,
        notes: currentSelectedAddress?.notes,
      },
      orderStatus: "pending",
      paymentMethod: "paypal",
      paymentStatus: "pending",
      totalAmount: totalCartAmount,
      orderDate: new Date(),
      orderUpdateDate: new Date(),
      paymentId: "",
      payerId: "",
    };

    dispatch(createNewOrder(orderData)).then((data) => {
      if (data?.payload?.success) {
        setIsPaymemntStart(true);
      } else {
        setIsPaymemntStart(false);
      }
    });
  }

  async function loadRazorpayScript() {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  }

  async function handleRazorpayPayment() {
    const res = await loadRazorpayScript();
    if (!res) {
      toast({ title: "Razorpay SDK failed to load" });
      return;
    }

    if (cartItems.length === 0) {
      toast({
        title: "Your cart is empty. Please add items to proceed",
        variant: "destructive",
      });
      return;
    }

    if (currentSelectedAddress === null) {
      toast({
        title: "Please select one address to proceed.",
        variant: "destructive",
      });
      return;
    }

    const orderData = {
      userId: user?.id,
      cartId: cartItems?._id,
      cartItems: cartItems.items.map((item) => ({
        productId: item?.productId,
        title: item?.title,
        image: item?.image,
        price: item?.salePrice > 0 ? item?.salePrice : item?.price,
        quantity: item?.quantity,
      })),
      addressInfo: currentSelectedAddress,
      orderStatus: "pending",
      paymentMethod: "razorpay",
      paymentStatus: "pending",
      totalAmount: totalCartAmount,
      orderDate: new Date(),
      orderUpdateDate: new Date(),
    };

    const result = await fetch("http://localhost:5000/api/shop/razorpay/create-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: totalCartAmount }),
    });

    const data = await result.json();

    const options = {
      key: "rzp_test_EiMLoB9VeB068P",
      amount: data.amount,
      currency: data.currency,
      order_id: data.orderId,
      name: "Elite Store",

      description: "Complete your purchase",
      handler: async function (response) {
        await fetch("http://localhost:5000/api/shop/razorpay/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
            orderData,
          }),
        });

        sessionStorage.removeItem("currentOrderId");
        window.location.href = "/shop/payment-success";
      },
      prefill: {
        name: user?.name,
        email: user?.email,
      },
      theme: { color: "#3399cc" },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  }

  function handleCashOnDelivery() {
    if (cartItems.length === 0) {
      toast({
        title: "Your cart is empty. Please add items to proceed",
        variant: "destructive",
      });
      return;
    }

    if (currentSelectedAddress === null) {
      toast({
        title: "Please select one address to proceed.",
        variant: "destructive",
      });
      return;
    }

    const orderData = {
      userId: user?.id,
      cartId: cartItems?._id,
      cartItems: cartItems.items.map((item) => ({
        productId: item?.productId,
        title: item?.title,
        image: item?.image,
        price: item?.salePrice > 0 ? item?.salePrice : item?.price,
        quantity: item?.quantity,
      })),
      addressInfo: currentSelectedAddress,
      orderStatus: "pending",
      paymentMethod: "cod",
      paymentStatus: "pending",
      totalAmount: totalCartAmount,
      orderDate: new Date(),
      orderUpdateDate: new Date(),
    };

    dispatch(createNewOrder(orderData)).then((data) => {
      if (data?.payload?.success) {
        window.location.href = "/shop/payment-success-cod";
      }
    });
  }

  if (approvalURL) {
    window.location.href = approvalURL;
  }

  return (
    <div className="flex flex-col">
      <div className="relative h-[300px] w-full overflow-hidden">
        <img src={img} className="h-full w-full object-cover object-center" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-5 p-5">
        <Address
          selectedId={currentSelectedAddress}
          setCurrentSelectedAddress={setCurrentSelectedAddress}
        />
        <div className="flex flex-col gap-4">
          {cartItems && cartItems.items && cartItems.items.length > 0
            ? cartItems.items.map((item) => (
                <UserCartItemsContent key={item.productId} cartItem={item} />
              ))
            : null}
          <div className="mt-8 space-y-4">
            <div className="flex justify-between">
              <span className="font-bold">Total</span>
              <span className="font-bold">${totalCartAmount}</span>
            </div>
          </div>
          <div className="mt-4 w-full space-y-2">
            <Button onClick={handleInitiatePaypalPayment} className="w-full">
              {isPaymentStart
                ? "Processing Paypal Payment..."
                : "Checkout with Paypal"}
            </Button>
            <Button
              onClick={handleRazorpayPayment}
              className="w-full bg-black text-white"
            >
              Checkout with Razorpay
            </Button>
            <Button
              onClick={handleCashOnDelivery}
              className="w-full bg-green-600 text-white hover:bg-green-700"
            >
              Cash on Delivery
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ShoppingCheckout;
