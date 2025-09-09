# lambda_function.py
import os, json, base64, uuid
from datetime import datetime, timezone
import boto3
from botocore.exceptions import ClientError
from boto3.dynamodb.conditions import Key, Attr

TABLE_NAME  = os.environ.get("TABLE_NAME")
CORS_ORIGIN = os.environ.get("CORS_ORIGIN", "*")
INDEX_NAME  = os.environ.get("INDEX_NAME", "GSI1CreatedBy")  # set in env or keep default

dynamodb = boto3.resource("dynamodb")
table = dynamodb.Table(TABLE_NAME) if TABLE_NAME else None

def _response(status, body=None, headers=None):
    base = {
        "statusCode": status,
        "headers": {
            "Access-Control-Allow-Origin": CORS_ORIGIN,
            "Access-Control-Allow-Headers": "Content-Type,Authorization",
            "Access-Control-Allow-Methods": "OPTIONS,POST,GET",
            "Content-Type": "application/json",
        },
        "body": json.dumps(body or {}),
    }
    if headers: base["headers"].update(headers)
    return base

def _parse_body(event):
    raw = event.get("body")
    if raw is None: return {}
    if event.get("isBase64Encoded"): raw = base64.b64decode(raw).decode("utf-8")
    try: return json.loads(raw) if raw else {}
    except json.JSONDecodeError: return {}

def _list_child_apps(user_sub: str):
    # Try fast path: Query the GSI
    try:
        resp = table.query(
            IndexName=INDEX_NAME,
            KeyConditionExpression=Key("createdBy").eq(user_sub),
            ScanIndexForward=False,  # newest first (by createdAt)
            Limit=200,
        )
        return resp.get("Items", [])
    except ClientError as e:
        code = e.response.get("Error", {}).get("Code", "")
        # If index isn't there or not active or we lack Query on it → try Scan
        if code in ("ValidationException", "ResourceNotFoundException", "AccessDeniedException"):
            scan = table.scan(
                FilterExpression=Attr("createdBy").eq(user_sub),
                Limit=200,
            )
            return scan.get("Items", [])
        # Any other AWS error → bubble up so caller returns 500 with details
        raise

def lambda_handler(event, context):
    method = (event.get("requestContext", {}).get("http", {}).get("method") or "").upper()
    if method == "OPTIONS":
        return _response(204, {})

    if not table:
        return _response(500, {"message": "Server misconfigured: TABLE_NAME env var not set"})

    claims = (event.get("requestContext", {}).get("authorizer", {}).get("jwt", {}).get("claims", {}))
    user_sub = claims.get("sub", "unknown")

    if method == "GET":
        try:
            items = _list_child_apps(user_sub)
            # Return the shape your dashboard expects
            return _response(200, {"items": items})
        except ClientError as e:
            err = e.response.get("Error", {})
            print("LIST ERROR:", err)
            return _response(500, {"message": "Failed to list apps", "code": err.get("Code")})

    if method == "POST":
        body = _parse_body(event)
        required = ["appname", "subdomain", "createdate", "manager"]
        missing = [k for k in required if not body.get(k)]
        if missing:
            return _response(400, {"message": f"Missing required fields: {', '.join(missing)}"})

        appname   = body["appname"]
        subdomain = body["subdomain"]
        createdate= body["createdate"]
        manager   = body["manager"]
        now = datetime.now(timezone.utc).isoformat()

        app_item = {
            "id": str(uuid.uuid4()),
            "type": "ChildApp",
            "appname": appname,
            "subdomain": subdomain,
            "createdate": createdate,
            "manager": manager,
            "createdBy": user_sub,
            "createdAt": now,
            "status": "REQUESTED",
            "url": None,
        }

        try:
            table.put_item(
                Item={"id": f"SUBDOMAIN#{subdomain}", "type": "UniqueReservation", "createdAt": now},
                ConditionExpression="attribute_not_exists(id)",
            )
            table.put_item(Item=app_item)
            return _response(201, {"message": "created", "item": app_item})
        except ClientError as e:
            code = e.response.get("Error", {}).get("Code", "")
            if code == "ConditionalCheckFailedException":
                return _response(409, {"message": "Child app already exists for this subdomain"})
            print("CREATE ERROR:", e)
            return _response(500, {"message": "Internal Server Error"})

    return _response(405, {"message": "Method Not Allowed"})
