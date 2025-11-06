class UpdatePageTitle {

  constructor(params) {
    this.params = params ?? {};
    this.items = Array.from(document.querySelectorAll('[data-title]'));
    
    if (this.items.length > 0) {
      this.ownMethodsBinder();
      this.getElements();
      this.createObserver();
      this.installObserverOnElements();
    }
  
  }

  installObserverOnElements() {

    this.items.forEach((item) => this.observer.observe(item));

  }

  createObserver() {

    let params = this.params.observer ?? {};

    let options = {
      root: null,
      rootMargin: params.rootMargin ?? '0px',
      threshold: params.threshold ?? 0.3,
      delay: params.delay ?? 0
    }

    this.observer = new IntersectionObserver(this.observerHandler, options);

  }

  observerHandler(list, observer) {

    list.forEach((item) => {

      let element = item.target;
      let msg = element.dataset.title;

      if (item.isIntersecting) {
        
        if (this.params.dictionary) {
          this.title._translateKey = msg; 
          this.translator();
        } else {
          this.title.textContent = msg;
        }
  
      }

    })

  }

  translator() {

    let lang = document.documentElement.lang;
    let key = this.title._translateKey;
    let text = this.params.dictionary[key][lang];

    this.title.textContent = text;

  }

  getElements() {

    this.title = document.querySelector('title');

  }

  ownMethodsBinder() {
    let prototype = Object.getPrototypeOf(this);
    let ownMethods = Object.getOwnPropertyNames(prototype);

    for (let item of ownMethods) {
      if (item !== 'constructor') prototype[item] = prototype[item].bind(this);
    }
  }

}

class ChangeLanguage {

  constructor(params) {
    this.params = params ?? {};
    this.elements = Array.from(document.querySelectorAll('[data-lang]'));
    this.controls = Array.from(document.querySelectorAll('[data-lang-controls]'));
    this.dictionary = this.params.dictionary;
    this.autoSetted = false;
 
    if (this.elements.length > 0 && this.controls.length > 0) {
      this.ownMethodsBinder();
      this.getLanguages();
      if (this.params.autoSet) this.languageAutoSet();
      this.setEventListeners();
      if (!this.autoSetted) this.setCurrentLanguage();
    }
  }

  setEventListeners() {
    window.addEventListener('click', this.workOperator);
  }

  workOperator(event) {
    let target = event.target;

    if (target.closest('[data-lang-var]')) {
      let button = target.closest('[data-lang-var]');
      let language = button.dataset.langVar;

      this.changeLaguage(language);
    }
  }

  async languageAutoSet() {

    let request = await fetch('https://ipapi.co/json/');
    if (request.ok) {
      let response = await request.json();
      let countryCode = response.country_code.toLowerCase();
      let langPresense = this.langList.includes(countryCode);
      
      if (langPresense) {
        this.changeLaguage(countryCode);
        this.autoSetted = true;
      } 
      
    }
  }

  changeLaguage(language) {

    if (language === document.documentElement.lang) return;

    document.dispatchEvent(new CustomEvent('pretranslate', { bubbles: true, cancelable: true, composed: true, detail: language }));

    this.elements.forEach((item) => {

      let dictionary = this.dictionary;
      let innerHTML = item.dataset.lang.match(/\*/);
      let elementKey = item.dataset.lang.match(/[^\*]+/g)[0];
      let tag = item.tagName;
      let content;

      try {

        content = dictionary[elementKey][language];
        if (!content) throw new Error();
        
      } catch(err) {

        if (err.name === 'TypeError') {
          console.log(`key [${elementKey}] not found in dictionary`);
        } else {
          console.log(`lang variant [${language}] for key [${elementKey}] not found in dictionary`);
        }
 
      }

      if (tag === 'IMG') {

        item.alt = content;
  
      } else if (tag === 'INPUT' || tag === 'TEXTAREA') {

        item.placeholder = dictionary[elementKey][language];

      } else if (content) {

        if (innerHTML) {
          item.innerHTML = content;
        } else {
          item.textContent = content;
        }

      }

    });

    document.documentElement.lang = language;
    localStorage.setItem('currentLang', language);
    document.dispatchEvent(new CustomEvent('translated', { bubbles: true, cancelable: true, composed: true, detail: language }));

  }

  getLanguages() {
    this.langList = [];
    this.controls.forEach((control) => {
      let btns = Array.from(control.querySelectorAll('[data-lang-var]'));
      btns.forEach((item) => {
        this.langList.push(item.dataset.langVar);
      })
    })
  }

  updateElements() {
    this.elements = Array.from(document.querySelectorAll('[data-lang]'));
  }

  setCurrentLanguage() {

    let lang = localStorage.getItem('currentLang');
    if (lang) this.changeLaguage(lang);

  }

  ownMethodsBinder() {
    let prototype = Object.getPrototypeOf(this);
    let ownMethods = Object.getOwnPropertyNames(prototype)
    for (let item of ownMethods) {
      if (item !== 'constructor') prototype[item] = prototype[item].bind(this);
    }
  }
}

class Popup {

  constructor(params) {
    this.params = params ?? {};
    this.params.backDrop = this.params.backDrop ?? true;
    this.pageWrapper = this.params.pageWrapper ? document.querySelector(this.params.pageWrapper) : document.body;
    this.scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

    this.popupClosed = true;

    this.createBackdrop();
    this.ownMethodsBinder();
    this.setEventListeners();
  }

  setEventListeners() {
    window.addEventListener('click', this.mouseOperator);
    if (this.params.escButtonClose) {
      window.addEventListener('keydown', this.keyboardOperator);
    }
  }

  mouseOperator(event) {

    let target = event.target;
    let btn = this.getButton(event);
    
    if (btn) {
      this.openPopup(btn);
    } else if (target.closest('[data-popup-close]')) {
      this.closePopup();
    } else if (!target.closest(this.popupClass) && !target.closest('[data-popup]') && !this.params.closeOnBtn) {
      this.closePopup();
    }

  }

  keyboardOperator(event) {
    if (event.key === "Escape" && !this.popupClosed) {
      this.popup ? this.closePopup(this.popup) : null;
    }
  }

  openPopup(btn) {

    this.params.preOpenCallback?.(btn, this.popup);

    this.popupClass = `.${btn.dataset.popup}`;
    this.popup = document.querySelector(this.popupClass);
    this.triggerBtn = btn;
    this.triggerBtn.style.pointerEvents = 'none';

    if (this.previousPopup) this.previousPopup.classList.remove('active');
    if (this.params.backDrop) this.backDrop.classList.add('active');
    if (window.matchMedia('(min-width: 769px)').matches) this.pageWrapper.style.paddingRight = this.scrollbarWidth + 'px';

    this.previousPopup = this.popup;
    this.popup.addEventListener('transitionend', (event) => this.popup.focus(), { once: true });
    this.popup.classList.add('active');
    document.body.style.overflow = 'hidden';

    this.params.afterOpenCallback?.(btn, this.popup);

    this.popupClosed = false;

  }

  closePopup() {
    this.params.preCloseCallback?.(this.triggerBtn, this.popup);
    this.triggerBtn.style.pointerEvents = '';
    let delay = this.params.delay ? this.params.delay : 0;
    this.popup.classList.remove('active');
    this.popup.blur();
    if (this.params.backDrop) this.backDrop.classList.remove('active');
    this.params.afterCloseCallback?.(this.triggerBtn, this.popup);
    setTimeout(() => {
      document.body.style.overflow = '';
      this.pageWrapper.style.paddingRight = '';
    }, delay);
    this.popupClosed = true;
  }

  getButton(event) {
    let target = event.target;
    if (target.closest('[data-popup]')) {
      return target.closest('[data-popup]'); 
    }
  }

  createBackdrop() {
    if (this.params.backDrop) {
      this.backDrop = document.createElement('div');
      this.backDrop.classList.add('popup-overlay');
      document.body.append(this.backDrop);
    }
  }

  ownMethodsBinder() {
    let prototype = Object.getPrototypeOf(this);
    let ownMethods = Object.getOwnPropertyNames(prototype)
    for (let item of ownMethods) {
      if (item !== 'constructor') prototype[item] = prototype[item].bind(this);
    }
  }

}

class FormValidator {

  constructor(params) {

    this.params = params ?? {};
    this.resetWhenChange = this.params.resetWhenChange ?? true;
    this.realTimeCheck = this.params.realTimeCheck;
    this.submitLock = this.params.lockSubmit;
    this.form = document.querySelector(this.params.form);

    if (this.form) {

      this.submitBtn = this.form.querySelector('[type="submit"]');
      this.resetBtn = this.form.querySelector('[type="reset"]');
      this.invalids = [];
      if (this.submitLock) this.filledInputs = new Set();

      this.ownMethodsBinder();
      this.updateFormFields();
      this.initPhoneMask();
      this.setEventListeners();

    }

  }

  setEventListeners() {

    this.form.addEventListener('submit', this.submitHandler);

    if (this.resetBtn) this.form.addEventListener('reset', this.resetFormFields);

    document.addEventListener('input', this.inputHandler);

  }

  submitHandler(event) {

    event.preventDefault();

    this.fields.forEach((field) => {

      if (field.type === 'text' || field.tagName === 'TEXTAREA') {
        this.validateTextField(field);
      } else if (field.type === 'email') {
        this.validateEmailField(field);
      } else if (field.type === 'tel') {
        this.validatePhoneField(field);
      } else if (field.type === 'checkbox') {
        this.validateSoloCheckbox(field);
      } else if (field.tagName !== 'INPUT') {
        this.validateGroupedCheckboxRadios(field);
      }

    });

    let validInputs = this.form.querySelectorAll('.valid');

    if (validInputs.length === this.fields.length) {
      this.validEvent();
      // this.form.submit();
      this.resetFormFields();
    } else {
      this.invalidEvent();
    }

  }

  inputHandler(event) {

    let input = event.target;

    input.classList.remove('valid');

    if (this.submitLock) {
      this.submitBtnLockHandler(input);
    }

    if (this.resetWhenChange) {
      input.classList.remove('invalid');
    }

    if (this.realTimeCheck) {

      if (input.type === 'text' || input.tagName === 'TEXTAREA') {
        this.validateTextField(input);
      } else if (input.type === 'email') {
        this.validateEmailField(field);
      } else if (input.type === 'tel') {
        this.validatePhoneField(field);
      }

      if (this.invalids.length > 0) this.invalidEvent();

    }
 
  }

  resetFormFields() {

    this.fields.forEach((field) => {

      field.value = '';
      field.classList.remove('invalid');
      field.classList.remove('valid');

    })

  }

  validEvent() {

    let event = new CustomEvent('formvalid', {

      bubbles: true,
      cancelable: true,
      composed: true,

    });

    this.form.dispatchEvent(event);

  }

  invalidEvent() {

    let event = new CustomEvent('invalidinput', {

      bubbles: true,
      cancelable: true,
      composed: true,
      detail: [...this.invalids],

    });

    this.form.dispatchEvent(event);
    this.invalids.length = 0;

  }

  validationError(input, msg) {

    input.classList.add('invalid');
    this.invalids.push({ input, msg });

  }

  submitBtnLockHandler(input) {

    if (input.value.length > 0) { 
      this.filledInputs.add(input);
    } else {
      this.filledInputs.delete(input);
    }

    if (this.filledInputs.size === this.fields.length) {
      this.submitBtn.removeAttribute('disabled');
    } else {
      this.submitBtn.setAttribute('disabled', '');
    }

  }

  validateTextField(input) {

    let opt = this.params.textInput ?? {};
    let value = input.value.trim();

    let isEmpty = value.length === 0;
    let isLatinText = !/[а-я]/i.test(value);
    let isCyrylicText = !/[a-z]/i.test(value);
    let isMinLengthDone = value.length >= (opt.minLength ?? 1);
    let isNotContainNumbers = !/\d+/.test(value);
    let isContainForbiddenSymbols;

    if (opt.forbiddenSymbols !== false) {
      isContainForbiddenSymbols = (opt.forbiddenSymbols ?? /[!@#$%~^&*()-_=+{}\[\];:'"><,./?\\|`]/).test(value);
    } else {
      isContainForbiddenSymbols = false;
    }

    if (isEmpty) {
      this.validationError(input, 'Empty field');
    } else if (!isLatinText && opt.onlyLatin) {
      this.validationError(input, 'Only latins allowed');
    } else if (!isCyrylicText && opt.onlyCyrylic) {
      this.validationError(input, 'Only cyrylic allowed');
    } else if (!isNotContainNumbers && opt.noNumbers) {
      this.validationError(input, 'Digits not allowed');
    } else if (isContainForbiddenSymbols) {
      this.validationError(input, 'Forbidden symbol');
    } else if (!isMinLengthDone) {
      this.validationError(input, 'Text lower than minimum length');
    } else {
      input.classList.remove('invalid');
      input.classList.add('valid');
    }

  }

  validateEmailField(input) {

    let opt = this.params.emailInput ?? {};
    let value = input.value.trim();
    let regExp = /^[a-z][a-z0-9._-]*(?<![._-])@[a-z0-9-]+(?:\.[a-z0-9-]+)*\.[a-z]{2,}$/i;

    let isEmpty = value.length === 0;
    let isMultipleAccepted = input.multiple;
    let isMultiple = (value.match(/@/g) ?? []).length > 1;
    let isOnlyLatinSymbols = !/[а-я]/i.test(value);
    let isCorrectFormat, isAllowedDomain;

    if (isMultipleAccepted) {

      let correctCount = 0;

      let emails = value.split(' ');
    
      emails.forEach((email) => {
        if (regExp.test(email)) correctCount++;
      });

      if (correctCount === emails.length) {
        isCorrectFormat = true;
      } else {
        isCorrectFormat = false;
      }

    } else {

      isCorrectFormat = regExp.test(value);

    }

    if (opt.allowedDomains) {

      isAllowedDomain = opt.allowedDomains.some((item) => value.includes(item));

    } else {

      isAllowedDomain = true;

    }

    if (isEmpty) {
      this.validationError(input, 'Empty field');
    } else if (!isOnlyLatinSymbols) {
      this.validationError(input, 'Cyrylic symbols forbidden');
    } else if (!isMultipleAccepted && isMultiple) {
      this.validationError(input, 'More than one email');
    } else if (!isCorrectFormat) {
      this.validationError(input, 'Wrong email format');
    } else if (!isAllowedDomain) {
      this.validationError(input, 'Wrong mail service');
    } else {
      input.classList.remove('invalid');
      input.classList.add('valid');
    }

  }

  validatePhoneField(input) {

    if (this.isPhoneMaskExist) {

      let value = input._mask.unmaskedValue;
      let mask = input._mask.masked.mask;
      let maskLength = mask.match(/\d/g).length;
      let codeLength = mask.match(/\{\d+\}/)[0].length - 2;

      let isFullNumber = value.length === maskLength;
      let isEmpty = value.length === codeLength;

      if (isEmpty) {
        this.validationError(input, 'Empty field');
      } else if (!isFullNumber) {
        this.validationError(input, 'Enter full number');
      } else {
        input.classList.remove('invalid');
        input.classList.add('valid');
      }
      
    } else {

      let value = input.value.trim();
      value = value.includes('+') ? value.replace(/\+/g, '') : value;
      let opt = this.params.phoneInput ?? {};

      let isEmpty = value.length === 0;
      let isMultiple = input.multiple;
      let isContainForbiddenSymbols = /[а-яa-z!@#$%^&*\(\)_=\-\|\}\{'";:\/?\.\\>,<`~]/i.test(value);
      let isFullLength = opt.length ? value.length === opt.length : true;

      let isAllowedCountry, isCorrectFormat;

      if (opt.code) {

        if (isMultiple) {

          let phones = value.split(' ');
          let validCount = 0;

          phones.forEach((phone) => {

            if (phone.startsWith(opt.code)) validCount++;

          });

          isAllowedCountry = validCount === phones.length;

        } else {

          isAllowedCountry = value.startsWith(opt.code);

        }

      } else {

        isAllowedCountry = true;

      }


      if (isEmpty) {
        this.validationError(input, 'Empty field');
      } else if (isContainForbiddenSymbols) {
        this.validationError(input, 'Forbidden symbol');
      } else if (!isFullLength) {
        this.validationError(input, 'Enter full number');
      } else if (!isAllowedCountry) {
        this.validationError(input, 'Wrong number country');
      }else {
        input.classList.remove('invalid');
        input.classList.add('valid');
      }

    }

  }

  validateSoloCheckbox(input) {

    let isChecked = input.checked;

    if (!isChecked) {
      this.validationError(input, 'Checkbox not selected');
    } else {
      input.classList.remove('invalid');
      input.classList.add('valid');
    }

  }

  validateGroupedCheckboxRadios(element) {

    let inputs = Array.from(element.querySelectorAll('[type="checkbox"], [type="radio"]'));
    let isSomeChecked = inputs.some((input) => input.checked);

    if (!isSomeChecked) {
      this.validationError(element, 'Select at least one element');
    } else {
      element.classList.remove('invalid');
      element.classList.add('valid');
    }

  }

  async initPhoneMask() {

    if (!this.params.phoneMask) return;

    let inputs = this.form.querySelectorAll('input[type="tel"][data-validate]');

    if (inputs.length === 0) return;

    let maskModule = await import('https://unpkg.com/imask?module');
    const IMask = maskModule.default ?? maskModule.IMask ?? window.IMask;

    inputs.forEach((input) => {

      let mask = IMask(input, this.params.phoneMask);
      input._mask = mask;

    });

    this.isPhoneMaskExist = true;

  }

  updateFormFields() {

    if (this.submitLock) this.submitBtn.setAttribute('disabled', '');

    this.form._validator = this;
    this.fields = Array.from(this.form.querySelectorAll('[data-validate]'));
    this.fields.forEach((field) => field._validator = this);

  }

  ownMethodsBinder() {

    let prototype = Object.getPrototypeOf(this);
    let ownMethods = Object.getOwnPropertyNames(prototype);

    for (let item of ownMethods) {
      if (item !== 'constructor') prototype[item] = prototype[item].bind(this);
    }

  }

}

class Chat {

  constructor() {

    this.trigger = document.querySelector('.chat-btn');
    this.chat = document.querySelector('.chat'); 

    if (!this.trigger || !this.chat) return; 

    this.preloader = this.chat.querySelector('.chat__preloader');
    this.input = this.chat.querySelector('.chat__input');
    this.submitBtn = this.chat.querySelector('.chat__btn--sent');
    this.typingIndicator = this.chat.querySelector('.chat__indicator');
    this.scrollArea = this.chat.querySelector('.simplebar-content-wrapper');

    this.lastMsgGroup = true;
    this.lastScrollCord = 0;

    this.ownMethodsBinder();
    this.emojiHandler();
    this.sendBtnLock();
    this.setEventListeners();

  }

  setEventListeners() {

    this.input.addEventListener('input', (event) => {

      this.textareaAutoHeight(this.input);
      this.sendBtnLock();

    });

    document.addEventListener('click', (event) => {

      let isTrigger = event.target.closest('.chat-btn');
      let isCloseBtn = event.target.closest('.chat__close');
      let isSendBtn = event.target.closest('.chat__btn--sent');
      let isEmojiBtn = this.picker ? event.target.closest('.chat__btn--emoji') : false;

      if (isTrigger) {
        this.openChat();
      } else if (isCloseBtn) {
        this.closeChat();
      } else if (isSendBtn) {
        this.sendMessage('user', this.input.value);
      } else if (isEmojiBtn) {
        this.emojiContainerHandler();
      }

    });

    document.addEventListener('pretranslate', (event) => {
      this.translateEmojiPicker(event);
    })

  }

  emojiContainerHandler() {

    this.emojiBtn.classList.toggle('active');
    this.emojiContainer.classList.toggle('active');

  }

  emojiHandler() {

    this.emojiBtn = this.chat.querySelector('.chat__btn--emoji');
    this.emojiContainer = this.chat.querySelector('.chat__emoji');

    if (!this.emojiBtn || !this.emojiContainer) {
      this.preloader.remove();
      return;
    } 

    this.createEmoji();
    this.preloadEmoji();

  }

  createEmoji() {

    if (!EmojiMart) return;

    this.media = window.matchMedia('(max-width: 436px)').matches;

    this.picker = new EmojiMart.Picker({
      onEmojiSelect: this.insertEmojiToInput,
      theme: 'dark',
      maxFrequentRows: 0,
      perLine: 8,
      emojiButtonSize: this.media ? 34.5 : 36,
      emojiSize: this.media ? 22.5 : 24,
      locale: document.documentElement.lang,
      previewPosition: 'none',
      categories: ['frequent', 'people', 'nature', 'foods', 'activity', 'places', 'objects', 'symbols', 'flags'],
    });

    this.picker.style.cssText = 'margin: 0 auto';
    this.emojiContainer.append(this.picker);

  }

  translateEmojiPicker(event) {

    let lang = event.detail;
    let suportsLangs = [ 'en', 'ar', 'be', 'cs', 'de', 'es', 'fa', 'fi', 'fr', 'hi', 'it', 'ja', 'ko', 'nl', 'pl', 'pt', 'ru', 'sa', 'tr', 'uk', 'vi', 'zh' ]
    
    if (!suportsLangs.includes(lang)) return;

    this.emojiContainer.addEventListener('transitionend', (event) => {
      this.emojiContainer.firstElementChild.remove();
    }, { once: true });

    this.emojiContainer.classList.remove('active');
    this.emojiBtn.classList.remove('active');

    setTimeout(() => {
      
      this.picker = new EmojiMart.Picker({
        onEmojiSelect: this.insertEmojiToInput,
        theme: 'dark',
        locale: lang,
        maxFrequentRows: 0,
        perLine: 8,
        emojiButtonSize: this.media ? 34.5 : 36,
        emojiSize: this.media ? 22.5 : 24,
        previewPosition: 'none',
        categories: ['frequent', 'people', 'nature', 'foods', 'activity', 'places', 'objects', 'symbols', 'flags'],
      });

      this.picker.style.cssText = 'margin: 0 auto';
      this.emojiContainer.append(this.picker);

    }, 100);

  }

  insertEmojiToInput(info, event) {

    let emoji = info.native;
    let value = this.input.value + emoji;

    this.input.value = value;

    this.textareaAutoHeight(this.input);
    this.sendBtnLock();

  }

  preloadEmoji() {

    this.emojiContainer.addEventListener('transitionend', (event) => {

      this.emojiBtn.click();

      setTimeout(() => {
        this.preloader.remove();
      }, 200);

    }, { once: true });

    setTimeout(() => {
      this.emojiBtn.click();
    });
    
  }

  sendBtnLock() {

    if (this.input.value.length > 0) {
      this.submitBtn.removeAttribute('disabled');
    } else {
      this.submitBtn.setAttribute('disabled', '');
    }

  }

  lastSeenChange() {

    let lang = document.documentElement.lang;
    let element = this.chat.querySelector('.chat__subtitle');
    let text = lang === 'en' ? 'Last seen now' : 'Zuletzt gesehen';

    element.textContent = text;
    element.dataset.lang = 'chat-sub2';

  }

  textareaAutoHeight(input) {

    if (!this.initHeight) this.initHeight = input.offsetHeight;
    input.style.height = '4px';

    let inputHeight = input.scrollHeight;

    if (inputHeight < this.initHeight) inputHeight = this.initHeight;

    if (inputHeight >= 80) {
      input.classList.add('overflow');
      input.style.height = '80px';
    } else {
      input.classList.remove('overflow');
      input.style.height = inputHeight + 'px';
    }

  }

  sendMessage(role, text) {

    if (!text) return;

    setTimeout(() => {
      this.lastSeenChange();
    }, 500);
    
    let area = this.chat.querySelector('.chat__area-inner');
    let msg = this.createMessage(role, text);
    
    if (role === 'user') {

      this.input.value = '';
      this.input.style.height = '';
      this.submitBtn.setAttribute('disabled', '');

      if (this.emojiContainer) {
        if (this.emojiContainer.matches('.active')) this.emojiContainerHandler();
      }

      if (this.lastMsgGroup && !this.userCleared) {
        this.lastMsgGroup = null;
        this.userCleared = true;
        this.chatmateCleared = false;
      }

      if (!this.lastMsgGroup) {

        let group = document.createElement('div');
        group.classList.add('chat__msg-group', 'chat__msg-group--user');

        this.lastMsgGroup = document.createElement('div');
        this.lastMsgGroup.classList.add('chat__wrapper');

        group.append(this.lastMsgGroup);

        this.lastMsgGroup.insertAdjacentHTML('beforeend', msg);
        area.append(group);

      } else {

        this.lastMsgGroup.insertAdjacentHTML('beforeend', msg);

      }

    } else if (role === 'chatmate') {

      if (this.lastMsgGroup && !this.chatmateCleared) {
        this.lastMsgGroup = null;
        this.chatmateCleared = true;
        this.userCleared = false;
      }

      if (!this.lastMsgGroup) {

        let group = document.createElement('div');
        group.classList.add('chat__msg-group');

        let avatar = document.createElement('img');
        avatar.src = './images/icons/chat-avatar.png';
        avatar.alt = 'Dmitry';
        avatar.classList.add('chat-msg__avatar');

        this.lastMsgGroup = document.createElement('div');
        this.lastMsgGroup.classList.add('chat__wrapper');

        group.append(avatar);
        group.append(this.lastMsgGroup);

        this.lastMsgGroup.insertAdjacentHTML('beforeend', msg);
        area.append(group);
        
      } else {

        this.lastMsgGroup.insertAdjacentHTML('beforeend', msg);

      }

    }

    this.scrollChat();

  }

  scrollChat() {

    if (this.scrollArea.scrollTop >= this.lastScrollCord) {

      this.scrollArea.scrollBy({
        left: 0,
        top: this.lastMsgGroup.offsetHeight,
        behavior: 'smooth',
      });

      this.lastScrollCord = this.scrollArea.scrollTop;

    }

  }

  createMessage(role, text) {

    let date = this.getTime();
    let msg;
   
    if (role === 'user') {

      msg = `
        <div class="chat-msg chat-msg--user">
          <div class="chat-msg__body">
          
            <span class="chat-msg__message popup-text">${text}</span>

            <div class="chat-msg__info">
              <span class="chat-msg__time mini-text">${date}</span>
              <img src="./images/icons/read-indicator.svg" alt="read" class="chat-msg__read">
            </div>

          </div>
        </div>
      `

    } else if (role === 'chatmate') {

      msg = `
        <div class="chat-msg">
          <div class="chat-msg__body">

            <div class="chat-msg__head">
              <span class="chat-msg__name chat-text">Dmitry</span>
              <span class="chat-msg__role mini-text">Manager</span>
            </div>
          
            <span class="chat-msg__message popup-text">${text}</span>

            <div class="chat-msg__info">
              <span class="chat-msg__time mini-text">${date}</span>
            </div>

          </div>
        </div>
      `

    }

    return msg;

  }

  getTime() {

    let date = new Date();

    let formattedDate = date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });

    return formattedDate;

  }

  startConversation() {

    if (!this.convStarted) {

      this.convTimer = setTimeout(() => {
        
        this.typingIndicator.classList.add('active');

        setTimeout(() => {
          this.typingIndicator.classList.remove('active');
        }, 1700);
        
        this.convTimer = setTimeout(() => {
          let lang = document.documentElement.lang;
          let text = lang === 'en' ? 'Welcome to the SMART-UI platform! I\'ll be happy to answer all your questions!' : 'Willkommen auf der SMART-UI Plattform. Gerne beantworte ich alle Ihre Fragen!';
          this.sendMessage('chatmate', text);
          this.convStarted = true;
        }, 2000);
        
      }, 1000);

    }

  }

  openChat() {

    console.log(this.convTimer);
    clearTimeout(this.convTimer);
    this.chat.classList.toggle('active');
    this.startConversation();

    setTimeout(() => {
      this.input.focus(); 
    }, 100);
    
  }

  closeChat() {
    clearTimeout(this.convTimer);
    this.chat.classList.remove('active');
    this.input.blur();
  }

  ownMethodsBinder() {

    let prototype = Object.getPrototypeOf(this);
    let ownMethods = Object.getOwnPropertyNames(prototype);

    for (let item of ownMethods) {
      if (item !== 'constructor') prototype[item] = prototype[item].bind(this);
    }

  }

}

class Parallax {
    
  constructor(params) {

    this.params = params ?? {};
    this.off = this.params.off ?? 768;
    this.parallaxElements = Array.from(document.querySelectorAll('[data-parallax]'));
    let media = window.matchMedia(`(max-width: ${this.off}px)`).matches;

    if (this.parallaxElements.length > 0 && !media) {

      this.readyElements = [];
      this.targets = new Map();
      this.positions = new Map();

      this.ownMethodsBinder();
      this.writeSettingsInElements();
      this.setIntersectionObserver();
      this.setEventListeners();

      requestAnimationFrame(this.animate);

    }
  }

  writeSettingsInElements() {

    this.parallaxElements.forEach((element) => {

      let values = element.dataset.parallax.split('/');

      element._depth = +values[0] || 0.06;
      element._ease = +values[1] || 0.09;
      element._delay = +values[2] || 0;
      element._type = values[3] === 'invert' ? -1 : 1;
      element._delayOnce = values[4] === 'always' ? false : true;
      element._resetOnExit = values[5] === 'false' ? false : true;
      
      element._isReady = false;
      element._wasActivated = false;
      element._inView = false; 

    });

  }

  setEventListeners() {
     window.addEventListener('mousemove', this.workOperator);
  }

  workOperator(event) {

    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    const mouseX = event.clientX;
    const mouseY = event.clientY;

    this.readyElements.forEach((el) => {

      const depth = el._depth;
      const invert = el._type;

      let targetX = invert * (mouseX - centerX) * depth;
      let targetY = invert * (mouseY - centerY) * depth;

      const container = el.closest('[data-parallax-area]');
      if (container) {

        if (!el._initialOffset) {

          const containerRect = container.getBoundingClientRect();
          const elRect = el.getBoundingClientRect();

          el._initialOffset = {
            left: elRect.left - containerRect.left,
            top: elRect.top - containerRect.top
          };
        }

        const containerRect = container.getBoundingClientRect();
        const elRect = el.getBoundingClientRect();
        const init = el._initialOffset;

        const maxX = containerRect.width - elRect.width - init.left;
        const maxY = containerRect.height - elRect.height - init.top;
        const minX = -init.left;
        const minY = -init.top;

        targetX = Math.max(minX, Math.min(targetX, maxX));
        targetY = Math.max(minY, Math.min(targetY, maxY));

      }

      this.targets.set(el, { x: targetX, y: targetY });

      if (!this.positions.has(el)) {
        this.positions.set(el, { x: 0, y: 0 });
      }

    });
  }

  animate() {

    this.readyElements.forEach((el) => {

      let pos = this.positions.get(el) || { x: 0, y: 0 };
      let target = this.targets.get(el) || { x: 0, y: 0 };

      let ease = el._ease;
      ease = Math.min(Math.max(ease, 0), 1);

      pos.x += (target.x - pos.x) * ease;
      pos.y += (target.y - pos.y) * ease;

      this.positions.set(el, pos);
      el.style.transform = `translate(${pos.x}px, ${pos.y}px)`;

    });

    requestAnimationFrame(this.animate);

  }

  setIntersectionObserver() {

    this.observer = new IntersectionObserver(this.intersectionCallback, {

      root: null,
      rootMargin: this.params.rootMargin ?? '0px',
      threshold: this.params.threshold ?? 0,

    });

    this.parallaxElements.forEach((item) => this.observer.observe(item));

  }

  intersectionCallback(entries) {

    entries.forEach((entry) => {

      const el = entry.target;

      if (entry.isIntersecting) {

        el._inView = true;

        if (!el._isReady) {

          if (el._delay > 0 && (!el._delayOnce || !el._wasActivated)) {

            clearTimeout(el._delayTimer);
            el._delayTimer = setTimeout(() => {
              el._isReady = true;
              el._wasActivated = true;
              el.classList.add('ready');
              this.updateReadyElements();
            }, el._delay);

          } else {

            el._isReady = true;
            el._wasActivated = true;
            el.classList.add('ready');
            this.updateReadyElements();

          }

        } else {
          this.updateReadyElements();
        }


      }  else {

        el._inView = false;

        clearTimeout(el._delayTimer);

        el._isReady = false;
        el.classList.remove('ready');

        if (el._resetOnExit) {
          this.targets.delete(el);
          this.positions.delete(el);
          el.style.transform = el._initialTransform || '';
        }

        this.updateReadyElements();

      }

    });

  }

  updateReadyElements() {
    this.readyElements = this.parallaxElements.filter(el => el._isReady && el._inView);
  }

  ownMethodsBinder() {

    let prototype = Object.getPrototypeOf(this);
    let ownMethods = Object.getOwnPropertyNames(prototype);

    for (let item of ownMethods) {
      if (item !== 'constructor') prototype[item] = prototype[item].bind(this);
    }

  }

}

class BurgerMenu {

  constructor(params) {

    this.params = params ?? {};
    this.params.exceptBtns = this.params.exceptBtns ?? '';
    let media = this.params.activationBreakpoint ?? 768;
    let mediaOk = window.matchMedia(`(max-width: ${media}px)`).matches;

    if (!mediaOk) return;

    this.ownMethodsBinder();
    this.getElements();
    this.createOverlay();
    this.setEventListeners();

  }

  setEventListeners() {

    document.addEventListener('click', (event) => {
        
      let target = event.target;
      let except = this.params.exceptBtns;

      if (target.closest('[data-burger-open]')) {
        this.openBurgerMenu();
      } else if (target.closest('[data-burger-close]')) {
        this.closeBurgerMenu();
      } else if ((target.closest('a') || target.closest(`button:not(${except})`)) && target.closest('[data-burger-content]')) {
        this.closeBurgerMenu();
      } else if (!target.closest('[data-burger-content]') && !target.closest('[data-burger-open]') && this.params.closeByClickOutOfMenu) {
        this.closeBurgerMenu();
      }

    });

  }

  openBurgerMenu() {
    this.openButton.classList.toggle('active');
    this.content.classList.toggle('active');
    this.overlay?.classList.toggle('active');
    
    this.handlePageOverflow();
    this.params.openCallback?.({ 
      button: this.openButton, 
      content: this.content, 
      overlay: this.overlay,
      closeBtn: this.closeButton,
    });
  }

  closeBurgerMenu() {
    this.openButton.classList.remove('active');
    this.content.classList.remove('active');
    this.overlay?.classList.remove('active');

    this.handlePageOverflow();
    this.params.closeCallback?.({ 
      button: this.openButton, 
      content: this.content, 
      overlay: this.overlay,
      closeBtn: this.closeButton,
    });
  }

  handlePageOverflow() {
    let burgerActive = this.content.matches('.active');
    let scrollOffset = window.innerWidth - document.documentElement.clientWidth;

    if (burgerActive) {
      document.body.style.overflow = "hidden";
      document.body.style.paddingRight = scrollOffset + 'px';
    } else {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    }
  } 

  createOverlay() {
    if (this.params.needOverlay) {
      this.overlay = document.createElement('div');
      this.overlay.classList.add('burger-overlay');
      document.body.append(this.overlay);
    }
  }

  getElements() {
    this.openButton = document.querySelector('[data-burger-open]');
    this.closeButton = document.querySelector('[data-burger-close]');
    this.content = document.querySelector('[data-burger-content]');
  }

  ownMethodsBinder() {
    let prototype = Object.getPrototypeOf(this);
    let ownMethods = Object.getOwnPropertyNames(prototype)
    for (let item of ownMethods) {
      if (item !== 'constructor') prototype[item] = prototype[item].bind(this);
    }
  }

}

class ScrollToTop {

  constructor(params) {
    this.params = params ?? {};
    this.clientWidth = document.documentElement.clientWidth;
    this.button = document.querySelector('[data-scroll-top]');

    if (this.button) {
      this.ownMethodsBinder();
      this.setEventListeners(); 
      this.scrollHandler(); 
    }
  }

  setEventListeners() {
    window.addEventListener('scroll', this.scrollHandler);
    window.addEventListener('resize', this.updateClientWidth);
    this.button.addEventListener('click', this.moveToTop);
  }

  moveToTop() {
    window.scrollTo({top: 0, behavior: 'smooth'});
    this.button.blur();
    this.button.classList.add('off');
  }

  updateClientWidth() {
    this.clientWidth = document.documentElement.clientWidth;
  }

  getActivationCoordinate() {
    let activationCoordinate;
    for (let key in this.params) {
      let [min, max] = key.split('-');
      min = +min;
      max = +max;
      if (this.clientWidth >= min && this.clientWidth <= max) { 
        activationCoordinate = this.params[key];
        break;
      } else {
        activationCoordinate = this.params.default;
      }
    }
    return activationCoordinate ?? 900;
  }

  controlButton(state) {
    if (state) {
      this.button.classList.add('active');
    } else {
      this.button.classList.remove('active');
      this.button.classList.remove('off');
    }
  }

  scrollHandler() {
    let coordinate = this.getActivationCoordinate();
    let scrollY = window.pageYOffset;
    
    if (scrollY >= coordinate) {
      this.controlButton(true)
    } else {
      this.controlButton(false)
    }
  }

  ownMethodsBinder() {
    let prototype = Object.getPrototypeOf(this);
    let ownMethods = Object.getOwnPropertyNames(prototype)
    for (let item of ownMethods) {
      if (item !== 'constructor') prototype[item] = prototype[item].bind(this);
    }
  }

}











export { 
  UpdatePageTitle,
  ChangeLanguage,
  Popup,
  FormValidator,
  Chat,
  Parallax,
  BurgerMenu,
  ScrollToTop,
}