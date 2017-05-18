/* SubmitController
*  requires Validation object with initValidation and validate methods
*
*  controller is wraped in javascript module
*  http://www.adequatelygood.com/JavaScript-Module-Pattern-In-Depth.html
*
*  Inheritence using OLOO style https://github.com/getify/You-Dont-Know-JS/blob/
*                                master/this%20%26%20object%20prototypes/ch6.md
*
*  var submitControl = Object.create(SubmitController)
*  submitControl.setup(document.getElementById('form'), formSchema);
*/
var SubmitController = (function(Validation) {

    /**************************************************************
    *   copyObjectProps: copy source object properties onto dest object
    *   args:-
    *       destObj: destination object for copied properties
    *       sourceObj: source object for copied properties
    */
    function copyObjectProps(destObj, sourceObj) {
        if (!destObj || !sourceObj) {
            return;
        }
        for (var prop in sourceObj) {
            //Only copy source objects own, and not inherited properties.
            if (sourceObj.hasOwnProperty(prop)) {
                destObj[prop] = sourceObj[prop];
            }
        }
    }
    
    //Create SubmitController object from Validation object
    var SubmitController = Object.create(Validation),
        submitControllerProps = {
        /**************************************************************
        *   setup adds form submit controller to form submit
        *   args:-
        *       formEl: dom form element to validate
        *       schema: form schema used to enable vaidation rules
        */
        setup: function(formEl, schema) {
            //Init form validation
            this.initValidation(formEl, schema);
            
            //Bind submit handler here to allow removal at destroy
            this.handleSubmit = this._handleSubmit.bind(this);
            
            var submitButton = this.getSubmitButton();
            if (submitButton.addEventListener) {
                //add event handler
                submitButton.addEventListener('click', this.handleSubmit, false);
            } else {
                console.warn('legacy browser not suported');
            }
            
            //return this to allow chaining
            return this;
        },
        
        /**************************************************************
        *   setDefaults sets defult values from schema on submit if value is
        *   not defined
        */
        setDefaults: function() {
            if(!this.formEl){
                return;
            }
            var formElements = this.formEl.getElementsByTagName('input');
            
            for (var i = 0; i < formElements.length; i++) {
                var input = formElements[i],
                    inputSchema = this.formSchema[input.name];
                
                if (!inputSchema || (inputSchema && !inputSchema.defaultValue)) {
                    //No rules found for this input name, skip.
                    continue;
                }

                if (!input.value) {
                    input.value = inputSchema.defaultValue;
                }
            }
        },
        
        /**************************************************************
        *   getSubmitButton returns the submit button element from the form
        */
        getSubmitButton: function() {
            if(!this.formEl){
                return;
            }
            var inputs = this.formEl.getElementsByTagName('input'),
                submitButton = null;
              
            for (var i = 0; i < inputs.length; i++) {
                if (inputs[i].type == 'submit') {
                    //find form submit button
                    submitButton = inputs[i];
                }
            }
            return submitButton;
        },
        
        /**************************************************************
        *   _handleSubmit internal method for handling submit event
        */
        _handleSubmit: function(e) {
            e.preventDefault();
            var formIsValid = this.validate();
            if (!formIsValid) {
                return;
            }
            this.setDefaults();
            this.formEl.submit();
        },

        /**************************************************************
        *   destroy removes event handlers
        */
        destroy: function(e) {
            var submitButton = this.getSubmitButton();
            if(submitButton){
                submitButton.removeEventListener('click', this.handleSubmit, false);
            }

        }
    };
    
    copyObjectProps(SubmitController, submitControllerProps);
    return SubmitController;
    
})(Validation);
