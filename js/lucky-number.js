const FloatDirectionNone = "None";
const FloatDirectionUp = "Up";
const FloatDirectionDown = "Down";

const RandomStateNone = "None";
const RandomStateStart = "Start";
const RandomStateTransitioningIn = "TransitioningIn";
// const RandomStateTransitioningOut = "TransitioningOut";
const RandomStateInProgress = "InProgress";
const RandomStateDone = "Done";

const SpinStateNone = "None";
const SpinStateAccel = "Accel";
const SpinStateDecel = "Decel";

$(function () {
  let luckyNumber = $(".lucky-number");
  let luckyNumberText = $(".lucky-number-text");
  let luckyNumberCover = $(".lucky-number-cover");
  let maxSpeedY = 1.5;
  let speedY = maxSpeedY;

  let lastTop = 0;
  let currentTop = 0;
  let floatDir = FloatDirectionNone;
  let randomState = RandomStateNone;
  let maxRange = 8;
  let modifier = 0.5;
  let interval = 20;
  const acceleration = Math.pow(maxSpeedY, 2) / (2 * maxRange);
  let canSpin = false;
  let floater = StartFloater(function () {
    StartRandomAnimation(true);
  });

  let randomAnimTimeout;
  let randomTimeout;
  function StartRandomAnimation(needCover) {
    canSpin = true;
    if (needCover) {
      clearTimeout(randomTimeout);
      randomTimeout = setTimeout(function () {
        luckyNumberText.text(Math.ceil(Math.random() * 10));
      }, 500);
    }
    else {
      luckyNumberText.text(Math.ceil(Math.random() * 10));
    }
    Spin(function () {
      randomState = RandomStateNone;
      ToggleCover(false);
    });
  }

  luckyNumber.on("click", function () {
    switch (randomState) {
      case RandomStateNone: {
        randomState = RandomStateStart;
        break;
      }
      case RandomStateInProgress: {
        clearTimeout(randomAnimTimeout);
        StartRandomAnimation(false);
        break;
      }
      // case RandomStateTransitioningOut: {
      //   randomState = RandomStateStart;
      //   break;
      // }
    }
  });

  function StartFloater(randomCb) {
    let floater = setInterval(function () {
      if (randomState === RandomStateInProgress) {
        return;
      }

      if (randomState === RandomStateStart) {
        randomState = RandomStateTransitioningIn;
      }
      if (randomState === RandomStateTransitioningIn) {
        if (lastTop * currentTop <= 0) {
          ToggleCover(true);
          randomState = RandomStateInProgress;
          SetCurrentTop(0);
          randomCb();
        }

        if (floatDir === FloatDirectionUp && currentTop < 0) {
          floatDir = FloatDirectionDown;
        }
        else if (floatDir === FloatDirectionDown && currentTop > 0) {
          floatDir = FloatDirectionUp;
        }
      }

      if (floatDir === FloatDirectionNone) {
        floatDir = FloatDirectionUp;
      }

      if (floatDir === FloatDirectionUp) {
        if (currentTop > -maxRange) {
          let accel = acceleration;
          if (currentTop <= 0) {
            accel = -acceleration;
          }
          speedY = CalculateSpeed(maxSpeedY, accel, Math.abs(currentTop));

          let newTop = currentTop - speedY;
          SetCurrentTop(newTop);
        }
        else {
          floatDir = FloatDirectionDown;
        }
      }

      if (floatDir === FloatDirectionDown) {
        if (currentTop < maxRange) {
          let accel = acceleration;
          if (currentTop > 0) {
            accel = -acceleration;
          }
          speedY = CalculateSpeed(maxSpeedY, accel, Math.abs(currentTop));

          let newTop = currentTop + speedY;
          SetCurrentTop(newTop);
        }
        else {
          floatDir = FloatDirectionUp;
        }
      }
    }, interval);
    return floater;
  }

  function SetCurrentTop(value) {
    lastTop = currentTop;
    currentTop = value;
    luckyNumber.css({ top: value });
  }

  function CalculateSpeed(maxSpeed, accel, height) {
    let diff = 2 * accel * height;
    let some = diff + Math.pow(maxSpeed, 2);
    let speed = Math.sqrt(some) * modifier;
    return speed;
  }

  let currentRotation = 0;
  let spinSpeed = 0;
  let maxSpinSpeed = 50;
  let spinAccel = 1;
  let spinState = SpinStateNone;
  let spinInterval;
  function Spin(finishCb) {
    spinState = SpinStateNone;

    clearInterval(spinInterval);
    spinInterval = setInterval(function () {
      if (!canSpin) { return; }

      if (spinState === SpinStateNone) {
        spinState = SpinStateAccel;
      }

      if (spinState === SpinStateAccel && spinSpeed < maxSpinSpeed) {
        spinSpeed += spinAccel;

        if (spinSpeed >= maxSpinSpeed) {
          spinState = SpinStateDecel;
          spinSpeed = maxSpinSpeed
        }
      }

      if (spinState === SpinStateDecel && spinSpeed > 0) {
        spinSpeed -= spinAccel;

        if (spinSpeed <= 0) {
          spinState = SpinStateNone;
          spinSpeed = 0;
          canSpin = false;
          finishCb();
        }
      }

      currentRotation += spinSpeed;
      if (currentRotation >= 360) {
        currentRotation = 0;
      }
      luckyNumberCover.css({ transform: "rotate(" + currentRotation + "deg)" });
    }, 20);
  }

  function ToggleCover(enabled) {
    if (enabled) {
      luckyNumber.addClass("randomizing");
    }
    else {
      luckyNumber.removeClass("randomizing");
    }
  }
});