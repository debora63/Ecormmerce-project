from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import OrderViewSet, OrderView, UpdateStockView  # ✅ Ensure both are imported

# ✅ Router for ViewSet-based order management
router = DefaultRouter()
router.register(r'orders', OrderViewSet, basename='order')

urlpatterns = [
    # ✅ Use OrderView for handling manual order creation via APIView
    path('cart/orders/', OrderView.as_view(), name="cart-order"),

    path('orders/<int:pk>/cancel/', OrderViewSet.as_view({'post': 'cancel'}), name='order-cancel'),
    path('api/update-stock/', UpdateStockView.as_view(), name='update-stock'),
    # ✅ Include router for ViewSet-based order management
    path('', include(router.urls)),
    path('api/', include(router.urls)),
]
