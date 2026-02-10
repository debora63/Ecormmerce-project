from .models import Cart, Product
from rest_framework import viewsets, status
from .serializers import CartSerializer
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import permissions
from rest_framework.generics import DestroyAPIView

class CartListView(APIView):
    """Retrieve all cart items"""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        cart_items = Cart.objects.filter(user=request.user)
        serializer = CartSerializer(cart_items, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

class CartView(DestroyAPIView):
    queryset = Cart.objects.all()
    serializer_class = CartSerializer

    def get_queryset(self):
        user = self.request.user
        return Cart.objects.filter(user=user)

    def delete(self, request, *args, **kwargs):
        item_id = kwargs.get("pk")  # Get item ID from URL
        cart_item = self.get_queryset().filter(id=item_id).first()

        if not cart_item:
            return Response({"error": "Item not found in cart"}, status=status.HTTP_404_NOT_FOUND)

        cart_item.delete()
        return Response({"message": "Item removed successfully"}, status=status.HTTP_204_NO_CONTENT)
class CartViewSet(viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticated]  # Ensure auth required

    def list(self, request):
        print("🔹 Headers:", request.headers)
        print("🔹 Request User:", request.user)
        print("🔹 Authenticated:", request.user.is_authenticated)

        if not request.user.is_authenticated:
            return Response({"error": "Authentication required"}, status=401)

        cart_items = Cart.objects.filter(user=request.user)
        print("🔹 Cart Items:", cart_items)

        serializer = CartSerializer(cart_items, many=True)
        return Response({"cart": serializer.data})

    def create(self, request):
        """Handle adding an item to the cart"""
        product_id = request.data.get("product_id")
        quantity = request.data.get("quantity", 1)

        if not product_id:
            return Response({"error": "Product ID is required"}, status=status.HTTP_400_BAD_REQUEST)

        product = Product.objects.filter(id=product_id).first()
        if not product:
            return Response({"error": "Product not found"}, status=status.HTTP_404_NOT_FOUND)

        # ✅ Handle authenticated and non-authenticated users
        if request.user.is_authenticated:
            cart_item, created = Cart.objects.get_or_create(user=request.user, product=product)
            cart_item.quantity += quantity
            cart_item.save()
        else:
            cart = request.session.get("cart", {})
            if str(product_id) in cart:
                cart[str(product_id)]["quantity"] += quantity
            else:
                cart[str(product_id)] = {"name": product.name, "price": str(product.price), "quantity": quantity}

            request.session["cart"] = cart
            request.session.modified = True

        return Response({"message": "Item added to cart"}, status=status.HTTP_201_CREATED)
    def update_quantity(self, request, pk=None):
        """Increase or decrease quantity based on action (add/remove)"""
        action = request.data.get("action")  # "add" or "remove"

        if action not in ["add", "remove"]:
            return Response({"error": "Invalid action. Use 'add' or 'remove'."}, status=status.HTTP_400_BAD_REQUEST)

        cart_item = Cart.objects.filter(user=request.user, product_id=pk).first()
        if not cart_item:
            return Response({"error": "Item not found in cart"}, status=status.HTTP_404_NOT_FOUND)

        product_name = cart_item.product.name  # Get the product name

        if action == "add":
            cart_item.quantity += 1
            cart_item.save()
            message = f"Added 1 more '{product_name}' to cart"
        elif action == "remove":
            if cart_item.quantity > 1:
                cart_item.quantity -= 1
                cart_item.save()
                message = f"1 '{product_name}' item removed from cart"
            else:
                cart_item.delete()
                message = f"Item '{product_name}' removed from cart completely"

        return Response(
            {"message": message, "cart": self.get_cart_response(request)},
            status=status.HTTP_200_OK,
     )

    def destroy(self, request, pk=None):
        """Remove item from cart completely"""
        cart_item = Cart.objects.filter(user=request.user, product_id=pk).first()
        if not cart_item:
            return Response({"error": "Item not found in cart"}, status=status.HTTP_404_NOT_FOUND)

        product_name = cart_item.product.name  # Get the product name before deletion
        cart_item.delete()

        return Response(
            {"message": f"Item '{product_name}' removed from cart completely", "cart": self.get_cart_response(request)},
            status=status.HTTP_200_OK,
        )

    def get_cart_response(self, request):
        """Helper function to return the current cart"""
        if request.user.is_authenticated:
            cart_items = Cart.objects.filter(user=request.user)
            return CartSerializer(cart_items, many=True).data
        else:
            return request.session.get("cart", [])
