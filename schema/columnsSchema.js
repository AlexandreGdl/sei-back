import mongoose, { Schema } from 'mongoose'

const ColumnSchema = new Schema(
    {
        colType: {type: String},
        colName: {type: String},
        table_id: {type: String}
    },{
        collection: 'columns'
    }
)

export default mongoose.model('ColumnSchema', ColumnSchema)