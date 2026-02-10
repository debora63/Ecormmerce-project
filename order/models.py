from django.db import models
from django.contrib.auth.models import User
from products.models import Product
import random

class Order(models.Model):
    ORDER_STATUS_CHOICES = [
        ('Pending', 'Pending'),
        ('Processing', 'Processing'),
        ('Shipping', 'Shipping'),
        ('Delivered', 'Delivered'),
        ('Cancelled', 'Cancelled'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    order_code = models.CharField(max_length=10, unique=True, blank=True)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    mpesa_code = models.CharField(max_length=10)
    delivery = models.BooleanField(default=False)
    delivery_fee = models.DecimalField(max_digits=6, decimal_places=2, default=0.00)
    status = models.CharField(max_length=20, choices=ORDER_STATUS_CHOICES, default='Pending')
    created_at = models.DateTimeField(auto_now_add=True)

    # User Details
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    age = models.PositiveIntegerField()
    phone_number = models.CharField(max_length=15)
    email = models.EmailField()
    gender = models.CharField(max_length=10, choices=[('Male', 'Male'), ('Female', 'Female'),('Other', 'Other')])
    location = models.CharField(max_length=255)

    def save(self, *args, **kwargs):
        if not self.order_code:
            self.order_code = f"EH-{random.randint(1000000, 9999999)}"
        if self.delivery:
            self.delivery_fee = 1000
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Order {self.order_code} - {self.user}"

class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name="items")
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)

    def __str__(self):
        return f"{self.quantity} x {self.product.name} in {self.order.order_code}"