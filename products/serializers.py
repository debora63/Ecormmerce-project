from rest_framework import serializers
from django.conf import settings
from .models import Product

class ProductSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()  # This ensures a full URL is returned

    class Meta:
        model = Product
        fields = '__all__' # Or explicitly list the fields: ['id', 'name', 'image']

    def get_image(self, obj):
        request = self.context.get('request')
        if obj.image:
             return f"http://127.0.0.1:8000{obj.image.url}"
        return None