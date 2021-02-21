const Joi = require('joi');

const validate = (schema, input) => {
    const result = schema.validate(input);
    if (result.error != null) {
        throw new Error(result.error);
    } else {
        return input;
    }
}

module.exports.validateLogin = (input) => {
    const schema = Joi.object({
        username: Joi.string().required(),
        password: Joi.string().required()
    }).unknown(false);
    return validate(schema, input);
};
