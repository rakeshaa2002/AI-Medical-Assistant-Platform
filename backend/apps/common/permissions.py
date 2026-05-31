from rest_framework.permissions import BasePermission, SAFE_METHODS


class IsAdmin(BasePermission):
    message = "Admin access required."

    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.is_admin)


class IsDoctor(BasePermission):
    message = "Doctor access required."

    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.is_doctor)


class IsPatient(BasePermission):
    message = "Patient access required."

    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.is_patient)


class IsAdminOrReadOnly(BasePermission):
    """Anyone authenticated can read; only admins can write."""

    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return bool(request.user and request.user.is_authenticated)
        return bool(request.user and request.user.is_authenticated and request.user.is_admin)


class IsOwnerOrAdmin(BasePermission):
    """Object-level: owner of the object (``user`` attr) or an admin."""

    owner_field = "user"

    def has_object_permission(self, request, view, obj):
        if request.user.is_admin:
            return True
        owner = getattr(obj, getattr(view, "owner_field", self.owner_field), None)
        return owner == request.user
