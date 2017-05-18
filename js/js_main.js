/* Form specific validation rules */
var formSchema = {
    "user_id":{
        rules: ['required', 'number'],
        max: 9999,
        min: 1
    },
    "event_id": {
        rules: ['required', 'number'],
        max: 9999,
        min: 1
    },
    "date": {
        rules: ['required', 'date']
    },
    "start_time": {
        rules: ['required', 'time']
    },
    "category_id": {
        rules: ['number'],
        max: 100,
        min: 1,
        defaultValue: -1
    },
    "chance": {
        rules: ['float'],
        dp: 2,
        max:100,
        min:0,
        defaultValue: -1
    },
    "finalized": {
        rules: ['number'],
        max:1,
        min:0,
        defaultValue: -1
    }
};
/* subitControl used to attach validation and submit to page form */
var submitControl = Object.create(SubmitController)
    .setup(document.getElementById('form'), formSchema);
