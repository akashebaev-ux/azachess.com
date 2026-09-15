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
            info = engine.analyse(
                board,
                chess.engine.Limit(depth=15),
            )

            best_move = info["pv"][0]

            score = info["score"].pov(chess.WHITE)

            mate = score.mate()

            if mate is not None:
                evaluation = None
            else:
                centipawns = score.score()
                evaluation = (
                    round(centipawns / 100, 2)
                    if centipawns is not None
                    else None
                )

            return JsonResponse({
                "best_move": best_move.uci(),
                "evaluation": evaluation,
                "mate": mate,
                "depth": info.get("depth"),
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
