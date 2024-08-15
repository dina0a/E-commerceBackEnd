
export const generateMessage = (entity) => ({
    alreadyExist: `${entity} already exist`,
    notFound: `${entity} not found`,
    failToCreate: `fail to create ${entity}`,
    failToUpdate: `fail to update ${entity}`,
    createdSuccessfully: `${entity} created successfully`,
    updatedSuccessfully: `${entity} updated successfully`,
    deletedSuccessfully: `${entity} deleted successfully`,
})

export const messages = {
    category: generateMessage("category"),
    subCategory: generateMessage("subCategory"),
    brand: generateMessage("brand"),
    product: generateMessage("product"),
    user: { ...generateMessage("user"), verifyAccount: "account verifyed successfully" },
    file: { required: "file is required" }
}