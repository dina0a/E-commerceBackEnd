export const roles = {
    CUSTOMER: "customer",
    ADMIN: "admin",
    SELLER: "seller",
    SUPER_ADMIN:"superAdmin"
}
Object.freeze(roles)

export const status = {
    PENDING: "pending",
    VERIFIED: "verified",
    BLOCKED: "blocked",
    DELETED: "deleted"
}
Object.freeze(status)

export const couponTypes = {
    FIXED_AMOUNT: "fixedAmount",
    PERCENTAGE: "percentage"
}
Object.freeze(couponTypes)

export const orderStatus = {
    PLACED: "placed",
    SHIPPING: "shipping",
    DELIVERED: "delivered",
    CANCELED: "canceled",
    REFUNDED: "refunded"
}
Object.freeze(orderStatus)