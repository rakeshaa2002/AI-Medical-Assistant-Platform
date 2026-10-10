from unittest import mock

from django.contrib.auth import get_user_model
from django.db import ProgrammingError
from django.test import TestCase
from rest_framework.test import APIClient

User = get_user_model()


class SendMessageTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.client.force_authenticate(User.objects.create_user("chat@example.com", "Chat@12345"))

    @mock.patch("apps.chat.views.chat_reply", return_value="Rest and drink water.")
    @mock.patch(
        "apps.chat.views.retrieve_for_user",
        side_effect=ProgrammingError('relation "reports_reportchunk" does not exist'),
    )
    def test_report_search_failure_does_not_break_chat(self, _retrieve, chat_reply):
        res = self.client.post("/api/chat/conversations/send/", {"message": "I have a headache"}, format="json")

        self.assertEqual(res.status_code, 201)
        self.assertEqual(res.data["assistant_message"]["content"], "Rest and drink water.")
        self.assertIsNone(chat_reply.call_args.kwargs["context"])
