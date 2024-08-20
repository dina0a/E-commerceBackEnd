
export const generateMessage = (entity) => ({
    alreadyExist: `${entity} already exist`,
    notFound: `${entity} not found`,
    failToCreate: `fail to create ${entity}`,
    failToUpdate: `fail to update ${entity}`,
    createdSuccessfully: `${entity} created successfully`,
    updatedSuccessfully: `${entity} updated successfully`,
    deletedSuccessfully: `${entity} deleted successfully`,
    notAllowed: `${entity} not authorized to access this api`,
})

export const messages = {
    category: generateMessage("category"),
    subCategory: generateMessage("subCategory"),
    brand: generateMessage("brand"),
    product: generateMessage("product"),
    user: { ...generateMessage("user"), verifyAccount: "account verifyed successfully" },
    file: { required: "file is required" },
    password: { invalidCredentials: "invalidCredentials" },
    wishlist: { ...generateMessage('wishlist'), addedSuccessfully: "added successfully" },
    review: generateMessage("review"),
    coupon: generateMessage("coupon"),
    order: generateMessage("order")
}
