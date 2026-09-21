class ApiError(Exception):
    def __init__(self, status_code, error, message):
        super().__init__(message)
        self.status_code = status_code
        self.error = error
        self.message = message
