from django.contrib.auth import authenticate, login
from django.contrib.auth.models import User
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST
from cart.models import Cart  # Import your Cart model
from rest_framework.authtoken.models import Token
import json

@csrf_exempt
@require_POST
def register_view(request):
    try:
        data = json.loads(request.body)
        username = data.get("username")
        password = data.get("password")

        if not username or not password:
            return JsonResponse({"message": "Username and password are required"}, status=400)

        if User.objects.filter(username=username).exists():
            return JsonResponse({"message": "Username already taken"}, status=400)

        if len(password) < 6:
            return JsonResponse({"message": "Password must be at least 6 characters long"}, status=400)

        # ✅ Create user only if checks pass
        user = User.objects.create_user(username=username, password=password)
        token, _ = Token.objects.get_or_create(user=user)

        return JsonResponse({
            "message": "Account created successfully. You can now log in.",
            "success": True,  # ✅ Add a success flag
            "token": token.key
        }, status=201)

    except json.JSONDecodeError:
        return JsonResponse({"message": "Invalid JSON format"}, status=400)
    except Exception as e:
        return JsonResponse({"message": f"Error: {str(e)}"}, status=500)

@csrf_exempt
@require_POST
def login_view(request):
    try:
        data = json.loads(request.body)
        username = data.get("username")
        password = data.get("password")

        user = authenticate(username=username, password=password)

        if user is not None:
            token, created = Token.objects.get_or_create(user=user)  # ✅ Generate token
            
            return JsonResponse({
                "message": "Login successful!",
                "username": username,
                "token": token.key  # ✅ Include token in response
            }, status=200)

        return JsonResponse({"message": "Invalid credentials"}, status=400)

    except Exception as e:
        return JsonResponse({"message": f"Error: {str(e)}"}, status=500)

@csrf_exempt
@require_POST
def logout_view(request):
    try:
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Token "):
            token_key = auth_header.split(" ")[1]
            Token.objects.filter(key=token_key).delete()  # ✅ Delete token on logout

        logout(request)
        return JsonResponse({"message": "Logged out successfully"}, status=200)
    except:
        return JsonResponse({"message": "Something went wrong"}, status=400)