class AppError extends Error {
    constructor(message, statusCode){
        super(message);

        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';

        //with isOperational we can test to only send error messages back to the client 
        //for these operational errors that we created using this class
        this.isOperational = true;

        Error.captureStackTrace(this, this.constructor);
    }
}

module.exports = AppError;