if (sessionStorage.getItem('azulPrecareForm')) {
	document.getElementById('precare-form').style.display = 'none';
	document.getElementById('precare-close').style.display = 'block';
}

const precare = document.getElementById('precare');
const config = { attributes: true, childList: true, subtree: true };

const callback = function() {
	const lpChat = document.getElementById('lpChat');

	if (lpChat) {
		document.getElementById('lp-button-style').disabled = false;
	} else if (sessionStorage.getItem('azulPrecareForm')) {
		document.getElementById('lp-button-style').disabled = true;
	}
};

const observer = new MutationObserver(callback);
observer.observe(precare, config);

function cpfMask (value) {
	console.log("ASFASF", value)
	var cpf = value
		.replace(/\D/g, '')
		.replace(/(\d{3})(\d)/, '$1.$2')
		.replace(/(\d{3})(\d)/, '$1.$2')
		.replace(/(\d{3})(\d{1,2})/, '$1-$2')
		.replace(/(-\d{2})\d+?$/, '$1')

	console.log("ASFASF", cpf)
	return cpf
};

function phoneMask (value) {
	return value.replace(/\D/g,"")
		.substring(0, 11)
		.replace(/^(\d{2})(\d)/g,"($1) $2")
		.replace(/(\d)(\d{4})$/,"$1-$2");
};

function isValidCPF(cpf) {
	if (typeof cpf !== "string") return false
	cpf = cpf.replace(/[\s.-]*/igm, '')
	if (cpf.length !== 11 || !Array.from(cpf).filter(e => e !== cpf[0]).length) {
		return false
	}
	var soma = 0
	var resto
	for (var i = 1; i <= 9; i++)
		soma = soma + parseInt(cpf.substring(i-1, i)) * (11 - i)
	resto = (soma * 10) % 11
	if ((resto == 10) || (resto == 11))  resto = 0
	if (resto != parseInt(cpf.substring(9, 10)) ) return false
	soma = 0
	for (var i = 1; i <= 10; i++)
		soma = soma + parseInt(cpf.substring(i-1, i)) * (12 - i)
	resto = (soma * 10) % 11
	if ((resto == 10) || (resto == 11))  resto = 0
	if (resto != parseInt(cpf.substring(10, 11) ) ) return false
	return true
}

function isValidPhone(value) {
	return value.length > 12;
}

function validate(element) {
	if (element.required && !element.value) {
		element.parentElement.classList.add('error');
		return;
	}

	if (element.name === "cpf" && !isValidCPF(element.value)) {
		element.parentElement.classList.add('error');
		element.previousElementSibling.innerHTML = 'CPF inválido';
		return;
	} else if (element.name === "cpf") {
		element.previousElementSibling.innerHTML = 'CPF *';
	}

	if (element.name === "phone" && !isValidPhone(element.value)) {
		element.parentElement.classList.add('error');
		element.previousElementSibling.innerHTML = 'Telefone inválido';
		return;
	} else if (element.name === "phone") {
		element.previousElementSibling.innerHTML = 'Telefone *';
	}

	if (element.name === "email" && !element.validity.valid) {
		element.parentElement.classList.add('error');
		element.previousElementSibling.innerHTML = 'Email inválido';
		return;
	} else if (element.name === "email") {
		element.previousElementSibling.innerHTML = 'Email *';
	}

	element.parentElement.classList.remove('error');
}

function clickLPButton () {
	const lpContainer = document.querySelector('div[id^="LPMcontainer"]');

	if (lpContainer) lpContainer.click();
}


document.getElementById('inputCpf').addEventListener('keydown', (event) => {
	const hasCode = typeof(event.code) !== 'undefined';
	const isKey = hasCode && event.code.includes('Key');
	const isNumpad = hasCode && event.code.includes('Numpad');
	const isDigit = hasCode && event.code.includes('Digit');

	if (!event.ctrlKey && (isKey || isDigit || isNumpad)) event.preventDefault();
	event.target.value = cpfMask(`${event.target.value}${event.key}`);
});

document.getElementById('inputPhone').addEventListener('keydown', (event) => {
	const hasCode = typeof(event.code) !== 'undefined';
	const isKey = hasCode && event.code.includes('Key');
	const isDigit = hasCode && event.code.includes('Digit');

	if (isKey || isDigit) event.preventDefault();
	event.target.value = phoneMask(`${event.target.value}${event.key}`);
});

document.getElementById('precare-form').addEventListener('submit', (event) => {
	event.preventDefault();
	const data = {};
	let hasError = false;

	for (var i = 0; i < event.target.elements.length; i++) {
		const element = event.target.elements[i];

		if (element instanceof HTMLInputElement) {
			data[element.name] = element.value

			if (element.parentElement.classList.contains('error')) {
				hasError = true
			}
		}
	}

	if (hasError) return;

	sessionStorage.setItem('azulPrecareForm', JSON.stringify(data));
	event.target.style.display = 'none';
	document.getElementById('precare-close').style.display = 'block';

	lpTag.sdes.push([
		{
			"type": "personal",
			"personal": {
				"firstname": data.name,
				"lastname": data.lastname,
				"contacts": [
					{
						"email": data.email,
						"phone": data.phone,
					}
				]
			}
		},
		{
			"type": "ctmrinfo",
			"info": {
				"customerId": data.cpf,
				"socialId": data.azul
			}
		}
	]);

	clickLPButton();
});

try {
  setTimeout(function () {
    lpTag.hooks.push({
      name: "AFTER_GET_LINES",
      callback: function (data) {
        if (data.data.lines.length && data.data.lines[0].text) {
          setTimeout(handleElements, 500);
        }
        return data;
      }
    });
  }, 100);
} catch (e) {
  console.dir(e.message);
}


//POP-UP
//document.getElementById('open-popup').addEventListener('click', (e) => {
//  window.open('index-popup.html', 'Atendimento Azul', "width=400, height=650, top=100, left=110, scrollbars=no ")
//});

function handleElements() {
  handleMarkdowns();
  handleButtons();
  handleImages();
  handleBlankText();
}


function handleMarkdowns() {
    var arrayConversa = document.querySelectorAll('div.lpc_message__text_agent');
    for (var i = 0; i < arrayConversa.length; i++) {
        var str = arrayConversa[i].innerHTML;
        str =  marked(str);
        var possuirButton = str.indexOf('<button');
        var possuirInput = str.indexOf('<input');
        if((possuirButton < 0) && (possuirInput < 0)){
            arrayConversa[i].innerHTML = str;
        }
    }
}



function handleBlankText() {
  var arrayConversa = document.querySelectorAll('.lpc_card__text');
  for (var i = 0; i < arrayConversa.length; i++) {
    //esconde div vazia
    var textoElement = arrayConversa[i].textContent;
    if (textoElement.length == 0) {
      var element = arrayConversa[i];
      element.parentNode.removeChild(element);
    }
  }
}

function handleImages() {
  const div_lines = document.querySelectorAll('div.lp_chat_line_wrapper');
  div_lines.forEach((dline, i) => {
    let div_image = dline.querySelectorAll('div.lpc_card__image');
    if (div_image.length > 0) {
        let rich_line = dline.querySelectorAll('div.lp_rich_content_line');
        if (rich_line.length > 0) {
            rich_line[0].style.setProperty("width", "100%", "important");
        }
    }
  });
}

function handleButtons() {
  const div_lines = document.querySelectorAll('div.lp_chat_line_wrapper');
  let last_button_line = null;
  div_lines.forEach((dline, i) => {
    let div_buttons = dline.querySelectorAll('div.lpc_card__button');
    if (div_buttons.length > 0) {
      div_buttons[0].parentNode.style.pointerEvents = 'none';
      div_buttons[0].parentNode.style.opacity = 0.5;
      last_button_line = dline;


    }
  });
  if (last_button_line != null) {
    if (div_lines[div_lines.length - 1].id == last_button_line.id) {
      let div_buttons = last_button_line.querySelectorAll('div.lpc_card__button');
      if (div_buttons.length > 0) {
        div_buttons[0].parentNode.style.pointerEvents = 'all';
        div_buttons[0].parentNode.style.opacity = 1;
        //div_buttons[0].parentNode.style.visibility = "hidden";

      }
    }
  }
}


document.getElementById('precare-close').addEventListener('click', () => {
	window.close();
});
