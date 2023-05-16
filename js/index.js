"use strict"

window.addEventListener(`load`, () => {
  // Запрос на получение всех списков
  let xhr = {
    method: 'POST',
    url: `https://jscp-diplom.netoserver.ru/`,
    responseType: 'json',
    setRequestHeader: {header: 'Content-type', headerValue:'application/x-www-form-urlencoded'},
    event: `event=update`,
  }
  xhr = createRequest(xhr);
  // Очистка localStorage
  clearLocalStorage();
  // Настройка календаря
  setUpDates();
  // Обработка запроса всех списков
  processingRequest(xhr);
})

// Очистка localStorage
function clearLocalStorage() {
  localStorage.clear();
}

// Настойка календарая
function setUpDates() {
  const daysWeek = [`Вс`, `Пн`, `Вт`, `Ср`, `Чт`, `Пт`, `Сб`];
  const pageNavDays = Array.from(document.querySelectorAll(`.page-nav__day`));
  // Дни недели
  showCurrentWeek(daysWeek, pageNavDays);
  // Открытая стартовая вкладка текущего дня
  chooseDay(pageNavDays[0], pageNavDays);
  // Раздача кнопок выбора дня
  btnChooseDay(pageNavDays);
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
function showCurrentWeek(daysWeek, pageNavDays) {
  const now = new Date();
  pageNavDays.forEach((day, index) => {
    const fromMidnight = (now.getHours() * 3600000) + (now.getMinutes() * 60000) + (now.getSeconds() * 1000) + now.getMilliseconds();
    let timeUTCms = +now + (index * 86400000) - fromMidnight;
    let timeUTC = new Date(timeUTCms);
    // Установка дней недели
    setDaysWeek(daysWeek, day, timeUTC);
    // Установка чисел месяца
    setDateMonth(day, timeUTCms, timeUTC);
  })
}

// Установка дней недели
function setDaysWeek(daysWeek, day, timeUTC) {
  day.querySelector(`.page-nav__day-week`).textContent = daysWeek[timeUTC.getDay()];
  if (day.querySelector(`.page-nav__day-week`).textContent === `Сб` || day.querySelector(`.page-nav__day-week`).textContent === `Вс`) {
    day.classList.add(`page-nav__day_weekend`);
  }
}

// Установка чисел месяца
function setDateMonth(day, timeUTCms, timeUTC) {
  day.dataset.dayTimeStamp = Math.round(timeUTCms / 1000);
  day.querySelector(`.page-nav__day-number`).textContent = timeUTC.getDate();
}

// Раздача кнопок выбора дня
function btnChooseDay(pageNavDays) {
  pageNavDays.forEach(day => {
    day.addEventListener(`click`, elem => {
      elem.preventDefault();
      // Открытая стартовая вкладка текущего дня + выбор дня
      chooseDay(day, pageNavDays);
    })
  })
}

// Открытая стартовая вкладка текущего дня + выбор дня
function chooseDay(day, pageNavDays) {
  const selectedDay = searchPosition(pageNavDays, `page-nav__day_chosen`);
  pageNavDays[selectedDay].classList.remove(`page-nav__day_chosen`);
  day.classList.add(`page-nav__day_chosen`);
}

// Обработка запроса всех списков
function processingRequest(xhr) {
  xhr.onload = () => {
    const requestFilms = xhr.response.films.result;
    const requestHalls = xhr.response.halls.result;
    const requestSeances = xhr.response.seances.result;
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
  // Удаление карточки-шаблона с фильмом если в прокате ничего нет
  if (requestFilmsLength === 0) {
    movieCard.remove();
    return
  } else {
    // Изменение карточки с фильмом под текущий фильм
    changeMovie(movieCard, 0, requestFilms);
    // Создание новой карточки с фильмами
    creatMovie(requestFilms, requestFilmsLength, movieCard);
  }
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
    // Проверка совпадений списков открытых залов с залами проката текущего фильма
    seancesCurrentFilms.forEach((seance, index) => {
      (isHall(seance, openHalls) || seancesCurrentFilms.splice(index, 1));
    })
    // Удалить карточку с фильмом если нет сеансов
    if (isSeances(movieList[i], seancesCurrentFilms)) {
      return
    } else {
      // Подсчет количества залов с прокатом текущего фильма
      const countHall = checkCountHalls(seancesCurrentFilms);
      // Наполнение залами и сеансами в карточке с фильмом
      creatHallsAndSeances(openHalls, movieList[i], seancesCurrentFilms, countHall);
    }
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

// Удалить карточку с фильмом если нет сеансов
function isSeances(movieCard, seances) {
  if (seances.length === 0) {
    movieCard.remove();
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
      // Увеличить количество сеансов где больше 1го зала
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
  hall.dataset.hallName = metaDataHall.hall_name;
  hall.dataset.priceStandart = metaDataHall.hall_price_standart;
  hall.dataset.priseVip = metaDataHall.hall_price_vip;
}

// Увеличить количество сеансов где больше 1го зала
function creatSeances(seances, countHalls, seancesHall, hall) {
  for (let i = 1; i < seances.length; i++) {
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

// Изменение информации об сеансах к данному залу - добавляем каждому сеансу data атрибуты
function changeSeance(hall, seancesCurrentFilms) {
  const seancesList = hall.querySelectorAll(`.movie-seances__time`);
  seancesList.forEach((seance, index) => {
    const seanceTime = seancesCurrentFilms[index].seance_time;
    seance.textContent = seanceTime;
    seance.dataset.seanceId = seancesCurrentFilms[index].seance_id;
    seance.dataset.seanceStart = seancesCurrentFilms[index].seance_start;
    seance.dataset.seanceTime = seanceTime;
    seance.dataset.seanceTimeStamp = (+seanceTime.slice(0, 2) * 3600) + (+seanceTime.slice(3, 5) * 60);
  })
}

// Раздача кнопок всем сеансам
function btnSeances(requestHalls, requestSeances) {
  const seances = document.querySelectorAll(`.movie-seances__time`);
  seances.forEach(seance => {
    seance.addEventListener(`click`, event => {
      event.preventDefault();
      // Создание мета данных о сеансе для веб-хранилища - способ получения мета данных из data атрибутов
      creatMetaData(requestHalls, seance);
      // Не забыть вкл. переход по ссылке
      setTimeout(() => window.location = seance.href, 0)
    });
  })
}

// Создание мета данных о сеансе для веб-хранилища - способ получения мета данных из data атрибутов
function creatMetaData(requestHalls, seance) {
  const movieTitle = seance.closest(`.movie`).querySelector(`.movie__title`).textContent;
  const hall = seance.closest(`.movie-seances__hall`);
  const hallId = hall.dataset.hallId;
  const seanceId = seance.dataset.seanceId;
  const chosenDayTimeStamp = document.querySelector(`.page-nav__day_chosen`).dataset.dayTimeStamp;
  const hallName = hall.dataset.hallName.replace(/\D/g, "");
  const hallTitle = hall.querySelector(`.movie-seances__hall-title`).textContent;
  // Поиск из колекции по условию
  const currentHall = searchItemNode(requestHalls, `hall_id`, hallId);
  const seanceMetaData = {
    movieTitle: movieTitle,
    hallId: hallId,
    seanceId: seanceId,
    hallConfig: currentHall[0].hall_config,
    seanceTime: seance.dataset.seanceTime,
    seanceTimeStamp: +chosenDayTimeStamp + +seance.dataset.seanceTimeStamp,
    hallName: hallName,
    hallTitle: hallTitle,
    priceStandart: hall.dataset.priceStandart,
    priseVip: hall.dataset.priseVip,
  };
  localStorage.setItem(`seanceMeta`, JSON.stringify(seanceMetaData))
}