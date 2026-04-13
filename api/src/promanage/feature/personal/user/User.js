class User {
    constructor(id, name, email, phone, password, role) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.phone = phone;
        this.password = password;
        this.role = role;
    }
}

class UserRequest {
    constructor(data) {
        this.name = data.name?.toString().trim() || null;
        this.email = data.email?.toString().trim() || null;
        this.phone = data.phone?.toString().trim() || null;
        this.password = data.password?.toString().trim() || null;
        this.role_id = data.role_id ? parseInt(data.role_id) : null;
    }

    validate() {
        const errors = {};

        if (!this.name || this.name.length < 3) {
            errors.name = "El nombre debe tener al menos 3 caracteres.";
        }

        if (!this.email || !this.email.includes('@') || this.email.length < 5) {
            errors.email = "El correo electrónico no es válido.";
        }

        if (!this.phone || this.phone.length < 10) {
            errors.phone = "El teléfono debe tener al menos 10 dígitos.";
        }

        if (!this.password || this.password.length < 6) {
            errors.password = "La contraseña debe tener al menos 6 caracteres.";
        }

        if (this.role_id === null || isNaN(this.role_id)) {
            errors.role_id = "El rol seleccionado no es válido.";
        }

        return {
            isValid: Object.keys(errors).length === 0,
            errors: errors
        };
    }
}

module.exports = { User, UserRequest };