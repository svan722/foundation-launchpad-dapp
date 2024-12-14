export const validate = async (obj, objSchema) => {
    try {
      await objSchema.validate(obj, { abortEarly: false });
      return null;
    } catch (validationError) {
      const errors = {};
      validationError.inner.forEach((error) => {
        errors[error.path] = error.message;
      });
      return errors;
    }
};

export const validateProperty = async (inputField, objSchema) => {
    try {
      const fieldObj = { [inputField.name]: inputField.value };
      await objSchema.validateAt(inputField.name, fieldObj);
      return null;
    } catch (validationError) {
      return validationError.message;
    }
};