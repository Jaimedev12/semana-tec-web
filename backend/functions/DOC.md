# Funciones actuales

## addAccount
Agrega una cuenta a la colección de "accounts".

### Inputs:

    (
        data: {
            username: string
            password: string
        },
        context: ContextObject
    )

## editAccount
Cambia los datos en la base de datos dada un id de una account

### Inputs:

    (
        data: {
            id: string
            username (optional): string
            password (optional): string
        },
        context: ContextObject
    )

## getAllAccountsFromUser
Regresa todas las cuentas que tiene guardadas el usuario que se encuentra en la autenticación.

### Inputs:

    (
        data: {},
        context: ContextObject
    )