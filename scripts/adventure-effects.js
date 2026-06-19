(function () {
  var viewport = {
    width: window.innerWidth || document.documentElement.clientWidth || 1200,
    height: window.innerHeight || document.documentElement.clientHeight || 800
  };

  function $(selector) {
    return document.querySelector(selector);
  }

  function updateViewport() {
    viewport.width = window.innerWidth || document.documentElement.clientWidth || 1200;
    viewport.height = window.innerHeight || document.documentElement.clientHeight || 800;
  }

  window.addEventListener('resize', updateViewport, { passive: true });

  function anchorPoint(kind) {
    const vw = viewport.width;
    const vh = viewport.height;
    if (kind === 'map') {
      return { x: Math.max(190, vw * 0.22), y: Math.max(170, vh * 0.42) };
    }
    if (kind === 'win') {
      return { x: vw * 0.5, y: vh * 0.42 };
    }
    return { x: vw * 0.5, y: vh * 0.43 };
  }

  function burst(text, color, kind) {
    const pos = anchorPoint(kind);
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
        burst('前进', '#668d66', 'map');
      } else {
        restartClass(quiz, 'answer-wrong');
        burst('停留', '#bd6657', 'quiz');
      }
    },
    win: function () {
      burst('通关', '#b47d3a', 'win');
    }
  };
})();
