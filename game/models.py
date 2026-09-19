from django.db import models


class TeacherAnswer(models.Model):
    question = models.TextField()

    normalized_question = models.TextField(
        db_index=True
    )

    answer = models.TextField()

    language = models.CharField(
        max_length=10,
        default="en-GB",
        db_index=True,
    )

    fen = models.TextField(
        blank=True,
        default=""
    )

    position_dependent = models.BooleanField(
        default=False
    )

    times_used = models.PositiveIntegerField(
        default=0
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    def __str__(self):
        return self.question[:80]
