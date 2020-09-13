'use strict';

const ХРАНИТЬ_СОСТОЯНИЕ_КАНАЛА = 2e4;

let г_оРазобранныйАдрес = null;

let г_сСпособЗаданияАдреса = '';

let г_чПоследняяПроверка = 0;

let г_оЗапрос = null;

let г_сКодКанала = '';

let г_лИдетТрансляция = false;

const м_Отладка = {
	ЗавершитьРаботуИПоказатьСообщение: завершитьРаботу,
	ПойманоИсключение: завершитьРаботу
};

function завершитьРаботу(пИсключениеИлиКодСообщения) {
	if (!г_лРаботаЗавершена) {
		console.error(пИсключениеИлиКодСообщения);
		try {
			г_лРаботаЗавершена = true;
			м_Журнал.Окак('[Twitch 5] Работа завершена');
		} catch (_) {}
	}
	throw void 0;
}

function задатьАдресСтраницы(сАдрес, лЗаменить = false) {
	location[лЗаменить ? 'replace' : 'assign'](сАдрес);
}

function вставитьНаСтраницу(фВставить) {
	const узСкрипт = document.createElement('script');
	узСкрипт.textContent = `\n\t\t'use strict';\n\t\t(${фВставить})();\n\t`;
	(document.head || document.documentElement).appendChild(узСкрипт);
	узСкрипт.remove();
}

function этотАдресМожноПеренаправлять(оАдрес) {
	return !оАдрес.search.includes(АДРЕС_НЕ_ПЕРЕНАПРАВЛЯТЬ);
}

function получитьНеперенаправляемыйАдрес(оАдрес) {
	return `${оАдрес.protocol}//${оАдрес.host}${оАдрес.pathname}${оАдрес.search.length > 1 ? `${оАдрес.search}&${АДРЕС_НЕ_ПЕРЕНАПРАВЛЯТЬ}` : `?${АДРЕС_НЕ_ПЕРЕНАПРАВЛЯТЬ}`}${оАдрес.hash}`;
}

function запретитьАвтоперенаправлениеЭтойСтраницы() {
	if (этотАдресМожноПеренаправлять(location)) {
		history.replaceState(history.state, '', получитьНеперенаправляемыйАдрес(location));
	}
}

разобратьАдрес.ЭТО_НЕ_КОД_КАНАЛА = new Set([ 'directory', 'embed', 'friends', 'inventory', 'login', 'logout', 'manager', 'messages', 'payments', 'search', 'settings', 'signup', 'subscriptions', 'team' ]);

function разобратьАдрес(оАдрес) {
	let лМобильнаяВерсия = false;
	let сСтраница = 'НЕИЗВЕСТНАЯ';
	let сКодКанала = '';
	let лМожноПеренаправлять = false;
	if (оАдрес.protocol === 'https:' && (оАдрес.host === 'www.twitch.tv' || оАдрес.host === 'm.twitch.tv')) {
		лМобильнаяВерсия = оАдрес.host === 'm.twitch.tv';
		const мсЧасти = оАдрес.pathname.split('/');
		if (мсЧасти.length <= 3 && мсЧасти[1] && !мсЧасти[2]) {
			if (!разобратьАдрес.ЭТО_НЕ_КОД_КАНАЛА.has(мсЧасти[1])) {
				сСтраница = 'ВОЗМОЖНО_ПРЯМАЯ_ТРАНСЛЯЦИЯ';
				сКодКанала = decodeURIComponent(мсЧасти[1]);
				лМожноПеренаправлять = этотАдресМожноПеренаправлять(оАдрес);
			}
		} else if ((мсЧасти[1] === 'embed' || мсЧасти[1] === 'popout') && мсЧасти[2] && мсЧасти[3] === 'chat') {
			сСтраница = 'ЧАТ_КАНАЛА';
			сКодКанала = decodeURIComponent(мсЧасти[2]);
		}
	}
	м_Журнал.Окак(`[Twitch 5] Адрес разобран: Страница=${сСтраница} КодКанала=${сКодКанала} МожноПеренаправлять=${лМожноПеренаправлять}`);
	return {
		лМобильнаяВерсия,
		сСтраница,
		сКодКанала,
		лМожноПеренаправлять
	};
}

function запроситьСостояниеКанала(оРазобранныйАдрес) {
	if (!оРазобранныйАдрес.лМожноПеренаправлять || !м_Настройки.Получить('лАвтоперенаправлениеРазрешено')) {
		return;
	}
	if (!г_оЗапрос && г_сКодКанала === оРазобранныйАдрес.сКодКанала && performance.now() - г_чПоследняяПроверка < ХРАНИТЬ_СОСТОЯНИЕ_КАНАЛА) {
		return;
	}
	if (г_оЗапрос && г_сКодКанала === оРазобранныйАдрес.сКодКанала) {
		return;
	}
	отменитьЗапрос();
	г_сКодКанала = оРазобранныйАдрес.сКодКанала;
	г_чПоследняяПроверка = -1;
	отправитьЗапрос();
}

function измененАдресСтраницы(сСпособ) {
	г_оРазобранныйАдрес = разобратьАдрес(location);
	г_сСпособЗаданияАдреса = сСпособ;
	if (!г_оРазобранныйАдрес.лМожноПеренаправлять || !м_Настройки.Получить('лАвтоперенаправлениеРазрешено')) {
		if (г_чПоследняяПроверка === -2) {
			г_чПоследняяПроверка = -1;
		}
		return;
	}
	if (!г_оЗапрос && г_сКодКанала === г_оРазобранныйАдрес.сКодКанала && performance.now() - г_чПоследняяПроверка < ХРАНИТЬ_СОСТОЯНИЕ_КАНАЛА) {
		if (г_лИдетТрансляция) {
			перенаправитьНаНашПроигрыватель(г_сКодКанала);
		}
		return;
	}
	if (г_оЗапрос && г_сКодКанала === г_оРазобранныйАдрес.сКодКанала) {
		г_чПоследняяПроверка = -2;
		return;
	}
	отменитьЗапрос();
	г_сКодКанала = г_оРазобранныйАдрес.сКодКанала;
	г_чПоследняяПроверка = -2;
	отправитьЗапрос();
}

function отменитьЗапрос() {
	if (г_оЗапрос) {
		м_Журнал.Окак('[Twitch 5] Отменяю незавершенный запрос');
		г_оЗапрос.abort();
	}
}

function отправитьЗапрос() {
	м_Журнал.Окак(`[Twitch 5] Посылаю запрос для канала ${г_сКодКанала}`);
	г_оЗапрос = new XMLHttpRequest();
	г_оЗапрос.addEventListener('loadend', обработатьОтвет);
	г_оЗапрос.open('POST', 'https://gql.twitch.tv/gql');
	г_оЗапрос.responseType = 'json';
	г_оЗапрос.timeout = 15e3;
	г_оЗапрос.setRequestHeader('Client-ID', 'kimne78kx3ncx6brgo4mv6wki5h1ko');
	г_оЗапрос.setRequestHeader('Content-Type', 'application/json');
	г_оЗапрос.send(создатьТелоЗапросаGql(`query($login: String!) {\n\t\t\tuser(login: $login) {\n\t\t\t\tstream {\n\t\t\t\t\tisEncrypted\n\t\t\t\t}\n\t\t\t}\n\t\t}`, {
		login: г_сКодКанала
	}));
}

function обработатьОтвет({target: оЗапрос}) {
	г_оЗапрос = null;
	if (оЗапрос.status === 200 && ЭтоОбъект(оЗапрос.response)) {
		const лПеренаправить = г_чПоследняяПроверка === -2;
		г_чПоследняяПроверка = performance.now();
		г_лИдетТрансляция = false;
		try {
			г_лИдетТрансляция = оЗапрос.response.data.user.stream.isEncrypted === false;
		} catch (_) {}
		if (лПеренаправить && г_лИдетТрансляция) {
			перенаправитьНаНашПроигрыватель(г_сКодКанала);
		}
	} else {
		г_чПоследняяПроверка = 0;
	}
}

function запуститьНашПроигрыватель(сКодКанала) {
	const сАдресПроигрывателя = ПолучитьАдресНашегоПроигрывателя(сКодКанала);
	м_Журнал.Окак(`[Twitch 5] Перехожу на страницу ${сАдресПроигрывателя}`);
	запретитьАвтоперенаправлениеЭтойСтраницы();
	задатьАдресСтраницы(сАдресПроигрывателя);
}

function перенаправитьНаНашПроигрыватель(сКодКанала) {
	const сАдресПроигрывателя = ПолучитьАдресНашегоПроигрывателя(сКодКанала);
	м_Журнал.Окак(`[Twitch 5] Меняю адрес страницы с ${location.href} на ${сАдресПроигрывателя}`);
	document.documentElement.setAttribute('data-tw5-перенаправление', сАдресПроигрывателя);
	задатьАдресСтраницы(сАдресПроигрывателя, true);
}

function обработатьPointerDownИClick(оСобытие) {
	if (г_оРазобранныйАдрес) {
		const узСсылка = оСобытие.target.closest('a[href]');
		if (узСсылка && оСобытие.isPrimary !== false && оСобытие.button === ЛЕВАЯ_КНОПКА && !оСобытие.shiftKey && !оСобытие.ctrlKey && !оСобытие.altKey && !оСобытие.metaKey) {
			м_Журнал.Окак(`[Twitch 5] Произошло событие ${оСобытие.type} у ссылки ${узСсылка.href}`);
			запроситьСостояниеКанала(разобратьАдрес(узСсылка));
		}
	}
}

function обработатьPopState(оСобытие) {
	if (г_оРазобранныйАдрес) {
		м_Журнал.Окак(`[Twitch 5] Произошло событие popstate ${location.href}`);
		if (ВЕРСИЯ_ДВИЖКА_БРАУЗЕРА < 67) {
			document.title = 'Twitch';
		}
		измененАдресСтраницы('POPSTATE');
		if (document.documentElement.hasAttribute('data-tw5-перенаправление')) {
			м_Журнал.Окак('[Twitch 5] Скрываю событие popstate');
			оСобытие.stopImmediatePropagation();
			оСобытие.stopPropagation();
		}
	}
}

function обработатьPushState(оСобытие) {
	м_Журнал.Окак(`[Twitch 5] Произошло событие tw5-pushstate ${location.href}`);
	измененАдресСтраницы('PUSHSTATE');
}

function обработатьЗапускНашегоПроигрывателя(оСобытие) {
	оСобытие.preventDefault();
	if (оСобытие.button === ЛЕВАЯ_КНОПКА && г_оРазобранныйАдрес.сСтраница === 'ВОЗМОЖНО_ПРЯМАЯ_ТРАНСЛЯЦИЯ') {
		запуститьНашПроигрыватель(г_оРазобранныйАдрес.сКодКанала);
	} else {
		м_Журнал.Окак(`[Twitch 5] Не запускать проигрыватель Кнопка=${оСобытие.button} Страница=${г_оРазобранныйАдрес.сСтраница}`);
	}
}

function обработатьПереключениеАвтоперенаправления(оСобытие) {
	оСобытие.preventDefault();
	const л = !м_Настройки.Получить('лАвтоперенаправлениеРазрешено');
	м_Журнал.Окак(`[Twitch 5] Автоперенаправление разрешено: ${л}`);
	м_Настройки.Изменить('лАвтоперенаправлениеРазрешено', л);
	обновитьНашуКнопку();
}

function обработатьЗакрытиеСправки(оСобытие) {
	оСобытие.preventDefault();
	м_Журнал.Окак('[Twitch 5] Закрываю справку');
	оСобытие.currentTarget.classList.remove('tw5-справка');
	оСобытие.currentTarget.removeEventListener('mouseover', обработатьЗакрытиеСправки);
	оСобытие.currentTarget.removeEventListener('touchstart', обработатьЗакрытиеСправки);
	м_Настройки.Изменить('лАвтоперенаправлениеЗамечено', true);
}

function получитьНашуКнопку() {
	return document.getElementById('tw5-автоперенаправление');
}

function обновитьНашуКнопку() {
	получитьНашуКнопку().classList.toggle('tw5-запрещено', !м_Настройки.Получить('лАвтоперенаправлениеРазрешено'));
}

function вставитьНашуКнопку() {
	if (г_оРазобранныйАдрес.лМобильнаяВерсия) {
		const сузКудаВставлять = document.getElementsByClassName('mw-top-nav__menu');
		if (сузКудаВставлять.length === 0) {
			return false;
		}
		м_Журнал.Окак('[Twitch 5] Вставляю нашу кнопку для мобильного сайта');
		сузКудаВставлять[0].insertAdjacentHTML('beforebegin', `
		<div class="tw5-автоперенаправление tw5-js-удалить">
			<button id="tw5-автоперенаправление" class="tw-interactive tw-border-top-left-radius-large tw-border-top-right-radius-large tw-border-bottom-left-radius-large tw-border-bottom-right-radius-large tw-button-icon tw-button-icon--large tw-core-button tw-core-button--large tw-overflow-hidden tw-align-middle tw-align-items-center tw-inline-flex tw-justify-content-center tw-relative">
				<span class="tw-button-icon__icon">
					<div class="tw-icon tw-align-items-center tw-inline-flex">
						<svg viewBox="0 0 128 128" width="100%" height="100%">
							<path d="M64 53h-19.688l-1.313-15.225h57l1.313-14.7h-74.55l3.937 44.888h51.712l-1.8 19.162-16.6 4.463l-16.8-4.463-1.1-11.813h-14.7l1.838 23.362 30.713 8.4l30.45-8.4 4.2-45.675z"/>
						</svg>
					</div>
				</span>
			</button>
			<style>
				.tw5-автоперенаправление .tw-icon
				{
					width:  2.6rem;
					height: 2.6rem;
					fill: currentColor;
				}
				.tw5-запрещено svg
				{
					opacity: .4 !important;
				}
			</style>
		</div>
		`);
	} else {
		const узКудаВставлять = document.querySelector('.top-nav__menu > .tw-justify-content-end > .tw-sm-hide');
		if (!узКудаВставлять) {
			return false;
		}
		м_Журнал.Окак('[Twitch 5] Вставляю нашу кнопку');
		узКудаВставлять.insertAdjacentHTML('afterend', `
		<div class="tw5-автоперенаправление tw5-js-удалить tw-align-self-center tw-flex-grow-0 tw-flex-nowrap tw-flex-shrink-0 tw-mg-x-05">
			<div class="tw-inline-flex tw-relative tw-tooltip-wrapper">
				<button id="tw5-автоперенаправление" class="tw-align-items-center tw-align-middle tw-border-bottom-left-radius-medium tw-border-bottom-right-radius-medium tw-border-top-left-radius-medium tw-border-top-right-radius-medium tw-button-icon tw-core-button tw-inline-flex tw-interactive tw-justify-content-center tw-overflow-hidden tw-relative">
					<span class="tw-button-icon__icon">
						<div class="tw-icon">
							<svg viewBox="0 0 128 128">
								<path d="M64 53h-19.688l-1.313-15.225h57l1.313-14.7h-74.55l3.937 44.888h51.712l-1.8 19.162-16.6 4.463l-16.8-4.463-1.1-11.813h-14.7l1.838 23.362 30.713 8.4l30.45-8.4 4.2-45.675z"/>
							</svg>
						</div>
					</span>
				</button>
				<div class="tw5-многостроч tw-tooltip tw-tooltip--align-center tw-tooltip--down">
					${м_i18n.GetMessage('F0600')}
				</div>
			</div>
			<style>
				.tw5-автоперенаправление .tw-icon
				{
					width:  2.4rem;
					height: 2.2rem;
					fill: currentColor;
				}
				.tw5-запрещено svg
				{
					opacity: .4 !important;
				}
				.tw5-многостроч
				{
					line-height: 1.4 !important;
				}
				.tw5-справка > .tw-tooltip
				{
					display: block !important;
					color: white !important;
					background: #f00000 !important;
					pointer-events: auto !important;
					cursor: pointer !important;
				}
				.tw5-справка > .tw-tooltip::after
				{
					background: #f00000 !important;
				}
			</style>
		</div>
		`);
	}
	const узКнопка = получитьНашуКнопку();
	узКнопка.addEventListener('click', обработатьЗапускНашегоПроигрывателя);
	узКнопка.addEventListener('contextmenu', обработатьПереключениеАвтоперенаправления);
	if (!г_оРазобранныйАдрес.лМобильнаяВерсия && !м_Настройки.Получить('лАвтоперенаправлениеЗамечено')) {
		узКнопка.parentNode.classList.add('tw5-справка');
		узКнопка.parentNode.addEventListener('mouseover', обработатьЗакрытиеСправки);
		узКнопка.parentNode.addEventListener('touchstart', обработатьЗакрытиеСправки, {
			passive: false
		});
	}
	обновитьНашуКнопку();
	return true;
}

function вставитьНашуКнопкуЕслиНужно() {
	return Boolean(получитьНашуКнопку()) || вставитьНашуКнопку();
}

function вставитьНашуКнопкуВПервыйРаз() {
	if (вставитьНашуКнопку()) {
		return;
	}
	if (!г_оРазобранныйАдрес.лМобильнаяВерсия) {
		return;
	}
	new MutationObserver((моЗаписи, оНаблюдатель) => {
		if (вставитьНашуКнопкуЕслиНужно()) {
			м_Журнал.Окак('[Twitch 5] Завершаю наблюдение за разметкой страницы');
			оНаблюдатель.disconnect();
		}
	}).observe(document.body || document.documentElement, {
		childList: true,
		subtree: true
	});
}

function перехватитьФункции() {
	let _лНеПерехватывать = false;
	window.addEventListener('tw5-неперехватывать', () => {
		_лНеПерехватывать = true;
	});
	const oTitleDescriptor = Object.getOwnPropertyDescriptor(Document.prototype, 'title');
	Object.defineProperty(document, 'title', {
		configurable: oTitleDescriptor.configurable,
		enumerable: oTitleDescriptor.enumerable,
		get() {
			return oTitleDescriptor.get.call(this);
		},
		set(title) {
			if (_лНеПерехватывать) {
				oTitleDescriptor.set.call(this, title);
			} else if (this.documentElement.hasAttribute('data-tw5-перенаправление')) {} else {
				oTitleDescriptor.set.call(this, title);
				window.dispatchEvent(new CustomEvent('tw5-изменензаголовок'));
			}
		}
	});
	const fPushState = history.pushState;
	history.pushState = function(state, title) {
		if (_лНеПерехватывать) {
			fPushState.apply(this, arguments);
		} else if (document.documentElement.hasAttribute('data-tw5-перенаправление')) {} else {
			const сБыло = location.pathname;
			fPushState.apply(this, arguments);
			if (сБыло !== location.pathname) {
				oTitleDescriptor.set.call(document, 'Twitch');
				window.dispatchEvent(new CustomEvent('tw5-pushstate'));
			}
		}
	};
}

function ждатьЗагрузкуДомика() {
	return new Promise((фВыполнить, фОтказаться) => {
		м_Журнал.Окак(`[Twitch 5] document.readyState=${document.readyState}`);
		if (document.readyState !== 'loading') {
			фВыполнить();
		} else {
			document.addEventListener('DOMContentLoaded', function ОбработатьЗагрузкуДомика() {
				try {
					м_Журнал.Окак(`[Twitch 5] document.readyState=${document.readyState}`);
					document.removeEventListener('DOMContentLoaded', ОбработатьЗагрузкуДомика);
					фВыполнить();
				} catch (пИсключение) {
					фОтказаться(пИсключение);
				}
			});
		}
	});
}

function вставитьСторонниеРасширения() {
	chrome.runtime.sendMessage({
		сЗапрос: 'ВставитьСторонниеРасширения'
	}, оСообщение => {
		if (chrome.runtime.lastError) {
			м_Журнал.Окак(`[Twitch 5] Не удалось послать запрос на вставку сторонних расширений: ${chrome.runtime.lastError.message}`);
			return;
		}
		if (оСообщение.сСторонниеРасширения === '') {
			return;
		}
		//! оСообщение.сСторонниеРасширения contains a limited set of known browser extensions that are currently
		//! installed and enabled in the browser. See обработатьСообщениеЧата() in player.js. Load those
		//! extensions into <iframe>. Chrome itself cannot load installed extensions into another extension.
		//! See https://bugs.chromium.org/p/chromium/issues/detail?id=599167
				ждатьЗагрузкуДомика().then(() => {
			м_Журнал.Окак(`[Twitch 5] Вставляю сторонние расширения: ${оСообщение.сСторонниеРасширения}`);
			//! BetterTTV browser extension
			//! https://betterttv.com/
			//! https://chrome.google.com/webstore/detail/ajopnjidmegmdimjlfnijceegpefgped
						if (оСообщение.сСторонниеРасширения.includes('BTTV ')) {
				const узСкрипт = document.createElement('script');
				узСкрипт.src = 'https://cdn.betterttv.net/betterttv.js';
				document.head.appendChild(узСкрипт);
			}
			//! FrankerFaceZ browser extension
			//! https://www.frankerfacez.com/
			//! https://chrome.google.com/webstore/detail/fadndhdgpmmaapbmfcknlfgcflmmmieb
						if (оСообщение.сСторонниеРасширения.includes('FFZ ')) {
				const узСкрипт = document.createElement('script');
				узСкрипт.src = 'https://cdn.frankerfacez.com/script/script.min.js';
				document.head.appendChild(узСкрипт);
			}
			//! FFZ Add-On Pack browser extension
			//! https://ffzap.com/
			//! https://chrome.google.com/webstore/detail/aiimboljphncldaakcnapfolgnjonlea
						if (оСообщение.сСторонниеРасширения.includes('FFZAP ')) {
				const узСкрипт = document.createElement('script');
				узСкрипт.src = 'https://cdn.ffzap.com/ffz-ap.min.js';
				document.head.appendChild(узСкрипт);
			}
		});
	});
}

function разрешитьРаботуЧата() {
	const fGetItem = Storage.prototype.getItem;
	Storage.prototype.getItem = function(сИмя) {
		let сЗначение = fGetItem.apply(this, arguments);
		if (сИмя === 'TwitchCache:Layout' && сЗначение) {
			сЗначение = сЗначение.replace('"isRightColumnClosedByUserAction":true', '"isRightColumnClosedByUserAction":false');
		}
		return сЗначение;
	};
}

function изменитьСтильЧата() {
	const узСтиль = document.createElement('link');
	узСтиль.rel = 'stylesheet';
	узСтиль.href = chrome.extension.getURL('content.css');
	узСтиль.className = 'tw5-js-удалить';
	(document.head || document.documentElement).appendChild(узСтиль);
}

function изменитьПоведениеЧата() {
	window.addEventListener('click', оСобытие => {
		if (оСобытие.button !== ЛЕВАЯ_КНОПКА) {
			return;
		}
		const узСсылка = оСобытие.target.closest('a[href^="http:"],a[href^="https:"],a[href]:not([href=""]):not([href^="#"]):not([href*=":"]):not([href$="/not-a-location"])');
		if (!узСсылка) {
			return;
		}
		м_Журнал.Окак(`[Twitch 5] Открываю ссылку в новой вкладке: ${узСсылка.getAttribute('href')}`);
		узСсылка.target = '_blank';
		оСобытие.stopImmediatePropagation();
		оСобытие.stopPropagation();
	}, true);
}

function удалитьХвостыСтаройВерсии() {}

ДобавитьОбработчикИсключений(() => {
	м_Журнал.Окак(`[Twitch 5] content.js запущен по адресу ${location.href} ${performance.now().toFixed()}мс`);
	if (разобратьАдрес(location).сСтраница === 'ЧАТ_КАНАЛА') {
		вставитьНаСтраницу(разрешитьРаботуЧата);
		if (window.top !== window) {
			вставитьСторонниеРасширения();
			изменитьСтильЧата();
			изменитьПоведениеЧата();
		}
		return;
	}
	удалитьХвостыСтаройВерсии();
	const сСобытие = window.PointerEvent ? 'pointerdown' : 'mousedown';
	window.addEventListener(сСобытие, обработатьPointerDownИClick, true);
	window.addEventListener('click', обработатьPointerDownИClick, true);
	window.addEventListener('popstate', обработатьPopState);
	м_Настройки.Восстановить().then(() => {
		измененАдресСтраницы('LOAD');
		window.addEventListener('tw5-pushstate', обработатьPushState);
		window.addEventListener('tw5-изменензаголовок', вставитьНашуКнопкуЕслиНужно);
		вставитьНаСтраницу(перехватитьФункции);
		вставитьНашуКнопкуВПервыйРаз();
	}).catch(м_Отладка.ПойманоИсключение);
})();