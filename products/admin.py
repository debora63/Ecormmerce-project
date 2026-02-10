from django.contrib import admin
from .models import Product  # Import Product model

admin.site.register(Product)  # Register Product model
class ProductAdmin(admin.ModelAdmin):
    list_display = ('name', 'category', 'price', 'stock')  # Show these fields in admin
    list_filter = ('category',)  # Add filtering by category
    search_fields = ('name', 'description')  # Allow searching