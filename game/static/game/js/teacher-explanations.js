/*
============================================================
AZACHESS TEACHER EXPLANATIONS
============================================================

This file contains the chess teacher's explanation logic.

It explains concepts such as:

- development
- center control
- attacks
- defense
- king safety
- pawn structure
- tactics
- strategy
- special moves

============================================================
*/


/*
============================================================
GET CHESS API
============================================================

Do NOT destructure AzaChessTeacherAPI when this file loads.

chess.js creates the API inside DOMContentLoaded, so we get the
API only when an explanation is actually requested.
*/

function getAzaChessTeacherAPI() {
    const api =
        window.AzaChessTeacherAPI;

    if (!api) {
        console.error(
            "AzaChessTeacherAPI is not available."
        );

        return null;
    }

    return api;
}


/*
============================================================
TEACHER EXPLANATION MODULES
============================================================
*/


/*
============================================================
DEVELOPMENT
============================================================
*/

function getTeacherDevelopmentReasons(context) {
    const reasons = [];

    const {
        piece,
        fromRow
    } = context;

    if (
        piece.type === "knight" ||
        piece.type === "bishop"
    ) {
        const startingRow =
            piece.color === "white"
                ? 7
                : 0;

        if (fromRow === startingRow) {
            reasons.push(
                `develops the ${piece.type}`
            );
        }
    }

    return reasons;
}


/*
============================================================
CENTRE
============================================================
*/

function getTeacherCenterReasons(context) {
    const reasons = [];

    const {
        piece,
        toColumn,
        destination,
        controlledEmptySquares = []
    } = context;

    const centralSquares = [
        "d4",
        "e4",
        "d5",
        "e5"
    ];


    /*
    Moving directly into the centre.
    */

    if (
        centralSquares.includes(
            destination
        )
    ) {
        reasons.push(
            "fights for the centre"
        );
    }


    /*
    Central pawn development.
    */

    if (
        piece.type === "pawn" &&
        (
            toColumn === 3 ||
            toColumn === 4
        )
    ) {
        if (
            !reasons.includes(
                "fights for the centre"
            )
        ) {
            reasons.push(
                "helps control the centre"
            );
        }
    }


    /*
    Important central squares controlled
    after the move.
    */

    const importantControlledSquares =
        controlledEmptySquares.filter(
            square =>
                centralSquares.includes(
                    square
                )
        );

    if (
        importantControlledSquares.length > 0
    ) {
        reasons.push(
            `controls ` +
            `${importantControlledSquares.join(" and ")}`
        );
    }

    return reasons;
}


/*
============================================================
ATTACKS AND CAPTURES
============================================================
*/

function getTeacherAttackReasons(context) {
    const reasons = [];

    const {
        piece,
        target,
        attackedPieces = [],
        getTeacherPieceName
    } = context;


    /*
    Direct capture.
    */

    if (
        target &&
        target.color !== piece.color
    ) {
        reasons.push(
            `captures the enemy ` +
            `${getTeacherPieceName(target)}`
        );
    }


    /*
    Enemy pieces attacked after the move.
    */

    if (attackedPieces.length > 0) {
        const targetDescriptions =
            attackedPieces.map(
                attackedPiece =>
                    `${attackedPiece.name} ` +
                    `on ${attackedPiece.square}`
            );

        if (
            targetDescriptions.length === 1
        ) {
            reasons.push(
                `attacks the enemy ` +
                `${targetDescriptions[0]}`
            );
        } else {
            reasons.push(
                `attacks the enemy ` +
                `${targetDescriptions.join(" and ")}`
            );
        }
    }

    return reasons;
}


/*
============================================================
DEFENSE
============================================================
*/

function getTeacherDefenseReasons(context) {
    const reasons = [];

    const {
        defendedPieces = []
    } = context;

    if (defendedPieces.length === 0) {
        return reasons;
    }

    const defendedDescriptions =
        defendedPieces.map(
            target =>
                `${target.name} on ${target.square}`
        );

    if (
        defendedDescriptions.length === 1
    ) {
        reasons.push(
            `defends the ` +
            `${defendedDescriptions[0]}`
        );
    } else {
        reasons.push(
            `defends the ` +
            `${defendedDescriptions.join(" and ")}`
        );
    }

    return reasons;
}


/*
============================================================
KING SAFETY
============================================================
*/

function getTeacherKingSafetyReasons(context) {
    const reasons = [];

    const {
        piece,
        fromRow,
        fromColumn,
        toRow,
        toColumn,
        api
    } = context;

    const {
        cloneBoard,
        canCastle,
        getBoard,
        setBoard
    } = api;


    /*
    Actual castling.
    */

    if (
        piece.type === "king" &&
        Math.abs(
            toColumn - fromColumn
        ) === 2
    ) {
        reasons.push(
            "improves king safety by castling"
        );

        return reasons;
    }


    /*
    Preparing kingside castling.

    Moving the knight from g1/g8 or
    bishop from f1/f8 may clear the
    path between king and rook.
    */

    const startingRow =
        piece.color === "white"
            ? 7
            : 0;

    const movedKingsideKnight =
        piece.type === "knight" &&
        fromRow === startingRow &&
        fromColumn === 6;

    const movedKingsideBishop =
        piece.type === "bishop" &&
        fromRow === startingRow &&
        fromColumn === 5;

    if (
        movedKingsideKnight ||
        movedKingsideBishop
    ) {
        const currentBoard =
            getBoard();

        const castlingBoard =
            cloneBoard(
                currentBoard
            );


        /*
        Apply the proposed move to our
        temporary board.
        */

        castlingBoard[
            toRow
        ][
            toColumn
        ] =
            castlingBoard[
                fromRow
            ][
                fromColumn
            ];

        castlingBoard[
            fromRow
        ][
            fromColumn
        ] = null;


        const king =
            castlingBoard[
                startingRow
            ][4];

        const rook =
            castlingBoard[
                startingRow
            ][7];

        const bishopSquare =
            castlingBoard[
                startingRow
            ][5];

        const knightSquare =
            castlingBoard[
                startingRow
            ][6];


        const kingAndRookCanCastle =
            king &&
            king.type === "king" &&
            king.color === piece.color &&
            !king.hasMoved &&
            rook &&
            rook.type === "rook" &&
            rook.color === piece.color &&
            !rook.hasMoved;

        const castlingPathClear =
            !bishopSquare &&
            !knightSquare;


        if (
            kingAndRookCanCastle &&
            castlingPathClear
        ) {
            const originalBoardForCastling =
                getBoard();

            try {
                /*
                canCastle() uses the real board
                variable inside chess.js.

                Temporarily give it our simulated
                position.
                */

                setBoard(
                    castlingBoard
                );

                const castlingIsLegal =
                    canCastle(
                        piece.color,
                        "kingSide"
                    );

                if (castlingIsLegal) {
                    reasons.push(
                        "makes kingside castling available"
                    );
                } else {
                    reasons.push(
                        "clears the path for kingside castling"
                    );
                }
            } finally {
                /*
                Always restore the real position.
                */

                setBoard(
                    originalBoardForCastling
                );
            }
        } else {
            reasons.push(
                "helps prepare kingside castling"
            );
        }
    }

    return reasons;
}


/*
============================================================
PAWN IDEAS
============================================================

We will expand this module after the file separation
has been tested successfully.
============================================================
*/

function getTeacherPawnReasons(context) {
    const reasons = [];

    /*
    Pawn breaks
    passed pawns
    connected pawns
    isolated pawns
    doubled pawns
    pawn chains
    space
    promotion
    en passant
    king pawn shield
    opening lines
    will be added here.
    */

    return reasons;
}


/*
============================================================
TACTICS
============================================================
*/

function getTeacherTacticalReasons(context) {
    const reasons = [];

    /*
    Check
    checkmate
    forks
    pins
    skewers
    discovered attacks
    double attacks
    will be added here.
    */

    return reasons;
}


/*
============================================================
SPECIAL MOVES
============================================================
*/

function getTeacherSpecialMoveReasons(context) {
    const reasons = [];

    /*
    Promotion
    en passant
    and other special-move explanations
    will be added here.
    */

    return reasons;
}


/*
============================================================
GENERATE TEACHER EXPLANATION
============================================================
*/

function generateTeacherExplanation(
    uciMove
) {
    const api =
        getAzaChessTeacherAPI();

    if (!api) {
        return "Let's examine this move.";
    }


    /*
    Get only the chess functionality
    needed by the explanation system.
    */

    const {
        teacherUciToCoordinates,
        getTeacherPieceName,
        getSquareName,
        cloneBoard,
        getTeacherControlledSquares,
        getBoard,
        setBoard
    } = api;


    const coordinates =
        teacherUciToCoordinates(
            uciMove
        );

    if (!coordinates) {
        return "Let's examine this move.";
    }


    const {
        fromRow,
        fromColumn,
        toRow,
        toColumn
    } = coordinates;


    /*
    Get the real current position.
    */

    const board =
        getBoard();

    const piece =
        board[
            fromRow
        ][
            fromColumn
        ];

    if (!piece) {
        return "Let's examine this move.";
    }


    const target =
        board[
            toRow
        ][
            toColumn
        ];

    const pieceName =
        getTeacherPieceName(
            piece
        );

    const destination =
        getSquareName(
            toRow,
            toColumn
        );

    const reasons = [];


    /*
    ========================================================
    CREATE TEMPORARY POSITION AFTER THE MOVE
    ========================================================
    */

    const temporaryBoard =
        cloneBoard(
            board
        );

    temporaryBoard[
        toRow
    ][
        toColumn
    ] =
        temporaryBoard[
            fromRow
        ][
            fromColumn
        ];

    temporaryBoard[
        fromRow
    ][
        fromColumn
    ] = null;


    /*
    ========================================================
    FIND SQUARES CONTROLLED AFTER THE MOVE
    ========================================================

    getTeacherControlledSquares() reads the internal
    chess.js board.

    Temporarily replace the board, calculate the
    controlled squares, then restore it.
    */

    const originalBoard =
        getBoard();

    let controlledSquares = [];

    try {
        setBoard(
            temporaryBoard
        );

        controlledSquares =
            getTeacherControlledSquares(
                toRow,
                toColumn
            );
    } finally {
        setBoard(
            originalBoard
        );
    }


    /*
    ========================================================
    FIND ATTACKED / DEFENDED PIECES AND EMPTY SQUARES
    ========================================================
    */

    const attackedPieces = [];

    const defendedPieces = [];

    const controlledEmptySquares = [];


    controlledSquares.forEach(
        position => {

            const controlledPiece =
                temporaryBoard[
                    position.row
                ][
                    position.column
                ];

            const controlledSquare =
                getSquareName(
                    position.row,
                    position.column
                );


            /*
            Empty controlled square.
            */

            if (!controlledPiece) {
                controlledEmptySquares.push(
                    controlledSquare
                );

                return;
            }


            /*
            Enemy piece attacked.
            */

            if (
                controlledPiece.color !==
                piece.color
            ) {
                attackedPieces.push({
                    name:
                        getTeacherPieceName(
                            controlledPiece
                        ),

                    square:
                        controlledSquare
                });

                return;
            }


            /*
            Friendly piece defended.
            */

            defendedPieces.push({
                name:
                    getTeacherPieceName(
                        controlledPiece
                    ),

                square:
                    controlledSquare
            });
        }
    );


    /*
    ========================================================
    EXPLANATION CONTEXT
    ========================================================
    */

    const explanationContext = {
        api,

        piece,
        pieceName,
        target,

        fromRow,
        fromColumn,

        toRow,
        toColumn,

        destination,
        uciMove,

        attackedPieces,
        defendedPieces,
        controlledEmptySquares,

        getTeacherPieceName
    };


    /*
    ========================================================
    DEVELOPMENT
    ========================================================
    */

    reasons.push(
        ...getTeacherDevelopmentReasons(
            explanationContext
        )
    );


    /*
    ========================================================
    CENTRE
    ========================================================
    */

    reasons.push(
        ...getTeacherCenterReasons(
            explanationContext
        )
    );


    /*
    ========================================================
    ATTACKS AND CAPTURES
    ========================================================
    */

    reasons.push(
        ...getTeacherAttackReasons(
            explanationContext
        )
    );


    /*
    ========================================================
    DEFENSE
    ========================================================
    */

    reasons.push(
        ...getTeacherDefenseReasons(
            explanationContext
        )
    );


    /*
    ========================================================
    KING SAFETY
    ========================================================
    */

    reasons.push(
        ...getTeacherKingSafetyReasons(
            explanationContext
        )
    );


    /*
    ========================================================
    PAWN IDEAS
    ========================================================
    */

    reasons.push(
        ...getTeacherPawnReasons(
            explanationContext
        )
    );


    /*
    ========================================================
    TACTICS
    ========================================================
    */

    reasons.push(
        ...getTeacherTacticalReasons(
            explanationContext
        )
    );


    /*
    ========================================================
    SPECIAL MOVES
    ========================================================
    */

    reasons.push(
        ...getTeacherSpecialMoveReasons(
            explanationContext
        )
    );


    /*
    ========================================================
    REMOVE DUPLICATE EXPLANATIONS
    ========================================================
    */

    const uniqueReasons =
        [...new Set(reasons)];


    /*
    ========================================================
    BUILD FINAL SENTENCE
    ========================================================
    */

    if (
        uniqueReasons.length === 0
    ) {
        return (
            `The ${pieceName} moves to ` +
            `${destination}. Let's examine ` +
            `how this changes the position.`
        );
    }


    if (
        uniqueReasons.length === 1
    ) {
        return (
            `The ${pieceName} moves to ` +
            `${destination} and ` +
            `${uniqueReasons[0]}.`
        );
    }


    const finalReasons =
        [...uniqueReasons];

    const lastReason =
        finalReasons.pop();

    return (
        `The ${pieceName} moves to ` +
        `${destination}. It ` +
        `${finalReasons.join(", ")} and ` +
        `${lastReason}.`
    );
}


/*
============================================================
PUBLIC EXPLANATION API
============================================================
*/

window.AzaChessTeacherExplanations = {
    generate:
        generateTeacherExplanation
};