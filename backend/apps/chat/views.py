from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from apps.common.ai import MEDICAL_DISCLAIMER, chat_reply
from apps.reports.rag import build_context, retrieve_for_user

from .models import Conversation, Message
from .serializers import (
    ConversationDetailSerializer,
    ConversationSerializer,
    MessageSerializer,
    SendMessageSerializer,
)

HISTORY_LIMIT = 20  # number of prior messages sent as context to the model


class ConversationViewSet(viewsets.ModelViewSet):
    """CRUD for conversations plus the ``send`` action to talk to the AI."""

    permission_classes = [IsAuthenticated]
    http_method_names = ["get", "post", "patch", "delete", "head", "options"]

    def get_queryset(self):
        return Conversation.objects.filter(user=self.request.user).prefetch_related("messages")

    def get_serializer_class(self):
        if self.action == "retrieve":
            return ConversationDetailSerializer
        return ConversationSerializer

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=False, methods=["get"])
    def disclaimer(self, request):
        return Response({"disclaimer": MEDICAL_DISCLAIMER})

    @action(detail=False, methods=["post"])
    def send(self, request):
        """Send a message; creates a conversation if none is supplied."""
        serializer = SendMessageSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        text = serializer.validated_data["message"]
        conv_id = serializer.validated_data.get("conversation_id")

        if conv_id:
            try:
                conversation = Conversation.objects.get(id=conv_id, user=request.user)
            except Conversation.DoesNotExist:
                return Response(
                    {"success": False, "message": "Conversation not found."},
                    status=status.HTTP_404_NOT_FOUND,
                )
        else:
            conversation = Conversation.objects.create(
                user=request.user,
                title=text[:50] + ("…" if len(text) > 50 else ""),
            )

        # Persist the user's message.
        user_msg = Message.objects.create(
            conversation=conversation, role=Message.Role.USER, content=text
        )

        # Build context-aware history (most recent N messages, chronological).
        history_qs = conversation.messages.exclude(id=user_msg.id).order_by("-created_at")[:HISTORY_LIMIT]
        history = [
            {"role": m.role, "content": m.content}
            for m in reversed(list(history_qs))
        ]

        # RAG: ground the answer in the user's own uploaded reports, if any are
        # relevant to this question.
        chunks = retrieve_for_user(request.user, text)
        context = build_context(chunks) if chunks else None

        reply_text = chat_reply(history, text, context=context)
        assistant_msg = Message.objects.create(
            conversation=conversation, role=Message.Role.ASSISTANT, content=reply_text
        )

        return Response(
            {
                "success": True,
                "conversation_id": conversation.id,
                "user_message": MessageSerializer(user_msg).data,
                "assistant_message": MessageSerializer(assistant_msg).data,
            },
            status=status.HTTP_201_CREATED,
        )
