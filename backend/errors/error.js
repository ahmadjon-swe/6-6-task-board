class ErrorHandler extends Error {
  constructor(status, message, errors){
    super(message)
    this.status = status
    this.errors = errors
  }

  static BadRequest(message, errors=[]){
    return new ErrorHandler(400, message, errors)
  }

  static UnAuthorized(message, errors=[]){
    return new ErrorHandler(401, message, errors)
  }

  static NotFound(message, errors=[]){
    return new ErrorHandler(404, message, errors)
  }

  static Forbidden(message, errors=[]){
    return new ErrorHandler(403, message, errors)
  }

  static NoContent(message, errors=[]){
    return new ErrorHandler(204, message, errors)
  }

  static InternalServerError(message, errors=[]){
    return new ErrorHandler(500, message, errors)
  }
}

module.exports = ErrorHandler