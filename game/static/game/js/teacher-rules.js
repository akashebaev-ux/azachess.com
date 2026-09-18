/*
============================================================
AZACHESS TEACHER — CHESS RULE KNOWLEDGE BASE
============================================================

PURPOSE

This file contains structured chess knowledge used by the
AzaChess virtual teacher.

It DOES NOT execute chess moves.

chess.js is responsible for:
- creating temporary teaching positions
- moving pieces
- capturing pieces
- highlighting squares
- drawing arrows
- speaking explanations
- restoring the student's position

This file describes WHAT should be taught.

============================================================
SUPPORTED LESSON TYPES
============================================================

piece-movement
piece-capture
special-rule
game-rule
tactical-concept
strategic-concept
pawn-concept
opening-principle
endgame-concept
notation
piece-value
general-question

============================================================
DEMONSTRATION FORMAT
============================================================

lesson: {
    answer: "...",

    setup: {
        white: {
            pawn: ["e4"]
        },

        black: {
            pawn: ["d5", "f5"]
        }
    },

    highlights: [...],

    demonstrations: [
        {
            from: "e4",
            to: "f5",
            capture: true,
            text: "..."
        },

        {
            reset: true
        }
    ]
}

============================================================
*/


(function () {

    "use strict";


    /*
    ============================================================
    PIECE MOVEMENT AND CAPTURE RULES
    ============================================================
    */

    const pieceRules = {

        /*
        ========================================================
        PAWN
        ========================================================
        */

        pawn: {

            keywords: [
                "pawn",
                "pawns"
            ],


            movement: {

                questionKeywords: [
                    "move",
                    "moves",
                    "movement",
                    "how does",
                    "how do"
                ],

                answer:
                    "A pawn normally moves one square forward. " +
                    "From its starting square, and only if the path is clear, " +
                    "it may move two squares forward. " +
                    "A pawn cannot move backward.",

                setup: {
                    white: {
                        pawn: ["e2"]
                    }
                },

                highlights: [
                    "e3",
                    "e4"
                ],

                demonstrations: [

                    {
                        from: "e2",
                        to: "e3",

                        text:
                            "A pawn can move one square forward, " +
                            "from e2 to e3."
                    },

                    {
                        reset: true
                    },

                    {
                        from: "e2",
                        to: "e4",

                        text:
                            "From its starting square, the pawn " +
                            "may instead move two squares, " +
                            "from e2 to e4."
                    }
                ]
            },


            capture: {

                questionKeywords: [
                    "capture",
                    "captures",
                    "take",
                    "takes",
                    "attack",
                    "attacks"
                ],

                answer:
                    "A pawn captures differently from how it moves. " +
                    "It captures an enemy piece one square diagonally forward. " +
                    "It cannot capture a piece directly in front of it.",

                setup: {
                    white: {
                        pawn: ["e4"]
                    },

                    black: {
                        pawn: [
                            "d5",
                            "f5"
                        ]
                    }
                },

                highlights: [
                    "d5",
                    "f5"
                ],

                demonstrations: [

                    {
                        from: "e4",
                        to: "f5",

                        capture: true,

                        text:
                            "The pawn on e4 can capture the enemy pawn " +
                            "on f5 by moving one square diagonally forward."
                    },

                    {
                        reset: true
                    },

                    {
                        from: "e4",
                        to: "d5",

                        capture: true,

                        text:
                            "The pawn can also capture diagonally " +
                            "in the other direction, from e4 to d5."
                    }
                ]
            }
        },


        /*
        ========================================================
        KNIGHT
        ========================================================
        */

        knight: {

            keywords: [
                "knight",
                "knights",
                "horse"
            ],


            movement: {

                questionKeywords: [
                    "move",
                    "moves",
                    "movement",
                    "how does",
                    "how do"
                ],

                answer:
                    "A knight moves in an L-shape. " +
                    "It moves two squares in one direction and then " +
                    "one square perpendicular to that direction. " +
                    "A knight is the only normal chess piece that can " +
                    "jump over other pieces.",

                setup: {
                    white: {
                        knight: ["d4"]
                    }
                },

                highlights: [
                    "b3",
                    "b5",
                    "c2",
                    "c6",
                    "e2",
                    "e6",
                    "f3",
                    "f5"
                ],

                text:
                    "From d4, the knight has up to eight possible " +
                    "L-shaped destinations."
            },


            capture: {

                questionKeywords: [
                    "capture",
                    "captures",
                    "take",
                    "takes",
                    "attack",
                    "attacks"
                ],

                answer:
                    "A knight captures an enemy piece by moving to " +
                    "that piece's square using its normal L-shaped movement.",

                setup: {
                    white: {
                        knight: ["d4"]
                    },

                    black: {
                        pawn: [
                            "c6",
                            "f5"
                        ]
                    }
                },

                demonstrations: [

                    {
                        from: "d4",
                        to: "c6",
                        capture: true,

                        text:
                            "The knight can capture the enemy piece on c6."
                    },

                    {
                        reset: true
                    },

                    {
                        from: "d4",
                        to: "f5",
                        capture: true,

                        text:
                            "The knight can also capture the enemy piece on f5."
                    }
                ]
            },


            jumping: {

                answer:
                    "Knights can jump over both friendly and enemy pieces. " +
                    "Pieces between the knight and its destination " +
                    "do not block the knight.",

                setup: {
                    white: {
                        knight: ["d4"],
                        pawn: [
                            "c4",
                            "d5",
                            "e4"
                        ]
                    }
                },

                highlights: [
                    "b3",
                    "b5",
                    "c2",
                    "c6",
                    "e2",
                    "e6",
                    "f3",
                    "f5"
                ]
            }
        },


        /*
        ========================================================
        BISHOP
        ========================================================
        */

        bishop: {

            keywords: [
                "bishop",
                "bishops"
            ],


            movement: {

                questionKeywords: [
                    "move",
                    "moves",
                    "movement",
                    "how does",
                    "how do"
                ],

                answer:
                    "A bishop moves diagonally for any number of squares, " +
                    "provided no piece blocks its path. " +
                    "Because it moves diagonally, a bishop always remains " +
                    "on the same color of square.",

                setup: {
                    white: {
                        bishop: ["d4"]
                    }
                },

                rays: [
                    {
                        direction: "north-west",
                        squares: [
                            "c5",
                            "b6",
                            "a7"
                        ]
                    },

                    {
                        direction: "north-east",
                        squares: [
                            "e5",
                            "f6",
                            "g7",
                            "h8"
                        ]
                    },

                    {
                        direction: "south-west",
                        squares: [
                            "c3",
                            "b2",
                            "a1"
                        ]
                    },

                    {
                        direction: "south-east",
                        squares: [
                            "e3",
                            "f2",
                            "g1"
                        ]
                    }
                ],

                text:
                    "The bishop on d4 can move along all four diagonals."
            },


            capture: {

                answer:
                    "A bishop captures by moving diagonally onto an " +
                    "enemy piece's square.",

                setup: {
                    white: {
                        bishop: ["d4"]
                    },

                    black: {
                        knight: ["g7"]
                    }
                },

                demonstrations: [
                    {
                        from: "d4",
                        to: "g7",

                        capture: true,

                        text:
                            "The bishop travels along the diagonal " +
                            "and captures the knight on g7."
                    }
                ]
            },


            blocked: {

                answer:
                    "A bishop cannot jump over another piece. " +
                    "If a piece blocks its diagonal, the bishop cannot " +
                    "move through that piece.",

                setup: {
                    white: {
                        bishop: ["d4"],
                        pawn: ["e5"]
                    }
                },

                blockedRay: [
                    "e5",
                    "f6",
                    "g7",
                    "h8"
                ]
            },


            colorComplex: {

                answer:
                    "A bishop always stays on the same color of square. " +
                    "A light-squared bishop can never move onto a dark square, " +
                    "and a dark-squared bishop can never move onto a light square."
            }
        },


        /*
        ========================================================
        ROOK
        ========================================================
        */

        rook: {

            keywords: [
                "rook",
                "rooks"
            ],


            movement: {

                answer:
                    "A rook moves horizontally or vertically for any " +
                    "number of squares, provided its path is clear.",

                setup: {
                    white: {
                        rook: ["d4"]
                    }
                },

                rays: [
                    {
                        direction: "up",
                        squares: [
                            "d5",
                            "d6",
                            "d7",
                            "d8"
                        ]
                    },

                    {
                        direction: "down",
                        squares: [
                            "d3",
                            "d2",
                            "d1"
                        ]
                    },

                    {
                        direction: "left",
                        squares: [
                            "c4",
                            "b4",
                            "a4"
                        ]
                    },

                    {
                        direction: "right",
                        squares: [
                            "e4",
                            "f4",
                            "g4",
                            "h4"
                        ]
                    }
                ]
            },


            capture: {

                answer:
                    "A rook captures an enemy piece by moving horizontally " +
                    "or vertically onto its square.",

                setup: {
                    white: {
                        rook: ["d4"]
                    },

                    black: {
                        bishop: ["d7"],
                        knight: ["g4"]
                    }
                },

                demonstrations: [

                    {
                        from: "d4",
                        to: "d7",
                        capture: true,

                        text:
                            "The rook can capture vertically on d7."
                    },

                    {
                        reset: true
                    },

                    {
                        from: "d4",
                        to: "g4",
                        capture: true,

                        text:
                            "The rook can also capture horizontally on g4."
                    }
                ]
            },


            blocked: {

                answer:
                    "A rook cannot jump over pieces. " +
                    "A piece standing on the rook's line blocks " +
                    "everything behind it."
            }
        },


        /*
        ========================================================
        QUEEN
        ========================================================
        */

        queen: {

            keywords: [
                "queen",
                "queens"
            ],


            movement: {

                answer:
                    "The queen combines the movement of a rook and bishop. " +
                    "She may move horizontally, vertically, or diagonally " +
                    "for any number of squares, provided her path is clear.",

                setup: {
                    white: {
                        queen: ["d4"]
                    }
                },

                rays: [
                    {
                        direction: "up",
                        squares: [
                            "d5",
                            "d6",
                            "d7",
                            "d8"
                        ]
                    },

                    {
                        direction: "down",
                        squares: [
                            "d3",
                            "d2",
                            "d1"
                        ]
                    },

                    {
                        direction: "left",
                        squares: [
                            "c4",
                            "b4",
                            "a4"
                        ]
                    },

                    {
                        direction: "right",
                        squares: [
                            "e4",
                            "f4",
                            "g4",
                            "h4"
                        ]
                    },

                    {
                        direction: "north-west",
                        squares: [
                            "c5",
                            "b6",
                            "a7"
                        ]
                    },

                    {
                        direction: "north-east",
                        squares: [
                            "e5",
                            "f6",
                            "g7",
                            "h8"
                        ]
                    },

                    {
                        direction: "south-west",
                        squares: [
                            "c3",
                            "b2",
                            "a1"
                        ]
                    },

                    {
                        direction: "south-east",
                        squares: [
                            "e3",
                            "f2",
                            "g1"
                        ]
                    }
                ]
            },


            capture: {

                answer:
                    "The queen captures using the same movement she normally uses: " +
                    "horizontally, vertically, or diagonally.",

                setup: {
                    white: {
                        queen: ["d4"]
                    },

                    black: {
                        pawn: ["d7"],
                        bishop: ["g4"],
                        knight: ["g7"]
                    }
                },

                demonstrations: [

                    {
                        from: "d4",
                        to: "d7",
                        capture: true,
                        text:
                            "The queen can capture vertically."
                    },

                    {
                        reset: true
                    },

                    {
                        from: "d4",
                        to: "g4",
                        capture: true,
                        text:
                            "The queen can capture horizontally."
                    },

                    {
                        reset: true
                    },

                    {
                        from: "d4",
                        to: "g7",
                        capture: true,
                        text:
                            "The queen can capture diagonally."
                    }
                ]
            }
        },


        /*
        ========================================================
        KING
        ========================================================
        */

        king: {

            keywords: [
                "king",
                "kings"
            ],


            movement: {

                answer:
                    "The king normally moves one square in any direction: " +
                    "horizontally, vertically, or diagonally. " +
                    "However, the king may never move onto a square " +
                    "attacked by an enemy piece.",

                setup: {
                    white: {
                        king: ["d4"]
                    }
                },

                highlights: [
                    "c3",
                    "c4",
                    "c5",
                    "d3",
                    "d5",
                    "e3",
                    "e4",
                    "e5"
                ]
            },


            capture: {

                answer:
                    "The king captures an enemy piece by moving one square " +
                    "onto that piece's square, but only if the destination " +
                    "square is not attacked by another enemy piece."
            },


            illegalDanger: {

                answer:
                    "A king cannot move into check. " +
                    "Even if a square is otherwise reachable, it is illegal " +
                    "if an enemy piece attacks that square."
            },


            adjacency: {

                answer:
                    "The two kings may never stand next to each other, " +
                    "because each king attacks all adjacent squares."
            }
        }
    };


    /*
    ============================================================
    SPECIAL MOVES
    ============================================================
    */

    const specialRules = {

        /*
        ========================================================
        CASTLING
        ========================================================
        */

        castling: {

            keywords: [
                "castle",
                "castling",
                "king side castle",
                "queen side castle",
                "kingside",
                "queenside"
            ],

            answer:
                "Castling is a special move involving the king and a rook. " +
                "The king moves two squares toward the rook, and the rook " +
                "moves to the square immediately beside the king.",


            kingside: {

                setup: {
                    white: {
                        king: ["e1"],
                        rook: ["h1"]
                    },

                    black: {
                        king: ["e8"]
                    }
                },

                demonstrations: [
                    {
                        from: "e1",
                        to: "g1",
                        special: "castle",

                        rookFrom: "h1",
                        rookTo: "f1",

                        text:
                            "For kingside castling, the king moves " +
                            "from e1 to g1 and the rook moves " +
                            "from h1 to f1."
                    }
                ]
            },


            queenside: {

                setup: {
                    white: {
                        king: ["e1"],
                        rook: ["a1"]
                    },

                    black: {
                        king: ["e8"]
                    }
                },

                demonstrations: [
                    {
                        from: "e1",
                        to: "c1",
                        special: "castle",

                        rookFrom: "a1",
                        rookTo: "d1",

                        text:
                            "For queenside castling, the king moves " +
                            "from e1 to c1 and the rook moves " +
                            "from a1 to d1."
                    }
                ]
            },


            requirements: [
                "The king must not have moved before.",
                "The rook used for castling must not have moved before.",
                "The required squares between the king and rook must be empty.",
                "The king cannot currently be in check.",
                "The king cannot pass through an attacked square.",
                "The king cannot finish castling on an attacked square."
            ]
        },


        /*
        ========================================================
        PROMOTION
        ========================================================
        */

        promotion: {

            keywords: [
                "promotion",
                "promote",
                "promotes",
                "promoted"
            ],

            answer:
                "When a pawn reaches the last rank, it must be promoted. " +
                "It may become a queen, rook, bishop, or knight. " +
                "The new piece does not need to be a previously captured piece.",

            setup: {
                white: {
                    pawn: ["e7"],
                    king: ["a1"]
                },

                black: {
                    king: ["h8"]
                }
            },

            demonstrations: [
                {
                    from: "e7",
                    to: "e8",

                    promotion: "queen",

                    text:
                        "The pawn reaches e8 and promotes. " +
                        "Here it becomes a queen."
                }
            ]
        },


        /*
        ========================================================
        UNDERPROMOTION
        ========================================================
        */

        underpromotion: {

            keywords: [
                "underpromotion",
                "under promote"
            ],

            answer:
                "Promotion does not have to produce a queen. " +
                "Choosing a rook, bishop, or knight instead is called " +
                "underpromotion. In some positions, especially tactical ones, " +
                "a knight promotion can be better than a queen promotion."
        },


        /*
        ========================================================
        EN PASSANT
        ========================================================
        */

        enPassant: {

            keywords: [
                "en passant"
            ],

            answer:
                "En passant is a special pawn capture. " +
                "If an enemy pawn moves two squares from its starting square " +
                "and lands directly beside your pawn, your pawn may capture it " +
                "as though it had moved only one square. " +
                "The opportunity exists only immediately after that two-square move.",

            setup: {
                white: {
                    pawn: ["e5"],
                    king: ["a1"]
                },

                black: {
                    pawn: ["d7"],
                    king: ["h8"]
                }
            },

            demonstrations: [

                {
                    from: "d7",
                    to: "d5",

                    text:
                        "The black pawn moves two squares from d7 to d5."
                },

                {
                    from: "e5",
                    to: "d6",

                    special: "enPassant",

                    captureSquare: "d5",

                    text:
                        "White may immediately play en passant. " +
                        "The pawn moves from e5 to d6, " +
                        "and the black pawn on d5 is removed."
                }
            ]
        }
    };


    /*
    ============================================================
    CHECK, CHECKMATE AND GAME RULES
    ============================================================
    */

    const gameRules = {

        check: {

            keywords: [
                "check",
                "what is check",
                "king in check"
            ],

            answer:
                "A king is in check when an enemy piece attacks the king's square. " +
                "The player in check must respond immediately.",

            responses: [
                "Move the king to a safe square.",
                "Capture the attacking piece if legal.",
                "Block the attack if the checking piece is a sliding piece and blocking is possible."
            ]
        },


        checkmate: {

            keywords: [
                "checkmate",
                "check mate",
                "mate"
            ],

            answer:
                "Checkmate occurs when the king is in check and there is " +
                "no legal move that removes the check. " +
                "The game ends immediately."
        },


        stalemate: {

            keywords: [
                "stalemate",
                "stale mate"
            ],

            answer:
                "Stalemate occurs when the player whose turn it is " +
                "is not in check but has no legal move. " +
                "The game is a draw."
        },


        illegalKingCapture: {

            keywords: [
                "capture king",
                "take king",
                "kill king"
            ],

            answer:
                "In chess, the king is not actually captured. " +
                "The game ends at checkmate, when the threatened king " +
                "has no legal way to escape."
        },


        turn: {

            keywords: [
                "who moves first",
                "who starts",
                "first move"
            ],

            answer:
                "White always makes the first move. " +
                "After that, White and Black alternate turns."
        }
    };


    /*
    ============================================================
    DRAW RULES
    ============================================================
    */

    const drawRules = {

        agreement: {

            keywords: [
                "draw agreement",
                "agree draw",
                "offer draw"
            ],

            answer:
                "Players may agree to a draw. " +
                "One player offers a draw and the other player may accept or decline."
        },


        stalemate: {
            answer:
                "Stalemate is a draw because the player to move " +
                "has no legal move but is not in check."
        },


        repetition: {

            keywords: [
                "threefold repetition",
                "repetition",
                "repeat position"
            ],

            answer:
                "A draw may be claimed when the same position occurs " +
                "three times with the same player to move and the same " +
                "relevant legal possibilities."
        },


        fiftyMove: {

            keywords: [
                "50 move rule",
                "fifty move rule",
                "50 moves"
            ],

            answer:
                "The fifty-move rule concerns a sequence of fifty moves " +
                "by each player without a pawn move or capture. " +
                "Under the official rules, this can provide a basis for a draw claim."
        },


        insufficientMaterial: {

            keywords: [
                "insufficient material",
                "dead position",
                "not enough pieces"
            ],

            answer:
                "A game is drawn when checkmate cannot possibly occur " +
                "through any legal sequence of moves. " +
                "Simple examples include king versus king."
        }
    };


    /*
    ============================================================
    PIECE VALUES
    ============================================================
    */

    const pieceValues = {

        pawn: {
            approximateValue: 1,

            answer:
                "A pawn is normally valued at about one point."
        },

        knight: {
            approximateValue: 3,

            answer:
                "A knight is normally valued at about three points."
        },

        bishop: {
            approximateValue: 3,

            answer:
                "A bishop is normally valued at about three points. " +
                "Its practical value depends strongly on the position."
        },

        rook: {
            approximateValue: 5,

            answer:
                "A rook is normally valued at about five points."
        },

        queen: {
            approximateValue: 9,

            answer:
                "A queen is normally valued at about nine points."
        },

        king: {
            approximateValue: null,

            answer:
                "The king does not have a normal point value because " +
                "losing the king to checkmate means losing the game."
        }
    };


    /*
    ============================================================
    TACTICAL CONCEPTS
    ============================================================
    */

    const tacticalRules = {

        fork: {

            keywords: [
                "fork",
                "double attack"
            ],

            answer:
                "A fork occurs when one piece attacks two or more important " +
                "enemy targets at the same time.",

            setup: {
                white: {
                    knight: ["e5"],
                    king: ["a1"]
                },

                black: {
                    king: ["g6"],
                    queen: ["d7"]
                }
            },

            highlights: [
                "d7",
                "g6"
            ]
        },


        pin: {

            keywords: [
                "pin",
                "pinned"
            ],

            answer:
                "A pin occurs when moving a piece would expose a more valuable " +
                "piece behind it to attack. If moving the piece would expose " +
                "its own king to check, the pinned piece cannot legally make " +
                "a move that exposes the king.",

            setup: {
                white: {
                    bishop: ["b5"],
                    king: ["g1"]
                },

                black: {
                    knight: ["c6"],
                    king: ["e8"]
                }
            },

            line: [
                "b5",
                "c6",
                "d7",
                "e8"
            ]
        },


        skewer: {

            keywords: [
                "skewer"
            ],

            answer:
                "A skewer attacks a valuable piece in front and, after that " +
                "piece moves, exposes another piece behind it."
        },


        discoveredAttack: {

            keywords: [
                "discovered attack"
            ],

            answer:
                "A discovered attack happens when one piece moves away " +
                "and reveals an attack by another piece behind it."
        },


        discoveredCheck: {

            keywords: [
                "discovered check"
            ],

            answer:
                "A discovered check occurs when a piece moves away " +
                "and reveals an attack on the enemy king."
        },


        doubleCheck: {

            keywords: [
                "double check"
            ],

            answer:
                "Double check means two pieces attack the king at the same time. " +
                "The checked side must move the king because capturing or blocking " +
                "only one attacker cannot remove both checks."
        },


        hangingPiece: {

            keywords: [
                "hanging piece",
                "undefended piece",
                "free piece"
            ],

            answer:
                "A hanging piece is a piece that can potentially be captured " +
                "without adequate tactical compensation or protection."
        },


        overloadedDefender: {

            keywords: [
                "overloaded",
                "overloaded defender"
            ],

            answer:
                "An overloaded defender is responsible for protecting " +
                "multiple important things and may be unable to protect them all."
        },


        deflection: {

            keywords: [
                "deflection",
                "deflect"
            ],

            answer:
                "Deflection is a tactic that forces an important defending piece " +
                "away from the square, piece, or line it must protect."
        },


        decoy: {

            keywords: [
                "decoy"
            ],

            answer:
                "A decoy attracts or forces an enemy piece onto a particular " +
                "square where it becomes vulnerable to another tactical idea."
        },


        removalOfDefender: {

            keywords: [
                "remove defender",
                "removal of defender",
                "remove the defender"
            ],

            answer:
                "Removal of the defender means eliminating or distracting " +
                "a piece that protects an important target."
        },


        zwischenzug: {

            keywords: [
                "zwischenzug",
                "intermediate move",
                "in-between move"
            ],

            answer:
                "A zwischenzug is an intermediate move played before the " +
                "expected response, often creating a stronger immediate threat."
        },


        backRankMate: {

            keywords: [
                "back rank mate",
                "back rank"
            ],

            answer:
                "A back-rank mate can occur when a king is trapped behind " +
                "its own pawns and a rook or queen gives check along the back rank."
        },


        matingNet: {

            keywords: [
                "mating net"
            ],

            answer:
                "A mating net is a coordinated set of threats that progressively " +
                "restricts the enemy king and threatens unavoidable checkmate."
        }
    };


    /*
    ============================================================
    STRATEGIC CONCEPTS
    ============================================================
    */

    const strategicRules = {

        development: {

            keywords: [
                "development",
                "develop pieces",
                "develop"
            ],

            answer:
                "Development means bringing pieces from their starting squares " +
                "to useful active squares. In the opening, knights and bishops " +
                "are commonly developed early."
        },


        center: {

            keywords: [
                "center",
                "centre",
                "control center",
                "control centre"
            ],

            answer:
                "The central squares, especially e4, d4, e5, and d5, " +
                "are strategically important because pieces placed near the " +
                "center often have more mobility and influence."
        },


        kingSafety: {

            keywords: [
                "king safety",
                "safe king",
                "protect king"
            ],

            answer:
                "King safety means reducing the opponent's ability to attack " +
                "your king. Castling, maintaining useful pawn cover, and avoiding " +
                "unnecessary weaknesses near the king are common considerations."
        },


        activity: {

            keywords: [
                "piece activity",
                "active piece",
                "activity"
            ],

            answer:
                "An active piece has useful mobility and influences important " +
                "squares, targets, or lines."
        },


        space: {

            keywords: [
                "space advantage",
                "space"
            ],

            answer:
                "A space advantage means controlling more useful territory, " +
                "which can give your pieces more room and restrict the opponent."
        },


        tempo: {

            keywords: [
                "tempo",
                "tempi"
            ],

            answer:
                "A tempo is essentially a unit of time represented by a move. " +
                "Gaining a tempo means accomplishing something while forcing " +
                "the opponent to spend time responding."
        },


        initiative: {

            keywords: [
                "initiative"
            ],

            answer:
                "The initiative is the ability to make threats that force " +
                "the opponent to react."
        },


        openFile: {

            keywords: [
                "open file"
            ],

            answer:
                "An open file contains no pawns. Rooks and queens often become " +
                "particularly active on open files."
        },


        semiOpenFile: {

            keywords: [
                "semi-open file",
                "semi open file"
            ],

            answer:
                "A semi-open file has no pawn belonging to one player, " +
                "although the opponent still has a pawn on that file."
        },


        outpost: {

            keywords: [
                "outpost"
            ],

            answer:
                "An outpost is a useful square, often for a knight, where the piece " +
                "is difficult to challenge with enemy pawns."
        },


        weakSquare: {

            keywords: [
                "weak square"
            ],

            answer:
                "A weak square is a square that is difficult to defend, " +
                "particularly when pawns cannot easily control it."
        },


        exchange: {

            keywords: [
                "exchange pieces",
                "trade pieces",
                "trade",
                "exchange"
            ],

            answer:
                "An exchange or trade occurs when pieces are captured in return " +
                "for one another. Whether a trade is desirable depends on material, " +
                "position, king safety, activity, and the resulting endgame."
        }
    };


    /*
    ============================================================
    PAWN STRUCTURE
    ============================================================
    */

    const pawnConcepts = {

        doubledPawns: {

            keywords: [
                "doubled pawns",
                "double pawns"
            ],

            answer:
                "Doubled pawns are two friendly pawns on the same file. " +
                "They can sometimes be weaknesses, although the resulting " +
                "open lines or extra control can also provide compensation."
        },


        isolatedPawn: {

            keywords: [
                "isolated pawn",
                "isolated pawns"
            ],

            answer:
                "An isolated pawn has no friendly pawn on either neighboring file. " +
                "It cannot be protected by another pawn."
        },


        passedPawn: {

            keywords: [
                "passed pawn",
                "passed pawns"
            ],

            answer:
                "A passed pawn has no enemy pawn ahead of it on its own file " +
                "or neighboring files that can directly stop its advance."
        },


        connectedPawns: {

            keywords: [
                "connected pawns",
                "connected pawn"
            ],

            answer:
                "Connected pawns are friendly pawns on neighboring files " +
                "that can often support one another."
        },


        backwardPawn: {

            keywords: [
                "backward pawn"
            ],

            answer:
                "A backward pawn is behind neighboring friendly pawns and may " +
                "have difficulty advancing safely."
        },


        pawnChain: {

            keywords: [
                "pawn chain"
            ],

            answer:
                "A pawn chain is a diagonal group of pawns protecting one another. " +
                "The base of the chain is often an important strategic target."
        },


        pawnBreak: {

            keywords: [
                "pawn break",
                "pawn breaks"
            ],

            answer:
                "A pawn break is a pawn advance intended to challenge the " +
                "opponent's pawn structure and open lines or create weaknesses."
        },


        pawnIsland: {

            keywords: [
                "pawn island",
                "pawn islands"
            ],

            answer:
                "A pawn island is a group of connected pawns separated from " +
                "another friendly pawn group by one or more empty files."
        }
    };


    /*
    ============================================================
    OPENING PRINCIPLES
    ============================================================
    */

    const openingRules = {

        openingGoals: {

            keywords: [
                "opening",
                "opening principles",
                "what should i do in opening"
            ],

            answer:
                "Common opening goals are to influence the center, develop pieces, " +
                "protect the king, and coordinate the pieces. These are principles, " +
                "not absolute rules."
        },


        earlyQueen: {

            keywords: [
                "queen early",
                "move queen early",
                "early queen"
            ],

            answer:
                "Bringing the queen out very early can allow the opponent to " +
                "develop pieces while attacking the queen. However, an early queen " +
                "move is not automatically bad if it serves a concrete purpose."
        },


        repeatedMoves: {

            keywords: [
                "move same piece twice",
                "same piece twice"
            ],

            answer:
                "In many openings it is useful to develop several pieces rather " +
                "than repeatedly moving one piece, but tactical necessities " +
                "and concrete opening ideas can justify repeated moves."
        },


        castleEarly: {

            keywords: [
                "castle early",
                "when should i castle"
            ],

            answer:
                "Castling often improves king safety and connects the rooks, " +
                "so it is frequently useful in the opening. The correct timing " +
                "still depends on the position."
        }
    };


    /*
    ============================================================
    ENDGAME CONCEPTS
    ============================================================
    */

    const endgameRules = {

        activeKing: {

            keywords: [
                "king in endgame",
                "active king"
            ],

            answer:
                "In many endgames the king becomes an active fighting piece. " +
                "With fewer enemy pieces capable of delivering mating attacks, " +
                "the king can often move toward the center."
        },


        opposition: {

            keywords: [
                "opposition"
            ],

            answer:
                "Opposition is an important king-and-pawn endgame concept " +
                "where the kings face one another with a square between them, " +
                "and the side to move may have to give way."
        },


        rookBehindPassedPawn: {

            keywords: [
                "rook behind passed pawn"
            ],

            answer:
                "A common rook-endgame principle is that a rook can often be " +
                "effectively placed behind a passed pawn, whether the pawn " +
                "belongs to you or your opponent."
        },


        kingAndQueenMate: {

            keywords: [
                "queen checkmate",
                "king queen mate",
                "mate with queen"
            ],

            answer:
                "King and queen versus king is a forced checkmate with correct play. " +
                "The usual method is to restrict the enemy king with the queen " +
                "and then bring your king close enough to help deliver mate."
        },


        kingAndRookMate: {

            keywords: [
                "rook checkmate",
                "king rook mate",
                "mate with rook"
            ],

            answer:
                "King and rook versus king is also a forced checkmate. " +
                "The rook restricts the enemy king while your king approaches " +
                "to help force it toward the edge."
        }
    };


    /*
    ============================================================
    CHESS NOTATION
    ============================================================
    */

    const notationRules = {

        square: {

            keywords: [
                "square name",
                "chess coordinates",
                "coordinates"
            ],

            answer:
                "Every chessboard square has a coordinate. " +
                "Files are labeled a through h and ranks are numbered 1 through 8. " +
                "For example, e4 means file e and rank 4."
        },


        pieces: {

            keywords: [
                "notation",
                "chess notation",
                "algebraic notation"
            ],

            answer:
                "In algebraic notation, K represents king, Q queen, R rook, " +
                "B bishop, and N knight. Pawns normally have no piece letter."
        },


        capture: {

            keywords: [
                "x in chess",
                "capture notation"
            ],

            answer:
                "The letter x normally indicates a capture in algebraic notation."
        },


        check: {

            keywords: [
                "plus sign chess",
                "plus notation"
            ],

            answer:
                "A plus sign after a move indicates check."
        },


        checkmate: {

            keywords: [
                "hash chess notation",
                "checkmate notation"
            ],

            answer:
                "A hash symbol is commonly used to indicate checkmate."
        },


        castling: {

            keywords: [
                "o-o",
                "o-o-o",
                "castle notation"
            ],

            answer:
                "Kingside castling is written O-O and queenside castling " +
                "is written O-O-O."
        }
    };


    /*
    ============================================================
    GENERAL QUESTIONS
    ============================================================
    */

    const generalRules = {

        objective: {

            keywords: [
                "goal of chess",
                "objective of chess",
                "how do you win",
                "how to win"
            ],

            answer:
                "The primary objective is to checkmate the opponent's king. " +
                "You win when the opponent's king is in check and there is " +
                "no legal way to escape that check."
        },


        board: {

            keywords: [
                "how many squares",
                "chess board",
                "chessboard"
            ],

            answer:
                "A standard chessboard has 64 squares arranged in eight files " +
                "and eight ranks."
        },


        startingPieces: {

            keywords: [
                "how many pieces",
                "starting pieces"
            ],

            answer:
                "Each player begins with sixteen pieces: one king, one queen, " +
                "two rooks, two bishops, two knights, and eight pawns."
        }
    };


    /*
    ============================================================
    HELPER FUNCTIONS
    ============================================================
    */

    function normalizeQuestion(question) {

        if (
            !question ||
            typeof question !== "string"
        ) {
            return "";
        }

        return question
            .toLowerCase()
            .trim()
            .replace(/[?!.,]/g, "");
    }


    function containsKeyword(
        question,
        keywords
    ) {

        return keywords.some(
            keyword =>
                question.includes(
                    keyword
                )
        );
    }


    /*
    ============================================================
    PIECE QUESTION DETECTION
    ============================================================
    */

    function getPieceRule(question) {

        const normalized =
            normalizeQuestion(question);


        for (
            const [pieceName, piece]
            of Object.entries(pieceRules)
        ) {

            if (
                !containsKeyword(
                    normalized,
                    piece.keywords
                )
            ) {
                continue;
            }


            /*
            CAPTURE QUESTIONS FIRST.

            This is important because:
            "How does a pawn capture?"
            should not return the normal
            movement lesson.
            */

            if (
                piece.capture &&
                (
                    normalized.includes(
                        "capture"
                    ) ||
                    normalized.includes(
                        "take"
                    ) ||
                    normalized.includes(
                        "attack"
                    )
                )
            ) {

                return {
                    type:
                        "piece-capture",

                    piece:
                        pieceName,

                    ...piece.capture
                };
            }


            /*
            KNIGHT JUMPING.
            */

            if (
                pieceName === "knight" &&
                piece.jumping &&
                normalized.includes("jump")
            ) {

                return {
                    type:
                        "piece-rule",

                    piece:
                        pieceName,

                    concept:
                        "jumping",

                    ...piece.jumping
                };
            }


            /*
            BISHOP COLOR COMPLEX.
            */

            if (
                pieceName === "bishop" &&
                piece.colorComplex &&
                (
                    normalized.includes(
                        "color"
                    ) ||
                    normalized.includes(
                        "colour"
                    )
                )
            ) {

                return {
                    type:
                        "piece-rule",

                    piece:
                        pieceName,

                    concept:
                        "color-complex",

                    ...piece.colorComplex
                };
            }


            /*
            BLOCKING.
            */

            if (
                piece.blocked &&
                (
                    normalized.includes(
                        "block"
                    ) ||
                    normalized.includes(
                        "jump over"
                    )
                )
            ) {

                return {
                    type:
                        "piece-rule",

                    piece:
                        pieceName,

                    concept:
                        "blocking",

                    ...piece.blocked
                };
            }


            /*
            NORMAL MOVEMENT.
            */

            if (
                piece.movement &&
                (
                    normalized.includes(
                        "move"
                    ) ||
                    normalized.includes(
                        "movement"
                    ) ||
                    normalized.includes(
                        "how does"
                    ) ||
                    normalized.includes(
                        "how do"
                    )
                )
            ) {

                return {
                    type:
                        "piece-movement",

                    piece:
                        pieceName,

                    ...piece.movement
                };
            }
        }


        return null;
    }


    /*
    ============================================================
    SEARCH A RULE COLLECTION
    ============================================================
    */

    function searchRuleCollection(
        question,
        collection,
        type
    ) {

        const normalized =
            normalizeQuestion(question);


        for (
            const [ruleName, rule]
            of Object.entries(collection)
        ) {

            if (!rule.keywords) {
                continue;
            }


            if (
                containsKeyword(
                    normalized,
                    rule.keywords
                )
            ) {

                return {
                    type,
                    rule:
                        ruleName,

                    ...rule
                };
            }
        }


        return null;
    }


    /*
    ============================================================
    PIECE VALUE QUESTIONS
    ============================================================
    */

    function getPieceValueRule(
        question
    ) {

        const normalized =
            normalizeQuestion(question);


        const asksValue =
            normalized.includes(
                "value"
            ) ||
            normalized.includes(
                "worth"
            ) ||
            normalized.includes(
                "points"
            );


        if (!asksValue) {
            return null;
        }


        for (
            const [pieceName, value]
            of Object.entries(pieceValues)
        ) {

            if (
                normalized.includes(
                    pieceName
                )
            ) {

                return {
                    type:
                        "piece-value",

                    piece:
                        pieceName,

                    ...value
                };
            }
        }


        return null;
    }


    /*
    ============================================================
    MAIN QUESTION HANDLER
    ============================================================
    */

    function answer(question) {

        if (
            !question ||
            typeof question !== "string"
        ) {
            return null;
        }


        /*
        --------------------------------------------------------
        1. PIECE-SPECIFIC QUESTIONS
        --------------------------------------------------------
        */

        const pieceRule =
            getPieceRule(question);

        if (pieceRule) {
            return pieceRule;
        }


        /*
        --------------------------------------------------------
        2. PIECE VALUES
        --------------------------------------------------------
        */

        const valueRule =
            getPieceValueRule(
                question
            );

        if (valueRule) {
            return valueRule;
        }


        /*
        --------------------------------------------------------
        3. SPECIAL RULES
        --------------------------------------------------------
        */

        const specialRule =
            searchRuleCollection(
                question,
                specialRules,
                "special-rule"
            );

        if (specialRule) {
            return specialRule;
        }


        /*
        --------------------------------------------------------
        4. GAME RULES
        --------------------------------------------------------
        */

        const gameRule =
            searchRuleCollection(
                question,
                gameRules,
                "game-rule"
            );

        if (gameRule) {
            return gameRule;
        }


        /*
        --------------------------------------------------------
        5. DRAW RULES
        --------------------------------------------------------
        */

        const drawRule =
            searchRuleCollection(
                question,
                drawRules,
                "draw-rule"
            );

        if (drawRule) {
            return drawRule;
        }


        /*
        --------------------------------------------------------
        6. TACTICS
        --------------------------------------------------------
        */

        const tacticalRule =
            searchRuleCollection(
                question,
                tacticalRules,
                "tactical-concept"
            );

        if (tacticalRule) {
            return tacticalRule;
        }


        /*
        --------------------------------------------------------
        7. PAWN STRUCTURE
        --------------------------------------------------------
        */

        const pawnRule =
            searchRuleCollection(
                question,
                pawnConcepts,
                "pawn-concept"
            );

        if (pawnRule) {
            return pawnRule;
        }


        /*
        --------------------------------------------------------
        8. OPENING PRINCIPLES
        --------------------------------------------------------
        */

        const openingRule =
            searchRuleCollection(
                question,
                openingRules,
                "opening-principle"
            );

        if (openingRule) {
            return openingRule;
        }


        /*
        --------------------------------------------------------
        9. ENDGAME CONCEPTS
        --------------------------------------------------------
        */

        const endgameRule =
            searchRuleCollection(
                question,
                endgameRules,
                "endgame-concept"
            );

        if (endgameRule) {
            return endgameRule;
        }


        /*
        --------------------------------------------------------
        10. STRATEGIC CONCEPTS
        --------------------------------------------------------
        */

        const strategicRule =
            searchRuleCollection(
                question,
                strategicRules,
                "strategic-concept"
            );

        if (strategicRule) {
            return strategicRule;
        }


        /*
        --------------------------------------------------------
        11. NOTATION
        --------------------------------------------------------
        */

        const notationRule =
            searchRuleCollection(
                question,
                notationRules,
                "notation"
            );

        if (notationRule) {
            return notationRule;
        }


        /*
        --------------------------------------------------------
        12. GENERAL CHESS QUESTIONS
        --------------------------------------------------------
        */

        const generalRule =
            searchRuleCollection(
                question,
                generalRules,
                "general-question"
            );

        if (generalRule) {
            return generalRule;
        }


        /*
        --------------------------------------------------------
        UNKNOWN QUESTION

        answerTeacherQuestion() may now pass
        this question to another system such
        as position analysis or AI fallback.
        --------------------------------------------------------
        */

        return null;
    }


    /*
    ============================================================
    PUBLIC API
    ============================================================
    */

    window.AzaChessTeacherRules = {

        answer,

        /*
        Expose structured data because later the
        lesson runner may need direct access.
        */

        pieceRules,
        specialRules,
        gameRules,
        drawRules,
        tacticalRules,
        strategicRules,
        pawnConcepts,
        openingRules,
        endgameRules,
        notationRules,
        pieceValues,
        generalRules
    };


})();
