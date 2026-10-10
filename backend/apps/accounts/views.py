from django.contrib.auth import get_user_model
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, generics, status
from rest_framework.exceptions import PermissionDenied
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView

from apps.common.emails import send_welcome_email
from apps.common.permissions import IsAdmin

from .demo import is_demo_account
from .serializers import (
    ChangePasswordSerializer,
    EmailTokenObtainPairSerializer,
    RegisterSerializer,
    UpdateProfileSerializer,
    UserSerializer,
)

User = get_user_model()


class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        send_welcome_email(user)
        return Response(
            {
                "success": True,
                "message": "Registration successful. Please log in.",
                "user": UserSerializer(user).data,
            },
            status=status.HTTP_201_CREATED,
        )


class LoginView(TokenObtainPairView):
    serializer_class = EmailTokenObtainPairSerializer
    permission_classes = [AllowAny]


class MeView(generics.RetrieveUpdateAPIView):
    """Get or update the currently authenticated user's profile."""

    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user

    def get_serializer_class(self):
        if self.request.method in ("PUT", "PATCH"):
            return UpdateProfileSerializer
        return UserSerializer

    def update(self, request, *args, **kwargs):
        super().update(request, *args, **kwargs)
        return Response(UserSerializer(self.get_object()).data)


class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        if is_demo_account(request.user):
            raise PermissionDenied("Demo accounts can't change their password.")
        serializer = ChangePasswordSerializer(
            data=request.data, context={"request": request}
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({"success": True, "message": "Password updated successfully."})


class UserListView(generics.ListAPIView):
    """Admin: list/search all users."""

    serializer_class = UserSerializer
    permission_classes = [IsAdmin]
    queryset = User.objects.all().select_related("profile")
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ["role", "is_active"]
    search_fields = ["email", "first_name", "last_name", "phone"]
    ordering_fields = ["date_joined", "email"]


class UserDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Admin: retrieve, (de)activate or delete a user."""

    serializer_class = UserSerializer
    permission_classes = [IsAdmin]
    queryset = User.objects.all().select_related("profile")

    def check_can_change(self, user):
        if user == self.request.user:
            raise PermissionDenied("You can't change your own account here.")
        if self.request.user.is_superuser:
            return  # the site owner may manage anyone else
        # The demo admin's password is public (and it is never a superuser): it
        # must not lock visitors out of the shared demo logins, or the owner out.
        if is_demo_account(user):
            raise PermissionDenied("Demo accounts can't be changed. They're shared by everyone trying the app.")
        if user.is_staff or user.is_superuser:
            raise PermissionDenied("The site owner's admin account can't be changed here.")

    def patch(self, request, *args, **kwargs):
        user = self.get_object()
        if "is_active" in request.data:
            self.check_can_change(user)
            user.is_active = bool(request.data["is_active"])
            user.save(update_fields=["is_active"])
        return Response(UserSerializer(user).data)

    def update(self, request, *args, **kwargs):
        # PUT (PATCH is handled above); checked before validation.
        self.check_can_change(self.get_object())
        return super().update(request, *args, **kwargs)

    def perform_destroy(self, instance):
        self.check_can_change(instance)
        instance.delete()
