from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ProductViewSet, get_products  # ✅ Import views

# ✅ Register ViewSet properly
router = DefaultRouter()
router.register(r'products', ProductViewSet, basename='product')

urlpatterns = [
    # path('', include(router.urls)),  
    path('api/', include(router.urls)), # ✅ Enables `/api/products/`
    path('products-list/', get_products, name='get_products'),  # ✅ Function-based API
]
