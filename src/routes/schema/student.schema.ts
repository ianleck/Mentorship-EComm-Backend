import joi from 'joi';

export default {
    updateStudent: joi.object({
        student: joi.object({
            accountId: joi.string().required(),
            firstName: joi.string(),
            lastName: joi.string(),
            contactNumber: joi.number(),
        })
    }),
};
