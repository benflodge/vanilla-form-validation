/* Validation form validator
*  To start use Validation.initValidation(formEl, schema);
*
*  Schema must follow this format object keys are form input names
*    var schema = {
*        "input1":{
*            rules: ['required', 'number'],
*            max: 9999,
*            min: 1
*        },
*        "input2": {
*            rules: ['required', 'time']
*        }
*    }
*
*  To add new validation methods, add new functions to the Validation Object e.g.
*  Validation.emailRule = function(){}; return null if valid else error message
*  then to use 'email-input': { rules: ['email']}
*
*  Validation is wraped in javascript module
*  http://www.adequatelygood.com/JavaScript-Module-Pattern-In-Depth.html
*
*  Inheritence using OLOO style https://github.com/getify/You-Dont-Know-JS/blob/
*                                master/this%20%26%20object%20prototypes/ch6.md
*/
var Validation = (function() {
    
    /**************************************************************
    *   setClass: set class on element
    *   args:-
    *       element: dom element to change class on
    *       className: class name to add/remove to/from element
    *       addClass: add class if true, remove if false
    */
    function setClass(element, className, addClass) {
        if (!element || !className) {
            return;
        }
        element.classList.toggle(className, addClass || false);
    }

    return {
        /**************************************************************
        *   initValidation
        *   args:-
        *       formEl: dom form element to validate
        *       schema: form schema used to enable vaidation rules on inputs
        */
        initValidation: function(formEl, schema) {
            this.formEl = formEl;
            this.formSchema = schema;
            
            //return this to allow chaining
            return this;
        },
        
        /**************************************************************
        *   requiredRule: return null if value is defined else return error
        *   args:-
        *       element: dom input element to validate
        *   return: null if valid or string - error message
        */
        requiredRule: function(element) {
            var isValid = element.value && element.value !== '';
            
            return isValid ? null : 'Required field';
        },
        
        /**************************************************************
        *   numberRule: return null if value is valid else return error
        *   args:-
        *       formEl: dom form element to validate
        *       schema:-
        *           max: maximum value for input
        *           min: minimum value for input
        *   return: null if valid or string - error message
        */
        numberRule: function(element, schema) {
            if (element.value === '') {
                return null;
            }
            var value = element.value * 1,
                errorString = !isNaN(value) ? null : 'Value must be number';
            
            if (!errorString && schema && schema.max) {
                errorString = (value <= schema.max) ? null :
                    'This number cannot be greater than  ' + schema.max;
            }
            
            if (!errorString && schema && schema.min) {
                errorString = (value >= schema.min) ? null :
                    'This number cannot be less than ' + schema.min;
            }

            return errorString;
        },
        
        /**************************************************************
        *   floatRule: return null if value is valid else return error
        *   args:-
        *       formEl: dom form element to validate
        *       schema:-
        *           max: maximum value for input
        *           min: minimum value for input
        *           dp:  number of decemal places
        *   return: null if valid or string - error message
        */
        floatRule: function(element, schema) {
            if (element.value === '') {
                return null;
            }
            var error = this.numberRule.apply(this, arguments),
                fractional;
            
            if (!error && schema && schema.dp) {
                fractional = element.value.toString().split('.')[1];
                if(!fractional || (fractional && fractional.length > schema.dp)){
                    return 'Number must have ' + schema.dp + ' dp';
                }
            }
            
            return error;
        },
        
        /**************************************************************
        *   dateRule: null if value is date in the format of YYYY-MM-DD
        *       else return error
        *   args:-
        *       formEl: dom form element to validate
        *   return: null if valid or string - error message
        */
        dateRule: function(element) {
            if (element.value === '') {
                return null;
            }
            var regex = /^[\d]{4}[-][0-1][\d][-]([0-2][\d]|3[01])/,
                isValid = (typeof element.value === 'string' &&
                    element.value.match(regex));
        
            return isValid ? null: 'Date must be in the correct format';
        },
        
        /**************************************************************
        *   timeRule: null if value is time in the format of HH:MM:SS
        *       else return error
        *   args:-
        *       formEl: dom form element to validate
        *   return: null if valid or string - error message
        */
        timeRule: function(element) {
            if (element.value === '') {
                return null;
            }
            var regex = /^[0-2][\d][:][0-5][\d][:][0-5][\d]/,
                isValid = (typeof element.value === 'string' &&
                    element.value.match(regex));
            
            return isValid ? null: 'Time must be in the correct format';
        },
        
        /**************************************************************
        *   showErrorMessages: show error message in dom
        *   args:-
        *       element: dom element for error
        *       errors: array of error messages
        */
        showErrorMessages: function(element, errors) {
            var parent = element.parentNode,
                errorSpan,
                newContent;
            
            if (parent.children.length > 1) {
                //Reuse error message container if availible
                for(var i = 0; i < parent.children.length; i++) {
                    if (parent.children[i].className === 'v-error-text') {
                        errorSpan = parent.children[i];
                        //Clear any old messages
                        errorSpan.innerHTML = '';
                    }
                }
            }

            if (!errorSpan) {
                //If error message container isnt found create it
                errorSpan = document.createElement('span');
                errorSpan.className = 'v-error-text';
                parent.appendChild(errorSpan);
            }
            
            newContent = document.createTextNode(errors.join(' ,'));
            errorSpan.appendChild(newContent);
        },
        
        /**************************************************************
        *   validate: Validate form
        *   return: bool true if form is valid else false
        *   Side effects:
        *       If form field is valid add green border
        *       If form field is invalid add red boarder and show message
        */
        validate: function() {
            if (!this.formEl) {
                console.warn('Validate requires formEl');
                return;
            }
            if (!this.formSchema) {
                console.warn('Validate requires formSchema');
                return;
            }
            
            //all variables are decalerd at start see "javascript hoisting"
            //https://github.com/getify/You-Dont-Know-JS/blob/master/scope%20%26%20closures/ch4.md
            var formIsValid = true,
                formElements = this.formEl.getElementsByTagName('input'),
                validationRule,
                fieldIsValid,
                errors,
                errorMessage,
                input,
                inputSchema,
                inputRules;
            
            // Iterate though all form inputs
            for (var i = 0; i < formElements.length; i++) {
                
                //Clear input errors
                errors = [];
                
                input = formElements[i];
                inputSchema = this.formSchema[input.name];
                
                if (!inputSchema) {
                    //No rules found for this input name, skip.
                    continue;
                }
                
                inputRules = inputSchema.rules;
                //Iterate though this inputs schema rules.
                for (var j = 0; j < inputRules.length; j++) {
                    
                    validationRule = this[inputRules[j] + 'Rule'];
                    errorMessage = null;
                    
                    if (validationRule) {
                        
                        //Run the validation rule function, pass this in as scope
                        errorMessage = validationRule.call(this, input, inputSchema);
                        if(errorMessage){
                            //If form is invalid add error message to list
                            errors.push(errorMessage);
                        }
                    } else {
                        console.warn('Validate cannot find ruleset for: ',
                            inputRules[j]);
                    }
                }
                
                fieldIsValid = (0 === errors.length);
                
                //Add the invalid class to the form if validation failed
                setClass(input, "v-invalid", !fieldIsValid);
                //Add the valid class to the form if validation succeded
                setClass(input, "v-valid", fieldIsValid);
                //Show any error messages
                this.showErrorMessages(input, errors);
                
                //If input failed vaildation set formIsValid to false
                if (fieldIsValid === false) {
                    formIsValid = fieldIsValid;
                }
            }
            
            return formIsValid;
        }
    };
})();
