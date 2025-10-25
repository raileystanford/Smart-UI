import { 
  UpdatePageTitle,
  ChangeLanguage,
  Popup,
  FormValidator,
  Chat,
  Parallax,
} from './modules/modules.js';

import { titles, elements } from './modules/dictionary.js';


// Plugins
new UpdatePageTitle({
  dictionary: { ...titles, ...elements },
  observer: {
    threshold: 0.3,
  },
});

new ChangeLanguage({
  dictionary: { ...titles, ...elements }
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

const popupClass = new Popup({
  backDrop: true, // Добавляет блок на весь экран затеняющий все кроме попапа. Можно стили его настроить через css
  closeOnBtn: true, // Закрыть попап только закрывающей кнопкой а не тычком вне него
  escButtonClose: true, // Закрыть попап клавишей Escape
  // pageWrapper: '.selector', // Если у страницы есть какаято обертка типо для смус скрола то указываем ее селектор тут чтоб падинг для скролбара норм работал. Если нету обертки просто не пиши это свойтсо
  delay: 100, // Добавляет задержку перед возвращением прокрутки и верт скрола чтобы при закрытии попап не дергало в сторону

  preOpenCallback: function() {
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

new Chat();

// new Parallax({
//   off: 768,
// });


// Other functions


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
    let button = document.querySelector(`[data-lang-var="${lang}"]`);
    unselectOtherButtons();
    selectButton(button);
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

  let button = document.querySelector('.chat-btn');

  if (!button) return;

  if (state) {

    button.classList.add('hide');

  } else {

    setTimeout(() => {
      button.classList.remove('hide');
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


focusStateFix();
langControlsHandler();
popupTextareaAutoHeight();
formValidatorEventsHandler();