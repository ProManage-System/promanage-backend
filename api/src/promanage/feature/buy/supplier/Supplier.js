class Supplier {
    constructor(id, name) {
        this.id = id;
        this.name = name;
    }
}

class SupplierRequest {
    constructor(data) {
        this.name = data.name?.toString().trim() || null;
    }

    validate() {
        const errors = {};

        if (!this.name || this.name.length < 3) {
            errors.name = "El nombre del proveedor debe tener al menos 3 caracteres.";
        }

        return {
            isValid: Object.keys(errors).length === 0,
            errors: errors
        };
    }
}

module.exports = { Supplier, SupplierRequest };