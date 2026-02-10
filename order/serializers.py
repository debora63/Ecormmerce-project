from rest_framework import serializers
from .models import Order, OrderItem
from cart.models import Cart
from products.models import Product  # Import Product if needed

class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = ['id', 'name', 'image', 'price']  # Include image field

DELIVERY_FEE = 1000  # Set delivery fee

class OrderItemSerializer(serializers.ModelSerializer):
    product = ProductSerializer()
    class Meta:
        model = OrderItem
        fields = ['product', 'quantity']  # ✅ No `order` field here

class OrderSerializer(serializers.ModelSerializer):
    # product = ProductSerializer(read_only=True)  # Nest full product details
    items = OrderItemSerializer(many=True, read_only=True)
    age = serializers.IntegerField(required=True)
    created_at = serializers.DateTimeField(format="%Y-%m-%dT%H:%M:%S", read_only=True)
    total_amount = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)

    class Meta:
        model = Order
        fields = '__all__'
        # fields = ['id', 'age', 'order_code', 'total_amount', 'status', 'delivery', 'items']
        extra_kwargs = {
            "items": {"required": False},
            "total_amount": {"required": False},
            "created_at": {"required": False},
        }

    def create(self, validated_data):
        user = self.context["request"].user
        cart_items = Cart.objects.filter(user=user)

        if not cart_items.exists():
            raise serializers.ValidationError({"error": "Cart is empty"})

        # ✅ 1. Calculate cart total
        total_cart_amount = sum(item.product.price * item.quantity for item in cart_items)

        # ✅ 2. Check if delivery is selected & add delivery fee
        delivery_selected = self.context["request"].data.get("delivery", False)
        final_total_amount = total_cart_amount + (DELIVERY_FEE if delivery_selected else 0)

        # ✅ 3. Create order with the final total amount
        order = Order.objects.create(user=user, total_amount=final_total_amount, **validated_data)

        # ✅ 4. Save order items
        for cart_item in cart_items:
            OrderItem.objects.create(order=order, product=cart_item.product, quantity=cart_item.quantity)

        # ✅ 5. Clear cart
        cart_items.delete()

        return order
