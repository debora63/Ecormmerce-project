from rest_framework.response import Response
from rest_framework.decorators import api_view
from django.http import JsonResponse
from rest_framework import viewsets
from django_filters import rest_framework as filters
from .models import Product
from .serializers import ProductSerializer
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.permissions import AllowAny

@api_view(['GET'])
def product_list(request):
    products = Product.objects.all()
    serializer = ProductSerializer(products, many=True, context={'request': request})  # Pass request context
    return Response(serializer.data)

def get_products(request):
    products = list(Product.objects.values())  # Convert QuerySet to list
    return JsonResponse(products, safe=False)


class ProductFilter(filters.FilterSet):
    name = filters.CharFilter(lookup_expr='icontains')
    price_min = filters.NumberFilter(field_name="price", lookup_expr='gte')
    price_max = filters.NumberFilter(field_name="price", lookup_expr='lte')
    category = filters.CharFilter(field_name="category", lookup_expr='iexact')  # ✅ Add category filter

    class Meta:
        model = Product
        fields = ['name', 'price_min', 'price_max']

class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    filterset_class = ProductFilter
    permission_classes = [AllowAny]
    filter_backends = [DjangoFilterBackend]  # ✅ Add this
    ordering_fields = ['price', 'name']
    ordering = ['price']  # Default ordering by price

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(queryset, many=True, context={'request': request})  # ✅ Add request context
        return Response(serializer.data)

    def get_image(self,obj):
        request=self.context.get("request")
        if obj.image:
            return request.build_absolute_uri(obj.image.url)
        return None 