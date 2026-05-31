from rest_framework import serializers

from .models import Conversation, Message


class MessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Message
        fields = ["id", "role", "content", "created_at"]
        read_only_fields = fields


class ConversationSerializer(serializers.ModelSerializer):
    message_count = serializers.IntegerField(source="messages.count", read_only=True)
    last_message = serializers.SerializerMethodField()

    class Meta:
        model = Conversation
        fields = ["id", "title", "message_count", "last_message", "created_at", "updated_at"]

    def get_last_message(self, obj):
        msg = obj.messages.last()
        return msg.content[:120] if msg else ""


class ConversationDetailSerializer(ConversationSerializer):
    messages = MessageSerializer(many=True, read_only=True)

    class Meta(ConversationSerializer.Meta):
        fields = ConversationSerializer.Meta.fields + ["messages"]


class SendMessageSerializer(serializers.Serializer):
    conversation_id = serializers.IntegerField(required=False)
    message = serializers.CharField(max_length=4000)
