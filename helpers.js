const getCoords = (elem) => {
  // кроме IE8-
  var box = elem.getBoundingClientRect();

  return {
    top: box.top + pageYOffset,
    left: box.left + pageXOffset,
  };
};

const hasSolution = (seq) => {
  //найдем номер строки где находится пустой элемент (от 1 до 4 включительно)
  const i = seq.indexOf(16);
  const K = (i - (i % 4)) / 4 + 1;
  //количество инверсий
  const N = getInversionsCount(seq);
  //решение есть тогда и только тогда, когда N + K четно
  return (N + K) % 2 == 0;
};

//головоломка считается решенной, когда пустая клетка находится в последной ячейке, а количество инверсий равно 0
const isSolved = (seq) => getInversionsCount(seq) == 0 && seq[seq.length - 1] == 16;

let inversionsCounter = 0;
//считает число инверсий в массиве. максимально быстрый алгоритм - O(nlogn)
const getInversionsCount = (arr) => {
  inversionsCounter = 0;
  mergeSort(arr);
  return inversionsCounter;
};

const mergeSorted = (arr1, arr2) => {
  let i = 0,
    j = 0;
  const len1 = arr1.length;
  const len2 = arr2.length;
  let merged = [];
  while (i < len1 && j < len2) {
    arr1[i] === arr2[j]
      ? merged.push(arr1[i++])
      : arr1[i] < arr2[j]
      ? merged.push(arr1[i++])
      : ((inversionsCounter += len1 - i), merged.push(arr2[j++]));
  }

  while (i < len1) {
    merged.push(arr1[i++]);
  }

  while (j < len2) {
    merged.push(arr2[j++]);
  }
  return merged;
};

//сортировка слиянием. нужна только с одной целью - подсчет количества инверсий в массиве
const mergeSort = (arr, half = Math.floor(arr.length / 2)) =>
  arr.length > 1 ? mergeSorted(mergeSort(arr.slice(0, half)), mergeSort(arr.slice(half))) : arr;

const generateRandomSeq = () => {
  const sequence = [];
  //наполняем sequence - массив слуяайных чисел от 1 до 16 вкл
  for (let i = 0; i < 16; i++) {
    sequence.push(getRandomIntExcept(1, 16, sequence));
  }
  return sequence;
};

//возвращает случайное целое число в диапазоне от min до max, кроме чисел из массива exceptions
const getRandomIntExcept = (min, max, exceptions = []) => {
  let rand;
  do {
    rand = Math.round(min - 0.5 + Math.random() * (max - min + 1));
  } while (exceptions.includes(rand));
  return rand;
};
