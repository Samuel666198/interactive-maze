(function () {
  function $(selector) {
    return document.querySelector(selector);
  }

  function centerOf(el) {
    const rect = el.getBoundingClientRect();
    return {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2
    };
  }

  function burst(text, color, target) {
    if (!target) return;
    const pos = centerOf(target);
    const el = document.createElement('div');
    el.className = 'adventure-burst';
    el.textContent = text;
    el.style.setProperty('--x', pos.x + 'px');
    el.style.setProperty('--y', pos.y + 'px');
    el.style.setProperty('--burst-color', color);
    document.body.appendChild(el);
    setTimeout(function () {
      el.remove();
    }, 760);
  }

  function restartClass(el, className) {
    if (!el) return;
    el.classList.remove(className);
    if (className === 'map-advance') el.style.willChange = 'transform';
    else if (className === 'answer-correct') el.style.willChange = 'transform, opacity';
    else if (className === 'answer-wrong') el.style.willChange = 'transform';
    requestAnimationFrame(function () {
      el.classList.add(className);
    });
    setTimeout(function () {
      el.classList.remove(className);
      el.style.willChange = '';
    }, 520);
  }

  window.adventureFX = {
    answer: function (isCorrect) {
      const quiz = $('#quizPanel');
      const canvas = $('#mazeCanvas');
      if (isCorrect) {
        restartClass(quiz, 'answer-correct');
        restartClass(canvas, 'map-advance');
        burst('前进', '#668d66', canvas);
      } else {
        restartClass(quiz, 'answer-wrong');
        burst('停留', '#bd6657', quiz);
      }
    },
    win: function () {
      const card = $('.win-card');
      burst('通关', '#b47d3a', card);
    }
  };
})();
