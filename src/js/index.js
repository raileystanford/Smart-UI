import { 
  UpdatePageTitle,
  ChangeLanguage,
  ScrollToTop,
  Popup,
  FormValidator,
  Chat,
  Parallax,
  BurgerMenu,
  LazyLoad,
  DropAnswer,
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

new ScrollToTop({
  '1024-9999': 1000,
  '300-500': 1400,
});

new FormValidator({

  textInput: {
    onlyLatin: true,
    minLength: 2,
    forbiddenSymbols: false,
  }

});

const chatClass = new Chat();

const popupClass = new Popup({
  backDrop: true, // Добавляет блок на весь экран затеняющий все кроме попапа. Можно стили его настроить через css
  closeOnBtn: true, // Закрыть попап только закрывающей кнопкой а не тычком вне него
  escButtonClose: true, // Закрыть попап клавишей Escape
  // pageWrapper: '.selector', // Если у страницы есть какаято обертка типо для смус скрола то указываем ее селектор тут чтоб падинг для скролбара норм работал. Если нету обертки просто не пиши это свойтсо
  delay: 100, // Добавляет задержку перед возвращением прокрутки и верт скрола чтобы при закрытии попап не дергало в сторону

  preOpenCallback: function(btn, popup) {
    if (chatClass) chatClass.closeChat();
    successMsgHandler(false);
    hideChatButton(true);
    changePopupInfo(btn, popup);
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
      slidesPerView: 2,
      slidesPerGroup: 1, 
      spaceBetween: 39,
      speed: 700,
    },

    769: {
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
      centeredSlides: false,
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

mobileTeamSlider();

new LazyLoad({
  offset: 800,
});

new Swiper('#worksSlider', {
  slidesPerView: 3,
  slidesPerGroup: 3,
  spaceBetween: 1,
  speed: 1000,
  simulateTouch: false,
  autoHeight: true,

  navigation: {
    nextEl: '.works .slider-controls__btn--next',
    prevEl: '.works .slider-controls__btn--prev',
  },

  pagination: {
    el: '.works .slider__pagination',
    type: 'custom',
    renderCustom: customSwiperPagination,
  },

  // autoplay: {
  //   delay: 2000,
  //   disableOnInteraction: false,
  //   pauseOnMouseEnter: true,
  // },

  breakpoints: {

    661: {
      slidesPerView: 3,
      slidesPerGroup: 3,
      speed: 1000,
    },

    437: {
      slidesPerView: 2,
      slidesPerGroup: 2,
      speed: 1000,
    },

    300: {
      slidesPerView: 1,
      slidesPerGroup: 1,
      speed: 600,
    }

  },

});

new Swiper('#reviewsSlider', {
  slidesPerView: 1,
  spaceBetween: 1,
  speed: 900,
  simulateTouch: false,
  effect: 'cube',
    
  cubeEffect: {
    shadow: false,
    slideShadows: false,
  },

  navigation: {
    nextEl: '.reviews .slider-controls__btn--next',
    prevEl: '.reviews .slider-controls__btn--prev',
  },

  pagination: {
    el: '.reviews .reviews__pagination',
    type: 'custom',
    renderCustom: customSwiperPagination,
  },

  // autoplay: {
  //   delay: 2000,
  //   disableOnInteraction: false,
  //   pauseOnMouseEnter: true,
  // },

  breakpoints: {

    661: {
      speed: 900,
    },

    300: {
      speed: 600,
    }

  },

});

new DropAnswer({
  backdropClose: true,
  multiple: false,
  escapeClose: true,
})


// Other functions

function changePopupInfo(btn, popup) {

  if (!popup.matches('.popup-msg--team')) return;

  let card = btn.closest('.teammate');
  let avatar = getImg();
  let name = card.querySelector('.teammate__name').textContent;
  let role = card.querySelector('.teammate__role').textContent;
  let lang = document.documentElement.lang;

  replaceAvatar();
  replaceName();
  replaceRole();
  replaceSubtext();

  function replaceSubtext() {

    let subArea = popup.querySelector('.popup-msg__subtitle--sub');
    let text = lang === 'en' ? `Please leave one of your contacts, ${name} will contact you.` : `Bitte hinterlassen Sie einen Ihrer Kontaktdaten, ${name} wird sich mit Ihnen in Verbindung setzen.`;

    subArea.textContent = text;

  }

  function replaceRole() {

    let roleArea = popup.querySelector('.popup-msg__subtitle--role');
    
    roleArea.textContent = role;

  }

  function replaceName() {

    let firstName = name.split(' ')[0];
    let nameArea = popup.querySelector('.popup-msg__title');
    let text = lang === 'en' ? `Leave message to ${firstName}` : `Hinterlasse eine Nachricht für ${firstName}`;

    nameArea.textContent = text;

  }
  
  function replaceAvatar() {

    let userAvatar = popup.querySelector('.popup-msg__avatar');
    let isPictureTag = userAvatar.closest('picture');

    if (isPictureTag) {
      isPictureTag.replaceWith(avatar);
    } else {
      userAvatar.replaceWith(avatar);
    }

  }

  function getImg() {

    let img = card.querySelector('.teammate__avatar');

    if (img.closest('picture')) {
      img = img.closest('picture').cloneNode(true);
      img.lastElementChild.className = 'popup-msg__avatar';
    } else {
      img = img.cloneNode();
      img.className = 'popup-msg__avatar';
    }

    return img;

  }
}

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

function textareaAutoHeight() {

  let elements = Array.from(document.querySelectorAll('textarea'));

  if (elements.length === 0) return;

  let maxHeight = 62;

  document.addEventListener('input', (event) => {

    let input = event.target.closest('textarea');

    if (input) {

      if (!input._initHeight) input._initHeight = input.offsetHeight;
      input.style.height = '4px';
      let inputHeight = input.scrollHeight;
      if (inputHeight < input._initHeight) inputHeight = input._initHeight;
      if (inputHeight > maxHeight) inputHeight = maxHeight;
      input.style.height = inputHeight + 'px';

    }

  });

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
    
    if (input.tagName === 'TEXTAREA') input.style.height = '';

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

function clearRequestFormFields(form) {

  let inputs = Array.from(form.querySelectorAll('[data-validate]'));

  inputs.forEach((input) => {
    input.value = '';
    if (input._initHeight) input.style.height = input._initHeight + 'px';
  });

}

function formValidatorEventsHandler() {

  let forms = Array.from(document.querySelectorAll('[data-form]'))

  if (forms.length === 0) return;

  findWarningFields();

  document.addEventListener('invalidinput', (event) => {
    
    event.detail.forEach((item) => {
      showWarning(item.input, item.msg);
    });

  });

  document.addEventListener('input', (event) => {

    let input = event.target.closest('[data-form] [data-validate]');

    if (input) {
      hideWarning(input);
      resetBtnAccess(input);
    } 

  })

  document.addEventListener('formvalid', (event) => {

    if (!(event.target.id === 'requestForm')) {
      if (popupClass) popupClass.closePopup();
    } else {
      clearRequestFormFields(event.target);
    }
    
    successMsgHandler(true);

  })

  function resetBtnAccess(input) {

    let resetBtn = input.form.querySelector('[type="reset"]');

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
    let onlyCyrylic = lang === 'en' ? 'Only cyrylic symbols allowed' : 'Nur cyrylische Symbole erlaubt';
    let digits = lang === 'en' ? 'Digits not allowed' : 'Ziffern nicht erlaubt';
    let forbiddenSymbol = lang === 'en' ? 'Forbidden symbol' : 'Verbotenes Symbol';
    let moreThanOneEmail = lang === 'en' ? 'Only one email required' : 'Nur eine E-Mail erforderlich';
    let wrongEmailFormat = lang === 'en' ? 'Wrong email format' : 'Falsches E-Mail-Format';

    if (code === 'Empty field') {
      element._warnField.textContent = emptyField;
    } else if (code === 'Only latins allowed' || code === 'Cyrylic symbols forbidden') {
      element._warnField.textContent = onlyLatins;
    } else if (code === 'Text lower than minimum length') {
      element._warnField.textContent = minSymbolsCount;
    } else if (code === 'Only cyrylic allowed') {
      element._warnField.textContent = onlyCyrylic;
    } else if (code === 'Digits not allowed') {
      element._warnField.textContent = digits;
    } else if (code === 'Forbidden symbol') {
      element._warnField.textContent = forbiddenSymbol;
    } else if (code === 'More than one email') {
      element._warnField.textContent = moreThanOneEmail;
    } else if (code === 'Wrong email format') {
      element._warnField.textContent = wrongEmailFormat;
    }

    let info = getComputedStyle(element);
    let paddingTop = parseFloat(info.paddingTop);
    let paddingBot = parseFloat(info.paddingBottom);

    element._warnField.classList.add('active');
    element._warnField.style.height = element.scrollHeight - paddingTop - paddingBot + 'px';

  }

  function hideWarning(element) {

    element._warnField.classList.remove('active');
    element._warnField.style.height = '0px';

  }

  function findWarningFields() {

    forms.forEach((form) => {

      let inputs = Array.from(form.querySelectorAll('[data-validate]'));

      inputs.forEach((input) => {

        let warnField = form.querySelector(`[data-warn="${input.id}"]`);
        input._warnField = warnField;
        input._inputs = inputs;

      })

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

  if (slidesCount > 1 && !isCentered) {

    for (let i = 1; i <= slidesCount - 1; i++) {
      swiper.appendSlide(`<div class="swiper-slide"></div>`);
    }

  }

}

function strategyElementsAutoCount() {

  let elements = Array.from(document.querySelectorAll('.description__count'));

  if (elements.length === 0) return;

  elements.forEach((item, index) => {

    let number = (index + 1) < 10 ? '0' + (index + 1) : index + 1;
    item.textContent = number;

  });

}

function strategyMobileSlider() {

  let container = document.querySelector('.strategy__content');
  let elements = Array.from(container.querySelectorAll('.strategy__description'));
  let media = window.matchMedia('(max-width: 768px)').matches;

  if (!container || !media || elements.length === 0) return;

  let slider = createSlider();
  let controls = createControls();

  container.innerHTML = '';
  container.append(slider, controls);

  activateSlider();

  function createSlider() {

    let slider = document.createElement('div');
    slider.classList.add('swiper', 'strategy__slider');
    slider.id = 'strategySlider';

    let wrapper = document.createElement('div');
    wrapper.classList.add('swiper-wrapper');

    slider.append(wrapper);

    let slidesCount = Math.ceil(elements.length / 3);

    for (let i = 1; i <= slidesCount; i++) {
      
      let slide = document.createElement('div');
      slide.classList.add('swiper-slide');

      let inner = document.createElement('div');
      inner.classList.add('strategy__slide');

      let group = elements.splice(0, 3);
      group.forEach((item) => inner.append(item));

      slide.append(inner);
      wrapper.append(slide);

    }

    return slider;

  }

  function createControls() {

    let block = document.createElement('div');
    block.classList.add('strategy__controls');

    let btns = `<div class="slider-controls slider-controls--dark strategy__slider-controls">

                  <button class="slider-controls__btn slider-controls__btn--prev">
                    <img src="./images/icons/arrow.png" alt="prev" class="slider-controls__icon">
                  </button>

                  <button class="slider-controls__btn slider-controls__btn--next">
                    <img src="./images/icons/arrow.png" alt="next" class="slider-controls__icon">
                  </button>

                </div>`;

    let pagintaion = `<div class="pagination strategy__pagination"></div>`;

    block.insertAdjacentHTML('beforeend', pagintaion);
    block.insertAdjacentHTML('beforeend', btns);

    return block;

  }

  function activateSlider() {

    new Swiper(slider, {
      slidesPerView: 1,
      spaceBetween: 1,
      speed: 700,
      simulateTouch: false,
      autoHeight: true,
      effect: 'cube',
    
      cubeEffect: {
        shadow: false,
        slideShadows: false,
      },

      navigation: {
        nextEl: '.strategy .slider-controls__btn--next',
        prevEl: '.strategy .slider-controls__btn--prev',
      },

      pagination: {
        el: '.strategy .strategy__pagination',
        type: 'custom',
        renderCustom: customSwiperPagination,
      },

      // autoplay: {
      //   delay: 2000,
      //   disableOnInteraction: false,
      //   pauseOnMouseEnter: true,
      // },

    });

  }

}

function showMoreTeammates() {

  let container = document.querySelector('.teammates__body');
  let button = document.querySelector('.teammates__button');
  let media = window.matchMedia('(max-width: 660px)').matches;

  if (media || !button || !container) return;

  let observer;
  let conInfo = getComputedStyle(container);
  let paddingBot = parseFloat(conInfo.paddingBottom);
  let cards = Array.from(container.querySelectorAll('.teammate'));

  container.style.height = cards[0].offsetHeight + paddingBot + 'px';
  observeCards();

  button.addEventListener('click', (event) => {

    let lang = document.documentElement.lang;

    if (button.matches('.active')) {
      closeContainer(lang);
    } else {
      openContainer(lang);
    }
    
  });

  function openContainer(lang) {

    let text = lang === 'en' ? 'Hide' : 'Verstecken';

    container.style.height = container.scrollHeight + 'px';
    container.classList.add('active');
    button.classList.add('active');
    button.textContent = text;

  }

  function closeContainer(lang) {

    let text = lang === 'en' ? 'The whole team' : 'Das gesamte Team';

    container.style.height = cards[0].offsetHeight + paddingBot + 'px';
    container.classList.remove('active');
    button.classList.remove('active');
    button.textContent = text;

    cards[0].scrollIntoView({ behavior: 'instant', inline: 'center' });

  }

  function observeCards() {

    observer = new IntersectionObserver((list, obs) => {

      list.forEach((item) => {

        if (item.isIntersecting) {
          item.target.classList.remove('hidden');
        } else {
          item.target.classList.add('hidden');
        }

      })

    }, { root: container, threshold: 0.01 });

    cards.forEach((card) => { observer.observe(card) });

  }

}

function translateTeamMoreButton() {

  let button = document.querySelector('.teammates__button');

  if (!button) return;

  document.addEventListener('translated', (event) => {

    let lang = document.documentElement.lang;
    let text;

    if (button.matches('.active')) {
      text = lang === 'en' ? 'Hide' : 'Verstecken';
    } else {
      text = lang === 'en' ? 'The whole team' : 'Das gesamte Team';
    }

    button.textContent = text;

  });
  
}

function mobileTeamSlider() {

  let cards = Array.from(document.querySelectorAll('.team .teammate'));
  let media = window.matchMedia('(max-width: 660px)').matches;

  if (!media || cards.length === 0) return;

  let container = document.querySelector('.team__content');
  let slider = createSlider();

  container.innerHTML = '';
  container.append(slider);

  addControls();
  initSlider();

  function createSlider() {

    let slider = document.createElement('div');
    slider.classList.add('swiper', 'team__slider');
    slider.setAttribute('data-load-block', '');

    let wrapper = document.createElement('div');
    wrapper.classList.add('swiper-wrapper');

    cards.forEach((card) => {

      let slide = document.createElement('div');
      slide.classList.add('swiper-slide');
      slide.append(card);
      wrapper.append(slide);

    });

    slider.append(wrapper);

    return slider;

  }

  function initSlider() {

    new Swiper(slider, {
      slidesPerView: 2.3,
      slidesPerGroup: 1,
      spaceBetween: 30,
      speed: 600,
      autoHeight: true,
      centeredSlides: true, // Центрирование слайда
      initialSlide: 1, // Каокй слайд по счету изначально активен с 0

      navigation: {
        nextEl: '.team .slider-controls__btn--next',
        prevEl: '.team .slider-controls__btn--prev',
      },

      // autoplay: {
      //   delay: 2000,
      //   disableOnInteraction: false,
      //   pauseOnMouseEnter: true,
      // },

      breakpoints: {

        520: {
          slidesPerView: 2.3,
          spaceBetween: 30,
        },

        437: {
          slidesPerView: 2,
          spaceBetween: 18,
        },

        300: {
          slidesPerView: 1.341,
          spaceBetween: 18,
        }

      },

    });

  }

  function addControls() {

    let controls = `<div class="slider-controls team__slider-controls">

                      <button class="slider-controls__btn slider-controls__btn--prev">
                        <img src="./images/icons/arrow.png" alt="prev" class="slider-controls__icon">
                      </button>

                      <button class="slider-controls__btn slider-controls__btn--next">
                        <img src="./images/icons/arrow.png" alt="next" class="slider-controls__icon">
                      </button>

                    </div>`;

    container.insertAdjacentHTML('beforeend', controls);

  }

}

function aboutBlockGreenLine() {

  let slider = document.querySelector('#skillsSlider');
  let media = window.matchMedia('(max-width: 660px)').matches;

  if (!slider || media) return;

  let lineEl;

  addLine();
  calcWidth();

  function addLine() {

    let line = document.createElement('div');
    line.classList.add('skills-slider__line');
    slider.append(line);
    lineEl = line;

  }

  function calcWidth() {

    let info = lineEl.getBoundingClientRect();
    let clientWidth = window.innerWidth;
    let width = clientWidth - info.x - 1;
    
    lineEl.style.width = width + 'px';

  }

}

function mobileAdvantagesSlider() {

  let container = document.querySelector('.advantages__content');
  let media = window.matchMedia('(max-width: 660px)').matches;

  if (!media || !container) return;

  let cards = Array.from(container.querySelectorAll('.advantage'));
  let button = container.querySelector('.advantages__button');
  let slider;

  container.innerHTML = '';

  createSlider();
  createControls();
  initSlider();
  
  function createSlider() {

    slider = document.createElement('div');
    slider.classList.add('swiper', 'advantages__slider');

    let wrapper = document.createElement('div');
    wrapper.classList.add('swiper-wrapper');

    cards.forEach((card) => {

      let slide = document.createElement('div');
      slide.classList.add('swiper-slide');

      slide.append(card);
      wrapper.append(slide);

    });

    slider.append(wrapper);
    container.append(slider);

  }

  function createControls() {

    let controls = document.createElement('div');
    controls.classList.add('advantages__controls');

    let btns = `<div class="slider-controls slider-controls--dark advantages__slider-controls">

                  <button class="slider-controls__btn slider-controls__btn--prev">
                    <img src="./images/icons/arrow.png" alt="prev" class="slider-controls__icon">
                  </button>

                  <button class="slider-controls__btn slider-controls__btn--next">
                    <img src="./images/icons/arrow.png" alt="next" class="slider-controls__icon">
                  </button>

                </div>`;

    controls.insertAdjacentHTML('beforeend', btns);
    controls.append(button);
    container.append(controls);

  }

  function initSlider() {

    new Swiper(slider, {
      slidesPerView: 2.6,
      slidesPerGroup: 1,
      spaceBetween: 18,
      speed: 600,
      autoHeight: true,
      centeredSlides: true, // Центрирование слайда
      initialSlide: 1, // Каокй слайд по счету изначально активен с 0

      navigation: {
        nextEl: '.advantages .slider-controls__btn--next',
        prevEl: '.advantages .slider-controls__btn--prev',
      },

      // autoplay: {
      //   delay: 2000,
      //   disableOnInteraction: false,
      //   pauseOnMouseEnter: true,
      // },

      breakpoints: {

        437: {
          slidesPerView: 2.6,
        },

        300: {
          slidesPerView: 1.4,
        }

      },

    });

  }

}

function mobileReviewsBlock() {

  let block = document.querySelector('.reviews');
  let media = window.matchMedia('(max-width: 950px)').matches;

  if (!block || !media) return;

  let intro = block.querySelector('.block-intro');
  let view = block.querySelector('.reviews__view');

  if (!intro || !view) return;

  let conrainer = document.createElement('div');
  conrainer.classList.add('reviews__header');

  conrainer.append(intro, view);
  block.prepend(conrainer);

}




focusStateFix();
langControlsHandler();
textareaAutoHeight();
formValidatorEventsHandler();
mobileNavLine();
replacePopupButtonInAboutBlock();
exploreComponentHandler(elements_dic);
addExtraSlidesInToolsSlider();
strategyMobileSlider();
strategyElementsAutoCount();
showMoreTeammates();
translateTeamMoreButton();
aboutBlockGreenLine();
mobileAdvantagesSlider();
mobileReviewsBlock();