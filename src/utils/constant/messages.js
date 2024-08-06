
export const generateMessage = (entity) => ({
    alreadyExist: `${entity} already exist`,
    notFound: `${entity} not found`,
    failToCreate: `fail to create ${entity}`,
    failToUpdate: `fail to update ${entity}`,
    createdSuccessfully: `${entity} created successfully`,
    updatedSuccessfully: `${entity} updated successfully`,

})

export const messages = {
    category: generateMessage("category"),
    subCategory: generateMessage("subCategory"),
    file: { required: "file is required" }
}