"use strict"

// Запрос на получение всех списков
let xhrUpdate = new XMLHttpRequest();
xhrUpdate.open(`POST`, `http://f0769682.xsph.ru/`);
xhrUpdate.responseType = 'json';
xhrUpdate.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
xhrUpdate.send(`event=update`);

// Создать запрос на актуальность заполнения
let xhrGetHallConfig = new XMLHttpRequest();

const now = new Date();

const daysWeek = Array.from(document.querySelectorAll(`.page-nav__day`));

(function () {
  // Настройка календаря
  setUpDates();
  // Обработка запроса всех списков
  processingRequest()
}())

// Настойка календарая
function setUpDates() {
  const days = [`Вс`, `Пн`, `Вт`, `Ср`, `Чт`, `Пт`, `Сб`, `Вс`, `Пн`, `Вт`, `Ср`, `Чт`, `Пт`, `Сб`];
  // Дни недели
  showCurrentWeek(days);
  // Открытая стартовая вкладка текущего дня
  chooseDay(daysWeek[0]);
  // Раздача кнопок выбора дня
  btnChooseDay(days);
}

// Поиск из колекции по имени
function searchPosition(nodeCollection, nameClass) {
  return nodeCollection.findIndex(item => item.className.includes(nameClass));
}

// Поиск из колекции по условию
function searchItemNode(nodeCollection, property, comparable) {
  return nodeCollection.filter(item => item[property] == comparable);
}

// Дни недели
function showCurrentWeek(days) {
  daysWeek.forEach((day, index) => {
    // Установка дней недели
    setDaysWeek(days, day, index);
    // Установка чисел месяца
    setDateMonth(day, index);
  })
}

// Установка дней недели
function setDaysWeek(days, day, index) {
  day.querySelector(`.page-nav__day-week`).textContent = days[now.getDay() + index];
  if (day.querySelector(`.page-nav__day-week`).textContent === `Сб` || day.querySelector(`.page-nav__day-week`).textContent === `Вс`) {
    day.classList.add(`page-nav__day_weekend`);
  }
}

// Установка чисел месяца
function setDateMonth(day, index) {
  day.dataset.dayTimeStamp = (now.getDate() * 86400 - 86400) + (86400 * index);
  day.querySelector(`.page-nav__day-number`).textContent = now.getDate() + index;
}

// Раздача кнопок выбора дня
function btnChooseDay() {
  daysWeek.forEach(day => {
    day.addEventListener(`click`, elem => {
      elem.preventDefault();
      chooseDay(day);
    })
  })
}

// Открытая стартовая вкладка текущего дня + выбор дня
function chooseDay(day) {
  const selectedDay = searchPosition(daysWeek, `page-nav__day_chosen`);
  daysWeek[selectedDay].classList.remove(`page-nav__day_chosen`);
  day.classList.add(`page-nav__day_chosen`);
  // Проверка на полную заполненность на сеансе - не работает!
  // setTimeout(() => {
  //   const seancesList = document.querySelectorAll(`.movie-seances__time`);
  //   seancesList.forEach(seance => {
  //     const closesSeance = checkFullHall(seance, day);
  //     alert(closesSeance + ` enter`);
  //     // Закрыть сеанс
  //     closesSeance ? closesSeance(seance, closesSeance) : false;
  //   })
  // }, 1000);
}

// Проверка на полную заполненность на сеансе - не работает!
function checkFullHall(seance, day) {
  const chosenDayTimeStamp = day.dataset.dayTimeStamp;
  const seanceTimeStamp = (+(seance.textContent).slice(0, 2) * 3600) + (+(seance.textContent).slice(3, 5) * 60);
  const timeStamp = +chosenDayTimeStamp + +seanceTimeStamp;
  const hallId = seance.closest(`.movie-seances__hall`).dataset.hallId;
  const seanceId = seance.dataset.seanceId;
  xhrGetHallConfig.open(`POST`, `http://f0769682.xsph.ru/`);
  xhrGetHallConfig.responseType = 'json';
  xhrGetHallConfig.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
  const openPlaces = [`standart`, `vip`];
  xhrGetHallConfig.send(`event=get_hallConfig&timestamp=${timeStamp}&hallId=${hallId}&seanceId=${seanceId}`);
  alert(timeStamp)
  // ошибка
  xhrGetHallConfig.onload = () => {
    alert(`xhl.onload`)
    if (xhrGetHallConfig.response !== null) {
      alert(timeStamp + ` xhl.response`)
      if (!xhrGetHallConfig.response.includes(openPlaces[0]) || !xhrGetHallConfig.response.includes(openPlaces[0])) {
        alert(xhrGetHallConfig.response.includes(openPlaces[0]))
        return `background-color: #808080`
      }
      alert(xhrGetHallConfig.response + `exit`)
    }
  }
}

// Закрыть сеанс
function closesSeance(seance, attribute) {
  seance.dataset.style = attribute;
  alert(seance.dataset.style)
  seance.removeAttribute("href");
}

// Обработка запроса всех списков
function processingRequest() {
  xhrUpdate.onload = () => {
    const requestFilms = xhrUpdate.response.films.result;
    const requestHalls = xhrUpdate.response.halls.result;
    const requestSeances = xhrUpdate.response.seances.result;
    // Показ всех карточек с фильмами из запроса
    showFilms(requestFilms);
    // Показ всех сеансов в соответствующих залах
    showSeances(requestFilms, requestHalls, requestSeances);
    // Раздача кнопок всем сеансам
    btnSeances(requestHalls, requestSeances);
  }
}

// Показ всех карточек с фильмами из запроса
function showFilms(requestFilms) {
  const requestFilmsLength = Object.keys(requestFilms).length;
  const movieCard = document.querySelector(`.movie`);
  // Изменение карточки с фильмом под текущий фильм
  changeMovie(movieCard, 0, requestFilms);
  // Создание новой карточки с фильмами
  creatMovie(requestFilms, requestFilmsLength, movieCard);
}

// Создание новой карточки с фильмами
function creatMovie(requestFilms, requestLength, movieCard) {
  for (let i = 1; i < requestLength; i++) {
    const cloneMovie = movieCard.cloneNode(true);
    const main = document.querySelector(`main`);
    main.appendChild(cloneMovie);
    const lastMovie = main.lastElementChild;
    // Изменение карточки с фильмом под текущий фильм
    changeMovie(lastMovie, i, requestFilms);
  }
}

// Изменение карточки с фильмом под текущий фильм
function changeMovie(movieCard, countMovie, request) {
  const moviePoster = movieCard.querySelector(`.movie__poster-image`);
  moviePoster.alt = `${request[countMovie].film_name} постер`;
  moviePoster.src = request[countMovie].film_poster;
  const movieDescription = movieCard.querySelector(`.movie__description`);
  movieDescription.querySelector(`.movie__title`).textContent = request[countMovie].film_name;
  movieDescription.querySelector(`.movie__synopsis`).textContent = request[countMovie].film_description;
  movieDescription.querySelector(`.movie__data-duration`).textContent = `${request[countMovie].film_duration} минут`;
  movieDescription.querySelector(`.movie__data-origin`).textContent = request[countMovie].film_origin;
}

// Показ всех сеансов в соответствующих залах
function showSeances(requestFilms, requestHalls, requestSeances) {
  const movieList = Array.from(document.querySelectorAll(`.movie`));
  // Отбор открытых залов
  // Поиск из колекции по условию
  const openHalls = searchItemNode(requestHalls, `hall_open`, 1);
  // Наполнение сеансами
  for (let i = 0; i < movieList.length; i++) {
    const currentFilmId = requestFilms[i].film_id;
    // Поиск из колекции по условию
    const seancesCurrentFilms = searchItemNode(requestSeances, `seance_filmid`, currentFilmId);
    // Проверка совпадений списков открытых залов с залами проката текущего фильма - Почему если зал 71 закрыт 
    // (в проверке isHall дописать после &&),
    // то для 1го фильма 2ой сеанс (64) не обрабатывается?
    seancesCurrentFilms.forEach((seance, index) => {
      (isHall(seance, openHalls) || seancesCurrentFilms.splice(index, 1));
    })
    // Вывести сообщение "Нет сеансов", если список сеансов пуст или они идут в закрытых залах
    if (clearSeances(movieList[i], seancesCurrentFilms)) {
      return
    }
    // Подсчет количества залов с прокатом текущего фильма
    const countHall = checkCountHalls(seancesCurrentFilms);
    // Наполнение залами и сеансами в карточке с фильмом
    creatHallsAndSeances(openHalls, movieList[i], seancesCurrentFilms, countHall);
  }
}

// Проверка совпадений списков открытых залов с залами проката текущего фильма
function isHall(seance, openHalls) {
  let seanceOpen = false;
  openHalls.forEach(hall => {
    if (seance.seance_hallid == hall.hall_id) {
      seanceOpen = true;
      return;
    }
  })
  return seanceOpen;
}

// Вывести сообщение "Нет сеансов", если список сеансов пуст или они идут в закрытых залах
function clearSeances(movieCard, seances) {
  if (seances.length === 0) {
    const cloneMovieHall =  movieCard.querySelector(`.movie-seances__hall`).cloneNode();
    const cloneHallTitle = movieCard.querySelector(`.movie-seances__hall-title`).cloneNode();
    cloneHallTitle.textContent = `Сеансов нет`;
    movieCard.querySelector(`.movie-seances__hall`).replaceWith(cloneMovieHall);
    movieCard.querySelector(`.movie-seances__hall`).appendChild(cloneHallTitle);
    return true
  }
}

// Подсчет количества залов с прокатом текущего фильма
function checkCountHalls(seances) {
  const countHalls = seances.reduce((acc, seance) => (acc[seance.seance_hallid] = (acc[seance.seance_hallid] || 0) + 1, acc), {});
  return [countHalls, Object.keys(countHalls).length];
}

// Наполнение залами и сеансами в карточке с фильмом
function creatHallsAndSeances(openHalls, movieCard, seances, countHall) {
  if (countHall[1] > 1) {
    // Увеличить количество залов
    creatHalls(movieCard, countHall[1]);
    const movieHalls = movieCard.querySelectorAll(`.movie-seances__hall`);
    movieHalls.forEach((hall, index) => {
      const hallId = Object.keys(countHall[0])[index];
      // Добавить data данные об зале
      addMetaHall(openHalls, hall, hallId);
      // Увеличеть количество сеансов где больше 1го зала
      creatSeances(seances, countHall[0], hallId, hall);
      for (let i = index; i < countHall[1]; i++) {
        // Поиск из колекции по условию
        const seancesInHall = searchItemNode(seances, `seance_hallid`, hallId);
        // Изменение информации об сеансах к данному залу 
        changeSeance(hall, seancesInHall);
      }
    })
  } else {
    const hallId = Object.keys(countHall[0])[0];
    const hall = movieCard.querySelector(`.movie-seances__hall`);
    // Добавить data данные об зале
    addMetaHall(openHalls, hall, hallId);
    // Наполнение одного единственного зала сеансами
    creatSeancesOnlyHall(movieCard, seances);
    // Изменение информации об сеансах к данному залу 
    changeSeance(hall, seances);
  }
}

// Увеличить количество залов
function creatHalls(movieCard, hallListLength) {
  for (let i = 1; i < hallListLength; i++) {
    const currentMovieHall = movieCard.querySelector(`.movie-seances__hall`).cloneNode(true);
    movieCard.appendChild(currentMovieHall);
    const lastHall = movieCard.lastElementChild
    lastHall.querySelector(`.movie-seances__hall-title`).textContent = `Зал ${i + 1}`;
  }
}

// Добавить data данные об зале
function addMetaHall(openHalls, hall, hallId) {
  const metaDataHall = openHalls.find(hall => hall.hall_id == hallId);
  hall.dataset.hallId = metaDataHall.hall_id;
  hall.dataset.priceStandart = metaDataHall.hall_price_standart;
  hall.dataset.priseVip = metaDataHall.hall_price_vip;
}

// Увеличеть количество сеансов где больше 1го зала
function creatSeances(seances, countHalls, seancesHall, hall) {
  for (let i = 0; i < seances.length; i++) {
    if (seances[i].seance_hallid == seancesHall && countHalls[seancesHall] > 1) {
      const cloneSeanceBlock = hall.querySelector(`.movie-seances__time-block`).cloneNode(true);
      hall.querySelector(`.movie-seances__list`).appendChild(cloneSeanceBlock);
    }
  }
}

// Наполнение одного единственного зала сеансами
function creatSeancesOnlyHall(movieCard, seances) {
  for (let i = 1; i < seances.length; i++) {
    const cloneSeanceBlock = movieCard.querySelector(`.movie-seances__time-block`).cloneNode(true);
    movieCard.querySelector(`.movie-seances__list`).appendChild(cloneSeanceBlock);
  }
}

// Изменение информации об сеансах к данному залу 
function changeSeance(hall, seancesCurrentFilms) {
  const seancesList = hall.querySelectorAll(`.movie-seances__time`);
  seancesList.forEach((seance, index) => {
    const seanceTime = seancesCurrentFilms[index].seance_time;
    seance.textContent = seanceTime;
    seance.dataset.seanceId = seancesCurrentFilms[index].seance_id;
    // Проверка на полную заполненность на сеансе - не работает!
    // const closesSeance = checkFullHall(seancesList[index]);
    // Закрыть сеанс
    // closesSeance ? closeSeance(seancesList[index], closeSeance) : false;
  })
}

// Изменение информации об сеансах к данному залу - добавляем каждому сеансу data атрибуты
// function changeSeance(hall, seancesCurrentFilms) {
//   const seancesList = hall.querySelectorAll(`.movie-seances__time`);
//   seancesList.forEach((seance, index) => {
//     const seanceTime = seancesCurrentFilms[index].seance_time;
//     seance.textContent = seanceTime;
//     seance.dataset.seanceId = seancesCurrentFilms[index].seance_id;
//     seance.dataset.seanceStart = seancesCurrentFilms[index].seance_start;
//     seance.dataset.seanceTime = seanceTime;
//     seance.dataset.seanceTimeStamp = (+seanceTime.slice(0, 2) * 3600) + (+seanceTime.slice(3, 5) * 60);
//   })
// }

// Раздача кнопок всем сеансам
function btnSeances(requestHalls, requestSeances) {
  const seances = document.querySelectorAll(`.movie-seances__time`);
  seances.forEach(seance => {
    seance.addEventListener(`click`, event => {
      event.preventDefault();
      // Создание мета данных о сеансе для веб-хранилища
      creatMetaData(requestHalls, requestSeances, seance);
      // Создание мета данных о сеансе для веб-хранилища - способ получения мета данных из data атрибутов
      // creatMetaData(requestHalls, seance);
      // Не забыть вкл. переход по ссылке
      setTimeout(() => window.location = seance.href, 0)
    });
  })
}

// Создание мета данных о сеансе для веб-хранилища
function creatMetaData(requestHalls, requestSeances, seance) {
  // Поиск из колекции по условию
  const currentSeance = searchItemNode(requestSeances, `seance_id`, seance.dataset.seanceId);
  const movieTitle = seance.closest(`.movie`).querySelector(`.movie__title`).textContent;
  const hall = seance.closest(`.movie-seances__hall`);
  const hallId = hall.dataset.hallId;
  // Поиск из колекции по условию
  const currentHall = searchItemNode(requestHalls, `hall_id`, hallId);
  const chosenDayTimeStamp = document.querySelector(`.page-nav__day_chosen`).dataset.dayTimeStamp;
  const seanceTime = currentSeance[0].seance_time;
  const seanceTimeStamp = (+seanceTime.slice(0, 2) * 3600) + (+seanceTime.slice(3, 5) * 60);
  const seanceId = seance.dataset.seanceId;
  const hallTitle = hall.querySelector(`.movie-seances__hall-title`).textContent;
  const seanceMetaData = {
    movieTitle: movieTitle,
    hallId: hallId,
    seanceId: seanceId,
    hallConfig: currentHall[0].hall_config,
    seanceTime: seanceTime,
    seanceTimeStamp: +chosenDayTimeStamp + +seanceTimeStamp,
    hallTitle: hallTitle,
    priceStandart: currentHall[0].hall_price_standart,
    priseVip: currentHall[0].hall_price_vip,
  };
  localStorage.setItem(`seanceMeta`, JSON.stringify(seanceMetaData));
}

// Создание мета данных о сеансе для веб-хранилища - способ получения мета данных из data атрибутов
// function creatMetaData(requestHalls, seance) {
//   const movieTitle = seance.closest(`.movie`).querySelector(`.movie__title`).textContent;
//   const hall = seance.closest(`.movie-seances__hall`);
//   const hallId = hall.dataset.hallId;
//   const chosenDayTimeStamp = document.querySelector(`.page-nav__day_chosen`).dataset.dayTimeStamp;
//   const hallTitle = hall.querySelector(`.movie-seances__hall-title`).textContent;
//   // Поиск из колекции по условию
//   const currentHall = searchItemNode(requestHalls, `hall_id`, hallId);
//   const seanceMetaData = {
//     movieTitle: movieTitle,
//     hallId: hallId,
//     hallConfig: currentHall[0].hall_config,
//     seanceTime: seance.dataset.seanceTime,
//     seanceTimeStamp: +chosenDayTimeStamp + +seance.dataset.seanceTimeStamp,
//     hallTitle: hallTitle,
//     priceStandart: hall.dataset.priceStandart,
//     priseVip: hall.dataset.priseVip,
//   };
//   localStorage.setItem(`seanceMeta`, JSON.stringify(seanceMetaData))
// }