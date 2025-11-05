import { 
  UpdatePageTitle,
  ChangeLanguage,
  Popup,
  FormValidator,
  Chat,
  Parallax,
  BurgerMenu,
} from './modules/modules.js';

import { titles_dic, elements_dic } from './modules/dictionary.js';


// Plugins

new UpdatePageTitle({
  dictionary: { ...titles_dic },
  observer: {
    threshold: 0.3,
  },
});

new ChangeLanguage({
  dictionary: { ...titles_dic, ...elements_dic }
});

const validatorClass = new FormValidator({
  form: '#popupCommon', // Селектор нашей формы
  resetWhenChange: true, // Снимать инвалид с поля когда мы в нем изменили невалидное содержимое
  // realTimeCheck: true, // Проверка полей в режиме реального времени при вводе
  // lockSubmit: true, // Если тру то дает сабмит кнопке атрибут дисаблед пока не заполнены все поля c data-validate. Можно не писать

  textInput: { // Настройки для текст поля (можно не писать есть авто значения)
    onlyLatin: true,
    // onlyCyrylic: true,
    minLength: 2,
    // noNumbers: true,
    forbiddenSymbols: /-/, // Запретить ввод таких символов. (твой рег заменит стандартный). По умолчанию есть там уже набор и он работает.
    // Можно не писать ваще это всойство по автомату работает станадртный набор запрет и он провер
    // Чтобы вообще не отслеживать запр символы пиши значение false
  }

});

const chatClass = new Chat();

const popupClass = new Popup({
  backDrop: true, // Добавляет блок на весь экран затеняющий все кроме попапа. Можно стили его настроить через css
  closeOnBtn: true, // Закрыть попап только закрывающей кнопкой а не тычком вне него
  escButtonClose: true, // Закрыть попап клавишей Escape
  // pageWrapper: '.selector', // Если у страницы есть какаято обертка типо для смус скрола то указываем ее селектор тут чтоб падинг для скролбара норм работал. Если нету обертки просто не пиши это свойтсо
  delay: 100, // Добавляет задержку перед возвращением прокрутки и верт скрола чтобы при закрытии попап не дергало в сторону

  preOpenCallback: function() {
    if (chatClass) chatClass.closeChat();
    successMsgHandler(false);
    hideChatButton(true);
  },

  afterOpenCallback: function() {}, // Вызывает наш колбек после выполнения кода открытия попапа
  preCloseCallback: function() {}, // Вызывает наш колбек в начале выполнения кода закрытия попапа

  afterCloseCallback: function(btn, popup) {
    hideChatButton(false);
    clearInputs(btn, popup)
  },
});

new BurgerMenu({
  exceptBtns: '[data-lang-var]',
});

// new Parallax({
//   off: 768,
// });

replaceSlidesInAboutBlock();
replaceElementsInAboutBlock();
createSkillsSlider();

new Swiper('#toolsSlider', {
  slidesPerView: 2,
  slidesPerGroup: 1,
  spaceBetween: 39,
  speed: 700,
  simulateTouch: false,
  autoHeight: true,
  observer: true,
  observeParents: true,
  watchSlidesProgress: true,
  watchSlidesVisibility: true,

  navigation: {
    nextEl: '.tools .slider-controls__btn--next',
    prevEl: '.tools .slider-controls__btn--prev',
  },

  pagination: {
    el: '.tools .slider__pagination',
    type: 'custom',
    renderCustom: customSwiperPagination,
  },

  // autoplay: {
  //   delay: 2000,
  //   disableOnInteraction: false,
  //   pauseOnMouseEnter: true,
  // },

  breakpoints: {

    1250: {
      observer: true,
      observeParents: true,
      watchSlidesProgress: true,
      watchSlidesVisibility: true,
      slidesPerView: 2,
      slidesPerGroup: 1, 
      spaceBetween: 39,
      speed: 700,
    },

    769: {
      observer: true,
      observeParents: true,
      watchSlidesProgress: true,
      watchSlidesVisibility: true,
      slidesPerView: 3,
      spaceBetween: 21,
    },

    661: {
      slidesPerView: 3,
      spaceBetween: 24.5,
      centeredSlides: true,
      initialSlide: 1,
    },

    437: {
      slidesPerView: 2,
      spaceBetween: 30,
      centeredSlides: true,
      initialSlide: 1,
    },

    300: {
      centeredSlides: true,
      initialSlide: 1,
      slidesPerView: 1.632,
      slidesPerGroup: 1,
      spaceBetween: 20,
      speed: 600,
    }

  },

});


// Other functions

function changeAboutSubtitle(dic) {

  let element = document.querySelector('.about .block-intro__subtitle');
  
  if (!element || !dic) return;

  function getNewTextHeight(text, width) {

    let clone = element.cloneNode();
    clone.style.cssText = `position: absolute; visibility: hidden; height: auto; width: ${width}px`;
    document.body.append(clone);

    clone.textContent = text;
    let height = clone.scrollHeight;
    clone.remove();

    return height;

  }

  function animateTextChange(text) {

    element.addEventListener('transitionend', (event) => {

      let duration = event.elapsedTime * 1000;

      let height = getNewTextHeight(text, element.offsetWidth);
      element.textContent = text;
      element.style.height = height + 'px';

      setTimeout(() => {
        element.classList.remove('active');
      }, duration);

    }, { once: true });

    element.style.height = element.offsetHeight + 'px';
    element.classList.add('active');
    
  }

  function getText(swiper) {

    let lang = document.documentElement.lang;
    let slide = swiper.slides[swiper.activeIndex];
    let key = slide.dataset.key;

    return dic[key][lang];

  }

  return function(swiper) {
    
    let text = getText(swiper);
    animateTextChange(text);

  }

}

function customSwiperPagination(swiper, current, total) {

  current = current < 10 ? '0' + current : current;
  total = total < 10 ? '0' + total : total;

  return `<span class="pagination__current pag-text">${current}</span>
          <span class="pagination__total pag-text">${total}</span>`;

}

function focusStateFix() {

  document.addEventListener('pointerdown', (event) => {
    let element = event.target;
    let inLink = element.closest('a');
    let inButton = element.closest('button');

    if (inLink) inLink.addEventListener('pointerleave', (event) => event.currentTarget.blur(), { once: true });
    if (inButton) inButton.addEventListener('pointerleave', (event) => event.currentTarget.blur(), { once: true });
  })

}

function langControlsHandler() {

  let controls = Array.from(document.querySelectorAll('[data-lang-var]'));

  if (controls.length === 0) return;

  let media = window.matchMedia('(max-width: 768px)').matches;

  selectLastLangBtn();

  document.addEventListener('click', (event) => {

    let button = event.target.closest('[data-lang-var]');

    if (button) {
      unselectOtherButtons();
      selectButton(button);
    }

  });

  function selectButton(button) {
    button.classList.add('active');
    button.setAttribute('disabled', '');
  }

  function unselectOtherButtons() {
    controls.forEach((item) => {
      item.classList.remove('active');
      item.removeAttribute('disabled');
    });
  }

  function selectLastLangBtn() {
    let lang = document.documentElement.lang;
    let buttons = Array.from(document.querySelectorAll(`[data-lang-var="${lang}"]`));
    unselectOtherButtons();
    buttons.forEach((button) => selectButton(button));
  }

}

function popupTextareaAutoHeight() {

  let element = document.querySelector('.data-field__input--textarea');

  if (!element) return;

  let initHeight;

  document.addEventListener('input', (event) => {

    let input = event.target.closest('.data-field__input--textarea');

    if (input) {

      if (!initHeight) initHeight = input.offsetHeight;
      input.style.height = '4px';
      let inputHeight = input.scrollHeight;
      if (inputHeight < initHeight) inputHeight = initHeight;
      input.style.height = inputHeight + 'px';

    }

  })

}

function hideChatButton(state) {

  let buttons = document.querySelector('.page-buttons');

  if (!buttons) return;

  if (state) {

    buttons.classList.add('hide');

  } else {

    setTimeout(() => {
      buttons.classList.remove('hide');
    }, 200);

  }
  
}

function clearInputs(btn, popup) {

  let inputs = Array.from(popup.querySelectorAll('[data-validate]'));
  let resetBtn = popup.querySelector('[type="reset"]');

  inputs.forEach((input) => {

    input.classList.remove('valid');
    input.classList.remove('invalid');
    input.value = '';
    input._warnField.classList.remove('active');
    input._warnField.style.height = '0px';

  });

  if (resetBtn) {
    resetBtn.classList.remove('active');
    resetBtn.setAttribute('disabled', '');
  }

}

function successMsgHandler(state) {

  let element = document.querySelector('.popup-success');

  if (!element) return;

  if (state) {

    if (element._timer) clearTimeout(element._timer);

    element._timer = setTimeout(() => {

      element.classList.add('active');

      element._timer = setTimeout(() => {
        element.classList.remove('active');
      }, 1500);

    }, 200);

  } else {

    element.classList.remove('active');

  }
  
}

function formValidatorEventsHandler() {

  let form = document.querySelector('#popupCommon');

  if (!form) return;

  let resetBtn = form.querySelector('[type="reset"]');

  findWarningFields();

  document.addEventListener('invalidinput', (event) => {
    
    event.detail.forEach((item) => {
      showWarning(item.input, item.msg);
    });

  });

  document.addEventListener('input', (event) => {

    let input = event.target.closest('#popupCommon [data-validate]');

    if (input) {
      hideWarning(input);
      resetBtnAccess(input);
    } 

  })

  document.addEventListener('formvalid', (event) => {

    if (popupClass) popupClass.closePopup();
    successMsgHandler(true);

  })

  function resetBtnAccess(input) {

    if (!resetBtn) return;

    let fill = input._inputs.some((input) => input.value.length > 0);

    if (fill) {
      resetBtn.classList.add('active');
      resetBtn.removeAttribute('disabled');
    } else {
      resetBtn.classList.remove('active');
      resetBtn.setAttribute('disabled', '');
    }

  }

  function showWarning(element, code) {

    let lang = document.documentElement.lang;
    let emptyField = lang === 'en' ? 'Empty field. Type some text' : 'Leeres Feld. Geben Sie einen Text ein';
    let onlyLatins = lang === 'en' ? 'Only latin symbols allowed' : 'Nur lateinische Symbole erlaubt';
    let minSymbolsCount = lang === 'en' ? 'Enter minimum 2 symbols' : 'Geben Sie mindestens 2 Zeichen ein';

    if (code === 'Empty field') {
      element._warnField.textContent = emptyField;
    } else if (code === 'Only latins allowed') {
      element._warnField.textContent = onlyLatins;
    } else if (code === 'Text lower than minimum length') {
      element._warnField.textContent = minSymbolsCount;
    }

    element._warnField.classList.add('active');
    element._warnField.style.height = element.scrollHeight + 'px';

  }

  function hideWarning(element) {

    element._warnField.classList.remove('active');
    element._warnField.style.height = '0px';

  }

  function findWarningFields() {

    let inputs = Array.from(form.querySelectorAll('[data-validate]'));

    inputs.forEach((input) => {

      let warnField = form.querySelector(`[data-warn="${input.id}"]`);
      input._warnField = warnField;
      input._inputs = inputs;

    })

  }

}

function mobileNavLine() {

  let line = document.querySelector('.mobile-nav');
  let media = window.matchMedia('(max-width: 768px)').matches;

  if (!(line && media)) return;

  scrollHandler();

  document.addEventListener('scroll', scrollHandler);

  function scrollHandler() {

    if (window.pageYOffset > 0) {
      line.classList.add('active');
    } else {
      line.classList.remove('active');
    }

  }

}

function replacePopupButtonInAboutBlock() {

  let button = document.querySelector('.about .button--common');
  let block = document.querySelector('.about .block-intro');
  let media = window.matchMedia('(max-width: 768px)').matches;

  if (!button || !media || !block ) return;

  button.classList.add('block-intro__button');
  block.append(button);

}

function replaceElementsInAboutBlock() {

  let media = window.matchMedia('(max-width: 660px)').matches;
  let controls = document.querySelector('.about .slider-controls');
  let link = document.querySelector('.about .skills-slider__link');
  let container = document.querySelector('.about .skills-slider');

  if (!media || !controls || !link || !container) return;

  let wrapper = document.createElement('div');
  wrapper.classList.add('skills-slider__bottom');

  wrapper.append(controls, link);
  container.append(wrapper);

}

function replaceSlidesInAboutBlock() {

  let media = window.matchMedia('(max-width: 660px)').matches;
  let slider = document.querySelector('#skillsSlider');
  let slides = slider.querySelectorAll('.swiper-slide');

  if (!media || !slider || slides.length > 2) return;

  Array.from(slider.firstElementChild.children).forEach((item) => item.remove());
  slider.firstElementChild.append(slides[1], slides[0]);

}

function createSkillsSlider() {

  let slider = document.querySelector('#skillsSlider');
  
  if (!slider) return;

  let media = window.matchMedia('(max-width: 660px)').matches;

  let object = new Swiper(slider, {
    slidesPerView: 1,
    speed: 700,
    simulateTouch: false,
    touchRatio: 0,
    effect: media ? 'slide' : 'cube',
    
    cubeEffect: {
      shadow: false,
      slideShadows: false,
    },

    navigation: {
      nextEl: '.about .slider-controls__btn--next',
      prevEl: '.about .slider-controls__btn--prev',
    },

    pagination: {
      el: '.skills-slider__pagination',
      type: 'custom',
      renderCustom: customSwiperPagination,
    },

    // autoplay: {
    //   delay: 2000,
    //   disableOnInteraction: false,
    //   pauseOnMouseEnter: true,
    // },

    breakpoints: {

      660: {
        speed: 700,
        autoHeight: false,
      },

      300: {
        speed: 600,
        autoHeight: true,
      }

    },

    on: {
      init: changeAboutSubtitle(elements_dic),
      slideChange: changeAboutSubtitle(elements_dic),
    },

  });

  return object;

}

function exploreComponentHandler(dictionary) {

  let elements = Array.from(document.querySelectorAll('.explore'));

  if (elements.length === 0 || !dictionary) return;

  let media = window.matchMedia('(max-width: 768px)').matches;
  let lang = document.documentElement.lang;

  elements.forEach((item) => {

    if (media) {

      item.dataset.lang = 'explore-mob';
      let text = dictionary[item.dataset.lang][lang];
      item.textContent = text;
      item.classList.add('explore--mobile');

    } else {

      item.dataset.lang = 'explore';
      let text = dictionary[item.dataset.lang][lang];
      item.textContent = text;
      item.classList.remove('explore--mobile');

    }

  })

}

function addExtraSlidesInToolsSlider() {

  let slider = document.querySelector('#toolsSlider');

  if (!slider) return;

  let swiper = slider.swiper;
  let slidesCount = swiper.params.slidesPerView;
  let isCentered = swiper.params.centeredSlides;
  console.log(isCentered);

  if (slidesCount > 1 && !isCentered) {

    for (let i = 1; i <= slidesCount - 1; i++) {
      swiper.appendSlide(`<div class="swiper-slide"></div>`);
    }

  }

}




focusStateFix();
langControlsHandler();
popupTextareaAutoHeight();
formValidatorEventsHandler();
mobileNavLine();
replacePopupButtonInAboutBlock();
exploreComponentHandler(elements_dic);
addExtraSlidesInToolsSlider();