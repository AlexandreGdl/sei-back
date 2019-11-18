import mongoose, { Schema } from 'mongoose'

const TableSchema = new Schema(
    {
        name: {type: String},
        description: {type: String},
        column_groupe_by: {type: String}
    },{
        collection: 'tables'
    }
)

export default mongoose.model('TableSchema', TableSchema)