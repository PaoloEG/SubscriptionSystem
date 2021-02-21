const Joi = require('joi');

const validate = (schema,input)=>{
    const result = schema.validate(input);
    if(result.error != null){
        throw new Error(result.error);
    } else {
        return input;
    }
}

module.exports.validateSearchSubs = (input) => {
    const schema = Joi.object({
        email: Joi.string().email(),    
        newsletter_id: Joi.string(),
        subscription_id: Joi.string()
    }).unknown(false);
    return validate(schema,input);
};

module.exports.validateSearchSubsQuery = (input) => {
    const schema = Joi.object({
        next: Joi.string(),    
        limit: Joi.string()
    }).unknown(false);
    return validate(schema,input);
};

module.exports.validateSubsDetails = (input) => {
    const schema = Joi.object({
        subscription_id: Joi.string().required()
    }).unknown(false);
    return validate(schema,input);
};