PRE-REQUISITES:
UPDATE SESSIONCONTEXT to adapt fields in user.entity. remove unecessary hooks on that file

Now, update the frontend to connect to backend endpoint.

1. (auth)/login
-with the returned data, (create code in useLogin) save user field on SessionContext, and the accessToken and refreshToken to asyncstorage (temporary only for web testing, but in the future, ill use securestore)
-if success, redirect to /home

2. (protected)/(tabs)/account
-when user clicks logout, useMutation to access useLogout hook
-create code for useLogout hook to clear session, tokens, and clear tanstack
-note that this hook does not access backend, only locally

Note:
A. frontend flow must be following this:
ui (apps) > hooks (useLogin) > service (auth.service) > client (shared/api/client)
B. Use Tanstack
C. UI must only useMutation to hook, validations will be handled there
D. Hook must handle validation. in the case of errors/message, it must not return to ui, rather display it using showError/showInfo from toast.service
E. update the frontend only (apps/mobile), not the backend
D. client must also send the language code 
D. I've given enough information, but incase youre still lacking more information, check backend/src/modules/auth/auth.controller (for backend response) or any backend file you need more info on. Please do not check if what I have given you is enough.