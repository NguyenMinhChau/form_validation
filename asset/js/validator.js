function Validator(options) {
    var selectRules = {};
    function getParentElement(element,selector) {
        if(element.matches(selector)) {
            return element;
        }
        return getParentElement(element.parentElement,selector);
    }
    function validate(inputElement,rule){
        var errorElement = getParentElement(inputElement,options.formGroup).querySelector(options.formMessage);
        var rules = selectRules[rule.selector];
        for (var i = 0; i < rules.length; i++) {
            var errorMessage;
            switch(inputElement.type){
                case 'checkbox':
                case 'radio':
                    errorMessage = rules[i](
                        formElement.querySelector(rule.selector + ':checked')
                    );
                    break;
                default:
                    errorMessage = rules[i](inputElement.value);
            }
            if(errorMessage){
                errorElement.innerHTML = errorMessage;
                getParentElement(inputElement,options.formGroup).classList.add('invalid');
                break; //Có lỗi thì dừng ngay lặp tức
            }
            else{
                errorElement.innerHTML = '';
                getParentElement(inputElement,options.formGroup).classList.remove('invalid')
            }
            return !errorMessage;
        }
    }
    var formElement = document.querySelector(options.form);
    if(formElement){
        options.rules.forEach(rule => {
            //Lưu từng rule vào selectRules
            if(selectRules[rule.selector]){
                selectRules[rule.selector].push(rule.test);
            }
            else{
                selectRules[rule.selector] = [rule.test];
            }

            //Lấy từng input vào formElement: có radio + check box nên dùng querySelectorAll
            //vì có nhiều selector giống nhau
            var inputElements = formElement.querySelectorAll(rule.selector);
            Array.from(inputElements).forEach(inputElement => {
                if(inputElement){
                    inputElement.onblur = () => {
                        validate(inputElement,rule)
                    }
                    inputElement.oninput = () => {
                        var errorElement = getParentElement(inputElement,options.formGroup).querySelector(options.formMessage);
                        errorElement.innerHTML = '';
                        getParentElement(inputElement,options.formGroup).classList.remove('invalid')
                    }
                }
            })
        })

        formElement.onsubmit = (event) => {
            event.preventDefault();
            var isValid = true;
            //Lặp qua từng rules để check lỗi
            options.rules.forEach(rule => {
                var inputElement = formElement.querySelector(rule.selector);
                if(inputElement){
                    isValid = validate(inputElement,rule) && isValid;
                }
            })
            if(isValid){
                var enableInputs = formElement.querySelectorAll('[name]:not([disabled])');
                var data = Array.from(enableInputs).reduce((data,input) => {
                    switch(input.type){
                        //get value checkbox from form element
                        case 'checkbox':
                            const checkboxs = formElement.querySelectorAll(`[name="${input.name}"]:checked`);
                            var dataList = Array.from(checkboxs).reduce((dataItem,checkbox) => {
                                dataItem.push(checkbox.value);
                                return dataItem;
                            },[]);
                            data[input.name] = dataList;
                            break;
                        case 'radio':
                            if(input.checked){
                                data[input.name] = input.value;
                            }
                            break;
                        case 'file':
                            data[input.name] = input.files;
                            break;
                        default:
                            data[input.name] = input.value;
                    }
                    return data;
                },{})
                options.onSubmit(data);
            }
            else{
                console.log('Có lỗi');
            }
        }
    }
}  
Validator.isRequired = (selector,message) => {
    return {
        selector,
        test(value){
            return value ? undefined : message || 'Vui lòng nhập trường này';
        }
    }
}
Validator.isEmail = (selector,message) => {
    return {
        selector,
        test(value){
            var rex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            return rex.test(value) ? undefined : message || 'Vui lòng nhập đúng định dạng email';
        }
    }
}
Validator.minLength = (selector,minLength,message) => {
    return {
        selector,
        test(value){
            return value.length >= minLength ? undefined : message || `Vui lòng nhập ít nhất ${minLength} ký tự`;
        }
    }
}
Validator.ConfirmPassword = (selector,message) => {
    return {
        selector,
        test(value){
            var password = document.querySelector('#form-1 #password').value;
            return password == value ? undefined : message || 'Mật khẩu không khớp';
        }
    }
}
function showPassword(){
    var password = document.querySelector('#password');
    var showPassword = document.querySelector('#checkbox');
    var eyeBlocked = document.querySelector('.content-form-control-icon-eye-block');
    var eyeNone = document.querySelector('.content-form-control-icon-eye-none');
    if(showPassword.checked){
        password.setAttribute('type','text');
        eyeBlocked.style.display = 'none';
        eyeNone.style.display = 'block';
    }
    else{
        password.setAttribute('type','password');
        eyeBlocked.style.display = 'block';
        eyeNone.style.display = 'none';
    }
}