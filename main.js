new (function () {
  const container = document.querySelector('#game .container');
  const createNewGameBtn = document.querySelector('#game input[type="button"]');
  const log = document.querySelector('#game textarea');
  const scoreTable = document.querySelector('#game .score');

  createNewGameBtn.addEventListener('click', refresh);

  let thisGame = createNewGame();

  function createNewGame(seq = []) {
    if (!seq.length) {
      do {
        seq = generateRandomSeq();
      } while (!hasSolution(seq));
    }

    renderSequence(seq);

    const empty = document.querySelector('.droppable');

    setDraggable(empty);

    DragManager.onDragCancel = function (dragObject) {
      dragObject.avatar.rollback();
    };

    DragManager.onDragEnd = function (dragObject) {
      //меняем местами в контейнере дырку и чиселку
      container.insertBefore(dragObject.avatar, empty.nextSibling);
      container.insertBefore(empty, dragObject.avatar.old.nextSibling);

      //чиселке даем координаты дырки
      //а дырке даем координаты чиселки, что были раньше
      [dragObject.avatar.style.left, dragObject.avatar.style.top, dragObject.avatar.style.zIndex] = [
        empty.style.left,
        empty.style.top,
        dragObject.avatar.old.zIndex,
      ];
      [empty.style.left, empty.style.top] = [dragObject.avatar.old.left, dragObject.avatar.old.top];

      //проверка на правильное решение!
      const seq = getSeq();
      checkSolution(seq, empty);
    };

    //счетчик ходов
    this.counter = 0;

    //время начала игры
    this.beginTime = Date.now();

    return this;
  }

  function refresh(e) {
    clear();
    thisGame = createNewGame();
  }

  //очищает поле
  function clear() {
    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }
  }

  function checkSolution(seq, empty) {
    this.counter++;
    clearDraggable();
    //находим новые перемещаемые
    if (!isSolved(seq)) {
      // очищаем старые драгабл
      setDraggable(empty);
      return;
    }
    //если решено - показываем результат
    const time = Math.round(((Date.now() - this.beginTime) / 1000) * 100) / 100;
    const score = Math.round(1000000 / (time * this.counter) / 1000) * 1000;
    const str = `Time: ${time}с, moves: ${this.counter}. Score: ${score}.`;

    setTimeout(() => shade(str), 200);
  }

  function renderSequence(sequence) {
    //для каждого случайного числа в sequence делаем фишку и размещаем ее на поле
    sequence.forEach((x, i, arr) => {
      const chip = document.createElement('div');
      chip.className = 'chip';

      //сделать 16-й элемент droppable
      if (x == 16) {
        chip.classList.add('droppable');
        chip.style.visibility = 'hidden';
      }

      //вложенный div нужен для выравнивания текста внутри фишки
      const div = document.createElement('div');
      div.textContent = x;
      chip.appendChild(div);
      container.appendChild(chip);

      //задаем положение фишки относительно контейнера
      //для этого используем ее порядковый номер
      //чтобы найти номер ряда и столбца фишки
      const size = chip.offsetWidth;
      chip.style.left = (i % 4) * size + 'px';
      chip.style.top = ((i - (i % 4)) / 4) * size + 'px';
    });
  }
  //считываем последовательность фишек с DOM
  function getSeq() {
    const seq = [];

    for (let chip of container.children) {
      seq.push(+chip.children[0].textContent);
    }

    return seq;
  }

  //делает перемещаемыми фишки, соседние с пустой
  function setDraggable(empty) {
    const box = empty.getBoundingClientRect();
    const x0 = box.left + empty.offsetWidth / 2;
    const y0 = box.top + empty.offsetHeight / 2;

    const leftElement = document.elementFromPoint(x0 - empty.offsetWidth, y0);
    const rightElement = document.elementFromPoint(x0 + empty.offsetWidth, y0);
    const topElement = document.elementFromPoint(x0, y0 - empty.offsetHeight);
    const bottomElement = document.elementFromPoint(x0, y0 + empty.offsetHeight);

    [leftElement, rightElement, topElement, bottomElement].forEach(
      (el) => el && el.closest('.chip') && el.closest('.chip').classList.add('draggable')
    );
  }

  //убирает перемещаемость со всех фишек на поле - выполняется после каждого хода
  function clearDraggable() {
    for (let chip of container.querySelectorAll('.draggable')) {
      chip.classList.remove('draggable');
    }
  }

  //показать результат - вызывается в самом конце
  function shade(str) {
    const shader = document.createElement('div');
    document.body.appendChild(shader);
    shader.className = 'shader';
    document.body.style.overflowY = 'hidden';

    const notif = document.createElement('div');
    document.body.appendChild(notif);
    notif.className = 'notif';
    notif.style.left = (document.body.offsetWidth - notif.offsetWidth) / 2 + 'px';
    notif.style.top = (document.body.offsetHeight - notif.offsetHeight) / 2 + 'px';

    notif.innerHTML = `<h2>Congratulations!<br>Your score:</h2><p>${str}</p><input type="button" value="Ок"></input>`;
    shader.onclick = hide;
    notif.querySelector('input').onclick = hide;

    function hide() {
      notif.style.display = 'none';
      shader.style.display = 'none';
      scoreTable.style.visibility = 'visible';
      log.value += str + '\n';
      log.scrollTop = log.scrollHeight;
      return false;
    }
  }
})();
