from django.conf import settings  # Import settings
from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from django.conf.urls.static import static
from cart import views
from cart.views import CartViewSet, CartListView, CartView
from products.views import ProductViewSet  
from order.views import OrderViewSet
from cart.views import CartView

# ✅ Define Router
router = DefaultRouter()
router.register(r'products', ProductViewSet, basename='product')
router.register(r'cart', CartViewSet, basename='cart')
router.register(r'order', OrderViewSet, basename='order')

urlpatterns = [
    path('api/', include(router.urls)),
    path('admin/', admin.site.urls),
    path('', include(router.urls)),

    # 🔥 AUTHENTICATION ENDPOINTS
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),  # Login
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),  # Refresh Token

    path("api/", include("accounts.urls")),  # Include accounts URLs
 
    # 🔥 PRODUCT ENDPOINTS (Handled by router)
    path('api/', include('products.urls')),  # ✅ Include the new route 

    # 🔥 CART & ORDERS ENDPOINTS
    path('cart/', CartListView.as_view(), name='cart-list'),
    path('cart/<int:pk>/update-quantity/', CartViewSet.as_view({'patch': 'update_quantity'}), name='update-quantity'),
    path('orders/', include('order.urls')),
    path("cart/", include("order.urls")),

    #ertyuiop
    path("api/cart/", CartView.as_view(), name="cart"),
    path("api/cart/<int:pk>/", CartView.as_view(), name="cart-detail"),

    path('orders/<int:pk>/cancel/', OrderViewSet.as_view({'post': 'cancel'}), name='order-cancel'),
    # 🔥 AUTHENTICATION ENDPOINTS
    path('api/token/', include('rest_framework.urls')),  # For authentication
]
# ✅ Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)