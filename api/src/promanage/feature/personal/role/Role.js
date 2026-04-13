class Role {
    constructor(id, name) {
        this.id = id;
        this.name = name;
    }
}

class RoleRequest {
    constructor(data) {
        this.name = data.name ? data.name.toString().trim() : null;
    }
    
    isValid() {
        return this.name !== null && this.name.length >= 3;
    }
}

module.exports = { Role, RoleRequest };