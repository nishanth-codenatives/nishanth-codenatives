// 4XX status code related to client side error
// 5XX status code related to server side error

const getErrorStatus = require('../constant/ErrorData');

function findErrorMessage(status, err) {
	return getErrorStatus.ERROR_STATUS_ARRAY.find(v => v.status == status) || { error: err.message };
}

/**
		* Success Reposnse.
		* @param {number} status - Success response status
		* @param {string} succMessage - Success response message
		* @param {any} data - Success response custom data
	*/
let sucessResponse = (status, succMessage, data) => {
	return {
		status,
		message: succMessage,
		data
	}
}

/**
		* Error Reposnse.
		* @param {Response} res - Send error response
		* @param {number} statusCode - Error Status Code
	*/
let errorResponse = (statusCode, error) => {
	return findErrorMessage(statusCode, error);
}


module.exports = {
	errorResponse,
	sucessResponse,
};