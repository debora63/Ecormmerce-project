from django.db import models

class Product(models.Model):
    CATEGORY_CHOICES = [
        ('Entertainment', 'Entertainment'),
        ('Networking & Connectivity', 'Networking & Connectivity'),
        ('Kitchenware', 'Kitchenware'),
        ('General Appliances', 'General Appliances'),
        ('Cleaning Tools', 'Cleaning'),
        ('Accessories', 'Accessories'),
        ('Electrical Spare Parts', 'Electrical Spare Parts'),
    ]

    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    stock = models.PositiveIntegerField(default=0)
    image = models.ImageField(upload_to='product_images/', blank=True, null=True)
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES)  # ✅ Category field

    def __str__(self):
        return self.name