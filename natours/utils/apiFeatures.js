class APIFeatures {
    constructor(query, queryString){
        this.query = query;
        this.queryString = queryString;
    }

    filter() {
        //1A-Filtering
        const queryObj = {...this.queryString};
        const excludeFields = ['page', 'sort', 'limit', 'fields'];
        excludeFields.forEach(el => delete queryObj[el]);
        // console.log(queryObj);

        //1B-Advances filtering
        let queryStr = JSON.stringify(queryObj);
        queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);   // to convert { gte : '5' } to { $gte : '5 }
        // console.log(JSON.parse(queryStr));

        this.query =this.query.find(JSON.parse(queryStr));;
        
        return this;
    };

    sort() {
        if (this.queryString.sort) {
            const sortBy = this.queryString.sort.split(',').join(' ');  //in case we have more then one field to sort by
            this.query = this.query.sort(sortBy);
        } else {
            this.query = this.query.sort('-createAt');  //the - is for descending order
        };

        return this;
    };

    limitFields() {
        if (this.queryString.fields) {
            const fields = this.queryString.fields.split(',').join(' ');
            this.query = this.query.select(fields);
        } else {
            this.query = this.query.select('-__v');    // the - here is for excluding
        };

        return this;
    };
    paginate() {
        const page = this.queryString.page*1 || 1;
        const limit = this.queryString.limit*1 || 100;
        const skip = (page - 1) * limit;

        this.query = this.query.skip(skip).limit(limit);

        return this;
    };
};

module.exports = APIFeatures;