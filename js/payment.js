"use strict"

const metaDataBuying = JSON.parse(localStorage.getItem(`buyingMeta`));
let ticketWrapper;

window.addEventListener(`load`, () => {
  ticketWrapper = document.querySelector(`.ticket__info-wrapper`);
  // Вывести всю информацию по билетам
  showTicket();
})

// Вывести всю информацию по билетам
function showTicket() {
  // Изменить информацию по брони
  changeInfoBuying();
  // Кнопка бронирования
  btnBuying();
}

// Изменить информацию по брони
function changeInfoBuying() {
  ticketWrapper.querySelector(`.ticket__title`).textContent = metaDataBuying.movieTitle;
  ticketWrapper.querySelector(`.ticket__chairs`).textContent = metaDataBuying.rowAndSeat;
  ticketWrapper.querySelector(`.ticket__hall`).textContent = metaDataBuying.hallName;
  ticketWrapper.querySelector(`.ticket__start`).textContent = metaDataBuying.seanceTime;
  ticketWrapper.querySelector(`.ticket__cost`).textContent = metaDataBuying.price;
}

// Кнопка бронирования
function btnBuying() {
  ticketWrapper.querySelector(`.acceptin-button`).addEventListener(`click`, () => {
    // Отправка забронированных билетов на сервер
    sendBooking();
    // Создание мета данных выбранных билетов для веб-хранилища
    creatMetaData();
    // Удалить мета данные о сеансе и билетах
    deleteMetaData();
    // Переход к странице с QR кодом
    location.href = 'ticket.html';
  })
}

// Отправка забронированных билетов на сервер
function sendBooking() {
  const xhr = {
    method: 'POST',
    url: `https://jscp-diplom.netoserver.ru/`,
    setRequestHeader: {header: 'Content-type', headerValue:'application/x-www-form-urlencoded'},
    event: `event=sale_add&timestamp=${metaDataBuying.seanceTimeStamp}&hallId=${metaDataBuying.hallId}&seanceId=${metaDataBuying.seanceId}&hallConfiguration=${metaDataBuying.hallConfig}`,
  }
  createRequest(xhr);
}

// Создание мета данных выбранных билетов для веб-хранилища
function creatMetaData() {
  const transMetaDataBuying = metaDataBuying;
  transMetaDataBuying.qrMeta = `Фильм: ${metaDataBuying.movieTitle};
  Зал: ${metaDataBuying.hallName};
  Ряд/Место: ${metaDataBuying.rowAndSeat};
  Начало сеанса: ${metaDataBuying.seanceTime};
  Стоимость: ${metaDataBuying.price}`;
  localStorage.removeItem(`buyingMeta`);
  localStorage.setItem(`buyingMeta`, JSON.stringify(transMetaDataBuying));
}

// Удалить мета данные о сеансе и билетах
function deleteMetaData() {
  localStorage.removeItem(`seanceMeta`);
}