from django.contrib import admin
from .models import Order, OrderItem
from django.utils.html import format_html

class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 1  # Number of empty fields to show by default in the inline form

class OrderAdmin(admin.ModelAdmin):
    list_display = ('order_code', 'user', 'status', 'total_amount', 'delivery', 'created_at')
    list_filter = ('status', 'created_at', 'delivery')
    search_fields = ('order_code', 'user__username', 'user__email', 'status')

    # Set readonly fields (including created_at)
    readonly_fields = ('order_code', 'created_at', 'total_amount', 'mpesa_code', 'delivery', 
                       'delivery_fee', 'user', 'first_name', 'last_name', 'age', 'phone_number', 
                       'email', 'gender', 'location')

    # Inline to manage OrderItems on the same page
    inlines = [OrderItemInline]

    # Include user details in the order detail page
    # Include all fields in fieldsets
    fieldsets = (
        (None, {
            'fields': ('order_code', 'user', 'total_amount', 'mpesa_code', 'status', 'delivery', 'delivery_fee')
        }),
        ('User Details', {
            'fields': ('first_name', 'last_name', 'age', 'phone_number', 'email', 'gender', 'location'),
        }),
        ('Timestamps', {
            'fields': ('created_at',),
        }),
    )

# Register the Order model with the admin panel
admin.site.register(Order, OrderAdmin)

# Register the OrderItem model to be managed in the admin panel
class OrderItemAdmin(admin.ModelAdmin):
    list_display = ('order', 'product', 'quantity')
    search_fields = ('order__order_code', 'product__name')

admin.site.register(OrderItem, OrderItemAdmin)
