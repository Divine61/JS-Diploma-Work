"use strict"

const metaDataHall = JSON.parse(localStorage.getItem(`seanceMeta`));
let buying;

window.addEventListener(`load`, () => {
  buying = document.querySelector(`.buying`);
  let xhr = {
  method: 'POST',
  url: `https://jscp-diplom.netoserver.ru/`,
  responseType: 'json',
  setRequestHeader: {header: 'Content-type', headerValue:'application/x-www-form-urlencoded'},
  event: `event=get_hallConfig&timestamp=${metaDataHall.seanceTimeStamp}&hallId=${metaDataHall.hallId}&seanceId=${metaDataHall.seanceId}`,
  }
  // Запрос актуальной конфигурации мест
  xhr = createRequest(xhr);
  xhr.onload = () => {
    const requestHallConfig = xhr.response;
    // Проверка на заполненность зала
    checkTickets(requestHallConfig);
    // Вывести всю информацию по сеансу
    showHall();
    // Создать кнопку покупки билетов
    btnBuying();
  }
})

// Проверка на заполненность зала
function checkTickets(requestHallConfig) {
  // (requestHallConfig && requestHallConfig !== metaDataHall.hallConfig) ? 
  (requestHallConfig) ? showSeats(requestHallConfig) : showSeats(metaDataHall.hallConfig);
}

/// Вывести все места в зале
function showSeats(hallConfig) {
  const confStepWrapper = buying.querySelector(`.conf-step__wrapper`);
  confStepWrapper.innerHTML += hallConfig;
}

// Вывести всю информацию по сеансу
function showHall() {
  // Изменить информацию о сеансе в шапке
  changeInfo();
  // Раздача кнопок выбора места
  btnSelected();
}

// Изменить информацию о сеансе в шапке
function changeInfo() {
  buying.querySelector(`.buying__info-title`).textContent = metaDataHall.movieTitle;
  buying.querySelector(`.buying__info-start`).textContent = `Начало сеанса: ${metaDataHall.seanceTime}`;
  buying.querySelector(`.buying__info-hall`).textContent = metaDataHall.hallTitle;
  // Изменить стоимость билетов
  changePrise();
}

// Изменить стоимость билетов
function changePrise() {
  buying.querySelector(`.price-standart`).textContent = metaDataHall.priceStandart + ` `;
  buying.querySelector(`.price-vip`).textContent = metaDataHall.priseVip + ` `;
}

// Раздача кнопок выбора места
function btnSelected() {
  const confStepChairs = buying.querySelectorAll(`.conf-step__chair`);
  confStepChairs.forEach(chair => {
    // Выбор места
    chair.addEventListener(`click`, () => {
      selectSeat(chair);
    });
  })
}

// Проверка на свободное место
function selectSeat(seat) {
  const closedPlaces = [`conf-step__chair_disabled`, `conf-step__chair_taken`];
  if (!seat.classList.contains(closedPlaces[0]) && !seat.classList.contains(closedPlaces[1])) {
    seat.classList.toggle(`conf-step__chair_selected`);
  }
}

// Создать кнопку покупки билетов
function btnBuying() {
  const acceptinButton = buying.querySelector(`.acceptin-button`);
  // Формирование брони
  acceptinButton.addEventListener(`click`, formationBooking);
}

// Формирование брони
function formationBooking() {
  // Поиск выбранных мест
  const rowAndSeat = searchSelectedChair();
  // Проверка наличия выбранных мест
  if (rowAndSeat.length === 0) {
    return
  }
  // Создание общей стоимости билетов
  const price = creatPrice();
  // Подготовка конфигурации зала с учетом выбранных мест
  const hallConfig = creatHallConfig();
  // Создание мета данных выбранных билетов для веб-хранилища
  creatMetaData(hallConfig, rowAndSeat, price);
  window.location = `payment.html`;
}

// Поиск выбранных мест
function searchSelectedChair() {
  const rowAndSeat = [];
  const confStepRow = buying.querySelectorAll(`.conf-step__row`);
  confStepRow.forEach((row, level) => {
    const confStepChairs = row.querySelectorAll(`.conf-step__chair`);
    confStepChairs.forEach((chair, index) => {
      if (chair.classList.contains(`conf-step__chair_selected`)) {
        rowAndSeat.push(` ${level + 1}/${index + 1}`);
      }
    })
  })
  return rowAndSeat
}

// Создание общей стоимости билетов
function creatPrice() {
  let price = 0;
  const selectedChair = buying.querySelector(`.conf-step__wrapper`).querySelectorAll(`.conf-step__chair_selected`);
  selectedChair.forEach(chair => {
    chair.classList.contains(`conf-step__chair_vip`) ? (price += +metaDataHall.priseVip) : (price += +metaDataHall.priceStandart);
  })
  return price;
}

// Подготовка конфигурации зала с учетом выбранных мест
function creatHallConfig() {
  const selectedChair = buying.querySelector(`.conf-step__wrapper`).querySelectorAll(`.conf-step__chair_selected`);
  selectedChair.forEach(chair => {
    chair.className = `conf-step__chair conf-step__chair_taken`;
  })
  return buying.querySelector(`.conf-step__wrapper`).innerHTML;
}

// Создание мета данных выбранных билетов для веб-хранилища
function creatMetaData(hallConfig, rowAndSeat, price) {
  const buyingMetaData = {
    movieTitle: metaDataHall.movieTitle,
    rowAndSeat: rowAndSeat,
    hallId: metaDataHall.hallId,
    seanceId: metaDataHall.seanceId,
    hallConfig: hallConfig,
    seanceTime: metaDataHall.seanceTime,
    seanceTimeStamp: metaDataHall.seanceTimeStamp,
    hallName: metaDataHall.hallName,
    price: price,
  };
  localStorage.setItem(`buyingMeta`, JSON.stringify(buyingMetaData));
}