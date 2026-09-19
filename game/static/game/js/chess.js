document.addEventListener("DOMContentLoaded", function () {
    /*
    ============================================================
    DOM ELEMENTS
    ============================================================
    */

    const chessboard = document.getElementById("chessboard");
    const turnDisplay = document.getElementById("turn-display");

    const capturedWhiteContainer =
        document.getElementById("captured-white");

    const capturedBlackContainer =
        document.getElementById("captured-black");

    const moveHistoryContainer =
        document.getElementById("move-history");

    const drawButton =
        document.getElementById("draw-button");

    const resignButton =
        document.getElementById("resign-button");

    const newGameButton =
        document.getElementById("new-game-button");

    const gameModal =
        document.getElementById("game-modal");

    const gameModalBackdrop =
        document.getElementById(
            "game-modal-backdrop"
        );

    const gameModalTitle =
        document.getElementById(
            "game-modal-title"
        );

    const gameModalMessage =
        document.getElementById(
            "game-modal-message"
        );

    const gameModalCancel =
        document.getElementById(
            "game-modal-cancel"
        );

    const gameModalConfirm =
        document.getElementById(
            "game-modal-confirm"
        );

    /*
    ============================================================
    ENGINE ANALYSIS ELEMENTS
    ============================================================
    */

    const engineEvaluation =
        document.getElementById(
            "engine-evaluation"
        );

    const engineBestMove =
        document.getElementById(
            "engine-best-move"
        );

    const engineMoveQuality =
        document.getElementById(
            "engine-move-quality"
        );

    const engineDepth =
        document.getElementById(
            "engine-depth"
        );

    const teacherMessage =
        document.getElementById(
            "teacher-message"
        );

    const teacherMicrophone =
        document.getElementById(
            "teacher-microphone"
        );


    const teacherLanguageSelect =
        document.getElementById(
            "teacher-language"
        );

    const savedTeacherLanguage =
        localStorage.getItem(
            "azachessTeacherLanguage"
        );

    let teacherLanguage =
        savedTeacherLanguage || "";
    
    let teacherAudio = null;

    /*
    ============================================================
    TEACHER GREETINGS
    ============================================================
    */

    function getTeacherGreeting(language) {
        const greetings = {
            "en-GB":
                "Hello! Welcome to AzaChess. " +
                "I will be your chess teacher.",

            "ru-RU":
                "Здравствуйте! Добро пожаловать в AzaChess. " +
                "Я буду вашим преподавателем по шахматам.",

            "kk-KZ":
                "Сәлем! AzaChess-ке қош келдіңіз. " +
                "Мен сіздің шахмат мұғаліміңіз боламын.",

            "sv-SE":
                "Hej! Välkommen till AzaChess. " +
                "Jag kommer att vara din schacklärare."
        };

        return (
            greetings[language] ||
            greetings["en-GB"]
        );
    }

    async function welcomeStudent() {
        if (!teacherMessage) {
            return;
        }

        /*
        No language has been selected yet.
        */

        if (!savedTeacherLanguage) {
            teacherMessage.textContent =
                "Welcome to AzaChess! " +
                "Please choose your language. " +
                "Выберите язык. " +
                "Тілді таңдаңыз. " +
                "Välj språk.";

            return;
        }

        /*
        Returning student.
        */

        teacherLanguage =
            savedTeacherLanguage;

        if (teacherLanguageSelect) {
            teacherLanguageSelect.value =
                teacherLanguage;
        }

        if (teacherRecognition) {
            teacherRecognition.lang =
                teacherLanguage;
        }

        const greeting =
            getTeacherGreeting(
                teacherLanguage
            );

        teacherMessage.textContent =
            greeting;

        await speakTeacherMessage(
            greeting
        );
    }


    /*
    ============================================================
    BOARD COORDINATES
    ============================================================
    */

    const boardFiles = [
        "A",
        "B",
        "C",
        "D",
        "E",
        "F",
        "G",
        "H"
    ];

    const boardRanks = [
        8,
        7,
        6,
        5,
        4,
        3,
        2,
        1
    ];


    /*
    ============================================================
    PIECES
    ============================================================
    */

    function createPiece(type, color) {
        return {
            type,
            color,
            hasMoved: false
        };
    }


    function createInitialBoard() {
        return [
            [
                createPiece("rook", "black"),
                createPiece("knight", "black"),
                createPiece("bishop", "black"),
                createPiece("queen", "black"),
                createPiece("king", "black"),
                createPiece("bishop", "black"),
                createPiece("knight", "black"),
                createPiece("rook", "black")
            ],
            [
                createPiece("pawn", "black"),
                createPiece("pawn", "black"),
                createPiece("pawn", "black"),
                createPiece("pawn", "black"),
                createPiece("pawn", "black"),
                createPiece("pawn", "black"),
                createPiece("pawn", "black"),
                createPiece("pawn", "black")
            ],
            [
                null, null, null, null,
                null, null, null, null
            ],
            [
                null, null, null, null,
                null, null, null, null
            ],
            [
                null, null, null, null,
                null, null, null, null
            ],
            [
                null, null, null, null,
                null, null, null, null
            ],
            [
                createPiece("pawn", "white"),
                createPiece("pawn", "white"),
                createPiece("pawn", "white"),
                createPiece("pawn", "white"),
                createPiece("pawn", "white"),
                createPiece("pawn", "white"),
                createPiece("pawn", "white"),
                createPiece("pawn", "white")
            ],
            [
                createPiece("rook", "white"),
                createPiece("knight", "white"),
                createPiece("bishop", "white"),
                createPiece("queen", "white"),
                createPiece("king", "white"),
                createPiece("bishop", "white"),
                createPiece("knight", "white"),
                createPiece("rook", "white")
            ]
        ];
    }


    /*
    ============================================================
    GAME STATE
    ============================================================
    */

    let board = createInitialBoard();

    let currentTurn = "white";

    let selectedSquare = null;

    let enPassantTarget = null;

    let halfMoveClock = 0;

    let gameOver = false;

    let lastMove = null;

    let previousEngineEvaluation = null;


    /*
    ============================================================
    TEACHER PLAY MODE
    ============================================================
    */

    let teacherPlayMode = false;

    const teacherColor = "black";
    const studentColor = "white";

    let teacherThinking = false;

    let pendingTeacherGameConfirmation = false;

    let pendingTeacherGameMode = "normal";

    let blindfoldMode = false;

    let announceTeacherMoves = false;

    let lastTeacherMoveDescription = "";


    /*
    Captured pieces.
    */

    let capturedWhitePieces = [];
    let capturedBlackPieces = [];


    /*
    Move history.

    Each element looks like:

    {
        moveNumber: 1,
        white: "e4",
        black: "e5"
    }
    */

    let moveHistory = [];

    let fullMoveNumber = 1;


    /*
    Threefold repetition.
    */

    const positionHistory = new Map();


    /*
    ============================================================
    PIECE IMAGE PATH
    ============================================================
    */

    function getPieceImagePath(piece) {
        return (
            `/static/game/images/pieces/` +
            `${piece.color}/${piece.type}.svg`
        );
    }


    /*
    ============================================================
    CREATE / RENDER BOARD
    ============================================================
    */

    function createBoard() {
        chessboard.innerHTML = "";

        let legalMoves = [];

        if (selectedSquare) {
            legalMoves = getLegalMoves(
                selectedSquare.row,
                selectedSquare.column
            );
        }

        for (let row = 0; row < 8; row++) {
            for (let column = 0; column < 8; column++) {
                const square =
                    document.createElement("div");

                square.classList.add("square");

                if ((row + column) % 2 === 0) {
                    square.classList.add("light");
                } else {
                    square.classList.add("dark");
                }

                square.dataset.row = row;
                square.dataset.column = column;


                /*
                Rank labels: 8 → 1
                */

                if (column === 0) {
                    square.dataset.rank =
                        boardRanks[row];
                }


                /*
                File labels: A → H
                */

                if (row === 7) {
                    square.dataset.file =
                        boardFiles[column];
                }


                /*
                Selected square.
                */

                if (
                    selectedSquare &&
                    selectedSquare.row === row &&
                    selectedSquare.column === column
                ) {
                    square.classList.add(
                        "selected"
                    );
                }


                /*
                Legal move highlights.
                */

                const possibleMove =
                    legalMoves.find(
                        move =>
                            move.row === row &&
                            move.column === column
                    );

                if (possibleMove) {
                    const targetPiece =
                        board[row][column];

                    if (
                        targetPiece ||
                        possibleMove.special ===
                            "enPassant"
                    ) {
                        square.classList.add(
                            "capture-move"
                        );
                    } else {
                        square.classList.add(
                            "legal-move"
                        );
                    }
                }


                /*
                Render SVG piece.
                */

                const piece =
                    board[row][column];

                if (piece) {
                    const image =
                        document.createElement("img");

                    image.src =
                        getPieceImagePath(piece);

                    image.alt =
                        `${piece.color} ${piece.type}`;

                    image.classList.add(
                        "piece-image"
                    );

                    image.draggable = false;

                    square.appendChild(image);
                }


                square.addEventListener(
                    "click",
                    handleSquareClick
                );

                chessboard.appendChild(square);
            }
        }
        drawLastMoveArrow();
    }


    /*
    ============================================================
    CLICK HANDLING
    ============================================================
    */

    function handleSquareClick(event) {
        if (gameOver) {
            return;
        }

        /*
        Do not allow the student to move
        the teacher's pieces.
        */

        if (
            teacherPlayMode &&
            (
                teacherThinking ||
                currentTurn === teacherColor
            )
        ) {
            return;
        }

        const row =
            Number(
                event.currentTarget.dataset.row
            );

        const column =
            Number(
                event.currentTarget.dataset.column
            );

        const clickedPiece =
            board[row][column];


        /*
        Nothing selected yet.
        */

        if (!selectedSquare) {
            if (
                clickedPiece &&
                clickedPiece.color ===
                    currentTurn
            ) {
                selectedSquare = {
                    row,
                    column
                };

                createBoard();
            }

            return;
        }


        /*
        Click the selected square again
        to deselect.
        */

        if (
            selectedSquare.row === row &&
            selectedSquare.column === column
        ) {
            selectedSquare = null;

            createBoard();

            return;
        }


        /*
        Select another friendly piece.
        */

        if (
            clickedPiece &&
            clickedPiece.color === currentTurn
        ) {
            selectedSquare = {
                row,
                column
            };

            createBoard();

            return;
        }


        /*
        Find whether destination is legal.
        */

        const legalMoves =
            getLegalMoves(
                selectedSquare.row,
                selectedSquare.column
            );

        const chosenMove =
            legalMoves.find(
                move =>
                    move.row === row &&
                    move.column === column
            );

        if (!chosenMove) {
            return;
        }


        /*
        Execute move.
        */

        makeMove(
            selectedSquare.row,
            selectedSquare.column,
            chosenMove
        );

        selectedSquare = null;

        createBoard();

        evaluateGameState();
    }


    /*
    ============================================================
    LEGAL MOVE GENERATION
    ============================================================
    */

    function getLegalMoves(row, column) {
        const piece =
            board[row][column];

        if (!piece) {
            return [];
        }

        const pseudoMoves =
            getPseudoLegalMoves(
                board,
                row,
                column,
                piece
            );

        return pseudoMoves.filter(
            move =>
                !wouldLeaveKingInCheck(
                    row,
                    column,
                    move,
                    piece.color
                )
        );
    }


    function getPseudoLegalMoves(
        boardState,
        row,
        column,
        piece
    ) {
        switch (piece.type) {
            case "pawn":
                return getPawnMoves(
                    boardState,
                    row,
                    column,
                    piece
                );

            case "rook":
                return getRookMoves(
                    boardState,
                    row,
                    column,
                    piece
                );

            case "knight":
                return getKnightMoves(
                    boardState,
                    row,
                    column,
                    piece
                );

            case "bishop":
                return getBishopMoves(
                    boardState,
                    row,
                    column,
                    piece
                );

            case "queen":
                return getQueenMoves(
                    boardState,
                    row,
                    column,
                    piece
                );

            case "king":
                return getKingMoves(
                    boardState,
                    row,
                    column,
                    piece
                );

            default:
                return [];
        }
    }


    /*
    ============================================================
    PAWN MOVEMENT
    ============================================================
    */

    function getPawnMoves(
        boardState,
        row,
        column,
        piece
    ) {
        const moves = [];

        const direction =
            piece.color === "white"
                ? -1
                : 1;

        const startingRow =
            piece.color === "white"
                ? 6
                : 1;

        const oneStepRow =
            row + direction;


        /*
        Move one square forward.
        */

        if (
            isInsideBoard(
                oneStepRow,
                column
            ) &&
            boardState[
                oneStepRow
            ][
                column
            ] === null
        ) {
            moves.push({
                row: oneStepRow,
                column
            });


            /*
            Move two squares from
            starting position.
            */

            const twoStepRow =
                row + direction * 2;

            if (
                row === startingRow &&
                boardState[
                    twoStepRow
                ][
                    column
                ] === null
            ) {
                moves.push({
                    row: twoStepRow,
                    column
                });
            }
        }


        /*
        Normal pawn captures.
        */

        for (const offset of [-1, 1]) {
            const captureRow =
                row + direction;

            const captureColumn =
                column + offset;

            if (
                !isInsideBoard(
                    captureRow,
                    captureColumn
                )
            ) {
                continue;
            }

            const target =
                boardState[
                    captureRow
                ][
                    captureColumn
                ];

            if (
                target &&
                target.color !== piece.color
            ) {
                moves.push({
                    row: captureRow,
                    column: captureColumn
                });
            }
        }


        /*
        En passant.
        */

        if (enPassantTarget) {
            if (
                enPassantTarget.color !==
                    piece.color &&
                row + direction ===
                    enPassantTarget.row &&
                Math.abs(
                    column -
                    enPassantTarget.column
                ) === 1
            ) {
                const capturedPawn =
                    boardState[
                        enPassantTarget.pawnRow
                    ][
                        enPassantTarget.pawnColumn
                    ];

                if (
                    capturedPawn &&
                    capturedPawn.type ===
                        "pawn" &&
                    capturedPawn.color !==
                        piece.color
                ) {
                    moves.push({
                        row:
                            enPassantTarget.row,

                        column:
                            enPassantTarget.column,

                        special:
                            "enPassant",

                        captureRow:
                            enPassantTarget.pawnRow,

                        captureColumn:
                            enPassantTarget.pawnColumn
                    });
                }
            }
        }

        return moves;
    }


    /*
    ============================================================
    ROOK MOVEMENT
    ============================================================
    */

    function getRookMoves(
        boardState,
        row,
        column,
        piece
    ) {
        return getSlidingMoves(
            boardState,
            row,
            column,
            piece,
            [
                [-1, 0],
                [1, 0],
                [0, -1],
                [0, 1]
            ]
        );
    }


    /*
    ============================================================
    BISHOP MOVEMENT
    ============================================================
    */

    function getBishopMoves(
        boardState,
        row,
        column,
        piece
    ) {
        return getSlidingMoves(
            boardState,
            row,
            column,
            piece,
            [
                [-1, -1],
                [-1, 1],
                [1, -1],
                [1, 1]
            ]
        );
    }


    /*
    ============================================================
    QUEEN MOVEMENT
    ============================================================
    */

    function getQueenMoves(
        boardState,
        row,
        column,
        piece
    ) {
        return getSlidingMoves(
            boardState,
            row,
            column,
            piece,
            [
                [-1, 0],
                [1, 0],
                [0, -1],
                [0, 1],
                [-1, -1],
                [-1, 1],
                [1, -1],
                [1, 1]
            ]
        );
    }


    /*
    ============================================================
    SLIDING PIECES
    ============================================================
    */

    function getSlidingMoves(
        boardState,
        row,
        column,
        piece,
        directions
    ) {
        const moves = [];

        for (
            const [
                rowDirection,
                columnDirection
            ] of directions
        ) {
            let newRow =
                row + rowDirection;

            let newColumn =
                column + columnDirection;

            while (
                isInsideBoard(
                    newRow,
                    newColumn
                )
            ) {
                const target =
                    boardState[
                        newRow
                    ][
                        newColumn
                    ];

                if (!target) {
                    moves.push({
                        row: newRow,
                        column: newColumn
                    });
                } else {
                    if (
                        target.color !==
                            piece.color
                    ) {
                        moves.push({
                            row: newRow,
                            column: newColumn
                        });
                    }

                    break;
                }

                newRow +=
                    rowDirection;

                newColumn +=
                    columnDirection;
            }
        }

        return moves;
    }


    /*
    ============================================================
    KNIGHT MOVEMENT
    ============================================================
    */

    function getKnightMoves(
        boardState,
        row,
        column,
        piece
    ) {
        const moves = [];

        const offsets = [
            [-2, -1],
            [-2, 1],
            [-1, -2],
            [-1, 2],
            [1, -2],
            [1, 2],
            [2, -1],
            [2, 1]
        ];

        for (
            const [
                rowOffset,
                columnOffset
            ] of offsets
        ) {
            const newRow =
                row + rowOffset;

            const newColumn =
                column + columnOffset;

            if (
                !isInsideBoard(
                    newRow,
                    newColumn
                )
            ) {
                continue;
            }

            const target =
                boardState[
                    newRow
                ][
                    newColumn
                ];

            if (
                !target ||
                target.color !== piece.color
            ) {
                moves.push({
                    row: newRow,
                    column: newColumn
                });
            }
        }

        return moves;
    }


    /*
    ============================================================
    KING MOVEMENT
    ============================================================
    */

    function getKingMoves(
        boardState,
        row,
        column,
        piece
    ) {
        const moves = [];

        for (
            let rowOffset = -1;
            rowOffset <= 1;
            rowOffset++
        ) {
            for (
                let columnOffset = -1;
                columnOffset <= 1;
                columnOffset++
            ) {
                if (
                    rowOffset === 0 &&
                    columnOffset === 0
                ) {
                    continue;
                }

                const newRow =
                    row + rowOffset;

                const newColumn =
                    column + columnOffset;

                if (
                    !isInsideBoard(
                        newRow,
                        newColumn
                    )
                ) {
                    continue;
                }

                const target =
                    boardState[
                        newRow
                    ][
                        newColumn
                    ];

                if (
                    !target ||
                    target.color !==
                        piece.color
                ) {
                    moves.push({
                        row: newRow,
                        column: newColumn
                    });
                }
            }
        }


        /*
        Castling.
        */

        if (boardState === board) {
            if (
                canCastle(
                    piece.color,
                    "kingSide"
                )
            ) {
                moves.push({
                    row,
                    column: 6,
                    special: "castle",
                    rookFromColumn: 7,
                    rookToColumn: 5
                });
            }

            if (
                canCastle(
                    piece.color,
                    "queenSide"
                )
            ) {
                moves.push({
                    row,
                    column: 2,
                    special: "castle",
                    rookFromColumn: 0,
                    rookToColumn: 3
                });
            }
        }

        return moves;
    }


    /*
    ============================================================
    CASTLING
    ============================================================
    */

    function canCastle(color, side) {
        const row =
            color === "white"
                ? 7
                : 0;

        const king =
            board[row][4];

        if (
            !king ||
            king.type !== "king" ||
            king.color !== color ||
            king.hasMoved
        ) {
            return false;
        }


        /*
        Cannot castle while in check.
        */

        if (
            isKingInCheck(
                board,
                color
            )
        ) {
            return false;
        }

        const enemy =
            oppositeColor(color);


        /*
        Kingside castle.
        */

        if (side === "kingSide") {
            const rook =
                board[row][7];

            if (
                !rook ||
                rook.type !== "rook" ||
                rook.color !== color ||
                rook.hasMoved
            ) {
                return false;
            }

            if (
                board[row][5] ||
                board[row][6]
            ) {
                return false;
            }

            if (
                isSquareAttacked(
                    board,
                    row,
                    5,
                    enemy
                ) ||
                isSquareAttacked(
                    board,
                    row,
                    6,
                    enemy
                )
            ) {
                return false;
            }

            return true;
        }


        /*
        Queenside castle.
        */

        if (side === "queenSide") {
            const rook =
                board[row][0];

            if (
                !rook ||
                rook.type !== "rook" ||
                rook.color !== color ||
                rook.hasMoved
            ) {
                return false;
            }

            if (
                board[row][1] ||
                board[row][2] ||
                board[row][3]
            ) {
                return false;
            }

            if (
                isSquareAttacked(
                    board,
                    row,
                    3,
                    enemy
                ) ||
                isSquareAttacked(
                    board,
                    row,
                    2,
                    enemy
                )
            ) {
                return false;
            }

            return true;
        }

        return false;
    }


    /*
    ============================================================
    KING SAFETY
    ============================================================
    */

    function wouldLeaveKingInCheck(
        fromRow,
        fromColumn,
        move,
        color
    ) {
        const temporaryBoard =
            cloneBoard(board);

        executeMoveOnBoard(
            temporaryBoard,
            fromRow,
            fromColumn,
            move
        );

        return isKingInCheck(
            temporaryBoard,
            color
        );
    }


    function isKingInCheck(
        boardState,
        color
    ) {
        const kingPosition =
            findKing(
                boardState,
                color
            );

        if (!kingPosition) {
            return true;
        }

        return isSquareAttacked(
            boardState,
            kingPosition.row,
            kingPosition.column,
            oppositeColor(color)
        );
    }


    function findKing(
        boardState,
        color
    ) {
        for (
            let row = 0;
            row < 8;
            row++
        ) {
            for (
                let column = 0;
                column < 8;
                column++
            ) {
                const piece =
                    boardState[
                        row
                    ][
                        column
                    ];

                if (
                    piece &&
                    piece.type === "king" &&
                    piece.color === color
                ) {
                    return {
                        row,
                        column
                    };
                }
            }
        }

        return null;
    }


    /*
    ============================================================
    ATTACK DETECTION
    ============================================================
    */

    function isSquareAttacked(
        boardState,
        row,
        column,
        attackingColor
    ) {
        /*
        Pawn attacks.
        */

        const pawnDirection =
            attackingColor === "white"
                ? -1
                : 1;

        const pawnSourceRow =
            row - pawnDirection;

        for (const offset of [-1, 1]) {
            const pawnColumn =
                column + offset;

            if (
                !isInsideBoard(
                    pawnSourceRow,
                    pawnColumn
                )
            ) {
                continue;
            }

            const piece =
                boardState[
                    pawnSourceRow
                ][
                    pawnColumn
                ];

            if (
                piece &&
                piece.color ===
                    attackingColor &&
                piece.type === "pawn"
            ) {
                return true;
            }
        }


        /*
        Knight attacks.
        */

        const knightOffsets = [
            [-2, -1],
            [-2, 1],
            [-1, -2],
            [-1, 2],
            [1, -2],
            [1, 2],
            [2, -1],
            [2, 1]
        ];

        for (
            const [
                rowOffset,
                columnOffset
            ] of knightOffsets
        ) {
            const sourceRow =
                row + rowOffset;

            const sourceColumn =
                column + columnOffset;

            if (
                !isInsideBoard(
                    sourceRow,
                    sourceColumn
                )
            ) {
                continue;
            }

            const piece =
                boardState[
                    sourceRow
                ][
                    sourceColumn
                ];

            if (
                piece &&
                piece.color ===
                    attackingColor &&
                piece.type === "knight"
            ) {
                return true;
            }
        }


        /*
        King attacks.
        */

        for (
            let rowOffset = -1;
            rowOffset <= 1;
            rowOffset++
        ) {
            for (
                let columnOffset = -1;
                columnOffset <= 1;
                columnOffset++
            ) {
                if (
                    rowOffset === 0 &&
                    columnOffset === 0
                ) {
                    continue;
                }

                const sourceRow =
                    row + rowOffset;

                const sourceColumn =
                    column + columnOffset;

                if (
                    !isInsideBoard(
                        sourceRow,
                        sourceColumn
                    )
                ) {
                    continue;
                }

                const piece =
                    boardState[
                        sourceRow
                    ][
                        sourceColumn
                    ];

                if (
                    piece &&
                    piece.color ===
                        attackingColor &&
                    piece.type === "king"
                ) {
                    return true;
                }
            }
        }


        /*
        Rook and Queen straight attacks.
        */

        if (
            hasSlidingAttack(
                boardState,
                row,
                column,
                attackingColor,
                [
                    [-1, 0],
                    [1, 0],
                    [0, -1],
                    [0, 1]
                ],
                [
                    "rook",
                    "queen"
                ]
            )
        ) {
            return true;
        }


        /*
        Bishop and Queen diagonal attacks.
        */

        if (
            hasSlidingAttack(
                boardState,
                row,
                column,
                attackingColor,
                [
                    [-1, -1],
                    [-1, 1],
                    [1, -1],
                    [1, 1]
                ],
                [
                    "bishop",
                    "queen"
                ]
            )
        ) {
            return true;
        }

        return false;
    }


    function hasSlidingAttack(
        boardState,
        row,
        column,
        attackingColor,
        directions,
        allowedTypes
    ) {
        for (
            const [
                rowDirection,
                columnDirection
            ] of directions
        ) {
            let newRow =
                row + rowDirection;

            let newColumn =
                column +
                columnDirection;

            while (
                isInsideBoard(
                    newRow,
                    newColumn
                )
            ) {
                const piece =
                    boardState[
                        newRow
                    ][
                        newColumn
                    ];

                if (!piece) {
                    newRow +=
                        rowDirection;

                    newColumn +=
                        columnDirection;

                    continue;
                }

                if (
                    piece.color ===
                        attackingColor &&
                    allowedTypes.includes(
                        piece.type
                    )
                ) {
                    return true;
                }

                break;
            }
        }

        return false;
    }


    /*
    ============================================================
    EXECUTE REAL MOVE
    ============================================================
    */

    function makeMove(
        fromRow,
        fromColumn,
        move,
        promotionOverride = null
    ) {
        const piece =
            board[fromRow][fromColumn];

        if (!piece) {
            return;
        }

        const movingColor =
            piece.color;

        const originalPieceType =
            piece.type;

        let capturedPiece =
            board[
                move.row
            ][
                move.column
            ];


        /*
        En passant capture.
        */

        if (
            move.special ===
                "enPassant"
        ) {
            capturedPiece =
                board[
                    move.captureRow
                ][
                    move.captureColumn
                ];

            board[
                move.captureRow
            ][
                move.captureColumn
            ] = null;
        }


        /*
        Track captured pieces.
        */

        if (capturedPiece) {
            const capturedCopy = {
                type:
                    capturedPiece.type,

                color:
                    capturedPiece.color
            };

            if (
                capturedPiece.color ===
                    "white"
            ) {
                capturedWhitePieces.push(
                    capturedCopy
                );
            } else {
                capturedBlackPieces.push(
                    capturedCopy
                );
            }
        }


        /*
        50 move counter.
        */

        if (
            originalPieceType ===
                "pawn" ||
            capturedPiece
        ) {
            halfMoveClock = 0;
        } else {
            halfMoveClock++;
        }


        /*
        Move piece.
        */

        board[
            move.row
        ][
            move.column
        ] = piece;

        board[
            fromRow
        ][
            fromColumn
        ] = null;


        /*
        Castling rook movement.
        */

        if (
            move.special ===
                "castle"
        ) {
            const rook =
                board[
                    move.row
                ][
                    move.rookFromColumn
                ];

            board[
                move.row
            ][
                move.rookToColumn
            ] = rook;

            board[
                move.row
            ][
                move.rookFromColumn
            ] = null;

            if (rook) {
                rook.hasMoved = true;
            }
        }


        piece.hasMoved = true;


        /*
        Promotion.
        */

        let promotionPiece = null;

        if (
            originalPieceType === "pawn" &&
            (
                move.row === 0 ||
                move.row === 7
            )
        ) {
        promotionPiece =
            promotionOverride ||
            choosePromotionPiece();

            piece.type =
                promotionPiece;
        }


        /*
        Save previous en passant status.
        */

        enPassantTarget = null;


        /*
        Create new en passant target
        if pawn moved two squares.
        */

        if (
            originalPieceType === "pawn" &&
            Math.abs(
                move.row - fromRow
            ) === 2
        ) {
            enPassantTarget = {
                row:
                    (
                        move.row +
                        fromRow
                    ) / 2,

                column:
                    move.column,

                pawnRow:
                    move.row,

                pawnColumn:
                    move.column,

                color:
                    movingColor
            };
        }


        /*
        Store move for highlighting.
        */

        lastMove = {
            fromRow,
            fromColumn,
            toRow: move.row,
            toColumn: move.column
        };


        /*
        Change turn before determining
        check or checkmate notation.
        */

        currentTurn =
            oppositeColor(
                currentTurn
            );


        /*
        Generate notation.
        */

        let notation =
            createMoveNotation({
                originalPieceType,
                movingColor,
                fromRow,
                fromColumn,
                move,
                capturedPiece,
                promotionPiece
            });


        /*
        Add + or #.
        */

        const opponentInCheck =
            isKingInCheck(
                board,
                currentTurn
            );

        const opponentHasMove =
            playerHasLegalMove(
                currentTurn
            );

        if (
            opponentInCheck &&
            !opponentHasMove
        ) {
            notation += "#";
        } else if (opponentInCheck) {
            notation += "+";
        }


        /*
        Save move history.
        */

        addMoveToHistory(
            movingColor,
            notation
        );


        /*
        Position history.
        */

        recordPosition();


        /*
        Update UI.
        */

        updateTurnDisplay();

        renderCapturedPieces();

        renderMoveHistory();

        /*
        Ask Stockfish to analyse
        the position after this move.
        */

        analyseWithStockfish();
    }


    /*
    ============================================================
    TEMPORARY MOVE
    Used to check king safety.
    ============================================================
    */

    function executeMoveOnBoard(
        boardState,
        fromRow,
        fromColumn,
        move
    ) {
        const piece =
            boardState[
                fromRow
            ][
                fromColumn
            ];

        boardState[
            move.row
        ][
            move.column
        ] = piece;

        boardState[
            fromRow
        ][
            fromColumn
        ] = null;


        if (
            move.special ===
                "enPassant"
        ) {
            boardState[
                move.captureRow
            ][
                move.captureColumn
            ] = null;
        }


        if (
            move.special ===
                "castle"
        ) {
            const rook =
                boardState[
                    move.row
                ][
                    move.rookFromColumn
                ];

            boardState[
                move.row
            ][
                move.rookToColumn
            ] = rook;

            boardState[
                move.row
            ][
                move.rookFromColumn
            ] = null;
        }
    }


    /*
    ============================================================
    PAWN PROMOTION
    ============================================================
    */

    function choosePromotionPiece() {
        const answer =
            window.prompt(
                "Promote pawn to queen, rook, bishop or knight:",
                "queen"
            );

        if (!answer) {
            return "queen";
        }

        const value =
            answer
                .trim()
                .toLowerCase();

        const options = {
            q: "queen",
            queen: "queen",

            r: "rook",
            rook: "rook",

            b: "bishop",
            bishop: "bishop",

            n: "knight",
            knight: "knight"
        };

        return (
            options[value] ||
            "queen"
        );
    }


    /*
    ============================================================
    MOVE NOTATION
    ============================================================
    */

    function getSquareName(
        row,
        column
    ) {
        const files = [
            "a",
            "b",
            "c",
            "d",
            "e",
            "f",
            "g",
            "h"
        ];

        const rank =
            8 - row;

        return (
            `${files[column]}${rank}`
        );
    }


    function getPieceLetter(type) {
        const letters = {
            king: "K",
            queen: "Q",
            rook: "R",
            bishop: "B",
            knight: "N",
            pawn: ""
        };

        return (
            letters[type] || ""
        );
    }

    function drawLastMoveArrow() {
        if (!lastMove) {
            return;
        }

        const svgNamespace =
            "http://www.w3.org/2000/svg";

        const svg =
            document.createElementNS(
                svgNamespace,
                "svg"
            );

        svg.classList.add("move-arrow");

        svg.setAttribute(
            "viewBox",
            "0 0 800 800"
        );

        svg.setAttribute(
            "preserveAspectRatio",
            "none"
        );

        /*
        Each chess square is represented
        as 100 x 100 inside the SVG.
        */

        const startX =
            lastMove.fromColumn * 100 + 50;

        const startY =
            lastMove.fromRow * 100 + 50;

        const targetX =
            lastMove.toColumn * 100 + 50;

        const targetY =
            lastMove.toRow * 100 + 50;


        /*
        Calculate direction.
        */

        const deltaX =
            targetX - startX;

        const deltaY =
            targetY - startY;

        const distance =
            Math.sqrt(
                deltaX * deltaX +
                deltaY * deltaY
            );

        if (distance === 0) {
            return;
        }

        const unitX =
            deltaX / distance;

        const unitY =
            deltaY / distance;


        /*
        Shorten arrow so the arrowhead
        finishes nicely inside the square.
        */

        const endX =
            targetX - unitX * 28;

        const endY =
            targetY - unitY * 28;


        /*
        Arrow line.
        */

        const line =
            document.createElementNS(
                svgNamespace,
                "line"
            );

        line.setAttribute("x1", startX);
        line.setAttribute("y1", startY);

        line.setAttribute("x2", endX);
        line.setAttribute("y2", endY);

        line.classList.add(
            "move-arrow-line"
        );


        /*
        Arrow head.
        */

        const arrowLength = 34;
        const arrowWidth = 25;

        const tipX = targetX;
        const tipY = targetY;

        const baseX =
            targetX -
            unitX * arrowLength;

        const baseY =
            targetY -
            unitY * arrowLength;

        const perpendicularX =
            -unitY;

        const perpendicularY =
            unitX;

        const leftX =
            baseX +
            perpendicularX *
            arrowWidth;

        const leftY =
            baseY +
            perpendicularY *
            arrowWidth;

        const rightX =
            baseX -
            perpendicularX *
            arrowWidth;

        const rightY =
            baseY -
            perpendicularY *
            arrowWidth;

        const arrowHead =
            document.createElementNS(
                svgNamespace,
                "polygon"
            );

        arrowHead.setAttribute(
            "points",
            `${tipX},${tipY} ` +
            `${leftX},${leftY} ` +
            `${rightX},${rightY}`
        );

        arrowHead.classList.add(
            "move-arrow-head"
        );


        svg.appendChild(line);
        svg.appendChild(arrowHead);

        chessboard.appendChild(svg);
    }

    /*
    ============================================================
    STOCKFISH RECOMMENDATION ARROW
    ============================================================
    */

    function drawEngineArrow(bestMove) {
        /*
        Remove previous engine arrow.
        */
        const oldArrow =
            chessboard.querySelector(".engine-arrow");

        if (oldArrow) {
            oldArrow.remove();
        }

        if (!bestMove || bestMove.length < 4) {
            return;
        }

        /*
        Stockfish gives moves such as:
        e2e4
        g8f6
        */
        const fromFile = bestMove[0];
        const fromRank = parseInt(bestMove[1], 10);

        const toFile = bestMove[2];
        const toRank = parseInt(bestMove[3], 10);

        const fromColumn =
            boardFiles.indexOf(
                fromFile.toUpperCase()
            );

        const toColumn =
            boardFiles.indexOf(
                toFile.toUpperCase()
            );

        const fromRow = 8 - fromRank;
        const toRow = 8 - toRank;

        if (
            fromColumn === -1 ||
            toColumn === -1
        ) {
            return;
        }

        const svgNamespace =
            "http://www.w3.org/2000/svg";

        const svg =
            document.createElementNS(
                svgNamespace,
                "svg"
            );

        svg.classList.add(
            "move-arrow",
            "engine-arrow"
        );

        svg.setAttribute(
            "viewBox",
            "0 0 800 800"
        );

        svg.setAttribute(
            "preserveAspectRatio",
            "none"
        );

        const startX =
            fromColumn * 100 + 50;

        const startY =
            fromRow * 100 + 50;

        const targetX =
            toColumn * 100 + 50;

        const targetY =
            toRow * 100 + 50;

        const deltaX =
            targetX - startX;

        const deltaY =
            targetY - startY;

        const distance =
            Math.sqrt(
                deltaX * deltaX +
                deltaY * deltaY
            );

        if (distance === 0) {
            return;
        }

        const unitX =
            deltaX / distance;

        const unitY =
            deltaY / distance;

        const endX =
            targetX - unitX * 28;

        const endY =
            targetY - unitY * 28;


        /*
        Arrow line.
        */

        const line =
            document.createElementNS(
                svgNamespace,
                "line"
            );

        line.setAttribute("x1", startX);
        line.setAttribute("y1", startY);
        line.setAttribute("x2", endX);
        line.setAttribute("y2", endY);

        line.classList.add(
            "engine-arrow-line"
        );


        /*
        Arrow head.
        */

        const arrowLength = 34;
        const arrowWidth = 25;

        const baseX =
            targetX -
            unitX * arrowLength;

        const baseY =
            targetY -
            unitY * arrowLength;

        const perpendicularX = -unitY;
        const perpendicularY = unitX;

        const leftX =
            baseX +
            perpendicularX * arrowWidth;

        const leftY =
            baseY +
            perpendicularY * arrowWidth;

        const rightX =
            baseX -
            perpendicularX * arrowWidth;

        const rightY =
            baseY -
            perpendicularY * arrowWidth;

        const arrowHead =
            document.createElementNS(
                svgNamespace,
                "polygon"
            );

        arrowHead.setAttribute(
            "points",
            `${targetX},${targetY} ` +
            `${leftX},${leftY} ` +
            `${rightX},${rightY}`
        );

        arrowHead.classList.add(
            "engine-arrow-head"
        );

        svg.appendChild(line);
        svg.appendChild(arrowHead);

        chessboard.appendChild(svg);
    }


    /*
    ============================================================
    TEACHER RECOMMENDATION ARROW
    ============================================================
    */

    function drawTeacherArrow(bestMove) {
        /*
        Remove previous teacher arrow.
        */

        const oldArrow =
            chessboard.querySelector(
                ".teacher-arrow"
            );

        if (oldArrow) {
            oldArrow.remove();
        }

        if (!bestMove || bestMove.length < 4) {
            return;
        }


        /*
        Convert Stockfish UCI notation,
        for example e2e4, into board coordinates.
        */

        const fromFile = bestMove[0];
        const fromRank =
            parseInt(bestMove[1], 10);

        const toFile = bestMove[2];
        const toRank =
            parseInt(bestMove[3], 10);

        const fromColumn =
            boardFiles.indexOf(
                fromFile.toUpperCase()
            );

        const toColumn =
            boardFiles.indexOf(
                toFile.toUpperCase()
            );

        const fromRow =
            8 - fromRank;

        const toRow =
            8 - toRank;

        if (
            fromColumn === -1 ||
            toColumn === -1
        ) {
            return;
        }


        /*
        Create SVG overlay.
        */

        const svgNamespace =
            "http://www.w3.org/2000/svg";

        const svg =
            document.createElementNS(
                svgNamespace,
                "svg"
            );

        svg.classList.add(
            "move-arrow",
            "teacher-arrow"
        );

        svg.setAttribute(
            "viewBox",
            "0 0 800 800"
        );

        svg.setAttribute(
            "preserveAspectRatio",
            "none"
        );


        /*
        Calculate square centres.
        */

        const startX =
            fromColumn * 100 + 50;

        const startY =
            fromRow * 100 + 50;

        const targetX =
            toColumn * 100 + 50;

        const targetY =
            toRow * 100 + 50;

        const deltaX =
            targetX - startX;

        const deltaY =
            targetY - startY;

        const distance =
            Math.sqrt(
                deltaX * deltaX +
                deltaY * deltaY
            );

        if (distance === 0) {
            return;
        }

        const unitX =
            deltaX / distance;

        const unitY =
            deltaY / distance;


        /*
        Stop the line before the arrowhead.
        */

        const endX =
            targetX - unitX * 28;

        const endY =
            targetY - unitY * 28;


        /*
        Arrow line.
        */

        const line =
            document.createElementNS(
                svgNamespace,
                "line"
            );

        line.setAttribute(
            "x1",
            startX
        );

        line.setAttribute(
            "y1",
            startY
        );

        line.setAttribute(
            "x2",
            endX
        );

        line.setAttribute(
            "y2",
            endY
        );

        line.classList.add(
            "teacher-arrow-line"
        );


        /*
        Arrow head.
        */

        const arrowLength = 34;
        const arrowWidth = 25;

        const baseX =
            targetX -
            unitX * arrowLength;

        const baseY =
            targetY -
            unitY * arrowLength;

        const perpendicularX =
            -unitY;

        const perpendicularY =
            unitX;

        const leftX =
            baseX +
            perpendicularX * arrowWidth;

        const leftY =
            baseY +
            perpendicularY * arrowWidth;

        const rightX =
            baseX -
            perpendicularX * arrowWidth;

        const rightY =
            baseY -
            perpendicularY * arrowWidth;

        const arrowHead =
            document.createElementNS(
                svgNamespace,
                "polygon"
            );

        arrowHead.setAttribute(
            "points",
            `${targetX},${targetY} ` +
            `${leftX},${leftY} ` +
            `${rightX},${rightY}`
        );

        arrowHead.classList.add(
            "teacher-arrow-head"
        );

        svg.appendChild(line);
        svg.appendChild(arrowHead);

        chessboard.appendChild(svg);
    }

        function createMoveNotation({
            originalPieceType,
            fromRow,
            fromColumn,
            move,
            capturedPiece,
            promotionPiece
        }) {
            /*
            Castling.
            */

            if (
                move.special ===
                    "castle"
            ) {
                if (move.column === 6) {
                    return "O-O";
                }

                return "O-O-O";
            }


            const destination =
                getSquareName(
                    move.row,
                    move.column
                );

            const isCapture =
                Boolean(
                    capturedPiece
                ) ||
                move.special ===
                    "enPassant";


            /*
            Pawn notation.
            */

            if (
                originalPieceType ===
                    "pawn"
            ) {
                let notation = "";

                if (isCapture) {
                    const fromFile =
                        getSquareName(
                            fromRow,
                            fromColumn
                        )[0];

                    notation +=
                        `${fromFile}x`;
                }

                notation += destination;

                if (promotionPiece) {
                    notation +=
                        "=" +
                        getPieceLetter(
                            promotionPiece
                        );
                }

                return notation;
            }


            /*
            Other pieces.
            */

            const pieceLetter =
                getPieceLetter(
                    originalPieceType
                );

            return (
                pieceLetter +
                (isCapture ? "x" : "") +
                destination
            );
        }

    /*
    ============================================================
    TEACHER BOARD DEMONSTRATION
    ============================================================
    */

    function teacherSleep(milliseconds) {
        return new Promise(resolve => {
            setTimeout(resolve, milliseconds);
        });
    }


    function teacherUciToCoordinates(uciMove) {
        if (!uciMove || uciMove.length < 4) {
            return null;
        }

        const fromFile =
            uciMove[0].toUpperCase();

        const fromRank =
            parseInt(uciMove[1], 10);

        const toFile =
            uciMove[2].toUpperCase();

        const toRank =
            parseInt(uciMove[3], 10);

        const fromColumn =
            boardFiles.indexOf(fromFile);

        const toColumn =
            boardFiles.indexOf(toFile);

        if (
            fromColumn === -1 ||
            toColumn === -1 ||
            Number.isNaN(fromRank) ||
            Number.isNaN(toRank)
        ) {
            return null;
        }

        return {
            fromRow: 8 - fromRank,
            fromColumn,
            toRow: 8 - toRank,
            toColumn,
            promotion:
                uciMove.length >= 5
                    ? uciMove[4].toLowerCase()
                    : null
        };
    }


    function getTeacherMove(uciMove) {
        const coordinates =
            teacherUciToCoordinates(
                uciMove
            );

        if (!coordinates) {
            return null;
        }

        const {
            fromRow,
            fromColumn,
            toRow,
            toColumn
        } = coordinates;

        const piece =
            board[fromRow][fromColumn];

        if (!piece) {
            console.warn(
                "Teacher cannot find piece:",
                uciMove
            );

            return null;
        }

        /*
        Use the real legal-move generator so
        castling and en passant still work.
        */

        const legalMoves =
            getLegalMoves(
                fromRow,
                fromColumn
            );

        const move =
            legalMoves.find(
                candidate =>
                    candidate.row === toRow &&
                    candidate.column === toColumn
            );

        if (!move) {
            console.warn(
                "Teacher move is not legal:",
                uciMove
            );

            return null;
        }

        return {
            coordinates,
            piece,
            move
        };
    }


    /*
    ============================================================
    TEACHER PLAYS A REAL GAME MOVE
    ============================================================
    */

    async function playTeacherGameMove(
        uciMove
    ) {
        if (
            !teacherPlayMode ||
            teacherThinking ||
            gameOver ||
            currentTurn !== teacherColor
        ) {
            return false;
        }

        teacherThinking = true;

        if (teacherMessage) {
            teacherMessage.textContent =
                "Let me think...";
        }

        /*
        Small pause so the teacher does not
        move instantly like a machine.
        */

        await teacherSleep(700);

        const teacherMove =
            getTeacherMove(
                uciMove
            );

        if (!teacherMove) {
            console.warn(
                "Teacher could not play:",
                uciMove
            );

            teacherThinking = false;

            return false;
        }

        const {
            coordinates,
            move
        } = teacherMove;

        const {
            fromRow,
            fromColumn
        } = coordinates;

        /*
        Handle Stockfish promotion notation:
        e7e8q
        */

        const promotionMap = {
            q: "queen",
            r: "rook",
            b: "bishop",
            n: "knight"
        };

        const promotionChoice =
            coordinates.promotion
                ? (
                    promotionMap[
                        coordinates.promotion
                    ] || "queen"
                )
                : null;



        const teacherPieceType =
            teacherMove.piece.type;

        const wasCapture =
            Boolean(
                board[
                    move.row
                ][
                    move.column
                ]
            ) ||
            move.special === "enPassant";

        const wasCastle =
            move.special === "castle";

        /*
        IMPORTANT:
        This is a REAL game move.
        We deliberately use makeMove().
        */

        makeMove(
            fromRow,
            fromColumn,
            move,
            promotionChoice
        );

        selectedSquare = null;

        createBoard();

        evaluateGameState();

        /*
        ============================================================
        TEACHER MOVE ANNOUNCEMENT
        ============================================================
        */

        if (!gameOver) {

            const toSquare =
                uciMove.slice(
                    2,
                    4
                );

            let moveDescription = "";

            if (wasCastle) {

                moveDescription =
                    move.column === 6
                        ? "I castle kingside."
                        : "I castle queenside.";

            } else {

                const action =
                    wasCapture
                        ? "takes"
                        : "to";

                moveDescription =
                    `I play ${teacherPieceType} ` +
                    `${action} ${toSquare}.`;

                if (promotionChoice) {
                    moveDescription +=
                        ` I promote to ${promotionChoice}.`;
                }
            }

            lastTeacherMoveDescription =
                moveDescription;

            if (teacherMessage) {
                teacherMessage.textContent =
                    announceTeacherMoves ||
                    blindfoldMode
                        ? (
                            moveDescription +
                            " Your turn."
                        )
                        : "Your turn.";
            }

            if (
                blindfoldMode ||
                announceTeacherMoves
            ) {
                await speakTeacherMessage(
                    moveDescription +
                    " Your turn."
                );
            }
        }

        teacherThinking = false;

        return true;
    }


    /*
    ============================================================
    START GAME AGAINST TEACHER
    ============================================================
    */

    async function startTeacherGame(
        playBlindfold = false
    ) {
        teacherPlayMode = true;

        teacherThinking = false;

        blindfoldMode =
            playBlindfold;

        /*
        In blindfold mode the teacher must
        announce its moves automatically.
        */

        announceTeacherMoves =
            playBlindfold;

        pendingTeacherGameConfirmation =
            false;

        pendingTeacherGameMode =
            "normal";

        lastTeacherMoveDescription =
            "";

        await startNewGame(
            true
        );

        previousEngineEvaluation =
            null;

        clearTeacherAttackSquares();

        let message;

        if (blindfoldMode) {
            message =
                "Blindfold game started. " +
                "You are White and I am Black. " +
                "Say your moves to me, for example, knight f3.";
        } else {
            message =
                "Okay. You are White and I am Black. " +
                "Make your first move.";
        }

        if (teacherMessage) {
            teacherMessage.textContent =
                message;
        }

        await speakTeacherMessage(
            message
        );

        analyseWithStockfish(
            false
        );
    }


    function getSpokenChessSquares(
        text
    ) {
        let normalized =
            text.toLowerCase();

        const numberWords = {
            one: "1",
            two: "2",
            three: "3",
            four: "4",
            five: "5",
            six: "6",
            seven: "7",
            eight: "8"
        };

        Object.entries(
            numberWords
        ).forEach(
            ([word, number]) => {
                normalized =
                    normalized.replace(
                        new RegExp(
                            `\\b${word}\\b`,
                            "g"
                        ),
                        number
                    );
            }
        );

        /*
        Speech recognition may return:
        "f 3"
        instead of:
        "f3"
        */

        normalized =
            normalized.replace(
                /\b([a-h])\s+([1-8])\b/g,
                "$1$2"
            );

        return (
            normalized.match(
                /\b[a-h][1-8]\b/g
            ) || []
        );
    }


    function getSpokenPieceType(
        text
    ) {
        const value =
            text.toLowerCase();

        if (
            value.includes("knight") ||
            value.includes("night") ||
            value.includes("horse")
        ) {
            return "knight";
        }

        if (value.includes("bishop")) {
            return "bishop";
        }

        if (value.includes("rook")) {
            return "rook";
        }

        if (value.includes("queen")) {
            return "queen";
        }

        if (value.includes("king")) {
            return "king";
        }

        if (
            value.includes("pawn") ||
            value.includes("plan")
        ) {
            return "pawn";
        }

        /*
        If only a square was spoken,
        for example "e4",
        assume a pawn move.
        */

        return null;
    }


    function tryBlindfoldStudentMove(
        question
    ) {
        if (
            !blindfoldMode ||
            !teacherPlayMode ||
            gameOver ||
            currentTurn !== studentColor
        ) {
            return {
                handled: false,
                answer: null
            };
        }

        /*
        Castling.
        */

        if (
            question.includes("castle")
        ) {
            const kingColumn = 4;

            const kingRow =
                studentColor === "white"
                    ? 7
                    : 0;

            const legalMoves =
                getLegalMoves(
                    kingRow,
                    kingColumn
                );

            let castleMove = null;

            if (
                question.includes("queen")
            ) {
                castleMove =
                    legalMoves.find(
                        move =>
                            move.special ===
                                "castle" &&
                            move.column === 2
                    );
            } else {
                castleMove =
                    legalMoves.find(
                        move =>
                            move.special ===
                                "castle" &&
                            move.column === 6
                    );
            }

            if (!castleMove) {
                return {
                    handled: true,
                    answer:
                        "You cannot castle there."
                };
            }

            makeMove(
                kingRow,
                kingColumn,
                castleMove
            );

            selectedSquare = null;

            createBoard();

            evaluateGameState();

            return {
                handled: true,
                answer: null
            };
        }


        const squares =
            getSpokenChessSquares(
                question
            );

        if (squares.length === 0) {
            return {
                handled: false,
                answer: null
            };
        }

        const destination =
            squares[
                squares.length - 1
            ];

        const destinationCoordinates =
            teacherSquareToCoordinates(
                destination
            );

        if (!destinationCoordinates) {
            return {
                handled: true,
                answer:
                    "I could not understand the destination square."
            };
        }

        const requestedPieceType =
            getSpokenPieceType(
                question
            );

        /*
        "e4" without a piece name
        normally means a pawn move.
        */

        const pieceType =
            requestedPieceType ||
            "pawn";

        let requestedSource = null;

        if (squares.length >= 2) {
            requestedSource =
                teacherSquareToCoordinates(
                    squares[0]
                );
        }

        const candidates = [];

        for (
            let row = 0;
            row < 8;
            row++
        ) {
            for (
                let column = 0;
                column < 8;
                column++
            ) {
                const piece =
                    board[row][column];

                if (
                    !piece ||
                    piece.color !== studentColor ||
                    piece.type !== pieceType
                ) {
                    continue;
                }

                if (
                    requestedSource &&
                    (
                        row !==
                            requestedSource.row ||
                        column !==
                            requestedSource.column
                    )
                ) {
                    continue;
                }

                const legalMoves =
                    getLegalMoves(
                        row,
                        column
                    );

                const matchingMove =
                    legalMoves.find(
                        move =>
                            move.row ===
                                destinationCoordinates.row &&
                            move.column ===
                                destinationCoordinates.column
                    );

                if (matchingMove) {
                    candidates.push({
                        row,
                        column,
                        move:
                            matchingMove
                    });
                }
            }
        }

        if (candidates.length === 0) {
            return {
                handled: true,
                answer:
                    `I cannot make ${pieceType} to ${destination}.`
            };
        }

        if (candidates.length > 1) {
            return {
                handled: true,
                answer:
                    "More than one piece can move there. " +
                    "Please also say the starting square."
            };
        }

        const candidate =
            candidates[0];

        makeMove(
            candidate.row,
            candidate.column,
            candidate.move
        );

        selectedSquare = null;

        createBoard();

        evaluateGameState();

        if (teacherMessage) {
            teacherMessage.textContent =
                `Move accepted: ${pieceType} ${destination}.`;
        }

        return {
            handled: true,
            answer: null
        };
    }

    /*
    ============================================================
    TEACHER EXPLANATION API
    ============================================================

    Functions from chess.js that teacher-explanations.js
    is allowed to use.
    */

    window.AzaChessTeacherAPI = {
        teacherUciToCoordinates,
        getTeacherPieceName,
        getSquareName,
        cloneBoard,
        canCastle,
        getTeacherControlledSquares,

        getBoard() {
            return board;
        },

        setBoard(newBoard) {
            board = newBoard;
        }
    };

    /*
    ============================================================
    TEACHER PIECE NAME
    ============================================================
    */

    function getTeacherPieceName(piece) {
        if (!piece) {
            return "piece";
        }

        const names = {
            pawn: "pawn",
            knight: "knight",
            bishop: "bishop",
            rook: "rook",
            queen: "queen",
            king: "king"
        };

        return (
            names[piece.type] ||
            "piece"
        );
    }


    /*
    ============================================================
    TEACHER ATTACKED SQUARES
    ============================================================
    */

    function clearTeacherAttackSquares() {
        chessboard
            .querySelectorAll(
                ".teacher-control-marker, " +
                ".teacher-attack-marker"
            )
            .forEach(marker => {
                marker.remove();
            });

        chessboard
            .querySelectorAll(
                ".teacher-attacked-square, " +
                ".teacher-important-target"
            )
            .forEach(square => {
                square.classList.remove(
                    "teacher-attacked-square",
                    "teacher-important-target"
                );
            });
    }

    function getTeacherControlledSquares(
        row,
        column
    ) {
        const piece =
            board[row][column];

        if (!piece) {
            return [];
        }

        const squares = [];

        /*
        Pawn attacks.
        Pawns attack diagonally,
        NOT directly forward.
        */

        if (piece.type === "pawn") {
            const direction =
                piece.color === "white"
                    ? -1
                    : 1;

            for (const offset of [-1, 1]) {
                const targetRow =
                    row + direction;

                const targetColumn =
                    column + offset;

                if (
                    isInsideBoard(
                        targetRow,
                        targetColumn
                    )
                ) {
                    squares.push({
                        row: targetRow,
                        column: targetColumn
                    });
                }
            }

            return squares;
        }


        /*
        Knight attacks.
        */

        if (piece.type === "knight") {
            const offsets = [
                [-2, -1],
                [-2, 1],
                [-1, -2],
                [-1, 2],
                [1, -2],
                [1, 2],
                [2, -1],
                [2, 1]
            ];

            for (
                const [
                    rowOffset,
                    columnOffset
                ] of offsets
            ) {
                const targetRow =
                    row + rowOffset;

                const targetColumn =
                    column + columnOffset;

                if (
                    isInsideBoard(
                        targetRow,
                        targetColumn
                    )
                ) {
                    squares.push({
                        row: targetRow,
                        column: targetColumn
                    });
                }
            }

            return squares;
        }


        /*
        King controls every adjacent square.
        */

        if (piece.type === "king") {
            for (
                let rowOffset = -1;
                rowOffset <= 1;
                rowOffset++
            ) {
                for (
                    let columnOffset = -1;
                    columnOffset <= 1;
                    columnOffset++
                ) {
                    if (
                        rowOffset === 0 &&
                        columnOffset === 0
                    ) {
                        continue;
                    }

                    const targetRow =
                        row + rowOffset;

                    const targetColumn =
                        column + columnOffset;

                    if (
                        isInsideBoard(
                            targetRow,
                            targetColumn
                        )
                    ) {
                        squares.push({
                            row: targetRow,
                            column: targetColumn
                        });
                    }
                }
            }

            return squares;
        }


        /*
        Sliding pieces:
        bishop, rook and queen.
        */

        let directions = [];

        if (piece.type === "bishop") {
            directions = [
                [-1, -1],
                [-1, 1],
                [1, -1],
                [1, 1]
            ];
        }

        if (piece.type === "rook") {
            directions = [
                [-1, 0],
                [1, 0],
                [0, -1],
                [0, 1]
            ];
        }

        if (piece.type === "queen") {
            directions = [
                [-1, 0],
                [1, 0],
                [0, -1],
                [0, 1],
                [-1, -1],
                [-1, 1],
                [1, -1],
                [1, 1]
            ];
        }

        for (
            const [
                rowDirection,
                columnDirection
            ] of directions
        ) {
            let targetRow =
                row + rowDirection;

            let targetColumn =
                column + columnDirection;

            while (
                isInsideBoard(
                    targetRow,
                    targetColumn
                )
            ) {
                /*
                This square is controlled,
                even if a piece occupies it.
                */

                squares.push({
                    row: targetRow,
                    column: targetColumn
                });

                /*
                Pieces block bishops,
                rooks and queens.
                */

                if (
                    board[
                        targetRow
                    ][
                        targetColumn
                    ]
                ) {
                    break;
                }

                targetRow +=
                    rowDirection;

                targetColumn +=
                    columnDirection;
            }
        }

        return squares;
    }


    function showTeacherAttacks(
        row,
        column
    ) {
        clearTeacherAttackSquares();

        const piece =
            board[row][column];

        if (!piece) {
            return;
        }

        const attackedSquares =
            getTeacherControlledSquares(
                row,
                column
            );

        attackedSquares.forEach(position => {
            const square =
                chessboard.querySelector(
                    `[data-row="${position.row}"]` +
                    `[data-column="${position.column}"]`
                );

            if (!square) {
                return;
            }
            const target =
                board[
                    position.row
                ][
                    position.column
                ];

            const marker =
                document.createElement("span");

            if (
                target &&
                target.color !== piece.color
            ) {
                marker.className =
                    "teacher-attack-marker";
            } else {
                marker.className =
                    "teacher-control-marker";
            }

            square.appendChild(marker);

        });
    }

    /*
    ============================================================
    TEACHER SPEECH RECOGNITION
    ============================================================
    */

    const SpeechRecognition =
        window.SpeechRecognition ||
        window.webkitSpeechRecognition;

    let teacherRecognition = null;

    if (SpeechRecognition) {
        teacherRecognition =
            new SpeechRecognition();

        teacherRecognition.lang = teacherLanguage;
        teacherRecognition.continuous = false;
        teacherRecognition.interimResults = false;

        teacherRecognition.onstart = () => {
            const listeningMessages = {
                "en-GB": "I'm listening...",
                "ru-RU": "Я слушаю...",
                "kk-KZ": "Тыңдап тұрмын...",
                "sv-SE": "Jag lyssnar..."
            };

            const microphoneMessages = {
                "en-GB": "🎙️ Listening...",
                "ru-RU": "🎙️ Слушаю...",
                "kk-KZ": "🎙️ Тыңдап тұрмын...",
                "sv-SE": "🎙️ Jag lyssnar..."
            };

            if (teacherMessage) {
                teacherMessage.textContent =
                    listeningMessages[
                        teacherLanguage
                    ] ||
                    listeningMessages["en-GB"];
            }

            if (teacherMicrophone) {
                teacherMicrophone.textContent =
                    microphoneMessages[
                        teacherLanguage
                    ] ||
                    microphoneMessages["en-GB"];
            }
        };







        /*
        ============================================================
        UNIVERSAL CHESS TEACHER LESSON SYSTEM
        ============================================================

        This system reads lesson instructions from teacher-rules.js.

        It can:

        - create temporary teaching positions
        - show highlighted squares
        - demonstrate multiple moves
        - demonstrate captures
        - reset between demonstrations
        - demonstrate castling
        - demonstrate promotion
        - demonstrate en passant
        - show controlled/attacked squares
        - speak before moving
        - restore the student's real position

        It deliberately does NOT call makeMove().
        ============================================================
        */


        /*
        ============================================================
        CREATE EMPTY TEACHING BOARD
        ============================================================
        */

        function createEmptyTeacherBoard() {

            return Array.from(
                {
                    length: 8
                },
                () =>
                    Array(8).fill(null)
            );
        }


        /*
        ============================================================
        SQUARE NAME -> BOARD COORDINATES
        ============================================================

        Example:

        e4

        becomes:

        {
            row: 4,
            column: 4
        }
        ============================================================
        */

        function teacherSquareToCoordinates(
            squareName
        ) {

            if (
                !squareName ||
                typeof squareName !== "string" ||
                squareName.length !== 2
            ) {
                return null;
            }


            const file =
                squareName[0]
                    .toUpperCase();

            const rank =
                parseInt(
                    squareName[1],
                    10
                );


            const column =
                boardFiles.indexOf(
                    file
                );


            if (
                column === -1 ||
                Number.isNaN(rank) ||
                rank < 1 ||
                rank > 8
            ) {
                return null;
            }


            return {
                row:
                    8 - rank,

                column
            };
        }


        /*
        ============================================================
        CREATE PIECES FOR A TEACHING POSITION
        ============================================================
        */

        function createTeacherLessonBoard(
            setup
        ) {

            const lessonBoard =
                createEmptyTeacherBoard();


            if (!setup) {
                return lessonBoard;
            }


            const colors = [
                "white",
                "black"
            ];


            colors.forEach(color => {

                const colorSetup =
                    setup[color];


                if (!colorSetup) {
                    return;
                }


                Object.entries(
                    colorSetup
                ).forEach(
                    ([
                        pieceType,
                        squares
                    ]) => {

                        if (
                            !Array.isArray(
                                squares
                            )
                        ) {
                            return;
                        }


                        squares.forEach(
                            squareName => {

                                const coordinates =
                                    teacherSquareToCoordinates(
                                        squareName
                                    );


                                if (!coordinates) {
                                    return;
                                }


                                lessonBoard[
                                    coordinates.row
                                ][
                                    coordinates.column
                                ] =
                                    createPiece(
                                        pieceType,
                                        color
                                    );
                            }
                        );
                    }
                );
            });


            return lessonBoard;
        }


        /*
        ============================================================
        CREATE TEACHER HIGHLIGHT MARKER
        ============================================================
        */

        function createTeacherLessonMarker(
            squareName,
            markerType =
                "control"
        ) {

            const coordinates =
                teacherSquareToCoordinates(
                    squareName
                );


            if (!coordinates) {
                return;
            }


            const square =
                chessboard.querySelector(
                    `[data-row="${coordinates.row}"]` +
                    `[data-column="${coordinates.column}"]`
                );


            if (!square) {
                return;
            }


            const marker =
                document.createElement(
                    "span"
                );


            if (
                markerType === "attack"
            ) {
                marker.classList.add(
                    "teacher-attack-marker"
                );
            } else {
                marker.classList.add(
                    "teacher-control-marker"
                );
            }


            square.appendChild(
                marker
            );
        }


        /*
        ============================================================
        SHOW SIMPLE LESSON HIGHLIGHTS
        ============================================================
        */

        function showTeacherLessonHighlights(
            squares
        ) {

            if (
                !Array.isArray(
                    squares
                )
            ) {
                return;
            }


            squares.forEach(
                squareName => {

                    createTeacherLessonMarker(
                        squareName,
                        "control"
                    );
                }
            );
        }


        /*
        ============================================================
        SHOW RAYS

        Used by:

        - bishop
        - rook
        - queen

        Example:

        d4 -> e5 -> f6 -> g7 -> h8
        ============================================================
        */

        function showTeacherLessonRays(
            rays
        ) {

            if (
                !Array.isArray(
                    rays
                )
            ) {
                return;
            }


            rays.forEach(ray => {

                if (
                    !Array.isArray(
                        ray.squares
                    )
                ) {
                    return;
                }


                ray.squares.forEach(
                    squareName => {

                        createTeacherLessonMarker(
                            squareName,
                            "control"
                        );
                    }
                );
            });
        }


        /*
        ============================================================
        SHOW BLOCKED RAY
        ============================================================
        */

        function showTeacherBlockedRay(
            squares
        ) {

            if (
                !Array.isArray(
                    squares
                )
            ) {
                return;
            }


            squares.forEach(
                (
                    squareName,
                    index
                ) => {

                    createTeacherLessonMarker(
                        squareName,
                        index === 0
                            ? "attack"
                            : "control"
                    );
                }
            );
        }


        /*
        ============================================================
        SHOW LESSON VISUALS
        ============================================================
        */

        function showTeacherLessonVisuals(
            lesson
        ) {

            clearTeacherAttackSquares();


            if (
                lesson.highlights
            ) {
                showTeacherLessonHighlights(
                    lesson.highlights
                );
            }


            if (
                lesson.rays
            ) {
                showTeacherLessonRays(
                    lesson.rays
                );
            }


            if (
                lesson.blockedRay
            ) {
                showTeacherBlockedRay(
                    lesson.blockedRay
                );
            }


            /*
            Tactical lines such as a pin.
            */

            if (
                Array.isArray(
                    lesson.line
                )
            ) {
                showTeacherLessonHighlights(
                    lesson.line
                );
            }
        }


        /*
        ============================================================
        SPEAK TEACHER LESSON TEXT
        ============================================================
        */

        async function speakTeacherLessonText(
            text
        ) {

            if (!text) {
                return;
            }


            if (teacherMessage) {
                teacherMessage.textContent =
                    text;
            }


            await speakTeacherMessage(
                text
            );
        }


        /*
        ============================================================
        EXECUTE A TEACHING MOVE
        ============================================================

        IMPORTANT:

        This changes ONLY the temporary teaching board.

        It does NOT:

        - add move history
        - add captured pieces
        - call Stockfish
        - update repetition
        - update the 50-move counter
        ============================================================
        */

        async function executeTeacherLessonMove(
            demonstration
        ) {

            if (
                !demonstration ||
                !demonstration.from ||
                !demonstration.to
            ) {
                return false;
            }


            const from =
                teacherSquareToCoordinates(
                    demonstration.from
                );


            const to =
                teacherSquareToCoordinates(
                    demonstration.to
                );


            if (
                !from ||
                !to
            ) {
                console.warn(
                    "Invalid teacher lesson move:",
                    demonstration
                );

                return false;
            }


            const piece =
                board[
                    from.row
                ][
                    from.column
                ];


            if (!piece) {

                console.warn(
                    "Teacher lesson cannot find piece on:",
                    demonstration.from
                );

                return false;
            }


            /*
            ========================================================
            EXPLAIN BEFORE MOVING
            ========================================================
            */

            if (
                demonstration.text
            ) {

                await speakTeacherLessonText(
                    demonstration.text
                );


                await teacherSleep(
                    350
                );
            }


            /*
            ========================================================
            DRAW ARROW BEFORE MOVING
            ========================================================
            */

            const uciMove =
                demonstration.from +
                demonstration.to;


            drawTeacherArrow(
                uciMove
            );


            await teacherSleep(
                700
            );


            /*
            ========================================================
            EN PASSANT CAPTURE
            ========================================================
            */

            if (
                demonstration.special ===
                    "enPassant" &&
                demonstration.captureSquare
            ) {

                const capturedSquare =
                    teacherSquareToCoordinates(
                        demonstration.captureSquare
                    );


                if (capturedSquare) {

                    board[
                        capturedSquare.row
                    ][
                        capturedSquare.column
                    ] = null;
                }
            }


            /*
            ========================================================
            NORMAL MOVE / NORMAL CAPTURE
            ========================================================

            If an enemy piece occupies the destination,
            assigning our piece to that square removes it.

            Example:

            white pawn e4
            black pawn f5

            e4 -> f5

            black pawn disappears.
            ========================================================
            */

            board[
                to.row
            ][
                to.column
            ] =
                piece;


            board[
                from.row
            ][
                from.column
            ] =
                null;


            piece.hasMoved =
                true;


            /*
            ========================================================
            CASTLING
            ========================================================
            */

            if (
                demonstration.special ===
                    "castle" &&
                demonstration.rookFrom &&
                demonstration.rookTo
            ) {

                const rookFrom =
                    teacherSquareToCoordinates(
                        demonstration.rookFrom
                    );


                const rookTo =
                    teacherSquareToCoordinates(
                        demonstration.rookTo
                    );


                if (
                    rookFrom &&
                    rookTo
                ) {

                    const rook =
                        board[
                            rookFrom.row
                        ][
                            rookFrom.column
                        ];


                    board[
                        rookTo.row
                    ][
                        rookTo.column
                    ] =
                        rook;


                    board[
                        rookFrom.row
                    ][
                        rookFrom.column
                    ] =
                        null;


                    if (rook) {
                        rook.hasMoved =
                            true;
                    }
                }
            }


            /*
            ========================================================
            PROMOTION
            ========================================================
            */

            if (
                demonstration.promotion
            ) {

                piece.type =
                    demonstration.promotion;
            }


            /*
            ========================================================
            LAST MOVE ARROW
            ========================================================
            */

            lastMove = {

                fromRow:
                    from.row,

                fromColumn:
                    from.column,

                toRow:
                    to.row,

                toColumn:
                    to.column
            };


            /*
            ========================================================
            RENDER NEW TEACHING POSITION
            ========================================================
            */

            selectedSquare =
                null;


            createBoard();


            /*
            ========================================================
            SHOW WHAT THE MOVED PIECE CONTROLS
            ========================================================
            */

            showTeacherAttacks(
                to.row,
                to.column
            );


            await teacherSleep(
                1300
            );


            return true;
        }


        /*
        ============================================================
        SAVE REAL STUDENT POSITION
        ============================================================
        */

        function saveTeacherStudentState() {

            return {

                board:
                    cloneBoard(
                        board
                    ),

                currentTurn,

                selectedSquare:
                    selectedSquare
                        ? {
                            ...selectedSquare
                        }
                        : null,

                enPassantTarget:
                    enPassantTarget
                        ? {
                            ...enPassantTarget
                        }
                        : null,

                halfMoveClock,

                gameOver,

                lastMove:
                    lastMove
                        ? {
                            ...lastMove
                        }
                        : null,

                previousEngineEvaluation,

                capturedWhitePieces:
                    capturedWhitePieces.map(
                        piece => ({
                            ...piece
                        })
                    ),

                capturedBlackPieces:
                    capturedBlackPieces.map(
                        piece => ({
                            ...piece
                        })
                    ),

                moveHistory:
                    moveHistory.map(
                        move => ({
                            ...move
                        })
                    ),

                fullMoveNumber
            };
        }


        /*
        ============================================================
        RESTORE REAL STUDENT POSITION
        ============================================================
        */

        function restoreTeacherStudentState(
            savedState
        ) {

            if (!savedState) {
                return;
            }


            board =
                cloneBoard(
                    savedState.board
                );


            currentTurn =
                savedState.currentTurn;


            selectedSquare =
                savedState.selectedSquare
                    ? {
                        ...savedState.selectedSquare
                    }
                    : null;


            enPassantTarget =
                savedState.enPassantTarget
                    ? {
                        ...savedState.enPassantTarget
                    }
                    : null;


            halfMoveClock =
                savedState.halfMoveClock;


            gameOver =
                savedState.gameOver;


            lastMove =
                savedState.lastMove
                    ? {
                        ...savedState.lastMove
                    }
                    : null;


            previousEngineEvaluation =
                savedState.previousEngineEvaluation;


            capturedWhitePieces =
                savedState
                    .capturedWhitePieces
                    .map(
                        piece => ({
                            ...piece
                        })
                    );


            capturedBlackPieces =
                savedState
                    .capturedBlackPieces
                    .map(
                        piece => ({
                            ...piece
                        })
                    );


            moveHistory =
                savedState
                    .moveHistory
                    .map(
                        move => ({
                            ...move
                        })
                    );


            fullMoveNumber =
                savedState.fullMoveNumber;


            clearTeacherAttackSquares();


            createBoard();

            updateTurnDisplay();

            renderCapturedPieces();

            renderMoveHistory();
        }


        /*
        ============================================================
        RESET TEMPORARY LESSON POSITION
        ============================================================
        */

        function resetTeacherLessonPosition(
            originalLessonBoard,
            lesson
        ) {

            board =
                cloneBoard(
                    originalLessonBoard
                );


            currentTurn =
                "white";


            selectedSquare =
                null;


            enPassantTarget =
                null;


            lastMove =
                null;


            clearTeacherAttackSquares();


            createBoard();


            showTeacherLessonVisuals(
                lesson
            );
        }


        /*
        ============================================================
        RUN UNIVERSAL TEACHER LESSON
        ============================================================
        */

        async function runTeacherLesson(
            lesson
        ) {

            if (!lesson) {
                return;
            }


            /*
            ========================================================
            1. SAVE STUDENT'S REAL GAME
            ========================================================
            */

            const savedStudentState =
                saveTeacherStudentState();


            /*
            We use try/finally so that even if a
            demonstration fails, the student's
            real position is restored.
            */

            try {

                /*
                ====================================================
                2. SPEAK GENERAL EXPLANATION FIRST
                ====================================================
                */

                if (
                    lesson.answer
                ) {

                    await speakTeacherLessonText(
                        lesson.answer
                    );


                    await teacherSleep(
                        400
                    );
                }


                /*
                ====================================================
                3. TEXT-ONLY LESSON
                ====================================================
                */

                if (
                    !lesson.setup
                ) {
                    return;
                }


                /*
                ====================================================
                4. BUILD TEMPORARY TEACHING POSITION
                ====================================================
                */

                const originalLessonBoard =
                    createTeacherLessonBoard(
                        lesson.setup
                    );


                board =
                    cloneBoard(
                        originalLessonBoard
                    );


                currentTurn =
                    "white";


                selectedSquare =
                    null;


                enPassantTarget =
                    null;


                lastMove =
                    null;


                createBoard();


                /*
                ====================================================
                5. SHOW MOVEMENT PATTERN
                ====================================================
                */

                showTeacherLessonVisuals(
                    lesson
                );


                /*
                If this lesson only shows movement
                squares and contains no actual moves,
                keep it visible for a little while.
                */

                if (
                    !Array.isArray(
                        lesson.demonstrations
                    ) ||
                    lesson.demonstrations.length === 0
                ) {

                    if (
                        lesson.text
                    ) {

                        await speakTeacherLessonText(
                            lesson.text
                        );
                    }


                    await teacherSleep(
                        2500
                    );


                    return;
                }


                await teacherSleep(
                    900
                );


                /*
                ====================================================
                6. EXECUTE EVERY DEMONSTRATION
                ====================================================
                */

                for (
                    const demonstration
                    of lesson.demonstrations
                ) {

                    /*
                    -----------------------------------------------
                    RESET

                    Example pawn capture:

                    e4 -> f5
                    RESET
                    e4 -> d5
                    -----------------------------------------------
                    */

                    if (
                        demonstration.reset
                    ) {

                        resetTeacherLessonPosition(
                            originalLessonBoard,
                            lesson
                        );


                        await teacherSleep(
                            700
                        );


                        continue;
                    }


                    /*
                    -----------------------------------------------
                    NORMAL DEMONSTRATION
                    -----------------------------------------------
                    */

                    await executeTeacherLessonMove(
                        demonstration
                    );
                }


                /*
                ====================================================
                7. LET STUDENT SEE FINAL RESULT
                ====================================================
                */

                await teacherSleep(
                    1000
                );

            } catch (error) {

                console.error(
                    "Teacher lesson error:",
                    error
                );

            } finally {

                /*
                ====================================================
                8. ALWAYS RESTORE STUDENT'S REAL GAME
                ====================================================
                */

                restoreTeacherStudentState(
                    savedStudentState
                );
            }
        }


        /*
        ============================================================
        UNIVERSAL PIECE RULE DEMONSTRATION
        ============================================================
        */

        async function demonstratePieceRule(
            ruleAnswer
        ) {

            if (!ruleAnswer) {
                return;
            }


            /*
            Lessons with a temporary board.
            */

            if (
                ruleAnswer.setup
            ) {

                await runTeacherLesson(
                    ruleAnswer
                );


                return;
            }


            /*
            Text-only rule.
            */

            if (
                ruleAnswer.answer
            ) {

                await speakTeacherLessonText(
                    ruleAnswer.answer
                );
            }
        }


        function normalizeTeacherSpeech(text) {
            let value =
                text
                    .toLowerCase()
                    .trim();

            /*
            Speech recognition often hears
            "knight" as "night".
            */

            value = value
                .replace(/\bnights\b/g, "knights")
                .replace(/\bnight\b/g, "knight");

            /*
            "Pawn" may be recognised as "plan".

            Do not replace every "plan", because:
            "What is my plan?"
            is a real chess question.

            Only treat "plan" as "pawn" when
            the sentence looks like it refers
            to a chess piece or move.
            */

            const pawnContext =
                blindfoldMode ||
                /\b[a-h][1-8]\b/.test(value) ||
                /\b(move|moves|moving|capture|captures|capturing|attack|attacks|attacking|defend|defends|push|advance|promote|promotion)\b/.test(
                    value
                );

            if (pawnContext) {
                value = value
                    .replace(/\bplans\b/g, "pawns")
                    .replace(/\bplan\b/g, "pawn");
            }

            return value;
        }


        async function answerTeacherQuestion(
            transcript
        ) {

            const question =
                normalizeTeacherSpeech(
                    transcript
                );
            

            /*
            ============================================================
            GAME CONVERSATION
            ============================================================
            */

            /*
            First deal with the answer to:
            "Do you want to play?"
            */

            if (pendingTeacherGameConfirmation) {

                const positiveAnswers = [
                    "yes",
                    "yeah",
                    "yep",
                    "sure",
                    "ok",
                    "okay",
                    "why not",
                    "of course",
                    "let's do it",
                    "lets do it",
                    "go ahead"
                ];

                const negativeAnswers = [
                    "no",
                    "nope",
                    "not now",
                    "maybe later"
                ];

                const accepted =
                    positiveAnswers.some(
                        answer =>
                            question.includes(answer)
                    );

                const declined =
                    negativeAnswers.some(
                        answer =>
                            question.includes(answer)
                    );

                if (accepted) {

                    const shouldPlayBlindfold =
                        pendingTeacherGameMode ===
                        "blindfold";

                    pendingTeacherGameConfirmation =
                        false;

                    await startTeacherGame(
                        shouldPlayBlindfold
                    );

                    return null;
                }

                if (declined) {
                    pendingTeacherGameConfirmation =
                        false;

                    pendingTeacherGameMode =
                        "normal";

                    return "Okay. We can play later.";
                }

                return "Please answer yes or no.";
            }


            /*
            Ask for confirmation whenever the student
            suggests playing.

            Do this only when a game is NOT already running,
            otherwise questions such as
            "Why did you play that?"
            must still work.
            */

            if (
                (
                    !teacherPlayMode ||
                    gameOver
                ) &&
                question.includes("play")
            ) {
                pendingTeacherGameConfirmation =
                    true;

                pendingTeacherGameMode =
                    question.includes("blindfold")
                        ? "blindfold"
                        : "normal";

                if (
                    pendingTeacherGameMode ===
                    "blindfold"
                ) {
                    return (
                        "Do you want to play a blindfold game?"
                    );
                }

                return "Do you want to play?";
            }


                        /*
            Turn move announcements off.
            */

            if (
                teacherPlayMode &&
                (
                    question.includes("stop saying your moves") ||
                    question.includes("don't say your moves") ||
                    question.includes("do not say your moves") ||
                    question.includes("stop announcing")
                )
            ) {
                announceTeacherMoves = false;

                return (
                    "Okay. I will stop announcing my moves."
                );
            }

            /*
            Turn move announcements on.
            */

            if (
                teacherPlayMode &&
                (
                    question.includes("say your moves") ||
                    question.includes("announce your moves") ||
                    question.includes("say your moves out loud") ||
                    question.includes("tell me your moves")
                )
            ) {
                announceTeacherMoves = true;

                return (
                    "Okay. I will say my moves out loud."
                );
            }



            /*
            Ask what the teacher just played.
            */

            if (
                teacherPlayMode &&
                (
                    question.includes("what did you play") ||
                    question.includes("what was your move") ||
                    question.includes("say your last move") ||
                    question.includes("repeat your move")
                )
            ) {
                return (
                    lastTeacherMoveDescription ||
                    "I haven't made a move yet."
                );
            }

            /*
            ============================================================
            BLINDFOLD STUDENT MOVE
            ============================================================
            */

            if (
                blindfoldMode &&
                teacherPlayMode &&
                currentTurn === studentColor
            ) {
                const blindfoldMove =
                    tryBlindfoldStudentMove(
                        question
                    );

                if (blindfoldMove.handled) {
                    return blindfoldMove.answer;
                }
            }

            /*
            ============================================================
            GENERAL CHESS RULE QUESTIONS
            ============================================================
            */

            if (window.AzaChessTeacherRules) {

                const ruleAnswer =
                    window.AzaChessTeacherRules.answer(
                        question
                    );

                if (ruleAnswer) {

                    const visualLessonTypes = [
                        "piece-movement",
                        "piece-capture",
                        "piece-rule",
                        "special-rule",
                        "tactical-concept"
                    ];

                    if (
                        visualLessonTypes.includes(
                            ruleAnswer.type
                        ) &&
                        (
                            ruleAnswer.setup ||
                            ruleAnswer.highlights ||
                            ruleAnswer.rays ||
                            ruleAnswer.demonstrations
                        )
                    ) {
                        await demonstratePieceRule(
                            ruleAnswer
                        );

                        return null;
                    }

                    return ruleAnswer.answer;
                }
            }


                /*
                ========================================================
                WHAT DOES THE BISHOP ATTACK?
                ========================================================
                */

                if (
                    question.includes("bishop") &&
                    (
                        question.includes("attack") ||
                        question.includes("control")
                    )
                ) {
                    const bishops = [];

                    for (let row = 0; row < 8; row++) {
                        for (
                            let column = 0;
                            column < 8;
                            column++
                        ) {
                            const piece =
                                board[row][column];

                            if (
                                piece &&
                                piece.color === "white" &&
                                piece.type === "bishop"
                            ) {
                                bishops.push({
                                    row,
                                    column,
                                    piece
                                });
                            }
                        }
                    }

                    const activeBishops =
                        bishops
                            .map(bishop => {
                                return {
                                    ...bishop,
                                    squares:
                                        getTeacherControlledSquares(
                                            bishop.row,
                                            bishop.column
                                        )
                                };
                            })
                            .filter(
                                bishop =>
                                    bishop.squares.length > 0
                            );

                    /*
                    Starting position:
                    both bishops are blocked.
                    */

                    if (activeBishops.length === 0) {
                        return (
                            "Your bishops are currently blocked " +
                            "by your own pawns. Bishops move and " +
                            "attack diagonally. You can move a " +
                            "pawn such as e2 to e4 to open a " +
                            "diagonal for the bishop on f1."
                        );
                    }

                    /*
                    Prefer the most active bishop.
                    */

                    activeBishops.sort(
                        (a, b) =>
                            b.squares.length -
                            a.squares.length
                    );

                    const bishop =
                        activeBishops[0];

                    const bishopSquare =
                        getSquareName(
                            bishop.row,
                            bishop.column
                        );

                    const attackedPieces = [];

                    const controlledSquares = [];

                    bishop.squares.forEach(position => {
                        const squareName =
                            getSquareName(
                                position.row,
                                position.column
                            );

                        const target =
                            board[
                                position.row
                            ][
                                position.column
                            ];

                        if (
                            target &&
                            target.color !==
                                bishop.piece.color
                        ) {
                            attackedPieces.push(
                                `${getTeacherPieceName(target)} on ${squareName}`
                            );
                        } else {
                            controlledSquares.push(
                                squareName
                            );
                        }
                    });

                    /*
                    Show the bishop's influence
                    directly on the board.
                    */

                    showTeacherAttacks(
                        bishop.row,
                        bishop.column
                    );

                    if (attackedPieces.length > 0) {
                        return (
                            `The bishop on ${bishopSquare} ` +
                            `attacks the enemy ` +
                            `${attackedPieces.join(" and ")}. ` +
                            `It also controls the diagonal squares ` +
                            `${controlledSquares.join(", ")}.`
                        );
                    }

                    return (
                        `The bishop on ${bishopSquare} ` +
                        `does not currently attack an enemy piece, ` +
                        `but it controls the diagonal squares ` +
                        `${controlledSquares.join(", ")}.`
                    );
                }

                /*
                ========================================================
                UNKNOWN QUESTION
                ========================================================
                */

                /*
                ========================================================
                AI FALLBACK
                ========================================================
                */

                if (teacherMessage) {
                    teacherMessage.textContent =
                        "Let me think...";
                }

                return await askAITeacher(
                    question
                );
            }


        teacherRecognition.onresult =
            async event => {
                const transcript =
                    event.results[0][0]
                        .transcript;

                console.log(
                    "Student said:",
                    transcript
                );

                if (teacherMessage) {
                    teacherMessage.textContent =
                        `You asked: "${transcript}"`;
                }

                const answer =
                    await answerTeacherQuestion(
                        transcript
                    );

                if (answer) {
                    console.log(
                        "Teacher answer:",
                        answer
                    );

                    if (teacherMessage) {
                        teacherMessage.textContent =
                            answer;
                    }

                    await speakTeacherMessage(
                        answer
                    );
                }
            };

        teacherRecognition.onerror = event => {
            console.error(
                "Speech recognition error:",
                event.error
            );

            const errorMessages = {
                "en-GB":
                    "I couldn't hear you. Please try again.",

                "ru-RU":
                    "Я вас не расслышал. Пожалуйста, попробуйте ещё раз.",

                "kk-KZ":
                    "Мен сізді ести алмадым. Қайтадан айтып көріңіз.",

                "sv-SE":
                    "Jag kunde inte höra dig. Försök igen."
            };

            if (teacherMessage) {
                teacherMessage.textContent =
                    errorMessages[
                        teacherLanguage
                    ] ||
                    errorMessages["en-GB"];
            }
        };

        teacherRecognition.onend = () => {
            const talkMessages = {
                "en-GB": "🎤 Talk to Teacher",
                "ru-RU": "🎤 Говорить с учителем",
                "kk-KZ": "🎤 Мұғаліммен сөйлесу",
                "sv-SE": "🎤 Prata med läraren"
            };

            if (teacherMicrophone) {
                teacherMicrophone.textContent =
                    talkMessages[
                        teacherLanguage
                    ] ||
                    talkMessages["en-GB"];
            }
        };
    }


    if (teacherLanguageSelect) {
        teacherLanguageSelect.addEventListener(
            "change",
            async () => {
                window.speechSynthesis.cancel();
                teacherLanguage =
                    teacherLanguageSelect.value;

                localStorage.setItem(
                    "azachessTeacherLanguage",
                    teacherLanguage
                );

                if (teacherRecognition) {
                    teacherRecognition.lang =
                        teacherLanguage;
                }

                const greeting =
                    getTeacherGreeting(
                        teacherLanguage
                    );

                if (teacherMessage) {
                    teacherMessage.textContent =
                        greeting;
                }

                await speakTeacherMessage(
                    greeting
                );
            }
        );
    }


    if (teacherMicrophone) {
        teacherMicrophone.addEventListener(
            "click",
            () => {
                if (!teacherRecognition) {
                    teacherMessage.textContent =
                        "Speech recognition is not supported in this browser.";

                    return;
                }

                // Do not let the teacher speak
                // while listening to the student.
                window.speechSynthesis.cancel();

                try {
                    teacherRecognition.start();
                } catch (error) {
                    console.warn(
                        "Microphone is already listening.",
                        error
                    );
                }
            }
        );
    }

    function loadTeacherVoices() {
        return new Promise(resolve => {
            const voices =
                window.speechSynthesis.getVoices();

            if (voices.length > 0) {
                resolve(voices);
                return;
            }

            const handleVoicesChanged = () => {
                const loadedVoices =
                    window.speechSynthesis.getVoices();

                resolve(loadedVoices);
            };

            window.speechSynthesis.addEventListener(
                "voiceschanged",
                handleVoicesChanged,
                {
                    once: true
                }
            );

            setTimeout(
                () => {
                    resolve(
                        window.speechSynthesis.getVoices()
                    );
                },
                1000
            );
        });
    }


    async function speakTeacherMessage(message) {
        if (!message) {
            return;
        }

        const activeLanguage =
            teacherLanguage || "en-GB";

        try {
            /*
            Stop old browser TTS.
            */
            if ("speechSynthesis" in window) {
                window.speechSynthesis.cancel();
            }

            /*
            Stop previous AI audio if
            the teacher is already speaking.
            */
            if (teacherAudio) {
                teacherAudio.pause();
                teacherAudio.currentTime = 0;
                teacherAudio = null;
            }

            const response =
                await fetch(
                    "/teacher-speech/",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json",

                            "X-CSRFToken":
                                getCSRFToken()
                        },

                        body: JSON.stringify({
                            text: message,
                            language: activeLanguage
                        })
                    }
                );

            if (!response.ok) {
                const errorText =
                    await response.text();

                throw new Error(
                    "Teacher speech request failed: " +
                    response.status +
                    " " +
                    errorText
                );
            }

            const audioBlob =
                await response.blob();

            const audioUrl =
                URL.createObjectURL(
                    audioBlob
                );

            teacherAudio =
                new Audio(
                    audioUrl
                );

            console.log(
                "Playing AI teacher voice:",
                activeLanguage
            );

            return new Promise(
                (resolve, reject) => {

                    teacherAudio.onended = () => {
                        URL.revokeObjectURL(
                            audioUrl
                        );

                        teacherAudio = null;

                        resolve();
                    };

                    teacherAudio.onerror = error => {
                        URL.revokeObjectURL(
                            audioUrl
                        );

                        teacherAudio = null;

                        console.error(
                            "AI teacher audio error:",
                            error
                        );

                        reject(error);
                    };

                    teacherAudio
                        .play()
                        .catch(error => {
                            URL.revokeObjectURL(
                                audioUrl
                            );

                            teacherAudio = null;

                            console.error(
                                "Could not play AI teacher:",
                                error
                            );

                            reject(error);
                        });
                }
            );

        } catch (error) {
            console.error(
                "OpenAI teacher speech error:",
                error
            );
        }
    }


    async function teacherDemonstrateMove(
        uciMove,
        explanation = "",
        options = {}
    ) {
        const {
            speak = true,
            showAttacks = true,
            pauseAfter = 800
        } = options;

        const teacherMove =
            getTeacherMove(uciMove);

        if (!teacherMove) {
            return false;
        }

        const {
            coordinates,
            piece,
            move
        } = teacherMove;

        const {
            fromRow,
            fromColumn
        } = coordinates;

        /*
        Tell the student what the teacher
        is about to demonstrate.
        */

        const teacherExplanation =
            explanation ||
            generateTeacherExplanation(
                uciMove
            );

        if (teacherMessage) {
            teacherMessage.textContent =
                teacherExplanation;
        }
        

        /*
        First show the yellow teacher arrow.
        */

        drawTeacherArrow(
            uciMove
        );

        await teacherSleep(900);


        /*
        Move the piece on our internal board.

        This deliberately does NOT call
        makeMove(), because a demonstration
        should not become a student's move.
        */

        executeMoveOnBoard(
            board,
            fromRow,
            fromColumn,
            move
        );

        piece.hasMoved = true;


        /*
        Handle promotion from UCI notation,
        for example e7e8q.
        */

        if (
            piece.type === "pawn" &&
            (
                move.row === 0 ||
                move.row === 7
            )
        ) {
            const promotionMap = {
                q: "queen",
                r: "rook",
                b: "bishop",
                n: "knight"
            };

            piece.type =
                promotionMap[
                    coordinates.promotion
                ] || "queen";
        }


        /*
        Store teacher move only so the normal
        last-move arrow/rendering can show it.
        */

        lastMove = {
            fromRow,
            fromColumn,
            toRow: move.row,
            toColumn: move.column
        };


        /*
        The demonstrated position must alternate
        sides so the next move in a variation
        can be validated correctly.
        */

        currentTurn =
            oppositeColor(currentTurn);

        selectedSquare = null;

        createBoard();

        updateTurnDisplay();

        /*
        Show what the demonstrated piece
        attacks or controls.
        */
        if (showAttacks) {
            showTeacherAttacks(
                move.row,
                move.column
            );
        }

        /*
        Speak only when this demonstration
        is supposed to include speech.
        */
        if (
            speak &&
            teacherExplanation
        ) {
            await speakTeacherMessage(
                teacherExplanation
            );
        }

        await teacherSleep(
            pauseAfter
        );

        return true;
    }


    async function teacherDemonstrateLine(
        variation,
        explanations = []
    ) {
        if (
            !Array.isArray(variation) ||
            variation.length === 0
        ) {
            return;
        }

        for (
            let index = 0;
            index < variation.length;
            index++
        ) {
            const uciMove =
                variation[index];

            const explanation =
                explanations[index] || "";

            const successful =
                await teacherDemonstrateMove(
                    uciMove,
                    explanation
                );

            if (!successful) {
                break;
            }

            await teacherSleep(700);
        }
    }

    /*
    ============================================================
    MOVE HISTORY
    ============================================================
    */

    function addMoveToHistory(
        color,
        notation
    ) {
        if (color === "white") {
            moveHistory.push({
                moveNumber:
                    fullMoveNumber,

                white:
                    notation,

                black:
                    ""
            });

            return;
        }


        /*
        Black move.
        */

        let lastEntry =
            moveHistory[
                moveHistory.length - 1
            ];

        if (!lastEntry) {
            lastEntry = {
                moveNumber:
                    fullMoveNumber,

                white:
                    "",

                black:
                    notation
            };

            moveHistory.push(
                lastEntry
            );
        } else {
            lastEntry.black =
                notation;
        }

        fullMoveNumber++;
    }


    function renderMoveHistory() {
        moveHistoryContainer.innerHTML =
            "";

        if (
            moveHistory.length === 0
        ) {
            const empty =
                document.createElement("p");

            empty.classList.add(
                "move-history-empty"
            );

            empty.textContent =
                "No moves yet.";

            moveHistoryContainer.appendChild(
                empty
            );

            return;
        }


        moveHistory.forEach(move => {
            const row =
                document.createElement(
                    "div"
                );

            row.classList.add(
                "move-row"
            );


            const number =
                document.createElement(
                    "div"
                );

            number.classList.add(
                "move-number"
            );

            number.textContent =
                `${move.moveNumber}.`;


            const white =
                document.createElement(
                    "div"
                );

            white.classList.add(
                "move-cell"
            );

            white.textContent =
                move.white || "";


            const black =
                document.createElement(
                    "div"
                );

            black.classList.add(
                "move-cell"
            );

            black.textContent =
                move.black || "";


            row.appendChild(number);
            row.appendChild(white);
            row.appendChild(black);

            moveHistoryContainer.appendChild(
                row
            );
        });


        /*
        Scroll to latest move.
        */

        moveHistoryContainer.scrollTop =
            moveHistoryContainer.scrollHeight;
    }


    /*
    ============================================================
    CAPTURED PIECES
    ============================================================
    */

    function renderCapturedPieces() {
        capturedWhiteContainer.innerHTML =
            "";

        capturedBlackContainer.innerHTML =
            "";


        capturedWhitePieces.forEach(
            piece => {
                const image =
                    document.createElement(
                        "img"
                    );

                image.src =
                    getPieceImagePath(
                        piece
                    );

                image.alt =
                    `Captured white ${piece.type}`;

                image.classList.add(
                    "captured-piece"
                );

                capturedWhiteContainer.appendChild(
                    image
                );
            }
        );


        capturedBlackPieces.forEach(
            piece => {
                const image =
                    document.createElement(
                        "img"
                    );

                image.src =
                    getPieceImagePath(
                        piece
                    );

                image.alt =
                    `Captured black ${piece.type}`;

                image.classList.add(
                    "captured-piece"
                );

                capturedBlackContainer.appendChild(
                    image
                );
            }
        );
    }


    /*
    ============================================================
    CHECKMATE / STALEMATE / DRAWS
    ============================================================
    */

    function evaluateGameState() {
        const inCheck =
            isKingInCheck(
                board,
                currentTurn
            );

        const hasLegalMove =
            playerHasLegalMove(
                currentTurn
            );


        /*
        Checkmate.
        */

        if (
            inCheck &&
            !hasLegalMove
        ) {
            const winner =
                oppositeColor(
                    currentTurn
                );

            turnDisplay.textContent =
                `${capitalize(winner)} wins by checkmate`;

            gameOver = true;

            return;
        }


        /*
        Stalemate.
        */

        if (
            !inCheck &&
            !hasLegalMove
        ) {
            turnDisplay.textContent =
                "Draw by stalemate";

            gameOver = true;

            return;
        }


        /*
        50 move rule.
        */

        if (
            halfMoveClock >= 100
        ) {
            turnDisplay.textContent =
                "Draw by 50-move rule";

            gameOver = true;

            return;
        }


        /*
        Threefold repetition.
        */

        const positionKey =
            getPositionKey();

        const repetitions =
            positionHistory.get(
                positionKey
            ) || 0;

        if (
            repetitions >= 3
        ) {
            turnDisplay.textContent =
                "Draw by threefold repetition";

            gameOver = true;

            return;
        }


        /*
        Insufficient material.
        */

        if (
            isInsufficientMaterial()
        ) {
            turnDisplay.textContent =
                "Draw by insufficient material";

            gameOver = true;

            return;
        }


        /*
        Check.
        */

        if (inCheck) {
            turnDisplay.textContent =
                `${capitalize(currentTurn)} — Check`;

            return;
        }

        updateTurnDisplay();
    }


    /*
    ============================================================
    DOES PLAYER HAVE A LEGAL MOVE?
    ============================================================
    */

    function playerHasLegalMove(
        color
    ) {
        for (
            let row = 0;
            row < 8;
            row++
        ) {
            for (
                let column = 0;
                column < 8;
                column++
            ) {
                const piece =
                    board[
                        row
                    ][
                        column
                    ];

                if (
                    !piece ||
                    piece.color !== color
                ) {
                    continue;
                }

                const moves =
                    getLegalMoves(
                        row,
                        column
                    );

                if (
                    moves.length > 0
                ) {
                    return true;
                }
            }
        }

        return false;
    }


    /*
    ============================================================
    THREEFOLD REPETITION
    ============================================================
    */

    function recordPosition() {
        const key =
            getPositionKey();

        const previousCount =
            positionHistory.get(
                key
            ) || 0;

        positionHistory.set(
            key,
            previousCount + 1
        );
    }


    function getPositionKey() {
        const pieceCodes = {
            white: {
                king: "K",
                queen: "Q",
                rook: "R",
                bishop: "B",
                knight: "N",
                pawn: "P"
            },

            black: {
                king: "k",
                queen: "q",
                rook: "r",
                bishop: "b",
                knight: "n",
                pawn: "p"
            }
        };

        let key = "";

        for (
            let row = 0;
            row < 8;
            row++
        ) {
            for (
                let column = 0;
                column < 8;
                column++
            ) {
                const piece =
                    board[
                        row
                    ][
                        column
                    ];

                if (!piece) {
                    key += "-";
                } else {
                    key +=
                        pieceCodes[
                            piece.color
                        ][
                            piece.type
                        ];
                }
            }
        }

        key +=
            `|${currentTurn}`;

        key +=
            `|${getCastlingRights()}`;


        if (enPassantTarget) {
            key +=
                `|${enPassantTarget.row},` +
                `${enPassantTarget.column}`;
        } else {
            key += "|-";
        }

        return key;
    }


    /*
    ============================================================
    CASTLING RIGHTS
    ============================================================
    */

    function getCastlingRights() {
        let rights = "";


        /*
        White.
        */

        const whiteKing =
            board[7][4];

        if (
            whiteKing &&
            whiteKing.type === "king" &&
            whiteKing.color === "white" &&
            !whiteKing.hasMoved
        ) {
            const kingRook =
                board[7][7];

            const queenRook =
                board[7][0];

            if (
                kingRook &&
                kingRook.type === "rook" &&
                kingRook.color === "white" &&
                !kingRook.hasMoved
            ) {
                rights += "K";
            }

            if (
                queenRook &&
                queenRook.type === "rook" &&
                queenRook.color === "white" &&
                !queenRook.hasMoved
            ) {
                rights += "Q";
            }
        }


        /*
        Black.
        */

        const blackKing =
            board[0][4];

        if (
            blackKing &&
            blackKing.type === "king" &&
            blackKing.color === "black" &&
            !blackKing.hasMoved
        ) {
            const kingRook =
                board[0][7];

            const queenRook =
                board[0][0];

            if (
                kingRook &&
                kingRook.type === "rook" &&
                kingRook.color === "black" &&
                !kingRook.hasMoved
            ) {
                rights += "k";
            }

            if (
                queenRook &&
                queenRook.type === "rook" &&
                queenRook.color === "black" &&
                !queenRook.hasMoved
            ) {
                rights += "q";
            }
        }

        return rights || "-";
    }


    /*
    ============================================================
    INSUFFICIENT MATERIAL
    ============================================================
    */

    function isInsufficientMaterial() {
        const remainingPieces = [];

        for (
            let row = 0;
            row < 8;
            row++
        ) {
            for (
                let column = 0;
                column < 8;
                column++
            ) {
                const piece =
                    board[
                        row
                    ][
                        column
                    ];

                if (
                    piece &&
                    piece.type !== "king"
                ) {
                    remainingPieces.push({
                        type:
                            piece.type,

                        color:
                            piece.color,

                        row,
                        column
                    });
                }
            }
        }


        /*
        King vs King.
        */

        if (
            remainingPieces.length === 0
        ) {
            return true;
        }


        /*
        King + Bishop vs King
        King + Knight vs King
        */

        if (
            remainingPieces.length === 1
        ) {
            const type =
                remainingPieces[0].type;

            return (
                type === "bishop" ||
                type === "knight"
            );
        }


        /*
        King + Bishop vs
        King + Bishop where bishops
        are on same colored squares.
        */

        if (
            remainingPieces.length === 2 &&
            remainingPieces.every(
                piece =>
                    piece.type ===
                        "bishop"
            )
        ) {
            const bishopA =
                remainingPieces[0];

            const bishopB =
                remainingPieces[1];

            const colorA =
                (
                    bishopA.row +
                    bishopA.column
                ) % 2;

            const colorB =
                (
                    bishopB.row +
                    bishopB.column
                ) % 2;

            if (
                colorA === colorB
            ) {
                return true;
            }
        }

        return false;
    }


    /*
    ============================================================
    HELPERS
    ============================================================
    */

    function cloneBoard(
        boardState
    ) {
        return boardState.map(
            row =>
                row.map(
                    piece =>
                        piece
                            ? {
                                ...piece
                            }
                            : null
                )
        );
    }


    function isInsideBoard(
        row,
        column
    ) {
        return (
            row >= 0 &&
            row < 8 &&
            column >= 0 &&
            column < 8
        );
    }


    function oppositeColor(
        color
    ) {
        return (
            color === "white"
                ? "black"
                : "white"
        );
    }


    function capitalize(
        value
    ) {
        return (
            value
                .charAt(0)
                .toUpperCase() +
            value.slice(1)
        );
    }


    function updateTurnDisplay() {
        turnDisplay.textContent =
            capitalize(
                currentTurn
            );
    }


    /*
    ============================================================
    CUSTOM GAME MODAL
    ============================================================
    */

    let gameModalResolver = null;


    function showGameModal({
        title,
        message,
        confirmText = "Confirm",
        danger = false
    }) {
        return new Promise(resolve => {

            gameModalResolver =
                resolve;

            gameModalTitle.textContent =
                title;

            gameModalMessage.textContent =
                message;

            gameModalConfirm.textContent =
                confirmText;


            /*
            Resign can use the darker
            danger button style.
            */

            gameModalConfirm.classList.toggle(
                "danger",
                danger
            );


            /*
            Open modal.
            */

            gameModal.classList.add(
                "is-open"
            );

            gameModal.setAttribute(
                "aria-hidden",
                "false"
            );


            /*
            Put keyboard focus on
            the confirmation button.
            */

            gameModalConfirm.focus();
        });
    }


    function closeGameModal(result) {
        gameModal.classList.remove(
            "is-open"
        );

        gameModal.setAttribute(
            "aria-hidden",
            "true"
        );

        if (gameModalResolver) {
            gameModalResolver(
                result
            );

            gameModalResolver =
                null;
        }
    }


    gameModalCancel.addEventListener(
        "click",
        function () {
            closeGameModal(false);
        }
    );


    gameModalConfirm.addEventListener(
        "click",
        function () {
            closeGameModal(true);
        }
    );


    gameModalBackdrop.addEventListener(
        "click",
        function () {
            closeGameModal(false);
        }
    );


    /*
    Escape closes modal.
    */

    document.addEventListener(
        "keydown",
        function (event) {
            if (
                event.key === "Escape" &&
                gameModal.classList.contains(
                    "is-open"
                )
            ) {
                closeGameModal(false);
            }
        }
    );


    /*
    ============================================================
    DRAW
    ============================================================
    */

    async function offerDraw() {
        if (gameOver) {
            return;
        }

        const offeringPlayer =
            currentTurn;

        const opponent =
            oppositeColor(
                offeringPlayer
            );

        const accepted =
            await showGameModal({
                title:
                    "Draw Offer",

                message:
                    `${capitalize(offeringPlayer)} ` +
                    `offers a draw. ` +
                    `Does ${capitalize(opponent)} accept?`,

                confirmText:
                    "Accept Draw"
            });

        if (!accepted) {
            return;
        }

        gameOver =
            true;

        selectedSquare =
            null;

        turnDisplay.textContent =
            "Draw by agreement";

        createBoard();
    }


    /*
    ============================================================
    RESIGN
    ============================================================
    */

    async function resignGame() {
        if (gameOver) {
            return;
        }

        const resigningPlayer =
            currentTurn;

        const winner =
            oppositeColor(
                resigningPlayer
            );

        const confirmed =
            await showGameModal({
                title:
                    "Resign Game",

                message:
                    `${capitalize(resigningPlayer)}, ` +
                    `are you sure you want to resign?`,

                confirmText:
                    "Resign",

                danger:
                    true
            });

        if (!confirmed) {
            return;
        }

        gameOver =
            true;

        selectedSquare =
            null;

        turnDisplay.textContent =
            `${capitalize(winner)} wins — ` +
            `${capitalize(resigningPlayer)} resigned`;

        createBoard();
    }



    /*
    ============================================================
    NEW GAME
    ============================================================
    */

    async function startNewGame(
        forceStart = false
    ) {
        /*
        Ask before deleting an active game.
        */

        if (
            !forceStart &&
            !gameOver &&
            moveHistory.length > 0
        ) {
            const confirmed =
                await showGameModal({
                    title:
                        "New Game",

                    message:
                        "Start a new game? " +
                        "The current game will be lost.",

                    confirmText:
                        "Start New Game"
                });

            if (!confirmed) {
                return;
            }
        }


        /*
        Reset board.
        */

        board =
            createInitialBoard();


        /*
        Reset game state.
        */

        currentTurn =
            "white";

        selectedSquare =
            null;

        enPassantTarget =
            null;

        halfMoveClock =
            0;

        gameOver =
            false;

        lastMove =
            null;

        previousEngineEvaluation =
            null;

        /*
        Reset captured pieces.
        */

        capturedWhitePieces =
            [];

        capturedBlackPieces =
            [];


        /*
        Reset move history.
        */

        moveHistory =
            [];

        fullMoveNumber =
            1;


        /*
        Reset repetition history.
        */

        positionHistory.clear();

        recordPosition();


        /*
        Refresh interface.
        */

        updateTurnDisplay();

        renderCapturedPieces();

        renderMoveHistory();

        createBoard();
    }


    /*
    ============================================================
    GAME BUTTON EVENTS
    ============================================================
    */

    drawButton.addEventListener(
        "click",
        offerDraw
    );

    resignButton.addEventListener(
        "click",
        resignGame
    );

    newGameButton.addEventListener(
        "click",
        startNewGame
    );


    /*
    ============================================================
    STOCKFISH ENGINE
    ============================================================
    */

    function boardToFEN() {
        const pieceLetters = {
            king: "k",
            queen: "q",
            rook: "r",
            bishop: "b",
            knight: "n",
            pawn: "p"
        };

        const fenRows = [];

        for (let row = 0; row < 8; row++) {
            let fenRow = "";
            let emptySquares = 0;

            for (let column = 0; column < 8; column++) {
                const piece = board[row][column];

                if (!piece) {
                    emptySquares++;
                    continue;
                }

                if (emptySquares > 0) {
                    fenRow += emptySquares;
                    emptySquares = 0;
                }

                let letter = pieceLetters[piece.type];

                if (piece.color === "white") {
                    letter = letter.toUpperCase();
                }

                fenRow += letter;
            }

            if (emptySquares > 0) {
                fenRow += emptySquares;
            }

            fenRows.push(fenRow);
        }

        const activeColor =
            currentTurn === "white"
                ? "w"
                : "b";

        const castling =
            getFENCastlingRights();

        const enPassant =
            getFENEnPassantSquare();

        return (
            fenRows.join("/") +
            " " +
            activeColor +
            " " +
            castling +
            " " +
            enPassant +
            " " +
            halfMoveClock +
            " " +
            fullMoveNumber
        );
    }


    function getFENCastlingRights() {
        let rights = "";

        const whiteKing =
            board[7][4];

        const blackKing =
            board[0][4];


        /*
        White castling.
        */

        if (
            whiteKing &&
            whiteKing.type === "king" &&
            whiteKing.color === "white" &&
            !whiteKing.hasMoved
        ) {
            const rookH1 =
                board[7][7];

            const rookA1 =
                board[7][0];

            if (
                rookH1 &&
                rookH1.type === "rook" &&
                rookH1.color === "white" &&
                !rookH1.hasMoved
            ) {
                rights += "K";
            }

            if (
                rookA1 &&
                rookA1.type === "rook" &&
                rookA1.color === "white" &&
                !rookA1.hasMoved
            ) {
                rights += "Q";
            }
        }


        /*
        Black castling.
        */

        if (
            blackKing &&
            blackKing.type === "king" &&
            blackKing.color === "black" &&
            !blackKing.hasMoved
        ) {
            const rookH8 =
                board[0][7];

            const rookA8 =
                board[0][0];

            if (
                rookH8 &&
                rookH8.type === "rook" &&
                rookH8.color === "black" &&
                !rookH8.hasMoved
            ) {
                rights += "k";
            }

            if (
                rookA8 &&
                rookA8.type === "rook" &&
                rookA8.color === "black" &&
                !rookA8.hasMoved
            ) {
                rights += "q";
            }
        }

        return rights || "-";
    }


    function getFENEnPassantSquare() {
        if (!enPassantTarget) {
            return "-";
        }

        return getSquareName(
            enPassantTarget.row,
            enPassantTarget.column
        );
    }


    /*
    ============================================================
    MOVE QUALITY
    ============================================================
    */

    function classifyMove(
        previousEvaluation,
        newEvaluation,
        playerColor
    ) {
        if (
            previousEvaluation === null ||
            newEvaluation === null
        ) {
            return null;
        }

        let evaluationLoss;

        /*
        Evaluations are always from
        White's point of view.

        Positive = White advantage.
        Negative = Black advantage.
        */

        if (playerColor === "white") {
            evaluationLoss =
                previousEvaluation -
                newEvaluation;
        } else {
            evaluationLoss =
                newEvaluation -
                previousEvaluation;
        }

        /*
        Sometimes the player's move
        improves the evaluation.

        In that case there is no loss.
        */

        evaluationLoss =
            Math.max(
                0,
                evaluationLoss
            );

        console.log(
            "Evaluation loss:",
            evaluationLoss
        );


        /*
        Our own simple classification
        thresholds.

        These are not Chess.com ratings.
        */

        if (evaluationLoss <= 0.10) {
            return "Best";
        }

        if (evaluationLoss <= 0.25) {
            return "Excellent";
        }

        if (evaluationLoss <= 0.50) {
            return "Good";
        }

        if (evaluationLoss <= 1.00) {
            return "Inaccuracy";
        }

        if (evaluationLoss <= 2.00) {
            return "Mistake";
        }

        return "Blunder";
    }


    /*
    ============================================================
    CSRF TOKEN
    ============================================================
    */

    function getCSRFToken() {
        const cookie =
            document.cookie
                .split("; ")
                .find(
                    row =>
                        row.startsWith(
                            "csrftoken="
                        )
                );

        if (!cookie) {
            return "";
        }

        return decodeURIComponent(
            cookie.split("=")[1]
        );
    }



        /*
    ============================================================
    AI TEACHER
    ============================================================
    */

    async function askAITeacher(question) {
        try {
            const response = await fetch(
                "/ai-teacher/",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json",

                        "X-CSRFToken":
                            getCSRFToken()
                    },

                    body: JSON.stringify({
                        question: question,
                        fen: boardToFEN(),
                        language: teacherLanguage
                    })
                }
            );

            const data =
                await response.json();

            if (!response.ok) {
                console.error(
                    "AI teacher error:",
                    data
                );

                return (
                    "I cannot answer that " +
                    "question right now."
                );
            }

            console.log(
                "Teacher answer source:",
                data.source
            );

            return (
                data.answer ||
                "I am not sure how to answer that."
            );

        } catch (error) {
            console.error(
                "Could not connect to AI teacher:",
                error
            );

            return (
                "I cannot connect to my AI " +
                "assistant right now."
            );
        }
    }


    /*
    ============================================================
    CHESS TEACHER MESSAGE
    ============================================================
    */

    function updateTeacherMessage(
        data,
        moveQuality = null
    ) {
        if (!teacherMessage) {
            return;
        }

        /*
        Initial analysis before the player moves.
        */

        if (!moveQuality) {
            if (data.best_move) {
                const activeLanguage =
                    (
                        teacherLanguageSelect &&
                        teacherLanguageSelect.value
                    )
                        ? teacherLanguageSelect.value
                        : (
                            teacherLanguage ||
                            savedTeacherLanguage ||
                            "en-GB"
                        );

                console.log(
                    "Initial teacher language:",
                    activeLanguage
                );

                const initialMessages = {
                    "en-GB":
                        `I am ready. Look carefully at the position. ` +
                        `One strong move is ${data.best_move}.`,

                    "ru-RU":
                        `Я готов. Внимательно посмотрите на позицию. ` +
                        `Один из сильных ходов — ${data.best_move}.`,

                    "kk-KZ":
                        `Мен дайынмын. Позицияға мұқият қараңыз. ` +
                        `Күшті жүрістердің бірі — ${data.best_move}.`,

                    "sv-SE":
                        `Jag är redo. Titta noggrant på ställningen. ` +
                        `Ett starkt drag är ${data.best_move}.`
                };

                teacherMessage.textContent =
                    initialMessages[
                        activeLanguage
                    ] ||
                    initialMessages["en-GB"];
            }

            return;
        }


        /*
        Explain the quality of the player's move.
        */

        const messages = {
            Best:
                "Excellent! That was one of the strongest moves in the position.",

            Excellent:
                "Excellent move! You kept your position very strong.",

            Good:
                "Good move. Your position remains solid, but let's see whether there was something even stronger.",

            Inaccuracy:
                "Be careful. That move was slightly inaccurate. Let's look at the stronger continuation.",

            Mistake:
                "That was a mistake. Before moving, check your opponent's threats and tactical possibilities.",

            Blunder:
                "Watch out! That move gives your opponent a significant advantage. Let's examine what went wrong."
        };


        let message =
            messages[moveQuality] ||
            "Let's analyse this position.";


        /*
        Add Stockfish's recommended continuation.
        */

        if (data.best_move) {
            message +=
                ` From this position, I recommend looking at ${data.best_move}.`;
        }


        /*
        Mate warning.
        */

        if (
            data.mate !== null &&
            data.mate !== undefined
        ) {
            const mateNumber =
                Math.abs(data.mate);

            message +=
                ` There is a forced mate in ${mateNumber}.`;
        }


        teacherMessage.textContent =
            message;
    }

    /*
    ============================================================
    UPDATE ENGINE ANALYSIS PANEL
    ============================================================
    */

    function updateEnginePanel(
        data,
        moveQuality = null
    ) {
        /*
        Evaluation
        */

        if (
            data.mate !== null &&
            data.mate !== undefined
        ) {
            const mateNumber =
                Math.abs(data.mate);

            if (data.mate > 0) {
                engineEvaluation.textContent =
                    `White mate in ${mateNumber}`;
            } else {
                engineEvaluation.textContent =
                    `Black mate in ${mateNumber}`;
            }

        } else if (
            data.evaluation !== null &&
            data.evaluation !== undefined
        ) {
            const evaluation =
                Number(data.evaluation);

            engineEvaluation.textContent =
                evaluation > 0
                    ? `+${evaluation.toFixed(2)}`
                    : evaluation.toFixed(2);

        } else {
            engineEvaluation.textContent = "—";
        }


        /*
        Best move
        */

        engineBestMove.textContent =
            data.best_move || "—";


        /*
        Engine depth
        */

        engineDepth.textContent =
            data.depth ?? "—";


        /*
        Move quality
        */

        engineMoveQuality.className =
            "engine-value";

        if (!moveQuality) {
            engineMoveQuality.textContent = "—";
            return;
        }

        engineMoveQuality.textContent =
            moveQuality;


        /*
        Add quality colour
        */

        const qualityClass =
            "quality-" +
            moveQuality
                .toLowerCase()
                .replace(/\s+/g, "-");

        engineMoveQuality.classList.add(
            qualityClass
        );
    }



    /*
    ============================================================
    ANALYSE POSITION WITH STOCKFISH
    ============================================================
    */

    async function analyseWithStockfish(
        classifyPlayerMove = true
    ) {
        /*
        Do not request another analysis
        after the game has finished,
        except for initial analysis.
        */

        if (
            gameOver &&
            classifyPlayerMove
        ) {
            return;
        }

        const fen =
            boardToFEN();

        console.log(
            "Sending position to Stockfish:",
            fen
        );

        try {
            const response =
                await fetch(
                    "/analyse/",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json",

                            "X-CSRFToken":
                                getCSRFToken()
                        },

                        body:
                            JSON.stringify({
                                fen: fen
                            })
                    }
                );

            const data =
                await response.json();


            /*
            Handle backend errors.
            */

            if (!response.ok) {
                console.error(
                    "Stockfish error:",
                    data
                );

                return;
            }


            /*
            Show engine information
            in browser console.
            */

            console.log(
                "Stockfish result:",
                data
            );

            console.log(
                "Best move:",
                data.best_move
            );

            if (data.mate !== null) {
                console.log(
                    "Mate:",
                    data.mate
                );
            } else {
                console.log(
                    "Evaluation:",
                    data.evaluation
                );
            }


            /*
            If this analysis happened
            after a player's move,
            determine who made that move.

            currentTurn has already changed,
            so the player who moved is the
            opposite color.
            */
            let moveQuality = null;

            if (classifyPlayerMove) {
                const playerColor =
                    currentTurn === "white"
                        ? "black"
                        : "white";

                if (
                    previousEngineEvaluation !== null &&
                    data.evaluation !== null
                ) {
                    moveQuality =
                        classifyMove(
                            previousEngineEvaluation,
                            data.evaluation,
                            playerColor
                        );

                    console.log(
                        "Player:",
                        playerColor
                    );

                    console.log(
                        "Move quality:",
                        moveQuality
                    );
                }
            }


            /*
            Update visible Engine Analysis panel.
            */

            updateEnginePanel(
                data,
                moveQuality
            );

            updateTeacherMessage(
                data,
                moveQuality
            );


            /*
            Store current evaluation for
            comparison after the next move.
            */

            previousEngineEvaluation =
                data.evaluation;


            /*
            Show Stockfish recommended move.
            */

            drawEngineArrow(
                data.best_move
            );


            /*
            Store current evaluation.

            This becomes the "before"
            evaluation when the next
            move is played.
            */

            if (data.evaluation !== null) {
                previousEngineEvaluation =
                    data.evaluation;
            }
            /*
            ============================================================
            TEACHER MAKES STOCKFISH MOVE
            ============================================================
            */

            if (
                teacherPlayMode &&
                classifyPlayerMove &&
                currentTurn === teacherColor &&
                !teacherThinking &&
                !gameOver &&
                data.best_move
            ) {
                await playTeacherGameMove(
                    data.best_move
                );
            }

        } catch (error) {
            console.error(
                "Could not connect to Stockfish:",
                error
            );
        }
    }

    /*
    ============================================================
    START GAME
    ============================================================
    */
    welcomeStudent();

    recordPosition();

    updateTurnDisplay();

    renderCapturedPieces();

    renderMoveHistory();

    createBoard();


    /*
    Analyse the initial chess position.

    false means that this is only the
    starting evaluation.

    No player move should be classified.
    */

    analyseWithStockfish(false);

    /*
    Expose teacher functions for testing.
    */

    window.teacherDemonstrateMove =
        teacherDemonstrateMove;

    window.teacherDemonstrateLine =
        teacherDemonstrateLine;


});
