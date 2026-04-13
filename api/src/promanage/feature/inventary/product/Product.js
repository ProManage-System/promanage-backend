class Product {
    constructor(id, name, price_sell, category_id, min_stock, quantity, status_id, barcode) {
        this.id = id;
        this.name = name;
        this.price_sell = price_sell;
        this.category_id = category_id;
        this.min_stock = min_stock;
        this.quantity = quantity;
        this.status_id = status_id;
        this.barcode = barcode;
    }
}

class ProductRequest {
    constructor(data) {
        this.name = data.name ? data.name.toString().trim() : null;
        this.price_sell = data.price_sell ? parseFloat(data.price_sell) : null;
        this.category_id = data.category_id ? parseInt(data.category_id) : null;
        this.min_stock = data.min_stock ? parseInt(data.min_stock) : 0;
        this.quantity = data.quantity ? parseInt(data.quantity) : 0;
        this.status_id = data.status_id ? parseInt(data.status_id) : null;
        this.barcode = data.barcode ? data.barcode.toString().trim() : null;
    }

    validate() {
        const errors = {};

        if (!this.name || this.name.length < 3) {
            errors.name = "El nombre debe tener al menos 3 caracteres.";
        }
        if (this.price_sell === null || isNaN(this.price_sell) || this.price_sell <= 0) {
            errors.price_sell = "El precio de venta debe ser mayor a 0.";
        }
        if (!this.category_id || isNaN(this.category_id)) {
            errors.category_id = "Debe seleccionar una categoría válida.";
        }
        if (this.quantity < 0) {
            errors.quantity = "La cantidad no puede ser negativa.";
        }

        return {
            isValid: Object.keys(errors).length === 0,
            errors: errors
        };
    }
}

module.exports = { Product, ProductRequest };