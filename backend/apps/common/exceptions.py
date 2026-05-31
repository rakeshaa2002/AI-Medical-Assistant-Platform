from rest_framework.views import exception_handler


def custom_exception_handler(exc, context):
    """Wrap DRF errors in a consistent envelope: {success, message, errors}."""
    response = exception_handler(exc, context)
    if response is None:
        return response

    detail = response.data
    message = "Request failed."
    errors = detail

    if isinstance(detail, dict):
        if "detail" in detail:
            message = str(detail["detail"])
            errors = None
        else:
            # Use the first field error as the human-readable message.
            first_key = next(iter(detail))
            first_val = detail[first_key]
            if isinstance(first_val, (list, tuple)) and first_val:
                message = f"{first_key}: {first_val[0]}"
            else:
                message = f"{first_key}: {first_val}"
    elif isinstance(detail, list) and detail:
        message = str(detail[0])

    response.data = {"success": False, "message": message, "errors": errors}
    return response
