from django.shortcuts import get_object_or_404
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from .models import Order, OrderItem
from cart.models import Cart
from .serializers import OrderSerializer
from rest_framework import viewsets
from rest_framework.decorators import action
from django.utils.decorators import method_decorator
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly  # ✅ Import both
from rest_framework import serializers
from products.models import Product  # Import Product model if needed

class OrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.all()
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """Return all orders for the authenticated user, including canceled and successful ones"""
        return Order.objects.filter(user=self.request.user)  # No status filtering

    def list(self, request):
        """Fetch orders for the logged-in user"""
        orders = Order.objects.filter(user=request.user)
        serializer = self.get_serializer(orders, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        """Cancel an order if it's still 'Pending'"""
        order = get_object_or_404(Order, id=pk, user=request.user)

        if order.status != "Pending":
            return Response(
                {"error": "Cancellation not allowed"},
                status=status.HTTP_400_BAD_REQUEST
            )

        order.status = "Canceled"
        order.save()

        return Response(
            {"message": "Order canceled successfully"},
            status=status.HTTP_200_OK
        )
     
    @action(detail=True, methods=["GET"])
    def track(self, request, pk=None):
        """Fetch the current status of an order"""
        order = self.get_object()
        return Response({"order_id": order.id, "status": order.status})

    @action(detail=False, methods=["POST"], permission_classes=[IsAuthenticated])  
    def place_order(self, request):
        """✅ Create an order from cart items"""
        cart_items = Cart.objects.filter(user=request.user)

        if not cart_items.exists():
            return Response({"error": "Cart is empty"}, status=status.HTTP_400_BAD_REQUEST)

        total_price = sum(item.product.price * item.quantity for item in cart_items)
        order = Order.objects.create(user=request.user, total_amount=total_price)

        for item in cart_items:
            OrderItem.objects.create(order=order, product=item.product, quantity=item.quantity)

        cart_items.delete()
        return Response({"message": "Order placed successfully", "order_code": order.order_code}, status=status.HTTP_201_CREATED)

    def update(self, request, pk=None):
        """Allow admin to update order status"""
        order = self.get_object()
        new_status = request.data.get("status")

        if new_status not in ["Pending", "Processing", "Completed", "Cancelled"]:
            return Response({"error": "Invalid status"}, status=status.HTTP_400_BAD_REQUEST)

        order.status = new_status
        order.save()
        return Response({"message": "Order status updated successfully"})
    
DELIVERY_FEE = 1000  # Change this based on your delivery cost

class OrderView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        """✅ Create an order with stock validation & atomic transaction"""
        user = request.user
        cart_items = Cart.objects.filter(user=user)

        if not cart_items.exists():
            return Response({"error": "Cart is empty"}, status=status.HTTP_400_BAD_REQUEST)

        total_cart_amount = sum(item.product.price * item.quantity for item in cart_items)
        delivery_selected = request.data.get("delivery", False)
        total_amount = total_cart_amount + (DELIVERY_FEE if delivery_selected else 0)

        required_fields = ["mpesa_code", "first_name", "last_name", "phone_number", "location", "age", "email", "gender"]
        missing_fields = [field for field in required_fields if field not in request.data]

        if missing_fields:
            return Response({field: ["This field is required."] for field in missing_fields}, status=status.HTTP_400_BAD_REQUEST)

        # ✅ First check if all items have enough stock before making changes
        for cart_item in cart_items:
            product = get_object_or_404(Product, id=cart_item.product.id)
            if product.quantity < cart_item.quantity:
                return Response({"error": f"Not enough stock for {product.name}"}, status=status.HTTP_400_BAD_REQUEST)

        # ✅ Use atomic transaction: Everything runs successfully or gets rolled back
        with transaction.atomic():
            order_data = request.data.copy()
            order_data.pop("items", None)
            order_data.pop("total_amount", None)
            order_data["user"] = user.id  

            serializer = OrderSerializer(data=order_data)
            if serializer.is_valid():
                order = serializer.save(user=user, total_amount=total_amount)

                for cart_item in cart_items:
                    product = get_object_or_404(Product, id=cart_item.product.id)
                    product.quantity -= cart_item.quantity  # ✅ Deduct stock
                    product.save()
                    OrderItem.objects.create(order=order, product=cart_item.product, quantity=cart_item.quantity)

                # ✅ Clear cart after successful order
                cart_items.delete()

                return Response({
                    "message": "Order placed successfully",
                    "order_code": order.order_code,
                    "total_amount": total_amount  
                }, status=status.HTTP_201_CREATED)

        return Response({"error": "Failed to place order"}, status=status.HTTP_400_BAD_REQUEST)

class UpdateStockView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        """✅ Deduct product stock based on the cart"""
        user = request.user
        cart_items = Cart.objects.filter(user=user)

        if not cart_items.exists():
            return Response({"error": "Cart is empty"}, status=status.HTTP_400_BAD_REQUEST)

        # ✅ First check stock availability
        for item in cart_items:
            product = get_object_or_404(Product, id=item.product.id)
            if product.quantity < item.quantity:
                return Response({"error": f"Not enough stock for {product.name}"}, status=status.HTTP_400_BAD_REQUEST)

        # ✅ Deduct stock using an atomic transaction
        with transaction.atomic():
            for item in cart_items:
                product = get_object_or_404(Product, id=item.product.id)
                product.quantity -= item.quantity
                product.save()

            cart_items.delete()  # ✅ Clear cart after stock update

        return Response({"message": "Stock updated successfully"}, status=status.HTTP_200_OK)