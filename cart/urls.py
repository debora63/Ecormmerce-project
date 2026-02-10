from django.urls import path
from . import views

urlpatterns = [
    path("cart/add/", CartViewSet.as_view({"post": "add_to_cart"}), name="add-to-cart"),
    path('cart/', CartListView.as_view(), name='cart-list'),
    path('cart/<int:id>/', CartView.as_view(), name='cart-detail'),
    path('cart/<int:pk>/update-quantity/', CartViewSet.as_view({'patch': 'update_quantity'}), name='update-quantity'),
    path("api/cart/", CartView.as_view(), name="cart"),
    path("api/cart/<int:pk>/", CartView.as_view(), name="cart-detail"),
]
