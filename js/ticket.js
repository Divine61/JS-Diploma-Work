"use strict"

const metaDataBuying = JSON.parse(localStorage.getItem(`buyingMeta`));
const ticketWrapper = document.querySelector(`.ticket__info-wrapper`);

// Предупредить пользователя о закрытии страницы
// window.addEventListener('unload', () => {
//   alert(`Вы уверены закрыть окно, все данные удалятся!`);

  // Если пользователь нажмет ок, то сработает функция удаления всех мета-данных и страница закроется,
  // в ином случае страница останется
  
  // Очистка localStorage
  // clearLocalStorage();

  // navigator.sendBeacon('/some-endpoint', someUsefulData);
// })

(function() {
  // Вывести всю информацию по билетам
  showTicket();
}())

// Вывести всю информацию по билетам
function showTicket() {
  // Изменить информацию по брони
  changeInfoBuying();
  // Показать QR - не работает
  showQR();
  // Очистка localStorage
  clearLocalStorage();
}

// Изменить информацию по брони
function changeInfoBuying() {
  ticketWrapper.querySelector(`.ticket__title`).textContent = metaDataBuying.movieTitle;
  ticketWrapper.querySelector(`.ticket__chairs`).textContent = metaDataBuying.rowAndSeat;
  ticketWrapper.querySelector(`.ticket__hall`).textContent = metaDataBuying.hallTitle;
  ticketWrapper.querySelector(`.ticket__start`).textContent = metaDataBuying.seanceTime;
}


// Показать QR - не работает
function showQR() {
  // const qrcode = window.QRCreator(`metaDataBuying.qrMeta`, {});
  const qrcode = QRCreator('Привет, Мир!', { mode: 1});

  const content = (qrcode) =>{
    return qrcode.error ?
      `недопустимые исходные данные ${qrcode.error}`:
       qrcode.result;
  };
  ticketWrapper.querySelector(`ticket__info-qr`).append( 'QR-код № 1: ', content(qrcode));

  // const qrcode = QRCreator(metaDataBuying.qrMeta, {});
  // ticketWrapper.querySelector(`ticket__info-qr`).src = qrcode.result;
}

// Очистка localStorage
function clearLocalStorage() {
  localStorage.clear();
}