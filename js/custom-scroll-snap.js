$(function () {
  let dotButton = $(".dot");
  let someArr = ["first", "second", "third", "fourth"];
  let container = $(".container");
  let currentSectionIndex = 0;
  let canWheelScroll = true;
  let lastScrollPosition = 0;

  let currentActiveDotIndex = 0;

  function switchToNext() {
    var _this = $(this);

    let index = _this.index();
    scroll(index, updateDots);
    // if (_this.hasClass("active")) {
    //   return;
    // } else {
    //   currentActiveDotIndex = index;

    //   $(".dot.active").removeClass("active");
    //   _this.addClass("active");
    // }
  }

  function scroll(index, onStart) {
    if (index < 0 || index > someArr.length - 1) {
      return;
    }

    canWheelScroll = false;

    onStart(index);

    let top = $("#" + someArr[index]).offset().top + container.scrollTop();
    container.animate({
      scrollTop: top
    }, 500, function () {
      canWheelScroll = true;
      currentSectionIndex = index;
      lastScrollPosition = container.scrollTop();
    });
  }

  function updateDots(index) {
    $($(".dot")[currentActiveDotIndex]).removeClass("active");
    $($(".dot")[index]).addClass("active");
    currentActiveDotIndex = index;
  }

  dotButton.on("click", switchToNext);

  let isTouching = false;
  let touchPosY;
  container.bind("touchstart", function (e) {
    console.log("touching", e.originalEvent.touches[0]);
    isTouching = true;
    touchPosY = e.originalEvent.touches[0].pageY;
  });
  container.mousemove(function (e) {
    if (isTouching) {
      console.log("moving");
    }
  });
  container.bind("touchend", function (e) {
    isTouching = false;
    console.log("touchingoff", e);
    let releasePosY = e.originalEvent.changedTouches[0].pageY;;
    if (releasePosY > touchPosY) {
      scroll(currentSectionIndex - 1, updateDots);
    }
    else if (releasePosY < touchPosY) {
      scroll(currentSectionIndex + 1, updateDots);
    }
  });
  container.scroll(function (e) {
    // if (!canWheelScroll) {
    //   return;
    // }

    // let nextScrollPosition = container.scrollTop();
    // if (nextScrollPosition > lastScrollPosition) {
    //   scroll(currentSectionIndex + 1, updateDots);
    // } else if (nextScrollPosition < lastScrollPosition) {
    //   scroll(currentSectionIndex - 1, updateDots);
    // }
  });
});