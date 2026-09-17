import json

import chess
import chess.engine

from django.http import JsonResponse
from django.shortcuts import render
from django.views.decorators.http import require_POST
from django.views.decorators.csrf import ensure_csrf_cookie


STOCKFISH_PATH = "/opt/homebrew/bin/stockfish"


@ensure_csrf_cookie
def home(request):
    return render(request, "game/home.html")


@require_POST
def analyse_position(request):
    try:
        data = json.loads(request.body)
        fen = data.get("fen")

        if not fen:
            return JsonResponse(
                {"error": "FEN position is required."},
                status=400,
            )

        board = chess.Board(fen)

        engine = chess.engine.SimpleEngine.popen_uci(
            STOCKFISH_PATH
        )

        try:
            analyses = engine.analyse(
                board,
                chess.engine.Limit(depth=15),
                multipv=5,
            )

            candidate_moves = []

            for info in analyses:
                pv = info.get("pv", [])

                if not pv:
                    continue

                best_move = pv[0]

                score = info["score"].pov(
                    chess.WHITE
                )

                mate = score.mate()

                if mate is not None:
                    evaluation = None
                else:
                    centipawns = score.score()

                    evaluation = (
                        round(
                            centipawns / 100,
                            2,
                        )
                        if centipawns is not None
                        else None
                    )

                # Send several moves from the
                # variation to the teacher.
                variation = [
                    move.uci()
                    for move in pv[:8]
                ]

                candidate_moves.append({
                    "move": best_move.uci(),
                    "evaluation": evaluation,
                    "mate": mate,
                    "depth": info.get("depth"),
                    "variation": variation,
                })

            if not candidate_moves:
                return JsonResponse(
                    {
                        "error":
                            "Stockfish returned no moves."
                    },
                    status=400,
                )

            first_move = candidate_moves[0]

            # Keep the old fields so your
            # existing JavaScript continues
            # working.
            return JsonResponse({
                "best_move":
                    first_move["move"],

                "evaluation":
                    first_move["evaluation"],

                "mate":
                    first_move["mate"],

                "depth":
                    first_move["depth"],

                # New teacher data
                "candidate_moves":
                    candidate_moves,
            })

        finally:
            engine.quit()

    except ValueError:
        return JsonResponse(
            {"error": "Invalid chess position."},
            status=400,
        )

    except Exception as error:
        return JsonResponse(
            {"error": str(error)},
            status=500,
        )
