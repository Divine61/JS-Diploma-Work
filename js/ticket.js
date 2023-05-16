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
  // Показать QR
  showQR();
}

// Изменить информацию по брони
function changeInfoBuying() {
  ticketWrapper.querySelector(`.ticket__title`).textContent = metaDataBuying.movieTitle;
  ticketWrapper.querySelector(`.ticket__chairs`).textContent = metaDataBuying.rowAndSeat;
  ticketWrapper.querySelector(`.ticket__hall`).textContent = metaDataBuying.hallName;
  ticketWrapper.querySelector(`.ticket__start`).textContent = metaDataBuying.seanceTime;
}

// Показать QR
function showQR() {
  const qrcode = QRCreator(metaDataBuying.qrMeta, {image: 'SVG'});
  
  const content = (qrcode => {
    return qrcode.error ?
      `недопустимые исходные данные ${qrcode.error}` :
       qrcode.result;
  });

  ticketWrapper.querySelector(`.ticket__info-qr`).appendChild(content(qrcode));
}