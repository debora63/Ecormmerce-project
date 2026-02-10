from django.conf import settings
from rest_framework import serializers
from .models import Product, Cart


class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = '__all__' # ✅ Includes all Product fields

class CartSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)  # ✅ Only for GET requests
    product_id = serializers.PrimaryKeyRelatedField(
        queryset=Product.objects.all(),  # ✅ Allow passing product_id when creating cart
        source="product",  # ✅ Maps to product field in the Cart model
        write_only=True  # ✅ Excludes from GET response
    )

    class Meta:
        model = Cart
        fields = '__all__'  # ✅ Include all Cart fields + product_id
