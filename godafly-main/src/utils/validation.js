export default class Validation {
  static isEmpty(data) {
    if (
      data == null ||
      data == 0 ||
      data == {} ||
      data == undefined ||
      data == '' ||
      typeof data == 'undefined'
    ) {
      return true;
    } else {
      return false;
    }
  }

  static isEmptyValue(data, type) {
    if (
      data == '' ||
      data == undefined ||
      data == {} ||
      data == null ||
      data == 'NULL' ||
      data == 'null' ||
      data == 'nil' ||
      data.length == 0 ||
      data == '(null)'
    ) {
      switch (type) {
        case 'arr':
          return [];
          break;
        case 'num':
          return 0;
          break;
        case 'obj':
          return {};
          break;
        default:
          return '';
          break;
      }
    } else {
      return data;
    }
  }

  static validEmail(emailAddress) {
    let reg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    return reg.test(emailAddress);
  }

  static validPassword(pass) {
    return pass.length < 6;
  }

  static GenerateRandomNumber = () => {
    var RandomNumber = Math.floor(Math.random() * 100) + 1;
    return RandomNumber;
  };

  static removeSpace = value => {
    if (value.includes('\n')) {
      var test = value.replace(/(\r\n|\n|\r)/gm, '');
      var count = test.trim();
      return count;
    } else {
      return value;
    }
  };

  // Strong password validation here ?= means match expression
  static strongPasswordValidate(pass) {
    var strPattern =
      /^(?=.{8,})(?=.*[a-z])(?=.*[0-9])(?=.*[A-Z])(?=.*[@#$%^&+*!=]).*$/;
    return strPattern.test(pass);
  }

  static isPasswordValidate(val) {
    var strPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.{8,})/;
    return strPattern.test(val);
  }

  static validPostalCode(postalCode) {
    let postalCodeRegex = /^.(?:[A-Z0-9]+([- ]?[A-Z0-9]+- )*)?$/;
    return postalCodeRegex.test(postalCode);
  }

  // if valid then return true other wise return false
  static validTitle(inputValue) {
    let value = /^[ A-Za-z0-9_./#&-?/'']*$/;
    return value.test(inputValue);
  }

  // if valid then return true other wise return false
  static validXSS(inputValue) {
    let value = /<\/?[a-z][\s\S]*>/i;
    return value.test(inputValue);
  }

  static validDecodeHtml(inputValue) {
    let val = /&[^\s]*;/gi;
    return val.test(inputValue);
  }

  static minLength(text, len) {
    return text.length >= len;
  }

  static maxLength(text, len) {
    return text.length <= len;
  }

  static validName(name) {
    // let reg = /^[A-Za-z-'\u007D-\u00FF\s]{1,28}$/;
    let reg = /^[A-Za-z]{1,28}$/;
    return reg.test(name);
  }

  static mobileNumber(value) {
    // let reg = /^[A-Za-z-'\u007D-\u00FF\s]{1,28}$/;
    let reg = /^[0-9]{5}$/;
    return reg.test(value);
  }

  static validNameWithNumber(name) {
    // let reg = /^[A-Za-z-'\u007D-\u00FF\s]{1,28}$/;
    let reg = /^[A-Za-z0-9\d,\s,\.\,/'/"]+$/;
    return reg.test(name);
  }

  static validPhone(number) {
    let reg = /^(|\(|\s|){0,}\d{3}(\-|\)|\s|\.|){1,}\d{3}(\-|\s|\.|){1,}\d{4}$/;
    return reg.test(number);
  }

  static validCreditCardNo(number) {
    let reg = /^[345\s][0-9]{12,15}$/;
    return reg.test(number);
  }

  static validCardHolderName(name) {
    let reg = /^[A-Za-z\s?-]{2,}$/;
    return reg.test(name);
  }

  static validCvv(number) {
    let reg = /^[0-9]{3,4}$/;
    return reg.test(number);
  }

  static validBillingAddress(address) {
    let reg = /^[A-Za-z0-9\u007D-\u00FF\u0022',-/.:;#_()\s]+$/;
    return reg.test(address);
  }

  static validCity(city) {
    let reg = /^[0-9A-Za-z\s?]{3,}$/;
    return reg.test(city);
  }

  static validPaymentPostalCode(code) {
    let reg =
      /^[A-Za-z][0-9][A-Za-z]\s?[0-9][A-Za-z][0-9]|(\d{5}([\-]\d{4})?)$/;
    return reg.test(code);
  }

  static validUrl(code) {
    let reg =
      /^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+$/;
    return reg.test(code);
  }

  static camelize(str) {
    return str.replace(/(?:^\w|[A-Z]|\b\w|\s+)/g, function (match, index) {
      if (+match === 0) return ' '; // or if (/\s+/.test(match)) for white spaces
      return index == 0 ? match.toLowerCase() : match.toUpperCase();
    });
  }
}
