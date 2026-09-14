document.addEventListener("DOMContentLoaded", function () {

    const chessboard = document.getElementById("chessboard");

    const pieces = {
        black: {
            king: "♚",
            queen: "♛",
            rook: "♜",
            bishop: "♝",
            knight: "♞",
            pawn: "♟"
        },

        white: {
            king: "♔",
            queen: "♕",
            rook: "♖",
            bishop: "♗",
            knight: "♘",
            pawn: "♙"
        }
    };

    const startingPosition = [

        [
            pieces.black.rook,
            pieces.black.knight,
            pieces.black.bishop,
            pieces.black.queen,
            pieces.black.king,
            pieces.black.bishop,
            pieces.black.knight,
            pieces.black.rook
        ],

        [
            pieces.black.pawn,
            pieces.black.pawn,
            pieces.black.pawn,
            pieces.black.pawn,
            pieces.black.pawn,
            pieces.black.pawn,
            pieces.black.pawn,
            pieces.black.pawn
        ],

        ["", "", "", "", "", "", "", ""],
        ["", "", "", "", "", "", "", ""],
        ["", "", "", "", "", "", "", ""],
        ["", "", "", "", "", "", "", ""],

        [
            pieces.white.pawn,
            pieces.white.pawn,
            pieces.white.pawn,
            pieces.white.pawn,
            pieces.white.pawn,
            pieces.white.pawn,
            pieces.white.pawn,
            pieces.white.pawn
        ],

        [
            pieces.white.rook,
            pieces.white.knight,
            pieces.white.bishop,
            pieces.white.queen,
            pieces.white.king,
            pieces.white.bishop,
            pieces.white.knight,
            pieces.white.rook
        ]
    ];

    let selectedSquare = null;

    function createBoard() {

        chessboard.innerHTML = "";

        startingPosition.forEach((row, rowIndex) => {

            row.forEach((piece, columnIndex) => {

                const square = document.createElement("div");

                square.classList.add("square");

                const isLightSquare =
                    (rowIndex + columnIndex) % 2 === 0;

                square.classList.add(
                    isLightSquare ? "light" : "dark"
                );

                square.dataset.row = rowIndex;
                square.dataset.column = columnIndex;

                square.textContent = piece;

                square.addEventListener(
                    "click",
                    handleSquareClick
                );

                chessboard.appendChild(square);
            });
        });
    }


    function handleSquareClick(event) {

        const clickedSquare = event.currentTarget;

        if (selectedSquare === null) {

            if (clickedSquare.textContent === "") {
                return;
            }

            selectedSquare = clickedSquare;

            selectedSquare.classList.add("selected");

            return;
        }

        movePiece(selectedSquare, clickedSquare);

        selectedSquare.classList.remove("selected");

        selectedSquare = null;
    }


    function movePiece(fromSquare, toSquare) {

        toSquare.textContent = fromSquare.textContent;

        fromSquare.textContent = "";
    }


    createBoard();

});
