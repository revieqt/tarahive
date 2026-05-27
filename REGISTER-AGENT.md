Connect these Registration related endpoints from my backend to the frontend:

1. (auth)/register
a. frontend passes these data to /v1/auth/register: (example)
{
  "fname": "John",
  "lname": "Doe",
  "email": "fakejdmesina@gmail.com",
  "password": "Ohahahahaha214123#",
  "bdate": "2000-01-15",
  "gender": "male",
  "device": {
    "deviceId": "device-123",
    "brand": "Apple",
    "model": "iPhone 14",
    "os": "iOS",
    "type": "mobile",
    "appVersion": "1.0.0"
  }
}
b. if success, backend returns
{
    "success": true,
    "message": ,
    "email": "fakejdmesina@gmail.com",
    "nextStep": "verify"
}
-send user to '/verify' using router.push with email as its parameters
c. if success=false, backend returns
{
    "success": false,
    "message": ,
}
-display message using showError from toast.service

2. (auth)/verify
-display email
A. Resend Verification
-only used to resend verification as register endpoint handles first verification email sent
-after being redirected to this page, it must start cooldown for 3 mins, and every resend request must trigger another cooldown
a. frontend passes these data to /v1/auth/send-verification: (example)
{
  "email": "opsima.josh@gmail.com",
  "device": {
    "deviceId": "device-123",
    "brand": "Samsung",
    "model": "Galaxy S23",
    "os": "Android",
    "type": "mobile",
    "appVersion": "1.0.0"
  }
}
b. if success, backend returns
{
    "success": true,
    "message": "Verification code sent to your email",
    "email": "opsima.josh@gmail.com"
}
c. if success=false, backend returns
{
    "success": false,
    "message": ,
}
-display message using showError from toast.service

B. Verify Email
a. frontend passes these data to /v1/auth/verify (example)
{
  "email": "revenantjd@gmail.com",
  "code": "159100",
  "device": {
    "deviceId": "550e8400-e29b-41d4-a716-446655440000",
    "brand": "Chrome 142",
    "model": "",
    "os": "Windows NT 10.0",
    "type": "desktop",
    "appVersion": "1.0.0"
  }
}
b. if success, redirect to /login
c. if failed, showError using toast.service

Note:
A. frontend flow must be following this:
ui (apps) > hooks (features/auth/hooks/useRegister) > service (features/auth/services/register.service) > client (shared/api/client)
B. Use Tanstack
C. UI must only useMutation to hook, validations will be handled there
D. Hook must handle validation. in the case of errors/message, it must not return to ui, rather display it using showError/showInfo from toast.service
E. update the frontend only (apps/mobile), not the backend
D. client must also send the language code 
D. I've given enough information, but incase youre still lacking more information, check backend/src/modules/auth/auth.controller (for backend response) or any backend file you need more info on. Please do not check if what I have given you is enough.