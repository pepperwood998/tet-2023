const DOT_COUNT = 9;
const QUIZS = [
  {
    quote: "An khang thịnh vượng - Vạn sự như ý.",
    order: [8, 5, 2, 1, 3]
  },
  {
    quote: "Chúc Tết đến trăm điều như ý - Mừng xuân sang vạn sự thành công.",
    order: [7, 4, 1, 5, 3, 6, 9]
  },
  {
    quote: "Năm tăng phú quý - Ngày hưởng vinh hoa.",
    order: [1, 2, 3, 5, 7, 8, 9]
  },
  {
    quote: "Năm năm xuân như ý - Tuổi tuổi ngày bình an.",
    order: [1, 5, 3, 6, 8, 9]
  },
  {
    quote: "Tống cựu nghênh tân - Vạn sự cát tường - Toàn gia hạnh phúc.",
    order: [1, 6, 2, 4, 8, 3]
  }
];
const WRONG_FEEDBACK = "Xin hãy thử lại!";
const CORRECT_FEEDBACK = "Tuyệt vời, chính xác rùi!";
const NORMAL_FEEDBACK = "Câu này dễ lắm!";

$(function () {
  let container = $(".container");
  let lockBoard = $(".lock-board");
  let lockBoardDrawer = $("#lock-board-drawer");
  let quoteText = $(".quote-text");
  let lockBoardOrder = $(".lock-board-order");
  let lockFeedback = $(".lock-feedback");
  let popSound = $("#pop-sound");
  let ctx = lockBoardDrawer[0].getContext("2d");
  let dotDataList = [];
  let currentQuizIndex = 0;

  for (let i = 0; i < DOT_COUNT; i++) {
    let template = document.createElement("template");
    template.innerHTML = `
      <div class="lock-board-item-wrapper" data-drag-type="noscroll" id=${i}>
        <div class="lock-board-dot" data-drag-type="noscroll"></div>
      </div>
    `;
    let dotElement = template.content.firstElementChild;
    dotDataList.push({
      element: dotElement,
      selected: false,
    });
    lockBoard.append(template.content.firstElementChild);
  }
  lockBoardDrawer.width(lockBoard.width());
  lockBoardDrawer.height(lockBoard.height());
  ctx.canvas.width = lockBoardDrawer.width();
  ctx.canvas.height = lockBoardDrawer.height();

  let lockDotWrapper = $(".lock-board-item-wrapper");
  let lockDot = $(".lock-board-dot");
  let offset =
    parseInt(lockDotWrapper.css("borderWidth"), 10) +
    parseInt(lockDotWrapper.css("padding"), 10) +
    lockDot.width() / 2;

  SetCurrentQuiz(currentQuizIndex);

  container.on('touchmove', function (e) {
    if (e.target !== null) {
      let dragType = e.target.getAttribute("data-drag-type");
      if (dragType === "noscroll") {
        e.preventDefault();
      }
    }
  });

  let activeDotDataList = [];
  function DrawResult() {
    ClearDrawer();
    if (activeDotDataList.length > 1) {
      let lastDot = $(activeDotDataList[0].element);
      for (let i = 1; i < activeDotDataList.length; i++) {
        let nextDot = $(activeDotDataList[i].element);
        let { dotX: lastDotX, dotY: lastDotY } = GetDotCoords(lastDot);
        let { dotX: nextDotX, dotY: nextDotY } = GetDotCoords(nextDot);
        DrawLine(
          lastDotX, lastDotY,
          nextDotX, nextDotY);
        lastDot = $(activeDotDataList[i].element);
      }
    }

    if (activeDotDataList.length > 0) {
      return activeDotDataList[activeDotDataList.length - 1];
    }
  }

  function DrawLine(sourceX, sourceY, targetX, targetY) {
    ctx.beginPath();
    ctx.strokeStyle = "#ff9fe8";
    ctx.lineWidth = 5;
    ctx.lineCap = "round";
    ctx.moveTo(sourceX, sourceY);
    ctx.lineTo(targetX, targetY);
    ctx.stroke();
  }

  function ClearDrawer() {
    ctx.clearRect(0, 0, lockBoardDrawer.width(), lockBoardDrawer.height());
  }

  let clicked = false;
  let isInteractable = true;
  lockBoard.on("mousedown touchstart", function (e) {
    if (!isInteractable) { return; }

    let { mouseX, mouseY } = GetMouseCoords(e, $(this));

    UpdateDotData(mouseX, mouseY);
    clicked = true;
  });

  lockBoard.on("mousemove touchmove", function (e) {
    if (!clicked) { return; }

    let { mouseX, mouseY } = GetMouseCoords(e, $(this));

    UpdateDotData(mouseX, mouseY);

    let lastDotData = DrawResult();
    if (!lastDotData) { return; }

    let lastDot = $(lastDotData.element);
    let { dotX, dotY } = GetDotCoords(lastDot);
    DrawLine(
      dotX, dotY,
      mouseX, mouseY
    )
  });

  $(document).on("mouseup touchend", function () {
    clicked = false;

    if (activeDotDataList.length === 0) {
      console.log("No dot selected!");
      return;
    }

    if (currentQuizIndex >= QUIZS.length) {
      console.log("No quiz available!");
      return;
    }

    isInteractable = false;
    DrawResult();

    let currentQuiz = QUIZS[currentQuizIndex].order;
    let isCorrect = CheckQuizAnswer(activeDotDataList, currentQuiz);
    if (!isCorrect) {
      PlayWrongAnim();
      lockBoardDrawer.css("opacity", 0);
      lockFeedback.text(WRONG_FEEDBACK);
      setTimeout(() => {
        ResetBoard();
      }, 500)
    }
    else {
      lockFeedback.text(CORRECT_FEEDBACK);
      setTimeout(() => {
        ResetBoard();

        lockFeedback.text(NORMAL_FEEDBACK);
        let index = Math.floor(Math.random() * QUIZS.length);
        SetCurrentQuiz(index);
      }, 800)
    }
    setTimeout(() => {
      isInteractable = true;
    }, 1000);
  });

  function UpdateDotData(mouseX, mouseY) {
    for (let i = 0; i < dotDataList.length; i++) {
      let dotData = dotDataList[i];
      if (dotData.selected) { continue; }

      let dot = $(dotData.element);
      let { dotX, dotY } = GetDotCoords(dot);
      let sqrDist = Math.pow(mouseX - dotX, 2) + Math.pow(mouseY - dotY, 2);
      let dist = Math.sqrt(sqrDist);
      if (dist <= offset) {
        if (activeDotDataList.length > 0) {
          if (activeDotDataList[activeDotDataList.length - 1].element === dotData.element) {
            continue;
          }
        }
        popSound[0].play();
        ToggleDotSelected(dotData, true);
        activeDotDataList.push({
          ...dotData,
          index: i,
        });
        break;
      }
    }
  }

  function GetMouseCoords(e, bound) {
    let mouseX = 0;
    let mouseY = 0;
    if (e.type.startsWith("mouse")) {
      mouseX = e.pageX - bound.offset().left;
      mouseY = e.pageY - bound.offset().top;
    }
    else if (e.type.startsWith("touch")) {
      mouseX = e.originalEvent.touches[0].pageX - bound.offset().left;
      mouseY = e.originalEvent.touches[0].pageY - bound.offset().top;
    }

    return {
      mouseX,
      mouseY,
    }
  }

  function GetDotCoords(dot) {
    return {
      dotX: dot.position().left + offset,
      dotY: dot.position().top + offset,
    }
  }

  function CheckQuizAnswer(answerDotDataList, quiz) {
    if (answerDotDataList.length !== quiz.length) { return false; }

    for (let i = 0; i < answerDotDataList.length; i++) {
      let dotData = answerDotDataList[i];
      if (dotData.index + 1 !== quiz[i]) { return false; }
    }

    return true;
  }

  function SetCurrentQuiz(index) {
    currentQuizIndex = index;

    let quiz = QUIZS[index];
    quoteText.text(`"${quiz.quote}"`);
    lockBoardOrder.text(quiz.order.join(" "));
  }

  function ToggleDotSelected(dotData, selected) {
    let dot = $(dotData.element);
    if (selected) {
      dot.addClass("selected");
    }
    else {
      dot.removeClass("selected");
    }
    dotData.selected = selected;
  }

  function ResetBoard() {
    ClearDrawer();
    lockBoardDrawer.css("opacity", 1);
    activeDotDataList = [];
    for (let i = 0; i < dotDataList.length; i++) {
      ToggleDotSelected(dotDataList[i], false);
    }
  }

  function PlayWrongAnim() {
    // lockFeedback.removeClass("wrong");
    // void lockFeedback.width();

    // lockFeedback.addClass("wrong");
  }
});