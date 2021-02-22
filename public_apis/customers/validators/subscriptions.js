const Joi = require('joi');
// const crypto = require('crypto');

const validate = (schema,input)=>{
    const result = schema.validate(input);
    if(result.error != null){
        throw new Error(result.error.message);
    } else {
        return input;
    }
}

module.exports.validateSubscription = (input) => {
    const schema = Joi.object({
        email: Joi.string().email().required(),    
        newsletter_id: Joi.string().required(),
        first_name: Joi.string(),
        gender: Joi.string().valid('male','female'),
        birthdate: Joi.date().iso().required(),
        privacy_acceptance: Joi.boolean().valid(true).required()
    }).unknown(false);
    const result = validate(schema,input);
    // const hash = crypto.createHash('sha256');
    // hash.update(result.email+result.newsletter_id);
    // return Object.assign(result,{subscription_id: hash.digest('hex').slice(0,15)});
    return Object.assign(result,{subscription_id: Buffer.from(result.email.slice(4,14)+result.newsletter_id.slice(0,10)).toString('hex')});
};

module.exports.validateDeletion = (input) => {
    const schema = Joi.object({
        subscription_id: Joi.string().required()
    }).unknown(false);
    return validate(schema,input);
};