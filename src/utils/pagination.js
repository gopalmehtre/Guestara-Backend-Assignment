const { success } = require("zod");

const getPaginationParams = (query) => {
    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 10;
    const skip = (page - 1) * limit;

    return {page, limit, skip};
};

const getSortParams = (query) => {
    const sortBy = query.sortBy || 'createdAt';
    const sortOrder = query.sortOrder === 'asc' ? 1 : -1;

    return{[sortBy]: sortOrder};
};

const getPaginatedResponse = (data, total, page, limit) => {
    return{
        success: true,
        data,
        pagination : {
            total,
            page,
            limit,
            totalPages: Math.ceil(total/limit),
            hasNext: page * limit < total,
            hasPrev: page > 1,

        },
    };
};

module.exports = {getPaginationParams, getSortParams, getPaginatedResponse};