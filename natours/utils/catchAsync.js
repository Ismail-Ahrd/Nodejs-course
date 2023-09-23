//For handling the try catch errors
module.exports = fun => {
    return (req, res, next) => {
        fun(req, res, next).catch(next);
    };
};